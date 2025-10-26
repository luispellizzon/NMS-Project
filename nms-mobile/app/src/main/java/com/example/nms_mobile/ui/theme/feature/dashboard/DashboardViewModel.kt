package com.example.nms_mobile.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.AuthRepository
import com.example.nms_mobile.data.FirestoreRepository
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import java.time.LocalTime

data class DashboardUiState(
    val displayName: String = "NMS",
    val greeting: String = "Good morning",
    val riskScore: Double? = null,
    val isLoadingScore: Boolean = false,
    val error: String? = null
)

sealed class DashboardEvent { data object LoggedOut : DashboardEvent() }

class DashboardViewModel(
    private val repo: AuthRepository = AuthRepository.instance,
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val db: FirestoreRepository = FirestoreRepository.instance
) : ViewModel() {


    private val _ui = MutableStateFlow(DashboardUiState())
    val ui: StateFlow<DashboardUiState> = _ui.asStateFlow()

    // OPTIONAL: one-shot events for navigation
    private val _events = Channel<DashboardEvent>(Channel.BUFFERED)
    val events: Flow<DashboardEvent> = _events.receiveAsFlow()

    init {
        viewModelScope.launch {
            repo.session.collect { s ->
                val name = s.displayName?.takeIf { it.isNotBlank() } ?: "NMS"
                _ui.update { it.copy(displayName = name, greeting = computeGreeting()) }
            }
        }
//        refreshRiskScore()
        // Works as a useEffect in react, it runs when it mounts so we can load the risk results here for display
    }


    private fun computeGreeting(): String {
        val hour = try { LocalTime.now().hour } catch (_: Throwable) { 9 }
        return when (hour) {
            in 5..11 -> "Good morning"
            in 12..17 -> "Good afternoon"
            else -> "Good evening"
        }
    }

    fun logout() = viewModelScope.launch {
        repo.logout()
        _events.send(DashboardEvent.LoggedOut)
    }
}
