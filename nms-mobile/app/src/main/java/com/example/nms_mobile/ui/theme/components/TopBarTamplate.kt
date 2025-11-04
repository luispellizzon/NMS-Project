package com.example.nms_mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.nms_mobile.ui.TealPrimary // Make sure this import is correct

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NmsTopAppBar(
    // The greeting message (e.g., "Good morning").
    greeting: String,
    // The user's name to display.
    displayName: String,
    // The function to run when the user taps the logout button.
    onLogoutClick: () -> Unit,
) {
    TopAppBar(
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Avatar (Profile picture placeholder)
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape) // Makes it round
                        .background(Color.Gray),
                    contentAlignment = Alignment.Center
                ) {
                    // Person icon inside the gray circle.
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Profile",
                        tint = Color.White
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(Modifier.weight(1f)) {
                    // Displays the dynamic greeting (e.g., "Good morning, John").
                    Text(
                        text = "$greeting, $displayName",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray // Subdued color for the greeting.
                    )
                    // Displays a fixed welcome message with the main app color.
                    Text(
                        text = "Welcome NMS",
                        style = MaterialTheme.typography.titleMedium,
                        color = TealPrimary, // Primary app color.
                        fontWeight = FontWeight.Bold
                    )
                }

                // Logout button (icon on the far right)
                IconButton(onClick = onLogoutClick) {
                    Icon(
                        imageVector = Icons.Default.Logout,
                        contentDescription = "Logout",
                        tint = TealPrimary // Uses the app's primary color.
                    )
                }
            }
        },
        // Sets the app bar background to match the screen background.
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.background
        )
    )
}