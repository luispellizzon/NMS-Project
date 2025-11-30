package com.example.nms_mobile.ui.feature.cognitive

import android.annotation.SuppressLint
import androidx.compose.ui.graphics.nativeCanvas
import android.graphics.Bitmap
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.components.CustomTopAppBar
import kotlin.math.sqrt
import androidx.core.graphics.createBitmap

/**
 * Trail Making Test - Responsive Version (Supports any screen size)
 */
@Composable
fun TrailMakingScreen(
    state: CognitiveUiState,
    onPlayInstruction: () -> Unit,
    elapsedTime: Long,
    touchSequence: List<String>,
    expectedSequence: List<String>,
    onNodeTouched: (String) -> Unit,
    onNext: (Bitmap) -> Unit,
    onBack: () -> Unit
) {
    var connectedNodes by remember { mutableStateOf(listOf<String>()) }

    // Percentage-based coordinates (0f to 1f)
    val nodes = remember {
        listOf(
            Node("1", 0.10f, 0.35f),
            Node("A", 0.40f, 0.15f),
            Node("2", 0.75f, 0.45f),
            Node("B", 0.90f, 0.25f),
            Node("3", 0.55f, 0.65f),
            Node("C", 0.20f, 0.70f),
            Node("4", 0.85f, 0.85f),
            Node("D", 0.50f, 0.93f),
            Node("5", 0.25f, 0.55f),
            Node("E", 0.70f, 0.10f)
        )
    }

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
                .verticalScroll(rememberScrollState())
                .padding(padding)
                .padding(horizontal = 24.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            // Title
            Text(
                text = "Connect the path",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Instruction card
            InstructionCard(
                state = state,
                onPlayInstruction = onPlayInstruction
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Time: ${formatTime(elapsedTime)}",
                style = MaterialTheme.typography.bodyLarge,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Connected: ${touchSequence.size} / ${expectedSequence.size}",
                style = MaterialTheme.typography.bodyMedium,
                color = TealPrimary,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Scalable Canvas — Fixed aspect ratio
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(3f / 4f),
                colors = CardDefaults.cardColors(Color(0xFFF5F5F5)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .pointerInput(Unit) {
                            detectTapGestures { tapOffset ->
                                // Detect nearest node based on real converted coords
                                lastCanvasSize?.let { size ->
                                    val scaledNodes = nodes.associate {
                                        it.id to Offset(
                                            it.xPercent * size.width,
                                            it.yPercent * size.height
                                        )
                                    }

                                    scaledNodes.forEach { (id, pos) ->
                                        val dist = sqrt(
                                            (tapOffset.x - pos.x) * (tapOffset.x - pos.x) +
                                                    (tapOffset.y - pos.y) * (tapOffset.y - pos.y)
                                        )
                                        if (dist < size.width * 0.08f && !connectedNodes.contains(id)) {
                                            connectedNodes = connectedNodes + id
                                            onNodeTouched(id)
                                        }
                                    }
                                }
                            }
                        }
                ) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        lastCanvasSize = size

                        val scaledNodes = nodes.associate {
                            it.id to Offset(
                                it.xPercent * size.width,
                                it.yPercent * size.height
                            )
                        }
                        val radius = size.width * 0.065f
                        val textSize = size.width * 0.07f

                        // Draw connecting dashed lines
                        for (i in 0 until connectedNodes.size - 1) {
                            val a = scaledNodes[connectedNodes[i]]
                            val b = scaledNodes[connectedNodes[i + 1]]
                            if (a != null && b != null) drawLine(
                                color = TealPrimary,
                                start = a,
                                end = b,
                                strokeWidth = 4f,
                                pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 10f))
                            )
                        }

                        // Draw nodes
                        scaledNodes.forEach { (id, pos) ->
                            val index = connectedNodes.indexOf(id)
                            val isConnected = index != -1
                            val isCorrect = isConnected && expectedSequence.getOrNull(index) == id

                            val nodeColor = when {
                                isCorrect -> TealPrimary
                                isConnected -> TealPrimary
                                else -> Color.White
                            }

                            drawCircle(nodeColor, radius, pos)
                            drawCircle(
                                if (isConnected) TealPrimary else Color.Black,
                                radius,
                                pos,
                                style = Stroke(width = 3f)
                            )

                            drawContext.canvas.nativeCanvas.drawText(
                                id, pos.x, pos.y + radius * 0.35f,
                                android.graphics.Paint().apply {
                                    color = if (isConnected) android.graphics.Color.WHITE else android.graphics.Color.BLACK
                                    this.textSize = textSize
                                    textAlign = android.graphics.Paint.Align.CENTER
                                    isFakeBoldText = true
                                }
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Navigation buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                OutlinedButton(
                    onClick = onBack,
                    modifier = Modifier.weight(1f)
                ) { Text("Previous") }

                Spacer(modifier = Modifier.width(12.dp))

                Button(
                    onClick = {
                        val bitmap = createBitmap(900, 1200)
                        onNext(bitmap)
                    },
                    modifier = Modifier.weight(1f),
                    enabled = connectedNodes.size >= expectedSequence.size,
                    colors = ButtonDefaults.buttonColors(TealPrimary)
                ) { Text("Next") }
            }
        }
    }
}

/** Stores latest canvas size so tap detection can match scaled geometry */
private var lastCanvasSize by mutableStateOf<androidx.compose.ui.geometry.Size?>(null)

/** Instruction Card UI */
@Composable
private fun InstructionCard(
    state: CognitiveUiState,
    onPlayInstruction: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(Color(0xFFE0F2F1)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(
                modifier = Modifier.size(48.dp),
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFF00796B)
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
            }
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = "Draw a path by connecting numbers and letters in sequence (e.g., 1 → A → 2).",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Black,
                lineHeight = 20.sp
            )
        }
    }
}

/** Responsive Node (percent-based) */
data class Node(val id: String, val xPercent: Float, val yPercent: Float)

/** Format MM:SS */
@SuppressLint("DefaultLocale")
fun formatTime(seconds: Long): String {
    val mins = seconds / 60
    val secs = seconds % 60
    return String.format("%02d:%02d", mins, secs)
}