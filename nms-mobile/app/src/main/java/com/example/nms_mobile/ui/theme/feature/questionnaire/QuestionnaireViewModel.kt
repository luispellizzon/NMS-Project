// ui/questionnaire/QuestionnaireViewModel.kt
package com.example.nms_mobile.ui.questionnaire

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

data class QuestionnaireUiState(
    // Lifestyle
    val dominantHand: String = "",
    val smokingStatus: String = "",
    val alcoholUse: String = "",
    val physicalActivity: String = "",
    val nutritionDiet: String = "",
    val sleepQuality: String = "",
    // Medical
    val diabetic: String = "",                // model expects "0"/"1"
    val familyHistory: String = "",           // Yes/No
    val depressionStatus: String = "",        // Yes/No
    val apoeE4: String = "",                  // Positive/Negative
    val medicationHistory: String = "",       // Yes/No
    val chronicConditions: String = "",       // one of set (or "None")
    // UX state
    val isSubmitting: Boolean = false,
    val error: String? = null
)

sealed class QuestionnaireEvent {
    data object Saved : QuestionnaireEvent()
}

class QuestionnaireViewModel(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) : ViewModel() {

    private val _ui = MutableStateFlow(QuestionnaireUiState())
    val ui: StateFlow<QuestionnaireUiState> = _ui.asStateFlow()

    private val _events = Channel<QuestionnaireEvent>(Channel.BUFFERED)
    val events: Flow<QuestionnaireEvent> = _events.receiveAsFlow()

    // Setters
    fun onDominantHand(v: String)      = _ui.update { it.copy(dominantHand = v, error = null) }
    fun onSmokingStatus(v: String)     = _ui.update { it.copy(smokingStatus = v, error = null) }
    fun onAlcoholUse(v: String)        = _ui.update { it.copy(alcoholUse = v, error = null) }
    fun onPhysicalActivity(v: String)  = _ui.update { it.copy(physicalActivity = v, error = null) }
    fun onNutritionDiet(v: String)     = _ui.update { it.copy(nutritionDiet = v, error = null) }
    fun onSleepQuality(v: String)      = _ui.update { it.copy(sleepQuality = v, error = null) }

    fun onDiabetic(v: String)          = _ui.update { it.copy(diabetic = v, error = null) }                // "0"/"1"
    fun onFamilyHistory(v: String)     = _ui.update { it.copy(familyHistory = v, error = null) }           // Yes/No
    fun onDepression(v: String)        = _ui.update { it.copy(depressionStatus = v, error = null) }        // Yes/No
    fun onApoe(v: String)              = _ui.update { it.copy(apoeE4 = v, error = null) }                  // Positive/Negative
    fun onMedication(v: String)        = _ui.update { it.copy(medicationHistory = v, error = null) }       // Yes/No
    fun onChronic(v: String)           = _ui.update { it.copy(chronicConditions = v, error = null) }

    fun save() {
        val s = _ui.value

        // Minimal validation
        val err = when {
            s.dominantHand.isBlank()        -> "Please select your dominant hand"
            s.smokingStatus.isBlank()       -> "Please select your smoking status"
            s.alcoholUse.isBlank()          -> "Please select your alcohol use"
            s.physicalActivity.isBlank()    -> "Please select your physical activity"
            s.nutritionDiet.isBlank()       -> "Please select your diet"
            s.sleepQuality.isBlank()        -> "Please select your sleep quality"
            s.diabetic.isBlank()            -> "Please set diabetic (0/1)"
            s.familyHistory.isBlank()       -> "Please set family history"
            s.depressionStatus.isBlank()    -> "Please set depression status"
            s.apoeE4.isBlank()              -> "Please set APOE ε4"
            s.medicationHistory.isBlank()   -> "Please set medication"
            s.chronicConditions.isBlank()   -> "Please set chronic condition"
            else -> null
        }
        if (err != null) { _ui.update { it.copy(error = err) }; return }

        val uid = auth.currentUser?.uid ?: run {
            _ui.update { it.copy(error = "User not logged in") }
            return
        }

        viewModelScope.launch {
            _ui.update { it.copy(isSubmitting = true, error = null) }
            try {
                // Field names match the HF model
                val doc = mapOf(
                    "Dominant_Hand" to s.dominantHand,
                    "Smoking_Status" to s.smokingStatus,
                    "Alcohol_Use" to s.alcoholUse,
                    "Physical_Activity" to s.physicalActivity,
                    "Nutrition_Diet" to s.nutritionDiet,
                    "Sleep_Quality" to s.sleepQuality,
                    "Diabetic" to s.diabetic,                                   // "0" or "1"
                    "Family_History" to s.familyHistory,                        // Yes/No
                    "Depression_Status" to s.depressionStatus,                  // Yes/No
                    "APOE_ε4" to s.apoeE4,                                      // Positive/Negative
                    "Medication_History" to s.medicationHistory,                // Yes/No
                    "Chronic_Health_Conditions" to s.chronicConditions,
                )

                db.collection("questionnaires").document(uid)
                    .set(doc).await()

                _ui.update { it.copy(isSubmitting = false) }
                _events.send(QuestionnaireEvent.Saved)
            } catch (e: Exception) {
                _ui.update { it.copy(isSubmitting = false, error = e.localizedMessage ?: "Failed to save") }
            }
        }
    }
}
