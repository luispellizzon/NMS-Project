package com.example.nms_mobile.ui.signup

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class SignUpUiState(
    val email: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val success: Boolean = false
)

class SignUpViewModel(
    private val repository: AuthRepository = AuthRepository.instance
) : ViewModel() {

    private val _uiState = MutableStateFlow(SignUpUiState())
    val uiState: StateFlow<SignUpUiState> = _uiState

    fun onEmailChange(v: String) = _uiState.update { it.copy(email = v, error = null) }
    fun onPasswordChange(v: String) = _uiState.update { it.copy(password = v, error = null) }
    fun onConfirmPasswordChange(v: String) = _uiState.update { it.copy(confirmPassword = v, error = null) }

    fun signUp() {
        val s = _uiState.value

        // Validación completa
        val err = when {
            s.email.isBlank() -> "Email is required"
            !android.util.Patterns.EMAIL_ADDRESS.matcher(s.email).matches() -> "Invalid email format"
            s.password.isBlank() -> "Password is required"
            s.password.length < 6 -> "Password must be at least 6 characters"
            s.confirmPassword.isBlank() -> "Please confirm your password"
            s.password != s.confirmPassword -> "Passwords do not match"
            else -> null
        }

        if (err != null) {
            _uiState.update { it.copy(error = err) }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                // Solo crear cuenta en Firebase Auth
                // PersonalInfo capturará el resto de la información
                repository.signUpAuth(s.email, s.password)
                _uiState.update { it.copy(isLoading = false, success = true) }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "Sign up failed. Please try again."
                    )
                }
            }
        }
    }

    fun clearError() = _uiState.update { it.copy(error = null) }
}