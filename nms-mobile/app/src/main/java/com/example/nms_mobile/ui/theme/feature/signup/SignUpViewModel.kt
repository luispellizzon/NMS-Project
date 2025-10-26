package com.example.nms_mobile.ui.signup

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.auth.LocalAuth
import com.example.nms_mobile.data.AuthRepository
import com.example.nms_mobile.data.FirestoreRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
data class SignUpUiState(
    val fullName: String = "",
    val dob: String = "",                 // e.g., "1990-04-23" (ISO-8601)
    val email: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val role: String = "patient",         // default
    val isLoading: Boolean = false,
    val error: String? = null,
    val success: Boolean = false
)

class SignUpViewModel(
    private val repository: AuthRepository = AuthRepository.instance
) : ViewModel() {

    private val _uiState = MutableStateFlow(SignUpUiState())
    val uiState: StateFlow<SignUpUiState> = _uiState

    fun onFullNameChange(v: String) = _uiState.update { it.copy(fullName = v, error = null) }
    fun onDobChange(v: String)       = _uiState.update { it.copy(dob = v, error = null) }
    fun onEmailChange(v: String)     = _uiState.update { it.copy(email = v, error = null) }
    fun onPasswordChange(v: String)  = _uiState.update { it.copy(password = v, error = null) }
    fun onConfirmPasswordChange(v: String) = _uiState.update { it.copy(confirmPassword = v, error = null) }
    fun onRoleChange(v: String)      = _uiState.update { it.copy(role = v, error = null) }

    fun signUp() {
        val s = _uiState.value
        val err = when {
            s.fullName.isBlank()            -> "Full name is required"
            s.dob.isBlank()                 -> "Date of birth is required"
            !s.dob.matches(Regex("""\d{2}/\d{2}/\d{4}""")) -> "DOB must be YYYY-MM-DD"
            s.email.isBlank()               -> "Email is required"
            s.password.isBlank()            -> "Password is required"
            s.password.length < 6           -> "Password must be at least 6 characters"
            s.confirmPassword.isBlank()     -> "Please confirm your password"
            s.password != s.confirmPassword -> "Passwords do not match"
            s.role !in listOf("patient","caregiver") -> "Invalid role"
            else -> null
        }
        if (err != null) { _uiState.update { it.copy(error = err) }; return }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                repository.signUp(
                    name = s.fullName,
                    email = s.email,
                    password = s.password,
                    dob = s.dob,
                    role = s.role
                )
                _uiState.update { it.copy(isLoading = false, success = true) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.localizedMessage ?: "Sign up failed") }
            }
        }
    }

    fun clearError() = _uiState.update { it.copy(error = null) }
}
