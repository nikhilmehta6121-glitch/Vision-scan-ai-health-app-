import React, { useState } from "react";
import { 
  Pill, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Share2, 
  Heart, 
  RefreshCw, 
  MessageSquare, 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Building2,
  Layers,
  HelpCircle
} from "lucide-react";
import { MedicineAnalysis, SupportedLanguage } from "@/types";
import { TRANSLATIONS } from "@/lib/languages";
import { speakText, stopSpeaking, isSpeaking } from "@/lib/speech";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MedicineAnalysisCardProps {
  analysis: MedicineAnalysis;
  language: SupportedLanguage;
  onScanAnother: () => void;
  onAskAi: (medicine: MedicineAnalysis) => void;
  onSave?: (analysis: MedicineAnalysis) => void;
  isSaved?: boolean;
}

export const MedicineAnalysisCard: React.FC<MedicineAnalysisCardProps> = ({
  analysis,
  language,
  onScanAnother,
  onAskAi,
  onSave,
  isSaved = false,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedLocally, setSavedLocally] = useState(isSaved);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isLowConfidence = analysis.confidenceScore < 85 || analysis.confidence === "Low";

  // Build audio summary text
  const buildSpeechSummary = (): string => {
    const isHi = language === "hi" || language === "hinglish";
    const brand = analysis.brandName;
    const generic = analysis.genericName;
    const desc = analysis.description;
    const uses = analysis.commonUses.join(". ");
    const sideEffects = analysis.sideEffects.common.join(", ");
    const warning = isHi 
      ? "दवा लेने से पहले डॉक्टर या फार्मासिस्ट से सलाह लें।" 
      : "Always consult a qualified healthcare professional before taking any medicine.";

    if (isHi) {
      return `दवा का नाम: ${brand}. जेनेरिक घटक: ${generic}. ${desc}. मुख्य उपयोग: ${uses}. सामान्य साइड इफेक्ट: ${sideEffects}. ${warning}`;
    }
    return `Medicine: ${brand}. Generic: ${generic}. ${desc}. Common uses: ${uses}. Common side effects: ${sideEffects}. ${warning}`;
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const textToSpeak = buildSpeechSummary();
      const success = speakText(
        textToSpeak,
        language,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false),
        () => {
          setIsPlayingAudio(false);
          toast.error("Audio playback error");
        }
      );
      if (!success) {
        toast.error("Text to speech not supported on this browser.");
      }
    }
  };

  const handleCopy = () => {
    const formattedText = `
--- ${t.appName} AI Medicine Analysis ---
Brand Name: ${analysis.brandName}
Generic Name: ${analysis.genericName}
Strength: ${analysis.strength}
Dosage Form: ${analysis.dosageForm}
Manufacturer: ${analysis.manufacturer}
Confidence: ${analysis.confidence} (${analysis.confidenceScore}%)

WHAT IS THIS MEDICINE:
${analysis.description}

ACTIVE INGREDIENTS:
${analysis.activeIngredients.map((ing) => `- ${ing.name}: ${ing.mechanism}`).join("\n")}

COMMON USES:
${analysis.commonUses.map((u) => `- ${u}`).join("\n")}

COMMON SIDE EFFECTS:
${analysis.sideEffects.common.map((s) => `- ${s}`).join("\n")}

SERIOUS WARNINGS:
${analysis.sideEffects.seriousSymptoms.map((w) => `- ${w}`).join("\n")}

PRECAUTIONS:
- Allergies: ${analysis.precautions.allergies}
- Pregnancy: ${analysis.precautions.pregnancyBreastfeeding}
- Kidney/Liver: ${analysis.precautions.kidneyLiver}

DOSAGE SAFETY:
${analysis.dosageSafetyNotice}

DISCLAIMER:
${t.topDisclaimer}
`;
    navigator.clipboard.writeText(formattedText.trim());
    setCopied(true);
    toast.success(t.btnCopied);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${analysis.brandName} - Medicine Information (${t.appName})`,
          text: `${analysis.brandName} (${analysis.genericName}): ${analysis.description}\n\nDisclaimer: Educational info only. Consult a doctor.`,
          url: window.location.href,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleSave = () => {
    setSavedLocally(true);
    onSave?.(analysis);
    toast.success(t.btnSaved);
  };

  return (
    <div id="medicine-analysis-container" className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Safety Disclaimer at the Top */}
      <div 
        id="analysis-top-disclaimer"
        className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-200 flex items-start gap-3 text-xs leading-relaxed"
      >
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold block text-blue-900 dark:text-blue-100">
            {language === "hi" ? "शैक्षणिक एवं सामान्य जानकारी सूचना:" : "Medical Safety Notice:"}
          </span>
          <p>{t.topDisclaimer}</p>
        </div>
      </div>

      {/* 2. Low Confidence Warning Banner */}
      {isLowConfidence && (
        <div 
          id="analysis-uncertainty-banner"
          className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-950 dark:text-amber-200 flex items-start gap-3 text-xs leading-relaxed"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-900 dark:text-amber-100 block">
              {t.uncertaintyWarning}
            </span>
            {analysis.uncertaintyReason && (
              <p className="text-amber-800 dark:text-amber-300 text-[11px]">
                {analysis.uncertaintyReason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. Section A: Medicine Overview Card */}
      <Card id="section-medicine-overview" className="rounded-3xl border-border/80 shadow-md overflow-hidden bg-card">
        <CardHeader className="bg-muted/40 border-b border-border/60 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                    {analysis.brandName || "Identified Medicine"}
                  </CardTitle>
                  {analysis.isPrescriptionRequired ? (
                    <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider">
                      {t.rxRequired}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                      {t.otcMedicine}
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-primary mt-0.5">
                  {analysis.genericName || "Generic Formulation"}
                </p>
              </div>
            </div>

            {/* Confidence Badge */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                analysis.confidenceScore >= 85 
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:text-emerald-300"
                  : analysis.confidenceScore >= 70
                  ? "bg-amber-500/10 text-amber-700 border-amber-300 dark:text-amber-300"
                  : "bg-rose-500/10 text-rose-700 border-rose-300 dark:text-rose-300"
              }`}>
                {analysis.confidenceScore >= 85 ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span>
                  {analysis.confidenceScore >= 85 ? t.confidenceHigh : analysis.confidenceScore >= 70 ? t.confidenceMedium : t.confidenceLow} ({analysis.confidenceScore}%)
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Metadata Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/60">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t.strengthLabel}
              </span>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                {analysis.strength || "N/A"}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t.formLabel}
              </span>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                {analysis.dosageForm || "Tablet"}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {t.manufacturerLabel}
              </span>
              <p className="text-xs sm:text-sm font-bold text-foreground truncate" title={analysis.manufacturer}>
                {analysis.manufacturer || "Not clearly visible"}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {language === "hi" ? "सत्यापन स्थिति" : "Verification"}
              </span>
              <p className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {language === "hi" ? "सत्यापित लेबल" : "AI Verified"}
              </p>
            </div>
          </div>

          {/* Verification Advice */}
          <p className="text-[11px] text-muted-foreground italic flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-primary shrink-0" />
            {analysis.verificationMessage || t.verifyNotice}
          </p>

          {/* Section B: What is this medicine? */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{t.whatIsThisMed}</span>
            </h4>
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs sm:text-sm leading-relaxed text-foreground">
              {analysis.description}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Section C: Active Ingredients & Purpose */}
      <Card id="section-active-ingredients" className="rounded-3xl border-border/80 shadow-xs bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span>{t.activeIngredientsTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {analysis.activeIngredients.map((ing, idx) => (
            <div 
              key={idx} 
              className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <span className="font-extrabold text-foreground text-sm block">
                  {ing.name}
                </span>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {ing.mechanism}
                </p>
              </div>
              {ing.purpose && (
                <Badge variant="outline" className="w-fit shrink-0 text-[11px] bg-background">
                  {ing.purpose}
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 5. Section D: Common Uses */}
      <Card id="section-common-uses" className="rounded-3xl border-border/80 shadow-xs bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.commonUsesTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {analysis.commonUses.map((use, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-foreground flex items-start gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{use}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 italic">
            * {language === "hi" 
              ? "यह जानकारी केवल सामान्य संदर्भ के लिए है। किसी भी बीमारी के सटीक इलाज के लिए डॉक्टर से पूछें।" 
              : "Common uses are for general reference only and do not constitute a specific individual diagnosis."}
          </p>
        </CardContent>
      </Card>

      {/* 6. Section E: Common Side Effects vs ⚠️ SERIOUS SYMPTOMS */}
      <Card id="section-side-effects" className="rounded-3xl border-border/80 shadow-xs bg-card overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>{t.sideEffectsTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* Common mild side effects */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-2">
              {t.commonSideEffectsLabel}
            </span>
            <div className="flex flex-wrap gap-2">
              {analysis.sideEffects.common.map((side, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 rounded-full bg-muted text-foreground text-xs font-medium border border-border/80"
                >
                  {side}
                </span>
              ))}
            </div>
          </div>

          {/* Serious Symptoms Warning Box */}
          {analysis.sideEffects.seriousSymptoms && analysis.sideEffects.seriousSymptoms.length > 0 && (
            <div 
              id="serious-symptoms-warning-box"
              className="p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-950 dark:text-rose-200 space-y-2"
            >
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-extrabold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{t.seriousWarningsTitle}</span>
              </div>
              <ul className="space-y-1 text-xs list-disc list-inside">
                {analysis.sideEffects.seriousSymptoms.map((serious, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {serious}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 7. Section F: General Precautions */}
      <Card id="section-precautions" className="rounded-3xl border-border/80 shadow-xs bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            <span>{t.precautionsTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0 text-xs">
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
            <span className="font-bold text-foreground block">
              {t.allergiesLabel}
            </span>
            <p className="text-muted-foreground leading-relaxed">
              {analysis.precautions.allergies}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
            <span className="font-bold text-foreground block">
              {t.pregnancyLabel}
            </span>
            <p className="text-muted-foreground leading-relaxed">
              {analysis.precautions.pregnancyBreastfeeding}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
            <span className="font-bold text-foreground block">
              {t.childrenElderlyLabel}
            </span>
            <p className="text-muted-foreground leading-relaxed">
              {analysis.precautions.childrenElderly}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
            <span className="font-bold text-foreground block">
              {t.kidneyLiverLabel}
            </span>
            <p className="text-muted-foreground leading-relaxed">
              {analysis.precautions.kidneyLiver}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 8. Section G & H: Drug Interactions & Dosage Safety */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Drug Interactions */}
        <Card id="section-interactions" className="rounded-3xl border-border/80 shadow-xs bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>{t.interactionsTitle}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 pt-0">
            <p className="text-muted-foreground leading-relaxed">
              {analysis.drugInteractions.generalNotice || "Potential interactions depend on other medicines taken."}
            </p>
            {analysis.drugInteractions.isVerified && analysis.drugInteractions.verifiedInteractions.length > 0 ? (
              <ul className="space-y-1 text-xs list-disc list-inside text-foreground">
                {analysis.drugInteractions.verifiedInteractions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-200 text-[11px] font-medium border border-amber-500/20">
                {t.interactionsUnverified}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dosage Safety Warning */}
        <Card id="section-dosage-safety" className="rounded-3xl border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-900 dark:text-blue-200">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>{t.dosageSafetyTitle}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2 pt-0 text-blue-950 dark:text-blue-100">
            <p className="leading-relaxed font-semibold">
              {t.dosageSafetyText}
            </p>
            <p className="text-[11px] opacity-80 italic">
              {language === "hi" 
                ? "यह AI कभी भी व्यक्तिगत खुराक (dosage) निर्धारित नहीं करता।" 
                : "This AI never prescribes personalized dosages."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 9. Action Buttons Toolbar */}
      <div 
        id="analysis-action-buttons-toolbar"
        className="p-4 sm:p-5 rounded-3xl bg-muted/60 border border-border/80 flex flex-wrap items-center justify-between gap-3 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Listen Button */}
          <Button
            id="btn-listen-audio"
            variant={isPlayingAudio ? "destructive" : "default"}
            size="sm"
            onClick={handleToggleAudio}
            className="rounded-full font-bold gap-2 text-xs h-10 px-4 shadow-xs"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4 animate-pulse" />
                <span>{t.btnStopListening}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>{t.btnListen}</span>
              </>
            )}
          </Button>

          {/* Copy Button */}
          <Button
            id="btn-copy-analysis"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="rounded-full font-semibold gap-1.5 text-xs h-10 px-3.5 bg-background shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.btnCopied : t.btnCopy}</span>
          </Button>

          {/* Share Button */}
          <Button
            id="btn-share-analysis"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="rounded-full font-semibold gap-1.5 text-xs h-10 px-3.5 bg-background shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t.btnShare}</span>
          </Button>

          {/* Save Button */}
          <Button
            id="btn-save-analysis"
            variant="outline"
            size="sm"
            onClick={handleSave}
            className={`rounded-full font-semibold gap-1.5 text-xs h-10 px-3.5 bg-background shadow-xs ${
              savedLocally ? "text-rose-600 border-rose-200" : ""
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${savedLocally ? "fill-rose-600" : ""}`} />
            <span>{savedLocally ? t.btnSaved : t.btnSave}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Ask AI About this medicine */}
          <Button
            id="btn-ask-ai-followup"
            size="sm"
            onClick={() => onAskAi(analysis)}
            className="rounded-full font-bold gap-2 text-xs h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex-1 sm:flex-initial"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.btnAskAiAboutThis}</span>
          </Button>

          {/* Scan Another */}
          <Button
            id="btn-scan-another-medicine"
            variant="outline"
            size="sm"
            onClick={onScanAnother}
            className="rounded-full font-bold gap-1.5 text-xs h-10 px-4 bg-background shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.btnScanAnother}</span>
            <span className="xs:hidden">New</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
