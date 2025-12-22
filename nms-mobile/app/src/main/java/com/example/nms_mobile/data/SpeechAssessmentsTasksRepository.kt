package com.example.nms_mobile.data

import SpeechAssessmentDocument
import SpeechTaskType
import TaskContent
import TaskResult
import android.util.Log
import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.delay

class SpeechAssessmentsTasksRepository private constructor(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val userdb: FirestoreRepository = FirestoreRepository.instance
) {

    companion object {
        val instance: SpeechAssessmentsTasksRepository by lazy { SpeechAssessmentsTasksRepository() }
        private const val TAG = "SpeechAssessmentTasks"
        private const val COLLECTION_USERS = "users"
        private const val SUBCOLLECTION_SPEECH = "speech_assessment"
        private const val POLL_INTERVAL_MS = 30000L // 30 seconds
    }

    /**
     * Gets or creates a speech assessment session for the user
     * Returns existing incomplete session or creates a new one
     */
    suspend fun getOrCreateAssessment(): SpeechAssessmentDocument {
        val userId = PatientSessionManager.getActiveUserId()

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
                content = contentMap,
                aiAnalysis = null  // Initially null
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
        val userId = PatientSessionManager.getActiveUserId()

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
        val userId = PatientSessionManager.getActiveUserId()

        try {
            val docRef = firestore.collection(COLLECTION_USERS)
                .document(userId)
                .collection(SUBCOLLECTION_SPEECH)
                .document(assessmentId)

            val updates = mutableMapOf<String, Any>(
                "content.${taskType.taskId}.result" to taskResult
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
     * Marks assessment as completed and sets aiAnalysis to "processing"
     */
    suspend fun completeAssessment(assessmentId: String) {
        val userId = PatientSessionManager.getActiveUserId()

        firestore.collection(COLLECTION_USERS)
            .document(userId)
            .collection(SUBCOLLECTION_SPEECH)
            .document(assessmentId)
            .update(
                mapOf(
                    "isCompleted" to true,
                    "completedAt" to Timestamp.now(),
                    "aiAnalysis" to "processing"  // Set to processing when completed
                )
            )
            .await()

        userdb.updateTask("hasCompletedSpeechAssessment", UserTasks.MEMORY_ASSESSMENT.taskName)

        Log.d(TAG, "Assessment marked as completed: $assessmentId")

        Log.d(TAG, "Assessment completed: $assessmentId, AI analysis status: processing")
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
        val userId = PatientSessionManager.getActiveUserId()

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

    /**
     * Gets the most recent completed assessment (to check analysis status)
     */
    suspend fun getMostRecentCompletedAssessment(): SpeechAssessmentDocument? {
        val userId = PatientSessionManager.getActiveUserId()

        return try {
            val snapshot = firestore.collection(COLLECTION_USERS)
                .document(userId)
                .collection(SUBCOLLECTION_SPEECH)
                .whereEqualTo("isCompleted", true)
                .orderBy("completedAt", com.google.firebase.firestore.Query.Direction.DESCENDING)
                .limit(1)
                .get()
                .await()

            snapshot.documents.firstOrNull()?.toObject(SpeechAssessmentDocument::class.java)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching most recent completed assessment", e)
            null
        }
    }

    /**
     * Checks if the AI analysis is complete for a given assessment
     */
    suspend fun checkAnalysisStatus(assessmentId: String): String? {
        val userId = PatientSessionManager.getActiveUserId()

        return try {
            val snapshot = firestore.collection(COLLECTION_USERS)
                .document(userId)
                .collection(SUBCOLLECTION_SPEECH)
                .document(assessmentId)
                .get()
                .await()

            val assessment = snapshot.toObject(SpeechAssessmentDocument::class.java)
            assessment?.aiAnalysis
        } catch (e: Exception) {
            Log.e(TAG, "Error checking analysis status", e)
            null
        }
    }

    /**
     * Polls for analysis completion every 30 seconds
     * Returns a Flow that emits the current aiAnalysis status
     */
    fun pollForAnalysisCompletion(assessmentId: String): Flow<String?> = flow {
        val userId = PatientSessionManager.getActiveUserId()

        while (true) {
            try {
                val status = checkAnalysisStatus(assessmentId)
                emit(status)

                // Stop polling if analysis is completed or if there's an error
                if (status == "processed" || status == "error") {
                    Log.d(TAG, "Analysis polling stopped. Status: $status")
                    break
                }

                delay(POLL_INTERVAL_MS)
            } catch (e: Exception) {
                Log.e(TAG, "Error during polling", e)
                emit(null)
                break
            }
        }
    }

    /**
     * Creates a real-time listener for analysis status changes
     * More efficient than polling if you want immediate updates
     */
    fun observeAnalysisStatus(
        assessmentId: String,
        onStatusChange: (String?) -> Unit
    ): ListenerRegistration? {
        val userId = try {
            PatientSessionManager.getActiveUserId()
        } catch (e: Exception) {
            return null
        }

        return try {
            firestore.collection(COLLECTION_USERS)
                .document(userId)
                .collection(SUBCOLLECTION_SPEECH)
                .document(assessmentId)
                .addSnapshotListener { snapshot, error ->
                    if (error != null) {
                        Log.e(TAG, "Error listening to analysis status", error)
                        onStatusChange(null)
                        return@addSnapshotListener
                    }

                    if (snapshot != null && snapshot.exists()) {
                        val assessment = snapshot.toObject(SpeechAssessmentDocument::class.java)
                        val status = assessment?.aiAnalysis
                        Log.d(TAG, "Analysis status changed: $status")
                        onStatusChange(status)
                    }
                }
        } catch (e: Exception) {
            Log.e(TAG, "Error setting up listener", e)
            null
        }
    }
}