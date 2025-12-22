package com.example.nms_mobile

import android.app.Application
import com.example.nms_mobile.services.TTSManager
import com.google.firebase.FirebaseApp
import com.google.firebase.appcheck.FirebaseAppCheck
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory
import org.opencv.android.OpenCVLoader

/**
 * Custom Application class for initializing Firebase and AppCheck
 *
 * This class is registered in AndroidManifest.xml with:
 * android:name=".MyApplication"
 */
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize Firebase
        FirebaseApp.initializeApp(this)

        // Initialize AppCheck
        try {
            val firebaseAppCheck = FirebaseAppCheck.getInstance()
            firebaseAppCheck.installAppCheckProviderFactory(
                PlayIntegrityAppCheckProviderFactory.getInstance()
            )
            android.util.Log.d("MyApplication", "Firebase and AppCheck initialized successfully")
            // Initialize OpenCV
            if (OpenCVLoader.initLocal()) {
                android.util.Log.d("MyApplication", "OpenCV loaded successfully")
            } else {
                android.util.Log.e("MyApplication", "OpenCV initialization failed")
            }
        } catch (e: Exception) {
            android.util.Log.e("MyApplication", "Error initializing", e)
        }


    }
    override fun onTerminate() {
        TTSManager.getInstance(this).shutdown()
        super.onTerminate()
    }
}