package com.example.nms_mobile.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.AuthRepository
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

// Data model for the Home screen's state (what the user sees).
data class HomeUiState(
    val displayName: String = "User", // The name shown in the greeting.
    val hasCompletedProfile: Boolean = false, // Controls whether to show the "Complete Profile" card.
    val selectedTab: Int = 0 // Which tab is currently active in the bottom navigation bar.
)

// Single events for the UI (like a navigation command).
sealed class HomeEvent { data object LoggedOut : HomeEvent() }

class HomeViewModel(
    private val repo: AuthRepository = AuthRepository.instance
) : ViewModel() {

    // The current data for the UI, which can be changed internally.
    private val _ui = MutableStateFlow(HomeUiState())
    // The state that the UI watches for changes.
    val ui: StateFlow<HomeUiState> = _ui.asStateFlow()

    // Events used for one-time actions like telling the app to navigate away after logout.
    private val _events = Channel<HomeEvent>(Channel.BUFFERED)
    val events: Flow<HomeEvent> = _events.receiveAsFlow()

    init {
        // Start a task that runs when the ViewModel is created.
        viewModelScope.launch {
            // Watch for changes in the user session (e.g., if the display name is updated).
            repo.session.collect { sess ->
                // Use the display name if it exists, otherwise default to "User".
                val name = sess.displayName?.takeIf { it.isNotBlank() } ?: "User"
                _ui.update { it.copy(displayName = name) }
            }
        }
    }

    // Function to update whether the user has finished setting up their profile.
    fun setHasCompletedProfile(value: Boolean) {
        _ui.update { it.copy(hasCompletedProfile = value) }
    }

    // Function to change the currently selected tab in the bottom navigation.
    fun selectTab(index: Int) {
        _ui.update { it.copy(selectedTab = index) }
    }

    // Tells the AuthRepository to sign the user out and sends a navigation event.
    fun logout() = viewModelScope.launch {
        repo.logout()
        _events.send(HomeEvent.LoggedOut) // Send event to trigger navigation away from Home.
    }
}