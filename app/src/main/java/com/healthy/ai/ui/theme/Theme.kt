package com.healthy.ai.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = HealthyGreenPrimary,
    onPrimary = HealthySurface,
    primaryContainer = HealthySurfaceVariant,
    onPrimaryContainer = HealthyGreenDark,
    secondary = HealthyEmerald,
    onSecondary = HealthySurface,
    background = HealthyBackground,
    onBackground = HealthyTextPrimary,
    surface = HealthySurface,
    onSurface = HealthyTextPrimary,
    surfaceVariant = HealthySurfaceVariant,
    onSurfaceVariant = HealthyTextSecondary,
    outline = HealthyBorder
)

private val DarkColorScheme = darkColorScheme(
    primary = HealthyEmerald,
    onPrimary = HealthyBackground,
    background = HealthyTextPrimary,
    surface = Color(0xFF1E293B),
    onSurface = Color(0xFFF1F5F9)
)

@Composable
fun HealthyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = colorScheme.primary.toArgb()
                WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
