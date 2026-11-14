package com.healthy.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.healthy.ai.data.model.SupportedLanguage
import com.healthy.ai.data.repository.TranslationManager
import com.healthy.ai.ui.components.*
import com.healthy.ai.ui.theme.*

@Composable
fun HomeScreen(
    selectedLanguage: SupportedLanguage,
    onFoodScanClick: () -> Unit,
    onMedicineScanClick: () -> Unit,
    onAskAiClick: () -> Unit,
    onSampleFoodClick: () -> Unit,
    onSampleMedicineClick: () -> Unit
) {
    val strings = TranslationManager.getStrings(selectedLanguage)
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(HealthyBackground)
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hero Card with VisionScan AI Health Branding
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.Transparent),
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(
                    Brush.verticalGradient(
                        colors = listOf(HealthyGreenPrimary, HealthyGreenDark)
                    )
                )
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("🛡️", fontSize = 16.sp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "VISIONSCAN AI HEALTH",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = HealthyEmerald,
                            letterSpacing = 1.sp
                        )
                    }
                    Surface(
                        color = Color.White.copy(alpha = 0.2f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = "🔥 7-Day Streak",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = strings.homeHeroTitle,
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = strings.homeHeroSubtitle,
                    fontSize = 13.sp,
                    color = Color.White.copy(alpha = 0.9f),
                    lineHeight = 18.sp
                )
            }
        }

        // Daily Wellness & Goal Tracking Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = HealthySurface),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, HealthyBorder, RoundedCornerShape(16.dp))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Daily Wellness Score",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = HealthyTextPrimary
                        )
                        Text(
                            text = "Based on today's nutrition & hydration",
                            fontSize = 11.sp,
                            color = HealthyTextSecondary
                        )
                    }
                    NutritionScoreBadge(score = 88, modifier = Modifier.size(56.dp))
                }

                Spacer(modifier = Modifier.height(14.dp))
                Divider(color = HealthyBorder.copy(alpha = 0.6f))
                Spacer(modifier = Modifier.height(14.dp))

                // Trackers Grid
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    MacroNutrientCard(
                        emoji = "💧",
                        title = "Water (2.1/2.5L)",
                        value = "84%",
                        accentColor = Color(0xFF0284C7),
                        modifier = Modifier.weight(1f)
                    )
                    MacroNutrientCard(
                        emoji = "🥩",
                        title = "Protein (68/85g)",
                        value = "80%",
                        accentColor = Color(0xFF2563EB),
                        modifier = Modifier.weight(1f)
                    )
                    MacroNutrientCard(
                        emoji = "📸",
                        title = "Scans (3/4)",
                        value = "75%",
                        accentColor = HealthyEmerald,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // PRIMARY ACTION 1: Large "🍎 Food Scan" Button
        Button(
            onClick = onFoodScanClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = HealthyEmerald,
                contentColor = Color.White
            ),
            elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Text("🍎", fontSize = 28.sp)
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = strings.foodScanBtn,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 0.5.sp
                    )
                    Text(
                        text = "Instant Calories, Macros & Nutrition Score",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.White.copy(alpha = 0.9f)
                    )
                }
            }
        }

        // Secondary Action Row: Scan Medicine + Ask AI
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = onMedicineScanClick,
                modifier = Modifier
                    .weight(1f)
                    .height(54.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = HealthyGreenPrimary,
                    contentColor = Color.White
                )
            ) {
                Text("💊", fontSize = 18.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = strings.scanMedBtn,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            OutlinedButton(
                onClick = onAskAiClick,
                modifier = Modifier
                    .weight(1f)
                    .height(54.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = HealthySurface,
                    contentColor = HealthyTextPrimary
                ),
                border = ButtonDefaults.outlinedButtonBorder.copy(
                    brush = Brush.horizontalGradient(listOf(HealthyGreenPrimary, HealthyEmerald))
                )
            ) {
                Text("💬", fontSize = 18.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = strings.askAiBtn,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Quick 1-Tap Sample Testing Card
        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = HealthySurface),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, HealthyBorder, RoundedCornerShape(14.dp))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Quick Demo / Sample Scans",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = HealthyTextPrimary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Test instant food nutrition or medicine analysis with 1 tap:",
                    fontSize = 12.sp,
                    color = HealthyTextSecondary
                )
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    FilledTonalButton(
                        onClick = onSampleFoodClick,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("🍎 Paneer Tikka", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                    FilledTonalButton(
                        onClick = onSampleMedicineClick,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("💊 Dolo 650", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }

        // Founder Card
        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = HealthySurface),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, HealthyBorder, RoundedCornerShape(14.dp))
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(HealthyGreenPrimary.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("👨‍💼", fontSize = 24.sp)
                }
                Spacer(modifier = Modifier.width(14.dp))
                Column {
                    Text(
                        text = strings.founderName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = HealthyTextPrimary
                    )
                    Text(
                        text = "${strings.founderTitle}, ${strings.companyName}",
                        fontSize = 12.sp,
                        color = HealthyTextSecondary
                    )
                    Text(
                        text = "Contact: ${strings.contactNumber}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = HealthyGreenPrimary
                    )
                }
            }
        }

        // Emergency Helplines
        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF6FF)),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFFBFDBFE), RoundedCornerShape(14.dp))
        ) {
            Row(
                modifier = Modifier.padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("🚨", fontSize = 22.sp)
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "National Emergency Helplines",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = Color(0xFF1E40AF)
                    )
                    Text(
                        text = strings.emergencyHelpline,
                        fontSize = 12.sp,
                        color = Color(0xFF1D4ED8),
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        // Legal Educational Disclaimer
        Text(
            text = "⚠️ " + strings.safetyNotice,
            fontSize = 11.sp,
            color = HealthyTextSecondary,
            lineHeight = 16.sp,
            modifier = Modifier.padding(bottom = 8.dp)
        )
    }
}
