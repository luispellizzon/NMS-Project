package com.example.nms_mobile.ui.questionnaire

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.AuthRepository
import com.example.nms_mobile.data.CombinedQuestionnaire
import com.example.nms_mobile.data.FirestoreRepository
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// Data model for the Questionnaire screen's state.
data class SectionedQuestionnaireUiState(
    val currentSection: Int = 1,
    val totalSections: Int = 5,

    // Section 1: Basic Info
    val age: String = "",
    val weight: String = "",
    val dominantHand: String = "",
    val gender: String = "",

    // Section 2: Education & Lifestyle
    val educationLevel: String = "",
    val smokingStatus: String = "",
    val alcoholUse: String = "",

    // Section 3: Health Habits
    val physicalActivity: String = "",
    val nutritionDiet: String = "",
    val sleepQuality: String = "",

    // Section 4: Medical History
    val diabetic: Int = -1,                       // Stores 0 (No) or 1 (Yes).
    val familyHistoryDementia: String = "",
    val depressionDiagnosis: String = "",
    val genetic: String = "",                 // Stores "Positive" or "Negative".

    // Section 5: Medication & Chronic Conditions
    val currentlyTakingMedication: String = "",  // Yes/No
    val chronicHealthCondition: String = "",     // e.g., None/Diabetes/Hypertension

    val isSubmitting: Boolean = false, // True while saving data.
    val error: String? = null // Stores validation or submission error.
)

// Single events for the UI (like navigation command).
sealed class SectionedQuestionnaireEvent {
    data object Submitted : SectionedQuestionnaireEvent()
}

class SectionedQuestionnaireViewModel(
    private val auth: AuthRepository = AuthRepository.instance,
    private val db: FirestoreRepository = FirestoreRepository.instance
) : ViewModel() {

    private val _ui = MutableStateFlow(SectionedQuestionnaireUiState())
    val ui: StateFlow<SectionedQuestionnaireUiState> = _ui.asStateFlow()

    private val _events = Channel<SectionedQuestionnaireEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    // --- Section Navigation ---

    // Moves to the next section, limited by totalSections.
    fun nextSection() = _ui.update {
        it.copy(currentSection = (it.currentSection + 1).coerceAtMost(it.totalSections), error = null)
    }
    // Moves to the previous section, limited by 1.
    fun prevSection() = _ui.update {
        it.copy(currentSection = (it.currentSection - 1).coerceAtLeast(1), error = null)
    }

    // --- Setters (Input Handlers) ---
    // Filters input to only allow digits for age/weight.
    fun onAge(v: String) = _ui.update { it.copy(age = v.filter(Char::isDigit)) }
    fun onWeight(v: String) = _ui.update { it.copy(weight = v.filter(Char::isDigit)) }
    fun onDominantHand(v: String) = _ui.update { it.copy(dominantHand = v) }
    fun onGender(v: String) = _ui.update { it.copy(gender = v) }

    fun onEducation(v: String) = _ui.update { it.copy(educationLevel = v) }
    fun onSmoking(v: String) = _ui.update { it.copy(smokingStatus = v) }
    fun onAlcohol(v: String) = _ui.update { it.copy(alcoholUse = v) }

    fun onPhysicalActivity(v: String) = _ui.update { it.copy(physicalActivity = v) }
    fun onNutrition(v: String) = _ui.update { it.copy(nutritionDiet = v) }
    fun onSleep(v: String) = _ui.update { it.copy(sleepQuality = v) }

    fun onDiabetic(v: Int) = _ui.update { it.copy(diabetic = v) }
    fun onFamilyHistory(v: String) = _ui.update { it.copy(familyHistoryDementia = v) }
    fun onDepression(v: String) = _ui.update { it.copy(depressionDiagnosis = v) }
    fun onGenetic(v: String) = _ui.update { it.copy(genetic = v) }

    fun onMedication(v: String) = _ui.update { it.copy(currentlyTakingMedication = v) }
    fun onChronic(v: String) = _ui.update { it.copy(chronicHealthCondition = v) }

    // --- Validation ---

    // Validates the inputs ONLY for the currently visible section.
    fun validateCurrentSection(): Boolean {
        val s = _ui.value
        val err = when (s.currentSection) {
            1 -> when {
                s.age.isBlank() -> "Please enter your age"
                s.weight.isBlank() -> "Please enter your weight"
                s.dominantHand.isBlank() -> "Please select dominant hand"
                s.gender.isBlank() -> "Please select gender"
                else -> null
            }
            2 -> when {
                s.educationLevel.isBlank() -> "Select education level"
                s.smokingStatus.isBlank() -> "Select smoking status"
                s.alcoholUse.isBlank() -> "Select alcohol use"
                else -> null
            }
            3 -> when {
                s.physicalActivity.isBlank() -> "Select physical activity"
                s.nutritionDiet.isBlank() -> "Select nutrition/diet"
                s.sleepQuality.isBlank() -> "Select sleep quality"
                else -> null
            }
            4 -> when {
                s.diabetic !in listOf(0, 1) -> "Select diabetic (Yes/No)"
                s.familyHistoryDementia.isBlank() -> "Select family history"
                s.depressionDiagnosis.isBlank() -> "Select depression status"
                s.genetic.isBlank() -> "Select APOE ε4"
                else -> null
            }
            5 -> when {
                s.currentlyTakingMedication.isBlank() -> "Select medication status"
                s.chronicHealthCondition.isBlank() -> "Select chronic condition"
                else -> null
            }
            else -> null
        }
        _ui.update { it.copy(error = err) }
        return err == null // True if validation passed.
    }

    // --- Submission ---

    fun submit() {
        val s = _ui.value

        // Final comprehensive validation before submission.
        val err = when {
            s.age.isBlank() || s.weight.isBlank() -> "Age and weight are required"
            s.dominantHand.isBlank() || s.gender.isBlank() -> "Basic info missing"
            s.educationLevel.isBlank() || s.smokingStatus.isBlank() || s.alcoholUse.isBlank() -> "Education & lifestyle missing"
            s.physicalActivity.isBlank() || s.nutritionDiet.isBlank() || s.sleepQuality.isBlank() -> "Health habits missing"
            s.diabetic !in listOf(0, 1) || s.familyHistoryDementia.isBlank() || s.depressionDiagnosis.isBlank() || s.genetic.isBlank() -> "Medical history missing"
            s.currentlyTakingMedication.isBlank() || s.chronicHealthCondition.isBlank() -> "Medication/conditions missing"
            else -> null
        }
        if (err != null) { _ui.update { it.copy(error = err) }; return }

        val uid = auth.currentUser()?.uid
        if (uid == null) { _ui.update { it.copy(error = "User not logged in") }; return }

        // Create the final data object (payload).
        val payload = CombinedQuestionnaire(
            age = s.age.toIntOrNull(),
            weight = s.weight.toIntOrNull(),
            gender = s.gender,
            education_level = s.educationLevel,
            dominant_hand = s.dominantHand,
            smoking_status = s.smokingStatus,
            alcohol_use = s.alcoholUse,
            physical_activity = s.physicalActivity,
            nutrition_diet = s.nutritionDiet,
            sleep_quality = s.sleepQuality,
            diabetic = s.diabetic.toString(),
            family_history = s.familyHistoryDementia,
            depression_status = s.depressionDiagnosis,
            genetic = s.genetic,
            medication_history = s.currentlyTakingMedication,
            chronic_health_conditions = s.chronicHealthCondition
        )

        viewModelScope.launch {
            _ui.update { it.copy(isSubmitting = true, error = null) }
            try {
                // Save the complete questionnaire data to Firestore.
                db.saveCombinedQuestionnaire(payload)
                _ui.update { it.copy(isSubmitting = false) }
                // Send event to trigger successful navigation.
                _events.send(SectionedQuestionnaireEvent.Submitted)
            } catch (e: Exception) {
                // Handle submission errors.
                _ui.update { it.copy(isSubmitting = false, error = e.localizedMessage ?: "Failed to save") }
            }
        }
    }
}