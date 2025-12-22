package com.example.nms_mobile.ui.feature.speech.results

import SpeechAssessmentDocument
import SpeechTaskType
import TaskContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nms_mobile.ui.Green
import com.example.nms_mobile.ui.Orange
import com.example.nms_mobile.ui.Red
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.White

/**
 * Screen showing detailed results of the speech assessment
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SpeechResultsScreen(
    assessment: SpeechAssessmentDocument?,
    onBack: () -> Unit,
    onRedoTest: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Speech Assessment Results") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = TealPrimary,
                    titleContentColor = White,
                    navigationIconContentColor = White
                )
            )
        }
    ) { padding ->
        if (assessment == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator()
                    Spacer(Modifier.height(16.dp))
                    Text("Loading results...")
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                // Total Score Card at the top
                TotalScoreCard(
                    totalScore = assessment.totalScore ?: 0,
                    maxScore = calculateMaxScore(assessment)
                )

                Spacer(Modifier.height(24.dp))

                Text(
                    text = "Task Results",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                // Display each task result
                val taskSequence = SpeechTaskType.getTaskSequence()
                taskSequence.forEach { taskType ->
                    val taskContent = assessment.content[taskType.taskId]
                    if (taskContent != null) {
                        TaskResultCard(
                            taskType = taskType,
                            taskContent = taskContent
                        )
                        Spacer(Modifier.height(12.dp))
                    }
                }

                Spacer(Modifier.height(24.dp))

                // Redo Test Button
                Button(
                    onClick = onRedoTest,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = TealPrimary
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "Redo Test",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = White
                    )
                }

                Spacer(Modifier.height(16.dp))
            }
        }
    }
}

@Composable
private fun TotalScoreCard(
    totalScore: Int,
    maxScore: Int
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = TealPrimary
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Total Score",
                style = MaterialTheme.typography.titleMedium,
                color = White.copy(alpha = 0.9f)
            )

            Spacer(Modifier.height(12.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "$totalScore",
                    style = MaterialTheme.typography.displayLarge.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 56.sp
                    ),
                    color = White
                )
                Text(
                    text = " / $maxScore",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.SemiBold
                    ),
                    color = White.copy(alpha = 0.8f)
                )
            }

            Spacer(Modifier.height(8.dp))

            // Progress bar
            val percentage = if (maxScore > 0) (totalScore.toFloat() / maxScore.toFloat()) else 0f
            LinearProgressIndicator(
                progress = { percentage },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp),
                color = White,
                trackColor = White.copy(alpha = 0.3f),
            )

            Spacer(Modifier.height(8.dp))

            Text(
                text = "${(percentage * 100).toInt()}%",
                style = MaterialTheme.typography.bodyMedium,
                color = White.copy(alpha = 0.9f)
            )
        }
    }
}

@Composable
private fun TaskResultCard(
    taskType: SpeechTaskType,
    taskContent: TaskContent
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFFF5F5F5)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Task Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = taskContent.taskName,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold
                    ),
                    color = Color(0xFF37474F)
                )

                // Score Badge
                ScoreBadge(
                    score = taskContent.result?.userScore ?: 0,
                    maxScore = taskContent.maxScore
                )
            }

            Spacer(Modifier.height(12.dp))

            // Question
            SectionLabel("Question:")
            Text(
                text = taskContent.question,
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFF546E7A),
                modifier = Modifier.padding(bottom = 12.dp)
            )

            // Expected Answer
            SectionLabel("Expected Answer:")
            if (taskContent.expectedAnswers.isNotEmpty()) {
                Text(
                    text = taskContent.expectedAnswers.joinToString(", "),
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF2E7D32),
                    modifier = Modifier.padding(bottom = 12.dp)
                )
            } else {
                Text(
                    text = "N/A",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
            }

            // User's Answer (Transcription)
            if (taskContent.result != null) {
                SectionLabel("Your Answer:")
                Text(
                    text = taskContent.result.transcription.ifEmpty { "No transcription available" },
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF37474F),
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                // Score achieved
                SectionLabel("Score:")
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val isCorrect = taskContent.result.userScore == taskContent.maxScore
                    Icon(
                        imageVector = if (isCorrect) Icons.Default.CheckCircle else Icons.Default.Close,
                        contentDescription = null,
                        tint = if (isCorrect) Color(0xFF4CAF50) else Color(0xFFF44336),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = "${taskContent.result.userScore} / ${taskContent.maxScore} points",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        ),
                        color = if (isCorrect) Color(0xFF4CAF50) else Color(0xFFF44336)
                    )
                }
            } else {
                Text(
                    text = "No response recorded",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray,
                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                )
            }
        }
    }
}

@Composable
private fun ScoreBadge(
    score: Int,
    maxScore: Int
) {
    val backgroundColor = when {
        score == maxScore -> Green // Green for perfect
        score >= maxScore * 0.5 -> Orange// Orange for partial
        else -> Red // Red for low
    }

    Surface(
        shape = RoundedCornerShape(8.dp),
        color = backgroundColor,
        modifier = Modifier.padding(4.dp)
    ) {
        Text(
            text = "$score / $maxScore",
            style = MaterialTheme.typography.labelLarge.copy(
                fontWeight = FontWeight.Bold
            ),
            color = White,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}

@Composable
private fun SectionLabel(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelLarge.copy(
            fontWeight = FontWeight.Bold
        ),
        color = Color(0xFF37474F),
        modifier = Modifier.padding(bottom = 4.dp)
    )
}

private fun calculateMaxScore(assessment: SpeechAssessmentDocument): Int {
    return assessment.content.values.sumOf { it.maxScore }
}