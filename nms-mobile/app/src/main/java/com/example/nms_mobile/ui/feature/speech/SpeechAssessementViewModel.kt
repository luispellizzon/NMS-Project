package com.example.nms_mobile.ui.feature.speech

import RecordingState
import SpeechAssessment
import android.content.Context
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.api.ProcessAssessmentRequest
import com.example.nms_mobile.api.ProcessAssessmentResponse
import com.example.nms_mobile.api.ProcessImageDescriptionRequest
import com.example.nms_mobile.api.ProcessImageDescriptionResponse
import com.example.nms_mobile.api.TranscriptionApiClient
import com.example.nms_mobile.data.*
import com.example.nms_mobile.services.AudioRecorderService
import com.example.nms_mobile.services.AudioPlayerService
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.io.File
import java.util.UUID

data class SpeechAssessmentUiState(
    val recordingState: RecordingState = RecordingState.IDLE,
    val duration: Long = 0, // in seconds
    val isUploading: Boolean = false,
    val uploadProgress: Int = 0,
    val error: String? = null,
    val isReviewMode: Boolean = false, // Are we reviewing the recording?
    val isPlaying: Boolean = false,    // Is audio playing?
    val playbackPosition: Int = 0,     // Current playback position in ms
    val playbackDuration: Int = 0      // Total duration in ms
)

sealed class SpeechAssessmentEvent {
    data object RecordingCompleted : SpeechAssessmentEvent()
    data object UploadCompleted : SpeechAssessmentEvent()
    data class Error(val message: String) : SpeechAssessmentEvent()
}

class SpeechAssessmentViewModel(
    private val repository: SpeechAssessmentRepository = SpeechAssessmentRepository.instance,
    private val storage: StorageRepository = StorageRepository.instance
) : ViewModel() {

    private val _uiState = MutableStateFlow(SpeechAssessmentUiState())
    val uiState: StateFlow<SpeechAssessmentUiState> = _uiState.asStateFlow()

    private val _events = Channel<SpeechAssessmentEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    private var audioRecorder: AudioRecorderService? = null
    private var audioPlayer: AudioPlayerService? = null
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
                        error = null,
                        isReviewMode = false
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
     * Stops recording and enters REVIEW mode (does NOT upload yet)
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
                        duration = duration / 1000,
                        isReviewMode = true, // Enter review mode
                        playbackDuration = duration.toInt()
                    )
                }

                _events.send(SpeechAssessmentEvent.RecordingCompleted)

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
     * Plays the recorded audio for review
     */
    fun playRecording(context: Context) {
        viewModelScope.launch {
            try {
                if (audioFile == null || !audioFile!!.exists()) {
                    throw Exception("No recording to play")
                }

                if (audioPlayer == null) {
                    audioPlayer = AudioPlayerService(context)
                }

                val success = audioPlayer?.play(audioFile!!) ?: false

                if (success) {
                    _uiState.update {
                        it.copy(
                            isPlaying = true,
                            playbackDuration = audioPlayer?.getDuration() ?: 0
                        )
                    }

                    // Start position tracker
                    startPlaybackTracker()

                    // Set completion listener
                    audioPlayer?.setOnCompletionListener {
                        _uiState.update { it.copy(isPlaying = false, playbackPosition = 0) }
                    }
                }

            } catch (e: Exception) {
                Log.e(TAG, "Failed to play recording", e)
                _uiState.update {
                    it.copy(error = "Failed to play: ${e.localizedMessage}")
                }
            }
        }
    }

    /**
     * Pauses playback
     */
    fun pausePlayback() {
        audioPlayer?.pause()
        _uiState.update { it.copy(isPlaying = false) }
    }

    /**
     * Resumes playback
     */
    fun resumePlayback() {
        audioPlayer?.resume()
        _uiState.update { it.copy(isPlaying = true) }
        startPlaybackTracker()
    }

    /**
     * Stops playback
     */
    fun stopPlayback() {
        audioPlayer?.stop()
        _uiState.update { it.copy(isPlaying = false, playbackPosition = 0) }
    }

    /**
     * Restarts playback from beginning
     */
    fun restartPlayback(context: Context) {
        stopPlayback()
        playRecording(context)
    }

    /**
     * Re-record: Delete current recording and start over
     */
    fun repeatRecording(context: Context) {
        stopPlayback()
        audioFile?.delete()
        audioFile = null
        _uiState.update {
            SpeechAssessmentUiState() // Reset to initial state
        }
        startRecording(context)
    }

    /**
     * Confirm and upload the recording
     */
    fun confirmRecording() {
        if (audioFile != null && audioFile!!.exists()) {
            val duration = _uiState.value.duration * 1000 // Convert back to ms
            uploadAudioToFirebase(audioFile!!, duration)
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
                error = null,
                isReviewMode = false
            )
        }
    }

    /**
     * Uploads audio file to Firebase Storage and saves metadata to Firestore
     */
    private fun uploadAudioToFirebase(file: File, duration: Long) {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Starting upload...")
                _uiState.update {
                    it.copy(
                        recordingState = RecordingState.PROCESSING,
                        isUploading = true,
                        uploadProgress = 0,
                        isReviewMode = false
                    )
                }

                val downloadUrl = storage.uploadAudio(file) { progress ->
                    _uiState.update { it.copy(uploadProgress = progress) }
                    Log.d(TAG, "Upload progress: $progress%")
                }

                val userId = PatientSessionManager.getActiveUserId()
                    ?: throw Exception("User not logged in")
                val id = UUID.randomUUID().toString()

                val assessment = SpeechAssessment(
                    id = id,
                    userId = userId,
                    testType = "audio_recording",
                    audioUrl = downloadUrl,
                    transcription = "",
                    duration = duration,
                    aiAnalysis = null,
                    score = null
                )

                repository.saveSpeechAssessment(assessment)
                file.delete()

                _uiState.update {
                    it.copy(
                        isUploading = false,
                        recordingState = RecordingState.COMPLETED,
                        uploadProgress = 100
                    )
                }

                _events.send(SpeechAssessmentEvent.UploadCompleted)
                val resp = callProcessImageDescriptionRetry(downloadUrl, id)

                Log.d(TAG, "Transcription kickoff: ${resp?.status} ${resp?.message}")

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

    private suspend fun callProcessImageDescriptionRetry(audioUrl: String, assessmentId: String): ProcessImageDescriptionResponse? {
        Log.d(TAG, "Body: Audio:$audioUrl \n DocumentID:$assessmentId")
        val userId = PatientSessionManager.getActiveUserId()

        repeat(3) { attempt ->
            try {
                val resp = TranscriptionApiClient.api.processImageDescription(
                    ProcessImageDescriptionRequest(userId!!, assessmentId, audioUrl)
                )
                Log.d(TAG, "description-assessment ok: $resp")
                return resp
            } catch (e: Exception) {
                Log.w(TAG, "description-assessment attempt ${attempt+1} failed", e)
                kotlinx.coroutines.delay(1000L * (attempt + 1))
            }
        }
        return null
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
     * Playback position tracker
     */
    private fun startPlaybackTracker() {
        viewModelScope.launch {
            while (_uiState.value.isPlaying) {
                kotlinx.coroutines.delay(100)
                val position = audioPlayer?.getCurrentPosition() ?: 0
                _uiState.update { it.copy(playbackPosition = position) }
            }
        }
    }

    /**
     * Reset state and cleanup
     */
    fun reset() {
        audioRecorder = null
        audioPlayer?.release()
        audioPlayer = null
        audioFile = null
        _uiState.update { SpeechAssessmentUiState() }
    }

    override fun onCleared() {
        super.onCleared()
        audioPlayer?.release()
    }
}