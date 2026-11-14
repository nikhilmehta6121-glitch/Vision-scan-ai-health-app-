export type SupportedLanguage = 
  | "en"        // English
  | "hi"        // हिंदी
  | "hinglish"  // Hinglish
  | "mr"        // मराठी
  | "gu"        // ગુજરાતી
  | "pa"        // ਪੰਜਾਬੀ
  | "bn"        // বাংলা
  | "ta"        // தமிழ்
  | "te"        // తెలుగు
  | "kn"        // ಕನ್ನಡ
  | "ml";       // മലയാളം

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  speechCode: string;
  flag?: string;
}

export interface ActiveIngredient {
  name: string;
  mechanism: string;
  purpose?: string;
}

export interface SideEffectsData {
  common: string[];
  seriousSymptoms: string[];
}

export interface PrecautionsData {
  allergies: string;
  pregnancyBreastfeeding: string;
  childrenElderly: string;
  kidneyLiver: string;
  otherMedicines: string;
}

export interface DrugInteractionsData {
  generalNotice: string;
  isVerified: boolean;
  verifiedInteractions: string[];
  unverifiedNotice?: string;
}

export interface MedicineAnalysis {
  isMedicine: boolean;
  confidence: "High" | "Medium" | "Low";
  confidenceScore: number; // 0 to 100
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  isPrescriptionRequired?: boolean;
  verificationMessage: string;
  description: string;
  activeIngredients: ActiveIngredient[];
  commonUses: string[];
  sideEffects: SideEffectsData;
  precautions: PrecautionsData;
  drugInteractions: DrugInteractionsData;
  dosageSafetyNotice: string;
  whoShouldAskDoctor: string[];
  urgentMedicalHelpSigns: string[];
  uncertaintyReason?: string;
  rawOcrText?: string;
  languageUsed?: SupportedLanguage;
}

export interface NutritionData {
  protein: string;       // e.g. "18 g"
  calcium: string;       // e.g. "220 mg"
  iron: string;          // e.g. "3.1 mg"
  potassium: string;     // e.g. "310 mg"
  carbohydrates: string; // e.g. "12 g"
  fat: string;           // e.g. "15 g"
  fiber: string;         // e.g. "2 g"
  calories: string;      // e.g. "280 kcal"
}

export interface OtherNutrient {
  name: string;      // e.g. "Sugar", "Sodium", "Saturated Fat", "Vitamin C"
  amount: string;    // e.g. "2.5 g", "420 mg", "6.5 g"
}

export type ResultSourceType = "AI_ESTIMATED" | "LABEL_EXTRACTED" | "BARCODE_PRODUCT_DATA" | "USER_ENTERED";
export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface WhyThisResultData {
  summary: string;
  visualClues: string[];
  assumptions: string[];
  uncertainties: string[];
  sourceDescription: string;
}

export interface DetectedFoodItem {
  id: string;
  name: string;            // e.g. "Roti", "Dal Makhani", "Jeera Rice", "Cucumber Salad"
  portion: string;         // e.g. "2 pieces (80g)"
  portionGrams?: number;
  calories: string;        // e.g. "210 kcal"
  protein: string;         // e.g. "6.5 g"
  carbohydrates: string;   // e.g. "36 g"
  fat: string;             // e.g. "3.5 g"
  fiber: string;           // e.g. "4 g"
  sugar?: string;          // e.g. "1.2 g"
  sodium?: string;         // e.g. "180 mg"
  calcium: string;         // e.g. "45 mg"
  potassium: string;       // e.g. "120 mg"
  iron?: string;           // e.g. "2.2 mg"
  nutritionScore: number;  // 0 - 100
  confidencePercentage: number; // e.g. 88 (realistic, no false 99.9%)
  confidenceLevel: ConfidenceLevel;
  visualClues?: string[];
  sourceType: ResultSourceType;
  tags?: string[];
}

export interface TotalMealReport {
  mealName: string;        // e.g. "Balanced North Indian Lunch Thali"
  totalItemsCount: number;
  calories: string;        // e.g. "650 kcal"
  protein: string;         // e.g. "26 g"
  carbohydrates: string;   // e.g. "88 g"
  fat: string;             // e.g. "22 g"
  fiber: string;           // e.g. "11 g"
  sugar?: string;          // e.g. "4.5 g"
  sodium?: string;         // e.g. "680 mg"
  calcium: string;         // e.g. "340 mg"
  potassium: string;       // e.g. "620 mg"
  iron: string;            // e.g. "6.4 mg"
  nutritionScore: number;  // 0 - 100
  overallConfidence: ConfidenceLevel;
  overallConfidenceScore: number;
  sourceType: ResultSourceType;
  summary: string;
  healthInsights: string[];
  warnings: string[];
  whyThisResult?: WhyThisResultData;
}

export interface FoodAnalysis {
  foodName: string;            // e.g. "Mixed Veggie Thali"
  estimatedPortion: string;    // e.g. "450 g"
  portionGrams?: number;       // e.g. 450
  detectedFoods?: DetectedFoodItem[]; // Food Scanner 2.0: detected individual items
  totalMeal?: TotalMealReport;        // Food Scanner 2.0: combined total meal report
  nutrition: NutritionData;
  otherNutrients?: OtherNutrient[];
  nutritionScore: number;      // e.g. 78 (out of 100)
  overallConfidence?: ConfidenceLevel;
  overallConfidenceScore?: number;
  sourceType?: ResultSourceType;
  whyThisResult?: WhyThisResultData;
  isUserEdited?: boolean;
  isLowQualityImage?: boolean;
  lowQualityWarning?: string;
  warnings?: string[];         // e.g. ["High sodium", "High fat"]
  note: string;                // "Values are AI estimates based on the image and estimated portion size."
  healthInsights?: string[];   // Nutritional and culinary insights only
  dietaryTags?: string[];      // e.g. ["Vegetarian", "High Fiber"]
  languageUsed?: SupportedLanguage;
}

export interface WeightEntry {
  id: string;
  date: string;               // ISO date string or YYYY-MM-DD
  weightKg: number;           // e.g. 72.4
  bmi?: number;
  note?: string;              // Optional notes
}

export interface UserGoals {
  dailyWaterMl: number;       // default e.g. 2500 ml
  dailyProteinG: number;      // default e.g. 60 g
  dailyCaloriesKcal: number;  // default e.g. 2000 kcal
  dailyFoodScansGoal: number; // default e.g. 3 meals
  targetWeightKg?: number;
  weightTrackingFrequency: "daily" | "weekly";
}

export interface DailyWellnessLog {
  date: string;               // YYYY-MM-DD
  waterMl: number;
  proteinG: number;
  caloriesKcal: number;
  scansCount: number;
  hasWeightLogged: boolean;
  score: number;              // 0-100 calculated score
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;     // YYYY-MM-DD
}

export type SubscriptionTier = "FREE" | "PREMIUM" | "EXPIRED";

export interface SubscriptionState {
  tier: SubscriptionTier;
  planId?: "monthly" | "yearly";
  validUntil?: number; // epoch ms
  isAutoRenewing?: boolean;
  dailyScansRemaining: number; // e.g. 3 of 5
  dailyScansMax: number; // 5 for free tier
}

export interface ScanItem {
  id: string;
  image: string;
  mode: "health" | "food" | "describe" | "ocr" | "objects";
  medicineData?: MedicineAnalysis;
  foodData?: FoodAnalysis;
  textResult?: string;
  timestamp: number;
  isSaved?: boolean;
  language: SupportedLanguage;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachedImage?: string;
}

export type AppTab = "home" | "scan" | "coach" | "family" | "community" | "progress" | "weight" | "premium" | "chat" | "history" | "profile" | "admin";

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: number;
  content: string;
  badge?: string;
  challengeCompleted?: string;
  photoUrl?: string;
  cheersCount: number;
  hasCheered?: boolean;
  privacy: "private" | "followers" | "public";
}

export interface WellnessChallenge {
  id: string;
  title: string;
  description: string;
  participantsCount: number;
  daysRemaining: number;
  rewardBadge: string;
  category: "hydration" | "nutrition" | "consistency" | "activity";
}

export type FamilyRelationType = "me" | "partner" | "child" | "parent" | "other";
export type AgeCategory = "adult" | "senior" | "teen" | "child";

export interface FamilyProfile {
  id: string;
  name: string;
  relation: FamilyRelationType;
  ageCategory: AgeCategory;
  avatar?: string;
  heightCm?: number;
  weightKg?: number;
  goals: UserGoals;
  wellnessScore: number;
  streakCount: number;
  isArchived?: boolean;
  createdAt: number;
}

export type AdminRole = "founder" | "admin" | "moderator";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  lastLogin: number;
}

export interface AdminSession {
  token: string;
  user: AdminUser;
  expiresAt: number;
  loginTime: number;
}

export interface AdminAuditLogEntry {
  id: string;
  timestamp: number;
  adminEmail: string;
  action: string;
  targetId?: string;
  details?: string;
  status: "success" | "warning" | "error";
}

export type HealthState = "operational" | "warning" | "error";

export interface ServiceHealthItem {
  id: string;
  name: string;
  category: "api" | "database" | "auth" | "ai" | "storage";
  status: HealthState;
  latencyMs?: number;
  message: string;
  lastChecked: number;
}

export interface ManagedUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
  lastActiveAt: number;
  status: "active" | "disabled";
  subscriptionTier: SubscriptionTier;
  totalScans: number;
  isVerified: boolean;
}

export interface RealDashboardAnalytics {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  activeUsers: number;
  premiumSubscribers: number;
  freeUsers: number;
  totalFoodScans: number;
  totalBarcodeScans: number;
  totalReportsGenerated: number;
  conversionRate: number;
  verifiedMRR: number; // in INR
  cancellationsCount: number;
  expiredCount: number;
  scansToday: number;
  barcodeScansToday: number;
  reportsToday: number;
  avgScansPerActiveUser: number;
  featureUsage: { feature: string; count: number; percentage: number }[];
  dailyActivity: { date: string; newUsers: number; scans: number; premiumSignups: number }[];
  lastSyncTimestamp: number;
}
