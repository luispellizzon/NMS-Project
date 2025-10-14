package com.example.nmsmobapp.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object SignUp : Screen("signup")
    object PersonalInfo : Screen("personal_info")
    object Home : Screen("home/{hasCompletedProfile}") {
        fun createRoute(hasCompletedProfile: Boolean) = "home/$hasCompletedProfile"
    }
}