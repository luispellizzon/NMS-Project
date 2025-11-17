package com.example.nms_mobile.utils

import android.graphics.Bitmap
import android.util.Log
import org.opencv.android.Utils
import org.opencv.core.*
import org.opencv.imgproc.Imgproc
import kotlin.ranges.coerceIn
import kotlin.ranges.until

/**
 * OpenCV-based analyzer for cognitive test drawings
 */
object OpenCVAnalyzer {

    /**
     * Analyzes a cube drawing
     * Returns score from 0-10 based on cube quality
     */
    fun analyzeCubeDrawing(bitmap: Bitmap): CubeAnalysisResult {
        try {
            // Convert Bitmap to OpenCV Mat
            val mat = Mat()
            Utils.bitmapToMat(bitmap, mat)

            // Convert to grayscale
            val gray = Mat()
            Imgproc.cvtColor(mat, gray, Imgproc.COLOR_BGR2GRAY)

            // Apply binary threshold
            val binary = Mat()
            Imgproc.threshold(gray, binary, 127.0, 255.0, Imgproc.THRESH_BINARY_INV)

            // Find contours
            val contours = mutableListOf<MatOfPoint>()
            val hierarchy = Mat()
            Imgproc.findContours(
                binary,
                contours,
                hierarchy,
                Imgproc.RETR_EXTERNAL,
                Imgproc.CHAIN_APPROX_SIMPLE
            )

            // Detect corners
            val corners = detectCorners(binary)

            // Detect lines
            val lines = detectLines(binary)

            // Calculate score based on features
            val score = calculateCubeScore(
                cornerCount = corners.size,
                lineCount = lines.size,
                contourCount = contours.size
            )

            // Clean up
            mat.release()
            gray.release()
            binary.release()
            hierarchy.release()

            return CubeAnalysisResult(
                score = score,
                cornerCount = corners.size,
                lineCount = lines.size,
                contourCount = contours.size,
                hasCubeStructure = score >= 5
            )

        } catch (e: Exception) {
            Log.e("OpenCVAnalyzer", "Error analyzing cube", e)
            return CubeAnalysisResult(
                score = 0,
                cornerCount = 0,
                lineCount = 0,
                contourCount = 0,
                hasCubeStructure = false
            )
        }
    }


    /**
     * Detects corners using Harris corner detection
     */
    private fun detectCorners(binary: Mat): List<Point> {
        val corners = Mat()
        val cornersMat = Mat()

        // Harris corner detection
        Imgproc.cornerHarris(binary, corners, 2, 3, 0.04)

        // Normalize
        Core.normalize(corners, cornersMat, 0.0, 255.0, Core.NORM_MINMAX)

        // Convert to 8-bit
        val corners8bit = Mat()
        cornersMat.convertTo(corners8bit, CvType.CV_8U)

        // Find corner points
        val cornerPoints = mutableListOf<Point>()
        for (i in 0 until corners8bit.rows()) {
            for (j in 0 until corners8bit.cols()) {
                if (corners8bit.get(i, j)[0] > 100) {
                    cornerPoints.add(Point(j.toDouble(), i.toDouble()))
                }
            }
        }

        corners.release()
        cornersMat.release()
        corners8bit.release()

        return cornerPoints
    }

    /**
     * Detects lines using Hough Line Transform
     */
    private fun detectLines(binary: Mat): List<Line> {
        val edges = Mat()
        Imgproc.Canny(binary, edges, 50.0, 150.0)

        val lines = Mat()
        Imgproc.HoughLinesP(
            edges,
            lines,
            1.0,
            Math.PI / 180,
            50,
            30.0,
            10.0
        )

        val detectedLines = mutableListOf<Line>()
        for (i in 0 until lines.rows()) {
            val line = lines.get(i, 0)
            detectedLines.add(
                Line(
                    x1 = line[0],
                    y1 = line[1],
                    x2 = line[2],
                    y2 = line[3]
                )
            )
        }

        edges.release()
        lines.release()

        return detectedLines
    }

    /**
     * Calculates cube score based on detected features
     * A cube should have:
     * - 8 corners (ideally)
     * - 12 edges (ideally)
     * - Minimum 4 lines for a simple 2D representation
     */
    private fun calculateCubeScore(
        cornerCount: Int,
        lineCount: Int,
        contourCount: Int
    ): Int {
        var score = 0

        // Corner scoring (0-4 points)
        when {
            cornerCount >= 8 -> score += 4  // Perfect cube
            cornerCount >= 6 -> score += 3  // Good attempt
            cornerCount >= 4 -> score += 2  // Basic cube
            cornerCount >= 2 -> score += 1  // Minimal effort
        }

        // Line scoring (0-4 points)
        when {
            lineCount >= 12 -> score += 4  // Excellent
            lineCount >= 8 -> score += 3   // Good
            lineCount >= 4 -> score += 2   // Acceptable
            lineCount >= 2 -> score += 1   // Minimal
        }

        // Contour scoring (0-2 points)
        when {
            contourCount >= 2 -> score += 2  // Multiple shapes (3D attempt)
            contourCount >= 1 -> score += 1  // At least one shape
        }

        return score.coerceIn(0, 10)
    }
}

/**
 * Result of cube drawing analysis
 */
data class CubeAnalysisResult(
    val score: Int,              // 0-10
    val cornerCount: Int,
    val lineCount: Int,
    val contourCount: Int,
    val hasCubeStructure: Boolean
)

/**
 * Simple line representation
 */
data class Line(
    val x1: Double,
    val y1: Double,
    val x2: Double,
    val y2: Double
)