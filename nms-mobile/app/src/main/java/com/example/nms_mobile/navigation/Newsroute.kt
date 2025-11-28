package com.example.nms_mobile.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import com.example.nms_mobile.ui.feature.news.NewsViewModel
import com.example.nms_mobile.ui.feature.news.NewsScreen


@Composable
fun NewsRoute(
    onBack: () -> Unit
) {
    val viewModel = remember { NewsViewModel() }
    val state by viewModel.uiState.collectAsState()

    NewsScreen(
        state = state,
        onBack = onBack,
        onRefresh = viewModel::loadNews,
        onGenerateNews = { viewModel.generateNews() },
        onSetAudience = viewModel::setAudience
    )
}