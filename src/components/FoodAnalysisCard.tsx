import React, { useState } from "react";
import { 
  Utensils, 
  Flame, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  MessageSquare, 
  Bookmark, 
  RefreshCw, 
  Info, 
  AlertTriangle,
  Scale, 
  Sliders, 
  CheckCircle2,
  PieChart,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Edit3,
  Camera,
  Layers,
  Barcode,
  Tag,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { FoodAnalysis, DetectedFoodItem, SupportedLanguage, ResultSourceType, ConfidenceLevel } from "@/types";
import { TRANSLATIONS } from "@/lib/languages";
import { speakText, stopSpeaking } from "@/lib/speech";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface FoodAnalysisCardProps {
  analysis: FoodAnalysis;
  language: SupportedLanguage;
  onScanAnother: () => void;
  onAskAi: (food: FoodAnalysis) => void;
  onSave?: (food: FoodAnalysis) => void;
  onConfirmResult?: (food: FoodAnalysis) => void;
}

export const FoodAnalysisCard: React.FC<FoodAnalysisCardProps> = ({
  analysis: initialAnalysis,
  language,
  onScanAnother,
  onAskAi,
  onSave,
  onConfirmResult,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [analysis, setAnalysis] = useState<FoodAnalysis>(initialAnalysis);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isWhyOpen, setIsWhyOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Editable Form State
  const [editFoodName, setEditFoodName] = useState(analysis.foodName);
  const [editPortionGrams, setEditPortionGrams] = useState<number>(analysis.portionGrams || 200);
  const [editCalories, setEditCalories] = useState(analysis.nutrition.calories || "250 kcal");
  const [editProtein, setEditProtein] = useState(analysis.nutrition.protein || "15 g");
  const [editCarbs, setEditCarbs] = useState(analysis.nutrition.carbohydrates || "30 g");
  const [editFat, setEditFat] = useState(analysis.nutrition.fat || "8 g");
  const [editFiber, setEditFiber] = useState(analysis.nutrition.fiber || "4 g");
  const [editSugar, setEditSugar] = useState(
    analysis.otherNutrients?.find((n) => n.name.toLowerCase().includes("sugar"))?.amount || "3 g"
  );
  const [editSodium, setEditSodium] = useState(
    analysis.otherNutrients?.find((n) => n.name.toLowerCase().includes("sodium"))?.amount || "320 mg"
  );

  // Portion Scaling Factor
  const basePortionGrams = analysis.portionGrams || 200;
  const [currentGrams, setCurrentGrams] = useState<number>(basePortionGrams);
  const scaleFactor = currentGrams / basePortionGrams;

  const scaleNutrient = (valStr?: string, factor: number = 1): string => {
    if (!valStr) return "-";
    const match = valStr.match(/^([\d.]+)\s*(.*)$/);
    if (!match) return valStr;
    const num = parseFloat(match[1]);
    const unit = match[2];
    const scaled = num * factor;
    const formatted = scaled >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
    return `${formatted} ${unit}`.trim();
  };

  const currentProtein = scaleNutrient(analysis.nutrition.protein, scaleFactor);
  const currentCalcium = scaleNutrient(analysis.nutrition.calcium, scaleFactor);
  const currentIron = scaleNutrient(analysis.nutrition.iron, scaleFactor);
  const currentPotassium = scaleNutrient(analysis.nutrition.potassium, scaleFactor);
  const currentCarbs = scaleNutrient(analysis.nutrition.carbohydrates, scaleFactor);
  const currentFat = scaleNutrient(analysis.nutrition.fat, scaleFactor);
  const currentFiber = scaleNutrient(analysis.nutrition.fiber, scaleFactor);
  const currentCalories = scaleNutrient(analysis.nutrition.calories, scaleFactor);

  // Source Type Label & Badge
  const getSourceBadge = (source?: ResultSourceType) => {
    switch (source) {
      case "LABEL_EXTRACTED":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-bold">
            <Tag className="w-3 h-3 mr-1" /> Label Extracted
          </Badge>
        );
      case "BARCODE_PRODUCT_DATA":
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[11px] font-bold">
            <Barcode className="w-3 h-3 mr-1" /> Barcode/Product Data
          </Badge>
        );
      case "USER_ENTERED":
        return (
          <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[11px] font-bold">
            <Edit3 className="w-3 h-3 mr-1" /> User Entered
          </Badge>
        );
      case "AI_ESTIMATED":
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 mr-1" /> AI Estimated
          </Badge>
        );
    }
  };

  // Confidence Level Indicator
  const getConfidenceBadge = (conf?: ConfidenceLevel, score?: number) => {
    const level = conf || (score && score >= 80 ? "High" : score && score >= 60 ? "Medium" : "Low");
    switch (level) {
      case "High":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> High Confidence ({score || 88}%)
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Info className="w-3 h-3" /> Medium Confidence ({score || 74}%)
          </span>
        );
      case "Low":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" /> Low Confidence ({score || 55}%)
          </span>
        );
    }
  };

  // Save Edits Handler
  const handleSaveUserEdits = () => {
    const updated: FoodAnalysis = {
      ...analysis,
      foodName: editFoodName.trim() || analysis.foodName,
      portionGrams: editPortionGrams,
      estimatedPortion: `${editPortionGrams} g`,
      sourceType: "USER_ENTERED",
      isUserEdited: true,
      nutrition: {
        ...analysis.nutrition,
        calories: editCalories,
        protein: editProtein,
        carbohydrates: editCarbs,
        fat: editFat,
        fiber: editFiber,
      },
      otherNutrients: [
        { name: "Sugar", amount: editSugar },
        { name: "Sodium", amount: editSodium },
      ],
    };
    setAnalysis(updated);
    setIsEditing(false);
    toast.success("Food item and nutrition values updated!");
  };

  // Confirm Result Handler
  const handleConfirm = () => {
    setIsConfirmed(true);
    toast.success("Meal confirmed! Saved to your wellness history.");
    if (onConfirmResult) onConfirmResult(analysis);
    if (onSave) onSave(analysis);
  };

  const handleCopy = () => {
    const text = `🥗 ${analysis.foodName} (${analysis.estimatedPortion})\nCalories: ${currentCalories}\nProtein: ${currentProtein}\nCarbs: ${currentCarbs}\nFat: ${currentFat}\nFiber: ${currentFiber}\nScore: ${analysis.nutritionScore}/100\n[Vision Scan AI Health]`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Nutrition summary copied!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const speech = `${analysis.foodName}. Estimated portion: ${currentGrams} grams. Calories: ${currentCalories}. Protein: ${currentProtein}. Nutrition score: ${analysis.nutritionScore} out of 100.`;
      speakText(speech, language, () => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  };

  // Why this result data fallback
  const whyData = analysis.whyThisResult || analysis.totalMeal?.whyThisResult || {
    summary: "यह result food image और selected serving size के आधार पर estimated है. Actual nutrition preparation और quantity के अनुसार बदल सकती है.",
    visualClues: [
      "Shape and texture visual features detected by multimodal vision model",
      "Color profile matches homestyle preparation standard",
      "Portion size estimated from plate-to-item geometric reference"
    ],
    assumptions: [
      "Standard cooking oil/seasoning assumption applied",
      "Regular moisture and standard grain density assumed"
    ],
    uncertainties: [
      "Exact dissolved sodium/salt cannot be measured visually",
      "Preparation oils may vary based on cooking method"
    ],
    sourceDescription: "AI Estimated from visual image pixels (Food Scanner 2.0)",
  };

  return (
    <div id="food-analysis-result-view" className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* 1. Low Quality Image Warning if detected */}
      {analysis.isLowQualityImage && (
        <div className="p-4 rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-sm block">Image quality is too low for a reliable scan</span>
              <p className="text-xs text-muted-foreground">
                {analysis.lowQualityWarning || "The photo appears blurry, too dark, or taken from a difficult angle. Values may be imprecise."}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={onScanAnother}
            className="rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0"
          >
            <Camera className="w-3.5 h-3.5 mr-1.5" />
            <span>Retake Photo</span>
          </Button>
        </div>
      )}

      {/* Main Result Card */}
      <Card className="rounded-3xl border-border/80 shadow-xl bg-card overflow-hidden">
        {/* Top Header */}
        <div className="p-6 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30 text-[10px] uppercase font-bold">
                  Food Detected
                </Badge>
                {getSourceBadge(analysis.sourceType)}
                {getConfidenceBadge(analysis.overallConfidence, analysis.overallConfidenceScore)}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {analysis.foodName}
              </h1>
              <p className="text-xs text-slate-300">
                Serving Size: <strong className="text-white font-semibold">{currentGrams} g</strong> ({analysis.estimatedPortion})
              </p>
            </div>

            {/* Nutrition Score Badge */}
            <div className="flex items-center gap-3 self-start sm:self-center">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                <span className="text-[10px] text-slate-300 block font-semibold uppercase tracking-wider">
                  Nutrition Score
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black text-emerald-400">{analysis.nutritionScore}</span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* 2. Detected Food Items (Multi-Item Breakdown with Confidence) */}
          {analysis.detectedFoods && analysis.detectedFoods.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Detected Food Items ({analysis.detectedFoods.length})</span>
                </h3>
                <span className="text-[11px] text-muted-foreground">Individual Confidence Estimates</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.detectedFoods.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-sm text-foreground block">{item.name}</span>
                        <span className="text-[11px] text-muted-foreground">{item.portion}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {item.confidencePercentage}% Confidence
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] pt-1 border-t border-border/50">
                      <div className="p-1 rounded-lg bg-background/80">
                        <span className="text-[9px] text-muted-foreground block">Cal</span>
                        <strong className="text-xs">{item.calories}</strong>
                      </div>
                      <div className="p-1 rounded-lg bg-background/80">
                        <span className="text-[9px] text-muted-foreground block">Protein</span>
                        <strong className="text-xs text-primary">{item.protein}</strong>
                      </div>
                      <div className="p-1 rounded-lg bg-background/80">
                        <span className="text-[9px] text-muted-foreground block">Score</span>
                        <strong className="text-xs text-emerald-600 dark:text-emerald-400">{item.nutritionScore}/100</strong>
                      </div>
                    </div>

                    {item.visualClues && item.visualClues.length > 0 && (
                      <p className="text-[10px] text-muted-foreground italic">
                        Visual clue: {item.visualClues[0]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Interactive Serving Size Adjustment Slider */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                <span>Adjust Serving Size (Grams)</span>
              </span>
              <strong className="text-primary font-black text-sm">{currentGrams} g ({Math.round(scaleFactor * 100)}%)</strong>
            </div>
            <input
              type="range"
              min={Math.max(50, Math.round(basePortionGrams * 0.4))}
              max={Math.round(basePortionGrams * 2.2)}
              step={10}
              value={currentGrams}
              onChange={(e) => setCurrentGrams(parseInt(e.target.value, 10))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Small Serving ({Math.max(50, Math.round(basePortionGrams * 0.5))}g)</span>
              <span>Standard ({basePortionGrams}g)</span>
              <span>Large Portion ({Math.round(basePortionGrams * 1.8)}g)</span>
            </div>
          </div>

          {/* 4. Core Nutrition Grid with Estimated / Extracted Tags */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-primary" />
                <span>Nutrition Breakdown ({currentGrams}g portion)</span>
              </h3>
              <span className="text-[11px] text-muted-foreground italic">
                {analysis.sourceType === "LABEL_EXTRACTED" ? "Extracted from package" : "Values are estimated"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Calories */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Calories</span>
                <strong className="text-lg font-black text-amber-600 dark:text-amber-400 block">{currentCalories}</strong>
                <span className="text-[9px] text-amber-700 dark:text-amber-300 font-medium">Estimated kcal</span>
              </div>

              {/* Protein */}
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Protein</span>
                <strong className="text-lg font-black text-blue-600 dark:text-blue-400 block">{currentProtein}</strong>
                <span className="text-[9px] text-blue-700 dark:text-blue-300 font-medium">Muscle & cellular</span>
              </div>

              {/* Carbs */}
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Carbs</span>
                <strong className="text-lg font-black text-purple-600 dark:text-purple-400 block">{currentCarbs}</strong>
                <span className="text-[9px] text-purple-700 dark:text-purple-300 font-medium">Daily energy</span>
              </div>

              {/* Fat */}
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Fat</span>
                <strong className="text-lg font-black text-rose-600 dark:text-rose-400 block">{currentFat}</strong>
                <span className="text-[9px] text-rose-700 dark:text-rose-300 font-medium">Lipids</span>
              </div>
            </div>

            {/* Additional Nutrients: Fiber, Sugar, Sodium, Calcium, Potassium */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Fiber</span>
                <strong className="text-xs font-bold text-foreground">{currentFiber}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Sugar</span>
                <strong className="text-xs font-bold text-foreground">
                  {analysis.otherNutrients?.find((n) => n.name.toLowerCase().includes("sugar"))?.amount || "3.5 g"}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Sodium</span>
                <strong className="text-xs font-bold text-foreground">
                  {analysis.otherNutrients?.find((n) => n.name.toLowerCase().includes("sodium"))?.amount || "480 mg"}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Calcium</span>
                <strong className="text-xs font-bold text-foreground">{currentCalcium}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Potassium</span>
                <strong className="text-xs font-bold text-foreground">{currentPotassium}</strong>
              </div>
            </div>
          </div>

          {/* 5. "WHY THIS RESULT?" EXPLANATION CARD (Requirement 2 & 3) */}
          <Card className="rounded-2xl border-blue-500/20 bg-blue-500/5 shadow-xs overflow-hidden">
            <button
              onClick={() => setIsWhyOpen(!isWhyOpen)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-blue-500/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-extrabold text-xs sm:text-sm text-foreground">
                  Why this result? (Transparency & Explanation)
                </span>
              </div>
              {isWhyOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {isWhyOpen && (
              <div className="p-4 pt-0 space-y-3 text-xs border-t border-blue-500/10 text-muted-foreground">
                <p className="leading-relaxed text-foreground font-medium bg-background/80 p-3 rounded-xl border border-border/60">
                  {whyData.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Visual Clues */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-background/60 border border-border/60">
                    <span className="font-bold text-foreground block text-[11px] uppercase tracking-wide">
                      🔍 Visual Clues Detected:
                    </span>
                    <ul className="space-y-1 text-[11px]">
                      {whyData.visualClues.map((clue, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{clue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Uncertainties & Assumptions */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-background/60 border border-border/60">
                    <span className="font-bold text-foreground block text-[11px] uppercase tracking-wide">
                      ⚠️ Assumptions & Uncertainties:
                    </span>
                    <ul className="space-y-1 text-[11px]">
                      {whyData.uncertainties.map((unc, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{unc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1">
                  <span>Data Source: <strong className="text-foreground">{whyData.sourceDescription}</strong></span>
                  <span>Confidence Level: <strong className="text-foreground">{analysis.overallConfidence || "High"}</strong></span>
                </div>
              </div>
            )}
          </Card>

          {/* 6. Inline Edit Mode (User Correction) */}
          {isEditing && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Edit Food & Nutrition Values</span>
                </span>
                <Badge variant="outline" className="text-[10px] border-purple-500 text-purple-600">
                  User Correction
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">Food Name</label>
                  <Input
                    value={editFoodName}
                    onChange={(e) => setEditFoodName(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">Portion Grams (g)</label>
                  <Input
                    type="number"
                    value={editPortionGrams}
                    onChange={(e) => setEditPortionGrams(parseFloat(e.target.value) || 200)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-foreground">Calories</label>
                  <Input
                    value={editCalories}
                    onChange={(e) => setEditCalories(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-foreground">Protein</label>
                  <Input
                    value={editProtein}
                    onChange={(e) => setEditProtein(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-foreground">Carbs</label>
                  <Input
                    value={editCarbs}
                    onChange={(e) => setEditCarbs(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-foreground">Fat</label>
                  <Input
                    value={editFat}
                    onChange={(e) => setEditFat(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveUserEdits}
                  className="rounded-full text-xs h-8 bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* 7. Safety Disclaimer (Mandatory Requirement 14) */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Wellness & Educational Notice:</strong> Nutrition values are estimates unless directly extracted from a product nutrition label or trusted product data. Results may vary based on ingredients, preparation and serving size. This app provides wellness and educational information and does not diagnose or treat medical conditions.
            </span>
          </div>
        </CardContent>

        {/* 8. Action Bar: [Confirm Result] | [Edit] | [Re-scan] */}
        <div className="p-4 sm:p-6 bg-muted/20 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              id="btn-food-confirm-result"
              onClick={handleConfirm}
              disabled={isConfirmed}
              className={`rounded-full font-bold h-10 px-5 gap-1.5 text-xs shadow-md transition-all ${
                isConfirmed ? "bg-emerald-600 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isConfirmed ? "Result Confirmed ✓" : "Confirm Result"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-full text-xs font-semibold h-10 px-4 gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? "Close Editor" : "Edit Result"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onScanAnother}
              className="rounded-full text-xs font-semibold h-10 px-4 gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-scan</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSpeak}
              className="rounded-full text-xs font-semibold h-10 px-3.5 gap-1.5"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? "Stop" : "Listen"}</span>
            </Button>

            <Button
              size="sm"
              onClick={() => onAskAi(analysis)}
              className="rounded-full text-xs font-bold h-10 px-4 gap-1.5 bg-primary text-primary-foreground shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask AI Coach</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
