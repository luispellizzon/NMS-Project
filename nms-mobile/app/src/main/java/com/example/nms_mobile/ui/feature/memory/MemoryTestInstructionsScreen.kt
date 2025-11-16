package com.example.nms_mobile.ui.feature.memory

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.components.CustomTopAppBar

@Composable
fun MemoryTestInstructionsScreen(
    onStartTest: () -> Unit,
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            CustomTopAppBar(
                title = "Memory Test (MCQ Format)",
                onBack = onBack
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF5F5F5))
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Title
            Text(
                text = "Before you start, read carefully\nthe following instructions:",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Instructions List
            InstructionItem(
                text = "Read or listen carefully to each question before you answer."
            )

            InstructionItem(
                text = "You will see a sequence of numbers, a short math problem, or a number pattern."
            )

            InstructionItem(
                text = "Some tasks will require you to remember numbers in order or after solving a math problem."
            )

            InstructionItem(
                text = "Each question will have multiple-choice options. Tap or click the correct answer."
            )

            InstructionItem(
                text = "If you prefer, you can tap the speaker button to hear the question read aloud."
            )

            InstructionItem(
                text = "Each correct answer gives you points."
            )

            InstructionItem(
                text = "Tap the \"Next\" button to go to the next question."
            )

            InstructionItem(
                text = "You can go back an review your answers by tapping on the \"Previous\" button."
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Important Note Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFFFFF9C4) // Light yellow
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "Important",
                        tint = Color(0xFFF57C00), // Orange
                        modifier = Modifier.size(24.dp)
                    )

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Text(
                            text = "Important:",
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFF57C00),
                            fontSize = 16.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Please make sure you are in a quiet place. The assessment will take about 10-15 minutes to complete.",
                            color = Color.Black,
                            fontSize = 14.sp,
                            lineHeight = 20.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))
            Spacer(modifier = Modifier.height(24.dp))

            // Start Button
            Button(
                onClick = onStartTest,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = TealPrimary
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "Start",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
private fun InstructionItem(text: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.Start,
        verticalAlignment = Alignment.Top
    ) {
        Text(
            text = "•",
            fontSize = 20.sp,
            color = TealPrimary,
            modifier = Modifier.padding(end = 12.dp, top = 2.dp)
        )

        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium,
            color = Color.Gray,
            lineHeight = 22.sp,
            modifier = Modifier.weight(1f)
        )
    }
}