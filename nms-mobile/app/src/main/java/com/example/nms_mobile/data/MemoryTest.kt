package com.example.nms_mobile.data

import com.google.firebase.Timestamp

/**
 * Data model for Memory Test
 */
data class MemoryTest(
    val id: String = "",
    val userId: String = "",
    val testType: String = "memory_mcq",
    val score: Int = 0,              // Points earned (0-7)
    val totalQuestions: Int = 7,     // Total possible points
    val completionTime: Long = 0,    // In seconds
    val timestamp: Timestamp = Timestamp.now(),
    val status: String = "completed"
)

/**
 * Test state for UI
 */
enum class MemoryTestState {
    IDLE,
    INSTRUCTIONS,
    MEMORIZE_SEQUENCE,
    IN_PROGRESS,
    COMPLETED,
    ERROR
}

/**
 * Question types
 */
enum class QuestionType {
    MEMORIZE_SEQUENCE,      // Question 1: Show sequence to memorize
    REVERSE_SEQUENCE,       // Question 2: What is sequence reversed
    RECALL_SEQUENCE,        // Question 3: What was the sequence
    NUMBER_PATTERN,         // Question 4: Find missing number in pattern
    MATH_OPERATIONS,        // Question 5: Multi-step math problem
    WORD_PROBLEM_RECIPE,    // Question 6: Recipe ratio problem
    WORD_PROBLEM_TRAIN      // Question 7: Train passengers problem
}

/**
 * Individual question data
 */
data class MemoryQuestion(
    val id: Int,
    val type: QuestionType,
    val questionText: String,
    val options: List<String> = emptyList(),
    val correctAnswer: String,
    val userAnswer: String? = null,
    val isCorrect: Boolean = false
)