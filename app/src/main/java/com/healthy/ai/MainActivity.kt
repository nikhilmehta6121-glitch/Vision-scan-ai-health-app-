package com.healthy.ai

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import com.healthy.ai.ui.theme.AppIcons
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.healthy.ai.data.model.AppTab
import com.healthy.ai.data.repository.TranslationManager
import com.healthy.ai.ui.components.HealthyTopBar
import com.healthy.ai.ui.screens.*
import com.healthy.ai.ui.theme.HealthyGreenPrimary
import com.healthy.ai.ui.theme.HealthySurface
import com.healthy.ai.ui.theme.HealthyTheme
import com.healthy.ai.ui.viewmodel.HealthyViewModel

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            HealthyTheme {
                MainApp()
            }
        }
    }
}

data class NavItem(
    val tab: AppTab,
    val icon: ImageVector,
    val label: String
)

@Composable
fun MainApp(viewModel: HealthyViewModel = viewModel()) {
    val currentTab by viewModel.currentTab.collectAsState()
    val selectedLanguage by viewModel.selectedLanguage.collectAsState()
    val strings = TranslationManager.getStrings(selectedLanguage)

    // Camera permission request launcher
    var hasCameraPermission by remember { mutableStateOf(false) }
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
    }

    LaunchedEffect(Unit) {
        permissionLauncher.launch(Manifest.permission.CAMERA)
    }

    val navItems = listOf(
        NavItem(AppTab.HOME, Icons.Default.Home, strings.navHome),
        NavItem(AppTab.SCAN, AppIcons.CameraAlt, strings.navScan),
        NavItem(AppTab.CHAT, AppIcons.ChatBubble, strings.navChat),
        NavItem(AppTab.HISTORY, AppIcons.History, strings.navHistory),
        NavItem(AppTab.PROFILE, Icons.Default.Person, strings.navProfile)
    )

    Scaffold(
        topBar = {
            HealthyTopBar(
                currentLanguage = selectedLanguage,
                onLanguageChange = { viewModel.setLanguage(it) }
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = HealthySurface,
                contentColor = HealthyGreenPrimary
            ) {
                navItems.forEach { item ->
                    val selected = currentTab == item.tab
                    NavigationBarItem(
                        selected = selected,
                        onClick = { viewModel.selectTab(item.tab) },
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = HealthyGreenPrimary,
                            selectedTextColor = HealthyGreenPrimary,
                            indicatorColor = HealthyGreenPrimary.copy(alpha = 0.15f)
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentTab) {
                AppTab.HOME -> HomeScreen(
                    selectedLanguage = selectedLanguage,
                    onFoodScanClick = { viewModel.triggerFoodScanDirectly() },
                    onMedicineScanClick = { viewModel.triggerMedicineScanDirectly() },
                    onAskAiClick = { viewModel.selectTab(AppTab.CHAT) },
                    onSampleFoodClick = { viewModel.loadSampleFood() },
                    onSampleMedicineClick = { viewModel.loadSampleMedicine() }
                )
                AppTab.SCAN -> ScanScreen(
                    viewModel = viewModel,
                    onNavigateToChat = { viewModel.selectTab(AppTab.CHAT) }
                )
                AppTab.CHAT -> ChatScreen(
                    viewModel = viewModel,
                    selectedLanguage = selectedLanguage
                )
                AppTab.HISTORY -> HistoryScreen(
                    viewModel = viewModel,
                    selectedLanguage = selectedLanguage
                )
                AppTab.PROFILE -> ProfileScreen(
                    currentLanguage = selectedLanguage,
                    onLanguageChange = { viewModel.setLanguage(it) }
                )
            }
        }
    }
}
