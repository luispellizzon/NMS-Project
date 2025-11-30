package com.example.nms_mobile.ui.questionnaire

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nms_mobile.ui.BorderActive
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.White

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SectionedQuestionnaireScreen(
    state: SectionedQuestionnaireUiState,
    onBackClick: () -> Unit,
    // Navigation handlers
    onPrev: () -> Unit,
    onNext: () -> Unit,
    onSubmit: () -> Unit,
    // Data setters (one for each field)
    onAge: (String) -> Unit,
    onWeight: (String) -> Unit,
    onDominantHand: (String) -> Unit,
    onGender: (String) -> Unit,
    onEducation: (String) -> Unit,
    onSmoking: (String) -> Unit,
    onAlcohol: (String) -> Unit,
    onPhysical: (String) -> Unit,
    onNutrition: (String) -> Unit,
    onSleep: (String) -> Unit,
    onDiabetic: (Int) -> Unit,
    onFamilyHistory: (String) -> Unit,
    onDepression: (String) -> Unit,
    onGenetic: (String) -> Unit,
    onMedication: (String) -> Unit,
    onChronic: (String) -> Unit
) {
    Scaffold(
        topBar = {
            // App bar with title and back button.
            TopAppBar(
                title = { Text("Lifestyle Questionnaire", color = White) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = TealPrimary)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFFF5F5F5)) // Light gray background for contrast.
        ) {
            // --- Progress Header ---
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(16.dp)
            ) {
                Text("Section ${state.currentSection}:", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                // Displays title and step count (e.g., "Basic Information (Step 1 of 5)").
                Text(getSectionTitle(state.currentSection), fontSize = 14.sp, color = Color.Gray)
                Spacer(Modifier.height(8.dp))
                // Visual progress bar.
                LinearProgressIndicator(
                    progress = { state.currentSection.toFloat() / state.totalSections },
                    modifier = Modifier.fillMaxWidth().height(8.dp),
                    color = TealPrimary,
                    trackColor = Color.LightGray
                )
            }

            // --- Main Content Area (Scrollable) ---
            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                // Displays the current section based on the state.
                when (state.currentSection) {
                    1 -> Section1BasicInfo(
                        age = state.age, onAgeChange = onAge,
                        userWeight = state.weight, onWeightChange = onWeight,
                        dominantHand = state.dominantHand, onDominantHandChange = onDominantHand,
                        gender = state.gender, onGenderChange = onGender
                    )
                    2 -> Section2Education(
                        educationLevel = state.educationLevel, onEducationLevelChange = onEducation,
                        smokingStatus = state.smokingStatus, onSmokingStatusChange = onSmoking,
                        alcoholUse = state.alcoholUse, onAlcoholUseChange = onAlcohol
                    )
                    3 -> Section3HealthHabits(
                        physicalActivity = state.physicalActivity, onPhysicalActivityChange = onPhysical,
                        nutritionDiet = state.nutritionDiet, onNutritionDietChange = onNutrition,
                        sleepQuality = state.sleepQuality, onSleepQualityChange = onSleep
                    )
                    4 -> Section4MedicalHistory(
                        diabetic = state.diabetic, onDiabeticChange = onDiabetic,
                        familyHistoryDementia = state.familyHistoryDementia, onFamilyHistoryChange = onFamilyHistory,
                        depressionDiagnosis = state.depressionDiagnosis, onDepressionChange = onDepression,
                        genetic = state.genetic, onGeneticChange = onGenetic
                    )
                    5 -> Section5Medication(
                        currentlyTakingMedication = state.currentlyTakingMedication, onMedicationChange = onMedication,
                        chronicHealthCondition = state.chronicHealthCondition, onChronicConditionChange = onChronic
                    )
                }

                // Display error message if present.
                if (state.error != null) {
                    Spacer(Modifier.height(8.dp))
                    Text(state.error, color = MaterialTheme.colorScheme.error)
                }
            }

            // --- Footer Actions (Navigation Buttons) ---
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Previous button (only visible from Section 2 onwards).
                if (state.currentSection > 1) {
                    OutlinedButton(
                        onClick = onPrev,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TealPrimary)
                    ) { Text("Previous") }
                    Spacer(Modifier.width(16.dp))
                }
                // Next/Submit button.
                Button(
                    onClick = {
                        // Go to next section, or submit if it's the last section.
                        if (state.currentSection < state.totalSections) onNext() else onSubmit()
                    },
                    modifier = Modifier.weight(1f),
                    enabled = !state.isSubmitting,
                    colors = ButtonDefaults.buttonColors(containerColor = TealPrimary,contentColor = White)
                ) {
                    // Show loading indicator or button text.
                    if (state.isSubmitting)
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                    else
                        Text(if (state.currentSection < state.totalSections) "Next" else "Submit")
                }
            }
        }
    }
}

// --- Section Composable Functions ---

@Composable
fun Section1BasicInfo(
    age: String,
    onAgeChange: (String) -> Unit,
    userWeight: String,
    onWeightChange: (String) -> Unit,
    dominantHand: String,
    onDominantHandChange: (String) -> Unit,
    gender: String,
    onGenderChange: (String) -> Unit
) {
    QuestionCard {
        Column {
            Text(
                text = "Basic Information",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TealPrimary
            )
            Spacer(modifier = Modifier.height(8.dp))

            // Age Input
            OutlinedTextField(
                value = age,
                onValueChange = onAgeChange,
                label = { Text("Age") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = BorderActive,
                    focusedLabelColor = TealPrimary,
                    cursorColor = TealPrimary,
                    unfocusedTextColor = TealPrimary,
                    focusedTextColor = TealPrimary
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Weight Input
            OutlinedTextField(
                value = userWeight,
                onValueChange = onWeightChange,
                label = { Text("Weight (kg)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = BorderActive,
                    focusedLabelColor = TealPrimary,
                    cursorColor = TealPrimary,
                    unfocusedTextColor = TealPrimary,
                    focusedTextColor = TealPrimary
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Dominant Hand Selection
            Text(
                text = "Dominant Hand",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            RadioButtonGroup(
                options = listOf("Right", "Left", "Ambidextrous"),
                selectedOption = dominantHand,
                onOptionSelected = onDominantHandChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Gender Selection
            Text(
                text = "Gender",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            RadioButtonGroup(
                options = listOf("Male", "Female"),
                selectedOption = gender,
                onOptionSelected = onGenderChange
            )
        }
    }
}

// Section 2: Education & Lifestyle
@Composable
fun Section2Education(
    educationLevel: String,
    onEducationLevelChange: (String) -> Unit,
    smokingStatus: String,
    onSmokingStatusChange: (String) -> Unit,
    alcoholUse: String,
    onAlcoholUseChange: (String) -> Unit
) {
    QuestionCard {
        Column {
            Text(
                text = "Education & Lifestyle",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TealPrimary
            )
            Spacer(modifier = Modifier.height(8.dp))

            // Education Level Selection
            Text(
                text = "Education Level",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            RadioButtonGroup(
                options = listOf("No School","Primary", "Secondary", "Tertiary"),
                selectedOption = educationLevel,
                onOptionSelected = onEducationLevelChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Smoking Status Selection
            Text(
                text = "Smoking Status",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            RadioButtonGroup(
                options = listOf("Never Smoked", "Former Smoker", "Current Smoker"),
                selectedOption = smokingStatus,
                onOptionSelected = onSmokingStatusChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Alcohol Use Selection
            Text(
                text = "Alcohol Use",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            RadioButtonGroup(
                options = listOf("Non-Drinker", "Occasional", "Regular"),
                selectedOption = alcoholUse,
                onOptionSelected = onAlcoholUseChange
            )
        }
    }
}

// Section 3: Health Habits
@Composable
fun Section3HealthHabits(
    physicalActivity: String,
    onPhysicalActivityChange: (String) -> Unit,
    nutritionDiet: String,
    onNutritionDietChange: (String) -> Unit,
    sleepQuality: String,
    onSleepQualityChange: (String) -> Unit
) {
    QuestionCard {
        Column {
            Text(
                text = "Health Habits",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TealPrimary
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Physical Activity Selection
            Text(
                text = "Physical Activity",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            RadioButtonGroup(
                options = listOf("Sedentary", "Mild Activity", "Moderate Activity", "High Activity"),
                selectedOption = physicalActivity,
                onOptionSelected = onPhysicalActivityChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Nutrition Diet Selection
            Text(
                text = "Nutrition Diet",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            RadioButtonGroup(
                options = listOf("Balanced Diet", "Low-Carb Diet", "Mediterranean Diet"),
                selectedOption = nutritionDiet,
                onOptionSelected = onNutritionDietChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Sleep Quality Selection
            Text(
                text = "Sleep Quality",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            RadioButtonGroup(
                options = listOf("Poor", "Average", "Good"),
                selectedOption = sleepQuality,
                onOptionSelected = onSleepQualityChange
            )
        }
    }
}

// Section 4: Medical History
@Composable
fun Section4MedicalHistory(
    diabetic: Int,
    onDiabeticChange: (Int) -> Unit,
    familyHistoryDementia: String,
    onFamilyHistoryChange: (String) -> Unit,
    depressionDiagnosis: String,
    onDepressionChange: (String) -> Unit,
    genetic: String,
    onGeneticChange: (String) -> Unit
) {
    QuestionCard {
        Column {
            Text(
                text = "Medical History",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TealPrimary
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Diabetic Selection (Yes/No as cards)
            Text(
                text = "Diabetic",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .selectableGroup(), // Grouping for accessibility
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Yes option (1)
                YesNoOption(
                    text = "Yes",
                    selected = diabetic == 1,
                    onClick = { onDiabeticChange(1) },
                    modifier = Modifier.weight(1f)
                )
                // No option (0)
                YesNoOption(
                    text = "No",
                    selected = diabetic == 0,
                    onClick = { onDiabeticChange(0) },
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Family History of Dementia Selection
            Text(
                text = "Family History of Dementia",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            RadioButtonGroup(
                options = listOf("Yes", "No"),
                selectedOption = familyHistoryDementia,
                onOptionSelected = onFamilyHistoryChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Depression Diagnosis Selection
            Text(
                text = "Depression Diagnosis",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            RadioButtonGroup(
                options = listOf("Yes", "No"),
                selectedOption = depressionDiagnosis,
                onOptionSelected = onDepressionChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // APOE ε4 Gene Status Selection
            Text(
                text = "APOE ε4 Gene",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            RadioButtonGroup(
                options = listOf("Positive", "Negative"),
                selectedOption = genetic,
                onOptionSelected = onGeneticChange
            )
        }
    }
}

// Section 5: Medication & Chronic Conditions
@Composable
fun Section5Medication(
    currentlyTakingMedication: String,
    onMedicationChange: (String) -> Unit,
    chronicHealthCondition: String,
    onChronicConditionChange: (String) -> Unit
) {
    QuestionCard {
        Column {
            Text(
                text = "Medication & Health Conditions",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TealPrimary
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Currently Taking Medication Selection
            Text(
                text = "Currently Taking Medication",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            RadioButtonGroup(
                options = listOf("Yes", "No"),
                selectedOption = currentlyTakingMedication,
                onOptionSelected = onMedicationChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Chronic Health Condition Selection
            Text(
                text = "Chronic Health Condition",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            RadioButtonGroup(
                options = listOf("None", "Diabetes", "Heart Disease", "Hypertension"),
                selectedOption = chronicHealthCondition,
                onOptionSelected = onChronicConditionChange
            )
        }
    }
}

// --- Reusable Component Functions ---

// Card container for each question section.
@Composable
fun QuestionCard(content: @Composable () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Box(modifier = Modifier.padding(16.dp)) {
            content()
        }
    }
}

// Standard vertical radio button group.
@Composable
fun RadioButtonGroup(
    options: List<String>,
    selectedOption: String,
    onOptionSelected: (String) -> Unit
) {
    Column(modifier = Modifier.selectableGroup()) {
        options.forEach { option ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .selectable(
                        selected = (option == selectedOption),
                        onClick = { onOptionSelected(option) },
                        role = Role.RadioButton
                    )
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                RadioButton(
                    selected = (option == selectedOption),
                    onClick = null, // Handled by the Row's selectable modifier.
                    colors = RadioButtonDefaults.colors(
                        selectedColor = TealPrimary,
                    )
                )
                Text(
                    text = option,
                    modifier = Modifier.padding(start = 8.dp),
                    fontSize = 14.sp,
                    color = Color.DarkGray
                )
            }
        }
    }
}

// Custom Yes/No option styled as a Card.
@Composable
fun YesNoOption(
    text: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .selectable(
                selected = selected,
                onClick = onClick,
                role = Role.RadioButton
            ),
        colors = CardDefaults.cardColors(
            containerColor = if (selected) TealPrimary else Color.White
        ),
        // Add a border if not selected.
        border = if (!selected) CardDefaults.outlinedCardBorder() else null
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = text,
                color = if (selected) Color.White else Color.Black,
                fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
            )
        }
    }
}

// Helper function to get the section title and step count for the progress bar.
fun getSectionTitle(section: Int): String {
    return when (section) {
        1 -> "Basic Information (Step 1 of 5)"
        2 -> "Education & Lifestyle (Step 2 of 5)"
        3 -> "Health Habits (Step 3 of 5)"
        4 -> "Medical History (Step 4 of 5)"
        5 -> "Medication & Conditions (Step 5 of 5)"
        else -> ""
    }
}