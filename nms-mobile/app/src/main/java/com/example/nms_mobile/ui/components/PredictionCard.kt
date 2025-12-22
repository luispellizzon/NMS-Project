package com.example.nms_mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.nms_mobile.ui.BackgroundGray
import com.example.nms_mobile.ui.Fallback
import com.example.nms_mobile.ui.Green
import com.example.nms_mobile.ui.Orange
import com.example.nms_mobile.ui.Red
import com.example.nms_mobile.ui.Yellow

@Composable
fun PredictionCard(
    dementiaRisk: String?,
    hasPaid: Boolean,
    onPayClick: () -> Unit
) {

    val cardColor = when {
        !hasPaid -> BackgroundGray
        dementiaRisk != null -> riskColor(dementiaRisk)
        else -> Fallback
    }

    val mainText = if (hasPaid) {
        dementiaRisk ?: "No risk prediction available"
    } else {
        "Unlock to View"
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clickable(enabled = !hasPaid) { onPayClick() }
    ) {

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(140.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = cardColor),
            elevation = CardDefaults.cardElevation(4.dp)
        ) {

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "AI Dementia Risk Prediction",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = mainText,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }

        if (!hasPaid) {
            Box(
                modifier = Modifier
                    .matchParentSize()
                    .background(
                        Color.Black.copy(alpha = 0.8f),
                        shape = RoundedCornerShape(16.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "🔒 Locked",
                        color = Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Click here to unlock!",
                        color = Color.White,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}

fun riskColor(risk: String): Color =
    when {
        risk.startsWith("Low Risk") -> Green
        risk.startsWith("Mild Risk") -> Yellow
        risk.startsWith("Moderate Risk") -> Orange
        risk.startsWith("High Risk") -> Red
        else -> Fallback
    }
