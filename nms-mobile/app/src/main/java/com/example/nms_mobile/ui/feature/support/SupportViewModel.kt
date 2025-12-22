package com.example.nms_mobile.ui.feature.support

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.FirestoreRepository
import com.example.nms_mobile.data.SupportRequestPriority
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalTime

data class SupportUiState(
    val subject: String = "",
    val message: String = "",
    val priority: SupportRequestPriority = SupportRequestPriority.MEDIUM,
    val isSubmitting: Boolean = false,
    val isSuccess: Boolean = false,
    val ticketId: String? = null,
    val error: String? = null,
    val displayName: String = "NMS",
    val greeting: String = "Good morning",
    // Validation errors
    val subjectError: String? = null,
    val messageError: String? = null
)

class SupportViewModel(
    private val repository: FirestoreRepository = FirestoreRepository.instance
) : ViewModel() {

    private val _uiState = MutableStateFlow(SupportUiState())
    val uiState: StateFlow<SupportUiState> = _uiState.asStateFlow()

    init {
        loadUserProfile()
        updateGreeting()
    }

    private fun loadUserProfile() {
        viewModelScope.launch {
            try {
                val profile = repository.getUserProfile()
                _uiState.update {
                    it.copy(displayName = profile?.fullName?.takeIf { name -> name.isNotBlank() } ?: "NMS")
                }
            } catch (e: Exception) {
                // Silent fail - use default name
            }
        }
    }

    private fun updateGreeting() {
        val hour = LocalTime.now().hour
        val greeting = when (hour) {
            in 5..11 -> "Good morning"
            in 12..17 -> "Good afternoon"
            else -> "Good evening"
        }
        _uiState.update { it.copy(greeting = greeting) }
    }

    fun onSubjectChange(subject: String) {
        if (subject.length <= 100) {
            _uiState.update {
                it.copy(
                    subject = subject,
                    subjectError = null
                )
            }
        }
    }

    fun onMessageChange(message: String) {
        if (message.length <= 1000) {
            _uiState.update {
                it.copy(
                    message = message,
                    messageError = null
                )
            }
        }
    }

    fun onPriorityChange(priority: SupportRequestPriority) {
        _uiState.update { it.copy(priority = priority) }
    }

    fun submitRequest() {
        val state = _uiState.value

        // Validation
        var hasError = false
        var subjectError: String? = null
        var messageError: String? = null

        if (state.subject.isBlank()) {
            subjectError = "Subject is required"
            hasError = true
        } else if (state.subject.length < 5) {
            subjectError = "Subject must be at least 5 characters"
            hasError = true
        }

        if (state.message.isBlank()) {
            messageError = "Message is required"
            hasError = true
        } else if (state.message.length < 20) {
            messageError = "Please provide more detail (at least 20 characters)"
            hasError = true
        }

        if (hasError) {
            _uiState.update {
                it.copy(
                    subjectError = subjectError,
                    messageError = messageError
                )
            }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, error = null) }

            try {
                val ticketId = repository.submitSupportRequest(
                    subject = state.subject,
                    message = state.message,
                    priority = state.priority
                )
                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        isSuccess = true,
                        ticketId = ticketId
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        error = e.message ?: "Failed to submit request"
                    )
                }
            }
        }
    }

    fun resetSuccess() {
        _uiState.update {
            it.copy(
                isSuccess = false,
                ticketId = null,
                subject = "",
                message = "",
                priority = SupportRequestPriority.MEDIUM,
                subjectError = null,
                messageError = null
            )
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
