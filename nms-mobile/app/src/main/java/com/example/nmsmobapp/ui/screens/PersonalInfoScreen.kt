package com.example.nmsmobapp.ui.screens


import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.nmsmobapp.ui.theme.TealPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PersonalInfoScreen(
    onSubmit: (firstName: String, lastName: String, dateOfBirth: String, biologicalSex: String, educationLevel: String) -> Unit
) {
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var dateOfBirth by remember { mutableStateOf("") }
    var biologicalSex by remember { mutableStateOf("") }
    var educationLevel by remember { mutableStateOf("") }

    var sexExpanded by remember { mutableStateOf(false) }
    var educationExpanded by remember { mutableStateOf(false) }

    val sexOptions = listOf("Male", "Female", "Prefer not to say")
    val educationOptions = listOf(
        "High School",
        "College",
        "University",
        "Postgraduate",
        "Doctorate",
        "Other"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Personal Details",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
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
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Fields:",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            )

            // First Name
            OutlinedTextField(
                value = firstName,
                onValueChange = { firstName = it },
                label = { Text("First Name ") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = TealPrimary,
                    focusedLabelColor = TealPrimary,
                    cursorColor = TealPrimary
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Last Name
            OutlinedTextField(
                value = lastName,
                onValueChange = { lastName = it },
                label = { Text("Last Name ") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = TealPrimary,
                    focusedLabelColor = TealPrimary,
                    cursorColor = TealPrimary
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Date of Birth
            OutlinedTextField(
                value = dateOfBirth,
                onValueChange = { dateOfBirth = it },
                label = { Text("Date of Birth ") },
                placeholder = { Text("DD/MM/YYYY") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = TealPrimary,
                    focusedLabelColor = TealPrimary,
                    cursorColor = TealPrimary
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Biological Sex
            ExposedDropdownMenuBox(
                expanded = sexExpanded,
                onExpandedChange = { sexExpanded = it }
            ) {
                OutlinedTextField(
                    value = biologicalSex,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Biological Sex ") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = sexExpanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TealPrimary,
                        focusedLabelColor = TealPrimary
                    )
                )

                ExposedDropdownMenu(
                    expanded = sexExpanded,
                    onDismissRequest = { sexExpanded = false }
                ) {
                    sexOptions.forEach { option ->
                        DropdownMenuItem(
                            text = { Text(option) },
                            onClick = {
                                biologicalSex = option
                                sexExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Education Level
            ExposedDropdownMenuBox(
                expanded = educationExpanded,
                onExpandedChange = { educationExpanded = it }
            ) {
                OutlinedTextField(
                    value = educationLevel,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Highest Level of Education Completed") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = educationExpanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TealPrimary,
                        focusedLabelColor = TealPrimary
                    )
                )

                ExposedDropdownMenu(
                    expanded = educationExpanded,
                    onDismissRequest = { educationExpanded = false }
                ) {
                    educationOptions.forEach { option ->
                        DropdownMenuItem(
                            text = { Text(option) },
                            onClick = {
                                educationLevel = option
                                educationExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Submit Button
            Button(
                onClick = {
                    if (firstName.isNotEmpty() && lastName.isNotEmpty() &&
                        dateOfBirth.isNotEmpty() && biologicalSex.isNotEmpty() &&
                        educationLevel.isNotEmpty()) {
                        onSubmit(firstName, lastName, dateOfBirth, biologicalSex, educationLevel)
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = TealPrimary
                ),
                enabled = firstName.isNotEmpty() && lastName.isNotEmpty() &&
                        dateOfBirth.isNotEmpty() && biologicalSex.isNotEmpty() &&
                        educationLevel.isNotEmpty()
            ) {
                Text("Submit")
            }
        }
    }
}