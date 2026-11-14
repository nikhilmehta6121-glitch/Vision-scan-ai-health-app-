package com.healthy.ai.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import com.healthy.ai.ui.theme.AppIcons
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.healthy.ai.data.model.*
import com.healthy.ai.data.repository.TranslationManager
import com.healthy.ai.ui.components.*
import com.healthy.ai.ui.theme.*
import com.healthy.ai.ui.viewmodel.HealthyViewModel
import com.healthy.ai.ui.viewmodel.ScanUiState
import java.io.ByteArrayOutputStream

@Composable
fun ScanScreen(
    viewModel: HealthyViewModel,
    onNavigateToChat: () -> Unit
) {
    val context = LocalContext.current
    val scanMode by viewModel.scanMode.collectAsState()
    val scanUiState by viewModel.scanUiState.collectAsState()
    val selectedLanguage by viewModel.selectedLanguage.collectAsState()
    val portionGrams by viewModel.portionGrams.collectAsState()
    val strings = TranslationManager.getStrings(selectedLanguage)

    // Gallery Picker launcher
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            try {
                val inputStream = context.contentResolver.openInputStream(it)
                val bitmap = BitmapFactory.decodeStream(inputStream)
                val outputStream = ByteArrayOutputStream()
                bitmap.compress(Bitmap.CompressFormat.JPEG, 80, outputStream)
                val base64 = Base64.encodeToString(outputStream.toByteArray(), Base64.NO_WRAP)
                viewModel.processImageScan(base64, "image/jpeg")
            } catch (e: Exception) {
                Toast.makeText(context, "Failed to load image: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // Camera launcher
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap: Bitmap? ->
        bitmap?.let {
            try {
                val outputStream = ByteArrayOutputStream()
                it.compress(Bitmap.CompressFormat.JPEG, 80, outputStream)
                val base64 = Base64.encodeToString(outputStream.toByteArray(), Base64.NO_WRAP)
                viewModel.processImageScan(base64, "image/jpeg")
            } catch (e: Exception) {
                Toast.makeText(context, "Camera error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(HealthyBackground)
    ) {
        // Mode Selector Tabs (Food Scan, Medicine, Prescription, etc.)
        ScrollableTabRow(
            selectedTabIndex = ScanMode.entries.indexOf(scanMode),
            edgePadding = 16.dp,
            containerColor = HealthySurface,
            contentColor = HealthyGreenPrimary,
            modifier = Modifier.fillMaxWidth()
        ) {
            ScanMode.entries.forEach { mode ->
                Tab(
                    selected = scanMode == mode,
                    onClick = { viewModel.setScanMode(mode) },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(mode.icon, fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = mode.label,
                                fontWeight = if (scanMode == mode) FontWeight.Bold else FontWeight.Normal,
                                color = if (scanMode == mode) HealthyGreenPrimary else HealthyTextSecondary
                            )
                        }
                    }
                )
            }
        }

        // Screen Body based on ScanUiState
        Box(
            modifier = Modifier
                .fillMaxSize()
                .weight(1f)
        ) {
            when (val state = scanUiState) {
                is ScanUiState.Idle -> {
                    ScanIdleCaptureView(
                        scanMode = scanMode,
                        onOpenCamera = { cameraLauncher.launch(null) },
                        onPickGallery = { galleryLauncher.launch("image/*") },
                        onLoadSample = {
                            if (scanMode == ScanMode.FOOD) viewModel.loadSampleFood()
                            else viewModel.loadSampleMedicine()
                        }
                    )
                }
                is ScanUiState.Analyzing -> {
                    ScanAnalyzingView(
                        step = state.step,
                        message = state.stepMessage
                    )
                }
                is ScanUiState.FoodResult -> {
                    FoodResultView(
                        food = state.data,
                        portionGrams = portionGrams,
                        onPortionChange = { viewModel.adjustPortion(it) },
                        onSave = {
                            viewModel.saveCurrentScan()
                            Toast.makeText(context, strings.savedToast, Toast.LENGTH_SHORT).show()
                        },
                        onShare = {
                            val text = buildFoodShareText(state.data)
                            val sendIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, text)
                                type = "text/plain"
                            }
                            context.startActivity(Intent.createChooser(sendIntent, "Share Nutrition Report"))
                        },
                        onCopy = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            val clip = ClipData.newPlainText("Nutrition Report", buildFoodShareText(state.data))
                            clipboard.setPrimaryClip(clip)
                            Toast.makeText(context, "Copied to clipboard!", Toast.LENGTH_SHORT).show()
                        },
                        onScanAnother = { viewModel.resetScanState() },
                        onAskAi = onNavigateToChat
                    )
                }
                is ScanUiState.MedicineResult -> {
                    MedicineResultView(
                        medicine = state.data,
                        onSave = {
                            viewModel.saveCurrentScan()
                            Toast.makeText(context, strings.savedToast, Toast.LENGTH_SHORT).show()
                        },
                        onShare = {
                            val text = buildMedicineShareText(state.data)
                            val sendIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, text)
                                type = "text/plain"
                            }
                            context.startActivity(Intent.createChooser(sendIntent, "Share Medicine Info"))
                        },
                        onCopy = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            val clip = ClipData.newPlainText("Medicine Info", buildMedicineShareText(state.data))
                            clipboard.setPrimaryClip(clip)
                            Toast.makeText(context, "Copied to clipboard!", Toast.LENGTH_SHORT).show()
                        },
                        onScanAnother = { viewModel.resetScanState() },
                        onAskAi = onNavigateToChat
                    )
                }
                is ScanUiState.Error -> {
                    ScanErrorView(
                        errorMessage = state.message,
                        onRetry = { viewModel.resetScanState() }
                    )
                }
            }
        }
    }
}

@Composable
fun ScanIdleCaptureView(
    scanMode: ScanMode,
    onOpenCamera: () -> Unit,
    onPickGallery: () -> Unit,
    onLoadSample: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(100.dp)
                .clip(CircleShape)
                .background(HealthyGreenPrimary.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center
        ) {
            Text(scanMode.icon, fontSize = 48.sp)
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = if (scanMode == ScanMode.FOOD) "Food & Nutrition Scanner" else "Medicine Safety Scanner",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = HealthyTextPrimary
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = if (scanMode == ScanMode.FOOD)
                "Take or upload a photo of your meal to calculate calories, macronutrients, and nutrition score."
            else
                "Scan any medicine strip, bottle, or prescription to view verified formulation and safety checks.",
            fontSize = 13.sp,
            color = HealthyTextSecondary,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(28.dp))

        // Open Camera button
        Button(
            onClick = onOpenCamera,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = HealthyGreenPrimary,
                contentColor = Color.White
            )
        ) {
            Icon(AppIcons.CameraAlt, contentDescription = "Camera")
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = if (scanMode == ScanMode.FOOD) "Take Food Photo" else "Take Photo with Camera",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Gallery upload button
        OutlinedButton(
            onClick = onPickGallery,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.outlinedButtonColors(
                containerColor = HealthySurface,
                contentColor = HealthyGreenPrimary
            ),
            border = BorderStroke(1.5.dp, HealthyGreenPrimary)
        ) {
            Icon(AppIcons.PhotoLibrary, contentDescription = "Gallery")
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = if (scanMode == ScanMode.FOOD) "Upload Food Photo from Gallery" else "Upload from Gallery",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Demo sample button
        TextButton(onClick = onLoadSample) {
            Text(
                text = if (scanMode == ScanMode.FOOD) "✨ Or load sample: Paneer Tikka" else "✨ Or load sample: Dolo 650",
                color = HealthyAccent,
                fontWeight = FontWeight.SemiBold,
                fontSize = 13.sp
            )
        }
    }
}

@Composable
fun ScanAnalyzingView(step: Int, message: String) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        CircularProgressIndicator(
            modifier = Modifier.size(60.dp),
            color = HealthyGreenPrimary,
            strokeWidth = 5.dp
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Analyzing with AI...",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = HealthyTextPrimary
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Step $step of 4",
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = HealthyGreenPrimary
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = message,
            fontSize = 14.sp,
            color = HealthyTextSecondary,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(20.dp))

        LinearProgressIndicator(
            progress = { step / 4f },
            modifier = Modifier
                .fillMaxWidth(0.7f)
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp)),
            color = HealthyGreenPrimary,
            trackColor = HealthyBorder
        )
    }
}

@Composable
fun FoodResultView(
    food: FoodAnalysis,
    portionGrams: Int,
    onPortionChange: (Int) -> Unit,
    onSave: () -> Unit,
    onShare: () -> Unit,
    onCopy: () -> Unit,
    onScanAnother: () -> Unit,
    onAskAi: () -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Top Header: Food Name & Score
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = HealthySurface),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, HealthyBorder, RoundedCornerShape(16.dp))
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("🍎", fontSize = 16.sp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "NUTRITION REPORT",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = HealthyGreenPrimary,
                            letterSpacing = 1.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = food.foodName,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = HealthyTextPrimary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Portion: ${food.estimatedPortion}",
                        fontSize = 13.sp,
                        color = HealthyTextSecondary
                    )
                }

                NutritionScoreBadge(score = food.nutritionScore)
            }
        }

        // Dietary Warnings (e.g., "High fat", "High sugar")
        if (food.warnings.isNotEmpty()) {
            Column {
                food.warnings.forEach { warning ->
                    WarningCard(warning = warning)
                }
            }
        }

        // Portion Adjuster (Interactive 50g to 300g)
        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = HealthySurface),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, HealthyBorder, RoundedCornerShape(14.dp))
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Adjust Portion Size",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = HealthyTextPrimary
                    )
                    Text(
                        text = "$portionGrams grams",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = HealthyGreenPrimary
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(listOf(50, 100, 150, 200, 250, 300)) { grams ->
                        FilterChip(
                            selected = portionGrams == grams,
                            onClick = { onPortionChange(grams) },
                            label = { Text("${grams}g", fontSize = 12.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = HealthyGreenPrimary,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }
            }
        }

        // Macro Nutrition Grid (Calories, Protein, Carbohydrates, Fat)
        Text(
            text = "Core Macronutrients",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = HealthyTextPrimary
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MacroNutrientCard(
                emoji = "🔥",
                title = "Calories",
                value = food.nutrition.calories,
                accentColor = Color(0xFFE11D48),
                modifier = Modifier.weight(1f)
            )
            MacroNutrientCard(
                emoji = "💪",
                title = "Protein",
                value = food.nutrition.protein,
                accentColor = Color(0xFF2563EB),
                modifier = Modifier.weight(1f)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MacroNutrientCard(
                emoji = "🌾",
                title = "Carbs",
                value = food.nutrition.carbohydrates,
                accentColor = Color(0xFFD97706),
                modifier = Modifier.weight(1f)
            )
            MacroNutrientCard(
                emoji = "🥑",
                title = "Fat",
                value = food.nutrition.fat,
                accentColor = Color(0xFF059669),
                modifier = Modifier.weight(1f)
            )
        }

        // Micronutrients & Essential Minerals (Calcium, Potassium, Fiber, Iron)
        Text(
            text = "Vitamins, Minerals & Fiber",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = HealthyTextPrimary
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MacroNutrientCard(
                emoji = "🥦",
                title = "Fiber",
                value = food.nutrition.fiber,
                accentColor = HealthyEmerald,
                modifier = Modifier.weight(1f)
            )
            MacroNutrientCard(
                emoji = "🦴",
                title = "Calcium",
                value = food.nutrition.calcium,
                accentColor = Color(0xFF7C3AED),
                modifier = Modifier.weight(1f)
            )
            MacroNutrientCard(
                emoji = "🍌",
                title = "Potassium",
                value = food.nutrition.potassium,
                accentColor = Color(0xFF0284C7),
                modifier = Modifier.weight(1f)
            )
            MacroNutrientCard(
                emoji = "🩸",
                title = "Iron",
                value = food.nutrition.iron,
                accentColor = Color(0xFFDC2626),
                modifier = Modifier.weight(1f)
            )
        }

        // Other Available Nutrients
        if (food.otherNutrients.isNotEmpty()) {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = HealthySurface),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, HealthyBorder, RoundedCornerShape(14.dp))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "Other Nutritional Breakdown",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = HealthyTextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    food.otherNutrients.forEach { nut ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(nut.name, fontSize = 13.sp, color = HealthyTextSecondary)
                            Text(nut.amount, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = HealthyTextPrimary)
                        }
                        Divider(color = HealthyBorder.copy(alpha = 0.5f))
                    }
                }
            }
        }

        // Dietary Insights
        if (food.healthInsights.isNotEmpty()) {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF4)),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFFBBF7D0), RoundedCornerShape(14.dp))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "🥗 Dietary & Health Insights",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF166534)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    food.healthInsights.forEach { insight ->
                        Row(modifier = Modifier.padding(vertical = 2.dp)) {
                            Text("•", color = Color(0xFF166534), fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(insight, fontSize = 12.sp, color = Color(0xFF14532D), lineHeight = 18.sp)
                        }
                    }
                }
            }
        }

        // AI ESTIMATE DISCLAIMER (Requirement 9)
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB)),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFFFDE68A), RoundedCornerShape(12.dp))
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.Top
            ) {
                Text("ℹ️", fontSize = 16.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Estimated Values: Nutritional information is estimated by AI analysis of the photo and standard portion models. Real dietary content may vary based on exact cooking preparation and recipe ingredients.",
                    fontSize = 11.sp,
                    color = Color(0xFF92400E),
                    lineHeight = 16.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        // Action Buttons Row (Save, Copy, Share, Scan Another)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = onCopy,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(AppIcons.ContentCopy, contentDescription = "Copy", modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Copy", fontSize = 12.sp)
            }

            OutlinedButton(
                onClick = onShare,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Default.Share, contentDescription = "Share", modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Share", fontSize = 12.sp)
            }

            Button(
                onClick = onSave,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = HealthyGreenPrimary)
            ) {
                Icon(AppIcons.Bookmark, contentDescription = "Save", modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Save", fontSize = 12.sp)
            }
        }

        // Scan Another & Ask AI Buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            FilledTonalButton(
                onClick = onScanAnother,
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Scan Another", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            }

            Button(
                onClick = onAskAi,
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = HealthyEmerald)
            ) {
                Text("Ask AI about this", fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun MedicineResultView(
    medicine: MedicineAnalysis,
    onSave: () -> Unit,
    onShare: () -> Unit,
    onCopy: () -> Unit,
    onScanAnother: () -> Unit,
    onAskAi: () -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Medicine Header Card
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
                    Text(
                        text = "MEDICINE VERIFICATION",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = HealthyGreenPrimary,
                        letterSpacing = 1.sp
                    )
                    SuggestionChip(
                        onClick = {},
                        label = { Text(medicine.confidence, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                        colors = SuggestionChipDefaults.suggestionChipColors(
                            containerColor = HealthyEmerald.copy(alpha = 0.15f),
                            labelColor = HealthyGreenDark
                        )
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = medicine.brandName.ifEmpty { "Medicine Identified" },
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = HealthyTextPrimary
                )

                Text(
                    text = medicine.genericName,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = HealthyTextSecondary
                )

                if (medicine.strength.isNotEmpty() || medicine.dosageForm.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${medicine.strength} • ${medicine.dosageForm} • ${medicine.manufacturer}",
                        fontSize = 12.sp,
                        color = HealthyTextSecondary
                    )
                }
            }
        }

        // Active Ingredients
        if (medicine.activeIngredients.isNotEmpty()) {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = HealthySurface),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, HealthyBorder, RoundedCornerShape(14.dp))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("Active Pharmaceutical Ingredients", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    medicine.activeIngredients.forEach { ing ->
                        Text("• ${ing.name}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = HealthyGreenPrimary)
                        Text(ing.mechanism, fontSize = 12.sp, color = HealthyTextSecondary)
                        Spacer(modifier = Modifier.height(4.dp))
                    }
                }
            }
        }

        // Common Uses
        if (medicine.commonUses.isNotEmpty()) {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = HealthySurface),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, HealthyBorder, RoundedCornerShape(14.dp))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("Common Therapeutic Indications", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(6.dp))
                    medicine.commonUses.forEach { use ->
                        Text("✔ $use", fontSize = 13.sp, color = HealthyTextPrimary)
                    }
                }
            }
        }

        // Dosage Safety Notice
        if (medicine.dosageSafetyNotice.isNotEmpty()) {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF2F2)),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFFFECACA), RoundedCornerShape(12.dp))
            ) {
                Row(modifier = Modifier.padding(12.dp)) {
                    Text("⚠️", fontSize = 16.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = medicine.dosageSafetyNotice,
                        fontSize = 12.sp,
                        color = Color(0xFF991B1B),
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        // Action Buttons Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(onClick = onCopy, modifier = Modifier.weight(1f)) {
                Text("Copy", fontSize = 12.sp)
            }
            OutlinedButton(onClick = onShare, modifier = Modifier.weight(1f)) {
                Text("Share", fontSize = 12.sp)
            }
            Button(
                onClick = onSave,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = HealthyGreenPrimary)
            ) {
                Text("Save", fontSize = 12.sp)
            }
        }

        // Scan Another / Ask AI
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            FilledTonalButton(onClick = onScanAnother, modifier = Modifier.weight(1f).height(48.dp)) {
                Text("Scan Another", fontSize = 13.sp)
            }
            Button(
                onClick = onAskAi,
                modifier = Modifier.weight(1f).height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = HealthyGreenPrimary)
            ) {
                Text("Ask AI", fontSize = 13.sp)
            }
        }
    }
}

@Composable
fun ScanErrorView(errorMessage: String, onRetry: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("⚠️", fontSize = 48.sp)
        Spacer(modifier = Modifier.height(16.dp))
        Text("Scan Failed", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = HealthyTextPrimary)
        Spacer(modifier = Modifier.height(6.dp))
        Text(errorMessage, fontSize = 13.sp, color = HealthyTextSecondary, textAlign = TextAlign.Center)
        Spacer(modifier = Modifier.height(20.dp))
        Button(onClick = onRetry, colors = ButtonDefaults.buttonColors(containerColor = HealthyGreenPrimary)) {
            Text("Try Again")
        }
    }
}

fun buildFoodShareText(food: FoodAnalysis): String {
    return """
        🍎 Nutrition Report: ${food.foodName} (${food.estimatedPortion})
        • Nutrition Score: ${food.nutritionScore}/100
        • Calories: ${food.nutrition.calories}
        • Protein: ${food.nutrition.protein}
        • Carbs: ${food.nutrition.carbohydrates}
        • Fat: ${food.nutrition.fat}
        • Fiber: ${food.nutrition.fiber}
        • Calcium: ${food.nutrition.calcium}
        • Potassium: ${food.nutrition.potassium}
        
        Note: Nutritional values are AI estimates based on image recognition.
        Scanned via Healthy - AI Health & Nutrition Assistant
    """.trimIndent()
}

fun buildMedicineShareText(medicine: MedicineAnalysis): String {
    return """
        💊 Medicine Information: ${medicine.brandName}
        • Generic Formulation: ${medicine.genericName}
        • Strength: ${medicine.strength}
        • Active Ingredients: ${medicine.activeIngredients.joinToString { it.name }}
        • Common Uses: ${medicine.commonUses.joinToString()}
        • Safety: ${medicine.dosageSafetyNotice}
        
        Educational information only. Consult a doctor.
        Scanned via Healthy - AI Health & Medicine Assistant
    """.trimIndent()
}
