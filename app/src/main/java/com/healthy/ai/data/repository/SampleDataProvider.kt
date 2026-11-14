package com.healthy.ai.data.repository

import com.healthy.ai.data.model.*

object SampleDataProvider {

    val samplePaneerTikka = FoodAnalysis(
        foodName = "Paneer Tikka",
        estimatedPortion = "150 g",
        portionGrams = 150,
        nutrition = NutritionData(
            calories = "280 kcal",
            protein = "18 g",
            carbohydrates = "12 g",
            fat = "15 g",
            fiber = "2 g",
            calcium = "220 mg",
            potassium = "310 mg",
            iron = "3.1 mg"
        ),
        otherNutrients = listOf(
            OtherNutrient("Sugar", "2.5 g"),
            OtherNutrient("Sodium", "420 mg"),
            OtherNutrient("Saturated Fat", "6.5 g"),
            OtherNutrient("Vitamin A", "160 mcg"),
            OtherNutrient("Cholesterol", "38 mg")
        ),
        warnings = listOf(
            "High fat: Contains 15 g fat per serving — moderate portion if managing lipid or calorie goals."
        ),
        nutritionScore = 72,
        note = "Values are AI estimates based on the image and estimated portion size.",
        healthInsights = listOf(
            "Rich source of vegetarian dairy protein (18g) supporting cellular repair and muscle recovery.",
            "High bioavailable calcium (220mg) supporting bone and dental health.",
            "Tandoori grilling preserves nutrients without excessive deep-fry cooking oils.",
            "Bell peppers and onions provide natural vitamin C and dietary antioxidants."
        ),
        dietaryTags = listOf("Vegetarian", "High Protein", "Calcium Rich", "Gluten-Free"),
        languageUsed = "en"
    )

    val sampleDolo650 = MedicineAnalysis(
        isMedicine = true,
        confidence = "High",
        confidenceScore = 95,
        brandName = "Dolo 650",
        genericName = "Paracetamol (Acetaminophen)",
        strength = "650 mg",
        dosageForm = "Tablet",
        manufacturer = "Micro Labs Ltd.",
        isPrescriptionRequired = false,
        verificationMessage = "Verified formulation matching standard Indian Pharmacopoeia monographs.",
        description = "Dolo 650 contains 650mg of Paracetamol, an antipyretic and analgesic medicine widely used for relieving mild to moderate pain and reducing fever.",
        activeIngredients = listOf(
            ActiveIngredient(
                name = "Paracetamol (Acetaminophen)",
                mechanism = "Inhibits prostaglandin synthesis in the central nervous system and acts on the hypothalamic heat-regulating center.",
                purpose = "Fever reduction (Antipyretic) and pain relief (Analgesic)"
            )
        ),
        commonUses = listOf(
            "Relief of fever associated with viral infections or common colds.",
            "Headache, toothache, and body pain relief.",
            "Post-vaccination pyrexia and mild musculoskeletal discomfort."
        ),
        sideEffects = SideEffectsData(
            common = listOf(
                "Mild nausea or gastric discomfort (rare at therapeutic doses)",
                "Drowsiness (infrequent)"
            ),
            seriousSymptoms = listOf(
                "Severe allergic reaction (rash, hives, itching)",
                "Swelling of the face, lips, tongue, or throat causing difficulty in breathing",
                "Signs of liver toxicity: yellowing of skin/eyes (jaundice), severe dark urine"
            )
        ),
        precautions = PrecautionsData(
            allergies = "Do not take if known hypersensitivity to Paracetamol.",
            pregnancyBreastfeeding = "Considered generally acceptable under medical supervision at therapeutic doses.",
            childrenElderly = "Use weight-appropriate dosing; do not exceed daily recommended limits.",
            kidneyLiver = "Exercise extreme caution in pre-existing hepatic impairment or chronic alcohol dependence.",
            otherMedicines = "Do not combine with other Paracetamol-containing cold/cough preparations to avoid accidental overdose."
        ),
        drugInteractions = DrugInteractionsData(
            generalNotice = "Avoid concomitant use with other acetaminophen formulations or chronic alcohol consumption.",
            isVerified = true,
            verifiedInteractions = listOf(
                "Warfarin / Oral Anticoagulants: Prolonged regular use of paracetamol may enhance the anticoagulant effect.",
                "Alcohol: Increases risk of hepatotoxicity."
            )
        ),
        dosageSafetyNotice = "Strictly adhere to the prescribed dose. The maximum daily dose for an adult is 4000mg. Overdose can cause fatal liver damage.",
        whoShouldAskDoctor = listOf(
            "Patients with existing liver or severe kidney conditions.",
            "Individuals with chronic alcohol intake.",
            "Pregnant or nursing women before prolonged usage."
        ),
        urgentMedicalHelpSigns = listOf(
            "Difficulty breathing or throat constriction.",
            "Severe skin peeling or blisters.",
            "Persistent nausea, vomiting, or acute right upper abdominal pain."
        ),
        languageUsed = "en"
    )
}
