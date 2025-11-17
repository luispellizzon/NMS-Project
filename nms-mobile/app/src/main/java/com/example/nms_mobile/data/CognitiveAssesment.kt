package com.example.nms_mobile.data

import com.google.firebase.Timestamp

/**
 * Resultado de una tarea individual del Cognitive Test
 * Se guarda en: users/{userId}/cognitive_assessments/{taskId}
 */
data class CognitiveTaskResult(
    val id: String = "",
    val userId: String = "",
    val taskType: String = "",  // "cube_drawing", "trail_making", "clock_drawing"

    // Dibujo/interacción guardado como imagen
    val imageUrl: String = "",

    // Métricas automáticas del análisis
    val strokeCount: Int = 0,           // Número de trazos/líneas
    val totalLength: Float = 0f,        // Longitud total dibujada en pixels
    val boundingBoxArea: Float = 0f,    // Área del rectángulo que contiene el dibujo
    val duration: Long = 0,             // Tiempo en segundos

    // Scoring binario (0 o 1)
    val passed: Boolean = false,        // true = 1 punto, false = 0 puntos

    // Metadata adicional (solo para Trail Making)
    val touchSequence: List<String>? = null,  // Secuencia de nodos tocados ["1", "A", "2", ...]

    // Timestamp
    val timestamp: Timestamp = Timestamp.now()
)

/**
 * Métricas extraídas del análisis del dibujo
 */
data class DrawingMetrics(
    val strokeCount: Int,           // Número de trazos
    val totalLength: Float,         // Longitud total en pixels
    val boundingBoxArea: Float,     // Área ocupada por el dibujo
    val duration: Long              // Tiempo en segundos
)

/**
 * Estado del test cognitivo completo
 */
data class CognitiveAssessmentSummary(
    val userId: String = "",
    val totalTasks: Int = 3,
    val tasksCompleted: Int = 0,
    val tasksPassed: Int = 0,      // Suma de los "passed" (0-3)
    val tasks: List<CognitiveTaskResult> = emptyList(),
    val timestamp: Timestamp = Timestamp.now()
)