package com.example.nmsmobapp.navigation

import android.widget.Toast
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.nmsmobapp.ui.screens.*

@Composable
fun AppNavigation(
    navController: NavHostController = rememberNavController()
) {
    val context = LocalContext.current
    var isLoggedIn by remember { mutableStateOf(false) }
    var hasCompletedProfile by remember { mutableStateOf(false) }

    NavHost(
        navController = navController,
        startDestination = Screen.Login.route
    ) {
        // Login Screen
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginClick = { email, password ->
                    // TODO: Validate credentials with backend
                    isLoggedIn = true
                    val userHasProfile = false

                    if (userHasProfile) {
                        navController.navigate(Screen.Home.createRoute(true)) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    } else {
                        navController.navigate(Screen.Home.createRoute(false)) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    }
                },
                onSignUpClick = {
                    navController.navigate(Screen.SignUp.route)
                },
                onForgotPasswordClick = {
                    Toast.makeText(context, "Forgot Password clicked", Toast.LENGTH_SHORT).show()
                },
                onBackClick = {
                    // Handle back or exit
                },
                // Social Login Callbacks
                onGoogleSignIn = {
                    // TODO: Implement Google Sign-In when ready
                    Toast.makeText(context, "Google Sign-In - Coming Soon!", Toast.LENGTH_LONG).show()
                },
                onAppleSignIn = {
                    // TODO: Implement Apple Sign-In when ready
                    Toast.makeText(context, "Apple Sign-In - Coming Soon!", Toast.LENGTH_LONG).show()
                },
                onFacebookSignIn = {
                    // TODO: Implement Facebook Sign-In when ready
                    Toast.makeText(context, "Facebook Sign-In - Coming Soon!", Toast.LENGTH_LONG).show()
                }
            )
        }

        // Sign Up Screen
        composable(Screen.SignUp.route) {
            SignUpScreen(
                onSignUpClick = { email, password ->
                    navController.navigate(Screen.PersonalInfo.route) {
                        popUpTo(Screen.SignUp.route) { inclusive = true }
                    }
                },
                onLoginClick = {
                    navController.popBackStack()
                },
                onBackClick = {
                    navController.popBackStack()
                }
            )
        }

        // Personal Info Screen
        composable(Screen.PersonalInfo.route) {
            PersonalInfoScreen(
                onSubmit = { firstName, lastName, dob, sex, education ->
                    hasCompletedProfile = true
                    navController.navigate(Screen.Home.createRoute(true)) {
                        popUpTo(Screen.PersonalInfo.route) { inclusive = true }
                    }
                }
            )
        }

        // Home Screen
        composable(
            route = Screen.Home.route,
            arguments = listOf(
                navArgument("hasCompletedProfile") {
                    type = NavType.BoolType
                }
            )
        ) { backStackEntry ->
            val profileCompleted = backStackEntry.arguments?.getBoolean("hasCompletedProfile") ?: false

            HomeScreen(
                hasCompletedProfile = profileCompleted,
                onCompleteProfileClick = {
                    navController.navigate(Screen.PersonalInfo.route)
                }
            )
        }
    }
}