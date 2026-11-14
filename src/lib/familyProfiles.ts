import { FamilyProfile, FamilyRelationType, AgeCategory, ScanItem, WeightEntry, UserGoals, SubscriptionTier } from "@/types";

const PROFILES_STORAGE_KEY = "vision_scan_family_profiles_v1";
const ACTIVE_PROFILE_KEY = "vision_scan_active_profile_id_v1";

// Configurable Profile Limits
export const PROFILE_LIMITS = {
  FREE: 2,
  PREMIUM: 6,
};

// Seed initial default family profile if first time
export function getFamilyProfiles(): FamilyProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to read family profiles", e);
  }

  const defaultProfiles: FamilyProfile[] = [
    {
      id: "prof_me",
      name: "Nikhil",
      relation: "me",
      ageCategory: "adult",
      heightCm: 175,
      weightKg: 72.4,
      goals: {
        dailyWaterMl: 2500,
        dailyProteinG: 65,
        dailyCaloriesKcal: 2100,
        dailyFoodScansGoal: 3,
        weightTrackingFrequency: "daily",
      },
      wellnessScore: 82,
      streakCount: 5,
      createdAt: Date.now() - 30 * 24 * 3600 * 1000,
    },
    {
      id: "prof_partner",
      name: "Priya",
      relation: "partner",
      ageCategory: "adult",
      heightCm: 162,
      weightKg: 58.0,
      goals: {
        dailyWaterMl: 2200,
        dailyProteinG: 55,
        dailyCaloriesKcal: 1850,
        dailyFoodScansGoal: 3,
        weightTrackingFrequency: "weekly",
      },
      wellnessScore: 76,
      streakCount: 3,
      createdAt: Date.now() - 14 * 24 * 3600 * 1000,
    },
  ];

  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(defaultProfiles));
  } catch (e) {
    console.error("Failed to seed family profiles", e);
  }

  return defaultProfiles;
}

export function saveFamilyProfiles(profiles: FamilyProfile[]): void {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error("Failed to save family profiles", e);
  }
}

// Active profile management
export function getActiveProfile(): FamilyProfile {
  const profiles = getFamilyProfiles();
  const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (activeId) {
    const found = profiles.find((p) => p.id === activeId && !p.isArchived);
    if (found) return found;
  }
  return profiles[0] || {
    id: "prof_default",
    name: "Me",
    relation: "me",
    ageCategory: "adult",
    goals: {
      dailyWaterMl: 2500,
      dailyProteinG: 60,
      dailyCaloriesKcal: 2000,
      dailyFoodScansGoal: 3,
      weightTrackingFrequency: "daily",
    },
    wellnessScore: 80,
    streakCount: 1,
    createdAt: Date.now(),
  };
}

export function setActiveProfileId(profileId: string): void {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
}

// Check Profile Limits against Subscription
export function canAddMoreProfiles(currentTier: SubscriptionTier = "FREE"): { allowed: boolean; maxAllowed: number; currentCount: number } {
  const profiles = getFamilyProfiles().filter((p) => !p.isArchived);
  const maxAllowed = currentTier === "PREMIUM" ? PROFILE_LIMITS.PREMIUM : PROFILE_LIMITS.FREE;
  return {
    allowed: profiles.length < maxAllowed,
    maxAllowed,
    currentCount: profiles.length,
  };
}

// Profile Creation with Child Safety Guard
export function createFamilyProfile(
  name: string,
  relation: FamilyRelationType,
  ageCategory: AgeCategory,
  goals: UserGoals,
  heightCm?: number,
  weightKg?: number,
  tier: SubscriptionTier = "FREE"
): { success: boolean; profile?: FamilyProfile; error?: string } {
  const limitCheck = canAddMoreProfiles(tier);
  if (!limitCheck.allowed) {
    return {
      success: false,
      error: `Profile limit reached for ${tier} plan (Maximum ${limitCheck.maxAllowed} profiles). Upgrade to Vision Scan Premium for up to ${PROFILE_LIMITS.PREMIUM} family members.`,
    };
  }

  // Child Profile Safety Guard:
  // Strictly prevent restrictive weight loss deficits or unrecommended calorie cuts for children
  const adjustedGoals: UserGoals = { ...goals };
  if (ageCategory === "child") {
    // Enforce positive nourishment and healthy growth energy
    if (adjustedGoals.dailyCaloriesKcal < 1600) adjustedGoals.dailyCaloriesKcal = 1800;
    if (adjustedGoals.dailyWaterMl < 1400) adjustedGoals.dailyWaterMl = 1600;
  }

  const newProfile: FamilyProfile = {
    id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    relation,
    ageCategory,
    heightCm,
    weightKg,
    goals: adjustedGoals,
    wellnessScore: 75,
    streakCount: 1,
    createdAt: Date.now(),
  };

  const existing = getFamilyProfiles();
  const updated = [...existing, newProfile];
  saveFamilyProfiles(updated);

  return { success: true, profile: newProfile };
}

export function updateFamilyProfile(updatedProfile: FamilyProfile): void {
  const existing = getFamilyProfiles();
  const updated = existing.map((p) => (p.id === updatedProfile.id ? updatedProfile : p));
  saveFamilyProfiles(updated);
}

export function deleteFamilyProfile(profileId: string): { success: boolean; error?: string } {
  const existing = getFamilyProfiles();
  if (existing.length <= 1) {
    return { success: false, error: "Cannot delete the primary profile. At least one family profile is required." };
  }

  const updated = existing.filter((p) => p.id !== profileId);
  saveFamilyProfiles(updated);

  // If deleted profile was active, switch to first available
  const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (activeId === profileId) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, updated[0].id);
  }

  // Clean isolated storage keys for this profile
  localStorage.removeItem(`vsah_scans_prof_${profileId}`);
  localStorage.removeItem(`vsah_weights_prof_${profileId}`);

  return { success: true };
}

// Scoped Profile Data Access (Data Isolation)
export function getProfileScans(profileId: string): ScanItem[] {
  try {
    const raw = localStorage.getItem(`vsah_scans_prof_${profileId}`);
    if (raw) return JSON.parse(raw);
    // If primary profile and scoped key is empty, fallback to global scans
    if (profileId === "prof_me") {
      const globalRaw = localStorage.getItem("healthy_scans_history");
      if (globalRaw) return JSON.parse(globalRaw);
    }
  } catch (e) {
    console.error("Failed to read profile scans", e);
  }
  return [];
}

export function saveProfileScans(profileId: string, scans: ScanItem[]): void {
  try {
    localStorage.setItem(`vsah_scans_prof_${profileId}`, JSON.stringify(scans));
    if (profileId === "prof_me") {
      localStorage.setItem("healthy_scans_history", JSON.stringify(scans));
    }
  } catch (e) {
    console.error("Failed to save profile scans", e);
  }
}
