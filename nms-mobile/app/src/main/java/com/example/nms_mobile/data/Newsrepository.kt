package com.example.nms_mobile.data

import android.annotation.SuppressLint
import android.util.Log
import com.example.nms_mobile.api.NewsArticle
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.*

/**
 * Repository for managing news articles from Firestore
 */
class NewsRepository private constructor(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {

    companion object {
        private const val TAG = "NewsRepository"
        val instance by lazy { NewsRepository() }

        // Date formatter for displaying timestamps
        @SuppressLint("ConstantLocale")
        private val dateFormatter = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
    }

    /**
     * Fetch patient news articles from Firestore
     * Articles are sorted by createdAt descending (newest first)
     */
    suspend fun getPatientNews(limit: Int = 10): List<NewsArticle> {
        return try {
            Log.d(TAG, "Fetching patient news from Firestore...")
            val snapshot = firestore.collection("patient_news")
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .limit(limit.toLong())
                .get()
                .await()

            Log.d(TAG, "Found ${snapshot.documents.size} patient news documents")

            val articles = snapshot.documents.mapNotNull { doc ->
                try {
                    // Parse timestamps
                    val createdAt = doc.get("createdAt")
                    val publishedDate = doc.get("publishedDate")

                    val publishedDateString = when (publishedDate) {
                        is Timestamp -> dateFormatter.format(publishedDate.toDate())
                        is String -> publishedDate
                        else -> ""
                    }

                    NewsArticle(
                        id = doc.id,
                        title = doc.getString("title") ?: "",
                        agentSummary = doc.getString("agentSummary") ?: "",
                        sourceUrl = doc.getString("sourceUrl") ?: "",
                        topic = doc.getString("topic") ?: "",
                        readTime = doc.getString("readTime") ?: "",
                        publishedDate = publishedDateString,
                        createdAt = createdAt,
                        audience = "patient"
                    )
                } catch (e: Exception) {
                    Log.e(TAG, "Error parsing patient news document ${doc.id}", e)
                    null
                }
            }

            Log.d(TAG, "Successfully parsed ${articles.size} patient articles")
            articles
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching patient news", e)
            emptyList()
        }
    }

    /**
     * Fetch medical news articles from Firestore
     * Articles are sorted by createdAt descending (newest first)
     */
    suspend fun getMedicalNews(limit: Int = 10): List<NewsArticle> {
        return try {
            Log.d(TAG, "Fetching medical news from Firestore...")
            val snapshot = firestore.collection("medical_news")
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .limit(limit.toLong())
                .get()
                .await()

            Log.d(TAG, "Found ${snapshot.documents.size} medical news documents")

            val articles = snapshot.documents.mapNotNull { doc ->
                try {
                    // Parse timestamps
                    val createdAt = doc.get("createdAt")
                    val publishedDate = doc.get("publishedDate")

                    val publishedDateString = when (publishedDate) {
                        is Timestamp -> dateFormatter.format(publishedDate.toDate())
                        is String -> publishedDate
                        else -> ""
                    }

                    NewsArticle(
                        id = doc.id,
                        title = doc.getString("title") ?: "",
                        agentSummary = doc.getString("agentSummary") ?: "",
                        sourceUrl = doc.getString("sourceUrl") ?: "",
                        topic = doc.getString("topic") ?: "",
                        readTime = doc.getString("readTime") ?: "",
                        publishedDate = publishedDateString,
                        createdAt = createdAt,
                        audience = "medical"
                    )
                } catch (e: Exception) {
                    Log.e(TAG, "Error parsing medical news document ${doc.id}", e)
                    null
                }
            }

            Log.d(TAG, "Successfully parsed ${articles.size} medical articles")
            articles
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching medical news", e)
            emptyList()
        }
    }
}