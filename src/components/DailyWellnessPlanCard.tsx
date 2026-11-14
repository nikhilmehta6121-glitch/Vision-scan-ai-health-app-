import React, { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Bell, 
  Droplet, 
  Utensils, 
  Flame, 
  Scale, 
  MessageSquare, 
  TrendingUp,
  Info,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { UserGoals, DailyWellnessLog, WeightEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DailyWellnessPlanCardProps {
  goals: UserGoals;
  todayLog: DailyWellnessLog;
  weeklyLogs: DailyWellnessLog[];
  weightEntries: WeightEntry[];
  onNavigate: (tab: any) => void;
  onUpdateTodayLog: (updated: Partial<DailyWellnessLog>) => void;
}

export const DailyWellnessPlanCard: React.FC<DailyWellnessPlanCardProps> = ({
  goals,
  todayLog,
  weeklyLogs,
  weightEntries,
  onNavigate,
  onUpdateTodayLog,
}) => {
  // Checkable daily action items state stored locally
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("healthy_wellness_actions_" + todayLog.date);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [reminderActive, setReminderActive] = useState<boolean>(true);

  const toggleAction = (id: string, defaultCompleted: boolean) => {
    const current = completedActions[id] !== undefined ? completedActions[id] : defaultCompleted;
    const updated = { ...completedActions, [id]: !current };
    setCompletedActions(updated);
    try {
      localStorage.setItem("healthy_wellness_actions_" + todayLog.date, JSON.stringify(updated));
    } catch (e) {}

    if (!current) {
      toast.success("Action marked as completed! Keep going!");
    }
  };

  // Generate 3-5 action items based on real tracked data
  const isWaterDone = todayLog.waterMl >= goals.dailyWaterMl;
  const isProteinDone = todayLog.proteinG >= goals.dailyProteinG;
  const isScanDone = todayLog.scansCount >= goals.dailyFoodScansGoal;
  const isWeightDone = weightEntries.some(w => w.date.startsWith(todayLog.date));

  const planActions = [
    {
      id: "action-water",
      title: isWaterDone ? "Hydration Goal Completed" : `Drink ${Math.max(250, goals.dailyWaterMl - todayLog.waterMl)} ml more water`,
      desc: `${todayLog.waterMl} of ${goals.dailyWaterMl} ml logged today`,
      icon: Droplet,
      color: "text-blue-500 bg-blue-500/10",
      isAutoCompleted: isWaterDone,
      actionBtn: !isWaterDone ? () => {
        onUpdateTodayLog({ waterMl: todayLog.waterMl + 250 });
        toast.success("+250 ml water logged!");
      } : undefined,
      actionLabel: "+250ml",
    },
    {
      id: "action-scan",
      title: isScanDone ? "Food Scans Completed" : "Scan a meal with AI Food Scanner 2.0",
      desc: `${todayLog.scansCount} of ${goals.dailyFoodScansGoal} meals tracked today`,
      icon: Utensils,
      color: "text-emerald-500 bg-emerald-500/10",
      isAutoCompleted: isScanDone,
      actionBtn: () => onNavigate("scan"),
      actionLabel: "Scan Food",
    },
    {
      id: "action-protein",
      title: isProteinDone ? "Protein Target Reached" : `Reach ${goals.dailyProteinG}g daily protein target`,
      desc: `${todayLog.proteinG}g / ${goals.dailyProteinG}g completed so far`,
      icon: Flame,
      color: "text-purple-500 bg-purple-500/10",
      isAutoCompleted: isProteinDone,
      actionBtn: () => onNavigate("scan"),
      actionLabel: "Log Protein",
    },
    {
      id: "action-weight",
      title: isWeightDone ? "Weight Logged for Today" : "Record your current body weight",
      desc: isWeightDone 
        ? `Logged at ${weightEntries[0]?.weightKg} kg` 
        : "Keep your tracking frequency consistent",
      icon: Scale,
      color: "text-cyan-500 bg-cyan-500/10",
      isAutoCompleted: isWeightDone,
      actionBtn: () => onNavigate("weight"),
      actionLabel: "Log Weight",
    },
    {
      id: "action-chat",
      title: "Ask AI Wellness Assistant for tips",
      desc: "Get meal balance insights and nutrition queries answered",
      icon: MessageSquare,
      color: "text-indigo-500 bg-indigo-500/10",
      isAutoCompleted: false,
      actionBtn: () => onNavigate("chat"),
      actionLabel: "Chat AI",
    },
  ];

  // Dynamic Personalized Insights based on actual user data (No invented numbers!)
  const insights: string[] = [];

  const avgProtein = weeklyLogs.length > 0 
    ? Math.round(weeklyLogs.reduce((acc, l) => acc + l.proteinG, 0) / weeklyLogs.length) 
    : 0;

  if (weeklyLogs.length >= 2) {
    if (avgProtein > 0 && avgProtein < goals.dailyProteinG) {
      insights.push(`Your protein tracking averages ${avgProtein}g, which is lower than your ${goals.dailyProteinG}g target this week.`);
    } else if (avgProtein >= goals.dailyProteinG) {
      insights.push(`Great job! Your protein intake has consistently met your ${goals.dailyProteinG}g goal.`);
    }

    const waterDaysMet = weeklyLogs.filter(l => l.waterMl >= goals.dailyWaterMl).length;
    if (waterDaysMet >= 3) {
      insights.push(`You completed your water goal on ${waterDaysMet} of ${weeklyLogs.length} tracked days.`);
    } else {
      insights.push(`Tip: Keep a water bottle nearby to improve hydration across the day.`);
    }

    if (weightEntries.length >= 2) {
      const diff = Number((weightEntries[0].weightKg - weightEntries[1].weightKg).toFixed(1));
      if (diff !== 0) {
        insights.push(`Weight changed by ${diff > 0 ? "+" : ""}${diff} kg since previous check-in.`);
      }
    }
  } else {
    insights.push("Keep tracking for a few days to receive personalized insights.");
  }

  return (
    <Card className="rounded-3xl border-border/80 bg-card shadow-sm overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-border/60 flex flex-row items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>AI Daily Routine</span>
          </div>
          <CardTitle className="text-lg font-bold text-foreground">
            Today&apos;s Wellness Plan
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recommended actions tailored to your tracked wellness goals
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setReminderActive(!reminderActive);
            toast.info(reminderActive ? "Daily smart reminders paused." : "Daily smart reminders activated!");
          }}
          className={`rounded-full text-xs font-semibold h-8 px-3 gap-1.5 ${
            reminderActive ? "text-primary bg-primary/10" : "text-muted-foreground"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{reminderActive ? "Reminders On" : "Muted"}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Actions Checklist */}
        <div className="space-y-2.5">
          {planActions.map((action) => {
            const Icon = action.icon;
            const isDone = completedActions[action.id] !== undefined ? completedActions[action.id] : action.isAutoCompleted;

            return (
              <div
                key={action.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isDone 
                    ? "bg-muted/30 border-border/50 opacity-80" 
                    : "bg-background border-border/80 hover:border-primary/40 shadow-xs"
                }`}
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => toggleAction(action.id, action.isAutoCompleted)}
                >
                  <button type="button" className="text-primary hover:opacity-80 transition-opacity">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  <div className={`p-2 rounded-xl ${action.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="space-y-0.5">
                    <h4 className={`text-xs font-bold ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {action.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {action.desc}
                    </p>
                  </div>
                </div>

                {action.actionBtn && !isDone && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={action.actionBtn}
                    className="rounded-full text-[11px] font-bold h-7 px-3 border-border/80 hover:bg-muted"
                  >
                    {action.actionLabel}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Personalized Insights Section */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Personalized Insights
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
            {insights.map((ins, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <p>{ins}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
          <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <span>
            Daily wellness suggestions are based on your personal lifestyle inputs and do not provide medical diagnosis or treatment plans.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
