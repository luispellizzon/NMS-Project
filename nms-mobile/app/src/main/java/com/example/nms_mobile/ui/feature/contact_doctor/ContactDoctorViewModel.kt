package com.example.nms_mobile.ui.feature.contact_doctor

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.AuthRepository
import com.example.nms_mobile.data.FirestoreRepository
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.Timestamp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

/**
 * Data class representing a Doctor
 *
 * @param id Firestore document ID
 * @param name Doctor's full name
 * @param specialization Doctor's medical specialization
 * @param email Doctor's email address
 */
data class Doctor(
    val id: String = "",
    val name: String = "",
    val specialization: String = "",
    val email: String = ""
)

/**
 * UI State for Contact Doctor Screen
 */
data class ContactDoctorUiState(
    val isLoadingDoctors: Boolean = true,
    val doctors: List<Doctor> = emptyList(),
    val selectedDoctor: Doctor? = null,
    val message: String = "",
    val messageError: String? = null,
    val sendTestResults: Boolean = false,
    val isSending: Boolean = false,
    val errorMessage: String? = null,
    val successMessage: String? = null
)

/**
 * Events emitted by ContactDoctorViewModel
 */
sealed class ContactDoctorEvent {
    object MessageSent : ContactDoctorEvent()
    data class Error(val message: String) : ContactDoctorEvent()
}

/**
 * ViewModel for Contact Doctor Screen
 *
 * Handles:
 * - Loading doctors from Firestore
 * - Message validation
 * - Sending notifications to selected doctor
 */
class ContactDoctorViewModel : ViewModel() {

    private val firestore = FirebaseFirestore.getInstance()
    private val authRepository = AuthRepository.instance
    private val firestoreRepository = FirestoreRepository.instance

    // Mutable state for internal updates
    private val _uiState = MutableStateFlow(ContactDoctorUiState())
    // Public immutable state for the UI
    val uiState: StateFlow<ContactDoctorUiState> = _uiState.asStateFlow()

    // Events channel for one-time events
    private val _events = MutableStateFlow<ContactDoctorEvent?>(null)
    val events: StateFlow<ContactDoctorEvent?> = _events.asStateFlow()

    init {
        // Load doctors when ViewModel is created
        loadDoctors()
    }

    /**
     * Loads all doctors from Firestore
     */
    private fun loadDoctors() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoadingDoctors = true, errorMessage = null) }

            try {
                val doctorsCollection = firestore.collection("doctors")
                val snapshot = doctorsCollection.get().await()

                val doctorsList = snapshot.documents.mapNotNull { doc ->
                    try {
                        Doctor(
                            id = doc.id,
                            name = doc.getString("fullName") ?: "Unknown",
                            specialization = doc.getString("role") ?: "Doctor",
                            email = doc.getString("email") ?: ""
                        )
                    } catch (e: Exception) {
                        null
                    }
                }

                _uiState.update {
                    it.copy(
                        isLoadingDoctors = false,
                        doctors = doctorsList,
                        errorMessage = if (doctorsList.isEmpty()) "No doctors available" else null
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoadingDoctors = false,
                        errorMessage = "Failed to load doctors: ${e.message}"
                    )
                }
            }
        }
    }

    /**
     * Updates the selected doctor
     */
    fun onDoctorSelected(doctor: Doctor) {
        _uiState.update {
            it.copy(
                selectedDoctor = doctor,
                errorMessage = null
            )
        }
    }

    /**
     * Updates the message text
     */
    fun onMessageChange(message: String) {
        _uiState.update {
            it.copy(
                message = message,
                messageError = null,
                errorMessage = null,
                successMessage = null
            )
        }
    }

    /**
     * Updates the checkbox for sending test results
     */
    fun onSendTestResultsChange(send: Boolean) {
        _uiState.update { it.copy(sendTestResults = send) }
    }

    /**
     * Validates the message field
     *
     * @return true if valid, false otherwise
     */
    private fun validateMessage(): Boolean {
        val message = _uiState.value.message.trim()

        return when {
            message.isEmpty() -> {
                _uiState.update {
                    it.copy(messageError = "Message cannot be empty")
                }
                false
            }
            message.length < 10 -> {
                _uiState.update {
                    it.copy(messageError = "Message must be at least 10 characters")
                }
                false
            }
            else -> {
                _uiState.update { it.copy(messageError = null) }
                true
            }
        }
    }

    /**
     * Sends the message to the selected doctor
     *
     * Creates a notification document in the doctor's subcollection:
     * doctors/{doctorId}/notifications/{notificationId}
     */
    fun sendMessage() {
        val currentState = _uiState.value

        // Validate doctor selection
        if (currentState.selectedDoctor == null) {
            _uiState.update {
                it.copy(errorMessage = "Please select a doctor")
            }
            return
        }

        // Validate message
        if (!validateMessage()) {
            return
        }

        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    isSending = true,
                    errorMessage = null,
                    successMessage = null
                )
            }

            try {
                // Get current user information
                val currentUser = authRepository.currentUser()
                if (currentUser == null) {
                    throw Exception("User not logged in")
                }

                // Get user profile to get the full name
                val userProfile = firestoreRepository.getUserProfile()

                // Access fullName directly from UserProfile object
                val userName = userProfile?.fullName ?: "Unknown User"

                // Create notification data
                val notificationData = hashMapOf(
                    "userName" to userName,
                    "userId" to currentUser.uid,
                    "message" to currentState.message.trim(),
                    "sendTestResults" to currentState.sendTestResults,
                    "timestamp" to Timestamp.now(),
                    "read" to false
                )

                // Save to Firestore: doctors/{doctorId}/notifications/{autoId}
                firestore
                    .collection("doctors")
                    .document(currentState.selectedDoctor.id)
                    .collection("notifications")
                    .add(notificationData)
                    .await()

                // Success - clear form and show success message
                _uiState.update {
                    it.copy(
                        isSending = false,
                        message = "",
                        sendTestResults = false,
                        successMessage = "Message sent successfully to Dr. ${currentState.selectedDoctor.name}",
                        errorMessage = null
                    )
                }

                _events.value = ContactDoctorEvent.MessageSent

            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isSending = false,
                        errorMessage = "Failed to send message: ${e.message}"
                    )
                }
                _events.value = ContactDoctorEvent.Error(e.message ?: "Unknown error")
            }
        }
    }

    /**
     * Clears success/error messages
     */
    fun clearMessages() {
        _uiState.update {
            it.copy(
                errorMessage = null,
                successMessage = null,
                messageError = null
            )
        }
    }
}