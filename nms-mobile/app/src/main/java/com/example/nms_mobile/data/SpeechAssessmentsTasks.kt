package com.example.nms_mobile.data

import SpeechAssessmentDocument
import SpeechTaskType
import TaskContent
import TaskResult
import android.util.Log
import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FieldValue
import kotlinx.coroutines.tasks.await

class SpeechAssessmentsTasks private constructor(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
) {

    companion object {
        val instance: SpeechAssessmentsTasks by lazy { SpeechAssessmentsTasks() }
        private const val TAG = "SpeechAssessmentTasks"
        private const val COLLECTION_USERS = "users"
        private const val SUBCOLLECTION_SPEECH = "speech_assessment"
    }

    /**
     * Gets or creates a speech assessment session for the user
     * Returns existing incomplete session or creates a new one
     */
    suspend fun getOrCreateAssessment(): SpeechAssessmentDocument {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        try {
            // Check for existing incomplete assessment
            val existing = getCurrentIncompleteAssessment(userId)
            if (existing != null) return existing

            val recent = getRecentCompletedAssessment(userId)
            if (recent != null) return recent

            // Create new assessment
            val assessmentId = firestore.collection(COLLECTION_USERS)
                .document(userId)
                .collection(SUBCOLLECTION_SPEECH)
                .document().id

            val contentMap = SpeechTaskType.values().associate { task ->
                task.taskId to TaskContent(
                    taskId = task.taskId,
                    taskName = task.displayName,
                    question = task.instruction,
                    expectedAnswers = task.expectedWords,
                    maxScore = task.maxScore,
                    result = null
                )
            }

            val newAssessment = SpeechAssessmentDocument(
                id = assessmentId,
                userId = userId,
                startedAt = Timestamp.now(),
                currentTaskId = SpeechTaskType.WORD_RECALL_INITIAL.taskId,
                isCompleted = false,
                totalScore = 0,
                content = contentMap
            )

            saveAssessment(newAssessment)
            Log.d(TAG, "Created new assessment: $assessmentId")

            return newAssessment

        } catch (e: Exception) {
            Log.e(TAG, "Error in getOrCreateAssessment", e)
            throw e
        }
    }

    /**
     * Saves or updates the entire assessment document
     */
    suspend fun saveAssessment(assessment: SpeechAssessmentDocument) {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        firestore.collection(COLLECTION_USERS)
            .document(userId)
            .collection(SUBCOLLECTION_SPEECH)
            .document(assessment.id)
            .set(assessment)
            .await()

        Log.d(TAG, "Assessment saved: ${assessment.id}")
    }

    /**
     * Updates the task result for a given assessment
     */
    suspend fun updateTaskResult(
        assessmentId: String,
        taskType: SpeechTaskType,
        taskResult: TaskResult,
        nextTaskId: String?
    ) {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        try {
            val docRef = firestore.collection(COLLECTION_USERS)
                .document(userId)
                .collection(SUBCOLLECTION_SPEECH)
                .document(assessmentId)

            val updates = mutableMapOf<String, Any>(
                "content.${taskType.taskId}.result" to taskResult,
                "totalScore" to FieldValue.increment(taskResult.userScore.toLong())
            )

            if (nextTaskId != null) {
                updates["currentTaskId"] = nextTaskId
            }

            docRef.update(updates).await()
            Log.d(TAG, "Task result updated for ${taskType.taskId}")

        } catch (e: Exception) {
            Log.e(TAG, "Error updating task result", e)
            throw e
        }
    }

    /**
     * Marks assessment as completed
     */
    suspend fun completeAssessment(assessmentId: String) {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        firestore.collection(COLLECTION_USERS)
            .document(userId)
            .collection(SUBCOLLECTION_SPEECH)
            .document(assessmentId)
            .update(
                mapOf(
                    "isCompleted" to true,
                    "completedAt" to Timestamp.now()
                )
            )
            .await()

        Log.d(TAG, "Assessment completed: $assessmentId")
    }

    /**
     * Gets current incomplete assessment if exists
     */
    private suspend fun getCurrentIncompleteAssessment(userId: String): SpeechAssessmentDocument? {
        return try {
            val snapshot = firestore.collection(COLLECTION_USERS)
                .document(userId)
                .collection(SUBCOLLECTION_SPEECH)
                .whereEqualTo("isCompleted", false)
                .orderBy("startedAt", com.google.firebase.firestore.Query.Direction.DESCENDING)
                .limit(1)
                .get()
                .await()

            snapshot.documents.firstOrNull()?.toObject(SpeechAssessmentDocument::class.java)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching incomplete assessment", e)
            null
        }
    }

    /**
     * Gets recently completed assessment
     */
    private suspend fun getRecentCompletedAssessment(userId: String): SpeechAssessmentDocument? {
        return try {
            val snapshot = firestore.collection(COLLECTION_USERS)
                .document(userId)
                .collection(SUBCOLLECTION_SPEECH)
                .whereEqualTo("isCompleted", true)
                .orderBy("startedAt", com.google.firebase.firestore.Query.Direction.DESCENDING)
                .limit(1)
                .get()
                .await()

            snapshot.documents.firstOrNull()?.toObject(SpeechAssessmentDocument::class.java)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching completed assessment", e)
            null
        }
    }

    /**
     * Gets all completed assessments
     */
    suspend fun getCompletedAssessments(): List<SpeechAssessmentDocument> {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        return try {
            val snapshot = firestore.collection(COLLECTION_USERS)
                .document(userId)
                .collection(SUBCOLLECTION_SPEECH)
                .whereEqualTo("isCompleted", true)
                .orderBy("completedAt", com.google.firebase.firestore.Query.Direction.DESCENDING)
                .get()
                .await()

            snapshot.documents.mapNotNull { it.toObject(SpeechAssessmentDocument::class.java) }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching completed assessments", e)
            emptyList()
        }
    }
}
