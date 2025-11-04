package com.example.nms_mobile.data

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
    val role: String = "patient", // "patient" | "caregiver"
    val createdAt: Any? = null     // server timestamp (FieldValue) when writing
)

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
    suspend fun saveUserDetails(details: UserProfile ) {
        val uid = uidOrThrow()
        userDoc(uid).set(details).await()
    }

    // Will be used to check users from google, facebook, apple signup.
    suspend fun hasCompletedProfile(): Boolean {
        val uid = uidOrThrow()
        return userDoc(uid).get().await().exists()
    }
    private fun uidOrThrow(): String = auth.currentUser?.uid ?: error("No authenticated user")
    private fun userDoc(uid: String) = db.collection("users").document(uid)

    suspend fun createUserProfile(profile: UserProfile) {
        val uid = profile.uid.ifBlank { uidOrThrow() }
        userDoc(uid).set(
            mapOf(
                "uid" to uid,
                "fullName" to profile.fullName,
                "dateOfBirth" to profile.dateOfBirth,
                "email" to profile.email,
                "role" to profile.role,
                "createdAt" to FieldValue.serverTimestamp()
            )
        ).await()
    }

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
    }

    private fun questionnaireCombinedDoc(uid: String) =
        db.collection("risk_assessments").document(uid)

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
    suspend fun getLifestyleQuestionaryStatus(userId: String): Boolean {
        return try {
            // 💡 Cambio CLAVE: Usamos la ruta donde se guarda el cuestionario.
            val snapshot = questionnaireCombinedDoc(userId).get().await()

            // El cuestionario está "completado" si el documento existe.
            snapshot.exists()

        } catch (e: Exception) {
            println("Firestore error fetching lifestyle status: $e")
            false
        }
    }
}
