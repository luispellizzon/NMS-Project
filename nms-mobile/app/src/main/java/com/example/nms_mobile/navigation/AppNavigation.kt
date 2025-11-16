package com.example.nms_mobile.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.nms_mobile.navigation.routes.DashboardRoute
import com.example.nms_mobile.navigation.routes.LoginRoute
import com.example.nms_mobile.navigation.routes.MemoryTestRoute
import com.example.nms_mobile.navigation.routes.PersonalInfoRoute
import com.example.nms_mobile.navigation.routes.QuestionnaireRoute
import com.example.nms_mobile.navigation.routes.SignUpRoute
import com.example.nms_mobile.navigation.routes.SpeechAssessmentRoute
import com.example.nms_mobile.navigation.routes.SpeechResultsRoute
import com.example.nms_mobile.navigation.routes.SpeechTaskRoute
import com.example.nms_mobile.navigation.routes.StartRoute
import com.example.nms_mobile.ui.questionnaire.QuestionnaireIntroScreen


// This is the central file that defines all the app screens and how to move between them.

@Composable
fun AppNavigation(
    navController: NavHostController = rememberNavController() // Keeps track of the screens history (the back stack).
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Start.route // The very first screen the user sees.
    ) {
        // START GATE (The first screen that decides where the user should go: Login, Personal Info, or Dashboard)
        composable(Screen.Start.route) {
            StartRoute(
                // Go to the Login screen. Clear the Start screen from the history.
                onGoLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Start.route) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                // Go to the Personal Info screen. Clear the Start screen from the history.
                onGoPersonalInfo = {
                    navController.navigate(Screen.PersonalInfo.route) {
                        popUpTo(Screen.Start.route) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                // Go to the main Dashboard. Clear the Start screen from the history.
                onGoDashboard = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Start.route) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }

        // LOGIN (User signs into their account)
        composable(Screen.Login.route) {
            LoginRoute(
                // After a successful login, navigate back to the Start screen to re-evaluate the user's destination.
                onNavigateAfterLogin = { _hasProfileIgnored ->
                    navController.navigate(Screen.Start.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                // Go to the sign-up screen.
                onNavigateToSignUp = { navController.navigate(Screen.SignUp.route) }
            )
        }

        // SIGN UP (User creates a new account)
        composable(Screen.SignUp.route) {
            SignUpRoute(
                // After creating an account, go to the Personal Info screen. Clear SignUp from history.
                onNavigateToPersonalInfo = {
                    navController.navigate(Screen.PersonalInfo.route) {
                        popUpTo(Screen.SignUp.route) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                // Go back to the previous screen.
                onBack = { navController.popBackStack() },
                // Go back to the login screen.
                onLoginInstead = { navController.popBackStack() }
            )
        }

        // PERSONAL INFO (User adds their name, DOB, etc.)
        composable(Screen.PersonalInfo.route) {
            PersonalInfoRoute(
                // Once finished, go straight to the Dashboard. Clear PersonalInfo from history.
                onFinished = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.PersonalInfo.route) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }

        // DASHBOARD (The main screen of the app)
        composable(Screen.Dashboard.route) {
            DashboardRoute(
                // Open the intro page for the questionnaire.
                onOpenQuestionnaire = {
                    navController.navigate(Screen.QuestionnaireIntro.route)
                },
                // Open the Speech Assessment screen.
                onOpenSpeech = {
                    navController.navigate(Screen.SpeechTask.route)
                },
                // Open the Speech Results screen (when clicked and analysis is complete)
                onOpenSpeechResults = {
                    navController.navigate(Screen.SpeechResults.route)
                },

                // Open the Speech Assessment screen.
                onOpenMemory = {
                    navController.navigate(Screen.MemoryTest.route)
                },
                // When the user logs out, go back to the Login screen and clear ALL history.
                onLoggedOut = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }

        // QUESTIONNAIRE INTRO (Explains the questionnaire)
        composable(Screen.QuestionnaireIntro.route) {
            QuestionnaireIntroScreen(
                // Start the actual questionnaire screens.
                onStart = {
                    navController.navigate(Screen.Questionnaire.route)
                },
                onBack = { navController.popBackStack() }
            )
        }

        // QUESTIONNAIRE (The sequence of questions)
        composable(Screen.Questionnaire.route) {
            QuestionnaireRoute(
                // Once all questions are answered, go back to the Dashboard. Clear the Questionnaire from history.
                onFinishedAll = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Questionnaire.route) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                // Go back to the previous question or the intro screen.
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        // SPEECH ASSESSMENT (Audio recording and transcription)
        composable(Screen.SpeechAssessment.route) {
            SpeechAssessmentRoute(
                // Go back to Dashboard
                onBack = { navController.popBackStack() },
                // When completed, return to Dashboard
                onCompleted = {}
            )
        }

        // SPEECH TASK (NEW: Word Recall, Localization, Repeat Action)
        composable(Screen.SpeechTask.route) {
            SpeechTaskRoute(
                // Go back to Dashboard
                onBack = { navController.popBackStack() },
                // When all tasks completed, return to Dashboard
                onCompleted = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.SpeechTask.route) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }

        // SPEECH RESULTS (NEW: Show detailed results after analysis)
        composable(Screen.SpeechResults.route) {
            SpeechResultsRoute(
                // Go back to Dashboard
                onBack = { navController.popBackStack() },
                // Redo test - navigate to Speech Task
                onRedoTest = {
                    navController.navigate(Screen.SpeechTask.route) {
                        popUpTo(Screen.Dashboard.route)
                        launchSingleTop = true
                    }
                }
            )
        }

        composable(Screen.MemoryTest.route){
            MemoryTestRoute(
                onBack = { navController.popBackStack() },
                onCompleted = {
                    navController.popBackStack() }
            )
        }
    }
}