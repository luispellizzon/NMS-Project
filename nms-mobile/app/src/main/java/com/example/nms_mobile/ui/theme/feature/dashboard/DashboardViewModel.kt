package com.example.nms_mobile.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.AuthRepository
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.time.LocalTime

data class DashboardUiState(
    val displayName: String = "NMS",
    val greeting: String = "Good morning",
    val riskScore: Double? = null,
    val isLoadingScore: Boolean = false,
    val error: String? = null
)

class DashboardViewModel(
    private val repo: AuthRepository = AuthRepository.instance,
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) : ViewModel() {

    private val _ui = MutableStateFlow(DashboardUiState())
    val ui: StateFlow<DashboardUiState> = _ui.asStateFlow()

    init {
        // Name from global session (updated during sign-up/login)
        viewModelScope.launch {
            repo.session.collect { s ->
                val name = s.displayName?.takeIf { it.isNotBlank() } ?: "NMS"
                _ui.update {
                    it.copy(
                        displayName = name,
                        greeting = computeGreeting()
                    )
                }
            }
        }
        // Optionally load the latest risk score (if you’re computing/storing it)
        refreshRiskScore()
    }

    fun refreshRiskScore() {
        val uid = auth.currentUser?.uid ?: return
        viewModelScope.launch {
            _ui.update { it.copy(isLoadingScore = true, error = null) }
            try {
                // If you write results to: risk_assessments/{uid}/latest
                val snap = db.collection("risk_assessments")
                    .document(uid)
                    .collection("scores")
                    .document("latest")
                    .get()
                    .await()

                val score = snap.getDouble("score") // nullable
                _ui.update { it.copy(riskScore = score, isLoadingScore = false) }
            } catch (e: Exception) {
                _ui.update { it.copy(isLoadingScore = false, error = e.localizedMessage) }
            }
        }
    }

    private fun computeGreeting(): String {
        val hour = try { LocalTime.now().hour } catch (_: Throwable) { 9 }
        return when (hour) {
            in 5..11 -> "Good morning"
            in 12..17 -> "Good afternoon"
            else -> "Good evening"
        }
    }
}
