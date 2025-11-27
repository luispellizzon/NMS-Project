package com.example.nms_mobile.ui.feature.feedback

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material3.*
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
        topBar = {
            TopAppBar(
                title = { Text("Rate Our App") },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "How was your experience?",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(24.dp))

            // Star Rating
            Row(
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth()
            ) {
                for (i in 1..5) {
                    Icon(
                        imageVector = if (i <= uiState.rating) Icons.Default.Star else Icons.Default.StarBorder,
                        contentDescription = "Star $i",
                        tint = if (i <= uiState.rating) Color(0xFFFFC107) else Color.Gray, // Amber for filled, Gray for empty
                        modifier = Modifier
                            .size(48.dp)
                            .clickable { viewModel.onRatingChanged(i) }
                            .padding(4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            OutlinedTextField(
                value = uiState.review,
                onValueChange = { if (it.length <= 500) viewModel.onReviewChanged(it) },
                label = { Text("Write a review (optional)") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(150.dp),
                supportingText = { Text("${uiState.review.length}/500") },
                maxLines = 5
            )

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = { viewModel.submitFeedback() },
                enabled = uiState.rating > 0 && !uiState.isSubmitting,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
            ) {
                if (uiState.isSubmitting) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White
                    )
                } else {
                    Text("Submit")
                }
            }
            
            if (uiState.error != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = uiState.error ?: "",
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}
