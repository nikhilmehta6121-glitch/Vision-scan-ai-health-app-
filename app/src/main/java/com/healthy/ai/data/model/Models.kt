package com.healthy.ai.data.model

import com.google.gson.annotations.SerializedName

enum class SupportedLanguage(
    val code: String,
    val displayName: String,
    val nativeName: String,
    val speechCode: String,
    val flagEmoji: String
) {
    EN("en", "English", "English", "en-US", "🇬🇧"),
    HI("hi", "Hindi", "हिंदी", "hi-IN", "🇮🇳"),
    HINGLISH("hinglish", "Hinglish", "Hinglish", "hi-IN", "🇮🇳"),
    MR("mr", "Marathi", "मराठी", "mr-IN", "🇮🇳"),
    GU("gu", "Gujarati", "ગુજરાતી", "gu-IN", "🇮🇳"),
    PA("pa", "Punjabi", "ਪੰਜਾਬੀ", "pa-IN", "🇮🇳"),
    BN("bn", "Bengali", "বাংলা", "bn-IN", "🇮🇳"),
    TA("ta", "Tamil", "தமிழ்", "ta-IN", "🇮🇳"),
    TE("te", "Telugu", "తెలుగు", "te-IN", "🇮🇳"),
    KN("kn", "Kannada", "ಕನ್ನಡ", "kn-IN", "🇮🇳"),
    ML("ml", "Malayalam", "മലയാളം", "ml-IN", "🇮🇳");

    companion object {
        fun fromCode(code: String): SupportedLanguage {
            return entries.find { it.code.equals(code, ignoreCase = true) } ?: EN
        }
    }
}

enum class ScanMode(val id: String, val label: String, val icon: String) {
    FOOD("food", "Food Scan", "🍎"),
    HEALTH("health", "Medicine", "💊"),
    OCR("ocr", "Prescription", "📄"),
    OBJECTS("objects", "Pill ID", "🔍"),
    DESCRIBE("describe", "Vision Assist", "👁️")
}

enum class AppTab(val route: String, val label: String) {
    HOME("home", "Home"),
    SCAN("scan", "Scan"),
    CHAT("chat", "AI Chat"),
    HISTORY("history", "History"),
    PROFILE("profile", "Profile")
}

data class NutritionData(
    @SerializedName("calories") val calories: String = "0 kcal",
    @SerializedName("protein") val protein: String = "0 g",
    @SerializedName("carbohydrates") val carbohydrates: String = "0 g",
    @SerializedName("fat") val fat: String = "0 g",
    @SerializedName("fiber") val fiber: String = "0 g",
    @SerializedName("calcium") val calcium: String = "0 mg",
    @SerializedName("potassium") val potassium: String = "0 mg",
    @SerializedName("iron") val iron: String = "0 mg"
)

data class OtherNutrient(
    @SerializedName("name") val name: String,
    @SerializedName("amount") val amount: String
)

data class FoodAnalysis(
    @SerializedName("foodName") val foodName: String = "",
    @SerializedName("estimatedPortion") val estimatedPortion: String = "100 g",
    @SerializedName("portionGrams") val portionGrams: Int = 100,
    @SerializedName("nutrition") val nutrition: NutritionData = NutritionData(),
    @SerializedName("otherNutrients") val otherNutrients: List<OtherNutrient> = emptyList(),
    @SerializedName("warnings") val warnings: List<String> = emptyList(),
    @SerializedName("nutritionScore") val nutritionScore: Int = 75,
    @SerializedName("note") val note: String = "Values are AI estimates based on the image and estimated portion size.",
    @SerializedName("healthInsights") val healthInsights: List<String> = emptyList(),
    @SerializedName("dietaryTags") val dietaryTags: List<String> = emptyList(),
    @SerializedName("languageUsed") var languageUsed: String = "en"
)

data class ActiveIngredient(
    @SerializedName("name") val name: String = "",
    @SerializedName("mechanism") val mechanism: String = "",
    @SerializedName("purpose") val purpose: String? = null
)

data class SideEffectsData(
    @SerializedName("common") val common: List<String> = emptyList(),
    @SerializedName("seriousSymptoms") val seriousSymptoms: List<String> = emptyList()
)

data class PrecautionsData(
    @SerializedName("allergies") val allergies: String = "",
    @SerializedName("pregnancyBreastfeeding") val pregnancyBreastfeeding: String = "",
    @SerializedName("childrenElderly") val childrenElderly: String = "",
    @SerializedName("kidneyLiver") val kidneyLiver: String = "",
    @SerializedName("otherMedicines") val otherMedicines: String = ""
)

data class DrugInteractionsData(
    @SerializedName("generalNotice") val generalNotice: String = "",
    @SerializedName("isVerified") val isVerified: Boolean = false,
    @SerializedName("verifiedInteractions") val verifiedInteractions: List<String> = emptyList(),
    @SerializedName("unverifiedNotice") val unverifiedNotice: String? = null
)

data class MedicineAnalysis(
    @SerializedName("isMedicine") val isMedicine: Boolean = true,
    @SerializedName("confidence") val confidence: String = "High",
    @SerializedName("confidenceScore") val confidenceScore: Int = 90,
    @SerializedName("brandName") val brandName: String = "",
    @SerializedName("genericName") val genericName: String = "",
    @SerializedName("strength") val strength: String = "",
    @SerializedName("dosageForm") val dosageForm: String = "",
    @SerializedName("manufacturer") val manufacturer: String = "",
    @SerializedName("isPrescriptionRequired") val isPrescriptionRequired: Boolean? = false,
    @SerializedName("verificationMessage") val verificationMessage: String = "",
    @SerializedName("description") val description: String = "",
    @SerializedName("activeIngredients") val activeIngredients: List<ActiveIngredient> = emptyList(),
    @SerializedName("commonUses") val commonUses: List<String> = emptyList(),
    @SerializedName("sideEffects") val sideEffects: SideEffectsData = SideEffectsData(),
    @SerializedName("precautions") val precautions: PrecautionsData = PrecautionsData(),
    @SerializedName("drugInteractions") val drugInteractions: DrugInteractionsData = DrugInteractionsData(),
    @SerializedName("dosageSafetyNotice") val dosageSafetyNotice: String = "",
    @SerializedName("whoShouldAskDoctor") val whoShouldAskDoctor: List<String> = emptyList(),
    @SerializedName("urgentMedicalHelpSigns") val urgentMedicalHelpSigns: List<String> = emptyList(),
    @SerializedName("uncertaintyReason") val uncertaintyReason: String? = null,
    @SerializedName("rawOcrText") val rawOcrText: String? = null,
    @SerializedName("languageUsed") var languageUsed: String = "en"
)

data class ScanItem(
    val id: String,
    val imageBase64: String? = null,
    val mode: ScanMode,
    val medicineData: MedicineAnalysis? = null,
    val foodData: FoodAnalysis? = null,
    val textResult: String? = null,
    val timestamp: Long = System.currentTimeMillis(),
    val language: SupportedLanguage = SupportedLanguage.EN
)

data class ChatMessage(
    val id: String,
    val role: String, // "user" or "assistant"
    val content: String,
    val timestamp: Long = System.currentTimeMillis()
)
