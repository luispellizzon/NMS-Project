package com.example.nms_mobile.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.AuthRepository
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class HomeUiState(
    val displayName: String = "User",
    val hasCompletedProfile: Boolean = false,
    val selectedTab: Int = 0
)

sealed class HomeEvent { data object LoggedOut : HomeEvent() }

class HomeViewModel(
    private val repo: AuthRepository = AuthRepository.instance
) : ViewModel() {

    private val _ui = MutableStateFlow(HomeUiState())
    val ui: StateFlow<HomeUiState> = _ui.asStateFlow()

    private val _events = Channel<HomeEvent>(Channel.BUFFERED)
    val events: Flow<HomeEvent> = _events.receiveAsFlow()

    init {
        // Observe global session and reflect displayName immediately
        viewModelScope.launch {
            repo.session.collect { sess ->
                val name = sess.displayName?.takeIf { it.isNotBlank() } ?: "User"
                _ui.update { it.copy(displayName = name) }
            }
        }
    }

    fun setHasCompletedProfile(value: Boolean) {
        _ui.update { it.copy(hasCompletedProfile = value) }
    }

    fun selectTab(index: Int) {
        _ui.update { it.copy(selectedTab = index) }
    }

    fun logout() = viewModelScope.launch {
        repo.logout()
        _events.send(HomeEvent.LoggedOut)
    }
}
