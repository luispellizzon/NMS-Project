package com.example.nms_mobile.data

import com.google.firebase.Timestamp

/**
 * Data model for Speech Assessment
 */
data class SpeechAssessment(
    val id: String = "",
    val userId: String = "",
    val testType: String = "audio_recording",
    val audioUrl: String = "",                     // Audio URL in Firebase Storage
    val transcription: String = "",                // Transcribed text (empty until transcribed)
    val duration: Long = 0,                        // Duration in milliseconds
    val aiAnalysis: String? = null,                // AI analysis (optional - for later)
    val score: Double? = null,                     // Test score (optional - for later)
    val timestamp: Timestamp = Timestamp.now(),
    val status: String = "pending"                 // pending, transcribed, analyzed
)

/**
 * Recording state
 */
enum class RecordingState {
    IDLE,
    RECORDING,
    STOPPED,
    PROCESSING,
    COMPLETED,
    ERROR
}