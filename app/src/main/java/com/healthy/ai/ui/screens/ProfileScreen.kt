package com.healthy.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.healthy.ai.data.model.SupportedLanguage
import com.healthy.ai.data.repository.TranslationManager
import com.healthy.ai.ui.theme.*

@Composable
fun ProfileScreen(
    currentLanguage: SupportedLanguage,
    onLanguageChange: (SupportedLanguage) -> Unit
) {
    val strings = TranslationManager.getStrings(currentLanguage)
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(HealthyBackground)
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // App Header
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = HealthySurface),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, HealthyBorder, RoundedCornerShape(16.dp))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(HealthyGreenPrimary),
                    contentAlignment = Alignment.Center
                ) {
                    Text("❤️", fontSize = 32.sp)
                }
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = strings.appName,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = HealthyTextPrimary
                )
                Text(
                    text = strings.appSubtitle,
                    fontSize = 13.sp,
                    color = HealthyTextSecondary
                )
            }
        }

        // Language Selection Section
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = HealthySurface),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, HealthyBorder, RoundedCornerShape(16.dp))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "App & AI Language",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = HealthyTextPrimary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Choose your preferred language for nutrition reports and AI answers:",
                    fontSize = 12.sp,
                    color = HealthyTextSecondary
                )
                Spacer(modifier = Modifier.height(12.dp))

                SupportedLanguage.entries.forEach { lang ->
                    val isSelected = currentLanguage == lang
                    Card(
                        onClick = { onLanguageChange(lang) },
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) HealthyGreenPrimary.copy(alpha = 0.1f) else Color.Transparent
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 2.dp)
                            .border(
                                1.dp,
                                if (isSelected) HealthyGreenPrimary else HealthyBorder.copy(alpha = 0.5f),
                                RoundedCornerShape(10.dp)
                            )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(lang.flagEmoji, fontSize = 18.sp)
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = lang.displayName,
                                        fontSize = 14.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                        color = if (isSelected) HealthyGreenPrimary else HealthyTextPrimary
                                    )
                                    Text(
                                        text = lang.nativeName,
                                        fontSize = 11.sp,
                                        color = HealthyTextSecondary
                                    )
                                }
                            }

                            RadioButton(
                                selected = isSelected,
                                onClick = { onLanguageChange(lang) },
                                colors = RadioButtonDefaults.colors(selectedColor = HealthyGreenPrimary)
                            )
                        }
                    }
                }
            }
        }

        // Founder Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = HealthySurface),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, HealthyBorder, RoundedCornerShape(16.dp))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Founder & Leadership",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = HealthyTextPrimary
                )
                Spacer(modifier = Modifier.height(10.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape)
                            .background(HealthyGreenPrimary.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("👨‍💼", fontSize = 26.sp)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = strings.founderName,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = HealthyTextPrimary
                        )
                        Text(
                            text = "${strings.founderTitle}, ${strings.companyName}",
                            fontSize = 13.sp,
                            color = HealthyTextSecondary
                        )
                        Text(
                            text = "Helpline: ${strings.contactNumber}",
                            fontSize = 13.sp,
                            color = HealthyGreenPrimary,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }

        // Privacy Policy Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = HealthySurface),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, HealthyBorder, RoundedCornerShape(16.dp))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("🔒", fontSize = 18.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Privacy Policy & Data Security",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = HealthyTextPrimary
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "• Private By Design: Your nutrition logs and scan history are saved locally on your device.\n" +
                            "• No Medical Data Sold: We do not sell or monetize your dietary or health information.\n" +
                            "• Ephemeral AI Processing: Photos captured for AI analysis are processed securely and not stored permanently on third-party servers.\n" +
                            "• Data Isolation: Family profiles and private wellness tracking remain isolated per user session.",
                    fontSize = 12.sp,
                    color = HealthyTextSecondary,
                    lineHeight = 18.sp
                )
            }
        }

        // Safety Disclaimers Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB)),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFFFDE68A), RoundedCornerShape(16.dp))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("⚠️", fontSize = 18.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Safety & Non-Medical Disclaimers",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF92400E)
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "• Wellness & Nutrition Only: VisionScan AI Health is an educational and wellness tracking tool. It does NOT diagnose illnesses, prescribe medicines, or provide clinical treatments.\n" +
                            "• Consult Healthcare Professionals: Always seek the advice of a physician or licensed dietitian before changing diet, exercise, or medications.\n" +
                            "• Child Profile Safety: Nutritional tracking for children is general and age-appropriate with zero weight-loss recommendations.\n" +
                            "• In Emergencies: Call local emergency services (112 / 108) immediately.",
                    fontSize = 12.sp,
                    color = Color(0xFF78350F),
                    lineHeight = 18.sp
                )
            }
        }

        // Google Play Store Publishing & Internal Testing Readiness Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = HealthySurface),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, HealthyBorder, RoundedCornerShape(16.dp))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("🚀", fontSize = 18.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Google Play Store Publishing Status",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = HealthyGreenPrimary
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Application: VisionScan AI Health\n" +
                            "Package: com.healthy.ai\n" +
                            "Version: 1.0.0 (Version Code 1)\n" +
                            "Target SDK: Android 36 | Min SDK: 24\n" +
                            "Status: Release Keystore Signed & Ready for Google Play Internal Testing Track",
                    fontSize = 12.sp,
                    color = HealthyTextSecondary,
                    lineHeight = 18.sp
                )
            }
        }

        // Emergency Helplines
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF6FF)),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFFBFDBFE), RoundedCornerShape(16.dp))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "🚨 National Emergency Helplines",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1E40AF)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text("• National Emergency Service: 112", fontSize = 12.sp, color = Color(0xFF1D4ED8))
                Text("• Ambulance Service: 108", fontSize = 12.sp, color = Color(0xFF1D4ED8))
                Text("• National Poison Information Centre: 1800-116-117", fontSize = 12.sp, color = Color(0xFF1D4ED8))
            }
        }
    }
}
