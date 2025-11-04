package com.example.nms_mobile.services

import android.content.Context
import android.media.MediaRecorder
import android.os.Build
import android.util.Log
import java.io.File
import java.io.IOException

/**
 * Service for recording audio to file
 * Records audio in AAC format (compatible with MP3 players)
 */
class AudioRecorderService(private val context: Context) {

    private var mediaRecorder: MediaRecorder? = null
    private var outputFile: File? = null
    private var isRecording = false
    private var startTime: Long = 0

    companion object {
        private const val TAG = "AudioRecorder"
        private const val MAX_DURATION_MS = 180000 // 3 minutes in milliseconds
    }

    /**
     * Starts recording audio
     * @return The file where audio is being recorded
     */
    fun startRecording(): File? {
        try {
            // Create output file
            val timestamp = System.currentTimeMillis()
            outputFile = File(context.cacheDir, "audio_$timestamp.m4a")

            Log.d(TAG, "Recording to: ${outputFile?.absolutePath}")

            // Initialize MediaRecorder
            mediaRecorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(context)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }

            mediaRecorder?.apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setAudioEncodingBitRate(128000)
                setAudioSamplingRate(44100)
                setMaxDuration(MAX_DURATION_MS)
                setOutputFile(outputFile?.absolutePath)

                // Set listener for max duration reached
                setOnInfoListener { _, what, _ ->
                    if (what == MediaRecorder.MEDIA_RECORDER_INFO_MAX_DURATION_REACHED) {
                        Log.d(TAG, "Max duration reached (3 minutes)")
                    }
                }

                prepare()
                start()
            }

            isRecording = true
            startTime = System.currentTimeMillis()
            Log.d(TAG, "Recording started")

            return outputFile

        } catch (e: IOException) {
            Log.e(TAG, "Failed to start recording", e)
            releaseRecorder()
            return null
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error starting recording", e)
            releaseRecorder()
            return null
        }
    }

    /**
     * Stops recording
     * @return Duration in milliseconds
     */
    fun stopRecording(): Long {
        val duration = if (isRecording) {
            System.currentTimeMillis() - startTime
        } else {
            0L
        }

        try {
            if (isRecording) {
                mediaRecorder?.stop()
                Log.d(TAG, "Recording stopped. Duration: ${duration}ms")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping recording", e)
        } finally {
            releaseRecorder()
            isRecording = false
        }

        return duration
    }

    /**
     * Cancels recording and deletes the file
     */
    fun cancelRecording() {
        try {
            if (isRecording) {
                mediaRecorder?.stop()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error canceling recording", e)
        } finally {
            releaseRecorder()
            isRecording = false

            // Delete the file
            outputFile?.delete()
            outputFile = null
        }
        Log.d(TAG, "Recording canceled")
    }

    /**
     * Gets the current recording file
     */
    fun getOutputFile(): File? = outputFile

    /**
     * Checks if currently recording
     */
    fun isRecording(): Boolean = isRecording

    /**
     * Gets current duration in milliseconds
     */
    fun getCurrentDuration(): Long {
        return if (isRecording) {
            System.currentTimeMillis() - startTime
        } else {
            0L
        }
    }

    /**
     * Releases MediaRecorder resources
     */
    private fun releaseRecorder() {
        try {
            mediaRecorder?.release()
        } catch (e: Exception) {
            Log.e(TAG, "Error releasing recorder", e)
        }
        mediaRecorder = null
    }
}