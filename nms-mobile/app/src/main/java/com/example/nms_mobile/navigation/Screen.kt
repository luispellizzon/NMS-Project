package com.example.nms_mobile.navigation

sealed class Screen(val route: String) {
    object Start : Screen("start")
    object Login : Screen("login")
    object SignUp : Screen("signup")
    object PersonalInfo : Screen("personal_info")
    object Home : Screen("home/{hasCompletedProfile}") {
        fun createRoute(hasCompletedProfile: Boolean) = "home/$hasCompletedProfile"
    }

    object Dashboard : Screen("dashboard")
    object QuestionnaireIntro : Screen("questionnaire_intro")
    object Questionnaire : Screen("questionnaire")

    object SpeechAssessment : Screen("speech_assessment")


}