package com.example.nms_mobile.ui.feature.dashboard

import DashboardUiState
import SpeechAnalysisStatus
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material3.*
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nms_mobile.data.PatientReference
import com.example.nms_mobile.data.UserTasks
import com.example.nms_mobile.ui.BackgroundGray
import com.example.nms_mobile.ui.Green
import com.example.nms_mobile.ui.Orange
import com.example.nms_mobile.ui.Red
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.White
import com.example.nms_mobile.ui.components.NmsTopAppBar


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    state: DashboardUiState,
    onOpenNews: () -> Unit,
    onOpenRiskAssessment: () -> Unit,
    onOpenImageDescription: () -> Unit,
    onOpenSpeech: () -> Unit,
    onOpenMemory: () -> Unit,
    onOpenCognitive: () -> Unit,
    onOpenResults: () -> Unit,
    onLogoutClick: () -> Unit,
    onAddPatient: () -> Unit,
    onSelectPatient: (PatientReference) -> Unit,
    onDeselectPatient: () -> Unit,
    onFeedbackClick: () -> Unit,
    onOpenContactDoctor: () -> Unit
) {
    Log.d("Dashboard", state.profile.toString())
    Scaffold(
        topBar = {
            // Display the custom top bar with user info.
            NmsTopAppBar(
                greeting = state.greeting,
                displayName = state.displayName,

                onLogoutClick = onLogoutClick,
                onFeedbackClick = onFeedbackClick
            )
        }
    ) { padding ->
        // Main content area, allowing the user to scroll.
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {

            Spacer(Modifier.height(16.dp))

            // NEWS big teal card (Interactive link to news).
            ElevatedCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.elevatedCardColors(containerColor = TealPrimary),
                elevation = CardDefaults.elevatedCardElevation(defaultElevation = 6.dp),
                onClick = onOpenNews
            ) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        "NEWS",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.SemiBold),
                        color = Color.White
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // ROLES
            when {
                // CAREGIVER: Managing a specific patient
                state.role == "caregiver" && state.isManagingPatient && state.selectedPatientProfile != null -> {
                    CaregiverManagingPatientView(
                        patientProfile = state.selectedPatientProfile,
                        onBack = onDeselectPatient,
                        onOpenRiskAssessment = onOpenRiskAssessment,
                        onOpenSpeech = onOpenSpeech,
                        onOpenMemory = onOpenMemory,
                        onOpenCognitive = onOpenCognitive
                    )
                }

                // CAREGIVER: Viewing patient list
                state.role == "caregiver" -> {
                    CaregiverPatientListView(
                        patients = state.patients,
                        isLoading = state.isLoadingPatients,
                        onAddPatient = onAddPatient,
                        onSelectPatient = onSelectPatient
                    )
                }

                // PATIENT: Show assessment tiles
                state.role == "patient" -> {
                    PatientAssessmentsView(
                        state = state,
                        onOpenRiskAssessment = onOpenRiskAssessment,
                        onOpenSpeech = onOpenSpeech,
                        onOpenMemory = onOpenMemory,
                        onOpenCognitive = onOpenCognitive,
                        onOpenImageDescription = onOpenImageDescription,
                        onOpenResults = onOpenResults,
                        onOpenContactDoctor = onOpenContactDoctor
                    )
                }
            }
        }
    }
}

    // NEW: Caregiver managing a patient view
    @Composable
    private fun CaregiverManagingPatientView(
        patientProfile: com.example.nms_mobile.data.UserProfile,
        onBack: () -> Unit,
        onOpenRiskAssessment: () -> Unit,
        onOpenSpeech: () -> Unit,
        onOpenMemory: () -> Unit,
        onOpenCognitive: () -> Unit
    ) {
        // Back button
        OutlinedButton(
            onClick = onBack,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Default.ArrowBack, "Back to patient list")
            Spacer(Modifier.width(8.dp))
            Text("Back to Patient List")
        }

        Spacer(Modifier.height(16.dp))

        // Patient name banner
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = TealPrimary.copy(alpha = 0.1f))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Managing Assessments For:",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = patientProfile.fullName,
                    style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                    color = TealPrimary
                )
            }
        }

        Spacer(Modifier.height(16.dp))

        // Show assessment tiles (same as patient view)
        Text(
            text = "Assessments and Scores",
            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.SemiBold),
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            TestTile(
                title = "Lifestyle",
                onClick = onOpenRiskAssessment,
                modifier = Modifier
                    .weight(1f)
                    .height(180.dp),
                pendingColor = TealPrimary,
                isCompleted = patientProfile.hasCompletedRiskAssessment
            )

            TestTile(
                title = "Speech",
                onClick = onOpenSpeech,
                modifier = Modifier
                    .weight(1f)
                    .height(180.dp),
                isCompleted = patientProfile.hasCompletedSpeechAssessment
            )
        }

        Spacer(Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            TestTile(
                title = "Memory",
                onClick = onOpenMemory,
                modifier = Modifier
                    .weight(1f)
                    .height(140.dp),
                isCompleted = patientProfile.hasCompletedMemoryAssessment
            )
            TestTile(
                title = "Cognitive",
                onClick = onOpenCognitive,
                modifier = Modifier
                    .weight(1f)
                    .height(140.dp),
                isCompleted = patientProfile.hasCompletedCognitiveAssessment
            )
        }
    }

    // NEW: Caregiver patient list view
    @Composable
    private fun CaregiverPatientListView(
        patients: List<PatientReference>,
        isLoading: Boolean,
        onAddPatient: () -> Unit,
        onSelectPatient: (PatientReference) -> Unit
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "List of Patients",
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.SemiBold)
            )

            Button(
                onClick = onAddPatient,
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
            ) {
                Text("Add patient")
            }
        }

        Spacer(Modifier.height(16.dp))

        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (patients.isEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = BackgroundGray, contentColor = White )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "No patients yet",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.Gray
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = "Click 'Add patient' to register your first patient",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray,
                        textAlign = TextAlign.Center
                    )
                }
            }
        } else {
            PatientTable(
                patients = patients,
                onStartPatient = onSelectPatient
            )
        }
    }

    // NEW: Patient table
    @Composable
    private fun PatientTable(
        patients: List<PatientReference>,
        onStartPatient: (PatientReference) -> Unit
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Table Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(TealPrimary.copy(alpha = 0.1f))
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Name", fontWeight = FontWeight.Bold, modifier = Modifier.weight(1.5f), fontSize = 10.sp)
                    Spacer(modifier = Modifier.weight(1f))
                    Text(
                        "Risk",
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f),
                        textAlign = TextAlign.Center,
                        fontSize = 10.sp
                    )
                    Text(
                        "Speech",
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f),
                        textAlign = TextAlign.Center,
                        fontSize = 10.sp
                    )
                    Text(
                        "Memory",
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f),
                        textAlign = TextAlign.Center,
                        fontSize = 10.sp
                    )
                    Spacer(modifier = Modifier.weight(1f))
                }

                Divider()

                // Table Rows
                patients.forEach { patient ->
                    PatientRow(
                        patient = patient,
                        onStart = { onStartPatient(patient) }
                    )
                    Divider()
                }
            }
        }
    }

    // NEW: Patient table row
    @Composable
    private fun PatientRow(
        patient: PatientReference,
        onStart: () -> Unit
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Name
            Text(
                text = patient.fullName,
                modifier = Modifier.weight(1.5f),
                style = MaterialTheme.typography.bodyMedium
            )

            // Date of Birth (simplified display)
            Text(
                text = patient.dateOfBirth,
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.Center,
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray
            )

            // Email or placeholder
            Text(
                text = patient.email?.take(15) ?: "-",
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.Center,
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray
            )

            // Action Button
            Button(
                onClick = onStart,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Text("Manage", fontSize = 12.sp)
            }
        }
    }

    // EXISTING: Patient assessments view (keep as is)
    @Composable
private fun PatientAssessmentsView(
        state: DashboardUiState,
        onOpenRiskAssessment: () -> Unit,
        onOpenSpeech: () -> Unit,
        onOpenMemory: () -> Unit,
        onOpenCognitive: () -> Unit,
        onOpenImageDescription: () -> Unit,
        onOpenResults: () -> Unit,
        onOpenContactDoctor: () -> Unit = {}
    ) {
        var showWarning by remember { mutableStateOf(false) }
        var prevTask by remember { mutableStateOf("") }
        var currTask by remember { mutableStateOf("") }
        if (showWarning) {
            MessageDialog(
                prevTask,
                currTask,
                onDismiss = { showWarning = false }
            )
        }
        Text(
            text = "Assessments and Scores",
            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.SemiBold),
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(12.dp))
        Column( modifier = Modifier.fillMaxWidth()){
            Column(modifier = Modifier.fillMaxWidth()){
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    TestTile(
                        title = "Lifestyle",
                        onClick = onOpenRiskAssessment,
                        modifier = Modifier
                            .weight(1f)
                            .height(180.dp),
                        pendingColor = if (state.currentTask != "risk_assessment") Color.LightGray else TealPrimary,
                        isCompleted = state.hasCompletedRiskAssessment
                    )

                    if(state.currentTask == UserTasks.IMAGE_DESCRIPTION.taskName || state.currentTask ==  UserTasks.RISK_ASSESSMENT.taskName){
                        TestTile(
                            title = "Image Description",
                            onClick = {
                                if (state.currentTask == UserTasks.IMAGE_DESCRIPTION.taskName ||
                                    state.hasCompletedRiskAssessment == true
                                ) {
                                    onOpenImageDescription()
                                } else {
                                    currTask = "Image Description"
                                    prevTask = "Lifestyle Questionnaire"
                                    showWarning = true
                                }
                            },
                            modifier = Modifier
                                .weight(1f)
                                .height(180.dp),
                            pendingColor = if (state.currentTask != UserTasks.IMAGE_DESCRIPTION.taskName ) Color.LightGray else TealPrimary,
                            isCompleted = state.hasCompletedImageDescription
                        )
                    } else {
                        SpeechTestTile(
                            onClick = onOpenSpeech,
                            modifier = Modifier
                                .weight(1f)
                                .height(180.dp),
                            analysisStatus = state.speechAnalysisStatus,
                            userScore = state.speechUserScore,
                            totalScore = state.speechTotalScore
                        )
                    }
                }

                Spacer(Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    TestTile(
                        title = "Memory",
                        onClick = {
                                if (state.currentTask == UserTasks.MEMORY_ASSESSMENT.taskName || state.hasCompletedMemoryAssessment == true) {
                                    onOpenMemory()
                                } else {
                                    currTask = "Memory Assessment"
                                    prevTask = if (state.currentTask == UserTasks.IMAGE_DESCRIPTION.taskName) "Image Description Assessment" else "Speech Assessment"
                                    showWarning = true
                                }
                            },
                        pendingColor = if (state.currentTask != UserTasks.MEMORY_ASSESSMENT.taskName ) Color.LightGray else TealPrimary,
                        modifier = Modifier
                            .weight(1f)
                            .height(140.dp),
                        isCompleted = state.hasCompletedMemoryAssessment
                    )
                    TestTile(
                        title = "Cognitive",
                        onClick = {
                            if (state.currentTask == UserTasks.COGNITIVE_ASSESSMENT.taskName || state.hasCompletedMemoryAssessment == true) {
                                onOpenCognitive()
                            } else {
                                currTask = "Cognitive Assessment"
                                prevTask = "Memory Assessment"
                                showWarning = true
                            }
                        },
                        pendingColor = if (state.currentTask != UserTasks.COGNITIVE_ASSESSMENT.taskName) Color.LightGray else TealPrimary,
                        modifier = Modifier
                            .weight(1f)
                            .height(140.dp),
                        isCompleted = state.hasCompletedCognitiveAssessment

                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {

                if(state.currentTask == UserTasks.COMPLETED.taskName ){
                    ResultTile(
                        title = "Dementia Level",
                        content = if (state.profile?.hasPaidForResults == true)
                           ""
                        else
                            "Pending Payment...",
                        onClick = onOpenResults,
                        pendingColor = Color.Magenta,
                        modifier = Modifier
                            .fillMaxWidth()
                            ,
                        isCompleted = state.hasCompletedAiAnalysis
                    )
                }
            }
            Spacer(Modifier.height(12.dp))

            // Contact Doctor Tile - Always available
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                TestTile(
                    title = "Contact Doctor",
                    onClick = onOpenContactDoctor,
                    modifier = Modifier
                        .weight(1f)
                        .height(140.dp),
                    pendingColor = TealPrimary,
                    isCompleted = false
                )
                Spacer(modifier = Modifier.weight(1f))
            }
        }
    }
@Composable
private fun ResultTile(
    title: String,
    content: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    pendingColor: Color = Color.LightGray,
    isCompleted: Boolean? = false,
) {
    val completedColor = Green

    val cardColor = if (isCompleted!!) {
        completedColor
    } else {
        pendingColor
    }

    ElevatedCard(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = cardColor),
        elevation = CardDefaults.elevatedCardElevation(6.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(modifier = Modifier
                .fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center){
                if(isCompleted){
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(32.dp)
                    )
                    Spacer(Modifier.height(8.dp))
                }
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = Color.White
                )
                Spacer(Modifier.height(8.dp))
                if(content != "") {
                    Text(
                    text = content,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = Color.White
                )
                Spacer(Modifier.height(8.dp))
                }

                Text(
                    text = "Click here to view results",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.SemiBold,
                        textDecoration = TextDecoration.Underline
                    ),
                    color = Color.White
                )
            }
        }
    }
}
@Composable
private fun TestTile(
    title: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    pendingColor: Color = Color.LightGray,
    isCompleted: Boolean? = false,
) {
    // The color used when the assessment IS completed (fixed gray).
    val completedColor = Green

    // Decide the card's final color.
    val cardColor = if (isCompleted!!) {
        completedColor
    } else {
        pendingColor
    }

    // Change the text if the assessment is completed.


    // Stop click action if the assessment is completed.
//    val clickAction: (() -> Unit)? = if (isCompleted) null else onClick
//    val clickAction: (() -> Unit)? = if (null) null else onClick

    ElevatedCard(
        // Clicks run only if clickAction is not null (i.e., not completed).
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        // Apply the chosen color.
        colors = CardDefaults.elevatedCardColors(containerColor = cardColor),
        elevation = CardDefaults.elevatedCardElevation(6.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(modifier = Modifier
                .fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center){
                if(isCompleted){
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(Modifier.height(8.dp))
            }
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = Color.White
                )
                Spacer(Modifier.height(8.dp))
                if(!isCompleted){
                    Text(
                        text = "Status: Pending...",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                        color = Color.White
                    )
                }
            }
        }
    }
}

// Special Speech Test Tile with status indicator and score display
@Composable
private fun SpeechTestTile(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    analysisStatus: SpeechAnalysisStatus,
    userScore: Int?,
    totalScore: Int?
) {
    // Determine card appearance based on status
    val cardColor = when (analysisStatus) {
        SpeechAnalysisStatus.NOT_STARTED -> TealPrimary // Gray
        SpeechAnalysisStatus.PROCESSING -> Orange // Orange
        SpeechAnalysisStatus.COMPLETED -> Green // Green
        SpeechAnalysisStatus.ERROR -> Red // Red
    }

    val displayText = when (analysisStatus) {
        SpeechAnalysisStatus.NOT_STARTED -> "Pending"
        SpeechAnalysisStatus.PROCESSING -> "Analyzing..."
        SpeechAnalysisStatus.COMPLETED -> "View Results"
        SpeechAnalysisStatus.ERROR -> "Error"
    }

    val icon = when (analysisStatus) {
        SpeechAnalysisStatus.PROCESSING -> Icons.Default.AccessTime
        SpeechAnalysisStatus.COMPLETED -> Icons.Default.CheckCircle
        SpeechAnalysisStatus.ERROR -> Icons.Default.Error
        else -> null
    }

    // Disable click when processing
    val clickEnabled = analysisStatus != SpeechAnalysisStatus.PROCESSING

    ElevatedCard(
        onClick = { if (clickEnabled) onClick() },
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = cardColor),
        elevation = CardDefaults.elevatedCardElevation(6.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Show icon if applicable
                if (icon != null) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(32.dp)
                    )
                    Spacer(Modifier.height(8.dp))
                }

                Text(
                    text = "Speech",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = Color.White,
                    textAlign = TextAlign.Center
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "Status: $displayText",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                    color = Color.White
                )

                // Show score when analysis is completed
                if (analysisStatus == SpeechAnalysisStatus.COMPLETED && userScore != null && totalScore != null) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = "$userScore / $totalScore",
                        style = MaterialTheme.typography.headlineSmall.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 24.sp
                        ),
                        color = Color.White
                    )
                }

                // Show additional info for processing
                if (analysisStatus == SpeechAnalysisStatus.PROCESSING) {
                    Spacer(Modifier.height(8.dp))
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                }
            }
        }
    }
}

@Composable
fun MessageDialog(
    prevTask: String,
    currTask: String,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Warning") },
        text = { Text("Complete $prevTask before starting $currTask!") },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("OK")
            }
        }
    )
}
