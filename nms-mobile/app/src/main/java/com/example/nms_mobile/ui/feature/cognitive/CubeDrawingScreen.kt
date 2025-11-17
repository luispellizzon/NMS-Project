package com.example.nms_mobile.ui.cognitive

import android.graphics.Bitmap
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nms_mobile.R
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.components.CustomTopAppBar
import com.example.nms_mobile.ui.feature.cognitive.DrawingCanvas
import com.example.nms_mobile.ui.feature.cognitive.pathsToBitmap

/**
 * Task screen: Copy the Cube
 */
@Composable
fun CubeDrawingScreen(
    elapsedTime: Long,
    onPathsChanged: (List<List<androidx.compose.ui.geometry.Offset>>) -> Unit,
    onClear: () -> Unit,
    onNext: (android.graphics.Bitmap) -> Unit,
    onBack: () -> Unit
) {
    var paths by remember { mutableStateOf(listOf<List<androidx.compose.ui.geometry.Offset>>()) }

    Scaffold(
        topBar = {
            CustomTopAppBar(
                title = "Cognitive Assessment",
                onBack = onBack
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
                .padding(padding)
                .padding(horizontal = 24.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Title
            Text(
                text = "Copy the cube",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Instructions Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFFE0F2F1)
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Surface(
                        modifier = Modifier.size(48.dp),
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFF00796B)
                    ) {
                        Icon(
                            imageVector = Icons.Default.VolumeUp,
                            contentDescription = "Instructions",
                            tint = Color.White,
                            modifier = Modifier.padding(12.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Text(
                        text = "Look at the cube shown on the screen and try to draw the same cube with your finger.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Black,
                        lineHeight = 20.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Reference Cube Image
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color.White
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    // Try to load cube image from drawable, fallback to drawn cube
                    val cubePainter = runCatching {
                        painterResource(id = R.drawable.cube)
                    }.getOrNull()

                    if (cubePainter != null) {
                        // Show image from drawable if available
                        Image(
                            painter = cubePainter,
                            contentDescription = "Cube reference",
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        // Fallback: Draw a simple 3D cube with Canvas
                        androidx.compose.foundation.Canvas(
                            modifier = Modifier.fillMaxSize()
                        ) {
                            val centerX = size.width / 2
                            val centerY = size.height / 2
                            val cubeSize = 100f
                            val offset = 30f

                            val paint = androidx.compose.ui.graphics.Paint().apply {
                                color = Color.Black
                                style = androidx.compose.ui.graphics.PaintingStyle.Stroke
                                strokeWidth = 3f
                            }

                            // Front face (bottom-left square)
                            val frontPath = androidx.compose.ui.graphics.Path().apply {
                                moveTo(centerX - cubeSize, centerY + cubeSize)
                                lineTo(centerX, centerY + cubeSize)
                                lineTo(centerX, centerY)
                                lineTo(centerX - cubeSize, centerY)
                                close()
                            }

                            // Back face (top-right square)
                            val backPath = androidx.compose.ui.graphics.Path().apply {
                                moveTo(centerX - cubeSize + offset, centerY - offset)
                                lineTo(centerX + offset, centerY - offset)
                                lineTo(centerX + offset, centerY + cubeSize - offset)
                                lineTo(centerX - cubeSize + offset, centerY + cubeSize - offset)
                                close()
                            }

                            // Connecting lines
                            val connectPath = androidx.compose.ui.graphics.Path().apply {
                                // Bottom-left to top-left
                                moveTo(centerX - cubeSize, centerY + cubeSize)
                                lineTo(centerX - cubeSize + offset, centerY + cubeSize - offset)

                                // Top-left to top-right (back)
                                moveTo(centerX - cubeSize, centerY)
                                lineTo(centerX - cubeSize + offset, centerY - offset)

                                // Top-right to bottom-right
                                moveTo(centerX, centerY)
                                lineTo(centerX + offset, centerY - offset)

                                // Bottom-right to bottom-right (back)
                                moveTo(centerX, centerY + cubeSize)
                                lineTo(centerX + offset, centerY + cubeSize - offset)
                            }

                            drawContext.canvas.apply {
                                drawPath(frontPath, paint)
                                drawPath(backPath, paint)
                                drawPath(connectPath, paint)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Timer
            Text(
                text = "Time: ${formatTime(elapsedTime)}",
                style = MaterialTheme.typography.bodyLarge,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Drawing Canvas
            DrawingCanvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                onClear = {
                    paths = emptyList()
                    onClear()
                },
                onPathsChanged = { newPaths ->
                    paths = newPaths
                    onPathsChanged(newPaths)
                }
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Next Button
            Button(
                onClick = {
                    if (paths.isNotEmpty()) {
                        // Convert paths to bitmap
                        val bitmap = pathsToBitmap(paths, 800, 800)
                        onNext(bitmap)
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                enabled = paths.isNotEmpty(),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
            ) {
                Text(
                    "Next",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

private fun formatTime(seconds: Long): String {
    val mins = seconds / 60
    val secs = seconds % 60
    return String.format("%02d:%02d", mins, secs)
}