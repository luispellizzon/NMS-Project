package com.example.nms_mobile.navigation

/**
 * Defines all navigation routes in the app
 */
sealed class Screen(val route: String) {
    data object Start : Screen("start")
    data object Login : Screen("login")
    data object SignUp : Screen("signup")
    data object PersonalInfo : Screen("personal_info")
    data object Dashboard : Screen("dashboard")
    data object QuestionnaireIntro : Screen("questionnaire_intro")
    data object Questionnaire : Screen("questionnaire")
    data object SpeechAssessment : Screen("speech_assessment")
    data object SpeechTask : Screen("speech_task")
    data object SpeechResults : Screen("speech_results")
    data object MemoryTest : Screen("memory_test")
    object CognitiveIntro : Screen("cognitive_intro")
    object CognitiveTest : Screen("cognitive_test")

    object CognitiveResults : Screen("cognitive_results")
    object Feedback : Screen("feedback")

    object News : Screen("news")
    object AddPatient : Screen("add_patient")

    object Results : Screen("results")
    object ContactDoctor : Screen("contact_doctor")

}