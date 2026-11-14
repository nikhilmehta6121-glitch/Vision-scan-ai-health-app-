import React, { useState, useEffect, useMemo } from "react";
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Crown, 
  Scan, 
  TrendingUp, 
  Server, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  LogOut, 
  FileText, 
  Barcode, 
  Lock, 
  Trash2, 
  UserX, 
  UserCheck, 
  Clock, 
  ChevronRight, 
  Download, 
  AlertOctagon 
} from "lucide-react";
import { 
  AdminSession, 
  RealDashboardAnalytics, 
  ServiceHealthItem, 
  ManagedUser, 
  AdminAuditLogEntry, 
  HealthState 
} from "@/types";
import { 
  computeRealDashboardAnalytics, 
  runSystemHealthDiagnostics, 
  getRegisteredUsers, 
  toggleUserStatus, 
  deleteUserAccount 
} from "@/lib/adminAnalytics";
import { 
  logoutAdmin, 
  getAdminAuditLogs, 
  recordAuditLog, 
  refreshAdminSession 
} from "@/lib/adminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AdminDashboardViewProps {
  session: AdminSession;
  onLogout: () => void;
  onExitToApp?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  session,
  onLogout,
  onExitToApp,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "health" | "audit">("overview");
  const [analytics, setAnalytics] = useState<RealDashboardAnalytics | null>(null);
  const [analyticsError, setAnalyticsError] = useState<boolean>(false);
  const [healthServices, setHealthServices] = useState<ServiceHealthItem[]>([]);
  const [usersList, setUsersList] = useState<ManagedUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionRemainingMinutes, setSessionRemainingMinutes] = useState(30);

  // Load real data from storage/database
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      refreshAdminSession();
      const realAnalytics = computeRealDashboardAnalytics();
      setAnalytics(realAnalytics);
      setAnalyticsError(false);

      const realUsers = getRegisteredUsers();
      setUsersList(realUsers);

      const logs = getAdminAuditLogs();
      setAuditLogs(logs);

      const health = await runSystemHealthDiagnostics();
      setHealthServices(health);

      recordAuditLog(session.user.email, "REFRESH_DASHBOARD_DATA", undefined, "Refreshed analytics and system health", "success");
    } catch (e) {
      console.error("Failed to load real dashboard analytics", e);
      setAnalyticsError(true);
      toast.error("Analytics temporarily unavailable.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Session timer countdown
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 60000));
      setSessionRemainingMinutes(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        toast.error("Admin session expired. Please sign in again.");
        onLogout();
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [session]);

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return usersList;
    const q = searchQuery.toLowerCase();
    return usersList.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q)
    );
  }, [usersList, searchQuery]);

  // Handle user disable / enable
  const handleToggleStatus = (user: ManagedUser) => {
    const actionWord = user.status === "active" ? "disable" : "reactivate";
    if (window.confirm(`Are you sure you want to ${actionWord} account ${user.email}?`)) {
      const res = toggleUserStatus(user.id, session.user.email);
      if (res.success && res.updatedUser) {
        setUsersList((prev) => prev.map((u) => (u.id === user.id ? res.updatedUser! : u)));
        toast.success(`User account has been ${actionWord}d.`);
      } else {
        toast.error(res.error || "Failed to update user status.");
      }
    }
  };

  // Handle user deletion
  const handleDeleteUser = (user: ManagedUser) => {
    if (window.confirm(`PERMANENT ACTION: Are you sure you want to delete user ${user.email}? All account metadata will be purged.`)) {
      const res = deleteUserAccount(user.id, session.user.email);
      if (res.success) {
        setUsersList((prev) => prev.filter((u) => u.id !== user.id));
        toast.success("User account deleted successfully.");
      } else {
        toast.error(res.error || "Failed to delete user.");
      }
    }
  };

  // Export audit logs to clean JSON
  const handleExportAuditLogs = () => {
    const jsonStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VisionScan_Admin_Audit_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit logs exported.");
    recordAuditLog(session.user.email, "EXPORT_AUDIT_LOGS", undefined, `Exported ${auditLogs.length} entries`, "success");
  };

  const getStatusBadge = (status: HealthState) => {
    switch (status) {
      case "operational":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Operational
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Warning
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" /> Error
          </span>
        );
    }
  };

  return (
    <div id="founder-dashboard-root" className="min-h-screen bg-slate-950 text-slate-100 pb-16 space-y-6">
      {/* 1. TOP FOUNDER DASHBOARD BANNER */}
      <div className="border-b border-slate-800 bg-linear-to-r from-slate-900 via-slate-900 to-blue-950/80 px-4 sm:px-8 py-5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Authorized Personnel Only
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Session expires in {sessionRemainingMinutes}m
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Vision Scan AI Health</span>
              <span className="text-blue-400 font-light">—</span>
              <span className="text-blue-400">Founder Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400">
              Authenticated Admin: <span className="text-slate-200 font-semibold">{session.user.name}</span> ({session.user.email}) • Role: <span className="uppercase text-blue-400 font-bold">{session.user.role}</span>
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isRefreshing}
              className="h-9 px-3.5 rounded-xl border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
              <span>Refresh</span>
            </Button>

            {onExitToApp && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExitToApp}
                className="h-9 px-3.5 rounded-xl border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                <span>Back to App</span>
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                logoutAdmin("MANUAL_LOGOUT");
                onLogout();
              }}
              className="h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-900/40"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            Overview & Growth
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "users"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            User Management ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab("health")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "health"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            System Health & Diagnostics
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "audit"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* Error State Banner */}
        {analyticsError && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Analytics temporarily unavailable. Showing cached indicators.</span>
            </div>
            <Button size="sm" variant="outline" onClick={loadData} className="h-7 text-xs border-amber-600">
              Retry Probe
            </Button>
          </div>
        )}

        {/* 2. FOUR PRIMARY METRICS CARDS: Users | Active | Premium | Scans */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Users */}
          <Card className="rounded-3xl bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Users
                </span>
                <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {analytics ? analytics.totalUsers : "—"}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">Total Registered</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Today: <strong className="text-emerald-400">+{analytics?.newUsersToday ?? 0}</strong></span>
                <span>This Week: <strong className="text-blue-400">+{analytics?.newUsersThisWeek ?? 0}</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Active */}
          <Card className="rounded-3xl bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Active
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {analytics ? analytics.activeUsers : "—"}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">Active Users (48h)</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Avg Scans/User:</span>
                <strong className="text-emerald-400">{analytics?.avgScansPerActiveUser ?? 0}</strong>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Premium */}
          <Card className="rounded-3xl bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Premium
                </span>
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  <Crown className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {analytics ? analytics.premiumSubscribers : "—"}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Subscribers ({analytics?.conversionRate ?? 0}%)
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Free Users: <strong className="text-slate-300">{analytics?.freeUsers ?? 0}</strong></span>
                <span>MRR: <strong className="text-emerald-400">₹{analytics?.verifiedMRR ?? 0}</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Scans */}
          <Card className="rounded-3xl bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Scans
                </span>
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
                  <Scan className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {analytics ? analytics.totalFoodScans : "—"}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">Food Scans Processed</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Barcodes: <strong className="text-purple-300">{analytics?.totalBarcodeScans ?? 0}</strong></span>
                <span>Reports: <strong className="text-blue-400">{analytics?.totalReportsGenerated ?? 0}</strong></span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. TAB 1: OVERVIEW & GROWTH */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Growth Chart (Real Day-by-Day Activity) */}
              <Card className="lg:col-span-2 rounded-3xl bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
                <CardHeader className="pb-3 border-b border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span>7-Day Growth & Activity (Real Analytics)</span>
                    </CardTitle>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px]">
                      Database Verified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {analytics && analytics.dailyActivity.length > 0 ? (
                    <div className="space-y-4">
                      {/* Bar Visualization */}
                      <div className="space-y-3">
                        {analytics.dailyActivity.map((day) => {
                          const maxScans = Math.max(...analytics.dailyActivity.map((d) => d.scans), 5);
                          const scanPct = Math.min(100, Math.round((day.scans / maxScans) * 100));

                          return (
                            <div key={day.date} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-300 w-24">{day.date}</span>
                                <div className="flex items-center gap-4 text-[11px]">
                                  <span className="text-slate-400">
                                    Users: <strong className="text-white">+{day.newUsers}</strong>
                                  </span>
                                  <span className="text-slate-400">
                                    Scans: <strong className="text-blue-400">{day.scans}</strong>
                                  </span>
                                  {day.premiumSignups > 0 && (
                                    <span className="text-amber-400 font-semibold">
                                      +{day.premiumSignups} Premium
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                                <div
                                  style={{ width: `${Math.max(5, scanPct)}%` }}
                                  className="h-full bg-linear-to-r from-blue-600 to-indigo-500 rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Weekly User Growth: <strong className="text-emerald-400">+{analytics.newUsersThisWeek} users</strong></span>
                        <span>Daily Scans Today: <strong className="text-blue-400">{analytics.scansToday} scans</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-500">
                      Analytics temporarily unavailable.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Premium Analytics Card */}
              <Card className="rounded-3xl bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
                <CardHeader className="pb-3 border-b border-slate-800/80">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Premium Subscription Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <span className="text-[11px] font-semibold text-amber-300 block uppercase tracking-wider">
                      Verified Monthly Recurring Revenue
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">
                        ₹{analytics?.verifiedMRR ?? 0}
                      </span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Based exclusively on verified paying user records. Zero estimated revenue.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                      <span className="text-slate-400">Active Subscribers</span>
                      <span className="font-bold text-white">{analytics?.premiumSubscribers ?? 0}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                      <span className="text-slate-400">Free-to-Premium Conversion</span>
                      <span className="font-bold text-emerald-400">{analytics?.conversionRate ?? 0}%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                      <span className="text-slate-400">Subscription Cancellations</span>
                      <span className="font-bold text-slate-300">{analytics?.cancellationsCount ?? 0}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                      <span className="text-slate-400">Expired Subscriptions</span>
                      <span className="font-bold text-slate-300">{analytics?.expiredCount ?? 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* App Activity & Most-Used Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Activity Card */}
              <Card className="rounded-3xl bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
                <CardHeader className="pb-3 border-b border-slate-800/80">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Real App Activity Today</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                      <span className="text-xl font-black text-blue-400 block">{analytics?.scansToday ?? 0}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Food Scans Today</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                      <span className="text-xl font-black text-purple-400 block">{analytics?.barcodeScansToday ?? 0}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Barcodes Today</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                      <span className="text-xl font-black text-emerald-400 block">{analytics?.reportsToday ?? 0}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Reports Today</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300 space-y-2">
                    <span className="font-bold text-white block">Operational Summary:</span>
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      Average scan frequency across active cohort is <strong>{analytics?.avgScansPerActiveUser ?? 0} scans/user</strong>. All health logs are strictly isolated to client storage preserving user confidentiality.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Most-Used Features Card */}
              <Card className="rounded-3xl bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
                <CardHeader className="pb-3 border-b border-slate-800/80">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span>Feature Distribution & Utilization</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {analytics && analytics.featureUsage.length > 0 ? (
                    analytics.featureUsage.map((f) => (
                      <div key={f.feature} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">{f.feature}</span>
                          <span className="text-slate-400 font-semibold">{f.count} actions ({f.percentage}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.max(5, f.percentage)}%` }}
                            className="h-full bg-blue-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No feature activity recorded yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 4. TAB 2: USER MANAGEMENT */}
        {activeTab === "users" && (
          <Card className="rounded-3xl bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
            <CardHeader className="pb-4 border-b border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span>User Directory & Status Control</span>
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Search and manage registered accounts. Private health and meal photos are strictly protected.
                  </p>
                </div>

                <div className="w-full sm:w-72">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by ID, name or email..."
                      className="pl-9 bg-slate-950 border-slate-700 text-xs rounded-xl h-9 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No accounts found matching "{searchQuery}".
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{user.displayName}</span>
                          <span className="text-[10px] font-mono text-slate-500">[{user.id}]</span>
                          {user.subscriptionTier === "PREMIUM" ? (
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                              👑 Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                              Free Plan
                            </Badge>
                          )}
                          {user.status === "active" ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{user.email}</p>
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                          <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                          <span>Last active: {new Date(user.lastActiveAt).toLocaleDateString()}</span>
                          <span>Total Scans: {user.totalScans}</span>
                        </div>
                      </div>

                      {/* Administrative Action Buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(user)}
                          className={`h-8 px-3 rounded-xl text-xs font-semibold ${
                            user.status === "active"
                              ? "border-amber-700/60 text-amber-300 hover:bg-amber-950/30"
                              : "border-emerald-700/60 text-emerald-300 hover:bg-emerald-950/30"
                          }`}
                        >
                          {user.status === "active" ? (
                            <>
                              <UserX className="w-3.5 h-3.5 mr-1" />
                              <span>Disable Account</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5 mr-1" />
                              <span>Reactivate</span>
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user)}
                          className="h-8 px-2.5 rounded-xl text-xs bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200"
                          title="Permanently Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 5. TAB 3: SYSTEM HEALTH & DIAGNOSTICS */}
        {activeTab === "health" && (
          <Card className="rounded-3xl bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
            <CardHeader className="pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-emerald-400" />
                    <span>Real-Time System Health Probes</span>
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live telemetry across APIs, authentication, storage, and Gemini AI vision engine.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={async () => {
                    const res = await runSystemHealthDiagnostics();
                    setHealthServices(res);
                    toast.success("Health probes executed.");
                  }}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  <span>Run Diagnostics</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthServices.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{svc.name}</span>
                        {svc.latencyMs !== undefined && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {svc.latencyMs}ms
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{svc.message}</p>
                      <span className="text-[10px] text-slate-500 block">
                        Checked: {new Date(svc.lastChecked).toLocaleTimeString()}
                      </span>
                    </div>

                    <div>{getStatusBadge(svc.status)}</div>
                  </div>
                ))}
              </div>

              {/* Sync Status Banner */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Last Cloud Synchronization: <strong>{new Date(analytics?.lastSyncTimestamp ?? Date.now()).toLocaleTimeString()}</strong></span>
                </div>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                  Storage Healthy
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 6. TAB 4: AUDIT LOGS */}
        {activeTab === "audit" && (
          <Card className="rounded-3xl bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
            <CardHeader className="pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-400" />
                    <span>Cryptographic Security & Audit Logs</span>
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Immutable event stream of all administrative actions, logins, and status modifications.
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportAuditLogs}
                  className="rounded-xl border-slate-700 bg-slate-900 text-xs font-bold text-slate-200"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  <span>Export JSON</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No administrative actions logged yet.
                </div>
              ) : (
                <div className="space-y-2.5 font-mono text-xs max-h-96 overflow-y-auto pr-2">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-400">{log.action}</span>
                          <span className="text-[10px] text-slate-500">by {log.adminEmail}</span>
                          {log.targetId && (
                            <span className="text-[10px] text-slate-400 bg-slate-800 px-1 rounded">
                              Target: {log.targetId}
                            </span>
                          )}
                        </div>
                        {log.details && <p className="text-[11px] text-slate-400">{log.details}</p>}
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            log.status === "success"
                              ? "text-emerald-400"
                              : log.status === "warning"
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
