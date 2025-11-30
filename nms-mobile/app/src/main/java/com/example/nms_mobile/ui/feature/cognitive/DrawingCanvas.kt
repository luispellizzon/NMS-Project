package com.example.nms_mobile.ui.feature.cognitive

import android.graphics.Bitmap
import android.graphics.Paint
import android.util.Log
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.example.nms_mobile.data.DrawingMetrics
import com.example.nms_mobile.utils.OpenCVAnalyzer
import kotlin.math.pow
import kotlin.math.sqrt

/**
 * Interactive canvas for drawing with finger
 */
@Composable
fun DrawingCanvas(
    modifier: Modifier = Modifier,
    onClear: () -> Unit,
    onPathsChanged: (List<List<Offset>>) -> Unit  // Callback when paths change
) {
    var paths by remember { mutableStateOf(listOf<List<Offset>>()) }
    var currentPath by remember { mutableStateOf(listOf<Offset>()) }

    Column(modifier = modifier) {
        // Drawing canvas
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .background(Color(0xFFF5F5F5), RoundedCornerShape(12.dp))
                .clip(RoundedCornerShape(12.dp))  // Clip to rounded corners
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { offset ->
                            currentPath = listOf(offset)
                        },
                        onDrag = { change, _ ->
                            currentPath = currentPath + change.position
                        },
                        onDragEnd = {
                            if (currentPath.isNotEmpty()) {
                                paths = paths + listOf(currentPath)
                                onPathsChanged(paths)
                                currentPath = emptyList()
                            }
                        }
                    )
                }
        ) {
            // Draw all completed paths
            paths.forEach { path ->
                if (path.size >= 2) {
                    for (i in 0 until path.size - 1) {
                        drawLine(
                            color = Color.Black,
                            start = path[i],
                            end = path[i + 1],
                            strokeWidth = 5f,
                            cap = StrokeCap.Round
                        )
                    }
                }
            }

            // Draw current path
            if (currentPath.size >= 2) {
                for (i in 0 until currentPath.size - 1) {
                    drawLine(
                        color = Color.Black,
                        start = currentPath[i],
                        end = currentPath[i + 1],
                        strokeWidth = 5f,
                        cap = StrokeCap.Round
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Clear button
        Button(
            onClick = {
                paths = emptyList()
                currentPath = emptyList()
                onClear()
                onPathsChanged(emptyList())
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.outlinedButtonColors()
        ) {
            Text("Clear")
        }
    }
}

/**
 * Converts list of paths to Bitmap for saving to Storage
 */
fun pathsToBitmap(
    paths: List<List<Offset>>,
    width: Int,
    height: Int
): Bitmap {
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = android.graphics.Canvas(bitmap)

    // White background
    canvas.drawColor(android.graphics.Color.WHITE)

    val paint = Paint().apply {
        color = android.graphics.Color.BLACK
        strokeWidth = 5f
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
    }

    // Draw each path
    paths.forEach { path ->
        if (path.size >= 2) {
            for (i in 0 until path.size - 1) {
                canvas.drawLine(
                    path[i].x, path[i].y,
                    path[i + 1].x, path[i + 1].y,
                    paint
                )
            }
        }
    }

    return bitmap
}

/**
 * Analyzes drawn paths and extracts metrics
 */
fun analyzePaths(paths: List<List<Offset>>, durationSeconds: Long): DrawingMetrics {
    if (paths.isEmpty()) {
        return DrawingMetrics(
            strokeCount = 0,
            totalLength = 0f,
            boundingBoxArea = 0f,
            duration = durationSeconds
        )
    }

    var totalLength = 0f
    var minX = Float.MAX_VALUE
    var maxX = Float.MIN_VALUE
    var minY = Float.MAX_VALUE
    var maxY = Float.MIN_VALUE

    paths.forEach { path ->
        // Calculate path length
        for (i in 0 until path.size - 1) {
            val dx = path[i + 1].x - path[i].x
            val dy = path[i + 1].y - path[i].y
            totalLength += sqrt(dx.pow(2) + dy.pow(2))
        }

        // Calculate bounding box
        path.forEach { point ->
            minX = minOf(minX, point.x)
            maxX = maxOf(maxX, point.x)
            minY = minOf(minY, point.y)
            maxY = maxOf(maxY, point.y)
        }
    }

    val boundingBoxArea = if (minX != Float.MAX_VALUE) {
        (maxX - minX) * (maxY - minY)
    } else {
        0f
    }

    return DrawingMetrics(
        strokeCount = paths.size,
        totalLength = totalLength,
        boundingBoxArea = boundingBoxArea,
        duration = durationSeconds
    )
}

/**
 * Scoring function for Cube Drawing using OpenCV
 * Returns 1 if passed (score >= 5), 0 if not
 */
fun scoreCubeDrawing(bitmap: Bitmap, metrics: DrawingMetrics): Int {
    try {
        // Analyze with OpenCV
        val analysis = OpenCVAnalyzer.analyzeCubeDrawing(bitmap)

        Log.d("DrawingCanvas", "Cube OpenCV Analysis: score=${analysis.score}, corners=${analysis.cornerCount}, lines=${analysis.lineCount}")

        // Pass if score >= 5 out of 10
        return if (analysis.score >= 5) 1 else 0

    } catch (e: Exception) {
        Log.e("DrawingCanvas", "Error in OpenCV analysis, using fallback", e)

        // Fallback to simple metrics if OpenCV fails
        val hasMinimumStrokes = metrics.strokeCount >= 3
        val hasReasonableSize = metrics.boundingBoxArea > 1000f
        return if (hasMinimumStrokes && hasReasonableSize) 1 else 0
    }
}

/**
 * Legacy scoring function (without OpenCV)
 * Kept for backward compatibility
 */
fun scoreCubeDrawingSimple(metrics: DrawingMetrics): Int {
    Log.d("DrawingCanvas", "Cube Metrics: strokes=${metrics.strokeCount}, area=${metrics.boundingBoxArea}, time=${metrics.duration}")
    return 1
}

/**
 * Scoring function for Clock Drawing
 * Returns 1 if passed, 0 if not
 * NOTE: Always returns 1 for now - actual scoring will be done at the end
 */
fun scoreClockDrawing(metrics: DrawingMetrics): Int {
    // Log metrics for future analysis
    Log.d("DrawingCanvas", "Clock Metrics: strokes=${metrics.strokeCount}, area=${metrics.boundingBoxArea}, time=${metrics.duration}")

    // Always pass individual tasks - final scoring happens at the end
    return 1
}

/**
 * Scoring function for Trail Making
 * Returns 1 if passed, 0 if not
 * NOTE: Always returns 1 for now - actual scoring will be done at the end
 */
fun scoreTrailMaking(
    touchSequence: List<String>,
    expectedSequence: List<String>,
    duration: Long
): Int {
    // Log metrics for future analysis
    val correctCount = if (touchSequence.isNotEmpty() && expectedSequence.isNotEmpty()) {
        touchSequence.zip(expectedSequence).count { it.first == it.second }
    } else 0
    val accuracy = if (expectedSequence.isNotEmpty()) {
        correctCount.toFloat() / expectedSequence.size
    } else 0f

    Log.d("DrawingCanvas", "Trail Metrics: accuracy=$accuracy, duration=$duration")

    // Always pass individual tasks - final scoring happens at the end
    return 1
}