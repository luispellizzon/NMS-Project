package com.example.nms_mobile.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.example.nms_mobile.R

@Composable
fun SocialLoginButtons(
    onGoogleClick: () -> Unit,
    onFacebookClick: () -> Unit,
) {
    Column() {

        // Google Button
        OutlinedButton(
            onClick = onGoogleClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .padding(top = 10.dp),
            // Set the button border style.
            border = ButtonDefaults.outlinedButtonBorder.copy(width = 1.dp),
            // Set the button colors (light gray background, black text).
            colors = ButtonDefaults.outlinedButtonColors(
                containerColor = Color(0xFFF2F2F2),
                contentColor = Color.Black
            ),
            shape = MaterialTheme.shapes.medium
        ) {
            // Try to load the Google icon safely.
            val g = runCatching { painterResource(id = R.drawable.ic_google) }.getOrNull()
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (g != null) {
                    // Display the Google icon without applying a color tint.
                    Icon(painter = g, contentDescription = "Google", tint = Color.Unspecified)
                    Spacer(Modifier.width(12.dp))
                }
                Text("Continue With Google")
            }
        }


        // Facebook Button
        OutlinedButton(
            onClick = onFacebookClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .padding(top = 10.dp),
            border = ButtonDefaults.outlinedButtonBorder.copy(width = 1.dp),
            colors = ButtonDefaults.outlinedButtonColors(
                containerColor = Color(0xFFF2F2F2),
                contentColor = Color.Black
            ),
            shape = MaterialTheme.shapes.medium
        ) {
            // Try to load the Facebook icon safely.
            val a = runCatching { painterResource(id = R.drawable.ic_facebook) }.getOrNull()
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (a != null) {
                    // Display the Facebook icon, typically tinted blue.
                    Icon(painter = a, contentDescription = "Facebook", tint = Color.Blue)
                    Spacer(Modifier.width(12.dp))
                }
                Text("Continue With Facebook")
            }
        }
    }
}