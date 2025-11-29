package com.example.nms_mobile.data

import com.google.firebase.auth.FirebaseAuth

/**
 * Singleton that manages the active patient context for caregivers.
 * When a caregiver is managing a specific patient, this tracks the patient's ID
 * so that assessments are saved to the correct user document.
 */
object PatientSessionManager {

    private val auth: FirebaseAuth = FirebaseAuth.getInstance()

    /**
     * The ID of the patient currently being managed by a caregiver.
     * Null means no patient is being managed (normal patient flow).
     */
    private var managedPatientId: String? = null

    /**
     * Sets the active patient ID for a caregiver managing a patient.
     */
    fun setManagedPatient(patientId: String?) {
        managedPatientId = patientId
    }

    /**
     * Clears the managed patient context (returns to normal flow).
     */
    fun clearManagedPatient() {
        managedPatientId = null
    }

    /**
     * Gets the current patient ID being managed, or null if none.
     */
    fun getManagedPatientId(): String? = managedPatientId

    /**
     * Gets the active user ID for operations.
     * Returns managed patient ID if a caregiver is managing a patient,
     * otherwise returns the authenticated user's ID.
     */
    fun getActiveUserId(): String {
        return managedPatientId ?: auth.currentUser?.uid
            ?: error("No authenticated user")
    }

    /**
     * Checks if currently managing a patient.
     */
    fun isManagingPatient(): Boolean = managedPatientId != null
}