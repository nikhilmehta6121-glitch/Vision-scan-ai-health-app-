import React from "react";
import { Home, Camera, MessageSquare, History, User, Bot } from "lucide-react";
import { AppTab, SupportedLanguage } from "@/types";
import { TRANSLATIONS } from "@/lib/languages";

interface BottomNavProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  language: SupportedLanguage;
  scanCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  language,
  scanCount = 0,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const items: { id: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "home", label: t.navHome, icon: Home },
    { id: "coach", label: "AI Coach", icon: Bot },
    { id: "scan", label: t.navScan, icon: Camera },
    { id: "chat", label: t.navChat, icon: MessageSquare },
    { id: "profile", label: t.navProfile, icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border/80 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isScan = item.id === "scan";

          if (isScan) {
            return (
              <button
                key={item.id}
                id={`bottom-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className="relative -top-3 flex flex-col items-center group"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform border-4 border-background">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-primary mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors relative ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                {item.id === "history" && scanCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {scanCount > 9 ? "9+" : scanCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium mt-1 ${isActive ? "font-bold text-primary" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
