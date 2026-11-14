import React, { useState } from "react";
import { Pill, Globe, PhoneCall, ShieldAlert, Sparkles, ChevronDown, Check, Lock } from "lucide-react";
import { SupportedLanguage, AppTab } from "@/types";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "@/lib/languages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  language,
  onLanguageChange,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/60 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div 
          id="app-brand-logo"
          onClick={() => onSelectTab("home")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            <Pill className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                HEALTHY
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                AI Health
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline-block">
              {t.appSubtitle} • Founder & CEO: Nikhil Mehta
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/50">
          <button
            id="nav-tab-home"
            onClick={() => onSelectTab("home")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
              currentTab === "home"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.navHome}
          </button>
          <button
            id="nav-tab-scan"
            onClick={() => onSelectTab("scan")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
              currentTab === "scan"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.navScan}
          </button>
          <button
            id="nav-tab-coach"
            onClick={() => onSelectTab("coach")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
              currentTab === "coach"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            AI Coach
          </button>
          <button
            id="nav-tab-chat"
            onClick={() => onSelectTab("chat")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
              currentTab === "chat"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.navChat}
          </button>
          <button
            id="nav-tab-history"
            onClick={() => onSelectTab("history")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
              currentTab === "history"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.navHistory}
          </button>
          <button
            id="nav-tab-profile"
            onClick={() => onSelectTab("profile")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
              currentTab === "profile"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.navProfile}
          </button>
        </nav>

        {/* Right Section: Founder Portal + Language Selector */}
        <div className="flex items-center gap-2">
          {/* Founder Dashboard Link */}
          <button
            id="btn-admin-portal"
            onClick={() => onSelectTab("admin")}
            className={`h-9 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border ${
              currentTab === "admin"
                ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30"
                : "bg-muted/50 hover:bg-muted text-foreground border-border/80"
            }`}
            title="Founder & Admin Dashboard"
          >
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Founder</span>
          </button>
          {/* Language Selector Dropdown */}
          <div className="relative">
            <Button
              id="language-selector-btn"
              variant="outline"
              size="sm"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="h-9 px-3 gap-1.5 rounded-full border-border/80 bg-background/80 hover:bg-muted font-medium text-xs shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>{currentLangObj.nativeName}</span>
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </Button>

            {langMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setLangMenuOpen(false)} 
                />
                <div 
                  id="language-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 bg-background rounded-2xl border border-border shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto"
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {t.languageSettings}
                  </div>
                  {SUPPORTED_LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      id={`lang-option-${item.code}`}
                      onClick={() => {
                        onLanguageChange(item.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl text-left transition-colors ${
                        language === item.code
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.flag || "🌐"}</span>
                        <span>{item.nativeName}</span>
                        <span className="text-[10px] text-muted-foreground">({item.name})</span>
                      </div>
                      {language === item.code && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Scan Action Button on Mobile */}
          <Button
            id="nav-quick-scan-btn"
            size="sm"
            onClick={() => onSelectTab("scan")}
            className="md:hidden h-9 px-3 rounded-full bg-primary text-primary-foreground font-semibold text-xs shadow-xs"
          >
            {t.navScan}
          </Button>
        </div>
      </div>
    </header>
  );
};
