package com.example.nms_mobile.data

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import java.util.UUID

class MemoryTestRepository private constructor(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val userdb: FirestoreRepository = FirestoreRepository.instance
) {

    companion object {
        val instance: MemoryTestRepository by lazy { MemoryTestRepository() }
        private const val COLLECTION_USERS = "users"
        private const val SUBCOLLECTION_MEMORY_TESTS = "memory_assessment"
    }

    /**
     * Saves Memory Test to Firestore (only final score)
     * Saved under: users/{userId}/memory_tests/{testId}
     */
    suspend fun saveMemoryTest(test: MemoryTest) {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        val data = hashMapOf(
            "id" to test.id,
            "userId" to userId,
            "testType" to test.testType,
            "totalScore" to test.totalScore,
            "totalQuestions" to test.totalQuestions,
            "completionTime" to test.completionTime,
            "startedAi" to test.startedAt,
            "status" to test.status
        )

        firestore.collection(COLLECTION_USERS)
            .document(userId)
            .collection(SUBCOLLECTION_MEMORY_TESTS)
            .document(test.id)
            .set(data)
            .await()

        userdb.updateTask("hasCompletedMemoryAssessment", UserTasks.COGNITIVE_ASSESSMENT.taskName)
    }

    /**
     * Gets all Memory Tests for the current user
     */
    suspend fun getUserMemoryTests(): List<MemoryTest> {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        val snapshot = firestore.collection(COLLECTION_USERS)
            .document(userId)
            .collection(SUBCOLLECTION_MEMORY_TESTS)
            .orderBy("timestamp", com.google.firebase.firestore.Query.Direction.DESCENDING)
            .get()
            .await()

        return snapshot.documents.mapNotNull { doc ->
            MemoryTest(
                id = doc.getString("id") ?: "",
                userId = doc.getString("userId") ?: "",
                testType = doc.getString("testType") ?: "",
                totalScore = doc.getLong("totalScore")?.toInt() ?: 0,
                totalQuestions = doc.getLong("totalQuestions")?.toInt() ?: 7,
                completionTime = doc.getLong("completionTime") ?: 0L,
                startedAt = doc.getTimestamp("startedAt") ?: com.google.firebase.Timestamp.now(),
                status = doc.getString("status") ?: "completed"
            )
        }
    }

    /**
     * Gets a specific Memory Test by ID
     */
    suspend fun getMemoryTestById(id: String): MemoryTest? {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        val doc = firestore.collection(COLLECTION_USERS)
            .document(userId)
            .collection(SUBCOLLECTION_MEMORY_TESTS)
            .document(id)
            .get()
            .await()

        if (!doc.exists()) return null

        return MemoryTest(
            id = doc.getString("id") ?: "",
            userId = doc.getString("userId") ?: "",
            testType = doc.getString("testType") ?: "",
            totalScore = doc.getLong("totalScore")?.toInt() ?: 0,
            totalQuestions = doc.getLong("totalQuestions")?.toInt() ?: 7,
            completionTime = doc.getLong("completionTime") ?: 0L,
            startedAt = doc.getTimestamp("startedAt") ?: com.google.firebase.Timestamp.now(),
            status = doc.getString("status") ?: "completed"
        )
    }

    /**
     * Deletes a Memory Test
     */
    suspend fun deleteMemoryTest(id: String) {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        firestore.collection(COLLECTION_USERS)
            .document(userId)
            .collection(SUBCOLLECTION_MEMORY_TESTS)
            .document(id)
            .delete()
            .await()
    }

    /**
     * Generates a new test ID
     */
    fun generateTestId(): String = UUID.randomUUID().toString()
}