package com.example.nms_mobile.data

import android.net.Uri
import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.io.File

class StorageRepository private constructor(
    private val firebaseAuth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val storage: FirebaseStorage = FirebaseStorage.getInstance(),
) {

    companion object {
        val instance: StorageRepository by lazy { StorageRepository() }
        private const val TAG = "StorageRepository"
    }

    /**
     * Uploads an audio file to Firebase Storage and emits progress updates.
     * Returns the download URL once completed.
     */
    suspend fun uploadAudio(
        file: File,
        onProgress: (Int) -> Unit
    ): String {
        val user = firebaseAuth.currentUser ?: throw Exception("User not logged in")

        val timestamp = System.currentTimeMillis()
        val fileName = "${user.uid}_$timestamp.m4a"
        val storageRef = storage.reference
            .child("speech_assessments")
            .child(user.uid)
            .child(fileName)

        Log.d(TAG, "Uploading file to ${storageRef.path}")

        val uploadTask = storageRef.putFile(Uri.fromFile(file))
        // Add progress listener directly — no Flow needed
        uploadTask.addOnProgressListener { snapshot ->
            val progress = (100.0 * snapshot.bytesTransferred / snapshot.totalByteCount).toInt()
            onProgress(progress)
        }

        // Wait for upload to finish
        uploadTask.await()

        // Get the download URL
        val downloadUrl = storageRef.downloadUrl.await().toString()
        Log.d(TAG, "Upload complete: $downloadUrl")

        return downloadUrl
    }
}
