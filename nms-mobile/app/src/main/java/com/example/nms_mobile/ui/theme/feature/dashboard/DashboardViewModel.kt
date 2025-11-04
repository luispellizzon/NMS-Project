import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nms_mobile.data.AuthRepository
import com.example.nms_mobile.data.FirestoreRepository
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

// Data model for the Dashboard screen's state (what the user sees).
data class DashboardUiState(
    val displayName: String = "NMS",
    val greeting: String = "Good morning",
    val riskScore: Double? = null,
    val isLoadingScore: Boolean = false,
    val error: String? = null,
    // Key status: Is the questionnaire finished?
    val isLifestyleQuestionaryCompleted: Boolean = false
)

// Single events for the UI (like navigation commands).
sealed class DashboardEvent { data object LoggedOut : DashboardEvent() }

class DashboardViewModel(
    private val repo: AuthRepository = AuthRepository.instance,
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val db: FirestoreRepository = FirestoreRepository.instance
) : ViewModel() {

    // The current data for the UI, which can be changed internally.
    private val _ui = MutableStateFlow(DashboardUiState())
    // The state that the UI watches for changes.
    val ui: StateFlow<DashboardUiState> = _ui.asStateFlow()

    // Events used for one-time actions like navigation.
    private val _events = Channel<DashboardEvent>(Channel.BUFFERED)
    val events: Flow<DashboardEvent> = _events.receiveAsFlow()

    init {
        // Start a task that runs when the ViewModel is created.
        viewModelScope.launch {
            // Watch for changes in the user session (like name updates).
            repo.session.collect { s ->
                val name = s.displayName?.takeIf { it.isNotBlank() } ?: "NMS"
                // Update the user's name and the time-based greeting.
                _ui.update { it.copy(displayName = name, greeting = computeGreeting()) }
            }
        }
        // Load the completion status of the questionnaire right away.
        checkLifestyleQuestionaryStatus()
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
                println("Error checking lifestyle questionary status: $e")
            }
        }
    }
}