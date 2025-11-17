package com.example.nms_mobile.api

import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit

data class ProcessAssessmentRequest(
    val userId: String,
    val assessmentId: String
)

data class ProcessImageDescriptionRequest(
    val audioUrl: String,
    val documentId: String
)

data class ProcessAssessmentResponse(
    val status: String,
    val userId: String,
    val assessmentId: String,
    val message: String
)

interface TranscriptionApi {
    @POST("/process-assessment")
    suspend fun processAssessment(@Body body: ProcessAssessmentRequest): ProcessAssessmentResponse

    @POST("/transcribe-from-url")
    suspend fun processImageDescription(@Body body: ProcessImageDescriptionRequest): ProcessAssessmentResponse
}

object TranscriptionApiClient {
    // For Android Emulator use 10.0.2.2; change to LAN IP for physical device testing
//    private const val BASE_URL = "http://192.168.0.90:8001"
    private const val BASE_URL = "http://172.20.10.13:8001"
    private val okHttp = OkHttpClient.Builder()
        .callTimeout(60, TimeUnit.SECONDS)
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    val api: TranscriptionApi = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttp)
        .addConverterFactory(MoshiConverterFactory.create())
        .build()
        .create(TranscriptionApi::class.java)
}
