package com.example.nms_mobile.ui.personaldetails

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

data class PersonalInfoUiState(
    val fullName: String = "",
    val dateOfBirth: String = "",
    val biologicalSex: String = "",
    val educationLevel: String = "",
    val age: String = "",
    val weight: String = "",
    val isSubmitting: Boolean = false,
    val error: String? = null,
)

sealed class PersonalInfoEvent {
    data object SubmittedSuccessfully : PersonalInfoEvent()
}

class PersonalInfoViewModel(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) : ViewModel() {

    private val _uiState = MutableStateFlow(PersonalInfoUiState())
    val uiState: StateFlow<PersonalInfoUiState> = _uiState.asStateFlow()

    private val _events = Channel<PersonalInfoEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    fun onFullNameChange(value: String) = _uiState.update { it.copy(fullName = value, error = null) }
    fun onDateOfBirthChange(value: String) = _uiState.update { it.copy(dateOfBirth = value, error = null) }
    fun onBiologicalSexChange(value: String) = _uiState.update { it.copy(biologicalSex = value, error = null) }
    fun onEducationLevelChange(value: String) = _uiState.update { it.copy(educationLevel = value, error = null) }
    fun onAgeChange(value: String) = _uiState.update { it.copy(age = value.filter { it.isDigit() }) }
    fun onWeightChange(value: String) = _uiState.update { it.copy(weight = value.filter { it.isDigit() }) }

    fun submit() {
        val s = _uiState.value
        if (s.fullName.isBlank() || s.dateOfBirth.isBlank() ||
            s.biologicalSex.isBlank() || s.educationLevel.isBlank() ||
            s.age.isBlank() || s.weight.isBlank()
        ) {
            _uiState.update { it.copy(error = "Please fill all fields") }
            return
        }

        val uid = auth.currentUser?.uid
        if (uid == null) {
            _uiState.update { it.copy(error = "User not logged in") }
            return
        }

        viewModelScope.launch {
            try {
                _uiState.update { it.copy(isSubmitting = true, error = null) }

                val data = mapOf(
                    "fullName" to s.fullName,
                    "dateOfBirth" to s.dateOfBirth,
                    "biologicalSex" to s.biologicalSex,
                    "educationLevel" to s.educationLevel,
                    "age" to s.age.toInt(),
                    "weight" to s.weight.toInt(),
                    "uid" to uid
                )

                firestore.collection("user_details").document(uid).set(data).await()

                _uiState.update { it.copy(isSubmitting = false) }
                _events.send(PersonalInfoEvent.SubmittedSuccessfully)
            } catch (e: Exception) {
                _uiState.update { it.copy(isSubmitting = false, error = e.localizedMessage ?: "Failed to save data") }
            }
        }
    }
}
