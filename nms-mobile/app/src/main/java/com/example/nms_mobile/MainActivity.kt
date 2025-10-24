package com.example.nms_mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.example.nms_mobile.auth.Auth
import com.example.nms_mobile.auth.ProvideAuth
import com.example.nms_mobile.navigation.AppNavigation
import com.example.nms_mobile.ui.theme.NMSmobileTheme
import com.google.firebase.FirebaseApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        FirebaseApp.initializeApp(this)
        enableEdgeToEdge()
        setContent {
            NMSmobileTheme {
                val auth = remember { Auth() }
                ProvideAuth(auth) {
                    AppNavigation()
                }
            }
        }
    }
}