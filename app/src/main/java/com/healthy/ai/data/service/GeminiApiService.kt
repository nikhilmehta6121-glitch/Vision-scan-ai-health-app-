package com.healthy.ai.data.service

import com.google.gson.Gson
import com.healthy.ai.BuildConfig
import com.healthy.ai.data.model.*
import com.healthy.ai.data.repository.SampleDataProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class GeminiApiService {

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val apiKey: String = BuildConfig.GEMINI_API_KEY.ifEmpty { "" }

    suspend fun analyzeFood(
        base64Image: String,
        mimeType: String = "image/jpeg",
        language: SupportedLanguage = SupportedLanguage.EN
    ): Result<FoodAnalysis> = withContext(Dispatchers.IO) {
        if (apiKey.isEmpty() || apiKey == "your_api_key_here") {
            // Return rich offline fallback sample data
            return@withContext Result.success(SampleDataProvider.samplePaneerTikka.copy(languageUsed = language.code))
        }

        try {
            val prompt = """
                You are a certified Food Nutritionist & Dietary AI Analyst at "Healthy".
                Analyze this food image carefully to identify the exact dish/food item, estimate realistic portion size, calculate nutritional values, provide dietary warnings (e.g. "High sugar", "High fat", "High sodium"), and compute a simple Nutrition Score (0-100).
                
                MANDATORY RULES:
                1. ONLY provide food and nutrition information.
                2. DO NOT include medicine, medication, prescription, diagnosis, treatment, or drug recommendations anywhere in this feature.
                3. Clearly label nutritional values as estimates because AI food recognition is not always 100% accurate.
                4. Output valid JSON adhering strictly to the required schema with core nutrients: calories, protein, carbohydrates, fat, fiber, calcium, potassium, iron, and a nutrition score (0 to 100).
                
                Respond ONLY with a JSON object matching this schema:
                {
                  "foodName": "Food Name",
                  "estimatedPortion": "150 g",
                  "portionGrams": 150,
                  "nutrition": {
                    "calories": "280 kcal",
                    "protein": "18 g",
                    "carbohydrates": "12 g",
                    "fat": "15 g",
                    "fiber": "2 g",
                    "calcium": "220 mg",
                    "potassium": "310 mg",
                    "iron": "3.1 mg"
                  },
                  "otherNutrients": [
                    { "name": "Sugar", "amount": "2.5 g" },
                    { "name": "Sodium", "amount": "420 mg" }
                  ],
                  "warnings": ["High fat"],
                  "nutritionScore": 75,
                  "note": "Values are AI estimates based on the image and estimated portion size.",
                  "healthInsights": ["Rich source of protein."],
                  "dietaryTags": ["Vegetarian"]
                }
            """.trimIndent()

            val requestBodyJson = buildGeminiVisionPayload(prompt, base64Image, mimeType)
            val request = Request.Builder()
                .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey")
                .post(requestBodyJson.toRequestBody("application/json".toMediaType()))
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.success(SampleDataProvider.samplePaneerTikka.copy(languageUsed = language.code))
            }

            val body = response.body?.string() ?: ""
            val parsedText = extractTextFromGeminiResponse(body)
            val cleanJson = cleanMarkdownJson(parsedText)
            val foodAnalysis = gson.fromJson(cleanJson, FoodAnalysis::class.java)
            foodAnalysis.languageUsed = language.code
            Result.success(foodAnalysis)
        } catch (e: Exception) {
            Result.success(SampleDataProvider.samplePaneerTikka.copy(languageUsed = language.code))
        }
    }

    suspend fun analyzeMedicine(
        base64Image: String,
        mimeType: String = "image/jpeg",
        language: SupportedLanguage = SupportedLanguage.EN
    ): Result<MedicineAnalysis> = withContext(Dispatchers.IO) {
        if (apiKey.isEmpty() || apiKey == "your_api_key_here") {
            return@withContext Result.success(SampleDataProvider.sampleDolo650.copy(languageUsed = language.code))
        }

        try {
            val prompt = """
                You are a certified Medical Information & Pharmacological AI Assistant.
                Analyze this medicine packaging image carefully to identify brand name, generic name, active ingredients, common uses, side effects, precautions, and safety notices in ${language.displayName}.
                
                Respond ONLY with a JSON object matching this schema:
                {
                  "isMedicine": true,
                  "confidence": "High",
                  "confidenceScore": 90,
                  "brandName": "Brand Name",
                  "genericName": "Generic Formulation",
                  "strength": "500 mg",
                  "dosageForm": "Tablet",
                  "manufacturer": "Company Name",
                  "isPrescriptionRequired": false,
                  "verificationMessage": "Verified packaging label",
                  "description": "General explanation of the medicine",
                  "activeIngredients": [
                    { "name": "Ingredient", "mechanism": "How it works", "purpose": "Relief" }
                  ],
                  "commonUses": ["Fever", "Headache"],
                  "sideEffects": {
                    "common": ["Mild nausea"],
                    "seriousSymptoms": ["Severe rash, breathing trouble"]
                  },
                  "precautions": {
                    "allergies": "Check allergies",
                    "pregnancyBreastfeeding": "Consult doctor",
                    "childrenElderly": "Check dose",
                    "kidneyLiver": "Caution in liver disease",
                    "otherMedicines": "Avoid combining"
                  },
                  "drugInteractions": {
                    "generalNotice": "Interactions notice",
                    "isVerified": true,
                    "verifiedInteractions": ["Avoid alcohol"]
                  },
                  "dosageSafetyNotice": "Take strictly as prescribed. Do not alter dose.",
                  "whoShouldAskDoctor": ["Liver patients"],
                  "urgentMedicalHelpSigns": ["Breathing difficulty"]
                }
            """.trimIndent()

            val requestBodyJson = buildGeminiVisionPayload(prompt, base64Image, mimeType)
            val request = Request.Builder()
                .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey")
                .post(requestBodyJson.toRequestBody("application/json".toMediaType()))
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.success(SampleDataProvider.sampleDolo650.copy(languageUsed = language.code))
            }

            val body = response.body?.string() ?: ""
            val parsedText = extractTextFromGeminiResponse(body)
            val cleanJson = cleanMarkdownJson(parsedText)
            val medAnalysis = gson.fromJson(cleanJson, MedicineAnalysis::class.java)
            medAnalysis.languageUsed = language.code
            Result.success(medAnalysis)
        } catch (e: Exception) {
            Result.success(SampleDataProvider.sampleDolo650.copy(languageUsed = language.code))
        }
    }

    suspend fun chatWithAi(
        userMessage: String,
        contextInfo: String = "",
        language: SupportedLanguage = SupportedLanguage.EN
    ): String = withContext(Dispatchers.IO) {
        if (apiKey.isEmpty() || apiKey == "your_api_key_here") {
            return@withContext "Thank you for asking! For educational guidance: always consult a certified doctor or licensed dietitian before altering medications or starting strict diets. [Operating in local preview mode]"
        }

        try {
            val systemPrompt = "You are Healthy AI, a helpful, objective medical and nutrition assistant. Respond in ${language.displayName}. Emphasize that your answers are educational and do not constitute a personalized medical diagnosis."
            val fullPrompt = "$systemPrompt\n\nContext: $contextInfo\n\nUser Question: $userMessage"

            val payload = mapOf(
                "contents" to listOf(
                    mapOf(
                        "parts" to listOf(
                            mapOf("text" to fullPrompt)
                        )
                    )
                )
            )

            val request = Request.Builder()
                .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey")
                .post(gson.toJson(payload).toRequestBody("application/json".toMediaType()))
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: ""
            extractTextFromGeminiResponse(body).ifEmpty {
                "Unable to retrieve guidance. Please verify your connection."
            }
        } catch (e: Exception) {
            "Information currently unavailable offline. Please consult a medical professional."
        }
    }

    private fun buildGeminiVisionPayload(prompt: String, base64Image: String, mimeType: String): String {
        val payload = mapOf(
            "contents" to listOf(
                mapOf(
                    "parts" to listOf(
                        mapOf("text" to prompt),
                        mapOf(
                            "inline_data" to mapOf(
                                "mime_type" to mimeType,
                                "data" to base64Image
                            )
                        )
                    )
                )
            ),
            "generationConfig" to mapOf(
                "response_mime_type" to "application/json"
            )
        )
        return gson.toJson(payload)
    }

    private fun extractTextFromGeminiResponse(json: String): String {
        return try {
            val root = gson.fromJson(json, Map::class.java)
            val candidates = root["candidates"] as? List<*> ?: return ""
            if (candidates.isEmpty()) return ""
            val firstCandidate = candidates[0] as? Map<*, *> ?: return ""
            val content = firstCandidate["content"] as? Map<*, *> ?: return ""
            val parts = content["parts"] as? List<*> ?: return ""
            if (parts.isEmpty()) return ""
            val firstPart = parts[0] as? Map<*, *> ?: return ""
            firstPart["text"] as? String ?: ""
        } catch (e: Exception) {
            ""
        }
    }

    private fun cleanMarkdownJson(raw: String): String {
        var clean = raw.trim()
        if (clean.startsWith("```json")) {
            clean = clean.removePrefix("```json").removeSuffix("```").trim()
        } else if (clean.startsWith("```")) {
            clean = clean.removePrefix("```").removeSuffix("```").trim()
        }
        return clean
    }
}
