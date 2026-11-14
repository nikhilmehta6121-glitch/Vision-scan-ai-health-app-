import React, { useState } from "react";
import { 
  Scale, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Calendar, 
  Info, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Clock,
  LineChart
} from "lucide-react";
import { SupportedLanguage, WeightEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface WeightTrackerViewProps {
  language: SupportedLanguage;
  weightEntries: WeightEntry[];
  onAddWeight: (weight: number, note?: string) => void;
  onDeleteWeight: (id: string) => void;
  onNavigateHome: () => void;
}

export const WeightTrackerView: React.FC<WeightTrackerViewProps> = ({
  language,
  weightEntries,
  onAddWeight,
  onDeleteWeight,
  onNavigateHome,
}) => {
  const [inputWeight, setInputWeight] = useState<string>("");
  const [inputNote, setInputNote] = useState<string>("");

  const currentEntry = weightEntries[0];
  const previousEntry = weightEntries[1];

  const weightChange = currentEntry && previousEntry 
    ? Number((currentEntry.weightKg - previousEntry.weightKg).toFixed(1))
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputWeight);
    if (isNaN(val) || val <= 20 || val >= 300) {
      toast.error("Please enter a valid weight between 20 kg and 300 kg.");
      return;
    }
    onAddWeight(val, inputNote.trim() || undefined);
    setInputWeight("");
    setInputNote("");
    toast.success(`${val} kg successfully logged!`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-cyan-900 via-blue-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-cyan-200 text-xs font-bold border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Vision Scan AI Health • Weight Tracker</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Weight & Body Composition
            </h1>

            <p className="text-xs sm:text-sm text-cyan-100/90 max-w-lg leading-relaxed">
              Log daily or weekly body weight in kilograms, monitor personal trends over time, and stay consistent with your goals.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[140px]">
            <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-wider block">
              Current Weight
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-0.5">
              {currentEntry ? `${currentEntry.weightKg}` : "--"}
              <span className="text-sm font-semibold opacity-80 ml-1">kg</span>
            </div>
            {previousEntry && (
              <div className="text-[11px] font-semibold text-cyan-200 mt-1 flex items-center justify-center gap-1">
                {weightChange > 0 ? (
                  <span className="flex items-center text-amber-300">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +{weightChange} kg
                  </span>
                ) : weightChange < 0 ? (
                  <span className="flex items-center text-emerald-300">
                    <TrendingDown className="w-3 h-3 mr-0.5" /> {weightChange} kg
                  </span>
                ) : (
                  <span>No change</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Mandatory Medical Safety Disclaimer */}
      <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5 shadow-xs">
        <CardContent className="p-4 flex items-start gap-3 text-xs leading-relaxed text-amber-950 dark:text-amber-200">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-950 dark:text-amber-100 mb-0.5">
              Personal Wellness Logging Notice:
            </span>
            <p>
              This tracker is for educational and personal habit tracking purposes only. Vision Scan AI Health does not diagnose, treat, or manage obesity, eating disorders, or any medical condition. Please consult a registered dietitian or physician for clinical health assessments.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Log New Weight Entry Form */}
      <Card className="rounded-3xl border-border/80 shadow-md bg-card">
        <CardHeader className="p-6 pb-3 border-b border-border/60">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-600" />
            <span>Record Today&apos;s Weight</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground block">
                Weight in Kilograms (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  placeholder="e.g. 72.5"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  className="w-full text-xl font-bold bg-muted/40 border border-border rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-12"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                  kg
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground block">
                Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Morning, before breakfast"
                value={inputNote}
                onChange={(e) => setInputNote(e.target.value)}
                className="w-full text-sm font-medium bg-muted/40 border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <Button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl h-12 px-8 text-sm shadow-md shrink-0"
            >
              Log Weight
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 3. Simple Visual Trend Chart */}
      <Card className="rounded-3xl border-border/80 shadow-sm bg-card overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <LineChart className="w-4 h-4 text-cyan-600" />
              <span>Weight History & Progress</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Previous weight logs recorded locally on this device
            </p>
          </div>
          <Badge variant="outline" className="font-bold text-xs">
            {weightEntries.length} Records
          </Badge>
        </CardHeader>

        <CardContent className="p-6">
          {weightEntries.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Scale className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                Not enough data yet — keep tracking to see your progress.
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Enter your current weight above to establish a baseline and start monitoring your wellness trends.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simple Visual Bar Chart */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                  <span>Recent Trend</span>
                  <span>Latest: {currentEntry.weightKg} kg</span>
                </div>
                <div className="flex items-end gap-2 h-28 pt-4 pb-1">
                  {weightEntries.slice(0, 10).reverse().map((entry, idx) => {
                    const minW = Math.min(...weightEntries.map(e => e.weightKg));
                    const maxW = Math.max(...weightEntries.map(e => e.weightKg));
                    const range = maxW - minW || 1;
                    const heightPct = Math.max(20, Math.min(100, ((entry.weightKg - minW) / range) * 80 + 20));

                    return (
                      <div key={entry.id || idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                        <div 
                          className="w-full bg-cyan-500/80 group-hover:bg-cyan-600 rounded-t-lg transition-all"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[10px] font-bold text-foreground">
                          {entry.weightKg}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Entries List */}
              <div className="divide-y divide-border/60 border border-border/60 rounded-2xl overflow-hidden">
                {weightEntries.map((entry, index) => {
                  const prev = weightEntries[index + 1];
                  const diff = prev ? Number((entry.weightKg - prev.weightKg).toFixed(1)) : null;

                  return (
                    <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-foreground">
                              {entry.weightKg} kg
                            </span>
                            {diff !== null && (
                              <Badge variant="outline" className={`text-[10px] font-bold ${
                                diff > 0 ? "text-amber-600 border-amber-300" :
                                diff < 0 ? "text-emerald-600 border-emerald-300" :
                                "text-muted-foreground"
                              }`}>
                                {diff > 0 ? `+${diff}` : diff} kg
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(entry.date).toLocaleDateString()}</span>
                            {entry.note && <span>• {entry.note}</span>}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteWeight(entry.id)}
                        className="rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-50 w-8 h-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
