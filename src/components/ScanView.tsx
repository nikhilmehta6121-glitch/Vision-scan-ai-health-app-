import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  X, 
  Layers, 
  FileText, 
  Maximize2, 
  ImageIcon, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Pill, 
  SwitchCamera,
  Image as LucideImage,
  ArrowRight,
  Utensils,
  Apple
} from "lucide-react";
import { SupportedLanguage, MedicineAnalysis, FoodAnalysis, ScanItem } from "@/types";
import { TRANSLATIONS } from "@/lib/languages";
import { analyzeMedicineImage, analyzeFoodImage, processVisionGeneral, SAMPLE_PANEER_TIKKA } from "@/lib/medicalAnalysis";
import { MedicineAnalysisCard } from "./MedicineAnalysisCard";
import { FoodAnalysisCard } from "./FoodAnalysisCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ScanViewProps {
  language: SupportedLanguage;
  onSaveScan: (item: ScanItem) => void;
  onAskAiWithContext: (medicine: MedicineAnalysis) => void;
  onAskAiWithFoodContext?: (food: FoodAnalysis) => void;
  initialScanItem?: ScanItem | null;
  initialMode?: "health" | "food" | "ocr" | "objects" | "describe";
  onClearInitialScan?: () => void;
}

export const ScanView: React.FC<ScanViewProps> = ({
  language,
  onSaveScan,
  onAskAiWithContext,
  onAskAiWithFoodContext,
  initialScanItem,
  initialMode,
  onClearInitialScan,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [image, setImage] = useState<string | null>(initialScanItem?.image || null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [mode, setMode] = useState<"health" | "food" | "ocr" | "objects" | "describe">(
    initialScanItem?.mode || initialMode || "health"
  );

  useEffect(() => {
    if (initialMode && !initialScanItem) {
      setMode(initialMode);
    }
  }, [initialMode, initialScanItem]);
  const [isScanning, setIsScanning] = useState(false);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [medicineResult, setMedicineResult] = useState<MedicineAnalysis | null>(
    initialScanItem?.medicineData || null
  );
  const [foodResult, setFoodResult] = useState<FoodAnalysis | null>(
    initialScanItem?.foodData || null
  );
  const [generalTextResult, setGeneralTextResult] = useState<string | null>(
    initialScanItem?.textResult || null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If an initial scan is passed from history, load it
  useEffect(() => {
    if (initialScanItem) {
      setImage(initialScanItem.image);
      setMode(initialScanItem.mode);
      setMedicineResult(initialScanItem.medicineData || null);
      setFoodResult(initialScanItem.foodData || null);
      setGeneralTextResult(initialScanItem.textResult || null);
    }
  }, [initialScanItem]);

  // Connect camera stream to video tag
  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async (targetFacing: "environment" | "user" = facingMode) => {
    stopCamera();
    setErrorMsg(null);
    try {
      setImage(null);
      setMedicineResult(null);
      setFoodResult(null);
      setGeneralTextResult(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: targetFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraStream(stream);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error(
        language === "hi" 
          ? "कैमरा शुरू नहीं हो सका। कृपया कैमरा परमिशन चेक करें या फोटो अपलोड करें।" 
          : "Camera access denied or unavailable. Please check permissions or upload an image."
      );
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setImage(dataUrl);
      setMimeType("image/jpeg");
      stopCamera();
      performAnalysis(dataUrl, "image/jpeg", mode);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    const type = file.type || "image/jpeg";
    setMimeType(type);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImage(base64String);
      setMedicineResult(null);
      setFoodResult(null);
      setGeneralTextResult(null);
      stopCamera();
      performAnalysis(base64String, type, mode);
    };
    reader.onerror = () => {
      toast.error(t.errUploadFailed);
    };
    reader.readAsDataURL(file);
  };

  const performAnalysis = async (
    imgData: string,
    mime: string,
    currentMode: "health" | "food" | "ocr" | "objects" | "describe"
  ) => {
    setIsScanning(true);
    setErrorMsg(null);
    setMedicineResult(null);
    setFoodResult(null);
    setGeneralTextResult(null);
    setLoadingStep(1);

    // Simulate progressive loading steps for realistic feedback
    const stepTimer1 = setTimeout(() => setLoadingStep(2), 1100);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 2400);
    const stepTimer3 = setTimeout(() => setLoadingStep(4), 3800);

    const base64Clean = imgData.split(",")[1] || imgData;

    try {
      if (currentMode === "health") {
        const medData = await analyzeMedicineImage(base64Clean, mime, language);
        setMedicineResult(medData);

        // Auto save to local scan history
        const newScanItem: ScanItem = {
          id: "scan_" + Date.now(),
          image: imgData,
          mode: "health",
          medicineData: medData,
          timestamp: Date.now(),
          language: language,
        };
        onSaveScan(newScanItem);
      } else if (currentMode === "food") {
        const foodData = await analyzeFoodImage(base64Clean, mime, language);
        setFoodResult(foodData);

        // Auto save to local scan history
        const newScanItem: ScanItem = {
          id: "scan_" + Date.now(),
          image: imgData,
          mode: "food",
          foodData: foodData,
          timestamp: Date.now(),
          language: language,
        };
        onSaveScan(newScanItem);
      } else {
        const textResp = await processVisionGeneral(base64Clean, mime, currentMode, language);
        setGeneralTextResult(textResp);

        const newScanItem: ScanItem = {
          id: "scan_" + Date.now(),
          image: imgData,
          mode: currentMode,
          textResult: textResp,
          timestamp: Date.now(),
          language: language,
        };
        onSaveScan(newScanItem);
      }
    } catch (err: any) {
      console.error("Scan processing error:", err);
      setErrorMsg(t.errAiFailed);
      toast.error(t.errAiFailed);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsScanning(false);
    }
  };

  const resetAll = () => {
    stopCamera();
    setImage(null);
    setMedicineResult(null);
    setFoodResult(null);
    setGeneralTextResult(null);
    setErrorMsg(null);
    onClearInitialScan?.();
  };

  // Sample Medicine for testing
  const loadSampleMedicine = () => {
    // Paracetamol 650 sample badge
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 600;
    sampleCanvas.height = 400;
    const ctx = sampleCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = "#1e40af";
      ctx.fillRect(0, 0, 600, 70);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("DOLO 650 TABLETS", 30, 48);
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("Paracetamol Tablets IP 650 mg", 30, 130);
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#475569";
      ctx.fillText("Each uncoated tablet contains: Paracetamol IP 650mg", 30, 170);
      ctx.fillText("Mfg. by: Micro Labs Limited, India", 30, 210);
      ctx.fillText("Dosage: As directed by the Physician.", 30, 250);
      ctx.fillStyle = "#b91c1c";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("Warning: Taking more than daily dose may cause liver damage.", 30, 310);
      
      const sampleDataUrl = sampleCanvas.toDataURL("image/jpeg", 0.95);
      setImage(sampleDataUrl);
      setMimeType("image/jpeg");
      setMode("health");
      setFoodResult(null);
      setGeneralTextResult(null);
      performAnalysis(sampleDataUrl, "image/jpeg", "health");
    }
  };

  // Sample Food (Paneer Tikka) for instant testing as requested
  const loadSampleFood = () => {
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 600;
    sampleCanvas.height = 400;
    const ctx = sampleCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#fff7ed";
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = "#ea580c";
      ctx.fillRect(0, 0, 600, 75);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("PANEER TIKKA (150 g)", 30, 48);
      
      ctx.fillStyle = "#1c1917";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("Tandoori Cottage Cheese with Grilled Veggies", 30, 130);
      
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#44403c";
      ctx.fillText("Portion: 150g • Energy: 280 kcal • Protein: 18g", 30, 175);
      ctx.fillText("Rich in Calcium (220mg), Iron (3.1mg) & Potassium (310mg)", 30, 215);
      ctx.fillText("Carbs: 12g • Fat: 15g • Fiber: 2g", 30, 255);
      
      ctx.fillStyle = "#059669";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("Nutrition Score: 72/100 (High Protein Choice)", 30, 315);
      
      const sampleDataUrl = sampleCanvas.toDataURL("image/jpeg", 0.95);
      setImage(sampleDataUrl);
      setMimeType("image/jpeg");
      setMode("food");
      setMedicineResult(null);
      setGeneralTextResult(null);
      setFoodResult(SAMPLE_PANEER_TIKKA);

      const newScanItem: ScanItem = {
        id: "scan_" + Date.now(),
        image: sampleDataUrl,
        mode: "food",
        foodData: SAMPLE_PANEER_TIKKA,
        timestamp: Date.now(),
        isSaved: true,
        language: language,
      };
      onSaveScan(newScanItem);
      toast.success("Loaded Paneer Tikka food scan result!");
    }
  };

  return (
    <div id="scan-view-container" className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Mode Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            <span>{t.scanModeTitle}</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "दवाई, पर्चा या स्वास्थ्य उत्पाद का विश्लेषण करें" : "Scan medicine strip, bottle, or prescription"}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/60 overflow-x-auto">
          {[
            { id: "health" as const, label: t.modeHealth, icon: Pill },
            { id: "food" as const, label: language === "hi" ? "खाना / पोषण" : "Food Nutrition", icon: Utensils },
            { id: "ocr" as const, label: t.modeOcr, icon: FileText },
            { id: "objects" as const, label: t.modeObjects, icon: Maximize2 },
            { id: "describe" as const, label: t.modeDescribe, icon: ImageIcon },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = mode === item.id;
            return (
              <button
                key={item.id}
                id={`mode-tab-${item.id}`}
                onClick={() => {
                  setMode(item.id);
                  if (image && !isScanning) {
                    performAnalysis(image, mimeType, item.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Viewfinder / Upload Section */}
      {!image && !isCameraActive && (
        <Card className="rounded-3xl border-2 border-dashed border-border/80 bg-card overflow-hidden shadow-sm">
          <CardContent className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-primary/10">
              {mode === "food" ? <Utensils className="w-10 h-10" /> : <Camera className="w-10 h-10" />}
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                {mode === "food"
                  ? (language === "hi" ? "भोजन की फोटो खींचें या अपलोड करें" : "Capture or Upload Food / Meal Image")
                  : (language === "hi" ? "दवाई की फोटो खींचें या अपलोड करें" : "Capture or Upload Medicine Image")}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {mode === "food"
                  ? (language === "hi" ? "किसी भी भोजन, फल, थाली या स्नैक की फोटो लेकर कैलोरी, प्रोटीन, कैल्शियम और न्यूट्रिशन स्कोर जानें।" : "Snap any food, dish, fruit, or snack to get calories, protein, calcium, iron & nutrition score.")
                  : t.dragDropText}
              </p>
            </div>

            {/* Input triggers */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-sm">
              <Button
                id="btn-open-camera"
                size="lg"
                onClick={() => startCamera()}
                className={`rounded-full font-bold gap-2 h-12 flex-1 shadow-md text-sm text-white ${
                  mode === "food" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary hover:bg-primary/90"
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>
                  {mode === "food" 
                    ? (language === "hi" ? "भोजन की फोटो लें" : "Take Food Photo") 
                    : t.cameraBtn}
                </span>
              </Button>

              <Button
                id="btn-upload-file"
                variant="outline"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full font-bold gap-2 h-12 flex-1 shadow-xs bg-background hover:bg-muted text-foreground text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>
                  {mode === "food" 
                    ? (language === "hi" ? "गैलरी से अपलोड करें" : "Upload Food Photo") 
                    : t.uploadBtn}
                </span>
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Test with sample demo badge */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              {mode !== "food" && (
                <button
                  id="btn-load-sample-med"
                  onClick={loadSampleMedicine}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>{language === "hi" ? "दवाई सैंपल (Dolo 650)" : "Test Medicine Sample (Dolo 650)"}</span>
                </button>
              )}

              <button
                id="btn-load-sample-food"
                onClick={loadSampleFood}
                className="text-xs text-emerald-700 dark:text-emerald-300 font-bold hover:underline flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 shadow-xs"
              >
                <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === "hi" ? "🍎 भोजन सैंपल (पनीर टिक्का)" : "🍎 Test Food Sample (Paneer Tikka)"}</span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Camera Viewfinder */}
      {isCameraActive && (
        <Card className="rounded-3xl border-border/80 bg-black overflow-hidden relative shadow-2xl">
          <div className="relative aspect-4/3 sm:aspect-16/9 w-full overflow-hidden flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Focus Overlay Grid */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              <div className="w-4/5 h-3/5 border-2 border-dashed border-white/70 rounded-2xl relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] font-bold px-3 py-0.5 rounded-full border border-white/30 backdrop-blur-md">
                  {mode === "food" 
                    ? (language === "hi" ? "भोजन या थाली को यहाँ संरेखित करें" : "Align Food or Dish Here")
                    : (language === "hi" ? "दवाई के पत्ते को यहाँ संरेखित करें" : "Align Medicine Package Here")}
                </div>
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />
              </div>
            </div>

            {/* Camera Floating Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <Button
                id="btn-switch-camera"
                variant="secondary"
                size="icon"
                onClick={toggleCameraFacing}
                className="w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 border border-white/20 backdrop-blur-md"
                title={t.switchCamera}
              >
                <SwitchCamera className="w-4 h-4" />
              </Button>
              <Button
                id="btn-close-camera"
                variant="secondary"
                size="icon"
                onClick={stopCamera}
                className="w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 border border-white/20 backdrop-blur-md"
                title={t.stopCamera}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Capture Trigger Bar */}
          <div className="p-4 bg-zinc-950 flex items-center justify-center gap-4">
            <Button
              id="btn-capture-photo"
              size="lg"
              onClick={capturePhoto}
              className={`w-16 h-16 rounded-full bg-white hover:bg-zinc-200 shadow-xl border-4 transition-transform hover:scale-105 p-0 ${
                mode === "food" ? "border-emerald-600 text-emerald-600" : "border-primary text-primary"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                mode === "food" ? "bg-emerald-600" : "bg-primary"
              }`}>
                <Camera className="w-6 h-6" />
              </div>
            </Button>
          </div>
        </Card>
      )}

      {/* Captured Image Preview + Action Bar */}
      {image && !isCameraActive && (
        <div className="space-y-4">
          <Card className="rounded-3xl border-border/80 overflow-hidden bg-card shadow-sm">
            <div className="relative max-h-80 sm:max-h-96 w-full bg-muted flex items-center justify-center overflow-hidden">
              <img
                src={image}
                alt={mode === "food" ? "Scanned Food" : "Scanned Medicine"}
                className="max-h-80 sm:max-h-96 w-full object-contain"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <Button
                  id="btn-retake-image"
                  variant="secondary"
                  size="sm"
                  onClick={resetAll}
                  className="rounded-full bg-background/80 hover:bg-background text-foreground text-xs font-semibold backdrop-blur-md shadow-md gap-1.5 h-8 px-3"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.changeImage}</span>
                </Button>
              </div>
            </div>

            {/* If not scanning and results not loaded yet */}
            {!isScanning && !medicineResult && !foodResult && !generalTextResult && !errorMsg && (
              <CardContent className="p-4 bg-muted/40 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground">
                    {mode === "food" 
                      ? (language === "hi" ? "भोजन की फोटो तैयार है" : "Food Photo Ready for Analysis")
                      : (language === "hi" ? "फोटो तैयार है" : "Image Ready for Analysis")}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {mode === "food"
                      ? (language === "hi" ? "AI से कैलोरी, प्रोटीन, मैक्रोज़ और स्कोर प्राप्त करें" : "Click analyze to get nutrition breakdown & score")
                      : (language === "hi" ? "AI से विस्तृत मेडिकल जानकारी प्राप्त करें" : "Click analyze to get full medical breakdown")}
                  </p>
                </div>
                <Button
                  id="btn-re-analyze"
                  onClick={() => performAnalysis(image, mimeType, mode)}
                  className={`rounded-full font-bold gap-2 text-xs text-white shadow-md h-10 px-5 ${
                    mode === "food" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {mode === "food" 
                      ? (language === "hi" ? "🍎 पोषण स्कैन करें" : "🍎 Scan Food Nutrition Now") 
                      : t.scanMedicineNow}
                  </span>
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Realistic 4-Step Medical/Food Loading Indicator */}
      {isScanning && (
        <Card id="scanning-progress-card" className="rounded-3xl border-primary/20 bg-primary/5 p-6 sm:p-8 text-center space-y-6 shadow-md">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/30 animate-bounce">
                {mode === "food" ? <Utensils className="w-8 h-8" /> : <Pill className="w-8 h-8" />}
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-extrabold text-foreground">
                {mode === "food" ? (
                  loadingStep === 1 ? (language === "hi" ? "भोजन की तस्वीर जांची जा रही है..." : "Scanning food image...") :
                  loadingStep === 2 ? (language === "hi" ? "व्यंजन और मात्रा का अनुमान लगाया जा रहा है..." : "Estimating portion & identifying dish...") :
                  loadingStep === 3 ? (language === "hi" ? "कैलोरी, प्रोटीन, वसा और खनिजों की गणना जारी है..." : "Calculating calories, protein, carbs & minerals...") :
                  (language === "hi" ? "न्यूट्रिशन स्कोर (100 में से) तैयार किया जा रहा है..." : "Computing Nutrition Score (out of 100)...")
                ) : (
                  loadingStep === 1 ? t.loadingStep1 :
                  loadingStep === 2 ? t.loadingStep2 :
                  loadingStep === 3 ? t.loadingStep3 :
                  t.loadingStep4
                )}
              </h3>
              <p className="text-xs text-muted-foreground">
                {mode === "food" 
                  ? (language === "hi" 
                      ? "AI प्रोटीन, कार्बोहाइड्रेट्स, वसा, कैल्शियम, आयरन और पोटैशियम का सटीक विश्लेषण कर रहा है..." 
                      : "AI is estimating portion, protein, calcium, iron, potassium, carbohydrates, fat, fiber & calories...")
                  : (language === "hi" 
                      ? "AI दवा के लेबल, सक्रिय सामग्री और सुरक्षा सावधानियों की जांच कर रहा है..." 
                      : "AI is verifying packaging, active formulation, dosage safety & side effects...")}
              </p>
            </div>

            {/* Progress Step Badges */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-md pt-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    loadingStep >= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div 
          id="scan-error-alert"
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 text-xs"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-rose-950 dark:text-rose-100">
                {language === "hi" ? "त्रुटि:" : "Analysis Error:"}
              </span>
              <p>{errorMsg}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => image && performAnalysis(image, mimeType, mode)}
            className="rounded-full text-xs font-semibold h-8 bg-background border-rose-300 text-rose-700"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Completed Medicine Analysis Display */}
      {medicineResult && !isScanning && (
        <MedicineAnalysisCard
          analysis={medicineResult}
          language={language}
          onScanAnother={resetAll}
          onAskAi={onAskAiWithContext}
          onSave={(data) => {
            if (image) {
              onSaveScan({
                id: "scan_" + Date.now(),
                image: image,
                mode: "health",
                medicineData: data,
                timestamp: Date.now(),
                isSaved: true,
                language: language,
              });
            }
          }}
        />
      )}

      {/* Completed Food & Nutrition Analysis Display */}
      {foodResult && !isScanning && (
        <FoodAnalysisCard
          analysis={foodResult}
          language={language}
          onScanAnother={resetAll}
          onAskAi={(food) => {
            if (onAskAiWithFoodContext) {
              onAskAiWithFoodContext(food);
            }
          }}
          onSave={(data) => {
            if (image) {
              onSaveScan({
                id: "scan_" + Date.now(),
                image: image,
                mode: "food",
                foodData: data,
                timestamp: Date.now(),
                isSaved: true,
                language: language,
              });
            }
          }}
        />
      )}

      {/* Completed General OCR / Vision Text Display */}
      {generalTextResult && !isScanning && (
        <Card id="general-vision-result-card" className="rounded-3xl border-border/80 shadow-md bg-card overflow-hidden">
          <CardHeader className="bg-muted/40 border-b border-border/60 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>{mode === "ocr" ? t.modeOcr : t.modeDescribe}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
              <ReactMarkdown>{generalTextResult}</ReactMarkdown>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={resetAll}
                className="rounded-full font-semibold text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                {t.btnScanAnother}
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generalTextResult);
                  toast.success(t.btnCopied);
                }}
                className="rounded-full font-semibold text-xs bg-primary text-primary-foreground"
              >
                {t.btnCopy}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
