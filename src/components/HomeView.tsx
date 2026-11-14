import React from "react";
import { 
  Utensils, 
  Droplet, 
  Flame, 
  Scale, 
  TrendingUp, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Award, 
  Camera, 
  CheckCircle2, 
  HeartPulse, 
  PhoneCall, 
  Crown,
  FileText
} from "lucide-react";
import { AppTab, SupportedLanguage, DailyWellnessLog, UserGoals, StreakData, WeightEntry } from "@/types";
import { TRANSLATIONS } from "@/lib/languages";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DailyWellnessPlanCard } from "@/components/DailyWellnessPlanCard";

interface HomeViewProps {
  language: SupportedLanguage;
  onNavigate: (tab: AppTab) => void;
  onStartDirectScan: () => void;
  onStartFoodScan: () => void;
  todayLog?: DailyWellnessLog;
  weeklyLogs?: DailyWellnessLog[];
  goals?: UserGoals;
  streak?: StreakData;
  weightEntries?: WeightEntry[];
  onUpdateTodayLog?: (updated: Partial<DailyWellnessLog>) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onNavigate,
  onStartDirectScan,
  onStartFoodScan,
  todayLog = {
    date: new Date().toISOString().split("T")[0],
    waterMl: 1750,
    proteinG: 48,
    caloriesKcal: 1650,
    scansCount: 2,
    hasWeightLogged: true,
    score: 82,
  },
  weeklyLogs = [],
  goals = {
    dailyWaterMl: 2500,
    dailyProteinG: 60,
    dailyCaloriesKcal: 2000,
    dailyFoodScansGoal: 3,
    weightTrackingFrequency: "daily",
  },
  streak = {
    currentStreak: 5,
    longestStreak: 12,
    lastActiveDate: new Date().toISOString().split("T")[0],
  },
  weightEntries = [],
  onUpdateTodayLog = () => {},
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Dynamic Greeting based on current local hour
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 
    ? "Good Morning" 
    : currentHour < 17 
    ? "Good Afternoon" 
    : "Good Evening";

  // Percentages for Progress Rings/Bars
  const waterPct = goals.dailyWaterMl > 0 ? Math.min(100, Math.round((todayLog.waterMl / goals.dailyWaterMl) * 100)) : 0;
  const proteinPct = goals.dailyProteinG > 0 ? Math.min(100, Math.round((todayLog.proteinG / goals.dailyProteinG) * 100)) : 0;
  const nutritionPct = todayLog.score || 82;

  return (
    <div className="space-y-7 pb-20 max-w-5xl mx-auto">
      
      {/* 1. Hero Banner: Greeting, Logo, and Score */}
      <div 
        id="home-hero-banner"
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-9 shadow-2xl border border-white/10"
      >
        <div className="relative z-10 max-w-2xl space-y-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
              <span className="text-sm">🍎</span>
              <span>Vision Scan AI Health</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <span>🔥</span>
              <span>{streak.currentStreak} Day Streak</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
            {greeting}, Wellness Champion!
          </h1>

          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-xl">
            Analyze visible foods with AI Food Scanner 2.0, review multi-dish nutrients, and track daily hydration, protein, and wellness goals.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              id="hero-scan-food-btn"
              size="lg"
              onClick={onStartFoodScan}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 rounded-full shadow-lg transition-transform hover:scale-105 gap-2.5 h-12 text-sm border border-emerald-400/40"
            >
              <span className="text-xl">🍎</span>
              <span>Scan Food</span>
            </Button>

            <Button
              id="hero-btn-weight"
              variant="outline"
              size="lg"
              onClick={() => onNavigate("weight")}
              className="bg-white/10 text-white hover:bg-white/20 font-bold px-5 rounded-full border-white/25 gap-2 h-12 text-xs"
            >
              <Scale className="w-4 h-4 text-cyan-300" />
              <span>Weight</span>
            </Button>

            <Button
              id="hero-btn-progress"
              variant="outline"
              size="lg"
              onClick={() => onNavigate("progress")}
              className="bg-white/10 text-white hover:bg-white/20 font-bold px-5 rounded-full border-white/25 gap-2 h-12 text-xs"
            >
              <TrendingUp className="w-4 h-4 text-amber-300" />
              <span>Progress</span>
            </Button>

            <Button
              id="hero-btn-chat"
              variant="outline"
              size="lg"
              onClick={() => onNavigate("chat")}
              className="bg-white/10 text-white hover:bg-white/20 font-bold px-5 rounded-full border-white/25 gap-2 h-12 text-xs"
            >
              <MessageSquare className="w-4 h-4 text-blue-300" />
              <span>AI Assistant</span>
            </Button>
          </div>
        </div>

        {/* Big Health Score Badge on Right */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center justify-center p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl text-center min-w-[150px]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200 block mb-1">
            Health Score
          </span>
          <div className="text-4xl font-black text-white flex items-baseline gap-0.5">
            <span>{nutritionPct}</span>
            <span className="text-sm font-semibold opacity-80">/100</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-bold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Lifestyle Index
          </span>
        </div>
      </div>

      {/* 2. Today's Progress Cards (Water, Protein, Nutrition Score) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Water Progress */}
        <Card className="rounded-3xl border-border/80 shadow-xs bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Droplet className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Water Progress</span>
            </div>
            <Badge variant="outline" className="text-xs font-bold text-blue-600 border-blue-400/40">
              {waterPct}%
            </Badge>
          </div>

          <div>
            <div className="text-2xl font-black text-foreground">
              {todayLog.waterMl} <span className="text-xs font-bold text-muted-foreground">/ {goals.dailyWaterMl} ml</span>
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              Target: {goals.dailyWaterMl} ml hydration
            </span>
          </div>

          <Progress value={waterPct} className="h-2 bg-muted" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateTodayLog({ waterMl: todayLog.waterMl + 250 })}
            className="w-full rounded-full text-xs font-bold h-8 border-blue-400/30 text-blue-600 hover:bg-blue-50"
          >
            +250 ml Water
          </Button>
        </Card>

        {/* Protein Progress */}
        <Card className="rounded-3xl border-border/80 shadow-xs bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Flame className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Protein Progress</span>
            </div>
            <Badge variant="outline" className="text-xs font-bold text-purple-600 border-purple-400/40">
              {proteinPct}%
            </Badge>
          </div>

          <div>
            <div className="text-2xl font-black text-foreground">
              {todayLog.proteinG} <span className="text-xs font-bold text-muted-foreground">/ {goals.dailyProteinG} g</span>
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              Target: {goals.dailyProteinG} g daily protein
            </span>
          </div>

          <Progress value={proteinPct} className="h-2 bg-muted" />

          <Button
            variant="outline"
            size="sm"
            onClick={onStartFoodScan}
            className="w-full rounded-full text-xs font-bold h-8 border-purple-400/30 text-purple-600 hover:bg-purple-50"
          >
            Log Meal Protein
          </Button>
        </Card>

        {/* Nutrition Progress Score */}
        <Card className="rounded-3xl border-border/80 shadow-xs bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Nutrition Score</span>
            </div>
            <Badge className="bg-emerald-600 text-white text-xs font-bold">
              {nutritionPct}/100
            </Badge>
          </div>

          <div>
            <div className="text-2xl font-black text-foreground">
              {nutritionPct} <span className="text-xs font-bold text-muted-foreground">Score Index</span>
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              Based on {todayLog.scansCount} food scans today
            </span>
          </div>

          <Progress value={nutritionPct} className="h-2 bg-muted" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("progress")}
            className="w-full rounded-full text-xs font-bold h-8 border-emerald-400/30 text-emerald-700 hover:bg-emerald-50"
          >
            View 7-Day Chart
          </Button>
        </Card>
      </div>

      {/* 3. Mandatory Non-Medical Disclaimer Banner */}
      <div 
        id="home-medical-disclaimer-card"
        className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 flex items-start gap-3 text-xs leading-relaxed"
      >
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-950 dark:text-amber-100 mb-0.5">
            Important Wellness Notice:
          </span>
          <p>
            This information is for wellness/educational purposes and is not medical advice. Vision Scan AI Health does not diagnose diseases or prescribe medicines/treatments. Always consult a qualified physician or registered dietitian for medical questions.
          </p>
        </div>
      </div>

      {/* 4. Dedicated AI Food Scanner 2.0 Feature Card */}
      <Card 
        id="home-food-scan-highlight-card" 
        className="rounded-3xl border-2 border-emerald-500/40 bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-card shadow-md overflow-hidden"
      >
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-emerald-600/30 shrink-0">
              🍎
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-2xl font-black text-foreground">
                  AI Food Scanner 2.0
                </h3>
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                  Multi-Item Vision
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                Take a food photo or upload from gallery. Automatically detects visible dishes separately (e.g., Roti, Dal, Rice, Salad) and gives individual plus total meal calories, protein, carbs, fat, calcium, potassium, fiber, and nutrition score.
              </p>
            </div>
          </div>

          <Button
            id="btn-home-large-food-scan"
            size="lg"
            onClick={onStartFoodScan}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 rounded-full shadow-xl transition-transform hover:scale-105 gap-2.5 h-14 text-base shrink-0 w-full sm:w-auto"
          >
            <span className="text-2xl">🍎</span>
            <span>Food Scan</span>
          </Button>
        </CardContent>
      </Card>

      {/* 5. Today's Wellness Plan & Action Checklist Card */}
      <DailyWellnessPlanCard
        goals={goals}
        todayLog={todayLog}
        weeklyLogs={weeklyLogs}
        weightEntries={weightEntries}
        onNavigate={onNavigate}
        onUpdateTodayLog={onUpdateTodayLog}
      />

      {/* 6. Quick Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card 
          onClick={onStartFoodScan}
          className="rounded-2xl border-border/80 bg-card p-4 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto text-xl group-hover:scale-110 transition-transform">
            🍎
          </div>
          <h4 className="font-bold text-xs text-foreground">Scan Food</h4>
          <span className="text-[10px] text-muted-foreground block">Camera or Photo</span>
        </Card>

        <Card 
          onClick={() => onNavigate("weight")}
          className="rounded-2xl border-border/80 bg-card p-4 hover:border-cyan-500/50 hover:shadow-md transition-all cursor-pointer text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center mx-auto text-xl group-hover:scale-110 transition-transform">
            ⚖️
          </div>
          <h4 className="font-bold text-xs text-foreground">Weight Tracker</h4>
          <span className="text-[10px] text-muted-foreground block">Manual kg Logs</span>
        </Card>

        <Card 
          onClick={() => onNavigate("progress")}
          className="rounded-2xl border-border/80 bg-card p-4 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto text-xl group-hover:scale-110 transition-transform">
            📈
          </div>
          <h4 className="font-bold text-xs text-foreground">7-Day Progress</h4>
          <span className="text-[10px] text-muted-foreground block">Weekly Dashboard</span>
        </Card>

        <Card 
          onClick={() => onNavigate("chat")}
          className="rounded-2xl border-border/80 bg-card p-4 hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer text-center space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto text-xl group-hover:scale-110 transition-transform">
            💬
          </div>
          <h4 className="font-bold text-xs text-foreground">AI Coach</h4>
          <span className="text-[10px] text-muted-foreground block">Nutrition Questions</span>
        </Card>
      </div>

    </div>
  );
};
