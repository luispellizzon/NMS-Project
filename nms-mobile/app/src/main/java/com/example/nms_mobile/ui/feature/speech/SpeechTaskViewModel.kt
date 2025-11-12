package com.example.nms_mobile.ui.feature.speech

import RecordingState
import SpeechAssessmentDocument
import SpeechProgressState
import SpeechTaskType
import TaskResult
import android.content.Context
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.*
import com.example.nms_mobile.services.AudioRecorderService
import com.example.nms_mobile.services.AudioPlayerService
import com.google.firebase.Timestamp
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.io.File
import android.os.Build
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import java.util.Locale

import java.util.UUID

data class SpeechTaskUiState(
    val assessmentId: String? = null,
    val currentTask: SpeechTaskType = SpeechTaskType.WORD_RECALL_INITIAL,
    val progressState: SpeechProgressState = SpeechProgressState(),
    val isCompleted: Boolean = false,

    // Recording state
    val recordingState: RecordingState = RecordingState.IDLE,
    val duration: Long = 0, // in seconds
    val isInstructionPlaying: Boolean = false,

    // Review state
    val isReviewMode: Boolean = false,
    val isPlayingRecording: Boolean = false,
    val playbackPosition: Int = 0,
    val playbackDuration: Int = 0,

    // Upload state
    val isUploading: Boolean = false,
    val uploadProgress: Int = 0,

    // General state
    val isLoading: Boolean = true,
    val error: String? = null
)

sealed class SpeechTaskEvent {
    data object TaskCompleted : SpeechTaskEvent()
    data object AssessmentCompleted : SpeechTaskEvent()
    data class Error(val message: String) : SpeechTaskEvent()
    data class NavigateToTask(val task: SpeechTaskType) : SpeechTaskEvent()
}

class SpeechTaskViewModel(
    private val repository: SpeechAssessmentsTasks = SpeechAssessmentsTasks.instance,
    private val storage: StorageRepository = StorageRepository.instance,
) : ViewModel() {


    private val _uiState = MutableStateFlow(SpeechTaskUiState())
    val uiState: StateFlow<SpeechTaskUiState> = _uiState.asStateFlow()

    private val _events = Channel<SpeechTaskEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    private var audioRecorder: AudioRecorderService? = null
    private var audioPlayer: AudioPlayerService? = null
    private var instructionPlayer: AudioPlayerService? = null
    private var recordingStartTime: Long = 0
    private var audioFile: File? = null

    private var currentAssessment: SpeechAssessmentDocument? = null

    companion object {
        private const val TAG = "SpeechTaskViewModel"
        private const val MAX_DURATION_SECONDS = 60L
    }


    /**
     * Initialize or resume assessment
     */
    fun initializeAssessment() {
        viewModelScope.launch {
            try {
                _uiState.update { it.copy(isLoading = true, error = null) }

                currentAssessment = repository.getOrCreateAssessment()
                val isCompleted = currentAssessment!!.isCompleted
                if (isCompleted) {
                    _events.send(SpeechTaskEvent.AssessmentCompleted)
                    _uiState.update {
                        it.copy(
                            assessmentId = currentAssessment!!.id,
                            isLoading = false,
                            isCompleted = true
                        )
                    }
                } else {
                    val completedTasks = calculateCompletedTasks(currentAssessment!!)
                    val currentTaskType =
                        SpeechTaskType.fromTaskId(currentAssessment!!.currentTaskId)
                            ?: SpeechTaskType.WORD_RECALL_INITIAL

                    val progressState = SpeechProgressState(
                        totalTasks = SpeechTaskType.values().size,
                        completedTasks = completedTasks,
                        currentTask = currentTaskType
                    ).updateProgress()

                    _uiState.update {
                        it.copy(
                            assessmentId = currentAssessment!!.id,
                            currentTask = currentTaskType,
                            progressState = progressState,
                            isLoading = false,
                            isCompleted = false
                        )
                    }

                    Log.d(
                        TAG,
                        "Assessment initialized: ${currentAssessment!!.id}, Current task: ${currentTaskType.taskId}"
                    )
                }

            } catch (e: Exception) {
                Log.e(TAG, "Failed to initialize assessment", e)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = "Failed to load assessment: ${e.localizedMessage}"
                    )
                }
                _events.send(SpeechTaskEvent.Error(e.localizedMessage ?: "Initialization failed"))
            }
        }
    }

    /**
     * Calculate how many tasks are completed
     */
    private fun calculateCompletedTasks(assessment: SpeechAssessmentDocument): Int {
        if (assessment.content.isEmpty()) return 0
        return assessment.content.values.count { it.result != null }
    }


    /**
     * Play task instruction (text-to-speech or pre-recorded audio)
     */
    /**
     * Play task instruction (Text-to-Speech)
     */
    fun playInstruction(context: Context) {
        val instructionText = _uiState.value.currentTask.instruction

        if (instructionText.isBlank()) {
            Log.w(TAG, "No instruction text for current task")
            return
        }

        if (_uiState.value.isInstructionPlaying) {
            Log.d(TAG, "Instruction is already playing")
            return
        }

        _uiState.update { it.copy(isInstructionPlaying = true, error = null) }

        viewModelScope.launch {
            try {
                val appContext = context.applicationContext
                var tts: TextToSpeech? = null

                tts = TextToSpeech(appContext) { status ->
                    if (status != TextToSpeech.SUCCESS) {
                        Log.e(TAG, "TTS initialization failed: $status")
                        viewModelScope.launch {
                            _uiState.update {
                                it.copy(
                                    isInstructionPlaying = false,
                                    error = "Unable to initialize TTS engine"
                                )
                            }
                        }
                        tts?.shutdown()
                        return@TextToSpeech
                    }

                    val languageResult = tts?.setLanguage(Locale.getDefault())
                    if (languageResult == TextToSpeech.LANG_MISSING_DATA ||
                        languageResult == TextToSpeech.LANG_NOT_SUPPORTED
                    ) {
                        Log.e(TAG, "TTS language not supported")
                        viewModelScope.launch {
                            _uiState.update {
                                it.copy(
                                    isInstructionPlaying = false,
                                    error = "Language not supported on this device"
                                )
                            }
                        }
                        tts?.shutdown()
                        return@TextToSpeech
                    }

                    val utteranceId = "instruction_${UUID.randomUUID()}"

                    tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                        override fun onStart(utteranceId: String?) {
                            Log.d(TAG, "TTS started for $utteranceId")
                        }

                        override fun onDone(utteranceId: String?) {
                            Log.d(TAG, "TTS completed for $utteranceId")
                            viewModelScope.launch {
                                _uiState.update { it.copy(isInstructionPlaying = false) }
                            }
                            tts?.shutdown()
                        }

                        override fun onError(utteranceId: String?) {
                            Log.e(TAG, "TTS error for $utteranceId")
                            viewModelScope.launch {
                                _uiState.update {
                                    it.copy(
                                        isInstructionPlaying = false,
                                        error = "Failed to play instruction"
                                    )
                                }
                            }
                            tts?.shutdown()
                        }

                        override fun onError(utteranceId: String?, errorCode: Int) {
                            onError(utteranceId)
                        }
                    })

                    val speakResult = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        tts?.speak(instructionText, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
                    } else {
                        @Suppress("DEPRECATION")
                        tts?.speak(
                            instructionText,
                            TextToSpeech.QUEUE_FLUSH,
                            hashMapOf(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID to utteranceId)
                        )
                    }

                    if (speakResult == TextToSpeech.ERROR) {
                        Log.e(TAG, "TTS speak() failed")
                        viewModelScope.launch {
                            _uiState.update {
                                it.copy(
                                    isInstructionPlaying = false,
                                    error = "Unable to speak instruction"
                                )
                            }
                        }
                        tts?.shutdown()
                    }
                }

            } catch (e: Exception) {
                Log.e(TAG, "Failed to play instruction", e)
                _uiState.update {
                    it.copy(
                        isInstructionPlaying = false,
                        error = "Failed to play instruction: ${e.localizedMessage}"
                    )
                }
            }
        }
    }


    /**
     * Start recording user's response
     */
    fun startRecording(context: Context) {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Starting recording for task: ${_uiState.value.currentTask.taskId}")

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

            } catch (e: Exception) {
                Log.e(TAG, "Failed to start recording", e)
                _uiState.update {
                    it.copy(
                        recordingState = RecordingState.ERROR,
                        error = "Failed to start recording: ${e.localizedMessage}"
                    )
                }
                _events.send(SpeechTaskEvent.Error(e.localizedMessage ?: "Recording failed"))
            }
        }
    }

    /**
     * Stop recording and enter review mode
     */
    fun stopRecording() {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Stopping recording...")

                val duration = audioRecorder?.stopRecording() ?: 0L

                if (audioFile == null || !audioFile!!.exists()) {
                    throw Exception("Audio file not found")
                }

                Log.d(TAG, "Recording stopped. Duration: ${duration}ms")

                _uiState.update {
                    it.copy(
                        recordingState = RecordingState.STOPPED,
                        duration = duration / 1000,
                        isReviewMode = true,
                        playbackDuration = duration.toInt()
                    )
                }

            } catch (e: Exception) {
                Log.e(TAG, "Failed to stop recording", e)
                _uiState.update {
                    it.copy(
                        recordingState = RecordingState.ERROR,
                        error = "Failed to stop recording: ${e.localizedMessage}"
                    )
                }
            }
        }
    }

    /**
     * Play recorded audio for review
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
                            isPlayingRecording = true,
                            playbackDuration = audioPlayer?.getDuration() ?: 0
                        )
                    }

                    startPlaybackTracker()

                    audioPlayer?.setOnCompletionListener {
                        _uiState.update { it.copy(isPlayingRecording = false, playbackPosition = 0) }
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
     * Pause playback
     */
    fun pausePlayback() {
        audioPlayer?.pause()
        _uiState.update { it.copy(isPlayingRecording = false) }
    }

    fun restartPlayback(context: Context) {
        stopPlayback()
        playRecording(context)
    }

    /**
     * Resume playback
     */
    fun resumePlayback() {
        audioPlayer?.resume()
        _uiState.update { it.copy(isPlayingRecording = true) }
        startPlaybackTracker()
    }

    /**
     * Re-record
     */
    fun repeatRecording(context: Context) {
        stopPlayback()
        audioFile?.delete()
        audioFile = null
        _uiState.update {
            it.copy(
                recordingState = RecordingState.IDLE,
                duration = 0,
                isReviewMode = false,
                playbackPosition = 0
            )
        }
        // Optionally auto-start recording
        // startRecording(context)
    }

    /**
     * Stop playback
     */
    fun stopPlayback() {
        audioPlayer?.stop()
        _uiState.update { it.copy(isPlayingRecording = false, playbackPosition = 0) }
    }

    /**
     * Confirm and submit the current task
     */
    fun submitTask(context: Context) {
        if (audioFile != null && audioFile!!.exists()) {
            val duration = _uiState.value.duration * 1000
            uploadAndSaveTask(audioFile!!, duration, context)
        } else {
            _uiState.update { it.copy(error = "No recording to submit") }
        }
    }

    /**
     * Upload audio and save task result
     */
    private fun uploadAndSaveTask(file: File, duration: Long, context: Context) {
        viewModelScope.launch {
            val appContext = context.applicationContext
            try {
                val currentTask = _uiState.value.currentTask
                Log.d(TAG, "Uploading task: ${currentTask.taskId}")

                _uiState.update {
                    it.copy(
                        recordingState = RecordingState.PROCESSING,
                        isUploading = true,
                        uploadProgress = 0,
                        isReviewMode = false
                    )
                }

                // Upload to Firebase Storage
                val downloadUrl = storage.uploadAudio(file) { progress ->
                    _uiState.update { it.copy(uploadProgress = progress) }
                }

                val taskResult = TaskResult(
                    audioUrl = downloadUrl,
                    transcription = "",
                    userScore = 0,
                    completedAt = Timestamp.now(),
                    duration = duration
                )

                val taskSequence = SpeechTaskType.getTaskSequence()
                val currentIndex = taskSequence.indexOf(currentTask)
                val nextTask = if (currentIndex < taskSequence.size - 1) {
                    taskSequence[currentIndex + 1]
                } else null

                repository.updateTaskResult(
                    assessmentId = _uiState.value.assessmentId!!,
                    taskType = currentTask,
                    taskResult = taskResult,
                    nextTaskId = nextTask?.taskId
                )

                file.delete()

                _uiState.update {
                    it.copy(
                        isUploading = false,
                        recordingState = RecordingState.COMPLETED,
                        uploadProgress = 100
                    )
                }

                if (nextTask != null) {
                    moveToNextTask(nextTask)
                } else {
                    completeAssessment()
                }

                _events.send(SpeechTaskEvent.TaskCompleted)

            } catch (e: Exception) {
                Log.e(TAG, "Upload failed", e)
                _uiState.update {
                    it.copy(
                        isUploading = false,
                        recordingState = RecordingState.ERROR,
                        error = "Upload failed: ${e.localizedMessage}"
                    )
                }
                _events.send(SpeechTaskEvent.Error(e.localizedMessage ?: "Upload failed"))
            }
        }
    }

    /**
     * Move to next task
     */
    private fun moveToNextTask(nextTask: SpeechTaskType) {
        viewModelScope.launch {
            val newProgress = _uiState.value.progressState.copy(
                completedTasks = _uiState.value.progressState.completedTasks + 1,
                currentTask = nextTask
            ).updateProgress()

            _uiState.update {
                it.copy(
                    currentTask = nextTask,
                    progressState = newProgress,
                    recordingState = RecordingState.IDLE,
                    isReviewMode = false,
                    duration = 0,
                    playbackPosition = 0,
                    isPlayingRecording = false
                )
            }

            audioFile = null

            _events.send(SpeechTaskEvent.NavigateToTask(nextTask))
        }
    }

    /**
     * Complete the entire assessment
     */
    private fun completeAssessment() {
        viewModelScope.launch {
            try {
                repository.completeAssessment(_uiState.value.assessmentId!!)
                _uiState.update { it.copy(isCompleted = true, isLoading = false) }
                _events.send(SpeechTaskEvent.AssessmentCompleted)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to complete assessment", e)
            }
        }
    }

    /**
     * Duration counter
     */
    private fun startDurationCounter() {
        viewModelScope.launch {
            while (_uiState.value.recordingState == RecordingState.RECORDING) {
                kotlinx.coroutines.delay(1000)
                val elapsed = (System.currentTimeMillis() - recordingStartTime) / 1000

                _uiState.update { it.copy(duration = elapsed) }

                if (elapsed >= MAX_DURATION_SECONDS) {
                    Log.d(TAG, "Max duration reached")
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
            while (_uiState.value.isPlayingRecording) {
                kotlinx.coroutines.delay(100)
                val position = audioPlayer?.getCurrentPosition() ?: 0
                _uiState.update { it.copy(playbackPosition = position) }
            }
        }
    }

    /**
     * Reset and cleanup
     */
    fun reset() {
        audioRecorder = null
        audioPlayer?.release()
        audioPlayer = null
        instructionPlayer?.release()
        instructionPlayer = null
        audioFile = null
        _uiState.update { SpeechTaskUiState() }
    }

    override fun onCleared() {
        super.onCleared()
        audioPlayer?.release()
        instructionPlayer?.release()
    }
}