import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Utensils, 
  Droplet, 
  Dumbbell, 
  Scale, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Bot, 
  User, 
  Calendar, 
  Info, 
  ArrowRight,
  Flame,
  PieChart
} from "lucide-react";
import { SupportedLanguage, ScanItem, WeightEntry, UserGoals, DailyWellnessLog } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CoachMessage {
  id: string;
  sender: "coach" | "user";
  text: string;
  timestamp: number;
  highlightData?: {
    totalCalories?: number;
    totalProtein?: number;
    mealsCount?: number;
    waterMl?: number;
    wellnessScore?: number;
  };
}

interface NutritionCoachViewProps {
  language: SupportedLanguage;
  onNavigateToScan?: () => void;
  onNavigateToWeight?: () => void;
}

export const NutritionCoachView: React.FC<NutritionCoachViewProps> = ({
  language,
  onNavigateToScan,
  onNavigateToWeight,
}) => {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load real user authorized data from localStorage
  const loadUserData = () => {
    let scans: ScanItem[] = [];
    let weights: WeightEntry[] = [];
    let goals: UserGoals = {
      dailyWaterMl: 2500,
      dailyProteinG: 60,
      dailyCaloriesKcal: 2000,
      dailyFoodScansGoal: 3,
      weightTrackingFrequency: "daily",
    };
    let logs: DailyWellnessLog[] = [];

    try {
      const scansRaw = localStorage.getItem("healthy_scans_history");
      if (scansRaw) scans = JSON.parse(scansRaw);

      const weightsRaw = localStorage.getItem("vision_scan_weight_history");
      if (weightsRaw) weights = JSON.parse(weightsRaw);

      const goalsRaw = localStorage.getItem("vision_scan_user_goals");
      if (goalsRaw) goals = { ...goals, ...JSON.parse(goalsRaw) };

      const logsRaw = localStorage.getItem("vision_scan_daily_logs");
      if (logsRaw) logs = JSON.parse(logsRaw);
    } catch (e) {
      console.error("Failed to load user data for coach", e);
    }

    return { scans, weights, goals, logs };
  };

  // Initial welcome message with real data summary
  useEffect(() => {
    const { scans, goals } = loadUserData();
    const todayScans = scans.filter(
      (s) => Date.now() - s.timestamp < 24 * 3600 * 1000 && (s.mode === "food" || s.foodData)
    );

    const initialText =
      todayScans.length > 0
        ? `Hello! I am your AI Nutrition Coach. Today you have tracked ${todayScans.length} meal(s). Your daily protein goal is ${goals.dailyProteinG}g. How can I assist with your wellness and nutrition goals today?`
        : `Hello! I am your AI Nutrition Coach. I am here to assist you with your personalized nutrition tracking and meal balance. Ask me any question below about your logged food, protein, or progress!`;

    setMessages([
      {
        id: "msg_init",
        sender: "coach",
        text: initialText,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Real data answer generator without fake data or medical claims
  const generateCoachResponse = (query: string): { text: string; highlightData?: CoachMessage["highlightData"] } => {
    const q = query.toLowerCase();
    const { scans, weights, goals, logs } = loadUserData();

    // Filter today's food items
    const now = Date.now();
    const oneDayMs = 24 * 3600 * 1000;
    const sevenDaysMs = 7 * oneDayMs;

    const todayFoodScans = scans.filter(
      (s) => now - s.timestamp < oneDayMs && (s.mode === "food" || s.foodData)
    );

    const weekFoodScans = scans.filter(
      (s) => now - s.timestamp < sevenDaysMs && (s.mode === "food" || s.foodData)
    );

    // 1. "What did I eat today?"
    if (q.includes("what did i eat") || q.includes("today's food") || q.includes("meals today")) {
      if (todayFoodScans.length === 0) {
        return {
          text: "You haven't tracked any meals yet today. Once you take a photo of your food or use Food Scan, your meal details and nutrients will be recorded here.",
        };
      }

      const mealNames = todayFoodScans.map((s, idx) => {
        const name = s.foodData?.foodName || s.foodData?.totalMeal?.mealName || `Tracked Meal #${idx + 1}`;
        const cal = s.foodData?.nutrition?.calories || s.foodData?.totalMeal?.calories || "Estimated kcal";
        const prot = s.foodData?.nutrition?.protein || s.foodData?.totalMeal?.protein || "g protein";
        return `• ${name} (${cal}, ${prot})`;
      }).join("\n");

      return {
        text: `Here are your tracked meals for today:\n${mealNames}\n\nTip: Consistent tracking helps you maintain a balanced wellness routine!`,
        highlightData: { mealsCount: todayFoodScans.length },
      };
    }

    // 2. "How much protein did I track today?"
    if (q.includes("protein") && (q.includes("today") || q.includes("how much"))) {
      if (todayFoodScans.length === 0) {
        return {
          text: `You have tracked 0g of protein so far today out of your daily goal of ${goals.dailyProteinG}g. Log your meals to track your daily intake.`,
        };
      }

      let totalProteinG = 0;
      todayFoodScans.forEach((s) => {
        const pStr = s.foodData?.nutrition?.protein || s.foodData?.totalMeal?.protein || "0";
        const num = parseFloat(pStr.replace(/[^0-9.]/g, "")) || 0;
        totalProteinG += num;
      });

      const rounded = Math.round(totalProteinG);
      const remaining = Math.max(0, goals.dailyProteinG - rounded);
      const pct = Math.min(100, Math.round((rounded / goals.dailyProteinG) * 100));

      const advice =
        remaining === 0
          ? "🎉 Congratulations! You have met your daily protein goal today."
          : `You have ${remaining}g remaining to reach your ${goals.dailyProteinG}g target. Consider protein-rich food such as lentils (dal), paneer, tofu, beans, or nuts.`;

      return {
        text: `Based on your tracked meals today, you have consumed approximately ${rounded}g of protein (${pct}% of your daily ${goals.dailyProteinG}g goal).\n\n${advice}`,
        highlightData: { totalProtein: rounded },
      };
    }

    // 3. "Show my nutrition progress"
    if (q.includes("progress") || q.includes("nutrition progress") || q.includes("macro")) {
      if (weekFoodScans.length === 0) {
        return {
          text: "I need more tracking data before I can give you a useful insight. Try logging your meals and hydration for at least 2–3 days.",
        };
      }

      let totalCal = 0;
      let totalProt = 0;
      weekFoodScans.forEach((s) => {
        const cStr = s.foodData?.nutrition?.calories || s.foodData?.totalMeal?.calories || "0";
        const pStr = s.foodData?.nutrition?.protein || s.foodData?.totalMeal?.protein || "0";
        totalCal += parseFloat(cStr.replace(/[^0-9.]/g, "")) || 0;
        totalProt += parseFloat(pStr.replace(/[^0-9.]/g, "")) || 0;
      });

      const avgCal = Math.round(totalCal / Math.max(1, weekFoodScans.length));
      const avgProt = Math.round(totalProt / Math.max(1, weekFoodScans.length));

      return {
        text: `Here is your 7-day nutrition summary:\n• Total Tracked Meals: ${weekFoodScans.length}\n• Average Calories per Meal: ~${avgCal} kcal\n• Average Protein per Meal: ~${avgProt} g\n\nDaily Water Target: ${goals.dailyWaterMl} ml.\nKeep tracking daily to maintain progress!`,
        highlightData: { mealsCount: weekFoodScans.length, totalProtein: avgProt, totalCalories: avgCal },
      };
    }

    // 4. "What can I improve in my food tracking?"
    if (q.includes("improve") || q.includes("tips") || q.includes("recommendation")) {
      const tips: string[] = [];

      if (todayFoodScans.length < goals.dailyFoodScansGoal) {
        tips.push(`• Track all your meals: You've logged ${todayFoodScans.length} of your target ${goals.dailyFoodScansGoal} meals today.`);
      } else {
        tips.push("• Great job logging your meals consistently today!");
      }

      if (weights.length === 0) {
        tips.push("• You haven't recorded a weight entry yet. Adding periodic weight entries helps track your long-term wellness trend.");
      } else {
        const latestWeight = weights[0].weightKg;
        tips.push(`• Latest recorded weight: ${latestWeight} kg. Remember wellness is about consistent sustainable habits.`);
      }

      tips.push("• Remember to drink water regularly throughout the day to meet your hydration target.");

      return {
        text: `Personalized suggestions based on your logged wellness activity:\n\n${tips.join("\n\n")}`,
      };
    }

    // 5. "Compare my meals this week"
    if (q.includes("compare") || q.includes("compare meals") || q.includes("this week")) {
      if (weekFoodScans.length < 2) {
        return {
          text: "I need more tracking data before I can give you a useful insight. Please log at least 2 or more meals this week to enable meal comparison.",
        };
      }

      const topCalMeal = [...weekFoodScans].sort((a, b) => {
        const cA = parseFloat(a.foodData?.nutrition?.calories || a.foodData?.totalMeal?.calories || "0") || 0;
        const cB = parseFloat(b.foodData?.nutrition?.calories || b.foodData?.totalMeal?.calories || "0") || 0;
        return cB - cA;
      })[0];

      const topProtMeal = [...weekFoodScans].sort((a, b) => {
        const pA = parseFloat(a.foodData?.nutrition?.protein || a.foodData?.totalMeal?.protein || "0") || 0;
        const pB = parseFloat(b.foodData?.nutrition?.protein || b.foodData?.totalMeal?.protein || "0") || 0;
        return pB - pA;
      })[0];

      const highestCalName = topCalMeal.foodData?.foodName || topCalMeal.foodData?.totalMeal?.mealName || "Meal";
      const highestProtName = topProtMeal.foodData?.foodName || topProtMeal.foodData?.totalMeal?.mealName || "Meal";

      return {
        text: `Here is a comparison of your meals over the last 7 days:\n• Total Meals Tracked: ${weekFoodScans.length}\n• Highest Calorie Meal: ${highestCalName} (${topCalMeal.foodData?.nutrition?.calories || topCalMeal.foodData?.totalMeal?.calories || "N/A"})\n• Highest Protein Meal: ${highestProtName} (${topProtMeal.foodData?.nutrition?.protein || topProtMeal.foodData?.totalMeal?.protein || "N/A"})\n\nBalanced meals containing fiber, vegetables, and complex grains provide steady energy throughout your day.`,
      };
    }

    // 6. Generic or General Wellness Queries (strictly non-medical)
    // Refuse medical diagnosis / prescription queries
    if (/diagnose|disease|cancer|diabetes|cure|prescribe|medicine dose|infection|fever treatment/i.test(q)) {
      return {
        text: "I am a personal nutrition and wellness assistant. I cannot diagnose medical conditions, prescribe medicines, or provide clinical treatments. For medical concerns, symptoms, or diagnoses, please consult a qualified healthcare professional.",
      };
    }

    return {
      text: `Regarding "${query}": I analyze your logged meals, protein intake, hydration, and wellness scores. You can ask me:\n• "What did I eat today?"\n• "How much protein did I track today?"\n• "Show my nutrition progress."\n• "What can I improve in my food tracking?"\n• "Compare my meals this week."`,
    };
  };

  const handleSendQuery = (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q) return;

    const userMsg: CoachMessage = {
      id: `msg_u_${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateCoachResponse(q);
      const coachMsg: CoachMessage = {
        id: `msg_c_${Date.now()}`,
        sender: "coach",
        text: response.text,
        timestamp: Date.now(),
        highlightData: response.highlightData,
      };
      setMessages((prev) => [...prev, coachMsg]);
      setIsTyping(false);
    }, 600);
  };

  const quickPrompts = [
    "What did I eat today?",
    "How much protein did I track today?",
    "Show my nutrition progress.",
    "What can I improve in my food tracking?",
    "Compare my meals this week.",
  ];

  return (
    <div id="nutrition-coach-container" className="space-y-4 max-w-4xl mx-auto pb-20">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-600 via-teal-600 to-blue-700 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md shadow-md">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">AI Nutrition Coach</h1>
                <Badge className="bg-white/20 text-white border-white/30 text-[10px] font-bold">
                  Personalized
                </Badge>
              </div>
              <p className="text-xs text-white/80">
                Ground-truth wellness analysis based strictly on your verified food and wellness logs
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Non-Medical Disclaimer */}
        <div className="p-3 rounded-2xl bg-black/25 backdrop-blur-xs border border-white/20 text-[11px] text-white/90 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
          <span>
            <strong>Wellness & Nutrition Only:</strong> This coach provides dietary and wellness insights. It does NOT diagnose diseases, prescribe medicines, or provide medical treatments.
          </span>
        </div>
      </div>

      {/* Suggested Quick Inquiry Action Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block px-1">
          Quick Inquiries
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendQuery(prompt)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <Card className="rounded-3xl border-border/80 shadow-md bg-card overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div ref={scrollRef} className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "coach" && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-600/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-xs shadow-xs"
                      : "bg-muted/60 text-foreground border border-border/60 rounded-bl-xs shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Highlight pill cards if coach returned metric cards */}
                  {msg.highlightData && (
                    <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-xs">
                      {msg.highlightData.totalProtein !== undefined && (
                        <div className="p-2 rounded-xl bg-background/80 border border-border/60 text-foreground">
                          <span className="text-[10px] text-muted-foreground block">Tracked Protein</span>
                          <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                            {msg.highlightData.totalProtein}g
                          </strong>
                        </div>
                      )}
                      {msg.highlightData.mealsCount !== undefined && (
                        <div className="p-2 rounded-xl bg-background/80 border border-border/60 text-foreground">
                          <span className="text-[10px] text-muted-foreground block">Meals Logged</span>
                          <strong className="text-primary font-black text-sm">
                            {msg.highlightData.mealsCount}
                          </strong>
                        </div>
                      )}
                      {msg.highlightData.totalCalories !== undefined && (
                        <div className="p-2 rounded-xl bg-background/80 border border-border/60 text-foreground">
                          <span className="text-[10px] text-muted-foreground block">Avg Calories</span>
                          <strong className="text-amber-600 dark:text-amber-400 font-black text-sm">
                            {msg.highlightData.totalCalories} kcal
                          </strong>
                        </div>
                      )}
                    </div>
                  )}

                  <span className={`text-[10px] block text-right opacity-70`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600/15 text-emerald-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-muted/60 border border-border/60 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="pt-2 flex items-center gap-2"
          >
            <Input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about your tracked meals, protein, or progress..."
              className="rounded-full h-11 text-xs sm:text-sm bg-background border-border"
            />
            <Button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="rounded-full h-11 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 shadow-md"
            >
              <Send className="w-4 h-4 mr-1.5" />
              <span>Ask</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
