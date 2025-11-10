package com.example.nms_mobile.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import com.example.nms_mobile.ui.TealPrimary


/**
 * Reusable TopAppBar component with back navigation
 *
 * @param title The title text to display
 * @param onBack Callback when back button is clicked
 * @param navigationIcon Optional custom navigation icon (default: back arrow)
 * @param actions Optional actions to display on the right side
 * @param backgroundColor Background color of the app bar
 * @param contentColor Color of the title and icons
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomTopAppBar(
    title: String,
    onBack: () -> Unit,
    navigationIcon: ImageVector = Icons.AutoMirrored.Filled.ArrowBack,
    actions: @Composable () -> Unit = {},
    backgroundColor: Color = Color.White,
    contentColor: Color = TealPrimary
) {
    TopAppBar(
        title = {
            Text(
                text = title,
                color = contentColor,
                style = MaterialTheme.typography.titleLarge
            )
        },
        navigationIcon = {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = navigationIcon,
                    contentDescription = "Back",
                    tint = contentColor
                )
            }
        },
        actions = {
            actions()
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = backgroundColor
        )
    )
}

/**
 * Variant without back button (for main screens like Dashboard)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomTopAppBar(
    title: String,
    actions: @Composable () -> Unit = {},
    backgroundColor: Color = Color.White,
    contentColor: Color = TealPrimary
) {
    TopAppBar(
        title = {
            Text(
                text = title,
                color = contentColor,
                style = MaterialTheme.typography.titleLarge
            )
        },
        actions = {
            actions()
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = backgroundColor
        )
    )
}