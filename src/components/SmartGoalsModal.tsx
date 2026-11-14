import React, { useState, useEffect } from "react";
import { 
  Target, 
  CheckCircle2, 
  Sparkles, 
  Trophy, 
  Flame, 
  X, 
  Plus, 
  Trash2, 
  Pause, 
  Play, 
  TrendingUp, 
  Droplet, 
  Dumbbell, 
  Camera, 
  Scale, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { 
  SmartGoalItem, 
  WeeklyGoalPerformance, 
  getSmartGoals, 
  saveSmartGoals, 
  checkDailyGoalsCompletion, 
  computeWeeklyGoalPerformance 
} from "@/lib/goalsManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SmartGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalsUpdated?: () => void;
  currentStreak?: number;
}

export const SmartGoalsModal: React.FC<SmartGoalsModalProps> = ({
  isOpen,
  onClose,
  onGoalsUpdated,
  currentStreak = 7,
}) => {
  const [goals, setGoals] = useState<SmartGoalItem[]>([]);
  const [perf, setPerf] = useState<WeeklyGoalPerformance | null>(null);
  const [activeTab, setActiveTab] = useState<"goals" | "performance">("goals");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const g = getSmartGoals();
      setGoals(g);
      const p = computeWeeklyGoalPerformance(currentStreak);
      setPerf(p);
      setIsEditing(false);
    }
  }, [isOpen, currentStreak]);

  if (!isOpen) return null;

  const handleToggleGoal = (id: string) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, isEnabled: !g.isEnabled } : g));
    setGoals(updated);
    saveSmartGoals(updated);
    if (onGoalsUpdated) onGoalsUpdated();
    toast.success("Goal status updated.");
  };

  const handleTogglePause = (id: string) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, isPaused: !g.isPaused } : g));
    setGoals(updated);
    saveSmartGoals(updated);
    if (onGoalsUpdated) onGoalsUpdated();
    toast.success("Goal paused / resumed.");
  };

  const handleUpdateTarget = (id: string, newTarget: number) => {
    if (newTarget <= 0) return;
    const updated = goals.map((g) => (g.id === id ? { ...g, targetValue: newTarget } : g));
    setGoals(updated);
    saveSmartGoals(updated);
    if (onGoalsUpdated) onGoalsUpdated();
  };

  const completionStatus = checkDailyGoalsCompletion(goals);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        id="smart-goals-dialog"
        className="relative w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl text-foreground p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Set Your Wellness Goals
              </h2>
              <span className="text-xs text-muted-foreground">
                Personal targets • Daily progress rings • Weekly consistency
              </span>
            </div>
          </div>
        </div>

        {/* Daily Completion Banner if all active goals reached */}
        {completionStatus.isAllCompleted && (
          <div className="p-4 rounded-2xl bg-linear-to-r from-amber-500/20 via-primary/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-between text-xs animate-in zoom-in-95">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎉</span>
              <div>
                <span className="font-extrabold text-foreground block">
                  Daily goals completed!
                </span>
                <span className="text-muted-foreground text-[11px]">
                  All active targets reached today. Keep your streak burning!
                </span>
              </div>
            </div>
            <Badge className="bg-amber-500 text-black font-extrabold text-[10px]">
              🔥 Streak Maintained
            </Badge>
          </div>
        )}

        {/* Tabs: Goals List vs Performance */}
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-2xl border border-border/60 text-xs">
          <button
            onClick={() => setActiveTab("goals")}
            className={`flex-1 py-1.5 font-semibold rounded-xl transition-all ${
              activeTab === "goals" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Daily Goals ({completionStatus.completedCount}/{completionStatus.activeCount})
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`flex-1 py-1.5 font-semibold rounded-xl transition-all ${
              activeTab === "performance" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            My Goal Performance
          </button>
        </div>

        {/* TAB 1: GOALS LIST */}
        {activeTab === "goals" && (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {goals.map((goal) => {
                const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                const isComplete = goal.currentValue >= goal.targetValue;
                const remaining = Math.max(0, goal.targetValue - goal.currentValue);

                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      goal.isEnabled && !goal.isPaused
                        ? "bg-card border-border shadow-xs"
                        : "bg-muted/40 border-border/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{goal.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-foreground">
                              {goal.title}
                            </span>
                            {goal.isPaused && (
                              <Badge variant="outline" className="text-[9px] text-amber-500 border-amber-500/30">
                                Paused
                              </Badge>
                            )}
                            {isComplete && goal.isEnabled && !goal.isPaused && (
                              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[9px]">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                            {!isComplete && remaining > 0 && ` (${remaining} ${goal.unit} remaining)`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              defaultValue={goal.targetValue}
                              onBlur={(e) => handleUpdateTarget(goal.id, parseFloat(e.target.value) || goal.targetValue)}
                              className="w-16 h-8 text-xs text-center rounded-lg"
                            />
                            <span className="text-[10px] text-muted-foreground">{goal.unit}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-black text-primary">{pct}%</span>
                        )}

                        <button
                          onClick={() => handleTogglePause(goal.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                          title={goal.isPaused ? "Resume Goal" : "Pause Goal"}
                        >
                          {goal.isPaused ? <Play className="w-3.5 h-3.5 text-emerald-500" /> : <Pause className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleToggleGoal(goal.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            goal.isEnabled
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-input bg-background"
                          }`}
                        >
                          {goal.isEnabled && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {goal.isEnabled && !goal.isPaused && (
                      <div className="mt-2.5 w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all ${
                            isComplete ? "bg-emerald-500" : "bg-primary"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 rounded-full text-xs font-semibold"
              >
                {isEditing ? "Done Editing Targets" : "Customize Target Values"}
              </Button>

              <Button
                size="sm"
                onClick={onClose}
                className="h-8 rounded-full text-xs font-bold bg-primary text-primary-foreground px-4"
              >
                Save & Close
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: WEEKLY GOAL PERFORMANCE */}
        {activeTab === "performance" && perf && (
          <div className="space-y-4 text-xs">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/60 space-y-1">
                <span className="text-[10px] text-muted-foreground block uppercase tracking-wider font-semibold">
                  Goals Completed
                </span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {perf.totalCompletedCount} Days
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  {perf.totalMissedCount} missed of last 7 days
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/60 space-y-1">
                <span className="text-[10px] text-muted-foreground block uppercase tracking-wider font-semibold">
                  Weekly Consistency
                </span>
                <span className="text-xl font-black text-primary">
                  {perf.consistencyPercentage}%
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  Best Day: {perf.bestDay}
                </span>
              </div>
            </div>

            {/* Streak Highlight */}
            <div className="p-4 rounded-2xl bg-linear-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="font-extrabold text-sm text-foreground block">
                    🔥 {perf.currentStreak} Day Active Streak
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Personal Best: {perf.longestStreak} days in a row
                  </span>
                </div>
              </div>
              <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]">
                On Fire
              </Badge>
            </div>

            {/* AI Grounded Insights */}
            <div className="space-y-2">
              <span className="font-bold text-foreground block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>AI Performance Insights (Actual Data)</span>
              </span>
              <div className="p-3 rounded-2xl bg-muted/50 border border-border/70 space-y-1.5">
                {perf.insights.map((ins, i) => (
                  <p key={i} className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{ins}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
