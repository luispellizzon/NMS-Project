// ui/questionnaire/QuestionnaireScreen.kt
package com.example.nms_mobile.ui.questionnaire

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.nms_mobile.ui.theme.TealPrimary

@Composable
fun QuestionnaireScreen(
    state: QuestionnaireUiState,
    // lifestyle
    onDominantHand: (String) -> Unit,
    onSmokingStatus: (String) -> Unit,
    onAlcoholUse: (String) -> Unit,
    onPhysicalActivity: (String) -> Unit,
    onNutritionDiet: (String) -> Unit,
    onSleepQuality: (String) -> Unit,
    // medical
    onDiabetic: (String) -> Unit,
    onFamilyHistory: (String) -> Unit,
    onDepression: (String) -> Unit,
    onApoe: (String) -> Unit,
    onMedication: (String) -> Unit,
    onChronic: (String) -> Unit,
    onFinish: () -> Unit
) {
    val dominantHandOptions = listOf("Right", "Left", "Ambidextrous")
    val smokingOptions = listOf("Never Smoked", "Former Smoker", "Current Smoker")
    val alcoholOptions = listOf("Non-Drinker", "Occasional", "Regular")
    val physicalActivityOptions = listOf("Sedentary", "Mild Activity", "Moderate Activity", "High Activity")
    val dietOptions = listOf("Balanced Diet", "Low-Carb Diet", "Mediterranean Diet")
    val sleepOptions = listOf("Poor", "Average", "Good")

    val yesNo = listOf("Yes", "No")
    val diabetic01 = listOf("0", "1") // model format
    val apoe = listOf("Positive", "Negative")
    val chronic = listOf("None", "Diabetes", "Heart Disease", "Hypertension")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Lifestyle & Medical", style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(12.dp))

        // Lifestyle section
        SectionHeader("Lifestyle")
        DropdownField("Dominant Hand", state.dominantHand, dominantHandOptions, onDominantHand)
        Spacer(Modifier.height(12.dp))
        DropdownField("Smoking Status", state.smokingStatus, smokingOptions, onSmokingStatus)
        Spacer(Modifier.height(12.dp))
        DropdownField("Alcohol Use", state.alcoholUse, alcoholOptions, onAlcoholUse)
        Spacer(Modifier.height(12.dp))
        DropdownField("Physical Activity", state.physicalActivity, physicalActivityOptions, onPhysicalActivity)
        Spacer(Modifier.height(12.dp))
        DropdownField("Nutrition / Diet", state.nutritionDiet, dietOptions, onNutritionDiet)
        Spacer(Modifier.height(12.dp))
        DropdownField("Sleep Quality", state.sleepQuality, sleepOptions, onSleepQuality)

        Spacer(Modifier.height(20.dp))

        // Medical section
        SectionHeader("Medical")
        DropdownField("Diabetic (1=Yes, 0=No)", state.diabetic, diabetic01, onDiabetic)
        Spacer(Modifier.height(12.dp))
        DropdownField("Family History of Dementia", state.familyHistory, yesNo, onFamilyHistory)
        Spacer(Modifier.height(12.dp))
        DropdownField("Depression Diagnosis", state.depressionStatus, yesNo, onDepression)
        Spacer(Modifier.height(12.dp))
        DropdownField("APOE ε4 Gene", state.apoeE4, apoe, onApoe)
        Spacer(Modifier.height(12.dp))
        DropdownField("Currently Taking Medication", state.medicationHistory, yesNo, onMedication)
        Spacer(Modifier.height(12.dp))
        DropdownField("Chronic Health Condition", state.chronicConditions, chronic, onChronic)

        Spacer(Modifier.height(16.dp))

        if (state.error != null) {
            Spacer(Modifier.height(8.dp))
            Text(state.error, color = MaterialTheme.colorScheme.error)
        }

        Spacer(Modifier.height(20.dp))
        Button(
            onClick = onFinish,
            enabled = !state.isSubmitting,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
        ) {
            if (state.isSubmitting) CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                color = MaterialTheme.colorScheme.onPrimary,
                strokeWidth = 2.dp
            ) else Text("Submit")
        }
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(title, style = MaterialTheme.typography.titleMedium, color = TealPrimary)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DropdownField(
    label: String,
    value: String,
    options: List<String>,
    onValue: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = it }) {
        OutlinedTextField(
            value = value,
            onValueChange = {},
            readOnly = true,
            label = { Text(label) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor()
        )
        ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            options.forEach { opt ->
                DropdownMenuItem(text = { Text(opt) }, onClick = { onValue(opt); expanded = false })
            }
        }
    }
}
