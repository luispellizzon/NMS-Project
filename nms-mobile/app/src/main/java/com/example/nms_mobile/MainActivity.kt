package com.example.nms_mobile

import android.app.AlarmManager
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.example.nms_mobile.auth.*
import com.example.nms_mobile.auth.ProvideAuth
import com.example.nms_mobile.navigation.*
import com.example.nms_mobile.ui.NMSmobileTheme
import kotlinx.coroutines.delay

/**
 * MainActivity - Simplified version
 *
 * Firebase and AppCheck are initialized in MyApplication.kt
 * so we don't need to initialize them here.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Firebase is initialized in MyApplication.kt
        // No need to initialize here

        enableEdgeToEdge()

        setContent {
            NMSmobileTheme {
                val auth = remember { Auth() }
                ProvideAuth(auth) {
                    // Check exact alarm permission (with crash fix)
                    AlarmPermissionCheck()

                    AppNavigation()
                }
            }
        }
    }
}

/**
 * Compose component that checks and requests exact alarm permission
 * Only needed on Android 12 (API 31) and above
 */
@Composable
fun AlarmPermissionCheck() {
    val context = LocalContext.current
    val activity = context as? ComponentActivity
    var showDialog by remember { mutableStateOf(false) }
    var permissionChecked by remember { mutableStateOf(false) }

    // 🔧 FIX: Monitor lifecycle state without collectAsState
    val lifecycleOwner = LocalLifecycleOwner.current
    var isResumed by remember { mutableStateOf(false) }

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            isResumed = event == Lifecycle.Event.ON_RESUME
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    // Check permission only once on startup with safeguards
    LaunchedEffect(isResumed) {
        if (isResumed && !permissionChecked) {
            // 🔧 FIX: Wait for activity to be fully initialized
            delay(500) // 500ms delay to ensure stable state

            permissionChecked = true
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                try {
                    val alarmManager = context.getSystemService(AlarmManager::class.java)
                    if (alarmManager?.canScheduleExactAlarms() == false) {
                        showDialog = true
                    }
                } catch (e: Exception) {
                    android.util.Log.e("AlarmPermission", "Error checking alarm permission", e)
                }
            }
        }
    }

    // 🔧 FIX: Only show dialog if activity is in valid state
    if (showDialog && activity?.isFinishing == false && isResumed) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("Permission Required") },
            text = {
                Text("To send you reminders and notifications at the right time, we need permission to schedule exact alarms.")
            },
            confirmButton = {
                Button(onClick = {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        try {
                            val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                                data = android.net.Uri.parse("package:${context.packageName}")
                            }
                            context.startActivity(intent)
                        } catch (e: Exception) {
                            android.util.Log.e("AlarmPermission", "Error opening settings", e)
                        }
                    }
                    showDialog = false
                }) {
                    Text("Allow")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("Later")
                }
            }
        )
    }
}