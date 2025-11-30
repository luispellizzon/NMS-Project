package com.example.nms_mobile.ui.feature.addpatient

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.PatientRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// 1. Updated State to include Location and Consent
data class AddPatientUiState(
    val firstName: String = "",
    val lastName: String = "",
    val dateOfBirth: String = "",
    val email: String = "",
    val location: String = "",
    val dataUsageConsent: Boolean = false,
    
    val filteredCountries: List<String> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val isSuccess: Boolean = false
)

private val countryList = listOf(
    "Ireland", "United Kingdom", "Brazil", "France", "Portugal",
    "Italy", "Spain", "Germany", "Finland", "Sweden", "Norway",
    "Denmark", "Estonia", "Latvia", "Lithuania", "Russia", "Poland"
)

class AddPatientViewModel : ViewModel() {
    private val repository = PatientRepository.instance
    private val allCountries = countryList.sorted()
    private var debounceJob: Job? = null

    private val _uiState = MutableStateFlow(AddPatientUiState())
    val uiState: StateFlow<AddPatientUiState> = _uiState.asStateFlow()

    fun onFirstNameChange(newFirstName: String) {
        _uiState.update { it.copy(firstName = newFirstName, error = null) }
    }

    fun onLastNameChange(newLastName: String) {
        _uiState.update { it.copy(lastName = newLastName, error = null) }
    }

    fun onDateOfBirthChange(newDob: String) {
        _uiState.update { it.copy(dateOfBirth = newDob, error = null) }
    }

    fun onEmailChange(newEmail: String) {
        _uiState.update { it.copy(email = newEmail, error = null) }
    }

    // --- NEW: Consent Handler ---
    fun onConsentChange(isChecked: Boolean) {
        _uiState.update { it.copy(dataUsageConsent = isChecked) }
    }

    // --- NEW: Location Handlers ---
    fun onLocationChange(value: String) {
        _uiState.update { it.copy(location = value, error = null) }

        debounceJob?.cancel()
        debounceJob = viewModelScope.launch {
            delay(300)
            val filtered = if (value.isBlank()) {
                allCountries
            } else {
                allCountries.filter { it.contains(value, ignoreCase = true) }
            }
            _uiState.update { it.copy(filteredCountries = filtered) }
        }
    }

    fun onFieldFocused() {
        _uiState.update { it.copy(filteredCountries = allCountries) }
    }

    fun onLocationSelected(country: String) {
        _uiState.update { 
            it.copy(location = country, filteredCountries = emptyList()) 
        }
    }

    fun onCreatePatient() {
        val s = _uiState.value

        // --- Validation ---
        if (s.firstName.isBlank() || s.lastName.isBlank() || s.dateOfBirth.isBlank()) {
            _uiState.update { it.copy(error = "First Name, Last Name, and Date of Birth are required") }
            return
        }

        // Email is now MANDATORY
        if (s.email.isBlank()) {
            _uiState.update { it.copy(error = "Email is required for patient accounts") }
            return
        }

        // Location check
        if (s.location.isBlank() || s.location !in countryList) {
            _uiState.update { it.copy(error = "Please select a valid country from the list") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val fullName = "${s.firstName.trim()} ${s.lastName.trim()}"
                
                // Pass new fields to repository
                repository.addPatient(
                    fullName = fullName,
                    dateOfBirth = s.dateOfBirth,
                    email = s.email.trim(),
                    location = s.location,
                    dataUsageConsent = s.dataUsageConsent
                )
                
                _uiState.update { it.copy(isLoading = false, isSuccess = true) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message ?: "Unknown error") }
            }
        }
    }

    fun resetState() {
        _uiState.value = AddPatientUiState()
    }
}