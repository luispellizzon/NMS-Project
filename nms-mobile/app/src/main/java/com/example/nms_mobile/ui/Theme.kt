package com.example.nms_mobile.ui

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    // Primary set: use lighter teal as primary to pop on dark backgrounds
    primary = TealLight,
    onPrimary = White,
    primaryContainer = TealDark,
    onPrimaryContainer = White,

    // Secondary set: keep teal family for consistency
    secondary = TealPrimary,
    onSecondary = White,
    secondaryContainer = TealDark,
    onSecondaryContainer = White,

    // Tertiary: use the remaining teal as accent
    tertiary = TealDark,
    onTertiary = White,
    tertiaryContainer = TealPrimary,
    onTertiaryContainer = White,

    // Surfaces / background
    background = SurfaceDark,
    onBackground = White,
    surface = SurfaceDark,
    onSurface = White,

    // Outline/borders
    outline = BorderNormal
)

private val LightColorScheme = lightColorScheme(
    // Primary set
    primary = TealPrimary,
    onPrimary = White,
    primaryContainer = TealLight,
    onPrimaryContainer = White,

    // Secondary set
    secondary = TealLight,
    onSecondary = White,
    secondaryContainer = TealPrimary,
    onSecondaryContainer = White,

    // Tertiary
    tertiary = TealDark,
    onTertiary = White,
    tertiaryContainer = TealLight,
    onTertiaryContainer = White,

    // Surfaces / background
    background = BackgroundColor,
    onBackground = TextPrimary,
    surface = SurfaceLight,
    onSurface = TextPrimary,

    // Outline/borders
    outline = BorderNormal
)

@Composable
fun NMSmobileTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        // Dynamic color for Android 12+ (kept as-is)
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography, // keep your existing Typography.kt
        content = content
    )
}
