package com.example.nms_mobile.auth

import androidx.compose.runtime.*
// A special tool (CompositionLocal) that lets us access the 'Auth' object
// from any composable function without passing it through all intermediate screens.
// It will throw an error if the 'Auth' object hasn't been set up yet.
val LocalAuth = staticCompositionLocalOf<Auth> {
    error("LocalAuth not provided")
}

@Composable
fun ProvideAuth(auth: Auth, content: @Composable (() -> Unit)) {
    // This function sets the 'Auth' object (the actual manager) to be available
    // for all components inside its 'content' block.
    CompositionLocalProvider(LocalAuth provides auth) {
        content()
    }
}