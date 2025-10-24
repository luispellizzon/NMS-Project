package com.example.nms_mobile.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.repeatOnLifecycle
import com.example.nms_mobile.ui.dashboard.DashboardScreen
import com.example.nms_mobile.ui.dashboard.DashboardViewModel
import com.example.nms_mobile.ui.login.LoginScreen
import com.example.nms_mobile.ui.login.LoginViewModel
import com.example.nms_mobile.ui.home.HomeScreen
import com.example.nms_mobile.ui.personaldetails.PersonalInfoEvent
import com.example.nms_mobile.ui.personaldetails.PersonalInfoScreen
import com.example.nms_mobile.ui.personaldetails.PersonalInfoViewModel
import com.example.nms_mobile.ui.questionnaire.QuestionnaireEvent
import com.example.nms_mobile.ui.questionnaire.QuestionnaireScreen
import com.example.nms_mobile.ui.questionnaire.QuestionnaireViewModel
import com.example.nms_mobile.ui.signup.SignUpScreen
import com.example.nms_mobile.ui.signup.SignUpViewModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

@Composable
fun StartRoute(
    onGoLogin: () -> Unit,
    onGoPersonalInfo: () -> Unit,
    onGoDashboard: () -> Unit
) {
    // do the check once
    LaunchedEffect(Unit) {
        val auth = FirebaseAuth.getInstance()
        val user = auth.currentUser
        if (user == null) {
            onGoLogin()
            return@LaunchedEffect
        }

        // Check Firestore: has the user completed profile?
        val db = FirebaseFirestore.getInstance()
        val details = db.collection("user_details").document(user.uid).get().await()
        val hasProfile = details.exists()

        if (hasProfile) onGoDashboard()
        else onGoPersonalInfo()
    }

    // Simple splash while the check runs
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            CircularProgressIndicator()
            Spacer(Modifier.height(12.dp))
            Text("Loading…")
        }
    }
}
@Composable
fun LoginRoute(
    onNavigateAfterLogin: (hasProfile: Boolean) -> Unit,
    onNavigateToSignUp: () -> Unit
) {
    val viewModel = remember { LoginViewModel() }
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(state.success) {
        if (state.success) {
            onNavigateAfterLogin(false) // proceed to home or personal info
        }
    }

    LoginScreen(
        state = state,
        onEmailChange = viewModel::onEmailChange,
        onPasswordChange = viewModel::onPasswordChange,
        onLoginClick = viewModel::login,
        onSignUpClick = onNavigateToSignUp
    )
}


/**
 * SIGN UP
 * - Calls auth.signUp(email, password)
 * - On success (user != null) moves to PersonalInfo
 */
@Composable
fun SignUpRoute(
    onNavigateToPersonalInfo: () -> Unit,
    onBack: () -> Unit,
    onLoginInstead: () -> Unit
) {
    val vm = remember { SignUpViewModel() }
    val state by vm.uiState.collectAsState()

    LaunchedEffect(state.success) {
        if (state.success) onNavigateToPersonalInfo()
    }

    SignUpScreen(
        state = state,
        onFullNameChange = vm::onFullNameChange,
        onEmailChange = vm::onEmailChange,
        onPasswordChange = vm::onPasswordChange,
        onConfirmPasswordChange = vm::onConfirmPasswordChange,
        onSignUpClick = vm::signUp,
        onLoginClick = onLoginInstead,
        onGoogleClick = { /* TODO: Google sign-in */ },
        onFacebookClick = { /* TODO: Google sign-in */ },
        onAppleClick  = { /* TODO: Apple sign-in */ }
    )
}

/**
 * PERSONAL INFO
 * - For now, just emits onFinished when the form is submitted.
 *   Later you can persist to Firestore, then call onFinished().
 */
@Composable
fun PersonalInfoRoute(
    onFinished: () -> Unit
) {
    val vm = remember { PersonalInfoViewModel() }
    val state by vm.uiState.collectAsStateWithLifecycle()
    val lifecycleOwner = LocalLifecycleOwner.current

    LaunchedEffect(vm) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            vm.events.collect { e ->
                if (e is PersonalInfoEvent.SubmittedSuccessfully) {
                    onFinished()
                }
            }
        }
    }

    PersonalInfoScreen(
        state = state,
        onFullNameChange = vm::onFullNameChange,
        onDateOfBirthChange = vm::onDateOfBirthChange,
        onBiologicalSexChange = vm::onBiologicalSexChange,
        onEducationLevelChange = vm::onEducationLevelChange,
        onAgeChange = vm::onAgeChange,
        onWeightChange = vm::onWeightChange,
        onSubmit = vm::submit
    )
}

/**
 * HOME
 * - Pure UI container. If user hasn't completed profile, caller can navigate to PersonalInfo.
 */
@Composable
fun HomeRoute(
    hasCompletedProfile: Boolean,
    onLoggedOut: () -> Unit,
    onCompleteProfile: () -> Unit
) {
    val vm = remember { com.example.nms_mobile.ui.home.HomeViewModel() }
    val ui by vm.ui.collectAsState()

    // Keep VM in sync with the arg coming from navigation
    LaunchedEffect(hasCompletedProfile) {
        vm.setHasCompletedProfile(hasCompletedProfile)
    }

    // One-shot events (logout)
    LaunchedEffect(Unit) {
        vm.events.collect { e ->
            when (e) {
                com.example.nms_mobile.ui.home.HomeEvent.LoggedOut -> onLoggedOut()
            }
        }
    }

    HomeScreen(
        state = ui,
        onLogoutClick = vm::logout,
        onSelectTab = vm::selectTab,
        onCompleteProfileClick = onCompleteProfile
    )
}
@Composable
fun DashboardRoute(
    onOpenQuestionnaire: () -> Unit,
    onOpenNews: () -> Unit = {},
    onOpenSpeech: () -> Unit = {},
    onOpenMemory: () -> Unit = {},
    onOpenCognitive: () -> Unit = {}
) {
    val vm = androidx.compose.runtime.remember { DashboardViewModel() }
    val state by vm.ui.collectAsState()

    DashboardScreen(
        state = state,
        onOpenNews = onOpenNews,
        onOpenRiskAssessment = {
            onOpenQuestionnaire()
        },
        onOpenSpeech = onOpenSpeech,
        onOpenMemory = onOpenMemory,
        onOpenCognitive = onOpenCognitive
    )
}

@Composable
fun QuestionnaireRoute(
    onFinishedAll: () -> Unit
) {
    val vm = remember { QuestionnaireViewModel() }
    val state by vm.ui.collectAsState()

    LaunchedEffect(Unit) {
        vm.events.collect { e ->
            if (e is QuestionnaireEvent.Saved) onFinishedAll()
        }
    }

    QuestionnaireScreen(
        state = state,
        onDominantHand = vm::onDominantHand,
        onSmokingStatus = vm::onSmokingStatus,
        onAlcoholUse = vm::onAlcoholUse,
        onPhysicalActivity = vm::onPhysicalActivity,
        onNutritionDiet = vm::onNutritionDiet,
        onSleepQuality = vm::onSleepQuality,
        onDiabetic = vm::onDiabetic,
        onFamilyHistory = vm::onFamilyHistory,
        onDepression = vm::onDepression,
        onApoe = vm::onApoe,
        onMedication = vm::onMedication,
        onChronic = vm::onChronic,
        onFinish = vm::save
    )
}




