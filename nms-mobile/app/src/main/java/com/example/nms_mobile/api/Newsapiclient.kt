package com.example.nms_mobile.api

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

// Request model for generating news
data class GenerateNewsRequest(
    val audience: String,  // "medical" or "patient"
    val topic: String,      // e.g., "alzheimer dementia cognitive decline"
    val max_articles: Int = 5
)

// Response model for news generation
data class GenerateNewsResponse(
    val status: String,
    val audience: String,
    val message: String
)

// Health check response
data class HealthResponse(
    val status: String,
    val service: String
)

// News article model - MATCHES REAL FIRESTORE STRUCTURE
data class NewsArticle(
    val id: String = "",
    val title: String = "",
    val agentSummary: String = "",          // ← Real field in Firestore
    val sourceUrl: String = "",             // ← Real field (not "url")
    val topic: String = "",                 // ← Real field
    val readTime: String = "",              // ← Real field (camelCase)
    val publishedDate: Any? = null,         // ← Timestamp in Firestore
    val createdAt: Any? = null,             // ← Timestamp in Firestore
    val audience: String = ""               // ← If exists (patient/medical)
)

interface AgentsApi {
    @POST("/generate-news")
    suspend fun generateNews(@Body request: GenerateNewsRequest): GenerateNewsResponse

    @GET("/health")
    suspend fun healthCheck(): HealthResponse
}

object AgentsApiClient {
    // For Android Emulator use 10.0.2.2; for physical device use your computer's LAN IP
    private const val BASE_URL = "http://10.0.2.2:8002"

    private val okHttp = OkHttpClient.Builder()
        .callTimeout(120, TimeUnit.SECONDS)  // Longer timeout for news generation
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(120, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    // Create Moshi instance with Kotlin support
    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    val api: AgentsApi = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttp)
        .addConverterFactory(MoshiConverterFactory.create(moshi))  // ← Use configured Moshi
        .build()
        .create(AgentsApi::class.java)
}