package com.example.nms_mobile.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.nms_mobile.navigation.routes.AddPatientRoute
import com.example.nms_mobile.navigation.routes.CognitiveResultsRoute
import com.example.nms_mobile.navigation.routes.CognitiveTestRoute
import com.example.nms_mobile.navigation.routes.DashboardRoute
import com.example.nms_mobile.navigation.routes.LoginRoute
import com.example.nms_mobile.navigation.routes.MemoryTestRoute
import com.example.nms_mobile.navigation.routes.NewsRoute
import com.example.nms_mobile.navigation.routes.PersonalInfoRoute
import com.example.nms_mobile.navigation.routes.QuestionnaireRoute
import com.example.nms_mobile.navigation.routes.ResultsRoute
import com.example.nms_mobile.navigation.routes.SignUpRoute
import com.example.nms_mobile.navigation.routes.SpeechAssessmentRoute
import com.example.nms_mobile.navigation.routes.SpeechResultsRoute
import com.example.nms_mobile.navigation.routes.SpeechTaskRoute
import com.example.nms_mobile.navigation.routes.StartRoute
import com.example.nms_mobile.ui.feature.cognitive.CognitiveIntroScreen
import com.example.nms_mobile.ui.feature.contact_doctor.ContactDoctorRoute
import com.example.nms_mobile.ui.questionnaire.QuestionnaireIntroScreen
import com.example.nms_mobile.ui.feature.feedback.FeedbackScreen

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
                onNavigateAfterLogin = { _ ->
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
                // Open the Speech Task screen.
                onOpenSpeech = {
                    navController.navigate(Screen.SpeechTask.route)
                },
                onOpenImageDescription = {
                    navController.navigate(Screen.SpeechAssessment.route)
                },
                // Open the Speech Results screen (when clicked and analysis is complete)
                onOpenSpeechResults = {
                    navController.navigate(Screen.SpeechResults.route)
                },
                // Open the Memory Test screen.
                onOpenMemory = {
                    navController.navigate(Screen.MemoryTest.route)
                },
                // Open the Cognitive Test Intro screen.
                onOpenCognitive = {
                    navController.navigate(Screen.CognitiveIntro.route)
                }, onOpenNews = {
                    navController.navigate(Screen.News.route)
                },
                // When the user logs out, go back to the Login screen and clear ALL history.
                onLoggedOut = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                onOpenFeedback = {
                    navController.navigate(Screen.Feedback.route)
                },
                onOpenAddPatient = {
                    navController.navigate(Screen.AddPatient.route)
                },
                onOpenResults = {
                    navController.navigate(Screen.Results.route)
                }
            )
        }

        // FEEDBACK
        composable(Screen.Feedback.route) {
            FeedbackScreen(
                onBackClick = { navController.popBackStack() }
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

        // SPEECH ASSESSMENT (Audio recording and transcription - OLD)
        composable(Screen.SpeechAssessment.route) {
            SpeechAssessmentRoute(
                // Go back to Dashboard
                onBack = { navController.popBackStack() },
                // When completed, return to Dashboard
                onCompleted = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.SpeechAssessment.route) { inclusive = true }
                        launchSingleTop = true
                    }
                }
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

        // MEMORY TEST
        composable(Screen.MemoryTest.route) {
            MemoryTestRoute(
                onBack = { navController.popBackStack() },
                onCompleted = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.MemoryTest.route) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }

        // COGNITIVE TEST INTRO (Instructions for cognitive assessment)
        composable(Screen.CognitiveIntro.route) {
            CognitiveIntroScreen(
                onStart = {
                    navController.navigate(Screen.CognitiveTest.route)
                },
                onBack = { navController.popBackStack() }
            )
        }

        // COGNITIVE TEST (The actual cognitive tasks)
        composable(Screen.CognitiveTest.route) {
            CognitiveTestRoute(
                onCompleted = {
                    // Navigate to results screen after completion
                    navController.navigate(Screen.CognitiveResults.route) {
                        popUpTo(Screen.CognitiveTest.route) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        // COGNITIVE RESULTS (Show detailed results after test completion)
        composable(Screen.CognitiveResults.route) {
            CognitiveResultsRoute(
                // Go back to Dashboard
                onViewResults = {
                    navController.navigate(Screen.Results.route) {
                        popUpTo(Screen.CognitiveResults.route) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                onBack = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.CognitiveResults.route) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                // Redo test - navigate back to Cognitive Intro
                onRedoTest = {
                    navController.navigate(Screen.CognitiveIntro.route) {
                        popUpTo(Screen.CognitiveResults.route) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }
        composable("news") {
            NewsRoute(
                onBack = { navController.popBackStack() }
            )
        }

        // ADD PATIENT (Caregiver creates a new patient profile)
        composable(Screen.AddPatient.route) {
            AddPatientRoute(
                onBack = { navController.popBackStack() },
                onPatientCreated = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.AddPatient.route) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }

        // Results page (Caregiver creates a new patient profile)
        composable(Screen.Results.route) {
            ResultsRoute(
                onBack = { navController.popBackStack() },
                onContactDoctor = {
                    navController.navigate(Screen.ContactDoctor.route)
                }
            )
        }
        composable(Screen.ContactDoctor.route) {
            ContactDoctorRoute(
                onBack = { navController.popBackStack() }
            )
        }
    }
}