package com.example.nms_mobile.services

import android.content.Context
import android.media.MediaPlayer
import android.util.Log
import java.io.File

/**
 * Service for recording audio to file
 * Records audio in AAC format (compatible with MP3 players)
 */
class AudioPlayerService(private val context: Context) {
    private var mediaPlayer: MediaPlayer? = null
    private var isPlaying = false
    private var isPaused = false

    companion object {
        private const val TAG = "AudioPlayer"
    }

    /**
     * Plays an audio file
     * @param audioFile The file to play
     * @return true if playback started successfully
     */
    fun play(audioFile: File): Boolean {
        try {
            // Release any existing player
            release()

            if (!audioFile.exists()) {
                Log.e(TAG, "Audio file does not exist: ${audioFile.absolutePath}")
                return false
            }

            Log.d(TAG, "Starting playback: ${audioFile.absolutePath}")

            mediaPlayer = MediaPlayer().apply {
                setDataSource(audioFile.absolutePath)
                prepare()
                start()
            }

            isPlaying = true
            isPaused = false

            // Set completion listener
            mediaPlayer?.setOnCompletionListener {
                Log.d(TAG, "Playback completed")
                isPlaying = false
                isPaused = false
            }

            return true

        } catch (e: Exception) {
            Log.e(TAG, "Failed to start playback", e)
            release()
            return false
        }
    }

    /**
     * Pauses playback
     */
    fun pause() {
        try {
            if (isPlaying && mediaPlayer?.isPlaying == true) {
                mediaPlayer?.pause()
                isPlaying = false
                isPaused = true
                Log.d(TAG, "Playback paused")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to pause", e)
        }
    }

    /**
     * Resumes playback
     */
    fun resume() {
        try {
            if (isPaused && mediaPlayer != null) {
                mediaPlayer?.start()
                isPlaying = true
                isPaused = false
                Log.d(TAG, "Playback resumed")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to resume", e)
        }
    }

    /**
     * Stops playback
     */
    fun stop() {
        try {
            if (mediaPlayer != null) {
                mediaPlayer?.stop()
                isPlaying = false
                isPaused = false
                Log.d(TAG, "Playback stopped")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop", e)
        }
    }

    /**
     * Seeks to a specific position
     * @param position Position in milliseconds
     */
    fun seekTo(position: Int) {
        try {
            mediaPlayer?.seekTo(position)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to seek", e)
        }
    }

    /**
     * Gets the current playback position
     * @return Current position in milliseconds
     */
    fun getCurrentPosition(): Int {
        return try {
            mediaPlayer?.currentPosition ?: 0
        } catch (e: Exception) {
            0
        }
    }

    /**
     * Gets the total duration
     * @return Duration in milliseconds
     */
    fun getDuration(): Int {
        return try {
            mediaPlayer?.duration ?: 0
        } catch (e: Exception) {
            0
        }
    }

    /**
     * Checks if currently playing
     */
    fun isPlaying(): Boolean = isPlaying

    /**
     * Checks if paused
     */
    fun isPaused(): Boolean = isPaused

    /**
     * Sets a completion listener
     */
    fun setOnCompletionListener(listener: () -> Unit) {
        mediaPlayer?.setOnCompletionListener {
            isPlaying = false
            isPaused = false
            listener()
        }
    }

    /**
     * Releases resources
     */
    fun release() {
        try {
            mediaPlayer?.release()
            mediaPlayer = null
            isPlaying = false
            isPaused = false
            Log.d(TAG, "Player released")
        } catch (e: Exception) {
            Log.e(TAG, "Error releasing player", e)
        }
    }
}






