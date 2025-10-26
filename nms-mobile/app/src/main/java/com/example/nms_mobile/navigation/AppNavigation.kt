package com.example.nms_mobile.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.nms_mobile.auth.LocalAuth
import androidx.compose.runtime.collectAsState
import com.example.nms_mobile.ui.questionnaire.QuestionnaireIntroScreen

// AppNavigation.kt
@Composable
fun AppNavigation(
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Start.route
    ) {
        // START GATE
        composable(Screen.Start.route) {
            StartRoute(
                onGoLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Start.route) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                onGoPersonalInfo = {
                    navController.navigate(Screen.PersonalInfo.route) {
                        popUpTo(Screen.Start.route) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                onGoDashboard = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Start.route) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }

        // LOGIN
        composable(Screen.Login.route) {
            LoginRoute(
                onNavigateAfterLogin = { _hasProfileIgnored ->
                    // after login, re-run the gate so we get the real Firestore result
                    navController.navigate(Screen.Start.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                onNavigateToSignUp = { navController.navigate(Screen.SignUp.route) }
            )
        }

        // SIGN UP
        composable(Screen.SignUp.route) {
            SignUpRoute(
                onNavigateToDashboard = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.SignUp.route) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                onBack = { navController.popBackStack() },
                onLoginInstead = { navController.popBackStack() }
            )
        }

        // PERSONAL INFO → after submit go Dashboard
        composable(Screen.PersonalInfo.route) {
            PersonalInfoRoute(
                onFinished = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.PersonalInfo.route) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }

        // DASHBOARD
        composable(Screen.Dashboard.route) {
            DashboardRoute(
                onOpenQuestionnaire = { navController.navigate(Screen.QuestionnaireIntro.route) },
                onLoggedOut = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Home.route.substringBefore("/{")) { inclusive = true }
                        launchSingleTop = true
                    }
                },
            )
        }

        // OPTIONAL intro
        composable(Screen.QuestionnaireIntro.route) {
            QuestionnaireIntroScreen(onStart = { navController.navigate(Screen.Questionnaire.route) })
        }

        // COMBINED QUESTIONNAIRE
        composable(Screen.Questionnaire.route) {
            QuestionnaireRoute(
                onFinishedAll = {
                    // After saving questionnaire, you likely want Dashboard
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Questionnaire.route) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                onBack ={
                    navController.navigate(Screen.Dashboard.route)
                }
            )
        }

        // Home (if you’re keeping it)
        composable(
            route = Screen.Home.route,
            arguments = listOf(navArgument("hasCompletedProfile") { type = NavType.BoolType })
        ) { backStackEntry ->
            val profileCompleted = backStackEntry.arguments?.getBoolean("hasCompletedProfile") ?: false
            HomeRoute(
                hasCompletedProfile = profileCompleted,
                onLoggedOut = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Home.route.substringBefore("/{")) { inclusive = true }
                        launchSingleTop = true
                    }
                },
                onCompleteProfile = { navController.navigate(Screen.PersonalInfo.route) }
            )
        }
    }
}

/* ---------- Helpers ---------- */

private fun NavHostController.navigateAndClearToHome(hasProfile: Boolean) {
    navigate(Screen.Home.createRoute(hasProfile)) {
        // Clear entire back stack so user can't go "back" to auth flow
        popUpTo(graph.startDestinationId) { inclusive = true }
        launchSingleTop = true
    }
}


