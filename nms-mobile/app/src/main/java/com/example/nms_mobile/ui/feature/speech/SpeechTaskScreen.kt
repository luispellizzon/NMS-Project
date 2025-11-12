package com.example.nms_mobile.ui.feature.speech

import SpeechProgressState
import SpeechTaskType
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.White

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SpeechTaskScreen(
    state: SpeechTaskUiState,
    onPlayInstruction: () -> Unit,
    onStartRecording: () -> Unit,
    onStopRecording: () -> Unit,
    onPlayRecording: () -> Unit,
    onRestartPlayback: () -> Unit,
    onPausePlayback: () -> Unit,
    onResumePlayback: () -> Unit,
    onRepeatRecording: () -> Unit,
    onSubmitTask: () -> Unit,
    onBack: () -> Unit
) {

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Speech Assessment") },
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
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (state.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center)
                )
            }
            else if (state.isCompleted){
                Column(){
                    Text("Assessment Completed")
                }
            }else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Progress indicator
                    ProgressSection(state.progressState)

                    Spacer(Modifier.height(24.dp))

                    // Task title
                    Text(
                        text = state.currentTask.displayName,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )

                    Spacer(Modifier.height(16.dp))

                    // Task-specific instruction display
                    InstructionSection(
                        taskType = state.currentTask,
                        isPlaying = state.isInstructionPlaying,
                        onPlayInstruction = onPlayInstruction
                    )

                    Spacer(Modifier.height(32.dp))

                    // Recording section
                    RecordingSection(
                        state = state,
                        onStartRecording = onStartRecording,
                        onStopRecording = onStopRecording
                    )

                    Spacer(Modifier.height(24.dp))

                    // Review section (only shown after recording)
                    if (state.isReviewMode) {
                        ReviewSection(
                            state = state,
                            onPlayRecording = onPlayRecording,
                            onPausePlayback = onPausePlayback,
                            onResumePlayback = onResumePlayback,
                            onRepeatRecording = onRestartPlayback,
                            onRestartRecording = onRepeatRecording,
                            onSubmitTask = onSubmitTask
                        )
                    }

                    // Error display
                    if (state.error != null) {
                        Spacer(Modifier.height(16.dp))
                        Text(
                            text = state.error,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyMedium,
                            textAlign = TextAlign.Center
                        )
                    }

                    // Upload progress
                    if (state.isUploading) {
                        Spacer(Modifier.height(24.dp))
                        UploadProgressSection(state.uploadProgress)
                    }
                }
            }
        }
    }
}

@Composable
private fun ProgressSection(progressState: SpeechProgressState) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = "Task ${progressState.completedTasks + 1} of ${progressState.totalTasks}",
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = FontWeight.SemiBold
        )

        Spacer(Modifier.height(8.dp))

        LinearProgressIndicator(
            progress = progressState.progressPercentage / 100f,
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(MaterialTheme.shapes.small),
            color = TealPrimary,
            trackColor = Color.LightGray
        )

        Spacer(Modifier.height(4.dp))

        Text(
            text = "${progressState.progressPercentage}% Complete",
            style = MaterialTheme.typography.bodySmall,
            color = Color.Gray
        )
    }
}

@Composable
private fun InstructionSection(
    taskType: SpeechTaskType,
    isPlaying: Boolean,
    onPlayInstruction: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = TealPrimary.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Volume icon button to play instruction
            IconButton(
                onClick = onPlayInstruction,
                modifier = Modifier
                    .size(64.dp)
                    .background(TealPrimary, CircleShape),
                enabled = !isPlaying
            ) {
                Icon(
                    imageVector = Icons.Default.VolumeUp,
                    contentDescription = "Play instruction",
                    tint = White,
                    modifier = Modifier.size(32.dp)
                )
            }

            Spacer(Modifier.height(12.dp))

            Text(
                text = taskType.instruction,
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 8.dp)
            )

            // Show specific guidance based on task type
            Spacer(Modifier.height(8.dp))

            when (taskType) {
                SpeechTaskType.WORD_RECALL_INITIAL-> {
                    WordRecallGuidance(taskType.expectedWords)
                }
                SpeechTaskType.WORD_RECALL_FINAL-> {
                    WordRecallGuidance(taskType.expectedWords, false)
                }
                SpeechTaskType.LOCALIZATION -> {
                    LocalizationGuidance()
                }
                SpeechTaskType.REPEAT_ACTION -> {
                    RepeatActionGuidance()
                }
                SpeechTaskType.ORIENTATION -> {
                    OrientationGuidance()
                }
            }
        }
    }
}

@Composable
private fun WordRecallGuidance(words: List<String>, showExpectedWords: Boolean = true) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth()
    ) {
        Divider(modifier = Modifier.padding(vertical = 8.dp))

        if (showExpectedWords) {
            Text(
                text = "Words to remember:",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(Modifier.height(8.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                words.forEach { word ->
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(
                            containerColor = TealPrimary.copy(alpha = 0.15f)
                        )
                    ) {
                        Text(
                            text = word,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun LocalizationGuidance() {
    Column(modifier = Modifier.fillMaxWidth()) {
        Divider(modifier = Modifier.padding(vertical = 8.dp))

        Text(
            text = "Please tell me:",
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Bold
        )

        Spacer(Modifier.height(8.dp))

        val items = listOf("Year", "Season", "Date", "Day of the Week", "Today's Date")
        items.forEach { item ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.CheckCircleOutline,
                    contentDescription = null,
                    tint = TealPrimary,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text = item,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
}

@Composable
private fun RepeatActionGuidance() {
    Column(modifier = Modifier.fillMaxWidth()) {
        Divider(modifier = Modifier.padding(vertical = 8.dp))

        Text(
            text = "Listen carefully and repeat exactly:",
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun OrientationGuidance() {
    Column(modifier = Modifier.fillMaxWidth()) {
        Divider(modifier = Modifier.padding(vertical = 8.dp))

        val items = listOf(listOf("Apple", "Tuna", "Chicken"), listOf("Fish", "Banana", "Lamb"), listOf("Beef", "Steak", "Orange"), listOf("Grapes", "Rice", "Lettuce"), listOf("Cookie", "Pineapple", "Beans"))

        items.forEach{subList->
            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ){
                subList.forEach { word ->
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(
                            containerColor = TealPrimary.copy(alpha = 0.15f),
                        ),
                        border = BorderStroke(1.dp, TealPrimary)
                    ) {
                        Text(
                            text = word,
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp)
                        )
                    }
                }
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun RecordingSection(
    state: SpeechTaskUiState,
    onStartRecording: () -> Unit,
    onStopRecording: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth()
    ) {
        when (state.recordingState) {
            RecordingState.IDLE -> {
                Button(
                    onClick = onStartRecording,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = TealPrimary
                    )
                ) {
                    Icon(Icons.Default.Mic, "Start Recording", tint=White)
                    Spacer(Modifier.width(8.dp))
                    Text("Start Recording", fontSize = MaterialTheme.typography.titleMedium.fontSize, color=White)
                }
            }

            RecordingState.RECORDING -> {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Recording indicator
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .clip(CircleShape)
                                .background(Color.Red)
                        )
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text = "Recording in progress...",
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Bold,
                            color = White
                        )
                    }

                    Spacer(Modifier.height(16.dp))

                    // Duration display
                    Text(
                        text = formatDuration(state.duration),
                        style = MaterialTheme.typography.displaySmall,
                        fontWeight = FontWeight.Bold,
                        color = White
                    )

                    Spacer(Modifier.height(16.dp))

                    // Stop button
                    Button(
                        onClick = onStopRecording,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color.Red
                        )
                    ) {
                        Icon(Icons.Default.Stop, "Stop Recording", tint = White)
                        Spacer(Modifier.width(8.dp))
                        Text("Stop Recording", fontSize = MaterialTheme.typography.titleMedium.fontSize, color = White)
                    }
                }
            }

            else -> {
                // Handle other states if needed
            }
        }
    }
}
@Composable
private fun ReviewSection(
    state: SpeechTaskUiState,
    onPlayRecording: () -> Unit,
    onPausePlayback: () -> Unit,
    onResumePlayback: () -> Unit,
    onRepeatRecording: () -> Unit,
    onRestartRecording: () -> Unit,
    onSubmitTask: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFFF5F5F5)
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Review Your Recording",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )

                // Restart button
                IconButton(onClick = onRepeatRecording) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Restart",
                        tint = Color(0xFF00796B)
                    )
                }
            }
            Spacer(Modifier.height(16.dp))

            // Playback progress
            val progress = if (state.playbackDuration > 0) {
                state.playbackPosition.toFloat() / state.playbackDuration.toFloat()
            } else 0f
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = Color(0xFF00796B),
                trackColor = Color(0xFFE0E0E0)
            )
            Spacer(modifier = Modifier.height(8.dp))

            // Time labels
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = formatMilliseconds(state.playbackPosition),
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
                Text(
                    text = formatMilliseconds(state.playbackDuration),
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }
            Spacer(modifier = Modifier.height(12.dp))

            // Play/Pause button
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly, verticalAlignment = Alignment.CenterVertically) {
                Button(
                    onClick = {
                        if (state.isPlayingRecording) onPausePlayback() else {
                            if (state.playbackPosition > 0) onResumePlayback() else onPlayRecording()
                        }
                        if(state.playbackPosition == state.playbackDuration){
                            onRepeatRecording()
                        }
                    },
                    modifier = Modifier
                        .height(44.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF00796B)
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(
                        if (state.isPlayingRecording) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = if (state.isPlayingRecording) "Pause" else "Play",
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        if (state.isPlayingRecording) "Pause" else "Play",
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Re-record button
                OutlinedButton(
                    onClick = onRestartRecording,
                    modifier = Modifier
                        .height(44.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Color(0xFF00796B)
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = null,
                        tint = Color(0xFF00796B)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Re-record",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(Modifier.height(24.dp))

            // Previous and Next buttons
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                // Submit/Next button
                Button(
                    onClick = onSubmitTask,
                    modifier = Modifier
                        .weight(1f)
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = TealPrimary
                    )
                ) {
                    Text("Next", fontSize = MaterialTheme.typography.titleMedium.fontSize, color = White)
                    Spacer(Modifier.width(4.dp))
                    Icon(Icons.Default.ArrowForward, "Next", tint = White)
                }
            }
        }
    }
}

@Composable
private fun UploadProgressSection(progress: Int) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = "Uploading...",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        Spacer(Modifier.height(8.dp))

        LinearProgressIndicator(
            progress = progress / 100f,
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp),
            color = TealPrimary
        )

        Spacer(Modifier.height(4.dp))

        Text(
            text = "$progress%",
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

private fun formatDuration(seconds: Long): String {
    val mins = seconds / 60
    val secs = seconds % 60
    return String.format("%01d:%02d", mins, secs)
}

private fun formatMilliseconds(ms: Int): String {
    val seconds = ms / 1000
    val mins = seconds / 60
    val secs = seconds % 60
    return String.format("%01d:%02d", mins, secs)
}