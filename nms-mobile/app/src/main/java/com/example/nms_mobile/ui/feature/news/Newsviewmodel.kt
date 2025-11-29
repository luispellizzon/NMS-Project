package com.example.nms_mobile.ui.feature.news

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.api.AgentsApiClient
import com.example.nms_mobile.api.GenerateNewsRequest
import com.example.nms_mobile.api.NewsArticle
import com.example.nms_mobile.data.NewsRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class NewsUiState(
    val articles: List<NewsArticle> = emptyList(),
    val isLoading: Boolean = false,
    val isGenerating: Boolean = false,
    val error: String? = null,
    val selectedAudience: String = "patient", // "patient" or "medical"
    val lastGenerationMessage: String? = null
)

class NewsViewModel(
    private val repository: NewsRepository = NewsRepository.instance
) : ViewModel() {

    companion object {
        private const val TAG = "NewsViewModel"
    }

    private val _uiState = MutableStateFlow(NewsUiState())
    val uiState: StateFlow<NewsUiState> = _uiState.asStateFlow()

    init {
        // Load articles when ViewModel is created
        loadNews()
    }

    /**
     * Load news articles from Firestore
     */
    fun loadNews() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            try {
                val articles = if (_uiState.value.selectedAudience == "patient") {
                    repository.getPatientNews(limit = 20)
                } else {
                    repository.getMedicalNews(limit = 20)
                }

                _uiState.update {
                    it.copy(
                        articles = articles,
                        isLoading = false
                    )
                }

                Log.d(TAG, "Loaded ${articles.size} articles for ${_uiState.value.selectedAudience} audience")
            } catch (e: Exception) {
                Log.e(TAG, "Error loading news", e)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = "Failed to load news: ${e.localizedMessage}"
                    )
                }
            }
        }
    }

    /**
     * Switch between patient and medical news
     */
    fun setAudience(audience: String) {
        if (audience != _uiState.value.selectedAudience) {
            _uiState.update { it.copy(selectedAudience = audience) }
            loadNews()
        }
    }

    /**
     * Generate new news articles using the Agents service
     */
    fun generateNews(topic: String = "alzheimer dementia cognitive decline prevention") {
        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    isGenerating = true,
                    error = null,
                    lastGenerationMessage = null
                )
            }

            try {
                val response = AgentsApiClient.api.generateNews(
                    GenerateNewsRequest(
                        audience = _uiState.value.selectedAudience,
                        topic = topic,
                        max_articles = 3
                    )
                )

                Log.d(TAG, "News generation response: ${response.status} - ${response.message}")

                _uiState.update {
                    it.copy(
                        isGenerating = false,
                        lastGenerationMessage = "News generation started! Articles will appear in 30-60 seconds. Pull down to refresh."
                    )
                }

                // Auto-refresh after 60 seconds
                delay(60000)
                loadNews()

            } catch (e: Exception) {
                Log.e(TAG, "Error generating news", e)
                _uiState.update {
                    it.copy(
                        isGenerating = false,
                        error = "Failed to generate news: ${e.localizedMessage}"
                    )
                }
            }
        }
    }

    /**
     * Clear error message
     */
    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }

    /**
     * Clear last generation message
     */
    fun clearLastGenerationMessage() {
        _uiState.update { it.copy(lastGenerationMessage = null) }
    }
}