package com.example.nms_mobile.ui.feature.addpatient

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.PatientRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AddPatientUiState(
    val firstName: String = "",
    val lastName: String = "",
    val dateOfBirth: String = "",
    val email: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val isSuccess: Boolean = false
)

class AddPatientViewModel : ViewModel() {
    private val repository = PatientRepository.instance

    private val _uiState = MutableStateFlow(AddPatientUiState())
    val uiState: StateFlow<AddPatientUiState> = _uiState.asStateFlow()

    fun onFirstNameChange(newFirstName: String) {
        _uiState.value = _uiState.value.copy(firstName = newFirstName)
    }

    fun onLastNameChange(newLastName: String) {
        _uiState.value = _uiState.value.copy(lastName = newLastName)
    }

    fun onDateOfBirthChange(newDob: String) {
        _uiState.value = _uiState.value.copy(dateOfBirth = newDob)
    }

    fun onEmailChange(newEmail: String) {
        _uiState.value = _uiState.value.copy(email = newEmail)
    }

    fun onCreatePatient() {
        val currentState = _uiState.value
        if (currentState.firstName.isBlank() || currentState.lastName.isBlank() || currentState.dateOfBirth.isBlank()) {
            _uiState.value = currentState.copy(error = "First Name, Last Name, and Date of Birth are required")
            return
        }

        viewModelScope.launch {
            _uiState.value = currentState.copy(isLoading = true, error = null)
            try {
                val fullName = "${currentState.firstName.trim()} ${currentState.lastName.trim()}"
                repository.addPatient(
                    fullName = fullName,
                    dateOfBirth = currentState.dateOfBirth,
                    email = currentState.email.ifBlank { null }
                )
                _uiState.value = currentState.copy(isLoading = false, isSuccess = true)
            } catch (e: Exception) {
                _uiState.value = currentState.copy(isLoading = false, error = e.message ?: "Unknown error")
            }
        }
    }

    fun resetState() {
        _uiState.value = AddPatientUiState()
    }
}
