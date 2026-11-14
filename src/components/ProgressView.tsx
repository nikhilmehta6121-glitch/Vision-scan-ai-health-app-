import React, { useState } from "react";
import { 
  Flame, 
  Droplet, 
  Utensils, 
  Scale, 
  Target, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  Info, 
  ChevronRight, 
  Edit3, 
  Plus, 
  Minus, 
  Activity,
  ShieldCheck,
  Zap
} from "lucide-react";
import { SupportedLanguage, UserGoals, DailyWellnessLog, StreakData, WeightEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ProgressViewProps {
  language: SupportedLanguage;
  goals: UserGoals;
  onUpdateGoals: (newGoals: UserGoals) => void;
  weeklyLogs: DailyWellnessLog[];
  todayLog: DailyWellnessLog;
  onUpdateTodayLog: (updated: Partial<DailyWellnessLog>) => void;
  streak: StreakData;
  weightEntries: WeightEntry[];
  onNavigate: (tab: any) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  language,
  goals,
  onUpdateGoals,
  weeklyLogs,
  todayLog,
  onUpdateTodayLog,
  streak,
  weightEntries,
  onNavigate,
}) => {
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempGoals, setTempGoals] = useState<UserGoals>({ ...goals });

  // Calculate percentages safely (no fake data)
  const waterPct = goals.dailyWaterMl > 0 ? Math.min(100, Math.round((todayLog.waterMl / goals.dailyWaterMl) * 100)) : 0;
  const proteinPct = goals.dailyProteinG > 0 ? Math.min(100, Math.round((todayLog.proteinG / goals.dailyProteinG) * 100)) : 0;
  const scanPct = goals.dailyFoodScansGoal > 0 ? Math.min(100, Math.round((todayLog.scansCount / goals.dailyFoodScansGoal) * 100)) : 0;

  // Day names for 7-day progress
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Weekly scores
  const validScores = weeklyLogs.map(l => l.score).filter(s => s > 0);
  const weeklyAvgScore = validScores.length > 0 
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : todayLog.score > 0 ? todayLog.score : 0;

  const totalWeeklyScans = weeklyLogs.reduce((acc, curr) => acc + curr.scansCount, todayLog.scansCount);
  const totalWaterGoalMet = weeklyLogs.filter(l => l.waterMl >= goals.dailyWaterMl).length + (todayLog.waterMl >= goals.dailyWaterMl ? 1 : 0);
  const totalProteinGoalMet = weeklyLogs.filter(l => l.proteinG >= goals.dailyProteinG).length + (todayLog.proteinG >= goals.dailyProteinG ? 1 : 0);

  const handleSaveGoals = () => {
    onUpdateGoals(tempGoals);
    setIsEditingGoals(false);
    toast.success("Personal wellness goals updated!");
  };

  const handleAddWaterQuick = (amountMl: number) => {
    const newWater = Math.max(0, todayLog.waterMl + amountMl);
    onUpdateTodayLog({ waterMl: newWater });
    toast.success(amountMl > 0 ? `+${amountMl} ml water logged!` : `${amountMl} ml adjusted`);
  };

  const handleAddProteinQuick = (amountG: number) => {
    const newProt = Math.max(0, todayLog.proteinG + amountG);
    onUpdateTodayLog({ proteinG: newProt });
    toast.success(amountG > 0 ? `+${amountG} g protein added!` : `${amountG} g adjusted`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* 1. Header Banner & Streak Status */}
      <div className="rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-bold border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Vision Scan AI Health • Progress & Streak System</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Daily Health & Progress
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 max-w-lg leading-relaxed">
              Track nutrition habits, hydration, protein intake, and consistent wellness scores across the week.
            </p>
          </div>

          {/* Streak Indicator */}
          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 backdrop-blur-md flex items-center gap-3 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-md animate-pulse">
                🔥
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider block">
                  Wellness Streak
                </span>
                <span className="text-2xl font-black text-white">
                  {streak.currentStreak} Day Streak
                </span>
                <span className="text-[10px] text-amber-100/80 block">
                  Best: {streak.longestStreak} days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Today's Health Score (0-100) Card */}
      <Card className="rounded-3xl border-border/80 shadow-md bg-card overflow-hidden">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-linear-to-br from-blue-600 via-indigo-600 to-primary text-white shadow-xl shadow-primary/20 shrink-0">
              <div className="text-center">
                <span className="text-3xl sm:text-4xl font-black block leading-none">
                  {todayLog.score}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1 block">
                  / 100
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                  Daily Habit Score
                </Badge>
                {todayLog.score >= 80 && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                Today&apos;s Health Score: {todayLog.score}/100
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Calculated purely from your logged food scans, hydration, protein targets, and weight consistency.
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Button
              onClick={() => onNavigate("scan")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full px-6 h-11 text-xs shadow-md gap-2"
            >
              <Utensils className="w-4 h-4" />
              <span>Scan Food Meal</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditingGoals(!isEditingGoals)}
              className="rounded-full font-semibold text-xs h-11 px-5 border-border/80 gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Goals</span>
            </Button>
          </div>
        </CardContent>

        {/* Clear Non-Medical Disclaimer */}
        <div className="px-6 py-3 bg-muted/40 border-t border-border/60 flex items-center gap-2.5 text-[11px] text-muted-foreground">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>
            This information is for wellness/educational purposes and is not medical advice. The daily health score is an interactive lifestyle index, not a diagnostic measurement.
          </span>
        </div>
      </Card>

      {/* 3. Goals Configuration Modal / Expander */}
      {isEditingGoals && (
        <Card className="rounded-3xl border-primary/30 bg-primary/5 shadow-md animate-in fade-in-50">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span>Customize Personal Daily Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
                <span className="text-xs font-bold text-muted-foreground block">Water Goal (ml)</span>
                <input
                  type="number"
                  step="100"
                  min="500"
                  max="6000"
                  value={tempGoals.dailyWaterMl}
                  onChange={(e) => setTempGoals({ ...tempGoals, dailyWaterMl: Number(e.target.value) })}
                  className="w-full text-lg font-black bg-muted/30 border border-border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground">e.g. 2500 ml (8-10 glasses)</span>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
                <span className="text-xs font-bold text-muted-foreground block">Protein Goal (g)</span>
                <input
                  type="number"
                  step="5"
                  min="20"
                  max="250"
                  value={tempGoals.dailyProteinG}
                  onChange={(e) => setTempGoals({ ...tempGoals, dailyProteinG: Number(e.target.value) })}
                  className="w-full text-lg font-black bg-muted/30 border border-border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground">e.g. 60g - 80g daily</span>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
                <span className="text-xs font-bold text-muted-foreground block">Calories Goal (kcal)</span>
                <input
                  type="number"
                  step="50"
                  min="1000"
                  max="4500"
                  value={tempGoals.dailyCaloriesKcal}
                  onChange={(e) => setTempGoals({ ...tempGoals, dailyCaloriesKcal: Number(e.target.value) })}
                  className="w-full text-lg font-black bg-muted/30 border border-border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground">Estimated daily budget</span>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
                <span className="text-xs font-bold text-muted-foreground block">Food Scans / Day</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="10"
                  value={tempGoals.dailyFoodScansGoal}
                  onChange={(e) => setTempGoals({ ...tempGoals, dailyFoodScansGoal: Number(e.target.value) })}
                  className="w-full text-lg font-black bg-muted/30 border border-border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground">Meals to log daily</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditingGoals(false)} className="rounded-full text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveGoals} className="bg-primary text-primary-foreground font-bold rounded-full px-5 text-xs">
                Save Goals
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Core Progress Cards (Nutrition, Protein, Water, Food Scans, Weight Tracking) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Water Card */}
        <Card className="rounded-3xl border-border/80 shadow-xs bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <Droplet className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-[11px] font-black text-blue-600 border-blue-500/30">
                {waterPct}%
              </Badge>
            </div>

            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Water Hydration
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {todayLog.waterMl} <span className="text-xs font-bold text-muted-foreground">/ {goals.dailyWaterMl} ml</span>
              </div>
            </div>

            <Progress value={waterPct} className="h-2.5 bg-muted" />

            <div className="flex items-center justify-between pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddWaterQuick(250)}
                className="rounded-full text-[11px] font-bold h-7 px-3 border-blue-500/30 text-blue-600 hover:bg-blue-50"
              >
                +250 ml
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddWaterQuick(500)}
                className="rounded-full text-[11px] font-bold h-7 px-3 border-blue-500/30 text-blue-600 hover:bg-blue-50"
              >
                +500 ml
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Protein Card */}
        <Card className="rounded-3xl border-border/80 shadow-xs bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-[11px] font-black text-purple-600 border-purple-500/30">
                {proteinPct}%
              </Badge>
            </div>

            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Protein Intake
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {todayLog.proteinG} <span className="text-xs font-bold text-muted-foreground">/ {goals.dailyProteinG} g</span>
              </div>
            </div>

            <Progress value={proteinPct} className="h-2.5 bg-muted" />

            <div className="flex items-center justify-between pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddProteinQuick(10)}
                className="rounded-full text-[11px] font-bold h-7 px-3 border-purple-500/30 text-purple-600 hover:bg-purple-50"
              >
                +10 g
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddProteinQuick(25)}
                className="rounded-full text-[11px] font-bold h-7 px-3 border-purple-500/30 text-purple-600 hover:bg-purple-50"
              >
                +25 g
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Food Scans Card */}
        <Card className="rounded-3xl border-border/80 shadow-xs bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Utensils className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-[11px] font-black text-emerald-600 border-emerald-500/30">
                {scanPct}%
              </Badge>
            </div>

            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Food Scans Today
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {todayLog.scansCount} <span className="text-xs font-bold text-muted-foreground">/ {goals.dailyFoodScansGoal} scans</span>
              </div>
            </div>

            <Progress value={scanPct} className="h-2.5 bg-muted" />

            <div className="pt-1">
              <Button
                size="sm"
                onClick={() => onNavigate("scan")}
                className="w-full rounded-full text-[11px] font-bold h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Scan Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weight Tracking Card */}
        <Card className="rounded-3xl border-border/80 shadow-xs bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-[11px] font-black text-cyan-600 border-cyan-500/30">
                {weightEntries.length > 0 ? "Tracked" : "Pending"}
              </Badge>
            </div>

            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Current Weight
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {weightEntries.length > 0 ? (
                  <>
                    {weightEntries[0].weightKg} <span className="text-xs font-bold text-muted-foreground">kg</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground">Not logged yet</span>
                )}
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground truncate">
              {weightEntries.length > 1 ? (
                <span>
                  Prev: {weightEntries[1].weightKg} kg ({weightEntries[0].weightKg - weightEntries[1].weightKg > 0 ? "+" : ""}
                  {(weightEntries[0].weightKg - weightEntries[1].weightKg).toFixed(1)} kg)
                </span>
              ) : (
                <span>Log to track progress</span>
              )}
            </div>

            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate("weight")}
                className="w-full rounded-full text-[11px] font-bold h-7 border-cyan-500/30 text-cyan-700 hover:bg-cyan-50"
              >
                Open Weight Tracker
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. 7-Day Weekly Progress Dashboard */}
      <Card className="rounded-3xl border-border/80 shadow-sm bg-card overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>7-Day Wellness Journey</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daily wellness score and weekly performance summary
            </p>
          </div>

          <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-xs">
            Weekly Avg: {weeklyAvgScore}/100
          </Badge>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
            {daysOfWeek.map((day, idx) => {
              const dayLog = weeklyLogs[idx] || (idx === 6 ? todayLog : null);
              const scoreVal = dayLog ? dayLog.score : 0;
              const hasData = scoreVal > 0;

              return (
                <div key={day} className="flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-muted/30 border border-border/50">
                  <span className="text-xs font-bold text-muted-foreground">
                    {day}
                  </span>

                  {/* Visual Bar representation */}
                  <div className="w-full h-24 bg-muted/60 rounded-xl relative flex items-end justify-center p-1 overflow-hidden">
                    {hasData ? (
                      <div 
                        className={`w-full rounded-lg transition-all duration-500 ${
                          scoreVal >= 80 ? "bg-emerald-500" :
                          scoreVal >= 60 ? "bg-blue-500" :
                          scoreVal >= 40 ? "bg-amber-500" :
                          "bg-rose-500"
                        }`}
                        style={{ height: `${Math.max(15, scoreVal)}%` }}
                      />
                    ) : (
                      <div className="w-full h-1 bg-border/80 rounded-full my-auto" />
                    )}
                  </div>

                  <span className="text-xs font-black text-foreground">
                    {hasData ? scoreVal : "-"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Insufficient data notice requirement */}
          {validScores.length < 2 && (
            <div className="mt-4 p-3.5 rounded-2xl bg-muted/50 border border-border/60 text-center text-xs text-muted-foreground">
              Not enough data yet — keep tracking for a few days to see full weekly trends.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6. Weekly Wellness Summary (Requirement 5) */}
      <Card className="rounded-3xl border-primary/20 bg-linear-to-br from-blue-950 via-slate-900 to-indigo-950 text-white shadow-xl overflow-hidden">
        <CardHeader className="p-6 sm:p-8 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-blue-200 border border-white/15 w-fit">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Weekly Summary</span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-extrabold text-white mt-2">
            Your Weekly Wellness Summary
          </CardTitle>
          <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed max-w-xl">
            A comprehensive look at your health habits, hydration, and nutrition consistency over the past 7 days.
          </p>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-200">Average Score</span>
              <div className="text-2xl font-black text-white">{weeklyAvgScore}</div>
              <span className="text-[10px] text-blue-100/70">out of 100</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-200">Food Scans</span>
              <div className="text-2xl font-black text-emerald-300">{totalWeeklyScans}</div>
              <span className="text-[10px] text-blue-100/70">dishes analyzed</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-200">Water Goal</span>
              <div className="text-2xl font-black text-cyan-300">{totalWaterGoalMet} / 7</div>
              <span className="text-[10px] text-blue-100/70">days completed</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-200">Protein Goal</span>
              <div className="text-2xl font-black text-purple-300">{totalProteinGoalMet} / 7</div>
              <span className="text-[10px] text-blue-100/70">days completed</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-200">Weight Entries</span>
              <div className="text-2xl font-black text-amber-300">{weightEntries.length}</div>
              <span className="text-[10px] text-blue-100/70">logs recorded</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-200">Active Streak</span>
              <div className="text-2xl font-black text-orange-400">🔥 {streak.currentStreak}</div>
              <span className="text-[10px] text-blue-100/70">consecutive days</span>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
