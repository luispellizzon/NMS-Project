package com.example.nms_mobile.ui.feature.addpatient

import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.max
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.White

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddPatientScreen(
    onBack: () -> Unit,
    onPatientCreated: () -> Unit,
    viewModel: AddPatientViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val focusManager = LocalFocusManager.current

    LaunchedEffect(uiState.isSuccess) {
        if (uiState.isSuccess) {
            onPatientCreated()
            viewModel.resetState()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Add New Patient") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Color.Black,
                    navigationIconContentColor = Color.Black
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState()), // Make screen scrollable
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Patient Details",
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                color = TealPrimary,
                modifier = Modifier.align(Alignment.Start)
            )
            
            Spacer(modifier = Modifier.height(24.dp))

            // First Name
            OutlinedTextField(
                value = uiState.firstName,
                onValueChange = viewModel::onFirstNameChange,
                label = { Text("First Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Last Name
            OutlinedTextField(
                value = uiState.lastName,
                onValueChange = viewModel::onLastNameChange,
                label = { Text("Last Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Date of Birth
            OutlinedTextField(
                value = uiState.dateOfBirth,
                onValueChange = viewModel::onDateOfBirthChange,
                label = { Text("Date of Birth (DD/MM/YYYY)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Number, 
                    imeAction = ImeAction.Next
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Email (MANDATORY)
            OutlinedTextField(
                value = uiState.email,
                onValueChange = viewModel::onEmailChange,
                label = { Text("Email") }, // Removed (Optional)
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Email,
                    imeAction = ImeAction.Done
                )
            )
            
            Spacer(modifier = Modifier.height(16.dp))

            // Country/Location
            AddPatientCountryField(
                state = uiState,
                onCountryChange = viewModel::onLocationChange,
                onCountryFocused = viewModel::onFieldFocused,
                onCountrySelected = {
                    viewModel.onLocationSelected(it)
                    focusManager.clearFocus()
                }
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Data Consent Checkbox
            AddPatientDataConsentCheckbox(
                isChecked = uiState.dataUsageConsent,
                onCheckedChange = viewModel::onConsentChange
            )

            if (uiState.error != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = uiState.error!!,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = viewModel::onCreatePatient,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary),
                enabled = !uiState.isLoading
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        color = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                } else {
                    Text("Create Patient")
                }
            }
            
            // Extra spacer for scrolling
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

// --- Helper Components ---

@Composable
fun AddPatientDataConsentCheckbox(
    isChecked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                shape = RoundedCornerShape(8.dp)
            )
            .padding(8.dp)
            .selectable(
                selected = isChecked,
                onClick = { onCheckedChange(!isChecked) },
                role = Role.Checkbox
            ),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = isChecked,
            onCheckedChange = null,
            colors = CheckboxDefaults.colors(
                checkedColor = TealPrimary,
                checkmarkColor = White
            )
        )
        Spacer(Modifier.width(8.dp))
        Text(
            text = "I consent to the use of the patient's anonymized data for training the dementia prediction model.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddPatientCountryField(
    state: AddPatientUiState,
    onCountryChange: (String) -> Unit,
    onCountryFocused: () -> Unit,
    onCountrySelected: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    LaunchedEffect(state.filteredCountries) {
        // Only expand if there is text typed and we have matches
        expanded = state.filteredCountries.isNotEmpty() && state.location.isNotBlank() && 
                   !state.filteredCountries.contains(state.location)
    }

    Column {
        OutlinedTextField(
            value = state.location,
            onValueChange = onCountryChange,
            label = { Text("Country") },
            modifier = Modifier
                .fillMaxWidth()
                .onFocusChanged { focus ->
                    if (focus.isFocused) {
                        onCountryFocused()
                    }
                },
            singleLine = true
        )

        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
            modifier = Modifier.fillMaxWidth(0.9f)
        ) {
            Box(
                modifier = Modifier
                    .heightIn(max = 200.dp)
                    .fillMaxWidth()
            ) {
                val scrollState = rememberScrollState()

                Column(
                    modifier = Modifier.verticalScroll(scrollState)
                ) {
                    state.filteredCountries.forEach { country ->
                        DropdownMenuItem(
                            text = { Text(country) },
                            onClick = {
                                expanded = false
                                onCountrySelected(country)
                            }
                        )
                    }
                }
                
                // Reuse the logic from your scrollbar helper if available
                // Or simply rely on standard scrolling without a visible bar 
                // if the other file isn't imported.
                // Assuming standard scrolling is fine here for simplicity.
            }
        }
    }
}