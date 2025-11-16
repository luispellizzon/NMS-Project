package com.example.nms_mobile.auth

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.tasks.await

// Simple model holding essential user info once logged in.
data class AuthUser(
    val uid: String,
    val email: String?,
    val displayName: String?
)


// The current state of the authentication process.
data class AuthState(
    val isLoading: Boolean = true, // Is the app currently checking auth status?
    val user: AuthUser? = null,    // The logged-in user data. Null if signed out.
    val displayName: String? = "User",
    val error: String? = null      // Any error message from Firebase.
)

class Auth(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
) {
    // Defines where asynchronous tasks will run (main thread, supervised).
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    // The current authentication state that we can change internally.
    private val _state = MutableStateFlow(AuthState(isLoading = true))
    // The part of the state that external parts of the app can watch.
    val state: StateFlow<AuthState> = _state

    // This listener watches Firebase for any changes in the sign-in status.
    private val listener = FirebaseAuth.AuthStateListener { fa ->
        val u = fa.currentUser
        _state.value = AuthState(
            isLoading = false,
            // Convert the Firebase user data into our simple AuthUser model.
            user = u?.let { AuthUser(it.uid, it.email, it.displayName) },
            error = null
        )
    }

    init {
        // Start watching for auth status changes right away.
        auth.addAuthStateListener(listener)
        // Check the current status when the app starts.
        listener.onAuthStateChanged(auth)
    }
}