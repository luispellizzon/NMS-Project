package com.example.nms_mobile.api

import android.util.Log
import kotlinx.coroutines.delay
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.ResponseBody
import org.jetbrains.annotations.Async
import org.json.JSONArray
import org.json.JSONObject
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import java.util.concurrent.TimeUnit

// -----------------------------
// Retrofit API (Raw Only)
// -----------------------------
interface HuggingFaceApi {

    @POST("/gradio_api/call/predict_severity")
    suspend fun submitSeverityRequest(
        @Body body: RequestBody      // MUST be raw text
    ): Response<ResponseBody>

    @GET("/gradio_api/call/predict_severity/{event_id}")
    suspend fun getSeverityEventResult(
        @Path("event_id") eventId: String
    ): Response<ResponseBody>
}

// -----------------------------
// Retrofit Client
// -----------------------------
object HuggingFaceApiClient {
    private const val BASE_URL = "https://JDrizzle-nms-project.hf.space"

    private val okHttp = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .writeTimeout(20, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)      // Increased
        .callTimeout(90, TimeUnit.SECONDS)      // Much higher
        .build()


    val api: HuggingFaceApi = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttp)
        // NO converters — raw only
        .build()
        .create(HuggingFaceApi::class.java)
}

// -----------------------------
// Build JSON for submission
// -----------------------------
fun buildRiskBody(mmseScore: Int, risk: Map<String, Any>): RequestBody {

    val dataArray = org.json.JSONArray()

    dataArray.put((risk["age"] as Number).toInt())
    dataArray.put((risk["weight"] as Number).toInt())
    dataArray.put(risk["dominant_hand"].toString())
    dataArray.put(risk["gender"].toString())
    dataArray.put(risk["education_level"].toString())
    dataArray.put(risk["smoking_status"].toString())
    dataArray.put(risk["alcohol_use"].toString())
    dataArray.put(risk["physical_activity"].toString())
    dataArray.put(risk["nutrition_diet"].toString())
    dataArray.put(risk["sleep_quality"].toString())
    dataArray.put(risk["diabetic"].toString())
    dataArray.put(risk["family_history"].toString())
    dataArray.put(risk["depression_status"].toString())
    dataArray.put(risk["genetic"].toString())
    dataArray.put(risk["medication_history"].toString())
    dataArray.put(risk["chronic_health_conditions"].toString())
    dataArray.put(mmseScore)

    val json = JSONObject()
    json.put("data", dataArray)

    Log.d("HF-JSON", json.toString(2))


    return json.toString()
        .toRequestBody("application/json".toMediaType())
}

// -----------------------------
// Submit → receive event_id
// -----------------------------
suspend fun submitToHF(body: RequestBody): String {
    val response = HuggingFaceApiClient.api.submitSeverityRequest(body)

    Log.d("HF", "POST /gradio_api/call/predict_severity")
    Log.d("HF", "HTTP code: ${response.code()}")

    val raw = response.body()?.string()

    Log.d("HF", "Raw response body: $raw")

    if (raw.isNullOrBlank()) {
        throw Exception("Empty HF response (code=${response.code()}, message=${response.message()})")
    }

    val json = JSONObject(raw)
    return json.getString("event_id")
}


// -----------------------------
// Poll until result is ready
// -----------------------------
suspend fun pollGradioResult(eventId: String): JSONObject{

    repeat(120) { attempt ->   // 60 seconds total
        delay(500)

        val response = HuggingFaceApiClient.api.getSeverityEventResult(eventId)
        val raw = response.body()?.string()?.trim().orEmpty()

        Log.d("HF-POLL", "Poll #$attempt: $raw")

        if (raw.isBlank()) return@repeat

        // 1. COMPLETED RESULT
        if (raw.startsWith("event: complete")) {

            val jsonPart = raw.substringAfter("data:").trim()

            if (jsonPart.isNotEmpty()) {
                val arr = JSONArray(jsonPart)
                return arr.getJSONObject(0)
            }
        }
        if (raw.startsWith("event: error")) {
            val errorMsg = raw.substringAfter("data:").trim()
            throw Exception("HF Error: $errorMsg")
        }
        if (raw.startsWith("event: pending") ||
            raw.startsWith("event: processing")) {
            return@repeat
        }
    }

    throw Exception("Timeout waiting for Hugging Face prediction")
}


// -----------------------------
// Full Pipeline Entry Point
// -----------------------------
suspend fun sendToHuggingFaceGradioAndGetResult(
    mmseScore: Int,
    risk: Map<String, Any>
): JSONObject {
    val body = buildRiskBody(mmseScore, risk)

    val eventId = submitToHF(body)

    val risk = pollGradioResult(eventId)

    return risk
}
