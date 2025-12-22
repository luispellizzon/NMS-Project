package com.example.nms_mobile.ui.feature.personal_details

import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.max
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.White
import java.time.Instant.ofEpochMilli
import java.time.ZoneId

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PersonalInfoScreen(
    state: PersonalInfoUiState,
    onFullNameChange: (String) -> Unit,
    onDateOfBirthChange: (String) -> Unit,
    onCountryChange: (String) -> Unit,
    onCountrySelected: (String) -> Unit,
    onCountryFocused: () -> Unit,
    onConsentChange: (Boolean) -> Unit, 
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
            FullNameField(
                value = state.fullName,
                onValueChange = onFullNameChange
            )

            Spacer(Modifier.height(16.dp))

            // --- Date of Birth Input ---
            DateOfBirthField(
                value = state.dateOfBirth,
                onValueChange = onDateOfBirthChange,
            )


            Spacer(Modifier.height(16.dp))

            // --- Country Autocomplete ---
            CountryAutocompleteField(
                state = state,
                onCountryChange = onCountryChange,
                onCountryFocused = onCountryFocused,
                onCountrySelected = onCountrySelected
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

            // --- DATA CONSENT CHECKBOX ---
            DataConsentCheckbox(
                isChecked = state.dataUsageConsent,
                onCheckedChange = onConsentChange
            )

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

@Composable
fun DataConsentCheckbox(
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
            // Make the entire row clickable for better UX
            .selectable(
                selected = isChecked,
                onClick = { onCheckedChange(!isChecked) },
                role = Role.Checkbox
            ),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = isChecked,
            onCheckedChange = null, // Handled by the Row selection
            colors = CheckboxDefaults.colors(
                checkedColor = TealPrimary,
                checkmarkColor = White
            )
        )
        
        Spacer(Modifier.width(8.dp))
        
        Text(
            text = "I consent to the use of my anonymized data for training the dementia prediction model.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface
        )
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CountryAutocompleteField(
    state: PersonalInfoUiState,
    onCountryChange: (String) -> Unit,
    onCountryFocused: () -> Unit,
    onCountrySelected: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    // Expand whenever list is not empty
    LaunchedEffect(state.filteredCountries) {
        expanded = state.filteredCountries.isNotEmpty()
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
            modifier = Modifier
                .fillMaxWidth()
        ) {
            Box(
                modifier = Modifier
                    .heightIn(max = 250.dp)
                    .fillMaxWidth()
            ) {
                val scrollState = rememberScrollState()

                Column(
                    modifier = Modifier
                        .verticalScroll(scrollState)
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

                // 👉 This is the scroll bar!
                VerticalScrollbar(
                    modifier = Modifier
                        .align(Alignment.CenterEnd)
                        .padding(end = 2.dp),
                    scrollState = scrollState
                )
            }
        }
    }
}

@Composable
fun VerticalScrollbar(
    modifier: Modifier = Modifier,
    scrollState: ScrollState
) {
    val showBar = scrollState.maxValue > 0

    if (showBar) {
        Box(
            modifier
                .width(4.dp)
                .fillMaxHeight()
                .background(Color.LightGray.copy(alpha = 0.4f), RoundedCornerShape(2.dp))
        ) {
            val proportion = scrollState.value.toFloat() / scrollState.maxValue
            val barHeight = max(20.dp, 250.dp * (1f - proportion)).coerceAtMost(250.dp)

            Box(
                Modifier
                    .align(Alignment.TopEnd)
                    .offset(y = (proportion * 250.dp.value).dp)
                    .width(4.dp)
                    .height(barHeight)
                    .background(Color.DarkGray, RoundedCornerShape(2.dp))
            )
        }
    }
}
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DateOfBirthField(
    value: String,
    onValueChange: (String) -> Unit
) {
    var textFieldValue by remember { mutableStateOf(TextFieldValue(value)) }
    var showDatePicker by remember { mutableStateOf(false) }

    OutlinedTextField(
        value = textFieldValue,
        onValueChange = { newValue ->
            val formatted = formatDobInput(
                input = newValue.text,
                previous = textFieldValue.text
            )

            textFieldValue = newValue.copy(
                text = formatted.text,
                selection = TextRange(formatted.cursor)
            )

            onValueChange(formatted.text)
        },
        label = { Text("Date of Birth") },
        placeholder = { Text("DD/MM/YYYY") },
        singleLine = true,
        keyboardOptions = KeyboardOptions(
            keyboardType = KeyboardType.Number,
            imeAction = ImeAction.Next
        ),
        trailingIcon = {
            IconButton(onClick = { showDatePicker = true }) {
                Icon(Icons.Default.CalendarToday, contentDescription = "Pick date")
            }
        },
        modifier = Modifier.fillMaxWidth()
    )

    if (showDatePicker) {
        val dateState = rememberDatePickerState()

        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        dateState.selectedDateMillis?.let { millis ->
                            val localDate = ofEpochMilli(millis)
                                .atZone(ZoneId.systemDefault())
                                .toLocalDate()

                            val dob = "%02d/%02d/%04d".format(
                                localDate.dayOfMonth,
                                localDate.monthValue,
                                localDate.year
                            )

                            textFieldValue = TextFieldValue(
                                dob,
                                selection = TextRange(dob.length)
                            )

                            onValueChange(dob)
                        }

                        showDatePicker = false
                    }
                ) { Text("OK") }
            }
        ) {
            DatePicker(state = dateState)
        }
    }
}



data class DobFormatted(
    val text: String,
    val cursor: Int
)

fun formatDobInput(input: String, previous: String): DobFormatted {
    val digits = input.filter(Char::isDigit).take(8)

    val day = digits.take(2)
    val month = digits.drop(2).take(2)
    val year = digits.drop(4)

    val formatted = buildString {
        if (day.isNotEmpty()) append(day)
        if (month.isNotEmpty()) append("/$month")
        if (year.isNotEmpty()) append("/$year")
    }

    val added = formatted.length > previous.length

    val cursorPos = when {
        added -> formatted.length
        else -> input.length
    }

    return DobFormatted(formatted, cursorPos)
}


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FullNameField(
    value: String,
    onValueChange: (String) -> Unit
) {
    var tf by remember { mutableStateOf(TextFieldValue(value)) }

    OutlinedTextField(
        value = tf,
        onValueChange = { newValue ->
            val original = newValue.text
            val formatted = capitalizeWords(original)

            val newCursor = minOf(
                formatted.length,
                newValue.selection.start
            )

            tf = newValue.copy(
                text = formatted,
                selection = TextRange(newCursor)
            )

            onValueChange(formatted)
        },
        label = { Text("Full Name") },
        singleLine = true,
        modifier = Modifier.fillMaxWidth()
    )
}


fun capitalizeWords(input: String): String {
    return input.split(" ")
        .joinToString(" ") { part ->
            if (part.isBlank()) ""
            else part.lowercase().replaceFirstChar { it.uppercase() }
        }
}

