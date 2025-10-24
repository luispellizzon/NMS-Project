package com.example.nms_mobile.ui.components

import androidx.compose.foundation.BorderStroke
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
    onAppleClick: () -> Unit,
    onFacebookClick: () -> Unit,
    modifier: Modifier = Modifier,
    showOrDivider: Boolean = true
) {
    Column() {

        OutlinedButton(
            onClick = onGoogleClick,
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
            val g = runCatching { painterResource(id = R.drawable.ic_google) }.getOrNull()
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (g != null) {
                    Icon(painter = g, contentDescription = "Google", tint = Color.Unspecified)
                    Spacer(Modifier.width(12.dp))
                }
                Text("Continue With Google")
            }
        }

        OutlinedButton(
            onClick = onAppleClick,
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
            val a = runCatching { painterResource(id = R.drawable.ic_apple) }.getOrNull()
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (a != null) {
                    Icon(painter = a, contentDescription = "Apple", tint = Color.Black)
                    Spacer(Modifier.width(12.dp))
                }
                Text("Continue With Apple")
            }
        }

        // Facebook
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
            val a = runCatching { painterResource(id = R.drawable.ic_facebook) }.getOrNull()
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (a != null) {
                    Icon(painter = a, contentDescription = "Facebook", tint = Color.Blue)
                    Spacer(Modifier.width(12.dp))
                }
                Text("Continue With Facebook")
            }
        }
    }
}

@Composable
private fun SocialRow(
    icon: androidx.compose.ui.graphics.painter.Painter?,
    label: String,
    iconTint: Color,
    textColor: Color
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        if (icon != null) {
            Icon(
                painter = icon,
                contentDescription = null,
                modifier = Modifier.size(24.dp),
                tint = iconTint
            )
            Spacer(modifier = Modifier.width(12.dp))
        }
        Text(
            text = label,
            style = MaterialTheme.typography.bodyLarge,
            color = textColor
        )
    }
}

@Composable
private fun safePainterOrNull(resId: Int): androidx.compose.ui.graphics.painter.Painter? {
    return runCatching { painterResource(id = resId) }.getOrNull()
}
