package com.example.nms_mobile.ui.feature.contact_doctor

import androidx.compose.runtime.*
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.repeatOnLifecycle
import com.example.nms_mobile.ui.feature.contact_doctor.ContactDoctorScreen
import com.example.nms_mobile.ui.feature.contact_doctor.ContactDoctorViewModel


/**
 * ContactDoctorRoute - Handles navigation and ViewModel connection for Contact Doctor screen
 *
 * This composable:
 * - Creates and manages the ViewModel lifecycle
 * - Observes UI state and events
 * - Handles navigation callbacks
 *
 * @param onBack Callback to navigate back to previous screen
 */
@Composable
fun ContactDoctorRoute(
    onBack: () -> Unit
) {
    // Create and remember the ViewModel
    val viewModel = remember { ContactDoctorViewModel() }

    // Collect the UI state from the ViewModel
    val state by viewModel.uiState.collectAsState()

    // Get the lifecycle owner to observe events
    val lifecycleOwner = LocalLifecycleOwner.current

    // Handle one-time events from the ViewModel
    LaunchedEffect(viewModel) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            viewModel.events.collect { event ->
                when (event) {
                    is ContactDoctorEvent.MessageSent -> {
                        // Message sent successfully
                        // Could show a Toast here if needed
                        // The success message is already shown in the UI
                    }
                    is ContactDoctorEvent.Error -> {
                        // Error occurred
                        // Error message is already shown in the UI
                    }
                    null -> {
                        // No event
                    }
                }
            }
        }
    }

    // Display the Contact Doctor screen with the current state
    ContactDoctorScreen(
        state = state,
        onDoctorSelected = viewModel::onDoctorSelected,
        onMessageChange = viewModel::onMessageChange,
        onSendTestResultsChange = viewModel::onSendTestResultsChange,
        onSendClick = viewModel::sendMessage,
        onBack = onBack
    )
}