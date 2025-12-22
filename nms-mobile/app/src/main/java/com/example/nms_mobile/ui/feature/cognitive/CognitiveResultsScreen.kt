package com.example.nms_mobile.ui.feature.cognitive

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nms_mobile.data.CognitiveAssessment
import com.example.nms_mobile.data.CognitiveRepository
import com.example.nms_mobile.data.CognitiveTaskResult
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.components.CustomTopAppBar
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

/**
 * Screen to display Cognitive Assessment Results
 */
@Composable
fun CognitiveResultsScreen(
    onViewResults: () -> Unit,
    onBack: () -> Unit,
    onRedoTest: () -> Unit
) {
    val repository = remember { CognitiveRepository.instance }
    var assessment by remember { mutableStateOf<CognitiveAssessment?>(null) }
    var tasks by remember { mutableStateOf<List<CognitiveTaskResult>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()

    // Load assessment data
    LaunchedEffect(Unit) {
        scope.launch {
            try {
                val latestAssessment = repository.getMostRecentAssessment()
                assessment = latestAssessment

                latestAssessment?.let {
                    tasks = repository.getAssessmentTasks(it.id)
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                isLoading = false
            }
        }
    }

    Scaffold(
        topBar = {
            CustomTopAppBar(
                title = "Cognitive Test Results",
                onBack = onBack
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = TealPrimary)
            }
        } else if (assessment == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "No results available",
                        style = MaterialTheme.typography.titleLarge,
                        color = Color.Gray
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onRedoTest,
                        colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
                    ) {
                        Text("Take Test")
                    }
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFF5F5F5))
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Score Circle
                ScoreCircle(
                    score = assessment!!.totalScore,
                    maxScore = 6
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Status Card
                StatusCard(assessment = assessment!!)

                Spacer(modifier = Modifier.height(24.dp))

                // Task Results
                Text(
                    text = "Task Breakdown",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                TaskResultsList(tasks = tasks)

                Spacer(modifier = Modifier.height(24.dp))

                // Action Buttons
                Button(
                    onClick = onViewResults,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
                ) {
                    Text(
                        "View Results",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedButton(
                    onClick = onBack,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                ) {
                    Text(
                        "Back to Dashboard",
                        style = MaterialTheme.typography.titleMedium
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = onRedoTest,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
                ) {
                    Text(
                        "Retake Test",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }

            }
        }
    }
}

@Composable
private fun ScoreCircle(score: Int, maxScore: Int) {
    val percentage = (score.toFloat() / maxScore.toFloat() * 100).toInt()

    Surface(
        modifier = Modifier.size(200.dp),
        shape = CircleShape,
        color = when {
            percentage >= 80 -> Color(0xFF4CAF50).copy(alpha = 0.1f)
            percentage >= 50 -> Color(0xFFFFA726).copy(alpha = 0.1f)
            else -> Color(0xFFEF5350).copy(alpha = 0.1f)
        }
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "$score",
                style = MaterialTheme.typography.displayLarge,
                fontWeight = FontWeight.Bold,
                color = when {
                    percentage >= 80 -> Color(0xFF4CAF50)
                    percentage >= 50 -> Color(0xFFFFA726)
                    else -> Color(0xFFEF5350)
                },
                fontSize = 64.sp
            )
            Text(
                text = "out of $maxScore",
                style = MaterialTheme.typography.bodyLarge,
                color = Color.Gray
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "$percentage%",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = when {
                    percentage >= 80 -> Color(0xFF4CAF50)
                    percentage >= 50 -> Color(0xFFFFA726)
                    else -> Color(0xFFEF5350)
                }
            )
        }
    }
}

@Composable
private fun StatusCard(assessment: CognitiveAssessment) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            // Date
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Date Completed",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray
                )
                Text(
                    text = formatDate(assessment.completedAt ?: assessment.date),
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Divider()

            Spacer(modifier = Modifier.height(12.dp))

            // Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Status",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray
                )
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (assessment.state == "completed") Color(0xFF4CAF50).copy(alpha = 0.1f)
                    else Color(0xFFFFA726).copy(alpha = 0.1f)
                ) {
                    Text(
                        text = assessment.state.uppercase(),
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = if (assessment.state == "completed") Color(0xFF4CAF50)
                        else Color(0xFFFFA726)
                    )
                }
            }
        }
    }
}

@Composable
private fun TaskResultsList(tasks: List<CognitiveTaskResult>) {
    val taskNames = mapOf(
        "cube_drawing" to "Cube Drawing",
        "trail_making" to "Trail Making",
        "clock_drawing" to "Clock Selection",
        "animal_naming_0" to "Animal Naming - Lion",
        "animal_naming_1" to "Animal Naming - Camel",
        "animal_naming_2" to "Animal Naming - Rhino"
    )

    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        tasks.sortedBy {
            when (it.taskType) {
                "cube_drawing" -> 0
                "trail_making" -> 1
                "clock_drawing" -> 2
                "animal_naming_0" -> 3
                "animal_naming_1" -> 4
                "animal_naming_2" -> 5
                else -> 6
            }
        }.forEach { task ->
            TaskResultCard(
                taskName = taskNames[task.taskType] ?: task.taskType,
                passed = task.passed,
                score = task.score,
                duration = task.duration
            )
        }
    }
}

@Composable
private fun TaskResultCard(
    taskName: String,
    passed: Boolean,
    score: Int,
    duration: Long
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (passed) Color(0xFF4CAF50).copy(alpha = 0.05f)
            else Color(0xFFEF5350).copy(alpha = 0.05f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                // Icon
                Surface(
                    modifier = Modifier.size(40.dp),
                    shape = CircleShape,
                    color = if (passed) Color(0xFF4CAF50) else Color(0xFFEF5350)
                ) {
                    Icon(
                        imageVector = if (passed) Icons.Default.Check else Icons.Default.Close,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.padding(8.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(
                        text = taskName,
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "${formatDuration(duration)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }
            }

            // Score
            Text(
                text = "$score pt",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = if (passed) Color(0xFF4CAF50) else Color(0xFFEF5350)
            )
        }
    }
}

private fun formatDate(timestamp: com.google.firebase.Timestamp): String {
    val sdf = SimpleDateFormat("MMM dd, yyyy 'at' hh:mm a", Locale.getDefault())
    return sdf.format(timestamp.toDate())
}

private fun formatDuration(seconds: Long): String {
    return when {
        seconds < 60 -> "${seconds}s"
        seconds < 3600 -> "${seconds / 60}m ${seconds % 60}s"
        else -> "${seconds / 3600}h ${(seconds % 3600) / 60}m"
    }
}