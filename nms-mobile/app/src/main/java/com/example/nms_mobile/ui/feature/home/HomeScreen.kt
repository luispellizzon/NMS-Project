package com.example.nms_mobile.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.nms_mobile.auth.LocalAuth
import com.example.nms_mobile.ui.TealPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    state: HomeUiState,
    onLogoutClick: () -> Unit,
    onSelectTab: (Int) -> Unit,
    onCompleteProfileClick: () -> Unit
) {
    val auth = LocalAuth.current

    // List of navigation tabs (label and icon).
    val tabs = listOf(
        "Home" to Icons.Default.Home,
        "Alerts" to Icons.Default.Notifications,
        "Add" to Icons.Default.Add,
        "Tasks" to Icons.Default.Assignment,
        "Favorites" to Icons.Default.Star
    )

    Scaffold(
        // --- Top Bar ---
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        // Avatar Placeholder
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

                        Column(Modifier.weight(1f)) {
                            // Dynamic greeting with user's name.
                            Text(
                                text = "Good morning, ${state.displayName ?: "User"}",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color.Gray
                            )
                            // Fixed app welcome title.
                            Text(
                                text = "Welcome NMS",
                                style = MaterialTheme.typography.titleMedium,
                                color = TealPrimary,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Logout button
                        IconButton(onClick = onLogoutClick) {
                            Icon(
                                imageVector = Icons.Default.Logout,
                                contentDescription = "Logout",
                                tint = TealPrimary
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        // --- Bottom Navigation Bar ---
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.background) {
                tabs.forEachIndexed { index, (label, icon) ->
                    NavigationBarItem(
                        icon = {
                            // Custom style for the central "Add" button (larger, circular background).
                            if (label == "Add") {
                                Box(
                                    modifier = Modifier
                                        .size(56.dp)
                                        .background(TealPrimary, CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(icon, contentDescription = label, tint = Color.White)
                                }
                            } else {
                                Icon(icon, contentDescription = label)
                            }
                        },
                        // Hide the label for the central "Add" button.
                        label = if (label != "Add") { { Text(label) } } else null,
                        selected = state.selectedTab == index,
                        onClick = { onSelectTab(index) },
                        // Define colors for selected/unselected tabs.
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = TealPrimary,
                            selectedTextColor = TealPrimary,
                            indicatorColor = TealPrimary.copy(alpha = 0.1f),
                            unselectedIconColor = Color.Gray
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        // --- Main Content Area ---
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()) // Allow scrolling
        ) {
            // Show this section ONLY IF the profile is not completed yet.
            if (!state.hasCompletedProfile) {
                // Welcome card
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    colors = CardDefaults.cardColors(containerColor = TealPrimary),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Welcome",
                            style = MaterialTheme.typography.headlineMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Call to action text.
                Text(
                    text = "Complete Profile",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Button to start the profile completion process.
                Button(
                    onClick = onCompleteProfileClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = TealPrimary),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Text(
                        text = "Start Now!",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(32.dp))
            }

            // NEWS Card (Always visible)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    // Changes height based on whether the profile is completed (to fill space).
                    .height(if (state.hasCompletedProfile) 200.dp else 150.dp),
                colors = CardDefaults.cardColors(containerColor = TealPrimary),
                shape = RoundedCornerShape(16.dp)
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "NEWS",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Show this section ONLY IF the profile IS completed.
            if (state.hasCompletedProfile) {
                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "score & Tests",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Risk Assessment Score Card
                Card(
                    modifier = Modifier
                        .width(180.dp)
                        .height(200.dp),
                    colors = CardDefaults.cardColors(containerColor = TealPrimary),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Risk Assessment Score from form",
                            style = MaterialTheme.typography.bodyLarge,
                            color = Color.White,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Row of smaller test cards
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    TestCard("Speech", Modifier.weight(1f))
                    TestCard("Memory", Modifier.weight(1f))
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Single full-width test card
                TestCard("Cognitive", Modifier.fillMaxWidth())
            }
        }
    }
}

// Helper component for generic test tiles (gray background).
@Composable
fun TestCard(title: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.height(120.dp),
        // Uses a fixed gray color.
        colors = CardDefaults.cardColors(containerColor = Color(0xFF9E9E9E)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = Color.White,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}