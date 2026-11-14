package com.healthy.ai.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.filled.Warning
import com.healthy.ai.ui.theme.AppIcons
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.healthy.ai.data.model.SupportedLanguage
import com.healthy.ai.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HealthyTopBar(
    currentLanguage: SupportedLanguage,
    onLanguageChange: (SupportedLanguage) -> Unit
) {
    var showLangMenu by remember { mutableStateOf(false) }

    TopAppBar(
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(HealthyEmerald),
                    contentAlignment = Alignment.Center
                ) {
                    Text("❤️", fontSize = 18.sp)
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "VisionScan AI Health",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = Color.White
                    )
                    Text(
                        text = "Smart AI Vision & Nutrition",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White.copy(alpha = 0.85f)
                    )
                }
            }
        },
        actions = {
            Box {
                Button(
                    onClick = { showLangMenu = true },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.White.copy(alpha = 0.2f),
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(20.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Icon(
                        AppIcons.Translate,
                        contentDescription = "Change Language",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "${currentLanguage.flagEmoji} ${currentLanguage.code.uppercase()}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }

                DropdownMenu(
                    expanded = showLangMenu,
                    onDismissRequest = { showLangMenu = false }
                ) {
                    SupportedLanguage.entries.forEach { lang ->
                        DropdownMenuItem(
                            text = {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(lang.flagEmoji)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("${lang.displayName} (${lang.nativeName})")
                                }
                            },
                            onClick = {
                                onLanguageChange(lang)
                                showLangMenu = false
                            }
                        )
                    }
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = HealthyGreenPrimary
        )
    )
}

@Composable
fun NutritionScoreBadge(score: Int, modifier: Modifier = Modifier) {
    val (color, label) = when {
        score >= 80 -> Pair(HealthyEmerald, "Excellent")
        score >= 60 -> Pair(HealthyGreenPrimary, "Good")
        score >= 40 -> Pair(WarningAmber, "Moderate")
        else -> Pair(WarningRed, "Low")
    }

    Box(
        modifier = modifier
            .size(90.dp)
            .clip(CircleShape)
            .background(color.copy(alpha = 0.12f))
            .border(3.dp, color, CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "$score",
                fontSize = 26.sp,
                fontWeight = FontWeight.ExtraBold,
                color = color
            )
            Text(
                text = label,
                fontSize = 10.sp,
                fontWeight = FontWeight.SemiBold,
                color = color
            )
        }
    }
}

@Composable
fun WarningCard(warning: String) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF2F2)),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .border(1.dp, Color(0xFFFCA5A5), RoundedCornerShape(12.dp))
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.Top
        ) {
            Icon(
                imageVector = AppIcons.Warning,
                contentDescription = "Warning",
                tint = WarningRed,
                modifier = Modifier
                    .size(20.dp)
                    .padding(top = 2.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = warning,
                fontSize = 13.sp,
                color = Color(0xFF991B1B),
                lineHeight = 18.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun MacroNutrientCard(
    emoji: String,
    title: String,
    value: String,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = HealthySurface),
        shape = RoundedCornerShape(12.dp),
        modifier = modifier
            .border(1.dp, HealthyBorder, RoundedCornerShape(12.dp))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(emoji, fontSize = 20.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = accentColor,
                textAlign = TextAlign.Center
            )
            Text(
                text = title,
                fontSize = 11.sp,
                color = HealthyTextSecondary,
                textAlign = TextAlign.Center
            )
        }
    }
}
