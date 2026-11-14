import React, { useState, useEffect } from "react";
import { AppTab, SupportedLanguage, ScanItem, MedicineAnalysis, FoodAnalysis } from "@/types";
import { getDefaultLanguage, TRANSLATIONS } from "@/lib/languages";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { HomeView } from "@/components/HomeView";
import { ScanView } from "@/components/ScanView";
import { ChatView } from "@/components/ChatView";
import { HistoryView } from "@/components/HistoryView";
import { ProfileView } from "@/components/ProfileView";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import { NutritionCoachView } from "@/components/NutritionCoachView";
import { FamilyProfilesView } from "@/components/FamilyProfilesView";
import { CommunityView } from "@/components/CommunityView";
import { AdminDashboardView } from "@/components/AdminDashboardView";
import { AdminLoginModal } from "@/components/AdminLoginModal";
import { SecurityBackupModal } from "@/components/SecurityBackupModal";
import { SmartGoalsModal } from "@/components/SmartGoalsModal";
import { ProgressView } from "@/components/ProgressView";
import { WeightTrackerView } from "@/components/WeightTrackerView";
import { PremiumView } from "@/components/PremiumView";
import { getCurrentAdminSession, logoutAdmin } from "@/lib/adminAuth";
import { getActiveProfile, getFamilyProfiles } from "@/lib/familyProfiles";
import { AdminSession, FamilyProfile, DailyWellnessLog, UserGoals, StreakData, WeightEntry } from "@/types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>("home");
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => getCurrentAdminSession());
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isSecurityBackupOpen, setIsSecurityBackupOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState<FamilyProfile>(() => getActiveProfile());

  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("healthy_app_lang") as SupportedLanguage;
      if (savedLang) return savedLang;
    }
    return getDefaultLanguage();
  });

  const [scans, setScans] = useState<ScanItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("healthy_scans_history");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse scans history", e);
      }
    }
    return [];
  });

  const [activeMedicineContext, setActiveMedicineContext] = useState<MedicineAnalysis | null>(null);
  const [activeFoodContext, setActiveFoodContext] = useState<FoodAnalysis | null>(null);
  const [selectedScanForInspection, setSelectedScanForInspection] = useState<ScanItem | null>(null);
  const [scanMode, setScanMode] = useState<"health" | "food" | "ocr" | "objects" | "describe">("health");

  const [goals, setGoals] = useState<UserGoals>(() => {
    try {
      const saved = localStorage.getItem("vision_scan_user_goals");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse goals", e);
    }
    return {
      dailyWaterMl: 2500,
      dailyProteinG: 60,
      dailyCaloriesKcal: 2000,
      dailyFoodScansGoal: 3,
      weightTrackingFrequency: "daily",
    };
  });

  const [todayLog, setTodayLog] = useState<DailyWellnessLog>(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    try {
      const saved = localStorage.getItem("vision_scan_daily_logs");
      if (saved) {
        const logs: DailyWellnessLog[] = JSON.parse(saved);
        const match = logs.find((l) => l.date === todayStr);
        if (match) return match;
      }
    } catch (e) {
      console.error("Failed to parse daily logs", e);
    }
    return {
      date: todayStr,
      waterMl: 1750,
      proteinG: 48,
      caloriesKcal: 1650,
      scansCount: 2,
      hasWeightLogged: true,
      score: 82,
    };
  });

  const [weeklyLogs, setWeeklyLogs] = useState<DailyWellnessLog[]>(() => {
    try {
      const saved = localStorage.getItem("vision_scan_daily_logs");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse weekly logs", e);
    }
    return [];
  });

  const [streak, setStreak] = useState<StreakData>(() => {
    try {
      const saved = localStorage.getItem("vision_scan_streak");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse streak", e);
    }
    return {
      currentStreak: 5,
      longestStreak: 12,
      lastActiveDate: new Date().toISOString().split("T")[0],
    };
  });

  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(() => {
    try {
      const saved = localStorage.getItem("vision_scan_weight_history");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse weight entries", e);
    }
    return [
      { id: "w_init_1", date: new Date().toISOString().split("T")[0], weightKg: 72.4 },
      { id: "w_init_2", date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0], weightKg: 73.1 },
    ];
  });

  const handleUpdateTodayLog = (updated: Partial<DailyWellnessLog>) => {
    setTodayLog((prev) => {
      const next = { ...prev, ...updated };
      try {
        const saved = localStorage.getItem("vision_scan_daily_logs");
        const list: DailyWellnessLog[] = saved ? JSON.parse(saved) : [];
        const filtered = list.filter((l) => l.date !== next.date);
        localStorage.setItem("vision_scan_daily_logs", JSON.stringify([...filtered, next]));
      } catch (e) {
        console.error("Failed to persist daily logs", e);
      }
      return next;
    });
  };

  const handleUpdateGoals = (newGoals: UserGoals) => {
    setGoals(newGoals);
    localStorage.setItem("vision_scan_user_goals", JSON.stringify(newGoals));
    toast.success("Wellness goals updated!");
  };

  const handleAddWeight = (weight: number, note?: string) => {
    const newEntry: WeightEntry = {
      id: `weight_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      weightKg: weight,
      note,
    };
    setWeightEntries((prev) => {
      const updated = [newEntry, ...prev];
      localStorage.setItem("vision_scan_weight_history", JSON.stringify(updated));
      return updated;
    });
    handleUpdateTodayLog({ hasWeightLogged: true });
  };

  const handleDeleteWeight = (id: string) => {
    setWeightEntries((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      localStorage.setItem("vision_scan_weight_history", JSON.stringify(updated));
      return updated;
    });
    toast.success("Weight entry removed.");
  };

  // Synchronize language change to localStorage
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    localStorage.setItem("healthy_app_lang", newLang);
    toast.success(`Language set to ${newLang.toUpperCase()}`);
  };

  // Synchronize scans to localStorage
  const handleSaveScan = (newScan: ScanItem) => {
    setScans((prev) => {
      const filtered = prev.filter((s) => s.id !== newScan.id);
      const updated = [newScan, ...filtered].slice(0, 50);
      try {
        localStorage.setItem("healthy_scans_history", JSON.stringify(updated));
      } catch (err) {
        console.error("Local storage save error", err);
      }
      return updated;
    });
  };

  const handleDeleteScan = (id: string) => {
    setScans((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem("healthy_scans_history", JSON.stringify(updated));
      return updated;
    });
    toast.success("Scan removed from history.");
  };

  const handleClearAllHistory = () => {
    setScans([]);
    localStorage.removeItem("healthy_scans_history");
    toast.success("All scan history cleared.");
  };

  const handleClearAllData = () => {
    setScans([]);
    localStorage.removeItem("healthy_scans_history");
    localStorage.removeItem("healthy_app_lang");
    setLanguage(getDefaultLanguage());
    setActiveMedicineContext(null);
    setActiveFoodContext(null);
    setSelectedScanForInspection(null);
    setCurrentTab("home");
  };

  const handleOpenScanFromHistory = (scan: ScanItem) => {
    setSelectedScanForInspection(scan);
    setScanMode(scan.mode);
    if (scan.medicineData) {
      setActiveMedicineContext(scan.medicineData);
      setActiveFoodContext(null);
    } else if (scan.foodData) {
      setActiveFoodContext(scan.foodData);
      setActiveMedicineContext(null);
    }
    setCurrentTab("scan");
  };

  const handleAskAiAboutMedicine = (med: MedicineAnalysis) => {
    setActiveMedicineContext(med);
    setActiveFoodContext(null);
    setCurrentTab("chat");
    toast.info("Context loaded into AI Chat!");
  };

  const handleAskAiAboutFood = (food: FoodAnalysis) => {
    setActiveFoodContext(food);
    setActiveMedicineContext(null);
    setCurrentTab("coach");
    toast.info(language === "hi" ? "खाने का पोषण AI कोच में लोड हुआ!" : "Food nutrition loaded into AI Coach!");
  };

  const handleStartDirectScan = () => {
    setSelectedScanForInspection(null);
    setScanMode("health");
    setCurrentTab("scan");
  };

  const handleStartFoodScan = () => {
    setSelectedScanForInspection(null);
    setScanMode("food");
    setCurrentTab("scan");
  };

  const handleSelectTab = (tab: AppTab) => {
    if (tab === "admin") {
      const session = getCurrentAdminSession();
      if (session) {
        setAdminSession(session);
        setCurrentTab("admin");
      } else {
        setIsAdminLoginOpen(true);
      }
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <Toaster position="top-center" richColors />

      {/* Decorative ambient background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-25">
        <div className="absolute -top-24 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px]" />
      </div>

      {/* Modals */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={(session) => {
          setAdminSession(session);
          setCurrentTab("admin");
        }}
      />

      <SecurityBackupModal
        isOpen={isSecurityBackupOpen}
        onClose={() => setIsSecurityBackupOpen(false)}
      />

      <SmartGoalsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
      />

      {/* Main Top Header Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Profile & Goal Quick Switcher Bar on Home screen */}
      {currentTab === "home" && (
        <div className="bg-muted/40 border-b border-border/60 py-2 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Current Profile:</span>
              <button
                onClick={() => setCurrentTab("family")}
                className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1 bg-background px-2.5 py-1 rounded-full border border-border/80 shadow-xs"
              >
                <span>👤 {activeProfile.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">({activeProfile.relation})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsGoalsModalOpen(true)}
                className="font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>🎯 Daily Goals</span>
              </button>
              <span className="text-border">•</span>
              <button
                onClick={() => setCurrentTab("coach")}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>🥗 AI Coach</span>
              </button>
              <span className="text-border">•</span>
              <button
                onClick={() => setCurrentTab("community")}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>🌐 Community</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Content View */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 md:pb-12">
        {currentTab === "home" && (
          <HomeView
            language={language}
            onNavigate={handleSelectTab}
            onStartDirectScan={handleStartDirectScan}
            onStartFoodScan={handleStartFoodScan}
            todayLog={todayLog}
            weeklyLogs={weeklyLogs}
            goals={goals}
            streak={streak}
            weightEntries={weightEntries}
            onUpdateTodayLog={handleUpdateTodayLog}
          />
        )}

        {currentTab === "progress" && (
          <ProgressView
            language={language}
            goals={goals}
            onUpdateGoals={handleUpdateGoals}
            weeklyLogs={weeklyLogs}
            todayLog={todayLog}
            onUpdateTodayLog={handleUpdateTodayLog}
            streak={streak}
            weightEntries={weightEntries}
            onNavigate={handleSelectTab}
          />
        )}

        {currentTab === "weight" && (
          <WeightTrackerView
            language={language}
            weightEntries={weightEntries}
            onAddWeight={handleAddWeight}
            onDeleteWeight={handleDeleteWeight}
            onNavigateHome={() => handleSelectTab("home")}
          />
        )}

        {currentTab === "premium" && (
          <PremiumView
            language={language}
            onNavigate={handleSelectTab}
          />
        )}

        {currentTab === "scan" && (
          <ScanView
            language={language}
            onSaveScan={handleSaveScan}
            onAskAiWithContext={handleAskAiAboutMedicine}
            onAskAiWithFoodContext={handleAskAiAboutFood}
            initialScanItem={selectedScanForInspection}
            initialMode={scanMode}
            onClearInitialScan={() => setSelectedScanForInspection(null)}
          />
        )}

        {currentTab === "coach" && (
          <NutritionCoachView
            language={language}
            onNavigateToScan={handleStartFoodScan}
          />
        )}

        {currentTab === "family" && (
          <FamilyProfilesView
            onProfileSwitched={(p) => setActiveProfile(p)}
          />
        )}

        {currentTab === "community" && (
          <CommunityView />
        )}

        {currentTab === "chat" && (
          <ChatView
            language={language}
            activeMedicineContext={activeMedicineContext}
            onClearMedicineContext={() => setActiveMedicineContext(null)}
            activeFoodContext={activeFoodContext}
            onClearFoodContext={() => setActiveFoodContext(null)}
          />
        )}

        {currentTab === "history" && (
          <HistoryView
            scans={scans}
            language={language}
            onOpenScan={handleOpenScanFromHistory}
            onDeleteScan={handleDeleteScan}
            onClearAll={handleClearAllHistory}
            onStartNewScan={handleStartDirectScan}
          />
        )}

        {currentTab === "profile" && (
          <ProfileView
            language={language}
            onLanguageChange={handleLanguageChange}
            onClearAllData={handleClearAllData}
            onOpenSecurityBackup={() => setIsSecurityBackupOpen(true)}
            onOpenAdminDashboard={() => handleSelectTab("admin")}
          />
        )}

        {currentTab === "admin" && adminSession && (
          <AdminDashboardView
            session={adminSession}
            onLogout={() => {
              setAdminSession(null);
              logoutAdmin();
              setCurrentTab("home");
            }}
            onExitToApp={() => setCurrentTab("home")}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        language={language}
        scanCount={scans.length}
      />
    </div>
  );
}
