// ui/questionnaire/SectionedQuestionnaireScreen.kt
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
import com.example.nms_mobile.ui.theme.TealPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SectionedQuestionnaireScreen(
    state: SectionedQuestionnaireUiState,
    onBackClick: () -> Unit,
    // navigation
    onPrev: () -> Unit,
    onNext: () -> Unit,
    onSubmit: () -> Unit,
    // setters
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
            TopAppBar(
                title = { Text("Lifestyle Questionnaire", color = MaterialTheme.colorScheme.onPrimary) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = MaterialTheme.colorScheme.onPrimary)
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
                .background(Color(0xFFF5F5F5))
        ) {
            // Progress header
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(16.dp)
            ) {
                Text("Section ${state.currentSection}:", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                Text(getSectionTitle(state.currentSection), fontSize = 14.sp, color = Color.Gray)
                Spacer(Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = { state.currentSection.toFloat() / state.totalSections },
                    modifier = Modifier.fillMaxWidth().height(8.dp),
                    color = TealPrimary,
                    trackColor = Color.LightGray
                )
            }

            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
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

                if (state.error != null) {
                    Spacer(Modifier.height(8.dp))
                    Text(state.error, color = MaterialTheme.colorScheme.error)
                }
            }

            // Footer actions
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                if (state.currentSection > 1) {
                    OutlinedButton(
                        onClick = onPrev,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TealPrimary)
                    ) { Text("Previous") }
                    Spacer(Modifier.width(16.dp))
                }
                Button(
                    onClick = {
                        if (state.currentSection < state.totalSections) onNext() else onSubmit()
                    },
                    modifier = Modifier.weight(1f),
                    enabled = !state.isSubmitting,
                    colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
                ) {
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

@Composable
fun Section1BasicInfo(
    age: String,
    onAgeChange: (String) -> Unit,
    userWeight: String, // ✅ Updated
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
            Spacer(modifier = Modifier.height(16.dp))

            // Age
            OutlinedTextField(
                value = age,
                onValueChange = onAgeChange,
                label = { Text("Age") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Weight
            OutlinedTextField(
                value = userWeight, // ✅ Updated
                onValueChange = onWeightChange,
                label = { Text("Weight (kg)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Dominant Hand
            Text(
                text = "Dominant Hand",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            RadioButtonGroup(
                options = listOf("Right", "Left", "Ambidextrous"),
                selectedOption = dominantHand,
                onOptionSelected = onDominantHandChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Gender
            Text(
                text = "Gender",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            RadioButtonGroup(
                options = listOf("Male", "Female", "Other"),
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
            Spacer(modifier = Modifier.height(16.dp))

            // Education Level
            Text(
                text = "Education Level",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            RadioButtonGroup(
                options = listOf("Primary", "Secondary", "Tertiary"),
                selectedOption = educationLevel,
                onOptionSelected = onEducationLevelChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Smoking Status
            Text(
                text = "Smoking Status",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            RadioButtonGroup(
                options = listOf("Never Smoking", "Former Smoker", "Current Smoker"),
                selectedOption = smokingStatus,
                onOptionSelected = onSmokingStatusChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Alcohol Use
            Text(
                text = "Alcohol Use",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            RadioButtonGroup(
                options = listOf("No Drinker", "Occasional", "Regular"),
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

            // Physical Activity
            Text(
                text = "Physical Activity",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            RadioButtonGroup(
                options = listOf("Sedentary", "Mild Activity", "Moderate Activity", "High Activity"),
                selectedOption = physicalActivity,
                onOptionSelected = onPhysicalActivityChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Nutrition Diet
            Text(
                text = "Nutrition Diet",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            RadioButtonGroup(
                options = listOf("Balanced Diet", "Low Carb Diet", "Mediterranean Diet"),
                selectedOption = nutritionDiet,
                onOptionSelected = onNutritionDietChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Sleep Quality
            Text(
                text = "Sleep Quality",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
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

            // Diabetic
            Text(
                text = "Diabetic",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .selectableGroup(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                YesNoOption(
                    text = "Yes",
                    selected = diabetic == 1,
                    onClick = { onDiabeticChange(1) },
                    modifier = Modifier.weight(1f)  // ✅ Pass weight as parameter
                )
                YesNoOption(
                    text = "No",
                    selected = diabetic == 0,
                    onClick = { onDiabeticChange(0) },
                    modifier = Modifier.weight(1f)  // ✅ Pass weight as parameter
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Family History of Dementia
            Text(
                text = "Family History of Dementia",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            RadioButtonGroup(
                options = listOf("Yes", "No"),
                selectedOption = familyHistoryDementia,
                onOptionSelected = onFamilyHistoryChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Depression Diagnosis
            Text(
                text = "Depression Diagnosis",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            RadioButtonGroup(
                options = listOf("Yes", "No"),
                selectedOption = depressionDiagnosis,
                onOptionSelected = onDepressionChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // APOE ε4 Gene (Fixes the 'apoe' typo warning)
            Text(
                text = "APOE ε4 Gene",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
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

            // Currently Taking Medication
            Text(
                text = "Currently Taking Medication",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            RadioButtonGroup(
                options = listOf("Yes", "No"),
                selectedOption = currentlyTakingMedication,
                onOptionSelected = onMedicationChange
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Chronic Health Condition
            Text(
                text = "Chronic Health Condition",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            RadioButtonGroup(
                options = listOf("None", "Diabetes", "Heart Diseases", "Hypertension"),
                selectedOption = chronicHealthCondition,
                onOptionSelected = onChronicConditionChange
            )
        }
    }
}

// Reusable Components
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
                    onClick = null,
                    colors = RadioButtonDefaults.colors(
                        selectedColor = TealPrimary
                    )
                )
                Text(
                    text = option,
                    modifier = Modifier.padding(start = 8.dp),
                    fontSize = 14.sp
                )
            }
        }
    }
}


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
        border = if (!selected) CardDefaults.outlinedCardBorder() else null
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
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

