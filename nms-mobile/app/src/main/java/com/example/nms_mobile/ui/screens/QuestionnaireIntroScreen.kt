// ui/questionnaire/QuestionnaireIntroScreen.kt
package com.example.nms_mobile.ui.questionnaire

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.nms_mobile.ui.BackgroundGray
import com.example.nms_mobile.ui.TealDark
import com.example.nms_mobile.ui.TealPrimary
import com.example.nms_mobile.ui.White

@Composable
fun QuestionnaireIntroScreen(
    onStart: () -> Unit,
    onBack: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceEvenly
    ) {
        Spacer(Modifier.height(24.dp))
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                "Let's Get to Know You",
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.SemiBold),
                textAlign = TextAlign.Center
            )
            Spacer(Modifier.height(12.dp))
            Text(
                "To provide an accurate dementia risk assessment, we need to ask some questions about you, your medical history, and your lifestyle. This should take about 5–7 minutes. Your data is kept private and secure. You can save your progress and come back at any time.",
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center
            )
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Button(
                onClick = onStart,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary, contentColor = White),
                shape = MaterialTheme.shapes.large
            ) { Text("Start Now!") }
            Spacer(Modifier.height(12.dp))
            Button(
                onClick = onBack,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(contentColor = TealDark , containerColor = BackgroundGray),
                shape = MaterialTheme.shapes.large
            ) { Text("Back to Dashboard") }
        }

    }
}
