package com.example.nms_mobile.ui.feature.dashboard

import DashboardUiState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.components.NmsTopAppBar


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    state: DashboardUiState,
    onOpenNews: () -> Unit,
    onOpenRiskAssessment: () -> Unit,
    onOpenSpeech: () -> Unit,
    onOpenMemory: () -> Unit,
    onOpenCognitive: () -> Unit,
    onLogoutClick: () -> Unit,
) {
    Scaffold(
        topBar = {
            // Display the custom top bar with user info.
            NmsTopAppBar(
                greeting = state.greeting,
                displayName = state.displayName,
                onLogoutClick = onLogoutClick
            )
        }
    ) { padding ->
        // Main content area, allowing the user to scroll.
        Column(
            modifier = Modifier
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {

            Spacer(Modifier.height(16.dp))

            // NEWS big teal card (Interactive link to news).
            ElevatedCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.elevatedCardColors(containerColor = TealPrimary),
                elevation = CardDefaults.elevatedCardElevation(defaultElevation = 6.dp),
                onClick = onOpenNews
            ) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(
                        "NEWS",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.SemiBold),
                        color = Color.White
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // Section title.
            Text(
                text = "Assessments and Scores",
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.SemiBold),
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Lifestyle Questionnaire Tile
                TestTile(
                    title = "Lifestyle Questionary",
                    onClick = onOpenRiskAssessment,
                    modifier = Modifier
                        .weight(1f)
                        .height(180.dp),
                    // If not complete, use TealPrimary color.
                    pendingColor = TealPrimary,
                    isCompleted = state.isLifestyleQuestionaryCompleted
                )

                // Speech Tile (Default color is gray, meaning 'Pending')
                TestTile(
                    title = "Speech",
                    onClick = onOpenSpeech,
                    modifier = Modifier
                        .weight(1f)
                        .height(180.dp)
                )
            }

            Spacer(Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Memory Tile (Default color is gray)
                TestTile(
                    title = "Memory",
                    onClick = onOpenMemory,
                    modifier = Modifier
                        .weight(1f)
                        .height(140.dp)
                )
                // Cognitive Tile (Default color is gray)
                TestTile(
                    title = "Cognitive",
                    onClick = onOpenCognitive,
                    modifier = Modifier
                        .weight(1f)
                        .height(140.dp)
                )
            }
        }
    }
}

// Assessment Tile Component
@Composable
private fun TestTile(
    title: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    // Color used when the assessment is NOT completed. Default is gray.
    pendingColor: Color = Color(0xFF9E9E9E),
    isCompleted: Boolean = false,
) {
    // The color used when the assessment IS completed (fixed gray).
    val completedColor = Color(0xFF9E9E9E)

    // Decide the card's final color.
    val cardColor = if (isCompleted) {
        completedColor // Gray if complete
    } else {
        pendingColor // Teal or default gray if not complete
    }

    // Change the text if the assessment is completed.
    val displayText = if (isCompleted) "COMPLETE" else title

    // Stop click action if the assessment is completed.
    val clickAction: (() -> Unit)? = if (isCompleted) null else onClick

    ElevatedCard(
        // Clicks run only if clickAction is not null (i.e., not completed).
        onClick = { clickAction?.invoke() },
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        // Apply the chosen color.
        colors = CardDefaults.elevatedCardColors(containerColor = cardColor),
        elevation = CardDefaults.elevatedCardElevation(6.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = displayText,
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                color = Color.White
            )
        }
    }
}