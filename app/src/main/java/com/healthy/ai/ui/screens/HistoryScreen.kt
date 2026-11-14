package com.healthy.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.healthy.ai.data.model.ScanMode
import com.healthy.ai.data.model.SupportedLanguage
import com.healthy.ai.data.repository.TranslationManager
import com.healthy.ai.ui.theme.*
import com.healthy.ai.ui.viewmodel.HealthyViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun HistoryScreen(
    viewModel: HealthyViewModel,
    selectedLanguage: SupportedLanguage
) {
    val history by viewModel.scanHistory.collectAsState()
    val strings = TranslationManager.getStrings(selectedLanguage)
    val dateFormat = SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault())

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(HealthyBackground)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = strings.historyTitle,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = HealthyTextPrimary
            )
            if (history.isNotEmpty()) {
                Text(
                    text = "${history.size} Scans Saved",
                    fontSize = 12.sp,
                    color = HealthyTextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (history.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("📜", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = strings.historyEmpty,
                        fontSize = 14.sp,
                        color = HealthyTextSecondary,
                        modifier = Modifier.padding(horizontal = 32.dp)
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(history, key = { it.id }) { item ->
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = HealthySurface),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, HealthyBorder, RoundedCornerShape(14.dp))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(
                                        if (item.mode == ScanMode.FOOD) HealthyEmerald.copy(alpha = 0.15f)
                                        else HealthyGreenPrimary.copy(alpha = 0.15f)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = if (item.mode == ScanMode.FOOD) "🍎" else "💊",
                                    fontSize = 20.sp
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = item.foodData?.foodName ?: item.medicineData?.brandName ?: "Item Scan",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = HealthyTextPrimary
                                )

                                Spacer(modifier = Modifier.height(2.dp))

                                val detail = if (item.mode == ScanMode.FOOD) {
                                    "${item.foodData?.nutrition?.calories} • Score ${item.foodData?.nutritionScore}/100"
                                } else {
                                    "${item.medicineData?.genericName} • ${item.medicineData?.strength}"
                                }

                                Text(
                                    text = detail,
                                    fontSize = 12.sp,
                                    color = HealthyTextSecondary
                                )

                                Spacer(modifier = Modifier.height(2.dp))

                                Text(
                                    text = dateFormat.format(Date(item.timestamp)),
                                    fontSize = 10.sp,
                                    color = HealthyTextSecondary.copy(alpha = 0.8f)
                                )
                            }

                            IconButton(
                                onClick = { viewModel.deleteScan(item.id) }
                            ) {
                                Icon(
                                    Icons.Default.Delete,
                                    contentDescription = "Delete",
                                    tint = HealthyTextSecondary.copy(alpha = 0.6f),
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
