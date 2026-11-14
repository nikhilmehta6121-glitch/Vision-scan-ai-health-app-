import React, { useState } from "react";
import { 
  History, 
  Trash2, 
  Search, 
  Eye, 
  Pill, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { ScanItem, SupportedLanguage } from "@/types";
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from "@/lib/languages";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface HistoryViewProps {
  scans: ScanItem[];
  language: SupportedLanguage;
  onOpenScan: (scan: ScanItem) => void;
  onDeleteScan: (id: string) => void;
  onClearAll: () => void;
  onStartNewScan: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  scans,
  language,
  onOpenScan,
  onDeleteScan,
  onClearAll,
  onStartNewScan,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const filteredScans = scans.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const brand = item.medicineData?.brandName?.toLowerCase() || "";
    const generic = item.medicineData?.genericName?.toLowerCase() || "";
    const food = item.foodData?.foodName?.toLowerCase() || "";
    const text = item.textResult?.toLowerCase() || "";
    return brand.includes(query) || generic.includes(query) || food.includes(query) || text.includes(query);
  });

  const handleExportJson = () => {
    if (scans.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scans, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `healthy_medicine_scans_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("History exported successfully!");
  };

  return (
    <div id="history-view-container" className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <span>{t.historyTitle}</span>
            <Badge variant="secondary" className="text-xs ml-1">
              {scans.length}
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "आपकी पिछली स्कैन की गई दवाइयों का सुरक्षित इतिहास" : "Locally saved medicine scans and analyses"}
          </p>
        </div>

        {scans.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              id="btn-export-history-json"
              variant="outline"
              size="sm"
              onClick={handleExportJson}
              className="rounded-full text-xs font-semibold h-8 gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>

            <Button
              id="btn-clear-all-history"
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="rounded-full text-xs font-semibold h-8 gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearAllHistory}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Search Filter */}
      {scans.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            id="history-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.historySearchPlaceholder}
            className="pl-9 rounded-full bg-muted/40 border-border/80 text-xs sm:text-sm h-10"
          />
        </div>
      )}

      {/* Empty State */}
      {filteredScans.length === 0 && (
        <Card className="rounded-3xl border-border/80 bg-card p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Pill className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-bold text-base text-foreground">
              {scans.length === 0 ? t.historyEmpty : "No matching scans found"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {scans.length === 0
                ? (language === "hi" ? "कैमरा खोलकर या फोटो अपलोड करके किसी भी दवा को स्कैन करें।" : "Use the camera or upload a medicine package to build your scan history.")
                : "Try searching with a different brand name or active ingredient."}
            </p>
          </div>
          {scans.length === 0 && (
            <Button
              id="btn-empty-start-scan"
              onClick={onStartNewScan}
              className="rounded-full font-bold gap-2 text-xs bg-primary text-primary-foreground shadow-md px-5 h-10"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t.scanMedBtn}</span>
            </Button>
          )}
        </Card>
      )}

      {/* Scan History Cards List */}
      {filteredScans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredScans.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleDateString([], {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === item.language);
            const isHigh = (item.medicineData?.confidenceScore || 0) >= 85;

            return (
              <Card
                key={item.id}
                id={`history-card-${item.id}`}
                className="rounded-3xl border-border/80 overflow-hidden hover:shadow-md transition-shadow bg-card flex flex-col justify-between"
              >
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border/60">
                      <img
                        src={item.image}
                        alt="Scan thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] px-1.5 py-0 uppercase tracking-wider font-semibold ${
                            item.mode === "food" ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10" : ""
                          }`}
                        >
                          {item.mode === "health" ? "Medicine" : item.mode === "food" ? "Food Nutrition" : item.mode.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {langObj?.flag || "🌐"} {langObj?.nativeName || "EN"}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-foreground truncate" title={item.foodData?.foodName || item.medicineData?.brandName || "Scan Result"}>
                        {item.foodData?.foodName || item.medicineData?.brandName || (item.mode === "ocr" ? "Prescription OCR" : "Visual Scan")}
                      </h4>

                      <p className="text-xs text-primary font-medium truncate" title={item.foodData ? `${item.foodData.nutrition.calories} • ${item.foodData.estimatedPortion}` : item.medicineData?.genericName || ""}>
                        {item.foodData 
                          ? `${item.foodData.nutrition.calories} • ${item.foodData.estimatedPortion}` 
                          : item.medicineData?.genericName || item.textResult?.slice(0, 45) || "Health Item"}
                      </p>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground border-t border-border/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </span>

                    {item.medicineData && (
                      <span className={`flex items-center gap-1 font-semibold ${
                        isHigh ? "text-emerald-600" : "text-amber-600"
                      }`}>
                        {isHigh ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        <span>{item.medicineData.confidenceScore}%</span>
                      </span>
                    )}

                    {item.foodData && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Score: {item.foodData.nutritionScore}/100</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-3 bg-muted/40 border-t border-border/60 flex items-center justify-between gap-2">
                  <Button
                    id={`btn-open-scan-${item.id}`}
                    size="sm"
                    onClick={() => onOpenScan(item)}
                    className="rounded-full text-xs font-bold gap-1.5 flex-1 bg-primary text-primary-foreground h-8"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t.openAnalysis}</span>
                  </Button>

                  <Button
                    id={`btn-delete-scan-${item.id}`}
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteScan(item.id)}
                    className="rounded-full text-xs font-semibold text-destructive hover:bg-destructive/10 border-destructive/30 h-8 px-2.5"
                    title={t.deleteScan}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
