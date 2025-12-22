package com.example.nms_mobile.ui.feature.results

import android.app.Activity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.nms_mobile.ui.BackgroundGray
import com.example.nms_mobile.ui.components.PaymentDialog
import com.example.nms_mobile.ui.components.PredictionCard

@Composable
fun ResultsScreen(
    onNavigateHome: () -> Unit,
    onContactDoctor: () -> Unit,
    onLoadResults: () -> Unit,
    viewModel: ResultsViewModel = viewModel()
) {
    val state by viewModel.ui.collectAsState()


    var showPaymentDialog by remember { mutableStateOf(false) }
    var clientSecret by remember { mutableStateOf<String?>(null) }


    LaunchedEffect(Unit) {
        onLoadResults()
    }

    if (state.paymentError != null) {
        LaunchedEffect(state.paymentError) {
            viewModel.clearPaymentError()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
    ) {
        when {
            state.isLoading -> {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center),
                    color = Color(0xFF008B8B)
                )
            }
            state.error != null -> {
                Column(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Error loading results",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.Red
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = state.error ?: "",
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { viewModel.loadResults() },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF008B8B)
                        )
                    ) {
                        Text("Retry")
                    }
                }
            }
            else -> {
                ResultsContent(
                    results = state.results,
                    hasPaid = state.hasPaid,
                    onNavigateHome = onNavigateHome,
                    onContactDoctor = onContactDoctor,
                    onPayClick = { showPaymentDialog = true }
                )
            }
        }
    }

    if (showPaymentDialog) {
        PaymentDialog(
            clientSecret = clientSecret,
            onConfirmPayment = { _, _ ->
                viewModel.createPaymentIntent(
                    onSuccess = { secret, intentId ->
                        clientSecret = secret
                    },
                )
            },
            onDismiss = {
                showPaymentDialog = false
                clientSecret = null
            },
            isProcessing = state.isProcessingPayment,
        )
    }
}

@Composable
private fun ResultsContent(
    results: Results?,
    hasPaid: Boolean = false,
    onNavigateHome: () -> Unit,
    onContactDoctor: () -> Unit,
    onPayClick: () -> Unit
) {
    Scaffold(
        topBar = {}
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp, bottom = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Your Results",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF008B8B)
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Thank you for taking the time to complete all the tests!",
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center,
                    color = Color.DarkGray
                )
            }

            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Top
            ) {
                PredictionCard(
                    dementiaRisk = results?.dementiaRisk,
                    hasPaid = hasPaid,
                    onPayClick = onPayClick
                )

                Spacer(modifier = Modifier.height(12.dp))

                ScoreCard(
                    title = "Mini Mental State Exam Score",
                    fontSize = 16.sp,
                    score = results?.mmseScore ?: 0,
                    maxScore = results?.mmseScoreMaxScore ?: 30
                )

                Spacer(modifier = Modifier.height(8.dp))

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    ScoreCard(
                        title = "Speech",
                        score = results?.speechScore ?: 0,
                        maxScore = results?.speechMaxScore ?: 17
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    ScoreCard(
                        title = "Cognitive",
                        score = results?.cognitiveScore ?: 0,
                        maxScore = results?.cognitiveMaxScore ?: 7
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    ScoreCard(
                        title = "Memory",
                        score = results?.memoryScore ?: 0,
                        maxScore = results?.memoryMaxScore ?: 6
                    )
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp, bottom = 24.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = onNavigateHome,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF008B8B)
                    ),
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(vertical = 14.dp)
                ) {
                    Text(
                        text = "Home",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                Button(
                    onClick = {
                        if (hasPaid) {
                            onContactDoctor()
                        } else {
                            onPayClick()
                        }
                    },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (hasPaid) Color(0xFF008B8B) else BackgroundGray
                    ),
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(vertical = 14.dp)
                ) {
                    Text(
                        text = "Contact the doctor",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}

@Composable
private fun ScoreCard(
    title: String,
    fontSize: TextUnit = 12.sp,
    score: Int,
    maxScore: Int
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF008B8B)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = title,
                fontSize = fontSize,
                fontWeight = FontWeight.Medium,
                color = Color.White
            )
            Text(
                text = "$score/$maxScore",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }
    }
}