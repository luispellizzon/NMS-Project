package com.example.nms_mobile.ui.feature.results

import android.content.Context
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.R
import com.example.nms_mobile.data.AuthRepository
import com.example.nms_mobile.utils.KeyLoader
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit


data class Results(
    val dementiaRisk: String? = null,
    val mmseScore: Int = 0,
    val mmseScoreMaxScore: Int = 30,
    val speechScore: Int = 0,
    val speechMaxScore: Int = 17,
    val cognitiveScore: Int = 0,
    val cognitiveMaxScore: Int = 7,
    val memoryScore: Int = 0,
    val memoryMaxScore: Int = 6,
)

data class ResultsUi(
    var results: Results? = null,
    var isLoading: Boolean = false,
    var error: String? = null,
    val hasPaid: Boolean = false,
    val isProcessingPayment: Boolean = false,
    val paymentError: String? = null
)

class ResultsViewModel(
    private val auth: AuthRepository = AuthRepository.instance,
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) : ViewModel() {

    private val _ui = MutableStateFlow(ResultsUi())
    val ui: StateFlow<ResultsUi> = _ui.asStateFlow()


    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    companion object {
        private const val TAG = "ResultsViewModel"
    }

    init {
        loadResults()
        observePaymentStatus()
    }

    fun loadResults() {
        viewModelScope.launch {
            _ui.value = _ui.value.copy(isLoading = true, error = null)
            try {
                val (results, hasPaid) = fetchResults()
                _ui.value = _ui.value.copy(
                    results = results,
                    hasPaid = hasPaid,
                    isLoading = false
                )
                Log.d(TAG, "Results loaded successfully. Has paid: $hasPaid")
            } catch (e: Exception) {
                Log.e(TAG, "Error loading results", e)
                _ui.value = _ui.value.copy(
                    error = e.message ?: "Failed to load results",
                    isLoading = false
                )
            }
        }
    }

    private suspend fun fetchResults(): Pair<Results, Boolean> {
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
            val hasPaid = userDoc.getBoolean("hasPaidForResults") ?: false

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
            ) to hasPaid

        } catch (e: Exception) {
            throw Exception("Failed to fetch results: ${e.message}")
        }
    }

    // ==================== PAYMENT FUNCTIONS ====================

    /**
     * Create a payment intent with Stripe
     * @param onSuccess callback with (clientSecret, paymentIntentId)
     */
    fun createPaymentIntent(
        onSuccess: (String, String) -> Unit,
    ) {
        viewModelScope.launch {
            _ui.update { it.copy(isProcessingPayment = true, paymentError = null) }

            try {
                val userId = auth.currentUser()?.uid
                    ?: throw Exception("User not authenticated")

                val result = withContext(Dispatchers.IO) {
                    val json = JSONObject().apply {
                        put("userId", userId)
                        put("amount", 999) // €9.99 euro
                        put("currency", "eur")
                    }

                    val requestBody = json.toString()
                        .toRequestBody("application/json; charset=utf-8".toMediaType())

                    val request = Request.Builder()
                        .url("${KeyLoader.stripe_base_url}/create-payment-intent")
                        .post(requestBody)
                        .build()

                    val response = httpClient.newCall(request).execute()
                    val body = response.body?.string()

                    if (!response.isSuccessful || body == null) {
                        throw Exception("HTTP ${response.code}")
                    }

                    JSONObject(body)
                }

                val clientSecret = result.getString("clientSecret")
                val paymentIntentId = result.getString("paymentIntentId")

                _ui.update { it.copy(isProcessingPayment = false) }
                onSuccess(clientSecret, paymentIntentId)

            } catch (e: Exception) {
                val error = "Payment error: ${e.message}"
                Log.e(TAG, error, e)
                _ui.update { it.copy(isProcessingPayment = false, paymentError = error) }
            }
        }
    }

    private fun observePaymentStatus() {
        val userId = auth.currentUser()?.uid ?: return

        db.collection("users")
            .document(userId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.e(TAG, "Payment status listener error", error)
                    return@addSnapshotListener
                }

                if (snapshot != null && snapshot.exists()) {
                    val hasPaid = snapshot.getBoolean("hasPaidForResults") ?: false
                    _ui.update { it.copy(hasPaid = hasPaid) }
                    Log.d(TAG, "Payment status updated: $hasPaid")
                }
            }
    }

    fun clearPaymentError() {
        _ui.update { it.copy(paymentError = null) }
    }
}