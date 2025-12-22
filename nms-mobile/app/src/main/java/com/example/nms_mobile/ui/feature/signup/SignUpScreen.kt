package com.example.nms_mobile.ui.signup

import android.app.Activity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.ui.platform.LocalContext
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
import com.example.nms_mobile.ui.BorderActive
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.TextHint
import com.example.nms_mobile.ui.TextSecondary
import com.example.nms_mobile.ui.White
import com.example.nms_mobile.ui.feature.signup.SignUpUiState
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException

@Composable
fun SignUpScreen(
    state: SignUpUiState,
    onEmailChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onConfirmPasswordChange: (String) -> Unit,
    onSignUpClick: () -> Unit,
    onLoginClick: () -> Unit,
    onGoogleSignUp: (String) -> Unit,
    onFacebookSignUp: (String) -> Unit,
) {
    val context = LocalContext.current
    val activity = context as? Activity

    var pwVisible by remember { mutableStateOf(false) }
    var confirmVisible by remember { mutableStateOf(false) }
    val focus = LocalFocusManager.current

    // ==================== GOOGLE SIGN-IN ====================
    val googleSignInClient = remember {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(context.getString(R.string.default_web_client_id))
            .requestEmail()
            .build()
        GoogleSignIn.getClient(context, gso)
    }

    val googleSignInLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)
                val idToken = account?.idToken
                if (idToken != null) {
                    onGoogleSignUp(idToken)
                }
            } catch (e: ApiException) {
                android.util.Log.e("GoogleSignIn", "Sign in failed: ${e.message}")
            }
        }
    }


    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 50.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header
        Text(
            text = "Welcome",
            style = MaterialTheme.typography.titleMedium,
            color = TealPrimary,
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Center
        )
        Text(
            text = "Sign Up",
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
            placeholder = { Text("your@email.com", color = TextHint) },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Next
            ),
            keyboardActions = KeyboardActions(onNext = { focus.moveFocus(FocusDirection.Down) }),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = BorderActive,
                focusedLabelColor = TealPrimary,
                cursorColor = TealPrimary,
                unfocusedTextColor = TealPrimary,
                focusedTextColor = TealPrimary
            )
        )

        Spacer(Modifier.height(12.dp))

        // Password
        OutlinedTextField(
            value = state.password,
            onValueChange = onPasswordChange,
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Password") },
            placeholder = { Text("At least 6 characters", color = TextHint) },
            visualTransformation = if (pwVisible) VisualTransformation.None else PasswordVisualTransformation(),
            trailingIcon = {
                val icon: ImageVector = if (pwVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff
                IconButton(onClick = { pwVisible = !pwVisible }) {
                    Icon(icon, contentDescription = null, tint = TextSecondary)
                }
            },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Next
            ),
            keyboardActions = KeyboardActions(onNext = { focus.moveFocus(FocusDirection.Down) }),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = BorderActive,
                focusedLabelColor = TealPrimary,
                cursorColor = TealPrimary,
                unfocusedTextColor = TealPrimary,
                focusedTextColor = TealPrimary
            )
        )

        Spacer(Modifier.height(12.dp))

        // Confirm Password
        OutlinedTextField(
            value = state.confirmPassword,
            onValueChange = onConfirmPasswordChange,
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Confirm Password") },
            placeholder = { Text("Re-enter your password", color = TextHint) },
            visualTransformation = if (confirmVisible) VisualTransformation.None else PasswordVisualTransformation(),
            trailingIcon = {
                val icon: ImageVector = if (confirmVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff
                IconButton(onClick = { confirmVisible = !confirmVisible }) {
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
                cursorColor = TealPrimary,
                unfocusedTextColor = TealPrimary,
                focusedTextColor = TealPrimary
            )
        )

        Spacer(Modifier.height(16.dp))

        // Error (if any)
        if (state.error != null) {
            Text(
                state.error,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp)
            )
        }

        // Sign Up button
        Button(
            onClick = onSignUpClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .padding(top = 8.dp),
            // Disable button while loading.
            enabled = !state.isLoading,
            colors = ButtonDefaults.buttonColors(containerColor = TealPrimary, contentColor = White )
        ) {
            if (state.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text("Sign Up")
            }
        }

        // Login link
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 12.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Already have an account?  ", color = TextSecondary)
            TextButton(onClick = onLoginClick) { Text("Login", color = TealPrimary) }
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

        // Social Buttons (Google / Apple / Facebook)
        SocialLoginButtons(
            onGoogleClick = {
                googleSignInLauncher.launch(googleSignInClient.signInIntent)
            },
            onFacebookClick = {
            },
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