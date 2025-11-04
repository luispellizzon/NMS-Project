package com.example.nms_mobile.data

import android.net.Uri
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.io.File
import java.util.UUID

class SpeechAssessmentRepository private constructor(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val storage: FirebaseStorage = FirebaseStorage.getInstance(),
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
) {

    companion object {
        val instance: SpeechAssessmentRepository by lazy { SpeechAssessmentRepository() }
        private const val COLLECTION_SPEECH = "speech_assessments"
        private const val STORAGE_AUDIO_PATH = "speech_audio"
    }

    /**
     * Uploads audio file to Firebase Storage
     * @param audioFile Local audio file
     * @return Uploaded audio URL
     */
    suspend fun uploadAudio(audioFile: File): String {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")
        val fileName = "${UUID.randomUUID()}.m4a"
        val storageRef = storage.reference
            .child(STORAGE_AUDIO_PATH)
            .child(userId)
            .child(fileName)

        val uploadTask = storageRef.putFile(Uri.fromFile(audioFile)).await()
        return storageRef.downloadUrl.await().toString()
    }

    /**
     * Saves Speech Assessment to Firestore
     */
    suspend fun saveSpeechAssessment(assessment: SpeechAssessment) {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        val data = hashMapOf(
            "id" to assessment.id,
            "userId" to userId,
            "testType" to assessment.testType,
            "audioUrl" to assessment.audioUrl,
            "transcription" to assessment.transcription,
            "duration" to assessment.duration,
            "aiAnalysis" to assessment.aiAnalysis,
            "score" to assessment.score,
            "timestamp" to assessment.timestamp,
            "status" to assessment.status  // ← AÑADIDO
        )

        firestore.collection(COLLECTION_SPEECH)
            .document(assessment.id)
            .set(data)
            .await()
    }

    /**
     * Gets all Speech Assessments for the current user
     */
    suspend fun getUserAssessments(): List<SpeechAssessment> {
        val userId = auth.currentUser?.uid ?: throw Exception("User not authenticated")

        val snapshot = firestore.collection(COLLECTION_SPEECH)
            .whereEqualTo("userId", userId)
            .orderBy("timestamp", com.google.firebase.firestore.Query.Direction.DESCENDING)
            .get()
            .await()

        return snapshot.documents.mapNotNull { doc ->
            SpeechAssessment(
                id = doc.getString("id") ?: "",
                userId = doc.getString("userId") ?: "",
                testType = doc.getString("testType") ?: "",
                audioUrl = doc.getString("audioUrl") ?: "",
                transcription = doc.getString("transcription") ?: "",
                duration = doc.getLong("duration") ?: 0L,
                aiAnalysis = doc.getString("aiAnalysis"),
                score = doc.getDouble("score"),
                timestamp = doc.getTimestamp("timestamp") ?: com.google.firebase.Timestamp.now(),
                status = doc.getString("status") ?: "pending"  // ← AÑADIDO
            )
        }
    }

    /**
     * Gets a specific Speech Assessment by ID
     */
    suspend fun getAssessmentById(id: String): SpeechAssessment? {
        val doc = firestore.collection(COLLECTION_SPEECH)
            .document(id)
            .get()
            .await()

        if (!doc.exists()) return null

        return SpeechAssessment(
            id = doc.getString("userId") ?: "",
            userId = doc.getString("userId") ?: "",
            testType = doc.getString("testType") ?: "",
            audioUrl = doc.getString("audioUrl") ?: "",
            transcription = doc.getString("transcription") ?: "",
            duration = doc.getLong("duration") ?: 0L,
            aiAnalysis = doc.getString("aiAnalysis"),
            score = doc.getDouble("score"),
            timestamp = doc.getTimestamp("timestamp") ?: com.google.firebase.Timestamp.now(),
            status = doc.getString("status") ?: "pending"  // ← AÑADIDO
        )
    }

    /**
     * Updates transcription, AI analysis, and status
     */
    suspend fun updateTranscriptionAndAnalysis(
        id: String,
        transcription: String,
        aiAnalysis: String? = null,
        score: Double? = null,
        status: String = "transcribed"  // ← AÑADIDO
    ) {
        val updates = hashMapOf<String, Any>(
            "transcription" to transcription,
            "status" to status  // ← AÑADIDO
        )

        aiAnalysis?.let { updates["aiAnalysis"] = it }
        score?.let { updates["score"] = it }

        firestore.collection(COLLECTION_SPEECH)
            .document(id)
            .update(updates)
            .await()
    }

    /**
     * Deletes a Speech Assessment
     */
    suspend fun deleteAssessment(id: String) {
        // First get the document to have the audio URL
        val assessment = getAssessmentById(id)

        // Delete audio from Storage if it exists
        assessment?.audioUrl?.let { url ->
            try {
                val storageRef = storage.getReferenceFromUrl(url)
                storageRef.delete().await()
            } catch (e: Exception) {
                // Ignore if already deleted
            }
        }

        // Delete document from Firestore
        firestore.collection(COLLECTION_SPEECH)
            .document(id)
            .delete()
            .await()
    }
}