package com.example.nms_mobile.ui.feature.login

import android.util.Log
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
    val success: Boolean = false,    // True if login was successful (triggers navigation).
    val requiresLinking: Boolean = false,
    val pendingCredentialProvider: String? = null
)
class LoginViewModel(
    private val repository: AuthRepository = AuthRepository.instance
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState

    fun onEmailChange(value: String) = _uiState.update { it.copy(email = value, error = null) }
    fun onPasswordChange(value: String) = _uiState.update { it.copy(password = value, error = null) }

    // Standard Email/Password login
    fun login() {
        val (email, password) = _uiState.value

        val error = when {
            email.isBlank() -> "Email is required"
            !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() -> "Invalid email format"
            password.isBlank() -> "Password is required"
            password.length < 6 -> "Password must be at least 6 characters"
            else -> null
        }

        if (error != null) {
            _uiState.update { it.copy(error = error) }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            runCatching {
                repository.login(email, password)
            }.onSuccess {
                _uiState.update { it.copy(isLoading = false, success = true) }
            }.onFailure { e ->
                _uiState.update {
                    it.copy(isLoading = false,
                        error = e.localizedMessage ?: "Login failed. Please check your credentials.")
                }
            }
        }
    }

    // GOOGLE LOGIN
    fun loginWithGoogle(idToken: String) = socialLogin(
        provider = "google",
        action = { repository.signInWithGoogle(idToken) }
    )

    // FACEBOOK LOGIN
    fun loginWithFacebook(accessToken: String) = socialLogin(
        provider = "facebook",
        action = { repository.signInWithFacebook(accessToken) }
    )


    /**
     * Shared social login handler
     */
    private fun socialLogin(
        provider: String,
        action: suspend () -> Unit
    ) {
        Log.d("SocialLogin", "Attempting to login with $provider")

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            runCatching { action() }
                .onSuccess {
                    _uiState.update { it.copy(isLoading = false, success = true) }
                }
                .onFailure { e ->
                    if (e is com.google.firebase.auth.FirebaseAuthUserCollisionException) {
                        // Provider collision â†’ ask UI if user wants to link
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                requiresLinking = true,             // UI can open a dialog
                                pendingCredentialProvider = provider
                            )
                        }
                    } else {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                error = e.localizedMessage ?: "Authentication failed"
                            )
                        }
                    }
                }
        }
    }

    /**
     * Called after the user confirms linking
     */
    fun confirmProviderLink(idToken: String?, accessToken: String?, nonce: String?) {
        val provider = _uiState.value.pendingCredentialProvider ?: return

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }

            runCatching {
                when (provider) {
                    "google"   -> repository.linkGoogleCredential(idToken!!)
                    "facebook" -> repository.linkFacebookCredential(accessToken!!)
                }
            }.onSuccess {
                _uiState.update { it.copy(isLoading = false, success = true, requiresLinking = false) }
            }.onFailure { e ->
                _uiState.update {
                    it.copy(isLoading = false,
                        error = e.localizedMessage ?: "Failed to link provider")
                }
            }
        }
    }

    fun clearError() = _uiState.update { it.copy(error = null) }
}