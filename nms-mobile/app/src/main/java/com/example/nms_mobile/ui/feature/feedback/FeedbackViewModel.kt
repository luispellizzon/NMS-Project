package com.example.nms_mobile.ui.feature.feedback

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.FirestoreRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class FeedbackUiState(
    val rating: Int = 0,
    val review: String = "",
    val isSubmitting: Boolean = false,
    val isSuccess: Boolean = false,
    val error: String? = null
)

class FeedbackViewModel(
    private val repository: FirestoreRepository = FirestoreRepository.instance
) : ViewModel() {

    private val _uiState = MutableStateFlow(FeedbackUiState())
    val uiState: StateFlow<FeedbackUiState> = _uiState.asStateFlow()

    fun onRatingChanged(rating: Int) {
        _uiState.update { it.copy(rating = rating) }
    }

    fun onReviewChanged(review: String) {
        _uiState.update { it.copy(review = review) }
    }

    fun submitFeedback() {
        val currentState = _uiState.value
        if (currentState.rating == 0) return

        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, error = null) }
            try {
                repository.submitFeedback(currentState.rating, currentState.review)
                _uiState.update { it.copy(isSubmitting = false, isSuccess = true) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isSubmitting = false, error = e.message) }
            }
        }
    }

    fun resetSuccess() {
         _uiState.update { it.copy(isSuccess = false) }
    }
}
