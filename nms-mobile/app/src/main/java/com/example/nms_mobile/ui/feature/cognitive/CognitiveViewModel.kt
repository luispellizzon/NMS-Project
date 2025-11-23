package com.example.nms_mobile.ui.feature.cognitive

import android.content.ContentValues.TAG
import android.content.Context
import android.graphics.Bitmap
import android.util.Log
import androidx.compose.ui.geometry.Offset
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.*
import com.example.nms_mobile.services.TTSManager
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.UUID

/**
 * UI State for Cognitive Assessment
 */
data class CognitiveUiState(
    val currentTask: Int = 0,           // 0=intro, 1=cube, 2=trail, 3=clock, 4-6=animals
    val totalTasks: Int = 6,            // Cube, Trail, Clock, 3 Animal Questions
    val isLoading: Boolean = false,
    val error: String? = null,

    // Assessment tracking
    val assessmentId: String = "",      // Current assessment ID

    // Drawing state
    val paths: List<List<Offset>> = emptyList(),
    val isDrawing: Boolean = false,

    // Timer
    val elapsedTime: Long = 0,          // in seconds

    // Results
    val currentTaskPassed: Boolean? = null,
    val showResultDialog: Boolean = false,

    // Trail Making specific
    val touchSequence: List<String> = emptyList(),
    val expectedSequence: List<String> = listOf("1", "A", "2", "B", "3", "C", "4", "D", "5", "E"),

    // Animal Naming specific
    val currentAnimalQuestion: Int = 0,  // 0=Lion, 1=Camel, 2=Rhino
    val animalAnswers: Map<Int, String> = emptyMap(),  // questionIndex -> answer

    // TTS state
    val isInstructionPlaying: Boolean = false
)

/**
 * One-time events for the UI
 */
sealed class CognitiveEvent {
    data object TaskCompleted : CognitiveEvent()
    data object AllTasksCompleted : CognitiveEvent()
    data class Error(val message: String) : CognitiveEvent()
}

class CognitiveViewModel(
    private val repository: CognitiveRepository = CognitiveRepository.instance,
    private val userdb: FirestoreRepository = FirestoreRepository.instance
) : ViewModel() {

    private val _uiState = MutableStateFlow(CognitiveUiState())
    val uiState: StateFlow<CognitiveUiState> = _uiState.asStateFlow()

    private val _events = Channel<CognitiveEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    private var taskStartTime: Long = 0

    /**
     * Starts a task
     */
    fun startTask(taskNumber: Int) {
        viewModelScope.launch {
            // Create assessment on first task
            if (taskNumber == 1 && _uiState.value.assessmentId.isEmpty()) {
                val assessmentId = UUID.randomUUID().toString()
                repository.createCognitiveAssessment(assessmentId)
                _uiState.update { it.copy(assessmentId = assessmentId) }
            }

            _uiState.update {
                it.copy(
                    currentTask = taskNumber,
                    paths = emptyList(),
                    touchSequence = emptyList(),
                    elapsedTime = 0,
                    currentTaskPassed = null,
                    showResultDialog = false,
                    error = null,
                    currentAnimalQuestion = if (taskNumber == 4) 0 else it.currentAnimalQuestion  // Reset for animal task
                )
            }
            taskStartTime = System.currentTimeMillis()
            startTimer()
        }
    }

    /**
     * Timer to measure duration
     */
    private fun startTimer() {
        viewModelScope.launch {
            while (_uiState.value.currentTask > 0 && _uiState.value.currentTaskPassed == null) {
                kotlinx.coroutines.delay(1000)
                val elapsed = (System.currentTimeMillis() - taskStartTime) / 1000
                _uiState.update { it.copy(elapsedTime = elapsed) }
            }
        }
    }

    /**
     * Updates drawing paths
     */
    fun updatePaths(newPaths: List<List<Offset>>) {
        _uiState.update { it.copy(paths = newPaths) }
    }

    /**
     * Clears the canvas
     */
    fun clearCanvas() {
        _uiState.update { it.copy(paths = emptyList()) }
    }

    /**
     * Registers a node touch (for Trail Making)
     */
    fun registerNodeTouch(nodeId: String) {
        _uiState.update {
            it.copy(touchSequence = it.touchSequence + nodeId)
        }
    }

    /**
     * Submit Cube Drawing Task
     */
    fun submitCubeDrawing(bitmap: Bitmap) {
        val state = _uiState.value
        if (state.paths.isEmpty()) {
            _uiState.update { it.copy(error = "Please draw something first") }
            return
        }

        viewModelScope.launch {
            try {
                // Log to verify authentication
                val currentUser = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser
                Log.d("CognitiveVM", "Current user: ${currentUser?.uid}")

                if (currentUser == null) {
                    throw Exception("User not authenticated")
                }

                _uiState.update { it.copy(isLoading = true, error = null) }

                // 1. Analyze the drawing
                val metrics = analyzePaths(state.paths, state.elapsedTime)

                // 2. Calculate score using OpenCV (0 or 1)
                val passed = scoreCubeDrawing(bitmap, metrics) == 1

                // 3. Upload image to Storage
                val imageUrl = repository.uploadDrawingImage(bitmap, "cube_drawing")

                // 4. Create result
                val result = CognitiveTaskResult(
                    id = UUID.randomUUID().toString(),
                    userId = "",  // Will be filled in repository
                    taskType = "cube_drawing",
                    imageUrl = imageUrl,
                    strokeCount = metrics.strokeCount,
                    totalLength = metrics.totalLength,
                    boundingBoxArea = metrics.boundingBoxArea,
                    duration = metrics.duration,
                    passed = passed,
                    score = if (passed) 1 else 0  // Add score field
                )

                // 5. Save to Firestore using new structure
                repository.saveCognitiveTaskResultToAssessment(state.assessmentId, result)
                repository.updateAssessmentScore(state.assessmentId)

                // 6. Update UI
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        currentTaskPassed = passed,
                        showResultDialog = true
                    )
                }

                _events.send(CognitiveEvent.TaskCompleted)

            } catch (e: Exception) {
                android.util.Log.e("CognitiveVM", "Error submitting cube drawing", e)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "Failed to submit task"
                    )
                }
                _events.send(CognitiveEvent.Error(e.localizedMessage ?: "Unknown error"))
            }
        }
    }


    /**
     * Submit Trail Making Task
     */
    fun submitTrailMaking(bitmap: Bitmap) {
        val state = _uiState.value

        viewModelScope.launch {
            try {
                _uiState.update { it.copy(isLoading = true, error = null) }

                // 1. Calculate score based on sequence
                val passed = scoreTrailMaking(
                    state.touchSequence,
                    state.expectedSequence,
                    state.elapsedTime
                ) == 1

                // 2. Upload image
                val imageUrl = repository.uploadDrawingImage(bitmap, "trail_making")

                // 3. Create result
                val result = CognitiveTaskResult(
                    id = UUID.randomUUID().toString(),
                    userId = "",
                    taskType = "trail_making",
                    imageUrl = imageUrl,
                    strokeCount = state.paths.size,
                    totalLength = 0f,
                    boundingBoxArea = 0f,
                    duration = state.elapsedTime,
                    passed = passed,
                    score = if (passed) 1 else 0,  // Add score field
                    touchSequence = state.touchSequence
                )

                // 4. Save using new structure
                repository.saveCognitiveTaskResultToAssessment(state.assessmentId, result)
                repository.updateAssessmentScore(state.assessmentId)

                // 5. Update UI
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        currentTaskPassed = passed,
                        showResultDialog = true
                    )
                }

                _events.send(CognitiveEvent.TaskCompleted)

            } catch (e: Exception) {
                android.util.Log.e("CognitiveVM", "Error submitting trail making", e)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "Failed to submit task"
                    )
                }
                _events.send(CognitiveEvent.Error(e.localizedMessage ?: "Unknown error"))
            }
        }
    }

    /**
     * Submit Clock Drawing Task
     */
    fun submitClockDrawing(selectedClock: Int) {
        val state = _uiState.value

        viewModelScope.launch {
            try {
                _uiState.update { it.copy(isLoading = true, error = null) }

                // 1. Validate selection (Clock 1 is correct - shows 11:10)
                val passed = selectedClock == 1

                // 2. Create a simple bitmap to store in Firebase (optional)
                val bitmap = createSelectionBitmap(selectedClock)

                // 3. Upload image
                val imageUrl = repository.uploadDrawingImage(bitmap, "clock_drawing")

                // 4. Create result
                val result = CognitiveTaskResult(
                    id = UUID.randomUUID().toString(),
                    userId = "",
                    taskType = "clock_drawing",
                    imageUrl = imageUrl,
                    strokeCount = 0, // Not applicable for selection
                    totalLength = 0f,
                    boundingBoxArea = 0f,
                    duration = state.elapsedTime,
                    passed = passed,
                    score = if (passed) 1 else 0  // Add score field
                )

                // 5. Save using new structure
                repository.saveCognitiveTaskResultToAssessment(state.assessmentId, result)
                repository.updateAssessmentScore(state.assessmentId)

                // 6. Update UI
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        currentTaskPassed = passed,
                        showResultDialog = true
                    )
                }

                _events.send(CognitiveEvent.TaskCompleted)

            } catch (e: Exception) {
                android.util.Log.e("CognitiveVM", "Error submitting clock drawing", e)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "Failed to submit task"
                    )
                }
                _events.send(CognitiveEvent.Error(e.localizedMessage ?: "Unknown error"))
            }
        }
    }

    /**
     * Create a simple bitmap representing the selected clock option
     */
    private fun createSelectionBitmap(selection: Int): Bitmap {
        return Bitmap.createBitmap(200, 200, Bitmap.Config.ARGB_8888).apply {
            val canvas = android.graphics.Canvas(this)
            val paint = android.graphics.Paint().apply {
                color = android.graphics.Color.BLACK
                textSize = 100f
                textAlign = android.graphics.Paint.Align.CENTER
                isFakeBoldText = true
            }
            canvas.drawColor(android.graphics.Color.WHITE)
            canvas.drawText("Clock $selection", 100f, 120f, paint)
        }
    }

    /**
     * Closes the result dialog
     */
    fun dismissResultDialog() {
        _uiState.update { it.copy(showResultDialog = false) }
    }

    /**
     * Reset state
     */
    fun reset() {
        _uiState.update { CognitiveUiState() }
    }

    /**
     * Submit answer for animal naming question
     */
    fun submitAnimalAnswer(answer: String) {
        val state = _uiState.value
        val questionIndex = state.currentAnimalQuestion

        _uiState.update {
            it.copy(
                animalAnswers = it.animalAnswers + (questionIndex to answer)
            )
        }
    }

    /**
     * Submit all animal naming answers
     */
    fun submitAnimalNaming() {
        val state = _uiState.value

        viewModelScope.launch {
            try {
                _uiState.update { it.copy(isLoading = true, error = null) }

                // Correct answers for each question
                val correctAnswers = listOf("Lion", "Camel", "Rhino")

                // Calculate how many are correct
                var correctCount = 0
                correctAnswers.forEachIndexed { index, correct ->
                    val userAnswer = state.animalAnswers[index] ?: ""
                    if (userAnswer.equals(correct, ignoreCase = true)) {
                        correctCount++
                    }
                }

                // Save each question result separately
                correctAnswers.forEachIndexed { index, correct ->
                    val userAnswer = state.animalAnswers[index] ?: ""
                    val passed = userAnswer.equals(correct, ignoreCase = true)

                    val result = CognitiveTaskResult(
                        id = UUID.randomUUID().toString(),
                        userId = "",
                        taskType = "animal_naming_$index",
                        imageUrl = "",
                        strokeCount = 0,
                        totalLength = 0f,
                        boundingBoxArea = 0f,
                        duration = state.elapsedTime,
                        passed = passed,
                        score = if (passed) 1 else 0  // Each animal is worth 1 point
                    )

                    repository.saveCognitiveTaskResultToAssessment(state.assessmentId, result)
                    userdb.updateTask("hasCompletedCognitiveAssessment", UserTasks.AI_ASSESSMENT.taskName)
                }

                // Update assessment score after all tasks
                repository.updateAssessmentScore(state.assessmentId)

                _uiState.update {
                    it.copy(
                        isLoading = false,
                        currentTaskPassed = correctCount == 3,
                        showResultDialog = true
                    )
                }

                _events.send(CognitiveEvent.AllTasksCompleted)

            } catch (e: Exception) {
                android.util.Log.e("CognitiveVM", "Error submitting animal naming", e)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "Failed to submit task"
                    )
                }
                _events.send(CognitiveEvent.Error(e.localizedMessage ?: "Unknown error"))
            }
        }
    }

    /**
     * Move to next animal question
     */
    fun nextAnimalQuestion() {
        val state = _uiState.value
        if (state.currentAnimalQuestion < 2) {
            _uiState.update {
                it.copy(currentAnimalQuestion = state.currentAnimalQuestion + 1)
            }
        }
    }

    /**
     * Move to previous animal question
     */
    fun previousAnimalQuestion() {
        val state = _uiState.value
        if (state.currentAnimalQuestion > 0) {
            _uiState.update {
                it.copy(currentAnimalQuestion = state.currentAnimalQuestion - 1)
            }
        }
    }

    fun playInstruction(context: Context, instructionText: String) {
        if (instructionText.isBlank()) {
            Log.w(TAG, "No instruction text provided")
            return
        }

        if (_uiState.value.isInstructionPlaying) {
            Log.d(TAG, "Instruction is already playing")
            return
        }

        _uiState.update { it.copy(isInstructionPlaying = true) }
        val tts = TTSManager.getInstance(context)
        tts.speak(instructionText)
        _uiState.update { it.copy(isInstructionPlaying = false) }
    }
}