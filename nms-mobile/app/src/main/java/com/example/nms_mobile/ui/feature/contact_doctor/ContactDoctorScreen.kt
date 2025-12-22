package com.example.nms_mobile.ui.feature.contact_doctor

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Home
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.nms_mobile.ui.TealPrimary

/**
 * Contact Doctor Screen - Allows users to send messages to doctors
 *
 * Features:
 * - Dropdown to select a doctor from Firebase
 * - Message input field (required)
 * - Checkbox to attach test results
 * - Send button with validation
 *
 * @param state Current UI state from ViewModel
 * @param onDoctorSelected Callback when a doctor is selected from dropdown
 * @param onMessageChange Callback when message text changes
 * @param onSendTestResultsChange Callback when checkbox state changes
 * @param onSendClick Callback when send button is clicked
 * @param onBack Callback when back button is pressed
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ContactDoctorScreen(
    state: ContactDoctorUiState,
    onDoctorSelected: (Doctor) -> Unit,
    onMessageChange: (String) -> Unit,
    onSendTestResultsChange: (Boolean) -> Unit,
    onSendClick: () -> Unit,
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Contact Doctor",
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = TealPrimary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {

            // Header text
            Text(
                text = "Send a message to your doctor",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Show success message if message was sent
            if (state.successMessage != null) {
                // Success card
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = TealPrimary.copy(alpha = 0.1f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Home,
                            contentDescription = null,
                            tint = TealPrimary,
                            modifier = Modifier.size(64.dp)
                        )

                        Text(
                            text = state.successMessage,
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = TealPrimary,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Text(
                            text = "Your message has been sent successfully. The doctor will review it shortly.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Back to Home button
                Button(
                    onClick = onBack,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = TealPrimary
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.Home,
                        contentDescription = null,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Back to Home",
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Bold
                    )
                }
            } else {
                // Show form if message hasn't been sent yet

                // Doctor selection dropdown
                DoctorDropdown(
                    doctors = state.doctors,
                    selectedDoctor = state.selectedDoctor,
                    isLoading = state.isLoadingDoctors,
                    onDoctorSelected = onDoctorSelected
                )

                // Message input field
                OutlinedTextField(
                    value = state.message,
                    onValueChange = onMessageChange,
                    label = { Text("Message") },
                    placeholder = { Text("Write your message here...") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    maxLines = 10,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TealPrimary,
                        focusedLabelColor = TealPrimary,
                        cursorColor = TealPrimary
                    ),
                    isError = state.messageError != null
                )

                // Error message for message field
                if (state.messageError != null) {
                    Text(
                        text = state.messageError,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Checkbox for sending test results
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = state.sendTestResults,
                        onCheckedChange = onSendTestResultsChange,
                        colors = CheckboxDefaults.colors(
                            checkedColor = TealPrimary,
                            uncheckedColor = TealPrimary.copy(alpha = 0.6f)
                        )
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Include my test results",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Error message (general)
                if (state.errorMessage != null) {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = state.errorMessage,
                            modifier = Modifier.padding(16.dp),
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Send button
                Button(
                    onClick = onSendClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = TealPrimary
                    ),
                    enabled = !state.isSending && state.selectedDoctor != null
                ) {
                    if (state.isSending) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            text = "Send Message",
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

/**
 * Dropdown menu to select a doctor
 *
 * @param doctors List of available doctors
 * @param selectedDoctor Currently selected doctor
 * @param isLoading Whether doctors are being loaded from Firebase
 * @param onDoctorSelected Callback when a doctor is selected
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DoctorDropdown(
    doctors: List<Doctor>,
    selectedDoctor: Doctor?,
    isLoading: Boolean,
    onDoctorSelected: (Doctor) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "Select Doctor",
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(bottom = 8.dp)
        )

        ExposedDropdownMenuBox(
            expanded = expanded,
            onExpandedChange = { expanded = !expanded && !isLoading }
        ) {
            OutlinedTextField(
                value = selectedDoctor?.name ?: "Select a doctor",
                onValueChange = {},
                readOnly = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor(),
                trailingIcon = {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.dp,
                            color = TealPrimary
                        )
                    } else {
                        ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded)
                    }
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = TealPrimary,
                    unfocusedBorderColor = TealPrimary.copy(alpha = 0.6f)
                ),
                enabled = !isLoading
            )

            ExposedDropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false }
            ) {
                if (doctors.isEmpty()) {
                    DropdownMenuItem(
                        text = { Text("No doctors available") },
                        onClick = {},
                        enabled = false
                    )
                } else {
                    doctors.forEach { doctor ->
                        DropdownMenuItem(
                            text = {
                                Column {
                                    Text(
                                        text = doctor.name,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = doctor.specialization,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            },
                            onClick = {
                                onDoctorSelected(doctor)
                                expanded = false
                            }
                        )
                    }
                }
            }
        }
    }
}