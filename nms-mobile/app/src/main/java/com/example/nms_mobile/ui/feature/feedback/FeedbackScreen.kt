package com.example.nms_mobile.ui.feature.feedback

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.foundation.background
import androidx.compose.ui.draw.clip
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.nms_mobile.ui.TealPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedbackScreen(
    onBackClick: () -> Unit,
    viewModel: FeedbackViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    if (uiState.isSuccess) {
        AlertDialog(
            onDismissRequest = {
                viewModel.resetSuccess()
                onBackClick()
            },
            title = { Text("Thank You!") },
            text = { Text("Thank you for your feedback!") },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.resetSuccess()
                    onBackClick()
                }) {
                    Text("OK")
                }
            }
        )
    }

    Scaffold(
        containerColor = Color.White
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Custom Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Profile Image Placeholder
                Box(
                    modifier = Modifier
                        .size(50.dp)
                        .clip(androidx.compose.foundation.shape.CircleShape)
                        .background(Color.Gray), // Placeholder for image
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = androidx.compose.material.icons.Icons.Default.Person,
                        contentDescription = "Profile",
                        tint = Color.White
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(
                        text = uiState.greeting,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                    Text(
                        text = "Welcome ${uiState.displayName}",
                        style = MaterialTheme.typography.titleMedium,
                        color = TealPrimary,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Text(
                text = "RATING AND REVIEW\nOUR APP",
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold,
                    color = TealPrimary
                ),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Rating Card
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF9)), // Light mint/teal
                shape = androidx.compose.foundation.shape.RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "From ${uiState.rating} out of 5",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = TealPrimary
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Stars
            Row(
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth()
            ) {
                for (i in 1..5) {
                    Icon(
                        imageVector = Icons.Default.Star, // Always filled star shape
                        contentDescription = "Star $i",
                        tint = if (i <= uiState.rating) TealPrimary else Color.LightGray, // Teal for filled, Gray for empty
                        modifier = Modifier
                            .size(56.dp)
                            .clickable { viewModel.onRatingChanged(i) }
                            .padding(4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Comments
            Text(
                text = "Comments",
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = uiState.review,
                onValueChange = { if (it.length <= 500) viewModel.onReviewChanged(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                shape = androidx.compose.foundation.shape.RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedBorderColor = Color.LightGray,
                    focusedBorderColor = TealPrimary
                )
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Audio Message Button (Placeholder UI)
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF9)),
                shape = androidx.compose.foundation.shape.RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(androidx.compose.foundation.shape.RoundedCornerShape(8.dp))
                            .background(TealPrimary),
                        contentAlignment = Alignment.Center
                    ) {
                         // Need a speaker icon, using a placeholder or standard icon
                         Icon(
                             imageVector = androidx.compose.material.icons.Icons.Default.VolumeUp,
                             contentDescription = "Record",
                             tint = Color.White
                         )
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Text(
                        text = "Tap the speaker button to record audio message",
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f)) // Push button to bottom

            // Send Button
            Button(
                onClick = { viewModel.submitFeedback() },
                enabled = uiState.rating > 0 && !uiState.isSubmitting,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = TealPrimary,
                    disabledContainerColor = Color.Gray
                )
            ) {
                if (uiState.isSubmitting) {
                    CircularProgressIndicator(color = Color.White)
                } else {
                    Text(
                        text = "Send Review",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
            }
        }
    }
}
