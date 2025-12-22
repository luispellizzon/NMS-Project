package com.example.nms_mobile.data

import com.google.firebase.Timestamp

/**
 * Cognitive Assessment Document (parent)
 * Stored at: users/{userId}/cognitive_assessments/{assessmentId}
 */
data class CognitiveAssessment(
    val id: String = "",
    val userId: String = "",
    val totalScore: Int = 0,           // Sum of all task scores (0-6)
    val state: String = "in_progress", // "in_progress", "completed"
    val date: Timestamp = Timestamp.now(),
    val startedAt: Timestamp = Timestamp.now(),
    val completedAt: Timestamp? = null
)

/**
 * Resultado de una tarea individual del Cognitive Test
 * Stored as subcollection: users/{userId}/cognitive_assessments/{assessmentId}/tasks/{taskId}
 */
data class CognitiveTaskResult(
    val id: String = "",
    val userId: String = "",
    val taskType: String = "",  // "cube_drawing", "trail_making", "clock_drawing", "animal_naming_0/1/2"

    // Drawing/interaction saved as image
    val imageUrl: String = "",

    // Automatic analysis metrics
    val strokeCount: Int = 0,           // Number of strokes/lines
    val totalLength: Float = 0f,        // Total length drawn in pixels
    val boundingBoxArea: Float = 0f,    // Area of the bounding rectangle
    val duration: Long = 0,             // Time in seconds

    // Scoring
    val passed: Boolean = false,        // true = passed the test, false = failed
    val score: Int = 0,                 // Points obtained: 1 if passed=true, 0 if passed=false

    // Additional metadata (only for Trail Making)
    val touchSequence: List<String>? = null,  // Sequence of touched nodes ["1", "A", "2", ...]

    // Timestamp
    val timestamp: Timestamp = Timestamp.now()
)

/**
 * Metrics extracted from drawing analysis
 */
data class DrawingMetrics(
    val strokeCount: Int,           // Number of strokes
    val totalLength: Float,         // Total length in pixels
    val boundingBoxArea: Float,     // Area occupied by the drawing
    val duration: Long              // Time in seconds
)

/**
 * Complete cognitive test status
 */
data class CognitiveAssessmentSummary(
    val userId: String = "",
    val totalTasks: Int = 6,        // Cube, Trail, Clock, 3 Animal Questions
    val tasksCompleted: Int = 0,
    val tasksPassed: Int = 0,       // Sum of "passed" (0-6)
    val tasks: List<CognitiveTaskResult> = emptyList()
)