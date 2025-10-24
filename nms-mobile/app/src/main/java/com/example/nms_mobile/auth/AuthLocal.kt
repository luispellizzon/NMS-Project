package com.example.nms_mobile.auth

import androidx.compose.runtime.*

val LocalAuth = staticCompositionLocalOf<Auth> {
    error("LocalAuth not provided")
}

@Composable
fun ProvideAuth(auth: Auth, content: @Composable () -> Unit) {
    CompositionLocalProvider(LocalAuth provides auth) {
        content()
    }
}
