import React, { useState } from "react";
import { 
  FileText, 
  Share2, 
  Download, 
  Printer, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Utensils, 
  Droplet, 
  Flame, 
  Scale, 
  Settings2,
  Copy,
  ExternalLink,
  Info
} from "lucide-react";
import { SupportedLanguage, DailyWellnessLog, UserGoals, StreakData, WeightEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ReportViewProps {
  language: SupportedLanguage;
  weeklyLogs: DailyWellnessLog[];
  todayLog: DailyWellnessLog;
  goals: UserGoals;
  streak: StreakData;
  weightEntries: WeightEntry[];
  onClearHistory: () => void;
  onNavigate: (tab: any) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  language,
  weeklyLogs,
  todayLog,
  goals,
  streak,
  weightEntries,
  onClearHistory,
  onNavigate,
}) => {
  const [reportType, setReportType] = useState<"weekly" | "monthly">("weekly");
  const [displayName, setDisplayName] = useState<string>(() => {
    return localStorage.getItem("healthy_user_display_name") || "Wellness Champion";
  });
  const [includeWeight, setIncludeWeight] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Combine logs
  const allLogs = [...weeklyLogs, todayLog];
  const validScores = allLogs.map(l => l.score).filter(s => s > 0);
  const avgScore = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : todayLog.score || 78;

  const totalScans = allLogs.reduce((acc, l) => acc + l.scansCount, 0);
  const avgWater = allLogs.length > 0
    ? Math.round(allLogs.reduce((acc, l) => acc + l.waterMl, 0) / allLogs.length)
    : todayLog.waterMl;
  const avgProtein = allLogs.length > 0
    ? Math.round(allLogs.reduce((acc, l) => acc + l.proteinG, 0) / allLogs.length)
    : todayLog.proteinG;

  const waterCompletionDays = allLogs.filter(l => l.waterMl >= goals.dailyWaterMl).length;
  const proteinCompletionDays = allLogs.filter(l => l.proteinG >= goals.dailyProteinG).length;
  const completedGoalsCount = waterCompletionDays + proteinCompletionDays;

  // Weight info
  const latestWeight = weightEntries[0]?.weightKg;
  const previousWeight = weightEntries[1]?.weightKg;
  const weightDiff = latestWeight && previousWeight ? (latestWeight - previousWeight).toFixed(1) : null;

  // Derived Real AI Insights (no hallucinations!)
  const aiInsights: string[] = [];
  if (waterCompletionDays >= 4) {
    aiInsights.push(`You completed your daily hydration goal on ${waterCompletionDays} of ${allLogs.length} tracked days.`);
  } else {
    aiInsights.push(`Hydration tracking is building consistency; aim for a steady intake across the day.`);
  }

  if (proteinCompletionDays >= 3) {
    aiInsights.push(`Protein targets were achieved on ${proteinCompletionDays} days, supporting daily muscle nutrition.`);
  } else {
    aiInsights.push(`Adding a protein-rich food scan (e.g., lentils, tofu, paneer) can help bridge your daily goal.`);
  }

  if (streak.currentStreak >= 3) {
    aiInsights.push(`Your habit streak is strong at ${streak.currentStreak} consecutive active days!`);
  }

  if (totalScans > 0) {
    aiInsights.push(`You have logged ${totalScans} meal scans with detailed macro and micronutrient breakdowns.`);
  } else {
    aiInsights.push("Keep tracking for a few days to generate more detailed nutritional insights.");
  }

  // Share text
  const reportPeriod = reportType === "weekly" ? "Last 7 Days" : "Last 30 Days";
  const shareText = `🌟 Vision Scan AI Health - ${reportType === "weekly" ? "Weekly" : "Monthly"} Wellness Report
👤 Name: ${displayName}
📅 Period: ${reportPeriod}
🏆 Average Wellness Score: ${avgScore}/100
🔥 Current Streak: ${streak.currentStreak} Days
🥗 Total Food Scans: ${totalScans}
💧 Avg Hydration: ${avgWater} ml / day
🥩 Avg Protein: ${avgProtein} g / day
${includeWeight && latestWeight ? `⚖️ Current Weight: ${latestWeight} kg (${weightDiff ? (Number(weightDiff) > 0 ? `+${weightDiff}` : weightDiff) + " kg" : "stable"})` : ""}

✨ Tracked with Vision Scan AI Health
Note: Personal wellness & nutrition tracking only. Not medical advice.`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Vision Scan AI Health - ${reportPeriod} Wellness Report`,
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      toast.success("Shareable report copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden print:bg-white print:text-black">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-bold border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Vision Scan AI Health • Professional Wellness Reports</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white print:text-black">
              Nutrition & Wellness Report
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 max-w-lg leading-relaxed print:text-gray-700">
              Structured summary of nutrition habits, water intake, daily score progression, and wellness milestones.
            </p>
          </div>

          {/* Toggle Weekly vs Monthly */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 print:hidden">
            <button
              onClick={() => setReportType("weekly")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                reportType === "weekly" 
                  ? "bg-white text-blue-900 shadow-md" 
                  : "text-blue-100 hover:text-white"
              }`}
            >
              Weekly Report
            </button>
            <button
              onClick={() => setReportType("monthly")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                reportType === "monthly" 
                  ? "bg-white text-blue-900 shadow-md" 
                  : "text-blue-100 hover:text-white"
              }`}
            >
              Monthly Report
            </button>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5 shadow-xs print:hidden">
        <CardContent className="p-4 flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Wellness & Nutrition Notice:</strong> This report summarizes your self-tracked habits and AI food recognitions. It is not a clinical medical document, laboratory test, or disease diagnosis.
          </p>
        </CardContent>
      </Card>

      {/* Report Actions & Settings Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleShare}
            className="rounded-full bg-primary text-primary-foreground font-bold text-xs h-9 px-5 gap-1.5 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isCopied ? "Copied!" : "Share Report"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintPDF}
            className="rounded-full font-semibold text-xs h-9 px-4 gap-1.5 border-border/80"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate PDF / Print</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-full text-xs font-semibold h-9 px-3 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Report Settings</span>
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="rounded-3xl border-primary/20 bg-muted/40 p-5 space-y-4 print:hidden animate-in fade-in-50">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Report Customization
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Display Name on Report</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  localStorage.setItem("healthy_user_display_name", e.target.value);
                }}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 font-medium"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={includeWeight}
                  onChange={(e) => setIncludeWeight(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Include weight entries in report</span>
              </label>
            </div>
          </div>
          <div className="pt-2 flex justify-between items-center text-[11px] text-muted-foreground border-t border-border/60">
            <span>Data is stored privately on your device.</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[11px] h-7 px-3"
            >
              <Trash2 className="w-3 h-3 mr-1" /> Clear History
            </Button>
          </div>
        </Card>
      )}

      {/* The Printable / Shareable Report Card */}
      <div id="shareable-report-card" className="space-y-6">
        <Card className="rounded-3xl border-2 border-primary/20 shadow-xl bg-card overflow-hidden">
          
          {/* Report Card Header */}
          <div className="p-6 sm:p-8 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-200">
                <span className="text-xl">🍎</span>
                <span className="uppercase tracking-widest font-black">Vision Scan AI Health</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {reportType === "weekly" ? "Weekly" : "Monthly"} Wellness Card
              </h2>
              <p className="text-xs text-blue-100/80">
                Prepared for: <strong className="text-white">{displayName}</strong> • Period: {reportPeriod}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center min-w-[110px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                  Wellness Score
                </span>
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {avgScore}
                </span>
                <span className="text-[10px] text-blue-100/70 block">/ 100</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            
            {/* 6 Key Nutrition & Wellness Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  <Droplet className="w-4 h-4" />
                  <span>Hydration Avg</span>
                </div>
                <div className="text-xl font-black text-foreground">
                  {avgWater} <span className="text-xs text-muted-foreground font-semibold">ml/day</span>
                </div>
                <span className="text-[10px] text-muted-foreground block">{waterCompletionDays} days met target</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-xs font-bold">
                  <Flame className="w-4 h-4" />
                  <span>Protein Avg</span>
                </div>
                <div className="text-xl font-black text-foreground">
                  {avgProtein} <span className="text-xs text-muted-foreground font-semibold">g/day</span>
                </div>
                <span className="text-[10px] text-muted-foreground block">{proteinCompletionDays} days met target</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <Utensils className="w-4 h-4" />
                  <span>Food Scans</span>
                </div>
                <div className="text-xl font-black text-foreground">
                  {totalScans} <span className="text-xs text-muted-foreground font-semibold">meals</span>
                </div>
                <span className="text-[10px] text-muted-foreground block">Food Scanner 2.0</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  <span>🔥</span>
                  <span>Habit Streak</span>
                </div>
                <div className="text-xl font-black text-foreground">
                  {streak.currentStreak} <span className="text-xs text-muted-foreground font-semibold">days</span>
                </div>
                <span className="text-[10px] text-muted-foreground block">Best: {streak.longestStreak} days</span>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  <Award className="w-4 h-4" />
                  <span>Goals Completed</span>
                </div>
                <div className="text-xl font-black text-foreground">
                  {completedGoalsCount}
                </div>
                <span className="text-[10px] text-muted-foreground block">Water & protein milestones</span>
              </div>

              {includeWeight && (
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                    <Scale className="w-4 h-4" />
                    <span>Weight Status</span>
                  </div>
                  <div className="text-xl font-black text-foreground">
                    {latestWeight ? `${latestWeight} kg` : "No entries"}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    {weightDiff ? `${Number(weightDiff) > 0 ? "+" : ""}${weightDiff} kg change` : "Recorded locally"}
                  </span>
                </div>
              )}
            </div>

            {/* AI Insights Section */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/70 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>AI Nutrition & Wellness Insights</span>
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                {aiInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Watermark */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground border-t border-border/60 gap-2">
              <span>Generated by Vision Scan AI Health • Private & Local</span>
              <span>Wellness educational summary • Not medical advice</span>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
