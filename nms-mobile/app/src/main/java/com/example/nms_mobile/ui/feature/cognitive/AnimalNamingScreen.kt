package com.example.nms_mobile.ui.feature.cognitive

import android.annotation.SuppressLint
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nms_mobile.R
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.components.CustomTopAppBar

/**
 * Animal Naming Task Screen
 * Shows 3 animals sequentially: Lion, Camel, Rhino
 */
@Composable
fun AnimalNamingScreen(
    state: CognitiveUiState,
    currentQuestion: Int,  // 0=Lion, 1=Camel, 2=Rhino
    onPlayInstruction: () -> Unit,
    elapsedTime: Long,
    onAnswerSelected: (String) -> Unit,
    onNext: () -> Unit,
    onSubmit: () -> Unit,
    onBack: () -> Unit
) {
    val questions = listOf(
        AnimalQuestion(
            number = 1,
            imageRes = R.drawable.lion,  // Lion
            options = listOf("Lion", "Tiger", "Leopard")
        ),
        AnimalQuestion(
            number = 2,
            imageRes = R.drawable.camel,  // Camel
            options = listOf("Horse", "Camel", "Donkey")
        ),
        AnimalQuestion(
            number = 3,
            imageRes = R.drawable.ryno,  // Rhino
            options = listOf("Rhino", "Hippo", "Elephant")
        )
    )

    val currentQ = questions[currentQuestion]
    var selectedAnswer by remember(currentQuestion) {
        mutableStateOf(state.animalAnswers[currentQuestion])
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
                .padding(padding)
                .padding(horizontal = 24.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Title
            Text(
                text = "Name the figure - ${currentQ.number}",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Instructions Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFFE0F2F1)
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(8.dp),
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

                    Spacer(modifier = Modifier.width(8.dp))

                    Text(
                        text = "Several pictures of animals will appear. Tap on the correct name for each one.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Black,
                        lineHeight = 20.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Animal Image
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(250.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color.White
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = currentQ.imageRes),
                        contentDescription = "Animal ${currentQ.number}",
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Timer
            Text(
                text = "Time: ${formatAnimalTime(elapsedTime)}",
                style = MaterialTheme.typography.bodyLarge,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Answer Options
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                currentQ.options.forEach { option ->
                    OutlinedButton(
                        onClick = {
                            selectedAnswer = option
                            onAnswerSelected(option)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = if (selectedAnswer == option) TealPrimary.copy(alpha = 0.1f) else Color.Transparent
                        ),
                        border = ButtonDefaults.outlinedButtonBorder.copy(
                            width = if (selectedAnswer == option) 2.dp else 1.dp,
                            brush = androidx.compose.ui.graphics.SolidColor(
                                if (selectedAnswer == option) TealPrimary else Color.Gray
                            )
                        )
                    ) {
                        Text(
                            text = option,
                            style = MaterialTheme.typography.bodyLarge,
                            color = if (selectedAnswer == option) TealPrimary else Color.Black,
                            fontWeight = if (selectedAnswer == option) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

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
                        if (currentQuestion < 2) {
                            onNext()
                        } else {
                            onSubmit()
                        }
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(40.dp),
                    enabled = selectedAnswer != null,
                    colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
                ) {
                    Text(
                        if (currentQuestion < 2) "Next" else "Submit",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

data class AnimalQuestion(
    val number: Int,
    val imageRes: Int,
    val options: List<String>
)

@SuppressLint("DefaultLocale")
private fun formatAnimalTime(seconds: Long): String {
    val mins = seconds / 60
    val secs = seconds % 60
    return String.format("%02d:%02d", mins, secs)
}