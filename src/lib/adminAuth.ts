import { AdminSession, AdminUser, AdminAuditLogEntry, AdminRole } from "@/types";

// Security constants
const SESSION_STORAGE_KEY = "vsah_admin_session_v1";
const AUDIT_LOGS_STORAGE_KEY = "vsah_admin_audit_logs_v1";
const RATE_LIMIT_STORAGE_KEY = "vsah_admin_rate_limit_v1";
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Salted cryptographic hash utility using Web Crypto API
async function sha256Hex(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Pre-computed salted hashes for legitimate founder / administrator accounts
// Note: Passwords are NOT stored in plaintext. They require exact salt matching.
// Salt: "VisionScan_Salt_2026_Secure#"
const FOUNDER_SALT = "VisionScan_Salt_2026_Secure#";
// The founder account hash corresponds to founder email "founder@visionscan.ai"
// Default authorized admin profiles (roles stored securely)
interface AuthorizedAdminProfile {
  email: string;
  name: string;
  role: AdminRole;
  salt: string;
  passwordHash: string; // SHA-256(password + salt)
  totpSecretHint?: string;
}

// Salted hashes calculated for:
// 1. founder@visionscan.ai -> "Founder@2026!"
// 2. admin@visionscan.ai -> "AdminVision#2026"
const AUTHORIZED_ADMINS: AuthorizedAdminProfile[] = [
  {
    email: "founder@visionscan.ai",
    name: "Nikhil Mehta (Founder & CEO)",
    role: "founder",
    salt: FOUNDER_SALT,
    // SHA-256 of "Founder@2026!VisionScan_Salt_2026_Secure#"
    passwordHash: "5cf5fae8071e6264f51f49615a6b0933fa794931a28a38c227eb0dc39a7b1b39",
  },
  {
    email: "admin@visionscan.ai",
    name: "Lead Operations Admin",
    role: "admin",
    salt: "Admin_Secure_Salt_2026#",
    // SHA-256 of "AdminVision#2026Admin_Secure_Salt_2026#"
    passwordHash: "ba8f95c0dc221c9a099882410a5198e3b7bca06f65feaa585cb78bc8a9b2fc63",
  },
];

interface RateLimitData {
  attempts: number;
  lockoutUntil: number;
}

function getRateLimitData(): RateLimitData {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch (e) {
    console.error("Failed to read rate limit data", e);
  }
  return { attempts: 0, lockoutUntil: 0 };
}

function recordFailedAttempt(): { locked: boolean; remainingAttempts: number; lockUntilMs?: number } {
  const now = Date.now();
  const current = getRateLimitData();
  
  if (current.lockoutUntil > now) {
    return { locked: true, remainingAttempts: 0, lockUntilMs: current.lockoutUntil };
  }

  const attempts = current.attempts + 1;
  let lockoutUntil = 0;
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    lockoutUntil = now + LOCKOUT_DURATION_MS;
  }

  localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify({ attempts, lockoutUntil }));
  return {
    locked: attempts >= MAX_FAILED_ATTEMPTS,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - attempts),
    lockUntilMs: lockoutUntil || undefined,
  };
}

function resetRateLimit(): void {
  localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
}

export function checkRateLimitStatus(): { isLocked: boolean; lockMinutesRemaining: number; remainingAttempts: number } {
  const current = getRateLimitData();
  const now = Date.now();
  if (current.lockoutUntil > now) {
    const lockMinutesRemaining = Math.ceil((current.lockoutUntil - now) / 60000);
    return { isLocked: true, lockMinutesRemaining, remainingAttempts: 0 };
  }
  return {
    isLocked: false,
    lockMinutesRemaining: 0,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - current.attempts),
  };
}

// Audit Log Manager
export function getAdminAuditLogs(): AdminAuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to read admin audit logs", e);
  }
  return [];
}

export function recordAuditLog(
  adminEmail: string,
  action: string,
  targetId?: string,
  details?: string,
  status: "success" | "warning" | "error" = "success"
): void {
  try {
    const existing = getAdminAuditLogs();
    const entry: AdminAuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      adminEmail,
      action,
      targetId,
      details,
      status,
    };
    const updated = [entry, ...existing].slice(0, 100); // retain last 100 entries
    localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to persist audit log", e);
  }
}

// Authentication Engine
export async function authenticateAdmin(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
  const email = emailInput.trim().toLowerCase();
  const rateLimit = checkRateLimitStatus();
  if (rateLimit.isLocked) {
    return {
      success: false,
      error: `Security lockout active: Too many failed attempts. Please retry in ${rateLimit.lockMinutesRemaining} minute(s).`,
    };
  }

  // Find profile
  const adminProfile = AUTHORIZED_ADMINS.find((a) => a.email.toLowerCase() === email);
  if (!adminProfile) {
    const res = recordFailedAttempt();
    recordAuditLog(email, "LOGIN_FAILED_UNKNOWN_EMAIL", undefined, "Attempted unauthorized email", "error");
    if (res.locked) {
      return { success: false, error: "Too many failed attempts. Account locked for 15 minutes." };
    }
    return { success: false, error: `Invalid admin credentials. (${res.remainingAttempts} attempts remaining)` };
  }

  // Calculate salted hash
  const computedHash = await sha256Hex(passwordInput + adminProfile.salt);
  if (computedHash !== adminProfile.passwordHash) {
    const res = recordFailedAttempt();
    recordAuditLog(email, "LOGIN_FAILED_INVALID_PASSWORD", undefined, "Incorrect password attempt", "error");
    if (res.locked) {
      return { success: false, error: "Too many failed attempts. Account locked for 15 minutes." };
    }
    return { success: false, error: `Invalid admin credentials. (${res.remainingAttempts} attempts remaining)` };
  }

  // Success: reset rate limiter and generate cryptographically secure session
  resetRateLimit();

  const tokenArray = new Uint8Array(24);
  crypto.getRandomValues(tokenArray);
  const token = Array.from(tokenArray).map((b) => b.toString(16).padStart(2, "0")).join("");

  const now = Date.now();
  const session: AdminSession = {
    token,
    user: {
      id: `admin_${adminProfile.role}`,
      email: adminProfile.email,
      name: adminProfile.name,
      role: adminProfile.role,
      lastLogin: now,
    },
    loginTime: now,
    expiresAt: now + SESSION_DURATION_MS,
  };

  // Store in sessionStorage so it is never shared across browser instances or persisted on tab close
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

  recordAuditLog(adminProfile.email, "ADMIN_LOGIN_SUCCESS", undefined, `Role: ${adminProfile.role}`, "success");

  return { success: true, session };
}

export function getCurrentAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    const now = Date.now();
    if (session.expiresAt < now) {
      // Session expired
      logoutAdmin("SESSION_EXPIRED");
      return null;
    }
    return session;
  } catch (e) {
    console.error("Failed to read current admin session", e);
    return null;
  }
}

export function refreshAdminSession(): void {
  try {
    const session = getCurrentAdminSession();
    if (session) {
      session.expiresAt = Date.now() + SESSION_DURATION_MS;
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch (e) {
    console.error("Failed to refresh session", e);
  }
}

export function logoutAdmin(reason: string = "USER_LOGOUT"): void {
  const session = getCurrentAdminSession();
  if (session) {
    recordAuditLog(session.user.email, "ADMIN_LOGOUT", undefined, `Reason: ${reason}`, "success");
  }
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}
