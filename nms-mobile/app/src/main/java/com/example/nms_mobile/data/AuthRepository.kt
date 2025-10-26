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
    private val _session = MutableStateFlow(
        firebaseAuth.currentUser?.let { UserSession(it.uid, it.email, it.displayName) } ?: UserSession()
    )
    val session: StateFlow<UserSession> = _session

    // ---- Auth API ----
    suspend fun login(email: String, password: String) {
        firebaseAuth.signInWithEmailAndPassword(email, password).await()
        firebaseAuth.currentUser?.let { u ->
            _session.value = UserSession(u.uid, u.email, u.displayName)   // push immediately
        }
    }

    /**
     * Creates the user and sets displayName.
     * Also pushes the provided 'name' into the in-memory session immediately
     * so the UI can show it without waiting for Firebase to reflect it.
     */
    suspend fun signUp(
        name: String,
        email: String,
        password: String,
        dob: String,
        role: String // "patient" | "caregiver"
    )  {
        val result = firebaseAuth.createUserWithEmailAndPassword(email, password).await()
        val user = result.user ?: firebaseAuth.currentUser ?: return

        // Update in-memory session first (instant UI)
        _session.value = UserSession(user.uid, user.email, name.trim())

        // Persist displayName to Firebase profile (fire-and-forget from UI perspective)
        val updates = userProfileChangeRequest { displayName = name.trim() }
        user.updateProfile(updates).await()

        // Create Firestore profile
        db.createUserProfile(
            UserProfile(
                uid = user.uid,
                fullName = name.trim(),
                dateOfBirth = dob,
                email = email,
                role = role
            )
        )
        // Optional: ensure future reads from Firebase match the in-memory session
        runCatching { user.reload().await() }
    }

    suspend fun updateDisplayName(name: String) {
        val user = firebaseAuth.currentUser ?: return
        _session.value = UserSession(user.uid, user.email, name.trim())   // update memory first
        val updates = userProfileChangeRequest { displayName = name.trim() }
        user.updateProfile(updates).await()
        runCatching { user.reload().await() }
    }

    fun currentUser() = firebaseAuth.currentUser

    fun logout() {
        firebaseAuth.signOut()
        _session.value = UserSession() // clear global session
    }

    companion object {
        // Simple singleton so every VM shares the SAME session flow
        val instance: AuthRepository by lazy { AuthRepository() }
    }
}
