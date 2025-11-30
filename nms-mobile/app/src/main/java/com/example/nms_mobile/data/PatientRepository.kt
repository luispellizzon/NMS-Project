package com.example.nms_mobile.data

import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import android.util.Log

/**
 * Patient reference data model - stored in caregiver's patients subcollection
 * Links to the full UserProfile document in users/{patientId}
 */
data class PatientReference(
    val patientId: String = "",           // UID of the patient's user document
    val fullName: String = "",
    val dateOfBirth: String = "",
    val email: String? = null,
    val caregiverId: String = "",
    val addedAt: Timestamp = Timestamp.now()
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
     * Creates a full UserProfile document for the patient and stores a reference in caregiver's subcollection
     */
    suspend fun addPatient(
        fullName: String,
        dateOfBirth: String,
        email: String?
    ): PatientReference {
        val caregiverId = auth.currentUser?.uid
            ?: throw Exception("Caregiver not authenticated")

        try {
            // Step 1: Generate a new UID for the patient
            val patientId = firestore.collection(COLLECTION_USERS).document().id

            // Step 2: Create a full UserProfile document for the patient (like normal patient registration)
            val patientUserProfile = UserProfile(
                uid = patientId,
                fullName = fullName,
                dateOfBirth = dateOfBirth,
                email = email ?: "",
                role = "patient",  // Patients created by caregivers are regular patients
                createdAt = Timestamp.now(),
                currentTask = UserTasks.RISK_ASSESSMENT.taskName,
                hasCompletedRiskAssessment = false,
                hasCompletedImageDescription = false,
                hasCompletedSpeechAssessment = false,
                hasCompletedMemoryAssessment = false,
                hasCompletedCognitiveAssessment = false,
                mmseScore = 0,
                location = "",
                dementiaRisk = "",
                hasCompletedAiAnalysis = false
            )

            // Save the full patient user profile to users/{patientId}
            firestore.collection(COLLECTION_USERS)
                .document(patientId)
                .set(patientUserProfile)
                .await()

            Log.d(TAG, "Created full user profile for patient: $patientId")

            // Step 3: Create a reference in the caregiver's patients subcollection
            val patientReference = PatientReference(
                patientId = patientId,
                fullName = fullName,
                dateOfBirth = dateOfBirth,
                email = email,
                caregiverId = caregiverId,
                addedAt = Timestamp.now()
            )

            firestore.collection(COLLECTION_USERS)
                .document(caregiverId)
                .collection(SUBCOLLECTION_PATIENTS)
                .document(patientId)  // Use same patientId as document ID for easy lookup
                .set(patientReference)
                .await()

            Log.d(TAG, "Patient reference added to caregiver: ${patientReference.fullName}")
            return patientReference

        } catch (e: Exception) {
            Log.e(TAG, "Error adding patient", e)
            throw e
        }
    }

    /**
     * Get all patient references for the current caregiver
     */
    suspend fun getCaregiverPatients(): List<PatientReference> {
        val caregiverId = auth.currentUser?.uid
            ?: throw Exception("Caregiver not authenticated")

        Log.d(TAG, "Fetching patients for caregiver: $caregiverId")
        return try {
            val snapshot = firestore.collection(COLLECTION_USERS)
                .document(caregiverId)
                .collection(SUBCOLLECTION_PATIENTS)
                .get()
                .await()
            Log.d(TAG, "Fetched ${snapshot.size()} patient references")

            snapshot.documents.mapNotNull {
                it.toObject(PatientReference::class.java)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching patients", e)
            emptyList()
        }
    }

    /**
     * Get a specific patient's reference by ID from caregiver's subcollection
     */
    suspend fun getPatientReference(patientId: String): PatientReference? {
        val caregiverId = auth.currentUser?.uid
            ?: throw Exception("Caregiver not authenticated")

        return try {
            val snapshot = firestore.collection(COLLECTION_USERS)
                .document(caregiverId)
                .collection(SUBCOLLECTION_PATIENTS)
                .document(patientId)
                .get()
                .await()

            snapshot.toObject(PatientReference::class.java)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching patient reference", e)
            null
        }
    }

    /**
     * Get the full UserProfile for a patient
     * This fetches the complete patient data from users/{patientId}
     */
    suspend fun getPatientProfile(patientId: String): UserProfile? {
        return try {
            val snapshot = firestore.collection(COLLECTION_USERS)
                .document(patientId)
                .get()
                .await()

            snapshot.toObject(UserProfile::class.java)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching patient profile", e)
            null
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