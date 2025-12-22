package com.example.nms_mobile.ui.feature.support

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.nms_mobile.data.SupportRequestPriority
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.components.NmsTopAppBar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SupportScreen(
    onBackClick: () -> Unit,
    onViewHistory: () -> Unit,
    viewModel: SupportViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var priorityExpanded by remember { mutableStateOf(false) }

    // Success Dialog
    if (uiState.isSuccess) {
        AlertDialog(
            onDismissRequest = {
                viewModel.resetSuccess()
                onBackClick()
            },
            title = {
                Text(
                    "Request Submitted",
                    fontWeight = FontWeight.Bold,
                    color = TealPrimary
                )
            },
            text = {
                Column {
                    Text("Your support request has been submitted successfully.")
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Ticket ID: ${uiState.ticketId}",
                        fontWeight = FontWeight.Medium,
                        color = TealPrimary
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.resetSuccess()
                    onBackClick()
                }) {
                    Text("OK", color = TealPrimary)
                }
            }
        )
    }

    // Error Snackbar
    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(uiState.error) {
        uiState.error?.let {
            snackbarHostState.showSnackbar(
                message = it,
                actionLabel = "Dismiss"
            )
            viewModel.clearError()
        }
    }

    Scaffold(
        containerColor = Color.White,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            NmsTopAppBar(
                greeting = uiState.greeting,
                displayName = uiState.displayName,
                onLogoutClick = { },
                onFeedbackClick = { },
                onBackClick = onBackClick
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(8.dp))

            // Title
            Text(
                text = "SUPPORT REQUEST",
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold,
                    color = TealPrimary
                ),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Subtitle
            Text(
                text = "How can we help you?",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Subject Field
            Text(
                text = "Subject *",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = uiState.subject,
                onValueChange = viewModel::onSubjectChange,
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Enter a brief subject...") },
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                isError = uiState.subjectError != null,
                supportingText = {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = uiState.subjectError ?: "",
                            color = if (uiState.subjectError != null) MaterialTheme.colorScheme.error else Color.Transparent
                        )
                        Text(
                            text = "${uiState.subject.length}/100",
                            color = Color.Gray
                        )
                    }
                },
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedBorderColor = Color.LightGray,
                    focusedBorderColor = TealPrimary,
                    cursorColor = TealPrimary
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Priority Dropdown
            Text(
                text = "Priority",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(8.dp))
            ExposedDropdownMenuBox(
                expanded = priorityExpanded,
                onExpandedChange = { priorityExpanded = !priorityExpanded },
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = uiState.priority.displayName(),
                    onValueChange = {},
                    readOnly = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    shape = RoundedCornerShape(12.dp),
                    trailingIcon = {
                        ExposedDropdownMenuDefaults.TrailingIcon(expanded = priorityExpanded)
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        unfocusedBorderColor = Color.LightGray,
                        focusedBorderColor = TealPrimary
                    )
                )
                ExposedDropdownMenu(
                    expanded = priorityExpanded,
                    onDismissRequest = { priorityExpanded = false }
                ) {
                    SupportRequestPriority.entries.forEach { priority ->
                        DropdownMenuItem(
                            text = {
                                Text(
                                    priority.displayName(),
                                    color = when (priority) {
                                        SupportRequestPriority.LOW -> Color.Gray
                                        SupportRequestPriority.MEDIUM -> TealPrimary
                                        SupportRequestPriority.HIGH -> Color(0xFFFF9800)
                                        SupportRequestPriority.URGENT -> Color(0xFFF44336)
                                    }
                                )
                            },
                            onClick = {
                                viewModel.onPriorityChange(priority)
                                priorityExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Message Field
            Text(
                text = "Message *",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = uiState.message,
                onValueChange = viewModel::onMessageChange,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                placeholder = { Text("Describe your issue in detail...") },
                shape = RoundedCornerShape(12.dp),
                maxLines = 10,
                isError = uiState.messageError != null,
                supportingText = {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = uiState.messageError ?: "",
                            color = if (uiState.messageError != null) MaterialTheme.colorScheme.error else Color.Transparent
                        )
                        Text(
                            text = "${uiState.message.length}/1000",
                            color = Color.Gray
                        )
                    }
                },
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedBorderColor = Color.LightGray,
                    focusedBorderColor = TealPrimary,
                    cursorColor = TealPrimary
                )
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Submit Button
            Button(
                onClick = { viewModel.submitRequest() },
                enabled = !uiState.isSubmitting,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = TealPrimary,
                    disabledContainerColor = Color.Gray
                )
            ) {
                if (uiState.isSubmitting) {
                    CircularProgressIndicator(
                        color = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                } else {
                    Text(
                        text = "Submit Request",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // View History Button
            OutlinedButton(
                onClick = onViewHistory,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = TealPrimary
                )
            ) {
                Text(
                    text = "View Request History",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Medium)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
