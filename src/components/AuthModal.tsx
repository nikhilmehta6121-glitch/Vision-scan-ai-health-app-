import React, { useState } from "react";
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  KeyRound, 
  CheckCircle2, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Download, 
  Trash2, 
  LogOut, 
  X,
  Camera,
  Scale,
  Droplet,
  Flame
} from "lucide-react";
import { UserGoals } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface UserAccount {
  id: string;
  email?: string;
  phone?: string;
  displayName: string;
  photoUrl?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  weightUnit: "kg" | "lb";
  waterUnit: "ml" | "oz";
  isEmailVerified: boolean;
  lastSyncedAt?: number;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onExportData: () => void;
  syncStatus: "Synced" | "Syncing..." | "Offline" | "Sync failed — Tap to retry";
  onTriggerSync: () => void;
  goals: UserGoals;
  onUpdateGoals: (newGoals: UserGoals) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onDeleteAccount,
  onExportData,
  syncStatus,
  onTriggerSync,
  goals,
  onUpdateGoals,
}) => {
  const [authMode, setAuthMode] = useState<"login" | "signup" | "phone" | "forgot" | "profile">(
    currentUser ? "profile" : "login"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [age, setAge] = useState(currentUser?.age ? String(currentUser.age) : "");
  const [height, setHeight] = useState(currentUser?.heightCm ? String(currentUser.heightCm) : "");
  const [preferredWeightUnit, setPreferredWeightUnit] = useState<"kg" | "lb">(currentUser?.weightUnit || "kg");
  const [preferredWaterUnit, setPreferredWaterUnit] = useState<"ml" | "oz">(currentUser?.waterUnit || "ml");

  if (!isOpen) return null;

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    const name = displayName.trim() || email.split("@")[0];
    const user: UserAccount = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      email: email.trim(),
      displayName: name,
      weightUnit: preferredWeightUnit,
      waterUnit: preferredWaterUnit,
      isEmailVerified: true,
      lastSyncedAt: Date.now(),
    };

    onLogin(user);
    toast.success(authMode === "signup" ? "Account created successfully!" : "Signed in successfully!");
    onClose();
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setOtpSent(true);
    toast.info("Verification code sent via SMS (Demo code: 123456)");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "123456" && otp.length < 4) {
      toast.error("Invalid verification code. Use demo code: 123456");
      return;
    }

    const user: UserAccount = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      phone: phone.trim(),
      displayName: displayName.trim() || "User " + phone.slice(-4),
      weightUnit: preferredWeightUnit,
      waterUnit: preferredWaterUnit,
      isEmailVerified: true,
      lastSyncedAt: Date.now(),
    };

    onLogin(user);
    toast.success("Phone verified and logged in!");
    onClose();
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: UserAccount = {
      ...currentUser,
      displayName: displayName.trim() || currentUser.displayName,
      age: age ? Number(age) : undefined,
      heightCm: height ? Number(height) : undefined,
      weightUnit: preferredWeightUnit,
      waterUnit: preferredWaterUnit,
      lastSyncedAt: Date.now(),
    };

    onLogin(updated);
    toast.success("Profile settings updated & synced!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-lg bg-card text-foreground rounded-3xl border border-border/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
              🍎
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Vision Scan AI Health
              </h3>
              <p className="text-[11px] text-blue-200">
                {currentUser ? "User Profile & Cloud Sync" : "Secure Account Access"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Status Pill */}
        <div className="px-6 py-2.5 bg-muted/40 border-b border-border/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {syncStatus === "Synced" ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            ) : syncStatus === "Syncing..." ? (
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span className="font-semibold text-foreground">Sync Status:</span>
            <Badge variant="outline" className={`text-[10px] font-bold ${
              syncStatus === "Synced" ? "text-emerald-600 border-emerald-300" :
              syncStatus === "Syncing..." ? "text-blue-600 border-blue-300" :
              "text-amber-600 border-amber-300"
            }`}>
              {syncStatus}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onTriggerSync}
            className="text-[11px] h-7 px-2.5 font-bold text-primary hover:bg-primary/10"
          >
            Sync Now
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {currentUser ? (
            /* Logged-In User Profile Screen */
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/70">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                </div>
                <div>
                  <h4 className="font-bold text-base text-foreground">
                    {currentUser.displayName}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {currentUser.email || currentUser.phone || "Offline User Account"}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Account Verified & Synced
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Age (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Height cm (Optional)</label>
                  <input
                    type="number"
                    min="50"
                    max="250"
                    placeholder="e.g. 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Preferred Units</label>
                  <div className="flex gap-2">
                    <select
                      value={preferredWeightUnit}
                      onChange={(e) => setPreferredWeightUnit(e.target.value as any)}
                      className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="kg">kg (Kilograms)</option>
                      <option value="lb">lb (Pounds)</option>
                    </select>

                    <select
                      value={preferredWaterUnit}
                      onChange={(e) => setPreferredWaterUnit(e.target.value as any)}
                      className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="ml">ml (Milliliters)</option>
                      <option value="oz">oz (Fluid Ounces)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground font-bold rounded-full text-xs h-10 px-6 flex-1"
                >
                  Save Profile Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onExportData}
                  className="rounded-full text-xs h-10 px-4 gap-1.5 border-border/80"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Data</span>
                </Button>
              </div>

              {/* Privacy Controls & Sign Out */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onLogout}
                  className="text-muted-foreground hover:text-foreground font-semibold text-xs h-9 px-3 gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={onDeleteAccount}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs h-9 px-3 gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </Button>
              </div>
            </form>
          ) : (
            /* Login & Sign Up Forms */
            <div className="space-y-4">
              <div className="flex rounded-2xl bg-muted/60 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    authMode === "login" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  Email Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    authMode === "signup" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("phone")}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    authMode === "phone" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  Phone OTP
                </button>
              </div>

              {authMode === "phone" ? (
                /* Phone Number Login */
                <form onSubmit={handleVerifyOtp} className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Mobile Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="e.g. +91 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  {!otpSent ? (
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full bg-primary text-primary-foreground font-bold rounded-full text-xs h-10 mt-2"
                    >
                      Send Verification Code
                    </Button>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Enter 6-Digit OTP</label>
                        <input
                          type="text"
                          placeholder="Demo OTP: 123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-center text-lg font-black tracking-widest"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground font-bold rounded-full text-xs h-10"
                      >
                        Verify & Login
                      </Button>
                    </>
                  )}
                </form>
              ) : (
                /* Email Login / Sign Up */
                <form onSubmit={handleEmailAuth} className="space-y-3 pt-2">
                  {authMode === "signup" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Your Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Nikhil Mehta"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm font-medium"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground font-bold rounded-full text-xs h-10 mt-3"
                  >
                    {authMode === "signup" ? "Create Free Account" : "Sign In to Vision Scan AI"}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Privacy & Educational Notice */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              Your data is stored securely. Vision Scan AI Health provides nutrition tracking and wellness analysis only and is not medical advice.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
