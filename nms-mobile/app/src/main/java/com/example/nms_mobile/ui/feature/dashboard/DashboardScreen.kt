package com.example.nms_mobile.ui.feature.dashboard

import DashboardUiState
import SpeechAnalysisStatus
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nms_mobile.data.Patient
import com.example.nms_mobile.ui.BackgroundGray
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.White
import com.example.nms_mobile.ui.components.NmsTopAppBar


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    state: DashboardUiState,
    onOpenNews: () -> Unit,
    onOpenRiskAssessment: () -> Unit,
    onOpenSpeech: () -> Unit,
    onOpenMemory: () -> Unit,
    onOpenCognitive: () -> Unit,
    onLogoutClick: () -> Unit,
    onAddPatient: () -> Unit,  // NEW
    onSelectPatient: (Patient) -> Unit,  // NEW
    onDeselectPatient: () -> Unit  // NEW
) {
    Scaffold(
        topBar = {
            // Display the custom top bar with user info.
            NmsTopAppBar(
                greeting = state.greeting,
                displayName = state.displayName,
                onLogoutClick = onLogoutClick
            )
        }
    ) { padding ->
        // Main content area, allowing the user to scroll.
        Column(
            modifier = Modifier
                .padding(padding)
                .verticalScroll(rememberScrollState())
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
                state.role == "caregiver" && state.isManagingPatient && state.selectedPatient != null -> {
                    CaregiverManagingPatientView(
                        patient = state.selectedPatient,
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
                        onOpenCognitive = onOpenCognitive
                    )
                }
            }
        }
    }
}

    // NEW: Caregiver managing a patient view
    @Composable
    private fun CaregiverManagingPatientView(
        patient: Patient,
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
                    text = patient.fullName,
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
                title = "Lifestyle Questionary",
                onClick = onOpenRiskAssessment,
                modifier = Modifier
                    .weight(1f)
                    .height(180.dp),
                pendingColor = TealPrimary,
                isCompleted = patient.hasCompletedRiskAssessment
            )

            TestTile(
                title = "Speech",
                onClick = onOpenSpeech,
                modifier = Modifier
                    .weight(1f)
                    .height(180.dp),
                isCompleted = patient.hasCompletedSpeech
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
                isCompleted = patient.hasCompletedMemory
            )
            TestTile(
                title = "Cognitive",
                onClick = onOpenCognitive,
                modifier = Modifier
                    .weight(1f)
                    .height(140.dp),
                isCompleted = patient.hasCompletedCognitive
            )
        }
    }

    // NEW: Caregiver patient list view
    @Composable
    private fun CaregiverPatientListView(
        patients: List<Patient>,
        isLoading: Boolean,
        onAddPatient: () -> Unit,
        onSelectPatient: (Patient) -> Unit
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
                modifier = Modifier.fillMaxWidth().padding(32.dp),
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
        patients: List<Patient>,
        onStartPatient: (Patient) -> Unit
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
        patient: Patient,
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

            // Risk Level
            Text(
                text = patient.riskLevel,
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.Center,
                color = when (patient.riskLevel) {
                    "High" -> Color.Red
                    "Medium" -> Color(0xFFFF9800)
                    "Low" -> Color.Green
                    else -> Color.Gray
                },
                fontWeight = FontWeight.SemiBold,
                style = MaterialTheme.typography.bodySmall
            )

            // Speech Score
            Text(
                text = patient.speechScore?.toString() ?: "-",
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.Center,
                style = MaterialTheme.typography.bodyMedium
            )

            // Memory Score
            Text(
                text = patient.memoryScore?.toString() ?: "-",
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.Center,
                style = MaterialTheme.typography.bodyMedium
            )

            // Action Button
            Button(
                onClick = onStart,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Text("Start", fontSize = 12.sp)
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
        onOpenCognitive: () -> Unit
    ) {
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
                title = "Lifestyle Questionary",
                onClick = onOpenRiskAssessment,
                modifier = Modifier.weight(1f).height(180.dp),
                pendingColor = TealPrimary,
                isCompleted = state.isLifestyleQuestionaryCompleted
            )

            SpeechTestTile(
                onClick = onOpenSpeech,
                modifier = Modifier.weight(1f).height(180.dp),
                analysisStatus = state.speechAnalysisStatus,
                isCompleted = state.isSpeechAssessmentCompleted,
                userScore = state.speechUserScore,
                totalScore = state.speechTotalScore
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
                modifier = Modifier.weight(1f).height(140.dp)
            )
            TestTile(
                title = "Cognitive",
                onClick = onOpenCognitive,
                modifier = Modifier.weight(1f).height(140.dp)
            )
        }
    }
// Assessment Tile Component
@Composable
private fun TestTile(
    title: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    // Color used when the assessment is NOT completed. Default is gray.
    pendingColor: Color = Color(0xFF9E9E9E),
    isCompleted: Boolean = false,
) {
    // The color used when the assessment IS completed (fixed gray).
    val completedColor = Color(0xFF9E9E9E)

    // Decide the card's final color.
    val cardColor = if (isCompleted) {
        completedColor // Gray if complete
    } else {
        pendingColor // Teal or default gray if not complete
    }

    // Change the text if the assessment is completed.
    val displayText = if (isCompleted) "COMPLETE" else title

    // Stop click action if the assessment is completed.
    val clickAction: (() -> Unit)? = if (isCompleted) null else onClick

    ElevatedCard(
        // Clicks run only if clickAction is not null (i.e., not completed).
        onClick = { clickAction?.invoke() },
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
            Text(
                text = displayText,
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                color = Color.White
            )
        }
    }
}

// Special Speech Test Tile with status indicator and score display
@Composable
private fun SpeechTestTile(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    analysisStatus: SpeechAnalysisStatus,
    isCompleted: Boolean,
    userScore: Int?,
    totalScore: Int?
) {
    // Determine card appearance based on status
    val cardColor = when (analysisStatus) {
        SpeechAnalysisStatus.NOT_STARTED -> Color(0xFF9E9E9E) // Gray
        SpeechAnalysisStatus.PROCESSING -> Color(0xFFFF9800) // Orange
        SpeechAnalysisStatus.COMPLETED -> Color(0xFF4CAF50) // Green
        SpeechAnalysisStatus.ERROR -> Color(0xFFF44336) // Red
    }

    val displayText = when (analysisStatus) {
        SpeechAnalysisStatus.NOT_STARTED -> "Speech"
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
                    text = displayText,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = Color.White,
                    textAlign = TextAlign.Center
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