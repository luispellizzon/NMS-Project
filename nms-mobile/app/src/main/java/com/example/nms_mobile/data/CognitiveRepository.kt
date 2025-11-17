package com.example.nms_mobile.data

import android.graphics.Bitmap
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.io.ByteArrayOutputStream
import java.util.UUID

class CognitiveRepository private constructor(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val storage: FirebaseStorage = FirebaseStorage.getInstance(),
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
) {

    companion object {
        val instance: CognitiveRepository by lazy { CognitiveRepository() }
        private const val STORAGE_COGNITIVE_PATH = "cognitive_assessments"
    }

    /**
     * Uploads a drawing image (Bitmap) to Firebase Storage
     * @return Download URL of the uploaded image
     */
    suspend fun uploadDrawingImage(bitmap: Bitmap, taskType: String): String {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")
        val fileName = "${taskType}_${UUID.randomUUID()}.png"
        val storageRef = storage.reference
            .child(STORAGE_COGNITIVE_PATH)
            .child(userId)
            .child(fileName)

        // Convert Bitmap to ByteArray
        val baos = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, baos)
        val data = baos.toByteArray()

        // Upload image
        storageRef.putBytes(data).await()

        // Get download URL
        return storageRef.downloadUrl.await().toString()
    }

    /**
     * Saves cognitive task result to user's subcollection
     * Path: users/{userId}/cognitive_assessments/{taskId}
     */
    suspend fun saveCognitiveTaskResult(result: CognitiveTaskResult) {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        val data = hashMapOf(
            "id" to result.id,
            "userId" to userId,
            "taskType" to result.taskType,
            "imageUrl" to result.imageUrl,
            "strokeCount" to result.strokeCount,
            "totalLength" to result.totalLength,
            "boundingBoxArea" to result.boundingBoxArea,
            "duration" to result.duration,
            "passed" to result.passed,
            "touchSequence" to result.touchSequence,
            "timestamp" to FieldValue.serverTimestamp()
        )

        firestore.collection("users")
            .document(userId)
            .collection("cognitive_assessments")
            .document(result.id)
            .set(data)
            .await()
    }

    /**
     * Obtiene todos los resultados del Cognitive Test del usuario
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
            totalTasks = 3,  // Cube, Trail, Clock
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
}