import { ScanItem, WeightEntry, UserGoals, DailyWellnessLog } from "@/types";

// Security storage keys
const BACKUP_METADATA_KEY = "vsah_backup_metadata_v1";
const DEDUPLICATION_KEY = "vsah_dedup_cache_v1";
const SECURITY_ALERTS_KEY = "vsah_security_alerts_v1";

export interface EncryptedBackupPackage {
  version: string;
  timestamp: number;
  ivHex: string;
  saltHex: string;
  ciphertextHex: string;
  checksumSha256: string;
  itemCounts: {
    scans: number;
    weights: number;
    wellnessLogs: number;
  };
}

export interface SanitizedExportData {
  appName: string;
  exportDate: string;
  userGoals?: UserGoals;
  mealScansCount: number;
  scansSummary: {
    timestamp: number;
    mode: string;
    foodName?: string;
    calories?: string;
    protein?: string;
    nutritionScore?: number;
  }[];
  weightSummary: {
    date: string;
    weightKg: number;
    bmi?: number;
  }[];
  disclaimer: string;
}

export interface SecurityAlert {
  id: string;
  timestamp: number;
  type: "REPLAY_ATTACK_BLOCKED" | "UNAUTHORIZED_ADMIN_ATTEMPT" | "RATE_LIMIT_EXCEEDED" | "MALFORMED_INPUT";
  message: string;
  severity: "low" | "medium" | "high";
}

// 1. INPUT SANITIZATION & VALIDATION
export function sanitizeStringInput(input: string, maxLength: number = 500): string {
  if (!input) return "";
  const trimmed = input.trim().slice(0, maxLength);
  // Strip dangerous HTML tags and script injections
  return trimmed
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "");
}

// 2. REQUEST DEDUPLICATION / IDEMPOTENCY
const seenRequests = new Map<string, number>();

export function checkAndRegisterRequestId(requestId: string, ttlMs: number = 30000): { isDuplicate: boolean } {
  const now = Date.now();
  
  // Clean expired
  for (const [key, exp] of seenRequests.entries()) {
    if (exp < now) seenRequests.delete(key);
  }

  if (seenRequests.has(requestId)) {
    recordSecurityAlert("REPLAY_ATTACK_BLOCKED", `Duplicate request detected with token: ${requestId.slice(0, 8)}...`, "medium");
    return { isDuplicate: true };
  }

  seenRequests.set(requestId, now + ttlMs);
  return { isDuplicate: false };
}

// 3. SECURITY ALERTS LOG
export function getSecurityAlerts(): SecurityAlert[] {
  try {
    const raw = localStorage.getItem(SECURITY_ALERTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read security alerts", e);
  }
  return [];
}

export function recordSecurityAlert(
  type: SecurityAlert["type"],
  message: string,
  severity: SecurityAlert["severity"] = "medium"
): void {
  try {
    const alerts = getSecurityAlerts();
    const newAlert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      type,
      message,
      severity,
    };
    const updated = [newAlert, ...alerts].slice(0, 50);
    localStorage.setItem(SECURITY_ALERTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save security alert", e);
  }
}

// 4. CRYPTOGRAPHIC BACKUP (AES-GCM 256-bit with PBKDF2 key derivation)
async function deriveKeyFromPassphrase(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function bufToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export async function createEncryptedBackup(passphrase: string): Promise<EncryptedBackupPackage> {
  if (!passphrase || passphrase.length < 6) {
    throw new Error("Backup passphrase must be at least 6 characters.");
  }

  // Gather user private records
  const scansRaw = localStorage.getItem("healthy_scans_history") || "[]";
  const weightsRaw = localStorage.getItem("vision_scan_weight_history") || "[]";
  const goalsRaw = localStorage.getItem("vision_scan_user_goals") || "{}";
  const logsRaw = localStorage.getItem("vision_scan_daily_logs") || "[]";

  const payload = JSON.stringify({
    scans: JSON.parse(scansRaw),
    weights: JSON.parse(weightsRaw),
    goals: JSON.parse(goalsRaw),
    dailyLogs: JSON.parse(logsRaw),
    exportTimestamp: Date.now(),
  });

  // Calculate SHA-256 checksum of payload
  const enc = new TextEncoder();
  const checksumBuf = await crypto.subtle.digest("SHA-256", enc.encode(payload));
  const checksumSha256 = bufToHex(checksumBuf);

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive AES key
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  // Encrypt
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as any },
    key,
    enc.encode(payload)
  );

  const pkg: EncryptedBackupPackage = {
    version: "2.0-aes-gcm",
    timestamp: Date.now(),
    ivHex: bufToHex(iv),
    saltHex: bufToHex(salt),
    ciphertextHex: bufToHex(ciphertextBuffer),
    checksumSha256,
    itemCounts: {
      scans: JSON.parse(scansRaw).length,
      weights: JSON.parse(weightsRaw).length,
      wellnessLogs: JSON.parse(logsRaw).length,
    },
  };

  // Record last backup timestamp
  localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify({
    lastBackupTimestamp: pkg.timestamp,
    itemCounts: pkg.itemCounts,
  }));

  return pkg;
}

export async function restoreEncryptedBackup(
  backupPkg: EncryptedBackupPackage,
  passphrase: string
): Promise<{ success: boolean; itemsRestored: { scans: number; weights: number }; error?: string }> {
  try {
    const salt = hexToBuf(backupPkg.saltHex);
    const iv = hexToBuf(backupPkg.ivHex);
    const ciphertext = hexToBuf(backupPkg.ciphertextHex);

    const key = await deriveKeyFromPassphrase(passphrase, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as any },
      key,
      ciphertext as any
    );

    const dec = new TextDecoder();
    const decryptedJson = dec.decode(decryptedBuffer);

    // Verify Checksum
    const enc = new TextEncoder();
    const verifyChecksumBuf = await crypto.subtle.digest("SHA-256", enc.encode(decryptedJson));
    const verifyChecksum = bufToHex(verifyChecksumBuf);

    if (verifyChecksum !== backupPkg.checksumSha256) {
      throw new Error("Integrity check failed: Checksum does not match. Backup may be corrupted or tampered.");
    }

    const data = JSON.parse(decryptedJson);

    // Restore to localStorage safely
    if (data.scans && Array.isArray(data.scans)) {
      localStorage.setItem("healthy_scans_history", JSON.stringify(data.scans));
    }
    if (data.weights && Array.isArray(data.weights)) {
      localStorage.setItem("vision_scan_weight_history", JSON.stringify(data.weights));
    }
    if (data.goals) {
      localStorage.setItem("vision_scan_user_goals", JSON.stringify(data.goals));
    }
    if (data.dailyLogs && Array.isArray(data.dailyLogs)) {
      localStorage.setItem("vision_scan_daily_logs", JSON.stringify(data.dailyLogs));
    }

    return {
      success: true,
      itemsRestored: {
        scans: data.scans?.length || 0,
        weights: data.weights?.length || 0,
      },
    };
  } catch (err: any) {
    console.error("Restoration failed", err);
    return {
      success: false,
      itemsRestored: { scans: 0, weights: 0 },
      error: err.message || "Decryption failed. Incorrect passphrase or corrupted backup file.",
    };
  }
}

// 5. SANITIZED DATA EXPORT (Strictly strips private identifiers)
export function getSanitizedDataExport(): SanitizedExportData {
  const scansRaw = localStorage.getItem("healthy_scans_history") || "[]";
  const weightsRaw = localStorage.getItem("vision_scan_weight_history") || "[]";
  const goalsRaw = localStorage.getItem("vision_scan_user_goals");

  const scans: ScanItem[] = JSON.parse(scansRaw);
  const weights: WeightEntry[] = JSON.parse(weightsRaw);
  const goals = goalsRaw ? JSON.parse(goalsRaw) : undefined;

  const scansSummary = scans.map((s) => ({
    timestamp: s.timestamp,
    mode: s.mode,
    foodName: s.foodData?.foodName || s.foodData?.totalMeal?.mealName,
    calories: s.foodData?.nutrition?.calories || s.foodData?.totalMeal?.calories,
    protein: s.foodData?.nutrition?.protein || s.foodData?.totalMeal?.protein,
    nutritionScore: s.foodData?.nutritionScore,
  }));

  const weightSummary = weights.map((w) => ({
    date: w.date,
    weightKg: w.weightKg,
    bmi: w.bmi,
  }));

  return {
    appName: "Vision Scan AI Health",
    exportDate: new Date().toISOString(),
    userGoals: goals,
    mealScansCount: scans.length,
    scansSummary,
    weightSummary,
    disclaimer: "This data export is for personal wellness tracking and educational purposes only. It is not medical advice.",
  };
}
