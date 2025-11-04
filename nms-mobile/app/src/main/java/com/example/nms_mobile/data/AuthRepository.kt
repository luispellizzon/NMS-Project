package com.example.nms_mobile.data

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.userProfileChangeRequest
import com.google.firebase.firestore.FirebaseFirestore
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

    /**
     * This is the older method to create an account, which is now less used.
     * It sets up the user in both Firebase and Firestore.
     */
    suspend fun signUp(
        name: String,
        email: String,
        password: String,
        dob: String,
        role: String // "patient" | "caregiver"
    )  {
        // Create the user account in Firebase.
        val result = firebaseAuth.createUserWithEmailAndPassword(email, password).await()
        val user = result.user ?: firebaseAuth.currentUser ?: return

        // Update the session in memory first to make the UI faster.
        _session.value = UserSession(user.uid, user.email, name.trim())

        // Save the user's name to their Firebase profile.
        val updates = userProfileChangeRequest { displayName = name.trim() }
        user.updateProfile(updates).await()

        // Create the user's full profile record in Firestore.
        db.createUserProfile(
            UserProfile(
                uid = user.uid,
                fullName = name.trim(),
                dateOfBirth = dob,
                email = email,
                role = role
            )
        )
        // Refresh the user data from Firebase just to be sure.
        runCatching { user.reload().await() }
    }

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