package com.example.nms_mobile.ui.feature.results

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.AuthRepository
import com.example.nms_mobile.data.FirestoreRepository
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await


data class Results(
    val dementiaRisk: String? = null,
    val mmseScore: Int = 0,
    val speechScore: Int = 0,
    val speechMaxScore: Int = 17,
    val cognitiveScore: Int = 0,
    val cognitiveMaxScore: Int = 7,
    val memoryScore: Int = 0,
    val memoryMaxScore: Int = 6,
    val isLoading: Boolean = false,
    val error: String? = null
)

data class ResultsUi(
    var results: Results? = null,
    var isLoading: Boolean = false,
    var error: String? = null
)

class ResultsViewModel(
    private val auth: AuthRepository = AuthRepository.instance,
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) : ViewModel() {
    private val _ui = MutableStateFlow(ResultsUi())
    val ui: StateFlow<ResultsUi> = _ui.asStateFlow()

    init {
        loadResults()
    }

    fun loadResults() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null)
            try {
                val results = fetchResults()
                _ui.value = _ui.value.copy(
                    results = results,
                    isLoading = false
                )
            } catch (e: Exception) {
                _ui.value = _ui.value.copy(
                    error = e.message ?: "Failed to load results",
                    isLoading = false
                )
            }
        }
    }

    private suspend fun fetchResults(): Results {
        val userId = auth.currentUser()?.uid
            ?: throw Exception("User not authenticated")

        try {
            val userDoc = db
                .collection("users")
                .document(userId)
                .get()
                .await()

            val mmseScore = userDoc.getLong("mmseScore")?.toInt() ?: 0
            val dementiaRisk = userDoc.getString("dementiaRisk")

            val speechAssessments = db
                .collection("users")
                .document(userId)
                .collection("speech_assessment")
                .orderBy("startedAt", Query.Direction.DESCENDING)
                .limit(1)
                .get()
                .await()

            val speechScore = if (!speechAssessments.isEmpty) {
                speechAssessments.documents[0].getLong("totalScore")?.toInt() ?: 0
            } else {
                0
            }

            val memoryTests = db
                .collection("users")
                .document(userId)
                .collection("memory_tests")
                .orderBy("startedAt", Query.Direction.DESCENDING)
                .limit(1)
                .get()
                .await()

            val memoryScore = if (!memoryTests.isEmpty) {
                memoryTests.documents[0].getLong("totalScore")?.toInt() ?: 0
            } else {
                0
            }

            val cognitiveAssessments = db
                .collection("users")
                .document(userId)
                .collection("cognitive_assessments")
                .orderBy("startedAt", Query.Direction.DESCENDING)
                .limit(1)
                .get()
                .await()

            val cognitiveScore = if (!cognitiveAssessments.isEmpty) {
                cognitiveAssessments.documents[0].getLong("totalScore")?.toInt() ?: 0
            } else {
                0
            }

            return Results(
                dementiaRisk = dementiaRisk,
                mmseScore = mmseScore,
                speechScore = speechScore,
                cognitiveScore = cognitiveScore,
                memoryScore = memoryScore
            )

        } catch (e: Exception) {
            throw Exception("Failed to fetch results: ${e.message}")
        }
    }

}