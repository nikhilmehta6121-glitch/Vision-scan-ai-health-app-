import React, { useState, useEffect } from "react";
import { ShieldAlert, Lock, Mail, Key, AlertCircle, Eye, EyeOff, X, CheckCircle2 } from "lucide-react";
import { AdminSession } from "@/types";
import { authenticateAdmin, checkRateLimitStatus } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AdminSession) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(checkRateLimitStatus());

  useEffect(() => {
    if (isOpen) {
      setRateLimitInfo(checkRateLimitStatus());
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both administrator email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authenticateAdmin(email, password);
      if (res.success && res.session) {
        toast.success(`Welcome back, ${res.session.user.name}`);
        onLoginSuccess(res.session);
        onClose();
      } else {
        setErrorMessage(res.error || "Authentication failed.");
        setRateLimitInfo(checkRateLimitStatus());
      }
    } catch (err) {
      console.error("Login exception", err);
      setErrorMessage("An unexpected error occurred during secure authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        id="admin-login-dialog"
        className="relative w-full max-w-md bg-slate-900 border border-blue-900/60 rounded-3xl shadow-2xl text-slate-100 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Security Badge */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10 mb-1">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 block">
              Restricted Access • RBAC Protected
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Founder & Admin Portal
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Vision Scan AI Health internal administrative operations
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Unauthorized access attempts are monitored and recorded in the immutable audit log with cryptographic hashing.
          </span>
        </div>

        {/* Error / Lockout Banner */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {rateLimitInfo.isLocked && (
          <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs">
            Account temporarily locked due to security policy. Please retry in {rateLimitInfo.lockMinutesRemaining} minutes.
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Email</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@visionscan.ai"
              disabled={isLoading || rateLimitInfo.isLocked}
              required
              className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500 h-11 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-400" />
              <span>Security Password</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading || rateLimitInfo.isLocked}
                required
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500 h-11 text-xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || rateLimitInfo.isLocked}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-600/30 transition-all mt-2"
          >
            {isLoading ? "Verifying Credentials..." : "Authenticate & Enter Dashboard"}
          </Button>
        </form>

        {/* Security Compliance Footer */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>End-to-End Encrypted Session • 30-min Timeout</span>
          </p>
        </div>
      </div>
    </div>
  );
};
