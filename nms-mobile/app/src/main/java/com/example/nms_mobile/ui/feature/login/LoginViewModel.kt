package com.example.nms_mobile.ui.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// Data model for the Login screen's state.
data class LoginUiState(
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false, // True when waiting for Firebase response.
    val error: String? = null,      // Stores any login or validation error message.
    val success: Boolean = false    // True if login was successful (triggers navigation).
)

class LoginViewModel(
    private val repository: AuthRepository = AuthRepository.instance
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    // The state that the UI watches for changes.
    val uiState: StateFlow<LoginUiState> = _uiState

    // Update email value and clear any existing error.
    fun onEmailChange(value: String) = _uiState.update { it.copy(email = value, error = null) }

    // Update password value and clear any existing error.
    fun onPasswordChange(value: String) = _uiState.update { it.copy(password = value, error = null) }

    fun login() {
        val (email, password) = _uiState.value

        // **IMPROVED VALIDATION**: Check inputs before calling the repository.
        val error = when {
            email.isBlank() -> "Email is required"
            // Use Android's built-in utility to check email format.
            !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() -> "Invalid email format"
            password.isBlank() -> "Password is required"
            password.length < 6 -> "Password must be at least 6 characters"
            else -> null
        }

        if (error != null) {
            // Stop if there is a validation error and display the message.
            _uiState.update { it.copy(error = error) }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                // Attempt to sign in via the repository.
                repository.login(email, password)
                // On success, set isLoading to false and success to true.
                _uiState.update { it.copy(isLoading = false, success = true) }
            } catch (e: Exception) {
                // On failure, stop loading and show the error message.
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "Login failed. Please check your credentials."
                    )
                }
            }
        }
    }

    // Clears the error message, often called when the user focuses on an input field.
    fun clearError() = _uiState.update { it.copy(error = null) }
}