package com.example.nms_mobile.data

import android.util.Log
import com.example.nms_mobile.api.sendToHuggingFaceGradioAndGetResult
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query.Direction.DESCENDING
import kotlinx.coroutines.tasks.await

class AIRepository private constructor(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val userdb: FirestoreRepository = FirestoreRepository.instance
) {

    companion object {
        val instance: AIRepository by lazy { AIRepository() }
        private const val TAG = "AIRepository"
        private const val USERS = "users"
        private const val RISK = "risk_assessment"
        private const val SPEECH = "speech_assessment"
        private const val MEMORY = "memory_tests"
        private const val COGNITIVE = "cognitive_assessments"

        private const val PATIENTS_PREDICTION_RESULTS = "patients_prediction_results"
    }

    suspend fun calculateAndStoreMmseScore(): Int {
        val userId = PatientSessionManager.getActiveUserId()

        val collections = listOf(RISK, SPEECH, MEMORY, COGNITIVE)
        var totalScore = 0

        for (collection in collections) {
            val snapshot = db.collection(USERS)
                .document(userId)
                .collection(collection)
                .orderBy("startedAt", DESCENDING)
                .limit(1)
                .get()
                .await()

            val doc = snapshot.documents.firstOrNull()
            val score = doc?.getLong("totalScore")?.toInt() ?: 0
            Log.d("Score", score.toString())
            totalScore += score
        }

        // Write the aggregated score to the user document
        db.collection(USERS)
            .document(userId)
            .update("mmseScore", totalScore)
            .await()

        return totalScore
    }
    suspend fun getLatestRiskAssessment(): Map<String, Any>? {
        val userId = PatientSessionManager.getActiveUserId()

        val snapshot = db.collection("users")
            .document(userId)
            .collection("risk_assessment")
            .get()
            .await()

        return snapshot.documents.firstOrNull()?.data
    }

    suspend fun calcRiskPrediction(score: Int, risk: Map<String, Any>): String {
        val userId = PatientSessionManager.getActiveUserId()
        val colRef = db.collection(PATIENTS_PREDICTION_RESULTS)
        val resultJson = sendToHuggingFaceGradioAndGetResult(score, risk)
        var res: String? = null

        if(resultJson.has("Dementia Risk")) {
            val lifestyleSeverity = resultJson.getDouble("Lifestyle Severity (0–1)")
            val mmseSeverity = resultJson.getDouble("MMSE → Severity (0–1)")
            val fusedSeverity = resultJson.getDouble("Fused Severity (0–1)")
            val estimatedMMSE = resultJson.getDouble("Estimated Fused MMSE (0–30)")
            val dementiaRisk = resultJson.getString("Dementia Risk")

            val resultData = mapOf(
                "lifestyleSeverity" to lifestyleSeverity,
                "mmseSeverity" to mmseSeverity,
                "fusedSeverity" to fusedSeverity,
                "estimatedFusedMMSE" to estimatedMMSE,
                "dementiaRisk" to dementiaRisk,
                "userId" to userId,
                "createdAt" to com.google.firebase.Timestamp.now()
            )
            colRef.document(userId).set(resultData)
            res = resultJson.getString("Dementia Risk")
            userdb.updateTask("hasCompletedAiAnalysis", UserTasks.COMPLETED.taskName)
            Log.d("HF", "Final Model Output: $res")
        }
        else {
            throw Exception("Invalid JSON response from Hugging Face prediction results!")
        }
        return res
    }

}
