package com.example.nms_mobile.navigation

import DashboardViewModel
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
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
import com.example.nms_mobile.ui.dashboard.DashboardScreen
import com.example.nms_mobile.ui.login.LoginScreen
import com.example.nms_mobile.ui.login.LoginViewModel
import com.example.nms_mobile.ui.personaldetails.PersonalInfoEvent
import com.example.nms_mobile.ui.personaldetails.PersonalInfoScreen
import com.example.nms_mobile.ui.personaldetails.PersonalInfoViewModel
import com.example.nms_mobile.ui.questionnaire.SectionedQuestionnaireEvent
import com.example.nms_mobile.ui.questionnaire.SectionedQuestionnaireScreen
import com.example.nms_mobile.ui.questionnaire.SectionedQuestionnaireViewModel
import com.example.nms_mobile.ui.signup.SignUpScreen
import com.example.nms_mobile.ui.signup.SignUpViewModel
import com.example.nms_mobile.ui.speech.SpeechAssessmentScreen
import com.example.nms_mobile.ui.speech.SpeechAssessmentEvent
import com.example.nms_mobile.ui.speech.SpeechAssessmentViewModel

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
        } catch (e: Exception) {
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
    // Create and remember the ViewModel (the logic).
    val viewModel = remember { LoginViewModel() }
    // Watch the current status of the ViewModel.
    val state by viewModel.uiState.collectAsState()

    // When the login attempt succeeds, navigate away.
    LaunchedEffect(state.success) {
        if (state.success) {
            // We pass 'false' to indicate we still need to check the profile status later.
            onNavigateAfterLogin(false)
        }
    }

    // Connect the UI screen to the ViewModel's data and functions.
    LoginScreen(
        state = state,
        onEmailChange = viewModel::onEmailChange,
        onPasswordChange = viewModel::onPasswordChange,
        onLoginClick = viewModel::login,
        onSignUpClick = onNavigateToSignUp
    )
}

// Handles the sign-up logic and navigation.
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

    // Connect the UI screen to the ViewModel.
    SignUpScreen(
        state = state,
        onEmailChange = vm::onEmailChange,
        onPasswordChange = vm::onPasswordChange,
        onConfirmPasswordChange = vm::onConfirmPasswordChange,
        onSignUpClick = vm::signUp,
        onLoginClick = onLoginInstead,
        onGoogleClick = { /* TODO: Google sign-in */ },
        onFacebookClick = { /* TODO: Facebook sign-in */ },
        onAppleClick = { /* TODO: Apple sign-in */ }
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
        onEmailChange = vm::onEmailChange,
        onRoleChange = vm::onRoleChange,
        onSubmit = vm::submit
    )
}

// Handles the main dashboard view.
@Composable
fun DashboardRoute(
    onOpenQuestionnaire: () -> Unit,
    onOpenNews: () -> Unit = {},
    onOpenSpeech: () -> Unit = {},
    onOpenMemory: () -> Unit = {},
    onOpenCognitive: () -> Unit = {},
    onLoggedOut: () -> Unit = {}
) {
    val vm = remember { DashboardViewModel() }
    val state by vm.ui.collectAsState()

    // Watch for the 'LoggedOut' event from the ViewModel.
    LaunchedEffect(Unit) {
        vm.events.collect { ev ->
            when (ev) {
                // If the ViewModel sends a logout event, navigate to the Login screen.
                DashboardEvent.LoggedOut -> onLoggedOut()
            }
        }
    }

    // Connect the Dashboard UI screen to the ViewModel.
    DashboardScreen(
        state = state,
        onOpenNews = onOpenNews,
        onOpenRiskAssessment = onOpenQuestionnaire, // Opens the questionnaire
        onOpenSpeech = onOpenSpeech,
        onOpenMemory = onOpenMemory,
        onOpenCognitive = onOpenCognitive,
        onLogoutClick = vm::logout
    )
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
// Handles the Speech Assessment screen
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
    val audioPermission = android.Manifest.permission.RECORD_AUDIO
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






