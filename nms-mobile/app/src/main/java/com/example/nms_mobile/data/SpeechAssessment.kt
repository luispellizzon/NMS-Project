//package com.example.nms_mobile.data
//
//import com.google.firebase.Timestamp
//
///**
// * Data model for Speech Assessment
// */


///**
// * Recording state
// */
//enum class RecordingState {
//    IDLE,
//    RECORDING,
//    STOPPED,
//    PROCESSING,
//    COMPLETED,
//    ERROR
//}

import com.google.firebase.Timestamp
import com.google.firebase.firestore.PropertyName

/**
 * Main Speech Assessment Document stored in Firestore
 * Path: users/{userId}/speech_assessment/{assessmentId}
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
    val status: String = "pending",                 // pending, transcribed, analyzed
)

data class SpeechAssessmentDocument(
    val id: String = "",
    val userId: String = "",
    val startedAt: Timestamp = Timestamp.now(),
    val completedAt: Timestamp? = null,
    val currentTaskId: String = SpeechTaskType.WORD_RECALL_INITIAL.taskId,
    @get:PropertyName("isCompleted") @set:PropertyName("isCompleted")
    var isCompleted: Boolean = false,
    val totalScore: Int? = null,
    val content: Map<String, TaskContent> = emptyMap(),
    // NEW: AI analysis status field
    val aiAnalysis: String? = null,  // Can be null, "processing", or "processed"
)

data class TaskContent(
    val taskId: String = "",
    val taskName: String = "",
    val question: String = "",
    val expectedAnswers: List<String> = emptyList(),
    val result: TaskResult? = null,
    val maxScore: Int = 0
)

data class TaskResult(
    val audioUrl: String = "",
    val transcription: String = "",
    val userScore: Int = 0,
    val completedAt: Timestamp = Timestamp.now(),
    val duration: Long = 0
)

/**
 * Individual Task Result
 */
//data class TaskResult(
//    val taskId: String = "",
//    val taskName: String = "",
//    val taskQuestion: String = "",
//    val taskKeywordsAnswer: String = "",
//    val audioUrl: String = "",
//    val transcription: String = "",
//    val maxScore: Int = 0,
//    val userScore: Int = 0,
//    val completedAt: Timestamp = Timestamp.now(),
//    val duration: Long = 0 // in milliseconds
//)

/**
 * Speech Task Types
 */
enum class SpeechTaskType(
    val taskId: String,
    val displayName: String,
    val instruction: String,
    val maxScore: Int,
    val expectedWords: List<String> = emptyList()
) {
    WORD_RECALL_INITIAL(
        taskId = "word_recall_initial",
        displayName = "Word Recall",
        instruction = "I will say three words. Please listen carefully and repeat them back to me. The words are: Apple, Table, Penny.",
        maxScore = 3,
        expectedWords = listOf("Apple", "Table", "Penny")
    ),

    LOCALIZATION(
        taskId = "localization",
        displayName = "Localisation",
        instruction = "Please tell me what is the current year, season, date, day of the week, and today's date.",
        maxScore = 5,
        expectedWords = getExpectedLocalizationWords()
    ),

    REPEAT_ACTION(
        taskId = "repeat_action",
        displayName = "Repeat Action",
        instruction = "Repeat the following: 'No ifs, ands, or buts'",
        maxScore = 1,
        expectedWords = listOf("No ifs, ands, or buts")
    ),

    ORIENTATION(
        taskId = "orientation",
        displayName = "Orientation",
        instruction = "Please, Record 5 different fruits from the list below.",
        maxScore = 5,
        expectedWords = listOf("Apple", "Banana", "Orange", "Grapes", "Pineapple")
    ),

    WORD_RECALL_FINAL(
        taskId = "word_recall_final",
        displayName = "Word Recall",
        instruction = "At the start of this assessment, I said three words. Try to remember what were the 3 words and repeat them back to me.",
        maxScore = 3,
        expectedWords = listOf("Apple", "Table", "Penny")
    );

    companion object {
        fun fromTaskId(id: String): SpeechTaskType? {
            return values().find { it.taskId == id }
        }

        fun getTaskSequence(): List<SpeechTaskType> {
            return listOf(
                WORD_RECALL_INITIAL,
                LOCALIZATION,
                REPEAT_ACTION,
                ORIENTATION,
                WORD_RECALL_FINAL
            )
        }
    }
}

/**
 * UI State for tracking progress
 */
data class SpeechProgressState(
    val totalTasks: Int = 5,
    val completedTasks: Int = 0,
    val currentTask: SpeechTaskType = SpeechTaskType.WORD_RECALL_INITIAL,
    val progressPercentage: Int = 0
) {
    fun updateProgress(): SpeechProgressState {
        val percentage = if (totalTasks > 0) (completedTasks * 100) / totalTasks else 0
        return copy(progressPercentage = percentage)
    }
}

enum class RecordingState {
    IDLE,
    RECORDING,
    STOPPED,
    PROCESSING,
    COMPLETED,
    ERROR
}

/**
 * Speech Analysis Status for UI display
 */
enum class SpeechAnalysisStatus {
    NOT_STARTED,      // Assessment not completed yet
    PROCESSING,       // Assessment completed, AI is processing
    COMPLETED,        // AI processing completed
    ERROR            // Error during processing
}

fun getExpectedLocalizationWords(): List<String> {
    val now = java.time.LocalDate.now()
    val year = now.year.toString()

    val month = now.month.name.lowercase().replaceFirstChar { it.uppercase() } // e.g. "March"
    val day = now.dayOfMonth.toString()
    val dayOfWeek = now.dayOfWeek.name.lowercase().replaceFirstChar { it.uppercase() } // e.g. "Monday"

    val season = when (now.monthValue) {
        in 3..5 -> "Spring"
        in 6..8 -> "Summer"
        in 9..11 -> "Autumn"
        else -> "Winter"
    }

    return listOf(year, season, month, dayOfWeek, day)
}