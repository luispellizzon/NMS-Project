package com.example.nms_mobile.ui.theme.speech

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.*
import com.example.nms_mobile.services.AudioRecorderService
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.io.File
import java.util.UUID

data class SpeechAssessmentUiState(
    val recordingState: RecordingState = RecordingState.IDLE,
    val duration: Long = 0, // in seconds
    val isUploading: Boolean = false,
    val uploadProgress: Int = 0,
    val error: String? = null
)

sealed class SpeechAssessmentEvent {
    data object RecordingCompleted : SpeechAssessmentEvent()
    data object UploadCompleted : SpeechAssessmentEvent()
    data class Error(val message: String) : SpeechAssessmentEvent()
}

class SpeechAssessmentViewModel(
    private val repository: SpeechAssessmentRepository = SpeechAssessmentRepository.instance,
    private val storage: FirebaseStorage = FirebaseStorage.getInstance()
) : ViewModel() {

    private val _uiState = MutableStateFlow(SpeechAssessmentUiState())
    val uiState: StateFlow<SpeechAssessmentUiState> = _uiState.asStateFlow()

    private val _events = Channel<SpeechAssessmentEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    private var audioRecorder: AudioRecorderService? = null
    private var recordingStartTime: Long = 0
    private var audioFile: File? = null

    companion object {
        private const val TAG = "SpeechAssessmentVM"
        private const val MAX_DURATION_SECONDS = 180L // 3 minutes
    }

    /**
     * Starts audio recording
     */
    fun startRecording(context: Context) {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Starting audio recording...")

                audioRecorder = AudioRecorderService(context)
                audioFile = audioRecorder?.startRecording()

                if (audioFile == null) {
                    throw Exception("Failed to create audio file")
                }

                _uiState.update {
                    it.copy(
                        recordingState = RecordingState.RECORDING,
                        duration = 0,
                        error = null
                    )
                }

                recordingStartTime = System.currentTimeMillis()
                startDurationCounter()

                Log.d(TAG, "Recording started successfully")

            } catch (e: Exception) {
                Log.e(TAG, "Failed to start recording", e)
                _uiState.update {
                    it.copy(
                        recordingState = RecordingState.ERROR,
                        error = "Failed to start recording: ${e.localizedMessage}"
                    )
                }
                _events.send(SpeechAssessmentEvent.Error(e.localizedMessage ?: "Recording failed"))
            }
        }
    }

    /**
     * Stops recording and uploads to Firebase
     */
    fun stopRecording() {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Stopping recording...")

                val duration = audioRecorder?.stopRecording() ?: 0L

                if (audioFile == null || !audioFile!!.exists()) {
                    throw Exception("Audio file not found")
                }

                Log.d(TAG, "Recording stopped. Duration: ${duration}ms, File size: ${audioFile!!.length()} bytes")

                _uiState.update {
                    it.copy(
                        recordingState = RecordingState.STOPPED,
                        duration = duration / 1000
                    )
                }

                _events.send(SpeechAssessmentEvent.RecordingCompleted)

                // Upload to Firebase
                uploadAudioToFirebase(audioFile!!, duration)

            } catch (e: Exception) {
                Log.e(TAG, "Failed to stop recording", e)
                _uiState.update {
                    it.copy(
                        recordingState = RecordingState.ERROR,
                        error = "Failed to stop recording: ${e.localizedMessage}"
                    )
                }
                _events.send(SpeechAssessmentEvent.Error(e.localizedMessage ?: "Stop failed"))
            }
        }
    }

    /**
     * Cancels recording without saving
     */
    fun cancelRecording() {
        Log.d(TAG, "Canceling recording...")
        audioRecorder?.cancelRecording()
        audioRecorder = null
        audioFile = null
        _uiState.update {
            it.copy(
                recordingState = RecordingState.IDLE,
                duration = 0,
                error = null
            )
        }
    }

    /**
     * Uploads audio file to Firebase Storage and saves metadata to Firestore
     */
    private fun uploadAudioToFirebase(file: File, duration: Long) {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Starting upload to Firebase...")
                _uiState.update {
                    it.copy(
                        recordingState = RecordingState.PROCESSING,
                        isUploading = true,
                        uploadProgress = 0
                    )
                }

                // Get current user ID
                val userId = AuthRepository.instance.currentUser()?.uid
                    ?: throw Exception("User not logged in")

                // Create unique filename
                val timestamp = System.currentTimeMillis()
                val fileName = "${userId}_${timestamp}.m4a"
                val storageRef = storage.reference
                    .child("speech_assessments")
                    .child(userId)
                    .child(fileName)

                Log.d(TAG, "Uploading to: ${storageRef.path}")

                // Upload file with progress tracking
                val uploadTask = storageRef.putFile(Uri.fromFile(file))

                uploadTask.addOnProgressListener { taskSnapshot ->
                    val progress = (100.0 * taskSnapshot.bytesTransferred / taskSnapshot.totalByteCount).toInt()
                    _uiState.update { it.copy(uploadProgress = progress) }
                    Log.d(TAG, "Upload progress: $progress%")
                }

                // Wait for upload to complete
                uploadTask.await()

                // Get download URL
                val downloadUrl = storageRef.downloadUrl.await()
                Log.d(TAG, "Upload complete. Download URL: $downloadUrl")

                // Save metadata to Firestore
                val assessment = SpeechAssessment(
                    id = userId,
                    userId = userId,
                    testType = "audio_recording",
                    audioUrl = downloadUrl.toString(),
                    transcription = "", // Empty - will be transcribed later
                    duration = duration,
                    aiAnalysis = null,
                    score = null
                )

                repository.saveSpeechAssessment(assessment)
                Log.d(TAG, "Successfully saved to Firestore")

                // Clean up local file
                file.delete()

                _uiState.update {
                    it.copy(
                        isUploading = false,
                        recordingState = RecordingState.COMPLETED,
                        uploadProgress = 100
                    )
                }

                _events.send(SpeechAssessmentEvent.UploadCompleted)

            } catch (e: Exception) {
                Log.e(TAG, "Upload failed", e)
                _uiState.update {
                    it.copy(
                        isUploading = false,
                        recordingState = RecordingState.ERROR,
                        error = "Upload failed: ${e.localizedMessage}"
                    )
                }
                _events.send(SpeechAssessmentEvent.Error(e.localizedMessage ?: "Upload failed"))
            }
        }
    }

    /**
     * Recording duration counter
     */
    private fun startDurationCounter() {
        viewModelScope.launch {
            while (_uiState.value.recordingState == RecordingState.RECORDING) {
                kotlinx.coroutines.delay(1000)
                val elapsed = (System.currentTimeMillis() - recordingStartTime) / 1000

                _uiState.update { it.copy(duration = elapsed) }

                // Auto-stop at 3 minutes
                if (elapsed >= MAX_DURATION_SECONDS) {
                    Log.d(TAG, "Max duration reached, auto-stopping...")
                    stopRecording()
                    break
                }
            }
        }
    }

    /**
     * Reset state
     */
    fun reset() {
        audioRecorder = null
        audioFile = null
        _uiState.update { SpeechAssessmentUiState() }
    }
}