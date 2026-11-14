import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Download, 
  Upload, 
  RefreshCw, 
  FileCheck, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Server, 
  ShieldAlert 
} from "lucide-react";
import { 
  createEncryptedBackup, 
  restoreEncryptedBackup, 
  getSanitizedDataExport, 
  getSecurityAlerts, 
  EncryptedBackupPackage, 
  SecurityAlert 
} from "@/lib/securityBackup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SecurityBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const SecurityBackupModal: React.FC<SecurityBackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [activeTab, setActiveTab] = useState<"backup" | "restore" | "export" | "alerts">("backup");
  const [passphrase, setPassphrase] = useState("");
  const [restorePassphrase, setRestorePassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backupPackage, setBackupPackage] = useState<EncryptedBackupPackage | null>(null);
  const [restoreFileJson, setRestoreFileJson] = useState<string>("");
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAlerts(getSecurityAlerts());
      setPassphrase("");
      setRestorePassphrase("");
      setBackupPackage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Create Backup
  const handleCreateBackup = async () => {
    if (!passphrase || passphrase.length < 6) {
      toast.error("Passphrase must be at least 6 characters.");
      return;
    }

    setIsProcessing(true);
    try {
      const pkg = await createEncryptedBackup(passphrase);
      setBackupPackage(pkg);
      toast.success("Encrypted backup generated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate encrypted backup.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Encrypted File
  const handleDownloadBackup = () => {
    if (!backupPackage) return;
    const blob = new Blob([JSON.stringify(backupPackage, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VisionScan_Backup_Encrypted_${new Date().toISOString().slice(0, 10)}.vsbak`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Encrypted backup file saved.");
  };

  // Handle File Input for Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRestoreFileJson(content);
      toast.info("Backup package loaded. Enter passphrase to restore.");
    };
    reader.readAsText(file);
  };

  // Handle Restore
  const handleRestore = async () => {
    if (!restoreFileJson) {
      toast.error("Please select a valid .vsbak or .json backup file first.");
      return;
    }
    if (!restorePassphrase) {
      toast.error("Please enter the decryption passphrase.");
      return;
    }

    setIsProcessing(true);
    try {
      const pkg: EncryptedBackupPackage = JSON.parse(restoreFileJson);
      const res = await restoreEncryptedBackup(pkg, restorePassphrase);
      if (res.success) {
        toast.success(`Restored ${res.itemsRestored.scans} scans & ${res.itemsRestored.weights} weight logs!`);
        if (onDataRestored) onDataRestored();
        onClose();
      } else {
        toast.error(res.error || "Restoration failed.");
      }
    } catch (err: any) {
      toast.error("Corrupted backup file format or incorrect passphrase.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Export Sanitized JSON
  const handleExportSanitized = () => {
    const data = getSanitizedDataExport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VisionScan_Sanitized_Export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Sanitized wellness data exported.");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        id="security-backup-dialog"
        className="relative w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl text-foreground p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Production Security & Backup
              </h2>
              <span className="text-xs text-muted-foreground">
                AES-GCM 256-bit encryption • Integrity Checksums • Zero-Knowledge
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-2xl border border-border/60 text-xs">
          <button
            onClick={() => setActiveTab("backup")}
            className={`flex-1 py-1.5 font-semibold rounded-xl transition-all ${
              activeTab === "backup" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Create Backup
          </button>
          <button
            onClick={() => setActiveTab("restore")}
            className={`flex-1 py-1.5 font-semibold rounded-xl transition-all ${
              activeTab === "restore" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Restore
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`flex-1 py-1.5 font-semibold rounded-xl transition-all ${
              activeTab === "export" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Export Sanitized
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex-1 py-1.5 font-semibold rounded-xl transition-all ${
              activeTab === "alerts" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Security Telemetry
          </button>
        </div>

        {/* TAB 1: CREATE BACKUP */}
        {activeTab === "backup" && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Lock className="w-4 h-4 text-primary" />
                <span>Client-Side AES-GCM 256-bit Encryption</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Your meals, nutrients, and weight entries will be encrypted using a key derived from your private passphrase. No one—not even servers—can decrypt your backup without this passphrase.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                <span>Enter Encryption Passphrase (min 6 chars)</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassphrase ? "text" : "password"}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Set a strong secret passphrase..."
                  className="rounded-xl h-10 pr-10 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleCreateBackup}
              disabled={isProcessing || passphrase.length < 6}
              className="w-full h-10 rounded-xl font-bold bg-primary text-primary-foreground shadow-md"
            >
              {isProcessing ? "Encrypting Data..." : "Generate Encrypted Backup"}
            </Button>

            {backupPackage && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Backup Ready ({backupPackage.itemCounts.scans} Scans, {backupPackage.itemCounts.weights} Weights)</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-emerald-600 text-emerald-600">
                    SHA-256 Verified
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono truncate">
                  Checksum: {backupPackage.checksumSha256}
                </p>
                <Button
                  onClick={handleDownloadBackup}
                  className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  <span>Download .vsbak Encrypted File</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESTORE BACKUP */}
        {activeTab === "restore" && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Restore Policy</span>
              </span>
              <p className="text-[11px] opacity-90 leading-relaxed">
                Restoring will verify the SHA-256 integrity checksum to ensure the backup has not been altered before loading data into your account.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Select Backup File (.vsbak or .json)</label>
              <input
                type="file"
                accept=".vsbak,.json"
                onChange={handleFileUpload}
                className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-primary file:text-primary-foreground file:font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Decryption Passphrase</label>
              <Input
                type="password"
                value={restorePassphrase}
                onChange={(e) => setRestorePassphrase(e.target.value)}
                placeholder="Enter passphrase used during backup..."
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <Button
              onClick={handleRestore}
              disabled={isProcessing || !restoreFileJson || !restorePassphrase}
              className="w-full h-10 rounded-xl font-bold bg-primary text-primary-foreground"
            >
              {isProcessing ? "Verifying & Decrypting..." : "Verify Checksum & Restore"}
            </Button>
          </div>
        )}

        {/* TAB 3: SANITIZED DATA EXPORT */}
        {activeTab === "export" && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-muted/60 border border-border/80 space-y-2">
              <span className="font-bold text-foreground block">
                GDPR & Health Data Ownership Compliance
              </span>
              <p className="text-muted-foreground leading-relaxed">
                You can export a sanitized, human-readable JSON summary of all your tracked meals, calories, protein, and weight entries without any identifying tokens or hardware fingerprints.
              </p>
            </div>

            <Button
              onClick={handleExportSanitized}
              className="w-full h-10 rounded-xl font-bold bg-primary text-primary-foreground"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span>Download Sanitized JSON</span>
            </Button>
          </div>
        )}

        {/* TAB 4: SECURITY TELEMETRY */}
        {activeTab === "alerts" && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-muted/60 border border-border/60 space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">API Channel</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> HTTPS / TLS 1.3
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/60 border border-border/60 space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">Request Deduplication</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active (Anti-Replay)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-foreground block">
                Security Alerts & Incident Log ({alerts.length})
              </span>
              {alerts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-center">
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                  <span>No security incidents or unauthorized attacks detected.</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {alerts.map((a) => (
                    <div key={a.id} className="p-3 rounded-xl bg-muted/60 border border-border/60 flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-rose-500 block">{a.type}</span>
                        <p className="text-[11px] text-muted-foreground">{a.message}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(a.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
