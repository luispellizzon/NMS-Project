package com.example.nms_mobile.ui.feature.cognitive

import android.graphics.Bitmap
import android.graphics.Paint
import androidx.compose.foundation.Canvas
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nms_mobile.R
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.components.CustomTopAppBar
import kotlin.math.cos
import kotlin.math.sin

/**
 * Task screen: Set the Clock Hands
 */
@Composable
fun ClockDrawingScreen(
    elapsedTime: Long,
    onPathsChanged: (List<List<Offset>>) -> Unit,
    onClear: () -> Unit,
    onNext: (Bitmap) -> Unit,
    onBack: () -> Unit
) {
    var paths by remember { mutableStateOf(listOf<List<Offset>>()) }

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
                text = "Set the clock hands",
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
                        text = "You will see a clock with the numbers already in place. Use your finger to draw the hands of the clock to show the time 11:10 (ten past eleven).",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Black,
                        lineHeight = 20.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Clock Face Image
            Card(
                modifier = Modifier
                    .size(200.dp),
                        colors = CardDefaults.cardColors(
                        containerColor = Color.White
                        ),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    // Try to load clock image from drawable, fallback to drawn clock
                    val clockPainter = runCatching {
                        painterResource(id = R.drawable.clock)
                    }.getOrNull()

                    if (clockPainter != null) {
                        // Show image from drawable if available
                        Image(
                            painter = clockPainter,
                            contentDescription = "Clock face",
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        // Fallback: Draw clock with Canvas
                        Canvas(
                            modifier = Modifier.fillMaxSize()
                        ) {
                            val center = Offset(size.width / 2, size.height / 2)
                            val radius = size.minDimension / 2 - 20

                            // Draw clock circle
                            drawCircle(
                                color = Color.Black,
                                radius = radius,
                                center = center,
                                style = Stroke(width = 6f)
                            )

                            // Draw hour numbers
                            val textPaint = Paint().apply {
                                color = android.graphics.Color.BLACK
                                textSize = 40f
                                textAlign = Paint.Align.CENTER
                            }

                            for (i in 1..12) {
                                val angle = (i * 30 - 90) * Math.PI / 180
                                val numberRadius = radius * 0.8f
                                val x = center.x + (numberRadius * cos(angle)).toFloat()
                                val y = center.y + (numberRadius * sin(angle)).toFloat() + 15

                                drawContext.canvas.nativeCanvas.drawText(
                                    i.toString(),
                                    x,
                                    y,
                                    textPaint
                                )
                            }

                            // Draw center dot
                            drawCircle(
                                color = Color.Black,
                                radius = 8f,
                                center = center
                            )
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

            // Drawing Canvas (overlay on clock)
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

            // Navigation Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                OutlinedButton(
                    onClick = onBack,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Previous")
                }

                Spacer(Modifier.width(16.dp))

                Button(
                    onClick = {
                        if (paths.isNotEmpty()) {
                            val bitmap = pathsToBitmap(paths, 800, 800)
                            onNext(bitmap)
                        }
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(56.dp),
                    enabled = paths.isNotEmpty(),
                    colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
                ) {
                    Text(
                        "Submit",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

private fun formatTime(seconds: Long): String {
    val mins = seconds / 60
    val secs = seconds % 60
    return String.format("%02d:%02d", mins, secs)
}