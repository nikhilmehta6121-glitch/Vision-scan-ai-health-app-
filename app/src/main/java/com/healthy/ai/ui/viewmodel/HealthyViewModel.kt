package com.healthy.ai.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.healthy.ai.data.model.*
import com.healthy.ai.data.repository.SampleDataProvider
import com.healthy.ai.data.repository.ScanRepository
import com.healthy.ai.data.service.GeminiApiService
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

sealed class ScanUiState {
    data object Idle : ScanUiState()
    data class Analyzing(val step: Int, val stepMessage: String) : ScanUiState()
    data class FoodResult(val data: FoodAnalysis, val originalData: FoodAnalysis, val imageBase64: String?) : ScanUiState()
    data class MedicineResult(val data: MedicineAnalysis, val imageBase64: String?) : ScanUiState()
    data class Error(val message: String) : ScanUiState()
}

class HealthyViewModel(
    private val repository: ScanRepository = ScanRepository(),
    private val apiService: GeminiApiService = GeminiApiService()
) : ViewModel() {

    private val _currentTab = MutableStateFlow(AppTab.HOME)
    val currentTab: StateFlow<AppTab> = _currentTab.asStateFlow()

    private val _scanMode = MutableStateFlow(ScanMode.FOOD)
    val scanMode: StateFlow<ScanMode> = _scanMode.asStateFlow()

    private val _selectedLanguage = MutableStateFlow(SupportedLanguage.EN)
    val selectedLanguage: StateFlow<SupportedLanguage> = _selectedLanguage.asStateFlow()

    private val _scanUiState = MutableStateFlow<ScanUiState>(ScanUiState.Idle)
    val scanUiState: StateFlow<ScanUiState> = _scanUiState.asStateFlow()

    val scanHistory: StateFlow<List<ScanItem>> = repository.scans
    val chatMessages: StateFlow<List<ChatMessage>> = repository.chatMessages

    private val _isChatLoading = MutableStateFlow(false)
    val isChatLoading: StateFlow<Boolean> = _isChatLoading.asStateFlow()

    private val _portionGrams = MutableStateFlow(100)
    val portionGrams: StateFlow<Int> = _portionGrams.asStateFlow()

    fun selectTab(tab: AppTab) {
        _currentTab.value = tab
    }

    fun setScanMode(mode: ScanMode) {
        _scanMode.value = mode
        if (_scanUiState.value !is ScanUiState.Analyzing) {
            _scanUiState.value = ScanUiState.Idle
        }
    }

    fun setLanguage(language: SupportedLanguage) {
        _selectedLanguage.value = language
    }

    fun triggerFoodScanDirectly() {
        _scanMode.value = ScanMode.FOOD
        _scanUiState.value = ScanUiState.Idle
        _currentTab.value = AppTab.SCAN
    }

    fun triggerMedicineScanDirectly() {
        _scanMode.value = ScanMode.HEALTH
        _scanUiState.value = ScanUiState.Idle
        _currentTab.value = AppTab.SCAN
    }

    fun loadSampleFood() {
        _scanMode.value = ScanMode.FOOD
        _portionGrams.value = SampleDataProvider.samplePaneerTikka.portionGrams
        _scanUiState.value = ScanUiState.FoodResult(
            data = SampleDataProvider.samplePaneerTikka,
            originalData = SampleDataProvider.samplePaneerTikka,
            imageBase64 = null
        )
        _currentTab.value = AppTab.SCAN
    }

    fun loadSampleMedicine() {
        _scanMode.value = ScanMode.HEALTH
        _scanUiState.value = ScanUiState.MedicineResult(
            data = SampleDataProvider.sampleDolo650,
            imageBase64 = null
        )
        _currentTab.value = AppTab.SCAN
    }

    fun processImageScan(base64Image: String, mimeType: String = "image/jpeg") {
        viewModelScope.launch {
            try {
                // Progressive 4-step analysis feedback
                _scanUiState.value = ScanUiState.Analyzing(1, "Capturing image & detecting items...")
                delay(600)
                _scanUiState.value = ScanUiState.Analyzing(2, "Evaluating visual attributes & portions...")
                delay(700)
                _scanUiState.value = ScanUiState.Analyzing(3, "Calculating nutritional breakdown & safety...")

                if (_scanMode.value == ScanMode.FOOD) {
                    val result = apiService.analyzeFood(base64Image, mimeType, _selectedLanguage.value)
                    _scanUiState.value = ScanUiState.Analyzing(4, "Finalizing nutrition report...")
                    delay(400)
                    result.onSuccess { food ->
                        _portionGrams.value = food.portionGrams
                        _scanUiState.value = ScanUiState.FoodResult(
                            data = food,
                            originalData = food,
                            imageBase64 = base64Image
                        )
                    }.onFailure { error ->
                        _scanUiState.value = ScanUiState.Error(error.message ?: "Failed to analyze food")
                    }
                } else {
                    val result = apiService.analyzeMedicine(base64Image, mimeType, _selectedLanguage.value)
                    _scanUiState.value = ScanUiState.Analyzing(4, "Generating pharmacological report...")
                    delay(400)
                    result.onSuccess { med ->
                        _scanUiState.value = ScanUiState.MedicineResult(
                            data = med,
                            imageBase64 = base64Image
                        )
                    }.onFailure { error ->
                        _scanUiState.value = ScanUiState.Error(error.message ?: "Failed to analyze medicine")
                    }
                }
            } catch (e: Exception) {
                _scanUiState.value = ScanUiState.Error(e.message ?: "Unknown scanning error occurred")
            }
        }
    }

    fun adjustPortion(newGrams: Int) {
        val current = _scanUiState.value
        if (current is ScanUiState.FoodResult) {
            _portionGrams.value = newGrams
            val base = current.originalData
            val factor = newGrams.toFloat() / base.portionGrams.coerceAtLeast(1)

            val scaledNutrition = NutritionData(
                calories = "${(parseNumeric(base.nutrition.calories) * factor).toInt()} kcal",
                protein = "${String.format("%.1f", parseNumeric(base.nutrition.protein) * factor)} g",
                carbohydrates = "${String.format("%.1f", parseNumeric(base.nutrition.carbohydrates) * factor)} g",
                fat = "${String.format("%.1f", parseNumeric(base.nutrition.fat) * factor)} g",
                fiber = "${String.format("%.1f", parseNumeric(base.nutrition.fiber) * factor)} g",
                calcium = "${(parseNumeric(base.nutrition.calcium) * factor).toInt()} mg",
                potassium = "${(parseNumeric(base.nutrition.potassium) * factor).toInt()} mg",
                iron = "${String.format("%.1f", parseNumeric(base.nutrition.iron) * factor)} mg"
            )

            val updated = base.copy(
                estimatedPortion = "$newGrams g",
                portionGrams = newGrams,
                nutrition = scaledNutrition
            )
            _scanUiState.value = current.copy(data = updated)
        }
    }

    fun saveCurrentScan() {
        when (val state = _scanUiState.value) {
            is ScanUiState.FoodResult -> {
                repository.addScan(
                    ScanItem(
                        id = UUID.randomUUID().toString(),
                        imageBase64 = state.imageBase64,
                        mode = ScanMode.FOOD,
                        foodData = state.data,
                        language = _selectedLanguage.value
                    )
                )
            }
            is ScanUiState.MedicineResult -> {
                repository.addScan(
                    ScanItem(
                        id = UUID.randomUUID().toString(),
                        imageBase64 = state.imageBase64,
                        mode = ScanMode.HEALTH,
                        medicineData = state.data,
                        language = _selectedLanguage.value
                    )
                )
            }
            else -> {}
        }
    }

    fun deleteScan(id: String) {
        repository.deleteScan(id)
    }

    fun resetScanState() {
        _scanUiState.value = ScanUiState.Idle
    }

    fun sendChatMessage(text: String) {
        if (text.isBlank()) return
        repository.addChatMessage("user", text)
        _isChatLoading.value = true

        viewModelScope.launch {
            val context = when (val state = _scanUiState.value) {
                is ScanUiState.FoodResult -> "Current food context: ${state.data.foodName}, Calories: ${state.data.nutrition.calories}, Protein: ${state.data.nutrition.protein}, Warnings: ${state.data.warnings.joinToString()}"
                is ScanUiState.MedicineResult -> "Current medicine context: ${state.data.brandName} (${state.data.genericName}), Strength: ${state.data.strength}, Common uses: ${state.data.commonUses.joinToString()}"
                else -> ""
            }

            val reply = apiService.chatWithAi(text, context, _selectedLanguage.value)
            repository.addChatMessage("assistant", reply)
            _isChatLoading.value = false
        }
    }

    private fun parseNumeric(text: String): Float {
        val numStr = text.replace(Regex("[^0-9.]"), "")
        return numStr.toFloatOrNull() ?: 0f
    }
}
