package com.example.nms_mobile.ui.feature.personal_details

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.White

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PersonalInfoScreen(
    state: PersonalInfoUiState,
    onFullNameChange: (String) -> Unit,
    onDateOfBirthChange: (String) -> Unit,
    onEmailChange: (String) -> Unit,        // Function to update email (though field is read-only).
    onRoleChange: (String) -> Unit,         // Function to update the selected role.
    onSubmit: () -> Unit                    // Function to submit the data.
) {
    // Tool to manage focus between input fields.
    val focus = LocalFocusManager.current

    Scaffold(
        topBar = {
            // App bar with the screen title.
            TopAppBar(
                title = { Text("Personal Details", color = MaterialTheme.colorScheme.onPrimary) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = TealPrimary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { padding ->
        // Scrollable content column for all fields.
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // --- Full Name Input ---
            OutlinedTextField(
                value = state.fullName,
                onValueChange = onFullNameChange,
                label = { Text("Full Name") },
                placeholder = { Text("Enter your full name") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Text,
                    imeAction = ImeAction.Next
                ),
                keyboardActions = KeyboardActions(
                    onNext = { focus.moveFocus(FocusDirection.Down) }
                ),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = TealPrimary,
                    focusedLabelColor = TealPrimary,
                    unfocusedTextColor = TealPrimary,
                    focusedTextColor = TealPrimary
                )
            )

            Spacer(Modifier.height(16.dp))

            // --- Date of Birth Input ---
            OutlinedTextField(
                value = state.dateOfBirth,
                onValueChange = onDateOfBirthChange,
                label = { Text("Date of Birth") },
                placeholder = { Text("DD/MM/YYYY") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Text,
                    imeAction = ImeAction.Next
                ),
                keyboardActions = KeyboardActions(
                    onNext = { focus.moveFocus(FocusDirection.Down) }
                ),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = TealPrimary,
                    focusedLabelColor = TealPrimary,
                    unfocusedTextColor = TealPrimary,
                    focusedTextColor = TealPrimary
                )
            )

            Spacer(Modifier.height(16.dp))

            // --- Email Input (Read-only) ---
            OutlinedTextField(
                value = state.email,
                onValueChange = onEmailChange,
                label = { Text("Email") },
                placeholder = { Text("your@email.com") },
                singleLine = true,
                readOnly = true, // Prevents manual editing.
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Email,
                    imeAction = ImeAction.Next
                ),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = TealPrimary,
                    focusedLabelColor = TealPrimary,
                    // Style to indicate it's disabled/read-only.
                    disabledBorderColor = TealPrimary.copy(alpha = 0.5f),
                    disabledLabelColor = TealPrimary.copy(alpha = 0.5f),

                ),
                enabled = false // Visually grayed out.
            )

            Spacer(Modifier.height(20.dp))

            // --- Role Selection Header ---
            Text(
                text = "Choose Your Role",
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(8.dp))

            // --- Role Options (Radio Buttons) ---
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                RoleOption(
                    label = "Patient",
                    selected = state.role == "patient",
                    onClick = { onRoleChange("patient") }
                )
                Spacer(Modifier.width(24.dp))
                RoleOption(
                    label = "Caregiver",
                    selected = state.role == "caregiver",
                    onClick = { onRoleChange("caregiver") }
                )
            }

            Spacer(Modifier.height(20.dp))

            // --- Error Message ---
            if (state.error != null) {
                Text(
                    text = state.error,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(8.dp))
            }

            // --- Submit Button ---
            Button(
                onClick = onSubmit,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .padding(top = 8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary, contentColor = White),
                enabled = !state.isSubmitting // Disable button while loading.
            ) {
                // Show a loading circle or the "Submit" text.
                if (state.isSubmitting) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(22.dp),
                        color = MaterialTheme.colorScheme.onPrimary,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text("Submit")
                }
            }
        }
    }
}

// Helper composable for a single Role Radio Button option.
@Composable
private fun RoleOption(
    label: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            // Makes the whole row clickable and treats it as a radio button selection.
            .selectable(
                selected = selected,
                onClick = onClick,
                role = Role.RadioButton
            ),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(
            selected = selected,
            onClick = onClick, // Also handle the click on the RadioButton itself.
            colors = RadioButtonDefaults.colors(
                selectedColor = TealPrimary,
                unselectedColor = TealPrimary.copy(alpha = 0.6f)
            )
        )
        Spacer(Modifier.width(8.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodyLarge
        )
    }
}