package com.example.nms_mobile.ui.feature.memory

import android.content.Context
import android.os.Build
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.*
import com.example.nms_mobile.services.TTSManager
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.Locale
import java.util.UUID
import kotlin.text.get

data class MemoryTestUiState(
    val testState: MemoryTestState = MemoryTestState.IDLE,
    val currentQuestionIndex: Int = 0,
    val totalQuestions: Int = 7,
    val questions: List<MemoryQuestion> = emptyList(),
    val currentQuestion: MemoryQuestion? = null,
    val sequenceToMemorize: String = "",
    val showSequence: Boolean = false,
    val sequenceMemorizeTime: Int = 10, // seconds countdown
    val selectedAnswer: String? = null,
    val isSubmitting: Boolean = false,
    val testStartTime: Long = 0,
    val error: String? = null,
    val correctAnswers: Int = 0,
    val finalScore: Double = 0.0,
    val isInstructionPlaying: Boolean = false,
)


sealed class MemoryTestEvent {
    data object TestCompleted : MemoryTestEvent()
    data class Error(val message: String) : MemoryTestEvent()
}

class MemoryTestViewModel(
    private val repository: MemoryTestRepository = MemoryTestRepository.instance
) : ViewModel() {

    private val _uiState = MutableStateFlow(MemoryTestUiState())
    val uiState: StateFlow<MemoryTestUiState> = _uiState.asStateFlow()

    private val _events = Channel<MemoryTestEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    private val testId = repository.generateTestId()
    private val memorizedSequence = "4-7-2-9" // Fixed sequence for this test

    companion object {
        private const val TAG = "MemoryTestViewModel"
    }


    init {
        initializeTest()
    }

    private fun initializeTest() {
        val questions = createQuestions()
        _uiState.update {
            it.copy(
                questions = questions,
                currentQuestion = null, // Don't pre-load, will be set in startFirstQuestion()
                currentQuestionIndex = -1, // Not started yet
                totalQuestions = questions.size,
                sequenceToMemorize = memorizedSequence,
                testStartTime = System.currentTimeMillis()
            )
        }
    }

    private fun createQuestions(): List<MemoryQuestion> {
        return listOf(
            // Question 1: Reverse sequence
            MemoryQuestion(
                id = 1,
                type = QuestionType.REVERSE_SEQUENCE,
                questionText = "You see the sequence of numbers:\n\n3- 8 - 6 - 1\n\nWhat is the sequence reverse:",
                options = listOf(
                    "3 - 8 - 6 - 1",
                    "1 - 3 - 8 - 6",
                    "1 - 6 - 8 - 3",
                    "6- 8 - 3 - 1",
                    "8 - 1 - 3 - 6",
                    "8 - 6 - 3 - 1"
                ),
                correctAnswer = "1 - 6 - 8 - 3"
            ),

            // Question 2: Recall the memorized sequence
            MemoryQuestion(
                id = 2,
                type = QuestionType.RECALL_SEQUENCE,
                questionText = "What was the sequence:",
                options = listOf(
                    "4 - 7 - 2 - 9",
                    "1 - 3 - 2 - 9",
                    "4 - 2 - 2 - 9",
                    "4 - 9 - 2 - 7",
                    "4 - 7 - 2 - 0"
                ),
                correctAnswer = "4 - 7 - 2 - 9"
            ),

            // Question 3: Number pattern
            MemoryQuestion(
                id = 3,
                type = QuestionType.NUMBER_PATTERN,
                questionText = "Find the missing number:\n2, 4, 8, 16, ?",
                options = listOf("18", "20", "22", "24", "32"),
                correctAnswer = "32"
            ),

            // Question 4: Math operations
            MemoryQuestion(
                id = 4,
                type = QuestionType.MATH_OPERATIONS,
                questionText = "Start with 10, add 5, multiply by 2, subtract 8.\nWhat is the result?",
                options = listOf("22", "24", "20", "12"),
                correctAnswer = "22"
            ),

            // Question 5: Recipe problem
            MemoryQuestion(
                id = 5,
                type = QuestionType.WORD_PROBLEM_RECIPE,
                questionText = "A recipe for a cake requires 2 cups of flour for every 3 cups of sugar. If you use 9 cups of sugar to make the cake, how many cups of flour will you need?",
                options = listOf("6 cups", "4,5 cups", "12 cups", "18 cups"),
                correctAnswer = "6 cups"
            ),

            // Question 6: Train problem
            MemoryQuestion(
                id = 6,
                type = QuestionType.WORD_PROBLEM_TRAIN,
                questionText = "A train leaves Cork at 9:30 with 24 passengers. At the next stop, 12 more get on.\nHow many passengers are on the train?",
                options = listOf("34", "36", "38", "42"),
                correctAnswer = "36"
            )
        )
    }

    /**
     * Start showing instructions
     */
    fun startInstructions() {
        _uiState.update { it.copy(testState = MemoryTestState.INSTRUCTIONS) }
    }

    /**
     * Start the test (show memorize sequence)
     */
    fun startTest() {
        _uiState.update {
            it.copy(
                testState = MemoryTestState.MEMORIZE_SEQUENCE,
                showSequence = true
            )
        }
        startMemorizeTimer()
    }

    /**
     * Timer for memorizing sequence
     */
    private fun startMemorizeTimer() {
        viewModelScope.launch {
            var timeLeft = 10
            while (timeLeft > 0 && _uiState.value.showSequence) {
                _uiState.update { it.copy(sequenceMemorizeTime = timeLeft) }
                kotlinx.coroutines.delay(1000)
                timeLeft--
            }
            // Auto advance after timer to first question
            if (_uiState.value.showSequence) {
                finishMemorizing()
            }
        }
    }

    /**
     * Manual advance from memorize screen
     */
    fun finishMemorizing() {
        _uiState.update { it.copy(showSequence = false) }
        // Go directly to first question (index 0)
        startFirstQuestion()
    }

    /**
     * Start the first question after memorization
     */
    private fun startFirstQuestion() {
        val state = _uiState.value
        if (state.questions.isNotEmpty()) {
            _uiState.update {
                it.copy(
                    currentQuestionIndex = 0,
                    currentQuestion = state.questions[0],
                    testState = MemoryTestState.IN_PROGRESS,
                    selectedAnswer = null
                )
            }
        }
    }

    /**
     * Select an answer
     */
    fun selectAnswer(answer: String) {
        _uiState.update { it.copy(selectedAnswer = answer) }
    }

    /**
     * Submit current answer and move to next question
     */
    fun submitAnswer() {
        val state = _uiState.value
        val currentQ = state.currentQuestion ?: return
        val answer = state.selectedAnswer ?: return

        val isCorrect = answer == currentQ.correctAnswer

        // Update question with answer
        val updatedQuestions = state.questions.toMutableList()
        val index = updatedQuestions.indexOfFirst { it.id == currentQ.id }
        if (index != -1) {
            updatedQuestions[index] = currentQ.copy(
                userAnswer = answer,
                isCorrect = isCorrect
            )
        }

        val newCorrectCount = if (isCorrect) state.correctAnswers + 1 else state.correctAnswers

        _uiState.update {
            it.copy(
                questions = updatedQuestions,
                correctAnswers = newCorrectCount,
                selectedAnswer = null
            )
        }

        nextQuestion()
    }

    /**
     * Move to next question or complete test
     */
    fun nextQuestion() {
        val state = _uiState.value
        val nextIndex = state.currentQuestionIndex + 1

        if (nextIndex >= state.totalQuestions) {
            completeTest()
        } else {
            val nextQuestion = state.questions[nextIndex]
            _uiState.update {
                it.copy(
                    currentQuestionIndex = nextIndex,
                    currentQuestion = nextQuestion,
                    testState = MemoryTestState.IN_PROGRESS
                )
            }
        }
    }

    /**
     * Go to previous question
     */
    fun previousQuestion() {
        val state = _uiState.value
        if (state.currentQuestionIndex > 0) {
            val prevIndex = state.currentQuestionIndex - 1
            val prevQuestion = state.questions[prevIndex]

            _uiState.update {
                it.copy(
                    currentQuestionIndex = prevIndex,
                    currentQuestion = prevQuestion,
                    selectedAnswer = prevQuestion.userAnswer
                )
            }
        }
    }

    /**
     * Complete the test and save results
     */
    private fun completeTest() {
        viewModelScope.launch {
            try {
                _uiState.update { it.copy(isSubmitting = true, testState = MemoryTestState.COMPLETED) }

                val state = _uiState.value
                val completionTime = (System.currentTimeMillis() - state.testStartTime) / 1000

                // Simple: each correct answer = 1 point
                val memoryTest = MemoryTest(
                    id = testId,
                    userId = "", // Will be set by repository
                    score = state.correctAnswers,  // 0-7 points
                    totalQuestions = state.totalQuestions,
                    completionTime = completionTime,
                    status = "completed"
                )

                repository.saveMemoryTest(memoryTest)

                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        finalScore = state.correctAnswers.toDouble()
                    )
                }

                _events.send(MemoryTestEvent.TestCompleted)

            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        error = e.localizedMessage ?: "Failed to save test results"
                    )
                }
                _events.send(MemoryTestEvent.Error(e.localizedMessage ?: "Failed to save"))
            }
        }
    }

    /**
     * Reset test
     */
    fun reset() {
        initializeTest()
        _uiState.update { it.copy(testState = MemoryTestState.IDLE) }
    }

    fun playInstruction(context: Context) {
        val instructionText = _uiState.value.questions[_uiState.value.currentQuestionIndex].questionText

        if (instructionText.isBlank()) {
            Log.w(TAG, "No instruction text for current task")
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

