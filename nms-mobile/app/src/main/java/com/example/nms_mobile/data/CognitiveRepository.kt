package com.example.nms_mobile.data

import android.graphics.Bitmap
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.io.ByteArrayOutputStream

class CognitiveRepository private constructor(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val storage: FirebaseStorage = FirebaseStorage.getInstance()
) {

    companion object {
        @Volatile
        private var INSTANCE: CognitiveRepository? = null

        val instance: CognitiveRepository
            get() = INSTANCE ?: synchronized(this) {
                INSTANCE ?: CognitiveRepository().also { INSTANCE = it }
            }
    }

    /**
     * Uploads a drawing image to Firebase Storage
     */
    suspend fun uploadDrawingImage(bitmap: Bitmap, taskType: String): String {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")
        val timestamp = System.currentTimeMillis()
        val filename = "${taskType}_${timestamp}.jpg"

        val storageRef = storage.reference
            .child("cognitive_drawings")
            .child(userId)
            .child(filename)

        // Compress bitmap
        val baos = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 80, baos)
        val data = baos.toByteArray()

        // Upload
        storageRef.putBytes(data).await()

        // Get download URL
        return storageRef.downloadUrl.await().toString()
    }

    /**
     * Creates a new Cognitive Assessment (parent document)
     */
    suspend fun createCognitiveAssessment(assessmentId: String) {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        val assessment = CognitiveAssessment(
            id = assessmentId,
            userId = userId,
            totalScore = 0,
            state = "in_progress",
            date = com.google.firebase.Timestamp.now(),
            startedAt = com.google.firebase.Timestamp.now(),
            completedAt = null
        )

        firestore.collection("users")
            .document(userId)
            .collection("cognitive_assessments")
            .document(assessmentId)
            .set(assessment)
            .await()
    }

    /**
     * Saves a task result as subcollection under the assessment
     */
    suspend fun saveCognitiveTaskResultToAssessment(
        assessmentId: String,
        taskResult: CognitiveTaskResult
    ) {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        // Save task to subcollection
        firestore.collection("users")
            .document(userId)
            .collection("cognitive_assessments")
            .document(assessmentId)
            .collection("tasks")
            .document(taskResult.id)
            .set(taskResult.copy(userId = userId))
            .await()
    }

    /**
     * Updates the assessment with total score and completion status
     */
    suspend fun updateAssessmentScore(assessmentId: String) {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        // Get all tasks for this assessment
        val tasksSnapshot = firestore.collection("users")
            .document(userId)
            .collection("cognitive_assessments")
            .document(assessmentId)
            .collection("tasks")
            .get()
            .await()

        val totalScore = tasksSnapshot.documents.sumOf {
            it.getLong("score")?.toInt() ?: 0
        }
        val allTasksCount = tasksSnapshot.size()

        // Update parent document
        firestore.collection("users")
            .document(userId)
            .collection("cognitive_assessments")
            .document(assessmentId)
            .update(
                mapOf(
                    "totalScore" to totalScore,
                    "state" to if (allTasksCount >= 6) "completed" else "in_progress",
                    "completedAt" to if (allTasksCount >= 6) com.google.firebase.Timestamp.now() else null
                )
            )
            .await()
    }

    /**
     * Saves a cognitive task result (LEGACY - for backward compatibility)
     * Use saveCognitiveTaskResultToAssessment instead
     */
    @Deprecated("Use saveCognitiveTaskResultToAssessment instead")
    suspend fun saveCognitiveTaskResult(result: CognitiveTaskResult) {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        firestore.collection("users")
            .document(userId)
            .collection("cognitive_assessments")
            .document(result.id)
            .set(result.copy(userId = userId))
            .await()
    }

    /**
     * Gets all cognitive task results for the user
     */
    suspend fun getCognitiveTaskResults(): List<CognitiveTaskResult> {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        val snapshot = firestore.collection("users")
            .document(userId)
            .collection("cognitive_assessments")
            .orderBy("timestamp", com.google.firebase.firestore.Query.Direction.DESCENDING)
            .get()
            .await()

        return snapshot.documents.mapNotNull { doc ->
            CognitiveTaskResult(
                id = doc.getString("id") ?: "",
                userId = doc.getString("userId") ?: "",
                taskType = doc.getString("taskType") ?: "",
                imageUrl = doc.getString("imageUrl") ?: "",
                strokeCount = doc.getLong("strokeCount")?.toInt() ?: 0,
                totalLength = doc.getDouble("totalLength")?.toFloat() ?: 0f,
                boundingBoxArea = doc.getDouble("boundingBoxArea")?.toFloat() ?: 0f,
                duration = doc.getLong("duration") ?: 0L,
                passed = doc.getBoolean("passed") ?: false,
                score = doc.getLong("score")?.toInt() ?: 0,
                touchSequence = doc.get("touchSequence") as? List<String>,
                timestamp = doc.getTimestamp("timestamp") ?: com.google.firebase.Timestamp.now()
            )
        }
    }

    /**
     * Gets all cognitive assessments for the user
     */
    suspend fun getCognitiveAssessments(): List<CognitiveAssessment> {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        val snapshot = firestore.collection("users")
            .document(userId)
            .collection("cognitive_assessments")
            .orderBy("date", com.google.firebase.firestore.Query.Direction.DESCENDING)
            .get()
            .await()

        return snapshot.documents.mapNotNull { doc ->
            CognitiveAssessment(
                id = doc.getString("id") ?: "",
                userId = doc.getString("userId") ?: "",
                totalScore = doc.getLong("totalScore")?.toInt() ?: 0,
                state = doc.getString("state") ?: "in_progress",
                date = doc.getTimestamp("date") ?: com.google.firebase.Timestamp.now(),
                startedAt = doc.getTimestamp("startedAt") ?: com.google.firebase.Timestamp.now(),
                completedAt = doc.getTimestamp("completedAt")
            )
        }
    }

    /**
     * Gets tasks for a specific assessment
     */
    suspend fun getAssessmentTasks(assessmentId: String): List<CognitiveTaskResult> {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        val snapshot = firestore.collection("users")
            .document(userId)
            .collection("cognitive_assessments")
            .document(assessmentId)
            .collection("tasks")
            .get()
            .await()

        return snapshot.documents.mapNotNull { doc ->
            CognitiveTaskResult(
                id = doc.getString("id") ?: "",
                userId = doc.getString("userId") ?: "",
                taskType = doc.getString("taskType") ?: "",
                imageUrl = doc.getString("imageUrl") ?: "",
                strokeCount = doc.getLong("strokeCount")?.toInt() ?: 0,
                totalLength = doc.getDouble("totalLength")?.toFloat() ?: 0f,
                boundingBoxArea = doc.getDouble("boundingBoxArea")?.toFloat() ?: 0f,
                duration = doc.getLong("duration") ?: 0L,
                passed = doc.getBoolean("passed") ?: false,
                score = doc.getLong("score")?.toInt() ?: 0,
                touchSequence = doc.get("touchSequence") as? List<String>,
                timestamp = doc.getTimestamp("timestamp") ?: com.google.firebase.Timestamp.now()
            )
        }
    }

    /**
     * Checks if user has completed at least one Cognitive Test task
     */
    suspend fun hasCognitiveTestResults(): Boolean {
        val userId = auth.currentUser?.uid ?: return false

        return try {
            val snapshot = firestore.collection("users")
                .document(userId)
                .collection("cognitive_assessments")
                .limit(1)
                .get()
                .await()

            !snapshot.isEmpty
        } catch (e: Exception) {
            println("Error checking cognitive test status: $e")
            false
        }
    }

    /**
     * Gets cognitive assessment summary
     */
    suspend fun getCognitiveAssessmentSummary(): CognitiveAssessmentSummary {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")
        val tasks = getCognitiveTaskResults()

        return CognitiveAssessmentSummary(
            userId = userId,
            totalTasks = 6,  // Cube, Trail, Clock, 3 Animal Questions
            tasksCompleted = tasks.size,
            tasksPassed = tasks.count { it.passed },
            tasks = tasks
        )
    }

    /**
     * Deletes a specific task result
     */
    suspend fun deleteCognitiveTaskResult(taskId: String) {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        // First get the result to have the image URL
        val doc = firestore.collection("users")
            .document(userId)
            .collection("cognitive_assessments")
            .document(taskId)
            .get()
            .await()

        // Delete image from Storage if it exists
        doc.getString("imageUrl")?.let { url ->
            try {
                val storageRef = storage.getReferenceFromUrl(url)
                storageRef.delete().await()
            } catch (e: Exception) {
                // Ignore if already deleted
            }
        }

        // Delete document from Firestore
        firestore.collection("users")
            .document(userId)
            .collection("cognitive_assessments")
            .document(taskId)
            .delete()
            .await()
    }

    /**
     * Gets the total cognitive score (0-6 points)
     * Each task passed = 1 point
     */
    suspend fun getTotalCognitiveScore(): Int {
        val summary = getCognitiveAssessmentSummary()
        return summary.tasksPassed  // Returns 0-6
    }

    /**
     * Gets the most recent completed assessment
     */
    suspend fun getMostRecentAssessment(): CognitiveAssessment? {
        val assessments = getCognitiveAssessments()
        return assessments.firstOrNull { it.state == "completed" }
    }
}