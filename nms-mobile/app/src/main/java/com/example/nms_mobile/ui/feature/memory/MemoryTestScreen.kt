package com.example.nms_mobile.ui.feature.memory

import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.repeatOnLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.nms_mobile.data.MemoryTestState

@Composable
fun MemoryTestScreen(
    viewModel: MemoryTestViewModel = viewModel(),
    onBack: () -> Unit,
    onCompleted: () -> Unit,
) {
    val state by viewModel.uiState.collectAsState()
    val lifecycleOwner = LocalLifecycleOwner.current
    val context = LocalContext.current

    // Handle events
    LaunchedEffect(viewModel) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            viewModel.events.collect { event ->
                when (event) {
                    is MemoryTestEvent.TestCompleted -> {
                        // Don't auto-navigate, let user click "Done" button
                        // onCompleted() is called from MemoryTestCompletedScreen
                    }
                    is MemoryTestEvent.Error -> {
                        // Error already shown in UI state
                    }
                }
            }
        }
    }

    // Route to appropriate screen based on state
    when (state.testState) {
        MemoryTestState.IDLE -> {
            // Auto-start instructions
            LaunchedEffect(Unit) {
                viewModel.startInstructions()
            }
        }

        MemoryTestState.INSTRUCTIONS -> {
            MemoryTestInstructionsScreen(
                onStartTest = { viewModel.startTest() },
                onBack = onBack
            )
        }

        MemoryTestState.MEMORIZE_SEQUENCE -> {
            MemorizeSequenceScreen(
                sequence = state.sequenceToMemorize,
                timeRemaining = state.sequenceMemorizeTime,
                onNext = { viewModel.finishMemorizing() }
            )
        }

        MemoryTestState.IN_PROGRESS -> {
            state.currentQuestion?.let { question ->
                MemoryTestQuestionScreen(
                    state = state,
                    onPlayInstruction = { viewModel.playInstruction(context) },
                    question = question,
                    questionNumber = state.currentQuestionIndex + 1,
                    totalQuestions = state.totalQuestions,
                    selectedAnswer = state.selectedAnswer,
                    onAnswerSelected = { viewModel.selectAnswer(it) },
                    onNext = { viewModel.submitAnswer() },
                    onPrevious = { viewModel.previousQuestion() },
                    canGoBack = state.currentQuestionIndex > 0
                )
            }
        }

        MemoryTestState.COMPLETED -> {
            // Show loading or success message
            MemoryTestCompletedScreen(
                score = state.correctAnswers,
                totalQuestions = state.totalQuestions,
                isSubmitting = state.isSubmitting,
                onDone = onCompleted
            )
        }

        MemoryTestState.ERROR -> {
            // Show error screen
            MemoryTestErrorScreen(
                error = state.error ?: "Unknown error",
                onRetry = { viewModel.reset() },
                onBack = onBack
            )
        }
    }
}