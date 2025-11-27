package com.example.nms_mobile.data

import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

/* ---------- Data models ---------- */

data class UserProfile(
    val uid: String = "",
    val fullName: String = "",
    val dateOfBirth: String = "",
    val email: String = "",
    val role: String = "patient",
    val createdAt: Timestamp = Timestamp.now(),
    val currentTask: String = UserTasks.RISK_ASSESSMENT.taskName,
    val hasCompletedRiskAssessment: Boolean = false,
    val hasCompletedImageDescription: Boolean = false,
    val hasCompletedSpeechAssessment: Boolean = false,
    val hasCompletedMemoryAssessment: Boolean = false,
    val hasCompletedCognitiveAssessment: Boolean = false,
    val mmseScore: Int = 0,
    val location: String = "",
    val dementiaRisk: String = "",
    val hasCompletedAiAnalysis: Boolean = false
)

enum class UserTasks(
    val taskName: String
){
    RISK_ASSESSMENT(taskName="risk_assessment"),
    IMAGE_DESCRIPTION(taskName="image_description_assessment"),
    SPEECH_ASSESSMENT(taskName= "speech_assessment"),
    MEMORY_ASSESSMENT(taskName="memory_assessment"),
    COGNITIVE_ASSESSMENT(taskName = "cognitive_assessment"),
    AI_ASSESSMENT(taskName = "ai_assessment"),
    COMPLETED(taskName = "completed")
}

data class CombinedQuestionnaire(
    // names intentionally match your HF model schema
    val dominant_hand: String = "",
    val smoking_status: String = "",
    val alcohol_use: String = "",
    val physical_activity: String = "",
    val nutrition_diet: String = "",
    val sleep_quality: String = "",
    val diabetic: String = "",                  // "0" or "1"
    val family_history: String = "",            // "Yes"/"No"
    val depression_status: String = "",         // "Yes"/"No"
    val genetic: String = "",                   // "Positive"/"Negative"
    val medication_history: String = "",        // "Yes"/"No"
    val chronic_health_conditions: String = "",
    val age: Int? = null,                       // if you decide to include here too
    val weight: Int? = null,
    val gender: String? = null,
    val education_level: String? = null
)

class FirestoreRepository private constructor(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) {

    /* ---------- User Details ---------- */
    suspend fun createUserProfile(profile: UserProfile ) {
        val uid = uidOrThrow()
        userDoc(uid).set(profile).await()
    }

    // Will be used to check users from google, facebook, apple signup.
    suspend fun hasCompletedProfile(): Boolean {
        val uid = uidOrThrow()
        return userDoc(uid).get().await().exists()
    }
    private fun uidOrThrow(): String = auth.currentUser?.uid ?: error("No authenticated user")
    private fun userDoc(uid: String) = db.collection("users").document(uid)

    // can be used to display profile info in the UI
    suspend fun getUserProfile(): UserProfile? {
        val uid = uidOrThrow()
        val snap = userDoc(uid).get().await()
        return snap.toObject(UserProfile::class.java)
    }

    /* ---------- Questionnaire (Combined) ---------- */

    suspend fun saveCombinedQuestionnaire(q: CombinedQuestionnaire) {
        val uid = uidOrThrow()
        questionnaireCombinedDoc(uid).set(q).await()
        userDoc(uid).update("currentTask", UserTasks.IMAGE_DESCRIPTION.taskName,
            "hasCompletedRiskAssessment", true).await()
    }

    private fun questionnaireCombinedDoc(uid: String) =
        db.collection("users").document(uid).collection("risk_assessment").document(uid)

    suspend fun getCombinedQuestionnaire(): CombinedQuestionnaire? {
        val uid = uidOrThrow()
        val snap = questionnaireCombinedDoc(uid).get().await()
        return snap.toObject(CombinedQuestionnaire::class.java)
    }


    /* ---------- Low-level helpers (optional) ---------- */

    suspend fun set(path: String, data: Any) {
        // path like "collection/doc/collection/doc"
        val ref = db.document(path)
        ref.set(data).await()
    }

    suspend fun get(path: String): DocumentSnapshot =
        db.document(path).get().await()

    companion object {
        val instance: FirestoreRepository by lazy { FirestoreRepository() }
    }

    suspend fun getCurrentTask(userId: String): String? {
        try {
            val snapshot = db.collection("users").document(userId).get().await()
            if(snapshot.exists())
            {
                val docProfile = snapshot.toObject(UserProfile::class.java)
                return docProfile?.currentTask
            }
            return null
        } catch (e: Exception) {
            println("Firestore error fetching lifestyle status: $e")
        }
        return null
    }

    suspend fun updateTask(taskFlag: String, newTask: String) {
        val uid = uidOrThrow()
        userDoc(uid).update(taskFlag, true, "currentTask", newTask).await()
    }

    suspend fun updateUserDoc(attr: String, value: Any) {
        val uid = uidOrThrow()
        userDoc(uid).update(attr, value).await()
    }

    suspend fun getLatestRiskAssessment(): Map<String, Any>? {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        val snapshot = db.collection("users")
            .document(userId)
            .collection("risk_assessment")
            .get()
            .await()

        return snapshot.documents.firstOrNull()?.data
    }




    suspend fun submitFeedback(rating: Int, review: String) {
        val uid = uidOrThrow()
        val feedback = hashMapOf(
            "userId" to uid,
            "rating" to rating,
            "review" to review,
            "version" to "1.0",
            "timestamp" to FieldValue.serverTimestamp()
        )
        db.collection("feedback").add(feedback).await()
    }
}
