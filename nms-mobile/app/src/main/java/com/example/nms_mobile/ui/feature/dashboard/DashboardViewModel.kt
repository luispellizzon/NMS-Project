import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.AuthRepository
import com.example.nms_mobile.data.FirestoreRepository
import com.example.nms_mobile.data.SpeechAssessmentsTasks
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalTime
import android.util.Log
import com.example.nms_mobile.data.Patient
import com.example.nms_mobile.data.PatientRepository

// Data model for the Dashboard screen's state (what the user sees).
data class DashboardUiState(
    val displayName: String = "NMS",
    val role: String? = null,
    val greeting: String = "Good morning",
    val riskScore: Double? = null,
    val isLoadingScore: Boolean = false,
    val error: String? = null,
    // Key status: Is the questionnaire finished?
    val isLifestyleQuestionaryCompleted: Boolean = false,
    // Speech assessment status tracking
    val speechAnalysisStatus: SpeechAnalysisStatus = SpeechAnalysisStatus.NOT_STARTED,
    val isSpeechAssessmentCompleted: Boolean = false,
    val speechUserScore: Int? = null,
    val speechTotalScore: Int? = null,

    // Caregiver stuff for now
    val patients: List<Patient> = emptyList(),
    val isLoadingPatients: Boolean = false,
    val selectedPatient: Patient? = null,  // Currently selected patient
    val isManagingPatient: Boolean = false
)

// Single events for the UI (like navigation commands).
sealed class DashboardEvent {
    data object LoggedOut : DashboardEvent()
}

class DashboardViewModel(
    private val repo: AuthRepository = AuthRepository.instance,
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val db: FirestoreRepository = FirestoreRepository.instance,
    private val speechRepo: SpeechAssessmentsTasks = SpeechAssessmentsTasks.instance,
    private val patientRepo: PatientRepository = PatientRepository.instance
) : ViewModel() {

    companion object {
        private const val TAG = "DashboardViewModel"
    }

    // The current data for the UI, which can be changed internally.
    private val _ui = MutableStateFlow(DashboardUiState())
    // The state that the UI watches for changes.
    val ui: StateFlow<DashboardUiState> = _ui.asStateFlow()

    // Events used for one-time actions like navigation.
    private val _events = Channel<DashboardEvent>(Channel.BUFFERED)
    val events: Flow<DashboardEvent> = _events.receiveAsFlow()


    init {
        viewModelScope.launch {
            repo.session.collect { s ->
                val userRole = db.getUserProfile()?.role
                val name = s.displayName?.takeIf { it.isNotBlank() } ?: "NMS"
                _ui.update { it.copy(displayName = name, greeting = computeGreeting(), role = userRole) }

                // Load data based on role
                if (userRole == "caregiver") {
                    loadCaregiverPatients()
                } else if (userRole == "patient") {
                    checkLifestyleQuestionaryStatus()
                    checkSpeechAssessmentStatus()
                }
            }
        }
    }

    // NEW: Load patients for caregiver
    fun loadCaregiverPatients() = viewModelScope.launch {
        _ui.update { it.copy(isLoadingPatients = true) }
        try {
            val patients = patientRepo.getCaregiverPatients()
            Log.d("CAregiver", patients.toString())
            _ui.update {
                it.copy(
                    patients = patients,
                    isLoadingPatients = false
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading patients", e)
            _ui.update { it.copy(isLoadingPatients = false) }
        }
    }

    // NEW: Select a patient to manage
    fun selectPatient(patient: Patient) {
        _ui.update {
            it.copy(
                selectedPatient = patient,
                isManagingPatient = true
            )
        }
    }

    // NEW: Go back to patient list
    fun deselectPatient() {
        _ui.update {
            it.copy(
                selectedPatient = null,
                isManagingPatient = false
            )
        }
    }

    // NEW: Refresh patient list
    fun refreshPatients() {
        loadCaregiverPatients()
    }

    // Calculates "Good morning," "Good afternoon," or "Good evening" based on the time.
    private fun computeGreeting(): String {
        val hour = try {
            LocalTime.now().hour
        } catch (_: Throwable) {
            9
        }
        return when (hour) {
            in 5..11 -> "Good morning"
            in 12..17 -> "Good afternoon"
            else -> "Good evening"
        }
    }

    // Tells the AuthRepository to sign the user out and sends a navigation event.
    fun logout() = viewModelScope.launch {
        repo.logout()
        _events.send(DashboardEvent.LoggedOut)
    }

    // Fetches the completion status of the questionnaire from the database.
    private fun checkLifestyleQuestionaryStatus() = viewModelScope.launch {
        val userId = auth.currentUser?.uid

        // Only proceed if the user is logged in.
        if (userId != null) {
            try {
                // Call the repository to check if the status is true/false.
                val isCompleted = db.getLifestyleQuestionaryStatus(userId)

                // Update the UI state with the result.
                _ui.update { it.copy(isLifestyleQuestionaryCompleted = isCompleted) }

            } catch (e: Exception) {
                // Log the error if fetching the status fails (e.g., no internet).
                Log.e(TAG, "Error checking lifestyle questionary status: $e")
            }
        }
    }

    /**
     * Checks the speech assessment status and starts polling if processing
     */
    private fun checkSpeechAssessmentStatus() = viewModelScope.launch {
        val userId = auth.currentUser?.uid

        if (userId != null) {
            try {
                // Get the most recent completed assessment
                val recentAssessment = speechRepo.getMostRecentCompletedAssessment()

                if (recentAssessment != null) {
                    _ui.update { it.copy(isSpeechAssessmentCompleted = true) }

                    // Calculate max score from all tasks
                    val maxScore = recentAssessment.content.values.sumOf { it.maxScore }

                    // Check the AI analysis status
                    when (recentAssessment.aiAnalysis) {
                        "processing" -> {
                            _ui.update {
                                it.copy(
                                    speechAnalysisStatus = SpeechAnalysisStatus.PROCESSING,
                                    speechUserScore = null,
                                    speechTotalScore = null
                                )
                            }
                            // Start polling for completion
                            startPollingForAnalysis(recentAssessment.id)
                        }
                        "processed" -> {
                            _ui.update {
                                it.copy(
                                    speechAnalysisStatus = SpeechAnalysisStatus.COMPLETED,
                                    speechUserScore = recentAssessment.totalScore,
                                    speechTotalScore = maxScore
                                )
                            }
                        }
                        "error" -> {
                            _ui.update {
                                it.copy(
                                    speechAnalysisStatus = SpeechAnalysisStatus.ERROR,
                                    speechUserScore = null,
                                    speechTotalScore = null
                                )
                            }
                        }
                        else -> {
                            _ui.update {
                                it.copy(
                                    speechAnalysisStatus = SpeechAnalysisStatus.NOT_STARTED,
                                    speechUserScore = null,
                                    speechTotalScore = null
                                )
                            }
                        }
                    }

                    Log.d(TAG, "Speech assessment status: ${recentAssessment.aiAnalysis}, Score: ${recentAssessment.totalScore}/$maxScore")
                } else {
                    _ui.update {
                        it.copy(
                            isSpeechAssessmentCompleted = false,
                            speechAnalysisStatus = SpeechAnalysisStatus.NOT_STARTED,
                            speechUserScore = null,
                            speechTotalScore = null
                        )
                    }
                }

            } catch (e: Exception) {
                Log.e(TAG, "Error checking speech assessment status: $e")
            }
        }
    }

    /**
     * Starts polling for analysis completion every 30 seconds
     */
    private fun startPollingForAnalysis(assessmentId: String) = viewModelScope.launch {
        try {
            speechRepo.pollForAnalysisCompletion(assessmentId).collect { status ->
                Log.d(TAG, "Polling result - Analysis status: $status")

                // Fetch the latest assessment to get updated scores
                val updatedAssessment = speechRepo.getMostRecentCompletedAssessment()
                val maxScore = updatedAssessment?.content?.values?.sumOf { it.maxScore } ?: 0

                when (status) {
                    "processing" -> {
                        _ui.update {
                            it.copy(
                                speechAnalysisStatus = SpeechAnalysisStatus.PROCESSING,
                                speechUserScore = null,
                                speechTotalScore = null
                            )
                        }
                    }
                    "processed" -> {
                        _ui.update {
                            it.copy(
                                speechAnalysisStatus = SpeechAnalysisStatus.COMPLETED,
                                speechUserScore = updatedAssessment?.totalScore,
                                speechTotalScore = maxScore
                            )
                        }
                        Log.d(TAG, "Analysis completed! Score: ${updatedAssessment?.totalScore}/$maxScore")
                    }
                    "error" -> {
                        _ui.update {
                            it.copy(
                                speechAnalysisStatus = SpeechAnalysisStatus.ERROR,
                                speechUserScore = null,
                                speechTotalScore = null
                            )
                        }
                        Log.e(TAG, "Analysis error detected")
                    }
                    else -> {
                        Log.d(TAG, "Unknown analysis status: $status")
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error during polling: $e")
            _ui.update {
                it.copy(
                    speechAnalysisStatus = SpeechAnalysisStatus.ERROR,
                    speechUserScore = null,
                    speechTotalScore = null
                )
            }
        }
    }

    /**
     * Manually refresh the speech assessment status
     * Can be called when user returns to dashboard
     */
    fun refreshSpeechAssessmentStatus() {
        checkSpeechAssessmentStatus()
    }
}