package com.example.nms_mobile.ui.feature.personal_details

import android.util.Patterns
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.AuthRepository
import com.example.nms_mobile.data.FirestoreRepository
import com.example.nms_mobile.data.UserProfile
import com.example.nms_mobile.data.UserTasks
import com.google.firebase.Timestamp
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

// Data model for the Personal Info screen's state.
data class PersonalInfoUiState(
    val fullName: String = "",
    val email: String = "",
    val role: String = "",
    val dateOfBirth: String = "",
    val location: String = "",
    val isCountryDropdownOpen: Boolean = false,
    val filteredCountries: List<String> = emptyList(),
    val isSubmitting: Boolean = false,
    val error: String? = null
)

private val countryList = listOf(
    "Ireland", "United Kingdom", "Brazil", "France", "Portugal",
    "Italy", "Spain", "Germany", "Finland", "Sweden", "Norway",
    "Denmark", "Estonia", "Latvia", "Lithuania", "Russia", "Poland"
)


// Single events for the UI (like navigation command).
sealed class PersonalInfoEvent {
    data object SubmittedSuccessfully : PersonalInfoEvent()
}

class PersonalInfoViewModel(
    private val firestore: FirestoreRepository = FirestoreRepository.instance,
    private val auth: AuthRepository = AuthRepository.instance
) : ViewModel() {

    private val _uiState = MutableStateFlow(PersonalInfoUiState())
    // The state that the UI watches for changes.
    val uiState: StateFlow<PersonalInfoUiState> = _uiState.asStateFlow()

    // Events used for one-time actions like navigating away after success.
    private val _events = Channel<PersonalInfoEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    init {
        // Pre-fill the form with existing authentication data on startup.
        viewModelScope.launch {
            val user = auth.currentUser()
            val email = user?.email ?: ""
            val displayName = user?.displayName ?: ""

            _uiState.update {
                it.copy(
                    email = email,
                    fullName = displayName  // Pre-fill if display name exists.
                )
            }
        }
    }

    // Handlers for input changes, clearing errors on user interaction.
    fun onFullNameChange(value: String) = _uiState.update { it.copy(fullName = value, error = null) }
    fun onDateOfBirthChange(value: String) = _uiState.update { it.copy(dateOfBirth = value, error = null) }
    fun onEmailChange(value: String) = _uiState.update { it.copy(email = value, error = null) }
    fun onRoleChange(value: String) = _uiState.update { it.copy(role = value, error = null) }

    fun submit() {
        val s = _uiState.value

        // --- VALIDATION LOGIC ---
        val error = when {
            s.fullName.isBlank() -> "Full name is required"
            s.fullName.length < 2 -> "Full name must be at least 2 characters"
            s.dateOfBirth.isBlank() -> "Date of birth is required"
            // Check for DD/MM/YYYY format using a simple regex.
            !s.dateOfBirth.matches(Regex("""\d{2}/\d{2}/\d{4}""")) -> "Date must be in DD/MM/YYYY format"
            s.email.isBlank() -> "Email is required"
            // Use Android's utility to validate email format.
            !Patterns.EMAIL_ADDRESS.matcher(s.email).matches() -> "Invalid email format"
            s.role.isBlank() -> "Please select a role (Patient or Caregiver)"
            s.role !in listOf("patient", "caregiver") -> "Invalid role selected"
            s.location !in countryList -> "Select a country"
            else -> null
        }

        if (error != null) {
            _uiState.update { it.copy(error = error) }
            return
        }

        // --- AUTHENTICATION CHECK ---
        val uid = auth.currentUser()?.uid
        if (uid == null) {
            _uiState.update { it.copy(error = "User not authenticated. Please login again.") }
            return
        }
        var userDetails: UserProfile? = null
        // Create the data object to be saved.
        if(s.role == "patient"){
            userDetails = UserProfile(
                uid = uid,
                fullName = s.fullName.trim(),
                dateOfBirth = s.dateOfBirth,
                email = s.email.trim(),
                role = s.role,
                createdAt = Timestamp.now(),
                currentTask = UserTasks.RISK_ASSESSMENT.taskName,
                hasCompletedRiskAssessment = false,
                hasCompletedImageDescription = false,
                hasCompletedSpeechAssessment = false,
                hasCompletedMemoryAssessment = false
            )
        } else {
            userDetails = UserProfile(
                uid = uid,
                fullName = s.fullName.trim(),
                dateOfBirth = s.dateOfBirth,
                email = s.email.trim(),
                role = s.role,
                createdAt = Timestamp.now(),
                currentTask = UserTasks.RISK_ASSESSMENT.taskName,
                hasCompletedRiskAssessment = false,
                hasCompletedImageDescription = false,
                hasCompletedSpeechAssessment = false,
                hasCompletedMemoryAssessment = false
            )
        }


        // --- SUBMISSION LOGIC ---
        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, error = null) }
            try {
                // 1. Save the profile data to Firestore.
                firestore.createUserProfile(userDetails)

                // 2. Update the user's display name in Firebase Auth (for quick access).
                auth.updateDisplayName(s.fullName.trim())

                _uiState.update { it.copy(isSubmitting = false) }
                // 3. Send event to trigger successful navigation.
                _events.send(PersonalInfoEvent.SubmittedSuccessfully)
            } catch (e: Exception) {
                // Handle any submission errors.s
                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        error = e.localizedMessage ?: "Failed to save profile. Please try again."
                    )
                }
            }
        }
    }

    private val allCountries = countryList.sorted()

    private var debounceJob: Job? = null

    fun onCountryChange(value: String) {
        _uiState.update { it.copy(location = value, error = null) }

        debounceJob?.cancel()
        debounceJob = viewModelScope.launch {
            delay(300)

            val filtered = if (value.isBlank()) {
                allCountries                   // show all on first click or cleared text
            } else {
                allCountries.filter {
                    it.contains(value, ignoreCase = true)
                }
            }

            _uiState.update { it.copy(filteredCountries = filtered) }
        }
    }

    fun onFieldFocused() {
        _uiState.update {
            it.copy(filteredCountries = allCountries)
        }
    }

    fun onCountrySelected(country: String) {
        _uiState.update {
            it.copy(
                location = country,
                filteredCountries = emptyList()
            )
        }
    }


}