package com.example.nms_mobile.services

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.Locale
import java.util.UUID

class TTSManager private constructor(private val context: Context) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isReady = false
    private var pendingText: String? = null

    init {
        tts = TextToSpeech(context.applicationContext, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val lang = tts?.setLanguage(Locale.getDefault())
            isReady = lang != TextToSpeech.LANG_MISSING_DATA && lang != TextToSpeech.LANG_NOT_SUPPORTED

            pendingText?.let {
                speak(it)
                pendingText = null
            }

        } else {
            isReady = false
        }
    }

    fun speak(text: String) {
        if (!isReady) {
            pendingText = text
            return
        }
        val utteranceId = UUID.randomUUID().toString()
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
    }

    companion object {
        @Volatile private var instance: TTSManager? = null

        fun getInstance(context: Context) =
            instance ?: synchronized(this) {
                instance ?: TTSManager(context).also { instance = it }
            }
    }
}