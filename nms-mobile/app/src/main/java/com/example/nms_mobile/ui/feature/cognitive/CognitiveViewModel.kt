package com.example.nms_mobile.ui.feature.cognitive

import android.graphics.Bitmap
import androidx.compose.ui.geometry.Offset
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.*
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.UUID

/**
 * UI State for Cognitive Assessment
 */
data class CognitiveUiState(
    val currentTask: Int = 0,           // 0=intro, 1=cube, 2=trail, 3=clock
    val totalTasks: Int = 3,            // Cube, Trail Making, Clock
    val isLoading: Boolean = false,
    val error: String? = null,

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
    val expectedSequence: List<String> = listOf("1", "A", "2", "B", "3", "C", "4", "D", "5", "E")
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
    private val repository: CognitiveRepository = CognitiveRepository.instance
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
        _uiState.update {
            it.copy(
                currentTask = taskNumber,
                paths = emptyList(),
                touchSequence = emptyList(),
                elapsedTime = 0,
                currentTaskPassed = null,
                showResultDialog = false,
                error = null
            )
        }
        taskStartTime = System.currentTimeMillis()
        startTimer()
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
                android.util.Log.d("CognitiveVM", "Current user: ${currentUser?.uid}")

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
                    passed = passed
                )

                // 5. Save to Firestore
                repository.saveCognitiveTaskResult(result)

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
                    touchSequence = state.touchSequence
                )

                // 4. Save
                repository.saveCognitiveTaskResult(result)

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
    fun submitClockDrawing(bitmap: Bitmap) {
        val state = _uiState.value
        if (state.paths.isEmpty()) {
            _uiState.update { it.copy(error = "Please draw the clock hands") }
            return
        }

        viewModelScope.launch {
            try {
                _uiState.update { it.copy(isLoading = true, error = null) }

                // 1. Analyze
                val metrics = analyzePaths(state.paths, state.elapsedTime)

                // 2. Calculate score
                val passed = scoreClockDrawing(metrics) == 1

                // 3. Upload image
                val imageUrl = repository.uploadDrawingImage(bitmap, "clock_drawing")

                // 4. Create result
                val result = CognitiveTaskResult(
                    id = UUID.randomUUID().toString(),
                    userId = "",
                    taskType = "clock_drawing",
                    imageUrl = imageUrl,
                    strokeCount = metrics.strokeCount,
                    totalLength = metrics.totalLength,
                    boundingBoxArea = metrics.boundingBoxArea,
                    duration = metrics.duration,
                    passed = passed
                )

                // 5. Save
                repository.saveCognitiveTaskResult(result)

                // 6. Update UI
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        currentTaskPassed = passed,
                        showResultDialog = true
                    )
                }

                _events.send(CognitiveEvent.AllTasksCompleted)

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
}