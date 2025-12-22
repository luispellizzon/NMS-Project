package com.example.nms_mobile.ui.components

import android.util.Log
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.stripe.android.PaymentConfiguration
import com.stripe.android.paymentsheet.PaymentSheet
import com.stripe.android.paymentsheet.PaymentSheetResult
import com.stripe.android.paymentsheet.rememberPaymentSheet
import androidx.compose.ui.res.stringResource
import com.example.nms_mobile.R
import com.example.nms_mobile.utils.KeyLoader

enum class PaymentUiState {
    IDLE,
    PROCESSING,
    SUCCESS,
    FAILED
}


@Composable
fun PaymentDialog(
    clientSecret: String? = null,
    onConfirmPayment: (String, String) -> Unit,
    onDismiss: () -> Unit,
    isProcessing: Boolean = false,
) {
    val context = LocalContext.current
    val key = KeyLoader.stripe_key
    var uiState by remember { mutableStateOf(PaymentUiState.IDLE) }
    var failureMessage by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(uiState) {
        if (uiState == PaymentUiState.SUCCESS) {
            kotlinx.coroutines.delay(5000)
            onDismiss()
        }
    }

    val paymentSheet = rememberPaymentSheet { paymentSheetResult ->
        when (paymentSheetResult) {
            is PaymentSheetResult.Completed -> {
                Log.d("PaymentDialog", "Payment completed successfully")
                uiState = PaymentUiState.SUCCESS
            }

            is PaymentSheetResult.Canceled -> {
                Log.d("PaymentDialog", "Payment canceled by user")
                uiState = PaymentUiState.IDLE
            }
            is PaymentSheetResult.Failed -> {
                Log.e("PaymentDialog", "Payment failed: ${paymentSheetResult.error.message}")
                failureMessage = paymentSheetResult.error.localizedMessage
                    ?: "Payment failed. Please try again."
                uiState = PaymentUiState.FAILED
            }
        }
    }

    LaunchedEffect(Unit) {
        PaymentConfiguration.init(
            context,
            key!!
        )
    }

    LaunchedEffect(clientSecret) {
        if (clientSecret != null && !isProcessing) {
            val configuration = PaymentSheet.Configuration(
                merchantDisplayName = "NMS-Project",
                defaultBillingDetails = PaymentSheet.BillingDetails(
                    address = PaymentSheet.Address(
                        country = "IE"
                    )
                )
            )
            paymentSheet.presentWithPaymentIntent(clientSecret, configuration)
        }
    }

    Dialog(onDismissRequest = { if (!isProcessing) onDismiss() }) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.White
            ),
            elevation = CardDefaults.cardElevation(8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                when(uiState) {
                    PaymentUiState.IDLE -> {
                        // Title
                        Text(
                            text = "🔓 Unlock Your Results",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF008B8B),
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Description
                        Text(
                            text = "Get access to your AI-powered dementia risk prediction and detailed analysis",
                            fontSize = 14.sp,
                            color = Color.DarkGray,
                            textAlign = TextAlign.Center,
                            lineHeight = 20.sp
                        )

                        Spacer(modifier = Modifier.height(24.dp))

                        // Price display
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = Color(0xFFF0F0F0)
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "One-time payment",
                                    fontSize = 12.sp,
                                    color = Color.Gray
                                )
                                Text(
                                    text = "€9.99",
                                    fontSize = 36.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF008B8B)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Features list
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            FeatureItem("✓ AI Dementia Risk Prediction")
                            FeatureItem("✓ Detailed Score Breakdown")
                            FeatureItem("✓ Doctor Consultation Access")
                            FeatureItem("✓ Lifetime Access to Results")
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Pay button
                        Button(
                            onClick = {
                                failureMessage = null
                                uiState = PaymentUiState.PROCESSING
                                onConfirmPayment("", "")
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF008B8B)
                            ),
                            shape = RoundedCornerShape(12.dp),
                            enabled = uiState == PaymentUiState.IDLE && !isProcessing,
                        ) {
                            if (isProcessing) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(24.dp),
                                    color = Color.White,
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Text(
                                    text = "Pay with Card",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Cancel button
                        TextButton(
                            onClick = onDismiss,
                            enabled = !isProcessing
                        ) {
                            Text(
                                text = "Cancel",
                                color = Color.Gray,
                                fontSize = 14.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Secure payment notice
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "🔒 Secure payment by ",
                                fontSize = 10.sp,
                                color = Color.Gray
                            )
                            Text(
                                text = "Stripe",
                                fontSize = 10.sp,
                                color = Color(0xFF635BFF),
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    PaymentUiState.PROCESSING -> {
                        Spacer(Modifier.height(32.dp))
                        CircularProgressIndicator(color = Color(0xFF008B8B))
                        Spacer(Modifier.height(16.dp))
                        Text(
                            text = "Processing your payment…",
                            color = Color.Gray
                        )
                    }


                    PaymentUiState.SUCCESS -> {
                        Spacer(Modifier.height(16.dp))
                        Text(
                            text = "🎉 Payment successful!",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF2E7D32),
                            textAlign = TextAlign.Center
                        )

                        Spacer(Modifier.height(12.dp))

                        Text(
                            text = "You can now view your AI results and contact a doctor.",
                            fontSize = 14.sp,
                            color = Color.DarkGray,
                            textAlign = TextAlign.Center
                        )

                        Spacer(Modifier.height(24.dp))

                        Button(
                            onClick = onDismiss,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF008B8B)
                            )
                        ) {
                            Text("View Results")
                        }
                    }

                    PaymentUiState.FAILED -> {
                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "❌ Payment failed",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFD32F2F),
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = failureMessage ?: "Something went wrong while processing your payment.",
                            fontSize = 14.sp,
                            color = Color.DarkGray,
                            textAlign = TextAlign.Center,
                            lineHeight = 20.sp
                        )

                        Spacer(modifier = Modifier.height(24.dp))

                        Button(
                            onClick = {
                                uiState = PaymentUiState.IDLE
                                failureMessage = null
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF008B8B)
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Try Again")
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        TextButton(onClick = onDismiss) {
                            Text("Cancel", color = Color.Gray)
                        }
                    }

                }
            }
        }
    }
}

@Composable
private fun FeatureItem(text: String) {
    Text(
        text = text,
        fontSize = 13.sp,
        color = Color.DarkGray,
        modifier = Modifier.fillMaxWidth()
    )
}