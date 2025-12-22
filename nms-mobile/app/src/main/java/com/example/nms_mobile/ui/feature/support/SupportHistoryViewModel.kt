package com.example.nms_mobile.ui.feature.support

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.FirestoreRepository
import com.example.nms_mobile.data.SupportRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalTime

data class SupportHistoryUiState(
    val requests: List<SupportRequest> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null,
    val displayName: String = "NMS",
    val greeting: String = "Good morning"
)

class SupportHistoryViewModel(
    private val repository: FirestoreRepository = FirestoreRepository.instance
) : ViewModel() {

    private val _uiState = MutableStateFlow(SupportHistoryUiState())
    val uiState: StateFlow<SupportHistoryUiState> = _uiState.asStateFlow()

    init {
        loadUserProfile()
        updateGreeting()
        loadSupportRequests()
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

    fun loadSupportRequests() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val requests = repository.getUserSupportRequests()
                _uiState.update {
                    it.copy(
                        requests = requests,
                        isLoading = false
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load support requests"
                    )
                }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
