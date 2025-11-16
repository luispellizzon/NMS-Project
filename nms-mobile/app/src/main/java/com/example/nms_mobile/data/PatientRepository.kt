package com.example.nms_mobile.data

import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import android.util.Log

/**
 * Patient data model - represents a patient managed by a caregiver
 */
data class Patient(
    val id: String = "",
    val fullName: String = "",
    val dateOfBirth: String = "",
    val email: String? = null,
    val caregiverId: String = "",
    val createdAt: Timestamp = Timestamp.now(),

    // Test results (mocked for now, will be real later)
    val riskLevel: String = "Not assessed",  // "Low", "Medium", "High", "Not assessed"
    val speechScore: Int? = null,
    val cognitiveScore: Int? = null,
    val memoryScore: Int? = null,

    // Assessment completion flags
    val hasCompletedSpeech: Boolean = false,
    val hasCompletedCognitive: Boolean = false,
    val hasCompletedMemory: Boolean = false,
    val hasCompletedRiskAssessment: Boolean = false
)

/**
 * Repository for managing patients under a caregiver
 */
class PatientRepository private constructor(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
) {

    companion object {
        val instance: PatientRepository by lazy { PatientRepository() }
        private const val TAG = "PatientRepository"
        private const val COLLECTION_USERS = "users"
        private const val SUBCOLLECTION_PATIENTS = "patients"
    }

    /**
     * Add a new patient to the caregiver's patient list
     */
    suspend fun addPatient(
        fullName: String,
        dateOfBirth: String,
        email: String?
    ): Patient {
        val caregiverId = auth.currentUser?.uid
            ?: throw Exception("Caregiver not authenticated")

        try {
            // Create a new patient document
            val patientRef = firestore.collection(COLLECTION_USERS)
                .document(caregiverId)
                .collection(SUBCOLLECTION_PATIENTS)
                .document()

            val patient = Patient(
                id = patientRef.id,
                fullName = fullName,
                dateOfBirth = dateOfBirth,
                email = email,
                caregiverId = caregiverId,
                createdAt = Timestamp.now()
            )

            patientRef.set(patient).await()

            Log.d(TAG, "Patient added successfully: ${patient.fullName}")
            return patient

        } catch (e: Exception) {
            Log.e(TAG, "Error adding patient", e)
            throw e
        }
    }

    /**
     * Get all patients for the current caregiver
     */
    suspend fun getCaregiverPatients(): List<Patient> {
        val caregiverId = auth.currentUser?.uid
            ?: throw Exception("Caregiver not authenticated")

        Log.d(TAG, "Fetching patients for caregiver: $caregiverId")
        Log.d("SUBCOLLECTION_PATIENTS", SUBCOLLECTION_PATIENTS)
        return try {
            val snapshot = firestore.collection(COLLECTION_USERS)
                .document(caregiverId)
                .collection(SUBCOLLECTION_PATIENTS)
                .get()
                .await()
            Log.d(TAG, "Fetched ${snapshot.size()} patients")

            snapshot.documents.mapNotNull {
                it.toObject(Patient::class.java)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching patients", e)
            emptyList()
        }
    }

    /**
     * Get a specific patient by ID
     */
    suspend fun getPatient(patientId: String): Patient? {
        val caregiverId = auth.currentUser?.uid
            ?: throw Exception("Caregiver not authenticated")

        return try {
            val snapshot = firestore.collection(COLLECTION_USERS)
                .document(caregiverId)
                .collection(SUBCOLLECTION_PATIENTS)
                .document(patientId)
                .get()
                .await()

            snapshot.toObject(Patient::class.java)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching patient", e)
            null
        }
    }

    /**
     * Update patient test results (for when assessments are completed)
     */
    suspend fun updatePatientResults(
        patientId: String,
        riskLevel: String? = null,
        speechScore: Int? = null,
        cognitiveScore: Int? = null,
        memoryScore: Int? = null,
        hasCompletedSpeech: Boolean? = null,
        hasCompletedCognitive: Boolean? = null,
        hasCompletedMemory: Boolean? = null,
        hasCompletedRiskAssessment: Boolean? = null
    ) {
        val caregiverId = auth.currentUser?.uid
            ?: throw Exception("Caregiver not authenticated")

        try {
            val updates = mutableMapOf<String, Any>()

            riskLevel?.let { updates["riskLevel"] = it }
            speechScore?.let { updates["speechScore"] = it }
            cognitiveScore?.let { updates["cognitiveScore"] = it }
            memoryScore?.let { updates["memoryScore"] = it }
            hasCompletedSpeech?.let { updates["hasCompletedSpeech"] = it }
            hasCompletedCognitive?.let { updates["hasCompletedCognitive"] = it }
            hasCompletedMemory?.let { updates["hasCompletedMemory"] = it }
            hasCompletedRiskAssessment?.let { updates["hasCompletedRiskAssessment"] = it }

            if (updates.isNotEmpty()) {
                firestore.collection(COLLECTION_USERS)
                    .document(caregiverId)
                    .collection(SUBCOLLECTION_PATIENTS)
                    .document(patientId)
                    .update(updates)
                    .await()

                Log.d(TAG, "Patient results updated for $patientId")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error updating patient results", e)
            throw e
        }
    }

    /**
     * Delete a patient
     */
    suspend fun deletePatient(patientId: String) {
        val caregiverId = auth.currentUser?.uid
            ?: throw Exception("Caregiver not authenticated")

        try {
            firestore.collection(COLLECTION_USERS)
                .document(caregiverId)
                .collection(SUBCOLLECTION_PATIENTS)
                .document(patientId)
                .delete()
                .await()

            Log.d(TAG, "Patient deleted: $patientId")
        } catch (e: Exception) {
            Log.e(TAG, "Error deleting patient", e)
            throw e
        }
    }
}