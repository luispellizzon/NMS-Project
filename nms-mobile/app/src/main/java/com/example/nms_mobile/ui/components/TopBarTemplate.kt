package com.example.nms_mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Help
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.nms_mobile.ui.TealPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NmsTopAppBar(
    greeting: String,
    displayName: String,
    onLogoutClick: () -> Unit,
    onFeedbackClick: () -> Unit,
    // Add optional parameter for back navigation
    onBackClick: (() -> Unit)? = null,
    // Add optional parameter for support navigation
    onSupportClick: (() -> Unit)? = null
) {
    var showMenu by remember { mutableStateOf(false) }

    TopAppBar(
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                // 1. Avatar (Left Side)
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Color.Gray),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Profile",
                        tint = Color.White
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                // 2. Text (Middle - takes up remaining space)
                Column(Modifier.weight(1f)) {
                    Text(
                        text = "$greeting, $displayName",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                    Text(
                        text = "Welcome NMS",
                        style = MaterialTheme.typography.titleMedium,
                        color = TealPrimary,
                        fontWeight = FontWeight.Bold
                    )
                }

                // 3. Right Side Elements
                
                // BACK BUTTON (Only shows if onBackClick is provided)
                if (onBackClick != null) {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.Gray // Or TealPrimary depending on your preference
                        )
                    }
                }

                // MENU BUTTON
                Box {
                    IconButton(onClick = { showMenu = true }) {
                        Icon(
                            imageVector = Icons.Default.MoreVert,
                            contentDescription = "Menu",
                            tint = TealPrimary
                        )
                    }
                    DropdownMenu(
                        expanded = showMenu,
                        onDismissRequest = { showMenu = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Rate Our App") },
                            onClick = {
                                showMenu = false
                                onFeedbackClick()
                            },
                            leadingIcon = {
                                Icon(
                                    Icons.Default.Star,
                                    contentDescription = null,
                                    tint = TealPrimary
                                )
                            }
                        )
                        if (onSupportClick != null) {
                            DropdownMenuItem(
                                text = { Text("Support") },
                                onClick = {
                                    showMenu = false
                                    onSupportClick()
                                },
                                leadingIcon = {
                                    Icon(
                                        Icons.Default.Help,
                                        contentDescription = null,
                                        tint = TealPrimary
                                    )
                                }
                            )
                        }
                        DropdownMenuItem(
                            text = { Text("Logout") },
                            onClick = {
                                showMenu = false
                                onLogoutClick()
                            },
                            leadingIcon = {
                                Icon(
                                    Icons.Default.Logout,
                                    contentDescription = null,
                                    tint = TealPrimary
                                )
                            }
                        )
                    }
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.background
        )
    )
}