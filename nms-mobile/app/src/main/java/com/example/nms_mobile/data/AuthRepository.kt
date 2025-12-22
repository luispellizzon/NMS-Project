package com.example.nms_mobile.data

import com.google.firebase.auth.AuthCredential
import com.google.firebase.auth.FacebookAuthProvider
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.OAuthProvider
import com.google.firebase.auth.userProfileChangeRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.tasks.await

data class UserSession(
    val uid: String? = null,
    val email: String? = null,
    val displayName: String? = null
)

class AuthRepository private constructor(
    private val firebaseAuth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val db: FirestoreRepository = FirestoreRepository.instance
) {

    // ---- Global, in-memory session ----
    // This holds the user's current status (logged in or out) in the app's memory.
    private val _session = MutableStateFlow(
        firebaseAuth.currentUser?.let { UserSession(it.uid, it.email, it.displayName) } ?: UserSession()
    )
    // This allows other parts of the app to watch the current session status.
    val session: StateFlow<UserSession> = _session

    // ---- Auth API ----
    suspend fun login(email: String, password: String) {
        // Asks Firebase to check the user's email and password.
        firebaseAuth.signInWithEmailAndPassword(email, password).await()
        firebaseAuth.currentUser?.let { u ->
            // If successful, update the session status in memory immediately.
            _session.value = UserSession(u.uid, u.email, u.displayName)
        }
    }

    /**
     * Creates only the account in Firebase Auth (no Firestore profile yet).
     */
    suspend fun signUpAuth(email: String, password: String) {
        // Creates a new user account with email and password in Firebase.
        val result = firebaseAuth.createUserWithEmailAndPassword(email, password).await()
        val user = result.user ?: firebaseAuth.currentUser ?: return

        // Update the session in memory right away.
        _session.value = UserSession(user.uid, user.email, null)
    }

    private suspend fun signInWithCredential(credential: AuthCredential): UserSession {
        val result = firebaseAuth.signInWithCredential(credential).await()
        val user = result.user ?: throw Exception("Auth failed â€” no user returned")

        val session = UserSession(user.uid, user.email, user.displayName)
        _session.value = session
        return session
    }

    // --------------------------
    // SHARED link helper
    // --------------------------
    private suspend fun linkCredential(credential: AuthCredential): UserSession {
        val user = firebaseAuth.currentUser ?: throw Exception("Cannot link â€” no authenticated user")

        val result = user.linkWithCredential(credential).await()
        val linkedUser = result.user ?: throw Exception("Link failed â€” no user returned")

        val session = UserSession(linkedUser.uid, linkedUser.email, linkedUser.displayName)
        _session.value = session
        return session
    }

    // --------------------------
    // Google
    // --------------------------
    suspend fun signInWithGoogle(idToken: String) =
        signInWithCredential(GoogleAuthProvider.getCredential(idToken, null))

    suspend fun linkGoogleCredential(idToken: String) =
        linkCredential(GoogleAuthProvider.getCredential(idToken, null))

    // --------------------------
    // Facebook
    // --------------------------
    suspend fun signInWithFacebook(accessToken: String) =
        signInWithCredential(FacebookAuthProvider.getCredential(accessToken))

    suspend fun linkFacebookCredential(accessToken: String) =
        linkCredential(FacebookAuthProvider.getCredential(accessToken))

    // --------------------------
    // Apple
    // --------------------------
    suspend fun signInWithApple(idToken: String, nonce: String) =
        signInWithCredential(
            OAuthProvider.newCredentialBuilder("apple.com")
                .setIdToken(idToken)
                .build()
        )

    suspend fun linkAppleCredential(idToken: String, nonce: String) =
        linkCredential(
            OAuthProvider.newCredentialBuilder("apple.com")
                .setIdToken(idToken)
                .build()
        )


    suspend fun updateDisplayName(name: String) {
        val user = firebaseAuth.currentUser ?: return
        // Update the name in memory first.
        _session.value = UserSession(user.uid, user.email, name.trim())
        // Save the new name to the Firebase profile.
        val updates = userProfileChangeRequest { displayName = name.trim() }
        user.updateProfile(updates).await()
        runCatching { user.reload().await() }
    }

    // Returns the current user object from Firebase, if anyone is logged in.
    fun currentUser() = firebaseAuth.currentUser

    fun logout() {
        // Tells Firebase to end the current session.
        firebaseAuth.signOut()
        // Clears the session status in app memory.
        _session.value = UserSession()
    }

    companion object {
        // Creates a single instance of this repository that all parts of the app can share.
        val instance: AuthRepository by lazy { AuthRepository() }
    }
}
