package com.example.nms_mobile.ui.feature.cognitive

import android.annotation.SuppressLint
import android.graphics.Paint
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.components.CustomTopAppBar
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.PI

/**
 * Task screen: Select the correct clock showing 11:10
 */
@Composable
fun ClockDrawingScreen(
    state: CognitiveUiState,
    onPlayInstruction: () -> Unit,
    elapsedTime: Long,
    onNext: (Int) -> Unit,
    onBack: () -> Unit
) {
    var selectedClock by remember { mutableStateOf<Int?>(null) }

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
        ) {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 24.dp, vertical = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Title
                Text(
                    text = "Select the correct clock",
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
                        IconButton(
                            onClick = onPlayInstruction,
                            modifier = Modifier
                                .size(48.dp)
                                .background(TealPrimary, CircleShape),
                            enabled = !state.isInstructionPlaying
                        ){
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                                contentDescription = "Play instructions",
                                tint = Color.White,
                                modifier = Modifier.padding(8.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Text(
                            text = "Select the clock that shows 11:10 (ten past eleven).",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.Black,
                            lineHeight = 20.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Timer
                Text(
                    text = "Time: ${formatClockTime(elapsedTime)}",
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color.Gray
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Three clock options
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Clock Option 1: 11:10 (CORRECT)
                    ClockOption(
                        clockNumber = 1,
                        hourAngle = 335.0,
                        minuteAngle = 60.0,
                        isSelected = selectedClock == 1,
                        onClick = { selectedClock = 1 }
                    )

                    // Clock Option 2: 10:11 (Wrong)
                    ClockOption(
                        clockNumber = 2,
                        hourAngle = 305.5,
                        minuteAngle = 66.0,
                        isSelected = selectedClock == 2,
                        onClick = { selectedClock = 2 }
                    )

                    // Clock Option 3: 2:10 (Wrong)
                    ClockOption(
                        clockNumber = 3,
                        hourAngle = 65.0,
                        minuteAngle = 60.0,
                        isSelected = selectedClock == 3,
                        onClick = { selectedClock = 3 }
                    )
                }
            }

            // Navigation Buttons - Fixed at bottom
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 16.dp),
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
                        selectedClock?.let { onNext(it) }
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(56.dp),
                    enabled = selectedClock != null,
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

@Composable
private fun ClockOption(
    clockNumber: Int,
    hourAngle: Double,
    minuteAngle: Double,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(140.dp)
            .clickable(onClick = onClick)
            .then(
                if (isSelected) {
                    Modifier.border(4.dp, TealPrimary, RoundedCornerShape(12.dp))
                } else {
                    Modifier
                }
            ),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) Color(0xFFE0F7FA) else Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Canvas(
                modifier = Modifier
                    .size(110.dp)
                    .weight(1f)
            ) {
                val center = Offset(size.width / 2, size.height / 2)
                val radius = size.minDimension / 2 - 10

                drawCircle(
                    color = Color.Black,
                    radius = radius,
                    center = center,
                    style = Stroke(width = 4f)
                )

                val textPaint = Paint().apply {
                    color = android.graphics.Color.BLACK
                    textSize = 28f
                    textAlign = Paint.Align.CENTER
                }

                for (i in 1..12) {
                    val angle = (i * 30 - 90) * PI / 180
                    val numberRadius = radius * 0.75f
                    val x = center.x + (numberRadius * cos(angle)).toFloat()
                    val y = center.y + (numberRadius * sin(angle)).toFloat() + 10

                    drawContext.canvas.nativeCanvas.drawText(
                        i.toString(),
                        x,
                        y,
                        textPaint
                    )
                }

                val hourRadians = (hourAngle - 90) * PI / 180
                val hourHandLength = radius * 0.5f
                val hourHandEnd = Offset(
                    center.x + (hourHandLength * cos(hourRadians)).toFloat(),
                    center.y + (hourHandLength * sin(hourRadians)).toFloat()
                )
                drawLine(
                    color = Color.Black,
                    start = center,
                    end = hourHandEnd,
                    strokeWidth = 8f
                )

                val minuteRadians = (minuteAngle - 90) * PI / 180
                val minuteHandLength = radius * 0.7f
                val minuteHandEnd = Offset(
                    center.x + (minuteHandLength * cos(minuteRadians)).toFloat(),
                    center.y + (minuteHandLength * sin(minuteRadians)).toFloat()
                )
                drawLine(
                    color = Color.Black,
                    start = center,
                    end = minuteHandEnd,
                    strokeWidth = 4f
                )

                drawCircle(
                    color = Color.Black,
                    radius = 6f,
                    center = center
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                RadioButton(
                    selected = isSelected,
                    onClick = onClick,
                    colors = RadioButtonDefaults.colors(
                        selectedColor = TealPrimary
                    )
                )
                Text(
                    text = "Clock $clockNumber",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                )
            }
        }
    }
}

@SuppressLint("DefaultLocale")
private fun formatClockTime(seconds: Long): String {
    val mins = seconds / 60
    val secs = seconds % 60
    return String.format("%02d:%02d", mins, secs)
}