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

    suspend fun signIn(email: String, password: String) {
        // Start loading and clear any old errors.
        _state.update { it.copy(isLoading = true, error = null) }
        // Try to sign in with email/password.
        runCatching { auth.signInWithEmailAndPassword(email, password).await() }
            // If it fails, stop loading and save the error message.
            .onFailure { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } }
    }

    suspend fun signUp(displayName: String,email: String, password: String) {
        // Start loading and clear any old errors.
        _state.update { it.copy(isLoading = true, error = null) }
        // Try to create a new user account.
        runCatching { auth.createUserWithEmailAndPassword(email, password).await() }
            // If it fails, stop loading and save the error message.
            .onFailure { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } }
    }

    suspend fun signInWithGoogleIdToken(idToken: String) {
        // Start loading and clear any old errors.
        _state.update { it.copy(isLoading = true, error = null) }
        // Create the necessary credentials from the Google token.
        val cred = GoogleAuthProvider.getCredential(idToken, null)
        // Try to sign in using the Google credentials.
        runCatching { auth.signInWithCredential(cred).await() }
            // If it fails, stop loading and save the error message.
            .onFailure { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } }
    }

    fun signOut() {
        // Tell Firebase to sign the user out.
        auth.signOut()
        // Immediately update the app's state to signed out.
        _state.value = AuthState(isLoading = false, user = null)
    }
}