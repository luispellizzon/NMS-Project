package com.example.nms_mobile.ui.login

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.nms_mobile.R
import com.example.nms_mobile.ui.components.SocialLoginButtons
import com.example.nms_mobile.ui.theme.BorderActive
import com.example.nms_mobile.ui.theme.TealPrimary
import com.example.nms_mobile.ui.theme.TextHint
import com.example.nms_mobile.ui.theme.TextSecondary
@Composable
fun LoginScreen(
    state: LoginUiState,
    onEmailChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onLoginClick: () -> Unit,
    onSignUpClick: () -> Unit,
    onForgotPasswordClick: () -> Unit = {},
    onGoogleClick: () -> Unit = {},
    onFacebookClick: () -> Unit = {},
    onAppleClick: () -> Unit = {}
) {
    var pwVisible by remember { mutableStateOf(false) }
    val focus = LocalFocusManager.current

    // Scroll so nothing overlaps on small screens
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header
        Text(
            text = "Welcome Back",
            style = MaterialTheme.typography.titleMedium,
            color = TealPrimary,
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Center
        )
        Text(
            text = "Login",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.SemiBold),
            color = TealPrimary,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 2.dp),
            textAlign = TextAlign.Center
        )

        Spacer(Modifier.height(12.dp))

        // Logo (safe fallback)
        val logo: Painter? = runCatching { painterResource(id = R.drawable.nms_logo) }.getOrNull()
        if (logo != null) {
            Image(painter = logo, contentDescription = "NMS Logo", modifier = Modifier.size(84.dp))
        } else {
            Text(
                "nms",
                style = MaterialTheme.typography.headlineLarge.copy(fontWeight = FontWeight.Bold),
                color = TealPrimary
            )
        }

        Spacer(Modifier.height(20.dp))

        // Email
        OutlinedTextField(
            value = state.email,
            onValueChange = onEmailChange,
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Email") },
            placeholder = { Text("Email", color = TextHint) },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Next
            ),
            keyboardActions = KeyboardActions(onNext = { focus.moveFocus(FocusDirection.Down) }),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = BorderActive,
                focusedLabelColor = TealPrimary,
                cursorColor = TealPrimary
            )
        )

        Spacer(Modifier.height(12.dp))

        // Password w/ eye toggle
        OutlinedTextField(
            value = state.password,
            onValueChange = onPasswordChange,
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Password") },
            placeholder = { Text("Password", color = TextHint) },
            visualTransformation = if (pwVisible) VisualTransformation.None else PasswordVisualTransformation(),
            trailingIcon = {
                val icon: ImageVector = if (pwVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff
                IconButton(onClick = { pwVisible = !pwVisible }) {
                    Icon(icon, contentDescription = null, tint = TextSecondary)
                }
            },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(onDone = { focus.clearFocus() }),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = BorderActive,
                focusedLabelColor = TealPrimary,
                cursorColor = TealPrimary
            )
        )

        // Forgot Password aligned right on its own row
        TextButton(
            onClick = onForgotPasswordClick,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 6.dp)
                .wrapContentWidth(Alignment.End)
        ) {
            Text("Forgot Password?", color = TealPrimary)
        }

        // Error (if any)
        if (state.error != null) {
            Text(
                state.error,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp),
                textAlign = TextAlign.Start
            )
        }

        // Login button full width, its own row
        Button(
            onClick = onLoginClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .padding(top = 8.dp),
            enabled = !state.isLoading,
            colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
        ) {
            if (state.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text("Login")
            }
        }

        // Sign up link centered
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 14.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Don't have an account?  ", color = TextSecondary)
            TextButton(onClick = onSignUpClick) { Text("Sign Up", color = TealPrimary) }
        }

        // Divider "or"
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Divider(modifier = Modifier.weight(1f), color = Color.Gray.copy(alpha = 0.3f))
            Text("  or  ", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
            Divider(modifier = Modifier.weight(1f), color = Color.Gray.copy(alpha = 0.3f))
        }

        // Social buttons (optional)
        SocialLoginButtons(
            onGoogleClick = onGoogleClick,
            onFacebookClick = onFacebookClick,
            onAppleClick = onAppleClick,
        )

        Text(
            text = "By clicking continue, you agree to our Terms of Service and Privacy Policy",
            style = MaterialTheme.typography.bodySmall,
            color = TextSecondary,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 14.dp, bottom = 6.dp)
        )
    }
}
