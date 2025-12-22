package com.example.nms_mobile.navigation.routes

import DashboardViewModel
import SpeechAnalysisStatus
import SpeechAssessmentDocument
import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.repeatOnLifecycle
import com.example.nms_mobile.data.AuthRepository
import com.example.nms_mobile.data.FirestoreRepository
import com.example.nms_mobile.data.SpeechAssessmentsTasksRepository
import com.example.nms_mobile.ui.cognitive.CubeDrawingScreen
import com.example.nms_mobile.ui.components.ManagedModeBanner
import com.example.nms_mobile.ui.feature.addpatient.AddPatientScreen
import com.example.nms_mobile.ui.feature.cognitive.AnimalNamingScreen
import com.example.nms_mobile.ui.feature.cognitive.ClockDrawingScreen
import com.example.nms_mobile.ui.feature.cognitive.CognitiveEvent
import com.example.nms_mobile.ui.feature.cognitive.CognitiveResultsScreen
import com.example.nms_mobile.ui.feature.cognitive.CognitiveViewModel
import com.example.nms_mobile.ui.feature.cognitive.TrailMakingScreen
import com.example.nms_mobile.ui.feature.dashboard.DashboardScreen
import com.example.nms_mobile.ui.feature.login.LoginScreen
import com.example.nms_mobile.ui.feature.login.LoginViewModel
import com.example.nms_mobile.ui.feature.memory.MemoryTestScreen
import com.example.nms_mobile.ui.feature.memory.MemoryTestViewModel
import com.example.nms_mobile.ui.feature.news.NewsScreen
import com.example.nms_mobile.ui.feature.news.NewsViewModel
import com.example.nms_mobile.ui.feature.personal_details.PersonalInfoEvent
import com.example.nms_mobile.ui.feature.personal_details.PersonalInfoScreen
import com.example.nms_mobile.ui.feature.personal_details.PersonalInfoViewModel
import com.example.nms_mobile.ui.feature.results.ResultsScreen
import com.example.nms_mobile.ui.feature.results.ResultsViewModel
import com.example.nms_mobile.ui.feature.signup.SignUpViewModel
import com.example.nms_mobile.ui.feature.speech.SpeechAssessmentEvent
import com.example.nms_mobile.ui.feature.speech.SpeechAssessmentViewModel
import com.example.nms_mobile.ui.feature.speech.SpeechTaskEvent
import com.example.nms_mobile.ui.feature.speech.SpeechTaskScreen
import com.example.nms_mobile.ui.feature.speech.SpeechTaskViewModel
import com.example.nms_mobile.ui.feature.speech.results.SpeechResultsScreen
import com.example.nms_mobile.ui.questionnaire.SectionedQuestionnaireEvent
import com.example.nms_mobile.ui.questionnaire.SectionedQuestionnaireScreen
import com.example.nms_mobile.ui.questionnaire.SectionedQuestionnaireViewModel
import com.example.nms_mobile.ui.signup.SignUpScreen
import com.example.nms_mobile.ui.speech.SpeechAssessmentScreen
import com.example.nms_mobile.ui.feature.contact_doctor.ContactDoctorRoute



// The starting screen: checks if the user is logged in and if they have a profile.
@Composable
fun StartRoute(
    onGoLogin: () -> Unit,
    onGoPersonalInfo: () -> Unit,
    onGoDashboard: () -> Unit
) {
    val auth = AuthRepository.instance
    val db = FirestoreRepository.instance

    // Run this check only once when the screen starts.
    LaunchedEffect(Unit) {
        val user = auth.currentUser()
        // If there's no user, go to Login.
        if (user == null) {
            onGoLogin()
            return@LaunchedEffect
        }

        // Check the Firestore database to see if the user profile exists.
        val hasProfile = try {
            db.hasCompletedProfile()
        } catch (_: Exception) {
            false
        }

        // Navigate based on profile status.
        if (hasProfile) onGoDashboard()
        else onGoPersonalInfo()
    }

    // Show a loading circle while the check is happening.
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            CircularProgressIndicator()
            Spacer(Modifier.height(12.dp))
            Text("Loading…")
        }
    }
}

// Handles the login logic and navigation.
@Composable
fun LoginRoute(
    onNavigateAfterLogin: (hasProfile: Boolean) -> Unit,
    onNavigateToSignUp: () -> Unit
) {
    val viewModel = remember { LoginViewModel() }
    val state by viewModel.uiState.collectAsState()

    // When the login attempt succeeds, navigate away.
    LaunchedEffect(state.success) {
        if (state.success) {
            onNavigateAfterLogin(false)
        }
    }

    LoginScreen(
        state = state,
        onEmailChange = viewModel::onEmailChange,
        onPasswordChange = viewModel::onPasswordChange,
        onLoginClick = viewModel::login,
        onSignUpClick = onNavigateToSignUp,
        onGoogleLogin = viewModel::loginWithGoogle,
        onFacebookLogin = viewModel::loginWithFacebook,
        onConfirmProviderLink = viewModel::confirmProviderLink
    )
}

// Replace the existing SignUpRoute with this:
@Composable
fun SignUpRoute(
    onNavigateToPersonalInfo: () -> Unit,
    onBack: () -> Unit,
    onLoginInstead: () -> Unit
) {
    val vm = remember { SignUpViewModel() }
    val state by vm.uiState.collectAsState()

    // When sign-up succeeds, navigate to the Personal Info screen.
    LaunchedEffect(state.success) {
        if (state.success) onNavigateToPersonalInfo()
    }

    SignUpScreen(
        state = state,
        onEmailChange = vm::onEmailChange,
        onPasswordChange = vm::onPasswordChange,
        onConfirmPasswordChange = vm::onConfirmPasswordChange,
        onSignUpClick = vm::signUp,
        onLoginClick = onLoginInstead,
        onGoogleSignUp = { idToken ->
            // For sign-up, we use the same login methods since
            // social providers automatically create accounts if they don't exist
            vm.signUpWithGoogle(idToken)
        },
        onFacebookSignUp = { accessToken ->
            vm.signUpWithFacebook(accessToken)
        },
    )
}

// Handles collecting and saving user's initial personal details.
@Composable
fun PersonalInfoRoute(onFinished: () -> Unit) {
    val vm = remember { PersonalInfoViewModel() }
    // Watch the ViewModel's state.
    val state by vm.uiState.collectAsStateWithLifecycle()
    val lifecycleOwner = LocalLifecycleOwner.current

    // Watch for single-time events from the ViewModel.
    LaunchedEffect(vm) {
        // Collect events only when the screen is visible.
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            vm.events.collect { e ->
                // If submission is successful, navigate to the Dashboard.
                if (e is PersonalInfoEvent.SubmittedSuccessfully) {
                    onFinished()
                }
            }
        }
    }

    // Connect the UI screen to the ViewModel.
    PersonalInfoScreen(
        state = state,
        onFullNameChange = vm::onFullNameChange,
        onDateOfBirthChange = vm::onDateOfBirthChange,
        onCountryChange = vm::onCountryChange,
        onCountrySelected = vm::onCountrySelected,
        onCountryFocused = vm::onFieldFocused,
        onEmailChange = vm::onEmailChange,
        onRoleChange = vm::onRoleChange,
        onConsentChange = vm::onConsentChange,
        onSubmit = vm::submit
    )
}

// Handles the main dashboard view.
@Composable
fun DashboardRoute(
    onOpenQuestionnaire: () -> Unit,
    onOpenImageDescription:  () -> Unit,
    onOpenNews: () -> Unit,
    onOpenSpeech: () -> Unit = {},
    onOpenSpeechResults: () -> Unit = {},
    onOpenMemory: () -> Unit = {},
    onOpenCognitive: () -> Unit = {},
    onLoggedOut: () -> Unit = {},
    onOpenFeedback: () -> Unit = {},
    onOpenAddPatient: () -> Unit = {},
    onOpenContactDoctor: () -> Unit = {},
    onOpenResults: () -> Unit = {},
    onOpenSupport: () -> Unit = {}
) {
    val vm = remember { DashboardViewModel() }
    val state by vm.ui.collectAsState()
    val lifecycleOwner = LocalLifecycleOwner.current

//    // Watch for the 'LoggedOut' event from the ViewModel.
//    LaunchedEffect(Unit) {
//        vm.events.collect { ev ->
//            when (ev) {
//                // If the ViewModel sends a logout event, navigate to the Login screen.
//                DashboardEvent.LoggedOut -> onLoggedOut()
//            }
//        }
//    }

    // Refresh speech assessment status when dashboard is resumed
    LaunchedEffect(lifecycleOwner) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.RESUMED) {
            vm.refreshSpeechAssessmentStatus()
        }
    }

    // AC-3: UI Indication - Display managed mode banner when active
    // AC-4: Return Navigation - Provides exit button in banner
    Box {
        // Connect the Dashboard UI screen to the ViewModel.
        DashboardScreen(
            state = state,
            onOpenNews = onOpenNews,
            onOpenRiskAssessment = onOpenQuestionnaire, // Opens the questionnaire
            onOpenImageDescription = onOpenImageDescription,
            onOpenSpeech = {
                // Navigate to results if completed, otherwise to speech task
                if (state.speechAnalysisStatus == SpeechAnalysisStatus.COMPLETED) {
                    onOpenSpeechResults()
                } else {
                    onOpenSpeech()
                }
            },
            onOpenMemory = onOpenMemory,
            onOpenCognitive = onOpenCognitive,
            onLogoutClick = {
                onLoggedOut()
                vm::logout
            },
            onAddPatient = onOpenAddPatient,
            onSelectPatient = vm::selectPatient,
            onDeselectPatient = vm::deselectPatient,
            onFeedbackClick = onOpenFeedback,
            onOpenResults = onOpenResults,
            onOpenContactDoctor = onOpenContactDoctor,
            onSupportClick = onOpenSupport
        )

        // Overlay the managed mode banner at the top if in managed mode
        ManagedModeBanner(
            onExitManagedMode = vm::deselectPatient
        )
    }
}

// Handles the sequence of questionnaire screens.
@Composable
fun QuestionnaireRoute(
    onFinishedAll: () -> Unit,
    onBack: () -> Unit
) {
    val vm = remember { SectionedQuestionnaireViewModel() }
    val state by vm.ui.collectAsState()
    val lifecycleOwner = LocalLifecycleOwner.current

    // Watch for the 'Submitted' event from the ViewModel.
    LaunchedEffect(vm) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            vm.events.collect { e ->
                // If the questionnaire is submitted successfully, navigate away.
                if (e is SectionedQuestionnaireEvent.Submitted) onFinishedAll()
            }
        }
    }

    // Connect the Questionnaire UI screen to the ViewModel.
    SectionedQuestionnaireScreen(
        state = state,
        onBackClick = onBack,
        // The 'Prev' button checks if the current section is valid before moving back.
        onPrev = {
            if (vm.validateCurrentSection()) vm.prevSection() else Unit
        },
        // The 'Next' button checks if the current section is valid before moving forward.
        onNext = {
            if (vm.validateCurrentSection()) vm.nextSection()
        },
        // The 'Submit' button checks if the current section is valid before submitting all data.
        onSubmit = {
            if (vm.validateCurrentSection()) vm.submit()
        },
        // All these functions connect the user's input directly to the ViewModel's setters.
        onAge = vm::onAge,
        onWeight = vm::onWeight,
        onDominantHand = vm::onDominantHand,
        onGender = vm::onGender,
        onEducation = vm::onEducation,
        onSmoking = vm::onSmoking,
        onAlcohol = vm::onAlcohol,
        onPhysical = vm::onPhysicalActivity,
        onNutrition = vm::onNutrition,
        onSleep = vm::onSleep,
        onDiabetic = vm::onDiabetic,
        onFamilyHistory = vm::onFamilyHistory,
        onDepression = vm::onDepression,
        onGenetic = vm::onGenetic,
        onMedication = vm::onMedication,
        onChronic = vm::onChronic
    )
}

// Handles the Speech Assessment screen (OLD - Image Description Task)
@Composable
fun SpeechAssessmentRoute(
    onBack: () -> Unit,
    onCompleted: () -> Unit
) {
    val context = LocalContext.current
    val vm = remember { SpeechAssessmentViewModel() }
    val state by vm.uiState.collectAsState()
    val lifecycleOwner = LocalLifecycleOwner.current

    // Handle events
    LaunchedEffect(vm) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            vm.events.collect { event ->
                when (event) {
                    is SpeechAssessmentEvent.UploadCompleted -> {
                        // Upload completed, navigate back
                        onCompleted()
                    }
                    is SpeechAssessmentEvent.RecordingCompleted -> {
                        // Recording stopped, now in review mode (don't navigate yet)
                    }
                    is SpeechAssessmentEvent.Error -> {
                        // Error already shown in UI state
                    }
                }
            }
        }
    }

    // Request audio permissions
    val audioPermission = Manifest.permission.RECORD_AUDIO
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            vm.startRecording(context)
        }
    }

    SpeechAssessmentScreen(
        state = state,
        onStartRecording = {
            // Check permission before recording
            if (context.checkSelfPermission(audioPermission) == PackageManager.PERMISSION_GRANTED) {
                vm.startRecording(context)
            } else {
                permissionLauncher.launch(audioPermission)
            }
        },
        onStopRecording = vm::stopRecording,
        onPlayRecording = { vm.playRecording(context) },
        onPausePlayback = vm::pausePlayback,
        onResumePlayback = vm::resumePlayback,
        onRestartPlayback = { vm.restartPlayback(context) },
        onRepeatRecording = { vm.repeatRecording(context) },
        onConfirmRecording = vm::confirmRecording,
        onBack = onBack
    )
}

// NEW: Handles the Speech Task flow (Word Recall, Localization, Repeat Action)
@Composable
fun SpeechTaskRoute(
    onBack: () -> Unit,
    onCompleted: () -> Unit
) {
    val context = LocalContext.current
    val vm = remember { SpeechTaskViewModel() }
    val state by vm.uiState.collectAsState()
    val lifecycleOwner = LocalLifecycleOwner.current

    // Initialize assessment on first launch
    LaunchedEffect(Unit) {
        vm.initializeAssessment()
    }

    // Handle events
    LaunchedEffect(vm) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            vm.events.collect { event ->
                when (event) {
                    is SpeechTaskEvent.TaskCompleted -> {
                        // Task completed, stay on screen (VM will navigate to next task)
                    }
                    is SpeechTaskEvent.AssessmentCompleted -> {
                        // All tasks completed - screen will show completion view
                        // User clicks "Done" to go back to dashboard
                    }
                    is SpeechTaskEvent.Error -> {
                        // Error already shown in UI state
                    }
                    is SpeechTaskEvent.NavigateToTask -> {
                        // Task navigation handled by VM, no action needed here
                    }
                }
            }
        }
    }

    // Request audio permissions
    val audioPermission = Manifest.permission.RECORD_AUDIO
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            vm.startRecording(context)
        }
    }

    SpeechTaskScreen(
        state = state,
        onPlayInstruction = { vm.playInstruction(context) },
        onStartRecording = {
            // Check permission before recording
            if (context.checkSelfPermission(audioPermission) == PackageManager.PERMISSION_GRANTED) {
                vm.startRecording(context)
            } else {
                permissionLauncher.launch(audioPermission)
            }
        },
        onStopRecording = vm::stopRecording,
        onPlayRecording = { vm.playRecording(context) },
        onPausePlayback = vm::pausePlayback,
        onResumePlayback = vm::resumePlayback,
        onRestartPlayback = { vm.restartPlayback(context) },
        onRepeatRecording = { vm.repeatRecording(context) },
        onSubmitTask = { vm.submitTask(context) },
        onBack = onBack,
        onCompletionDone = onCompleted  // Navigate back to dashboard when user clicks "Done"
    )
}

// NEW: Handles the Speech Results screen (shows detailed results)
@Composable
fun SpeechResultsRoute(
    onBack: () -> Unit,
    onRedoTest: () -> Unit
) {
    val speechRepo = remember { SpeechAssessmentsTasksRepository.instance }
    var assessment by remember { mutableStateOf<SpeechAssessmentDocument?>(null) }

    // Load the most recent completed assessment
    LaunchedEffect(Unit) {
        assessment = speechRepo.getMostRecentCompletedAssessment()
    }

    SpeechResultsScreen(
        assessment = assessment,
        onBack = onBack,
        onRedoTest = onRedoTest
    )
}

@Composable
fun MemoryTestRoute(
    onBack: () -> Unit,
    onCompleted: () -> Unit
) {
    val vm = remember { MemoryTestViewModel() }

    MemoryTestScreen(
        viewModel = vm,
        onBack = onBack,
        onCompleted = onCompleted
    )
}

@Composable
fun CognitiveTestRoute(
    onCompleted: () -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val vm = remember { CognitiveViewModel() }
    val state by vm.uiState.collectAsState()
    val lifecycleOwner = LocalLifecycleOwner.current

    // Listen for events
    LaunchedEffect(vm) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            vm.events.collect { event ->
                when (event) {
                    is CognitiveEvent.AllTasksCompleted -> {
                        onCompleted()
                    }
                    else -> {}
                }
            }
        }
    }

    // Main screen switcher
    when (state.currentTask) {
        0 -> {
            LaunchedEffect(Unit) {
                vm.startTask(1)
            }
        }

        1 -> {
            // Cube Drawing Task
            CubeDrawingScreen(
                state = state,
                onPlayInstruction = {
                    vm.playInstruction(
                        context,
                        "Draw a 3D cube using your finger on the screen. Try to make it look like a cube with depth."
                    )
                },
                elapsedTime = state.elapsedTime,
                onPathsChanged = vm::updatePaths,
                onClear = vm::clearCanvas,
                onNext = { bitmap ->
                    vm.submitCubeDrawing(bitmap)
                    vm.startTask(2)
                },
                onBack = onBack
            )
        }

        2 -> {
            // Trail Making Task
            TrailMakingScreen(
                state = state,
                onPlayInstruction = {
                    vm.playInstruction(
                        context,
                        "Connect the circles in order, alternating between numbers and letters: 1-A-2-B-3-C-4-D-5-E"
                    )
                },
                elapsedTime = state.elapsedTime,
                touchSequence = state.touchSequence,
                expectedSequence = state.expectedSequence,
                onNodeTouched = vm::registerNodeTouch,
                onNext = { bitmap ->
                    vm.submitTrailMaking(bitmap)
                    vm.startTask(3)
                },
                onBack = {
                    vm.startTask(1)
                }
            )
        }

        3 -> {
            // Clock Drawing Task
            ClockDrawingScreen(
                state = state,
                onPlayInstruction = {
                    vm.playInstruction(
                        context,
                        "Select the clock that shows 11:10 (ten past eleven)."
                    )
                },
                elapsedTime = state.elapsedTime,
                onNext = { selectedClock ->
                    vm.submitClockDrawing(selectedClock)
                    vm.startTask(4)
                },
                onBack = {
                    vm.startTask(2)
                }
            )
        }

        4 -> {
            // Animal Naming Task
            AnimalNamingScreen(
                state = state,
                currentQuestion = state.currentAnimalQuestion,
                onPlayInstruction = {
                    vm.playInstruction(
                        context,
                        "Several pictures of animals will appear. Tap on the correct name for each one."
                    )
                },
                elapsedTime = state.elapsedTime,
                onAnswerSelected = { answer ->
                    vm.submitAnimalAnswer(answer)
                },
                onNext = {
                    // Move to next animal question
                    vm.nextAnimalQuestion()
                },
                onSubmit = {
                    vm.submitAnimalNaming()
                    // Don't call onCompleted here, wait for event
                },
                onBack = {
                    if (state.currentAnimalQuestion > 0) {
                        vm.previousAnimalQuestion()
                    } else {
                        vm.startTask(3)
                    }
                }
            )
        }
    }

    // Error dialog (only once)
    if (state.error != null) {
        AlertDialog(
            onDismissRequest = { /* Do nothing */ },
            title = { Text("Error") },
            text = { Text(state.error!!) },
            confirmButton = {
                Button(onClick = { vm.reset() }) {
                    Text("OK")
                }
            }
        )
    }
}

// NEW: Cognitive Results screen
@Composable
fun CognitiveResultsRoute(
    onViewResults: () -> Unit,
    onBack: () -> Unit,
    onRedoTest: () -> Unit
) {
    CognitiveResultsScreen(
        onViewResults = onViewResults,
        onBack = onBack,
        onRedoTest = onRedoTest
    )
}

@Composable
fun NewsRoute(
    onBack: () -> Unit
) {
    val viewModel = remember { NewsViewModel() }
    val state by viewModel.uiState.collectAsState()

    NewsScreen(
        state = state,
        onBack = onBack,
        onRefresh = viewModel::loadNews,
        onGenerateNews = { viewModel.generateNews() },
        onSetAudience = viewModel::setAudience
    )
}

@Composable
fun AddPatientRoute(
    onBack: () -> Unit,
    onPatientCreated: () -> Unit
) {
    AddPatientScreen(
        onBack = onBack,
        onPatientCreated = onPatientCreated
    )
}


@Composable

fun ResultsRoute(
    onBack: () -> Unit,
    onContactDoctor: () -> Unit
) {
    val vm = remember { ResultsViewModel() }
    val state by vm.ui.collectAsState()
    ResultsScreen(
//        state = state,
        onNavigateHome = onBack,
        onContactDoctor = onContactDoctor,
        onLoadResults = vm::loadResults
    )
}

