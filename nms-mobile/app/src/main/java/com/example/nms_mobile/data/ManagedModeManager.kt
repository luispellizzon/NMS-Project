package com.example.nms_mobile.data

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Global singleton that manages the "Managed Mode" state for caregivers
 * managing patients. When a caregiver selects a patient, this manager
 * stores the patient context so all assessments are completed for that patient.
 */
object ManagedModeManager {

    data class ManagedModeState(
        val isInManagedMode: Boolean = false,
        val managedPatientId: String? = null,
        val managedPatientName: String? = null
    )

    private val _managedModeState = MutableStateFlow(ManagedModeState())
    val managedModeState: StateFlow<ManagedModeState> = _managedModeState.asStateFlow()

    /**
     * Enter managed mode for a specific patient
     */
    fun enterManagedMode(patientId: String, patientName: String) {
        _managedModeState.value = ManagedModeState(
            isInManagedMode = true,
            managedPatientId = patientId,
            managedPatientName = patientName
        )
    }

    /**
     * Exit managed mode and return to caregiver's own context
     */
    fun exitManagedMode() {
        _managedModeState.value = ManagedModeState()
    }

    /**
     * Get the current user ID to use for operations.
     * If in managed mode, returns the managed patient ID.
     * Otherwise, returns null (caller should use their own logic).
     */
    fun getEffectiveUserId(defaultUserId: String): String {
        return if (_managedModeState.value.isInManagedMode) {
            _managedModeState.value.managedPatientId ?: defaultUserId
        } else {
            defaultUserId
        }
    }

    /**
     * Check if currently in managed mode
     */
    fun isInManagedMode(): Boolean = _managedModeState.value.isInManagedMode
}