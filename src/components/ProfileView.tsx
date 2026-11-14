import React from "react";
import { 
  User, 
  Globe, 
  ShieldCheck, 
  PhoneCall, 
  Trash2, 
  Sparkles, 
  ExternalLink, 
  Building2, 
  Award,
  Check,
  HeartPulse
} from "lucide-react";
import { SupportedLanguage } from "@/types";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "@/lib/languages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ProfileViewProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onClearAllData: () => void;
  onOpenSecurityBackup?: () => void;
  onOpenAdminDashboard?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  language,
  onLanguageChange,
  onClearAllData,
  onOpenSecurityBackup,
  onOpenAdminDashboard,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all locally stored medicine scans and cache?")) {
      onClearAllData();
      toast.success("All local cache and scans cleared.");
    }
  };

  return (
    <div id="profile-view-container" className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Title */}
      <div className="space-y-0.5">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <span>{t.profileTitle}</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          {language === "hi" ? "ऐप सेटिंग्स, भाषा चयन एवं संस्थापक विवरण" : "Manage app settings, language preferences, and privacy"}
        </p>
      </div>

      {/* 1. Founder & CEO Spotlight Card */}
      <Card id="founder-profile-card" className="rounded-3xl border-primary/20 bg-linear-to-br from-primary/10 via-blue-500/5 to-card overflow-hidden shadow-md">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-3xl shadow-xl shadow-primary/20 shrink-0 border-4 border-background">
                NM
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-extrabold uppercase tracking-wider">
                  <Award className="w-3 h-3" />
                  <span>{t.founderCeo}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  {t.founderName}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-primary">
                  {t.companyName}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-background/80 border border-border/60 shadow-xs flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-medium">Direct Contact</span>
                  <span className="font-bold text-foreground text-xs">{t.contactNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-background/60 border border-border/60 text-xs leading-relaxed text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p>
              {language === "hi"
                ? "Vision Scan AI Health का उद्देश्य हर नागरिक तक AI द्वारा संचालित सुरक्षित, सुलभ और बहुभाषी स्वास्थ्य व पोषण जानकारी पहुंचाना है।"
                : "Vision Scan AI Health empowers users with verified, multilingual AI nutrition & wellness analysis, educational guidance, and absolute data privacy."}
            </p>
            {onOpenAdminDashboard && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAdminDashboard}
                className="rounded-full text-xs font-bold border-blue-500/40 text-blue-600 dark:text-blue-400 shrink-0"
              >
                <span>Founder Dashboard</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Production Security & Encrypted Backup Card */}
      {onOpenSecurityBackup && (
        <Card className="rounded-3xl border-primary/20 bg-linear-to-r from-primary/5 via-blue-500/5 to-card shadow-xs">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm text-foreground">
                  Production Security, Backup & Data Ownership
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Generate AES-GCM 256-bit encrypted backups, verify checksums, or export sanitized records.
              </p>
            </div>

            <Button
              onClick={onOpenSecurityBackup}
              size="sm"
              className="rounded-full text-xs font-bold bg-primary text-primary-foreground h-9 px-4 shrink-0 shadow-md"
            >
              <span>Manage Backups & Security</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 2. Language Preference Selector */}
      <Card id="language-preference-card" className="rounded-3xl border-border/80 shadow-xs bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span>{t.languageSettings} (11 Indian Languages)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {SUPPORTED_LANGUAGES.map((item) => {
              const isSelected = language === item.code;
              return (
                <button
                  key={item.code}
                  id={`profile-lang-${item.code}`}
                  onClick={() => onLanguageChange(item.code)}
                  className={`p-3 rounded-2xl text-xs font-semibold border flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/40 hover:bg-muted text-foreground border-border/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.flag || "🌐"}</span>
                    <div className="text-left">
                      <span className="block font-bold">{item.nativeName}</span>
                      <span className={`text-[10px] ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {item.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. Privacy Policy & Security Guarantee */}
      <Card id="privacy-guarantee-card" className="rounded-3xl border-border/80 shadow-xs bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>{t.privacyNoticeTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 text-xs text-muted-foreground leading-relaxed">
          <p>{t.privacyNoticeText}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-foreground space-y-0.5">
              <span className="font-bold text-xs block text-emerald-700 dark:text-emerald-400">
                🔒 Local-Only Storage
              </span>
              <p className="text-[11px] text-muted-foreground">
                Your food scans and wellness tracking stay in your browser's private encrypted storage.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-foreground space-y-0.5">
              <span className="font-bold text-xs block text-emerald-700 dark:text-emerald-400">
                🛡️ Zero Public Tracking
              </span>
              <p className="text-[11px] text-muted-foreground">
                Health and nutrition logs are never sold or exposed to external advertising networks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Clear Local Storage / Reset App */}
      <Card className="rounded-3xl border-border/80 shadow-xs bg-card">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-bold text-sm text-foreground block">
              {language === "hi" ? "स्थानीय डेटा एवं कैश हटाएं" : "Clear Local App Cache"}
            </span>
            <p className="text-xs text-muted-foreground">
              {language === "hi" ? "सहेजी गई सभी जानकारी और इतिहास मिटाएं" : "Remove all saved scans and reset preferences"}
            </p>
          </div>

          <Button
            id="btn-profile-clear-cache"
            variant="outline"
            size="sm"
            onClick={handleClearData}
            className="rounded-full text-xs font-semibold text-destructive hover:bg-destructive/10 border-destructive/30 h-9 px-4"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            <span>{t.clearAllHistory}</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
