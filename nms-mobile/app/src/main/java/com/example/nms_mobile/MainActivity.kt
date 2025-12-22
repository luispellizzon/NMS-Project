package com.example.nms_mobile

import android.app.AlarmManager
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
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
import androidx.core.net.toUri
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.example.nms_mobile.utils.KeyLoader

/**
 * MainActivity
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        KeyLoader.stripe_key = getString(R.string.STRIPE_PUBLISHABLE_KEY)
        KeyLoader.stripe_base_url = getString(R.string.STRIPE_BASE_URL)
        Log.d("MainActivity", "KEY LOADED: ${KeyLoader.stripe_key}")


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

@Composable
fun AlarmPermissionCheck() {
    val context = LocalContext.current
    val activity = context as? ComponentActivity
    var showDialog by remember { mutableStateOf(false) }
    var permissionChecked by remember { mutableStateOf(false) }

    val lifecycleOwner = androidx.lifecycle.compose.LocalLifecycleOwner.current
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
            delay(500)

            permissionChecked = true
            try {
                val alarmManager = context.getSystemService(AlarmManager::class.java)
                if (alarmManager?.canScheduleExactAlarms() == false) {
                    showDialog = true
                }
            } catch (e: Exception) {
                Log.e("AlarmPermission", "Error checking alarm permission", e)
            }
        }
    }

    if (showDialog && activity?.isFinishing == false && isResumed) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("Permission Required") },
            text = {
                Text("To send you reminders and notifications at the right time, we need permission to schedule exact alarms.")
            },
            confirmButton = {
                Button(onClick = {
                    try {
                        val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                            data = "package:${context.packageName}".toUri()
                        }
                        context.startActivity(intent)
                    } catch (e: Exception) {
                       Log.e("AlarmPermission", "Error opening settings", e)
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