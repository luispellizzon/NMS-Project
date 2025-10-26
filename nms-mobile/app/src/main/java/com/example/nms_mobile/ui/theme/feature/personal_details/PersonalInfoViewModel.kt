package com.example.nms_mobile.ui.personaldetails

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.FirestoreRepository
import com.example.nms_mobile.data.UserProfile
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class PersonalInfoUiState(
    val fullName: String = "",
    val email: String = "",
    val role: String = "",
    val dateOfBirth: String = "",
    val isSubmitting: Boolean = false,
    val error: String? = null,
)

sealed class PersonalInfoEvent {
    data object SubmittedSuccessfully : PersonalInfoEvent()
}

class PersonalInfoViewModel(
    private val firestore: FirestoreRepository = FirestoreRepository.instance
) : ViewModel() {

    private val _uiState = MutableStateFlow(PersonalInfoUiState())
    val uiState: StateFlow<PersonalInfoUiState> = _uiState.asStateFlow()

    private val _events = Channel<PersonalInfoEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    fun onFullNameChange(value: String) = _uiState.update { it.copy(fullName = value, error = null) }
    fun onDateOfBirthChange(value: String) = _uiState.update { it.copy(dateOfBirth = value, error = null) }

    fun submit() {
        val s = _uiState.value
        val details = UserProfile(
            fullName = s.fullName,
            dateOfBirth = s.dateOfBirth,
            email = s.email,
            role = s.role
        )

        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, error = null) }
            try {
                firestore.saveUserDetails(details)
                _events.send(PersonalInfoEvent.SubmittedSuccessfully)
            } catch (e: Exception) {
                _uiState.update { it.copy(isSubmitting = false, error = e.localizedMessage) }
            }
        }
    }
}
