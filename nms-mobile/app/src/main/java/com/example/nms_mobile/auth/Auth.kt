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

data class AuthUser(
    val uid: String,
    val email: String?,
    val displayName: String?
)

data class AuthState(
    val isLoading: Boolean = true,
    val user: AuthUser? = null,
    val displayName: String? = "User",
    val error: String? = null
)

class Auth(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _state = MutableStateFlow(AuthState(isLoading = true))
    val state: StateFlow<AuthState> = _state

    private val listener = FirebaseAuth.AuthStateListener { fa ->
        val u = fa.currentUser
        _state.value = AuthState(
            isLoading = false,
            user = u?.let { AuthUser(it.uid, it.email, it.displayName) },
            error = null
        )
    }

    init {
        auth.addAuthStateListener(listener)
        listener.onAuthStateChanged(auth)
    }

    suspend fun signIn(email: String, password: String) {
        _state.update { it.copy(isLoading = true, error = null) }
        runCatching { auth.signInWithEmailAndPassword(email, password).await() }
            .onFailure { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } }
    }

    suspend fun signUp(displayName: String,email: String, password: String) {
        _state.update { it.copy(isLoading = true, error = null) }
        runCatching { auth.createUserWithEmailAndPassword(email, password).await() }
            .onFailure { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } }
    }

    suspend fun signInWithGoogleIdToken(idToken: String) {
        _state.update { it.copy(isLoading = true, error = null) }
        val cred = GoogleAuthProvider.getCredential(idToken, null)
        runCatching { auth.signInWithCredential(cred).await() }
            .onFailure { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } }
    }

    fun signOut() {
        auth.signOut()
        _state.value = AuthState(isLoading = false, user = null)
    }
}
