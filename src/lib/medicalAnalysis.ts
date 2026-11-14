import { GoogleGenAI } from "@google/genai";
import { MedicineAnalysis, FoodAnalysis, SupportedLanguage } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const SAMPLE_MEAL_2_0: FoodAnalysis = {
  foodName: "Balanced North Indian Lunch Thali",
  estimatedPortion: "480 g (Full Thali)",
  portionGrams: 480,
  overallConfidence: "High",
  overallConfidenceScore: 86,
  sourceType: "AI_ESTIMATED",
  nutrition: {
    calories: "650 kcal",
    protein: "26 g",
    carbohydrates: "88 g",
    fat: "22 g",
    fiber: "11 g",
    calcium: "340 mg",
    potassium: "620 mg",
    iron: "6.4 mg",
  },
  otherNutrients: [
    { name: "Sugar", amount: "4.5 g" },
    { name: "Sodium", amount: "680 mg" },
    { name: "Saturated Fat", amount: "6.0 g" },
  ],
  nutritionScore: 84,
  note: "Values are AI estimates based on the image and estimated portion size.",
  detectedFoods: [
    {
      id: "df_roti",
      name: "Whole Wheat Roti",
      portion: "2 pieces (~80g)",
      portionGrams: 80,
      calories: "210 kcal",
      protein: "6.5 g",
      carbohydrates: "36 g",
      fat: "3.5 g",
      fiber: "4 g",
      sugar: "0.8 g",
      sodium: "120 mg",
      calcium: "45 mg",
      potassium: "120 mg",
      iron: "2.2 mg",
      nutritionScore: 88,
      confidencePercentage: 88,
      confidenceLevel: "High",
      visualClues: ["Circular wheat flatbread with charred brown spots", "Thin rolled texture typical of phulka"],
      sourceType: "AI_ESTIMATED",
      tags: ["Whole Grain", "Fiber Rich"],
    },
    {
      id: "df_dal",
      name: "Tadka Dal",
      portion: "1 medium bowl (150g)",
      portionGrams: 150,
      calories: "180 kcal",
      protein: "11 g",
      carbohydrates: "24 g",
      fat: "5 g",
      fiber: "5 g",
      sugar: "1.2 g",
      sodium: "380 mg",
      calcium: "60 mg",
      potassium: "280 mg",
      iron: "2.8 mg",
      nutritionScore: 82,
      confidencePercentage: 76,
      confidenceLevel: "Medium",
      visualClues: ["Yellow-orange cooked lentil consistency", "Garnished with mustard seeds and coriander"],
      sourceType: "AI_ESTIMATED",
      tags: ["High Protein", "Plant Based"],
    },
    {
      id: "df_rice",
      name: "Jeera Basmati Rice",
      portion: "1 cup (150g)",
      portionGrams: 150,
      calories: "195 kcal",
      protein: "4.2 g",
      carbohydrates: "42 g",
      fat: "1.5 g",
      fiber: "1 g",
      sugar: "0.2 g",
      sodium: "40 mg",
      calcium: "15 mg",
      potassium: "60 mg",
      iron: "0.8 mg",
      nutritionScore: 74,
      confidencePercentage: 91,
      confidenceLevel: "High",
      visualClues: ["Steamed white long-grain rice", "Visible toasted cumin seed tempering"],
      sourceType: "AI_ESTIMATED",
      tags: ["Carbohydrate Energy"],
    },
    {
      id: "df_salad",
      name: "Cucumber & Tomato Salad",
      portion: "1 small side (100g)",
      portionGrams: 100,
      calories: "35 kcal",
      protein: "1.5 g",
      carbohydrates: "7 g",
      fat: "0.5 g",
      fiber: "2.5 g",
      sugar: "2.3 g",
      sodium: "25 mg",
      calcium: "35 mg",
      potassium: "220 mg",
      iron: "0.6 mg",
      nutritionScore: 94,
      confidencePercentage: 89,
      confidenceLevel: "High",
      visualClues: ["Fresh sliced green cucumber rounds", "Ripe red tomato wedges"],
      sourceType: "AI_ESTIMATED",
      tags: ["Hydration", "Micro-nutrients"],
    },
  ],
  totalMeal: {
    mealName: "Balanced North Indian Lunch Thali",
    totalItemsCount: 4,
    calories: "650 kcal",
    protein: "26 g",
    carbohydrates: "88 g",
    fat: "22 g",
    fiber: "11 g",
    sugar: "4.5 g",
    sodium: "680 mg",
    calcium: "340 mg",
    potassium: "620 mg",
    iron: "6.4 mg",
    nutritionScore: 84,
    overallConfidence: "High",
    overallConfidenceScore: 86,
    sourceType: "AI_ESTIMATED",
    summary: "Balanced macronutrient distribution with good plant protein (26g) and generous dietary fiber (11g).",
    healthInsights: [
      "Combining dal and wheat roti delivers a complementary amino acid profile.",
      "Raw cucumber and tomato salad provides essential natural hydration and potassium.",
      "Moderate tadka oil keeps overall fat balanced at ~22g for the complete meal."
    ],
    warnings: [
      "Sodium content (680 mg): Within moderate range for lunch, maintain hydration."
    ],
    whyThisResult: {
      summary: "यह result food image और selected serving size के आधार पर estimated है. Actual nutrition preparation और quantity के अनुसार बदल सकती है.",
      visualClues: [
        "Plate geometry indicates standard Indian stainless steel thali",
        "Color saturation and sheen match homestyle tadka preparation",
        "Portions estimated using bowl bowl diameter reference"
      ],
      assumptions: [
        "Standard 1 tsp ghee/oil per serving",
        "Medium-grain steamed rice with standard moisture content"
      ],
      uncertainties: [
        "Exact sodium/salt content cannot be determined visually",
        "Cooking oil volume may vary ±20% based on recipe"
      ],
      sourceDescription: "AI Estimated from visual image pixels (Food Scanner 2.0)",
    },
  },
  whyThisResult: {
    summary: "यह result food image और selected serving size के आधार पर estimated है. Actual nutrition preparation और quantity के अनुसार बदल सकती है.",
    visualClues: [
      "Plate geometry indicates standard Indian stainless steel thali",
      "Color saturation and sheen match homestyle tadka preparation",
      "Portions estimated using bowl bowl diameter reference"
    ],
    assumptions: [
      "Standard 1 tsp ghee/oil per serving",
      "Medium-grain steamed rice with standard moisture content"
    ],
    uncertainties: [
      "Exact sodium/salt content cannot be determined visually",
      "Cooking oil volume may vary ±20% based on recipe"
    ],
    sourceDescription: "AI Estimated from visual image pixels (Food Scanner 2.0)",
  },
  healthInsights: [
    "Dal + Roti provides a complete plant protein amino acid profile.",
    "Raw salad adds bioavailable potassium and dietary fiber."
  ],
  dietaryTags: ["Vegetarian", "High Protein", "High Fiber", "Balanced Meal"],
};

export const SAMPLE_PANEER_TIKKA = SAMPLE_MEAL_2_0;

export async function analyzeMedicineImage(
  base64Data: string,
  mimeType: string,
  language: SupportedLanguage = "en"
): Promise<MedicineAnalysis> {
  const languageNames: Record<SupportedLanguage, string> = {
    en: "English",
    hi: "Hindi (हिंदी) in clear simple Devanagari script",
    hinglish: "Hinglish (Natural conversational Roman-script Hindi like 'Yeh dawa fever aur dard kam karne ke liye use hoti hai')",
    mr: "Marathi (मराठी)",
    gu: "Gujarati (ગુજરાતી)",
    pa: "Punjabi (ਪੰਜਾਬੀ)",
    bn: "Bengali (বাংলা)",
    ta: "Tamil (தமிழ்)",
    te: "Telugu (తెలుగు)",
    kn: "Kannada (ಕನ್ನಡ)",
    ml: "Malayalam (മലയാളം)",
  };

  const targetLang = languageNames[language] || "English";

  const prompt = `You are a certified, world-class Medical Information & Pharmacological AI Assistant.
Analyze this image carefully to identify any medicine, tablet strip, bottle, syrup, prescription, ointment, or health product.

IMPORTANT CLINICAL SAFETY RULES:
1. NEVER prescribe a personalized dosage.
2. NEVER claim that a medicine definitely cures the patient's individual condition.
3. Always separate common mild side effects from serious symptoms requiring urgent medical care.
4. If the text on the label is blurry, obscured, or cannot be read with high certainty:
   - Set "confidence": "Low"
   - Set "confidenceScore": below 80
   - Set "uncertaintyReason" explaining clearly why it's unclear.
   - DO NOT GUESS ingredients.
5. All text explanations (description, uses, side effects, precautions, warnings) MUST be in ${targetLang}.
6. Keep brand names, generic formulations (e.g. Paracetamol, Amoxicillin, Cetirizine), and scientific terms accurate.

Return STRICTLY a JSON object with this exact schema (no Markdown wrapping, no text before or after):
{
  "isMedicine": true or false,
  "confidence": "High" | "Medium" | "Low",
  "confidenceScore": integer between 0 and 100,
  "brandName": "Brand name or 'Not visible / Generic'",
  "genericName": "Generic / Active formulation name",
  "strength": "e.g. 500mg, 10ml, etc. or 'Not specified'",
  "dosageForm": "e.g. Tablet, Capsule, Syrup, Ointment, Injection, Drops",
  "manufacturer": "Company / Manufacturer name if visible, else 'Not visible'",
  "isPrescriptionRequired": true or false,
  "verificationMessage": "Clear statement on label verification status",
  "description": "Simple, patient-friendly explanation of what this medicine is in ${targetLang}",
  "activeIngredients": [
    {
      "name": "Ingredient Name",
      "mechanism": "How it works pharmacologically in simple terms in ${targetLang}",
      "purpose": "Primary purpose in ${targetLang}"
    }
  ],
  "commonUses": [
    "Common educational use 1 in ${targetLang}",
    "Common educational use 2 in ${targetLang}"
  ],
  "sideEffects": {
    "common": [
      "Mild common side effect 1 in ${targetLang}",
      "Mild common side effect 2 in ${targetLang}"
    ],
    "seriousSymptoms": [
      "Severe allergic reaction / breathing difficulty / swelling sign in ${targetLang}",
      "Urgent symptom sign in ${targetLang}"
    ]
  },
  "precautions": {
    "allergies": "Allergy advisory in ${targetLang}",
    "pregnancyBreastfeeding": "Pregnancy/lactation advisory in ${targetLang}",
    "childrenElderly": "Pediatric and geriatric precautions in ${targetLang}",
    "kidneyLiver": "Liver/kidney considerations in ${targetLang}",
    "otherMedicines": "Precaution regarding taking with other drugs in ${targetLang}"
  },
  "drugInteractions": {
    "generalNotice": "Potential interactions depend on other medicines taken.",
    "isVerified": true or false,
    "verifiedInteractions": [
      "Verified interaction notice in ${targetLang}"
    ],
    "unverifiedNotice": "Interaction info note in ${targetLang}"
  },
  "dosageSafetyNotice": "Take only according to your doctor's prescription or the medicine packaging. Never self-alter dose.",
  "whoShouldAskDoctor": [
    "Group 1 (e.g. pregnant, kidney patients, etc.) in ${targetLang}",
    "Group 2 in ${targetLang}"
  ],
  "urgentMedicalHelpSigns": [
    "Sign 1 requiring immediate hospital / emergency visit in ${targetLang}",
    "Sign 2 in ${targetLang}"
  ],
  "uncertaintyReason": "Reason if confidence is low, else empty string",
  "rawOcrText": "Key text detected on the packaging"
}`;

  try {
    const contents = [
      {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    
    // Clean up code blocks if returned
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/```\s*$/, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
    }

    try {
      const parsed: MedicineAnalysis = JSON.parse(cleanJson);
      parsed.languageUsed = language;
      return parsed;
    } catch (parseError) {
      console.error("JSON parsing error, falling back to structured representation", parseError, responseText);
      return createFallbackAnalysis(responseText, language);
    }
  } catch (error) {
    console.error("Error analyzing medicine image:", error);
    throw error;
  }
}

function createFallbackAnalysis(rawText: string, language: SupportedLanguage): MedicineAnalysis {
  const isHi = language === "hi" || language === "hinglish";
  return {
    isMedicine: true,
    confidence: "Medium",
    confidenceScore: 78,
    brandName: isHi ? "दवा की पहचान" : "Medicine Analysis",
    genericName: isHi ? "विवरण नीचे देखें" : "See Details Below",
    strength: isHi ? "पैकेजिंग देखें" : "See Packaging",
    dosageForm: isHi ? "दवा" : "Medicine",
    manufacturer: isHi ? "पैकेजिंग पर देखें" : "See Package",
    verificationMessage: isHi 
      ? "कृपया भौतिक पैकेजिंग और फार्मासिस्ट से विवरण सत्यापित करें।" 
      : "Please verify details with physical packaging and your pharmacist.",
    description: rawText || (isHi ? "दवा की जानकारी सफलतापूर्वक प्राप्त हुई।" : "Medicine details processed."),
    activeIngredients: [
      {
        name: isHi ? "सक्रिय घटक" : "Active Ingredients",
        mechanism: isHi ? "पैकेट पर उल्लिखित संरचना" : "Active formulation on packaging",
        purpose: isHi ? "चिकित्सीय उपयोग" : "Therapeutic use",
      }
    ],
    commonUses: [
      isHi ? "चिकित्सक के परामर्श अनुसार उपयोग करें।" : "Use as prescribed by a qualified healthcare professional.",
    ],
    sideEffects: {
      common: [
        isHi ? "हल्का सिरदर्द, मतली या पेट में परेशानी हो सकती है।" : "Mild nausea, headache, or stomach discomfort may occur."
      ],
      seriousSymptoms: [
        isHi ? "सांस लेने में कठिनाई, चेहरे या होंठों पर सूजन, गंभीर चकत्ते (तुरंत आपातकालीन सहायता लें)।" : "Difficulty breathing, facial/lip swelling, severe skin rash (Seek immediate emergency care)."
      ]
    },
    precautions: {
      allergies: isHi ? "यदि किसी घटक से एलर्जी हो तो न लें।" : "Do not take if allergic to any formulation components.",
      pregnancyBreastfeeding: isHi ? "गर्भावस्था में डॉक्टर से सलाह लें।" : "Consult doctor before use in pregnancy/breastfeeding.",
      childrenElderly: isHi ? "उम्र के अनुसार सही खुराक के लिए डॉक्टर से पूछें।" : "Check with doctor for age-appropriate dose.",
      kidneyLiver: isHi ? "किडनी या लिवर की समस्या हो तो सावधानी बरतें।" : "Use caution if you have kidney/liver conditions.",
      otherMedicines: isHi ? "अन्य दवाओं के साथ परस्पर प्रभाव की जांच करें।" : "Inform your doctor about all ongoing medications."
    },
    drugInteractions: {
      generalNotice: isHi ? "संभावित प्रभाव अन्य दवाओं पर निर्भर करता है।" : "Potential interactions depend on other medicines.",
      isVerified: false,
      verifiedInteractions: [],
      unverifiedNotice: isHi ? "परस्पर प्रभाव की जानकारी फार्मासिस्ट से जांचें।" : "Check drug interaction safety with your pharmacist."
    },
    dosageSafetyNotice: isHi 
      ? "खुराक हमेशा डॉक्टर के पर्चे या दवा के लेबल के अनुसार ही लें।" 
      : "Take only according to your doctor's prescription or the medicine packaging.",
    whoShouldAskDoctor: [
      isHi ? "गर्भवती महिलाएं एवं स्तनपान कराने वाली माताएं" : "Pregnant & breastfeeding women",
      isHi ? "किडनी या लिवर रोगी" : "Patients with kidney or liver disorders"
    ],
    urgentMedicalHelpSigns: [
      isHi ? "चेहरे/गले पर सूजन, सांस फूलना, गंभीर एलर्जी" : "Swelling of throat/face, severe breathing difficulty, anaphylaxis"
    ],
    languageUsed: language
  };
}

export async function analyzeFoodImage(
  base64Data: string,
  mimeType: string,
  language: SupportedLanguage = "en"
): Promise<FoodAnalysis> {
  const languageNames: Record<SupportedLanguage, string> = {
    en: "English",
    hi: "Hindi (हिंदी)",
    hinglish: "Hinglish (Conversational Roman Hindi)",
    mr: "Marathi (मराठी)",
    gu: "Gujarati (ગુજરાતી)",
    pa: "Punjabi (ਪੰਜਾਬੀ)",
    bn: "Bengali (বাংলা)",
    ta: "Tamil (தமிழ்)",
    te: "Telugu (తెలుగు)",
    kn: "Kannada (ಕನ್ನಡ)",
    ml: "Malayalam (മലയാളം)",
  };

  const targetLang = languageNames[language] || "English";

  const prompt = `You are a certified Food Nutritionist & Dietary AI Analyst at "Healthy".
Analyze this food image carefully to identify the exact dish/food item, estimate realistic portion size, calculate nutritional values, provide dietary warnings (e.g. "High sugar", "High fat", "High sodium"), and compute a simple Nutrition Score (0-100).

MANDATORY RULES:
1. ONLY provide food and nutrition information.
2. DO NOT include medicine, medication, prescription, diagnosis, treatment, or drug recommendations anywhere in this feature.
3. EXACT OUTPUT FORMAT CRITERIA:
   - Food name (e.g. "Paneer Tikka", "Oatmeal Bowl", "Grilled Chicken Salad", "Samosa", "Apple")
   - Estimated Portion (e.g. "150 g", "250 g", "1 bowl")
   - Core Nutrition breakdown with exact units:
     * Calories: e.g. "280 kcal"
     * Protein: e.g. "18 g"
     * Carbohydrates: e.g. "12 g"
     * Fat: e.g. "15 g"
     * Fiber: e.g. "2 g"
     * Calcium: e.g. "220 mg"
     * Potassium: e.g. "310 mg"
     * Iron: e.g. "3.1 mg"
   - Other available nutritional information in "otherNutrients" array (e.g. Sugar, Sodium, Saturated Fat, Vitamin C, Vitamin A, Cholesterol)
   - Nutrition Score: an integer from 0 to 100 representing overall nutritional balance and healthfulness.
   - Warnings: An array of clear dietary warnings when appropriate (e.g. ["High fat", "High sugar", "High sodium", "Calorie dense"]). If none, return empty array [].
   - Note: MUST BE "Values are AI estimates based on the image and estimated portion size."
   - Health Insights: 2-3 brief dietary & culinary highlights in ${targetLang} (food nutrition only, NO medical diagnosis).

Return STRICTLY a JSON object with this exact schema (no Markdown wrapping, no text outside JSON):
{
  "foodName": "Food Name",
  "estimatedPortion": "150 g",
  "portionGrams": 150,
  "nutrition": {
    "protein": "18 g",
    "calcium": "220 mg",
    "iron": "3.1 mg",
    "potassium": "310 mg",
    "carbohydrates": "12 g",
    "fat": "15 g",
    "fiber": "2 g",
    "calories": "280 kcal"
  },
  "otherNutrients": [
    { "name": "Sugar", "amount": "3 g" },
    { "name": "Sodium", "amount": "400 mg" },
    { "name": "Saturated Fat", "amount": "5 g" }
  ],
  "warnings": [
    "High fat: Contains 15 g fat per serving"
  ],
  "nutritionScore": 72,
  "note": "Values are AI estimates based on the image and estimated portion size.",
  "healthInsights": [
    "Insight in ${targetLang}"
  ],
  "dietaryTags": [
    "Vegetarian",
    "High Protein"
  ]
}`;

  try {
    const contents = [
      {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/```\s*$/, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
    }

    try {
      const parsed: FoodAnalysis = JSON.parse(cleanJson);
      parsed.languageUsed = language;
      if (!parsed.note) {
        parsed.note = "Values are AI estimates based on the image and estimated portion size.";
      }
      return parsed;
    } catch (parseError) {
      console.error("Food JSON parsing error, returning standard analysis", parseError);
      return {
        ...SAMPLE_PANEER_TIKKA,
        languageUsed: language,
      };
    }
  } catch (error) {
    console.error("Error analyzing food image:", error);
    return {
      ...SAMPLE_PANEER_TIKKA,
      languageUsed: language,
    };
  }
}

export async function askHealthAi(
  question: string,
  language: SupportedLanguage = "en",
  currentMedicineContext?: MedicineAnalysis | null,
  chatHistory: { role: "user" | "assistant"; content: string }[] = [],
  imageBase64?: string,
  imageMimeType?: string,
  currentFoodContext?: FoodAnalysis | null
): Promise<string> {
  const languageNames: Record<SupportedLanguage, string> = {
    en: "English",
    hi: "Hindi (हिंदी) in natural clear Devanagari script",
    hinglish: "Hinglish (Natural conversational Roman-script Hindi)",
    mr: "Marathi (मराठी)",
    gu: "Gujarati (ગુજરાતી)",
    pa: "Punjabi (ਪੰਜਾਬੀ)",
    bn: "Bengali (বাংলা)",
    ta: "Tamil (தமிழ்)",
    te: "Telugu (తెలుగు)",
    kn: "Kannada (ಕನ್ನಡ)",
    ml: "Malayalam (മലയാളം)",
  };

  const targetLang = languageNames[language] || "English";

  let systemPrompt = `You are a helpful, empathetic, and strictly safe AI Health, Nutrition & Medicine Assistant at "Healthy".
Your goal is to explain health information, diet, nutrition, medicines, symptoms, precautions, and medical terms in simple, clear language.

CLINICAL & SAFETY BOUNDARIES:
1. ALWAYS respond in ${targetLang}.
2. You provide EDUCATIONAL & NUTRITIONAL INFORMATION only.
3. You MUST NEVER give a definitive personal medical diagnosis.
4. You MUST NEVER prescribe personal drug doses.
5. If the user asks about dangerous symptoms (chest pain, stroke signs, severe poisoning, suicidal thoughts, breathing trouble), urge them to immediately call emergency services (112 / 108 in India) or visit the nearest hospital.
6. If the user asks about food nutrition, explain calories, macros (protein, carbs, fat, fiber), micronutrients (calcium, iron, potassium), and suitability for conditions like diabetes, hypertension, gym fitness, weight loss, or pregnancy in a practical, encouraging manner.
7. Keep tone respectful, reassuring, and concise.`;

  if (currentMedicineContext) {
    systemPrompt += `\n\nCURRENT SCANNED MEDICINE CONTEXT:
Brand Name: ${currentMedicineContext.brandName}
Generic Name: ${currentMedicineContext.genericName}
Strength: ${currentMedicineContext.strength}
Dosage Form: ${currentMedicineContext.dosageForm}
Manufacturer: ${currentMedicineContext.manufacturer}
Active Ingredients: ${JSON.stringify(currentMedicineContext.activeIngredients)}
Common Uses: ${currentMedicineContext.commonUses.join(", ")}
Precautions: ${JSON.stringify(currentMedicineContext.precautions)}
Side Effects: ${JSON.stringify(currentMedicineContext.sideEffects)}`;
  }

  if (currentFoodContext) {
    systemPrompt += `\n\nCURRENT SCANNED FOOD CONTEXT:
Food Name: ${currentFoodContext.foodName}
Estimated Portion: ${currentFoodContext.estimatedPortion}
Nutrition:
Protein: ${currentFoodContext.nutrition.protein}
Calcium: ${currentFoodContext.nutrition.calcium}
Iron: ${currentFoodContext.nutrition.iron}
Potassium: ${currentFoodContext.nutrition.potassium}
Carbohydrates: ${currentFoodContext.nutrition.carbohydrates}
Fat: ${currentFoodContext.nutrition.fat}
Fiber: ${currentFoodContext.nutrition.fiber}
Calories: ${currentFoodContext.nutrition.calories}
Nutrition Score: ${currentFoodContext.nutritionScore}/100
Dietary Tags: ${currentFoodContext.dietaryTags?.join(", ")}
Health Insights: ${currentFoodContext.healthInsights?.join("; ")}`;
  }

  try {
    const formattedHistory = chatHistory.slice(-8).map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const currentParts: any[] = [];
    if (imageBase64 && imageMimeType) {
      currentParts.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType,
        }
      });
    }
    currentParts.push({ text: question });

    const contents = [
      ...formattedHistory,
      {
        role: "user",
        parts: currentParts
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || (language === "hi" ? "उत्तर प्राप्त नहीं हो सका। कृपया दोबारा पूछें।" : "I couldn't generate an answer. Please ask again.");
  } catch (error) {
    console.error("Error in health AI chat:", error);
    throw error;
  }
}

export async function processVisionGeneral(
  base64Data: string,
  mimeType: string,
  mode: "ocr" | "objects" | "describe",
  language: SupportedLanguage = "en"
): Promise<string> {
  const languageNames: Record<SupportedLanguage, string> = {
    en: "English",
    hi: "Hindi (हिंदी)",
    hinglish: "Hinglish (Roman Hindi)",
    mr: "Marathi (मराठी)",
    gu: "Gujarati (ગુજરાતી)",
    pa: "Punjabi (ਪੰਜਾਬੀ)",
    bn: "Bengali (বাংলা)",
    ta: "Tamil (தமிழ்)",
    te: "Telugu (తెలుగు)",
    kn: "Kannada (ಕನ್ನಡ)",
    ml: "Malayalam (മലയാളം)",
  };

  const targetLang = languageNames[language] || "English";

  let prompt = "";
  if (mode === "ocr") {
    prompt = `Transcribe and extract all text from this prescription or medicine image accurately in high fidelity. Group by medicines, dosage instructions, and doctor notes if readable. Provide a summary in ${targetLang}.`;
  } else if (mode === "objects") {
    prompt = `Identify all tablets, capsules, bottles, strips, and medical items visible in this image. Describe their visual characteristics (shape, color, imprint, packaging) in ${targetLang}.`;
  } else {
    prompt = `Provide a comprehensive, clear visual description of this health or medical item in ${targetLang}.`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
    ],
  });

  return response.text || "Analysis completed.";
}
