import React, { useState } from "react";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Heart, 
  Baby, 
  Award, 
  Check, 
  Trash2, 
  Edit3, 
  Crown, 
  Droplet, 
  Dumbbell, 
  Flame, 
  Sparkles, 
  AlertCircle,
  X
} from "lucide-react";
import { 
  FamilyProfile, 
  FamilyRelationType, 
  AgeCategory, 
  UserGoals, 
  SubscriptionTier 
} from "@/types";
import { 
  getFamilyProfiles, 
  getActiveProfile, 
  setActiveProfileId, 
  createFamilyProfile, 
  updateFamilyProfile, 
  deleteFamilyProfile, 
  canAddMoreProfiles, 
  PROFILE_LIMITS 
} from "@/lib/familyProfiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface FamilyProfilesViewProps {
  onProfileSwitched?: (profile: FamilyProfile) => void;
  subscriptionTier?: SubscriptionTier;
  onUpgradeToPremium?: () => void;
}

export const FamilyProfilesView: React.FC<FamilyProfilesViewProps> = ({
  onProfileSwitched,
  subscriptionTier = "FREE",
  onUpgradeToPremium,
}) => {
  const [profiles, setProfiles] = useState<FamilyProfile[]>(() => getFamilyProfiles());
  const [activeProfile, setActiveProfile] = useState<FamilyProfile>(() => getActiveProfile());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Profile Form State
  const [name, setName] = useState("");
  const [relation, setRelation] = useState<FamilyRelationType>("partner");
  const [ageCategory, setAgeCategory] = useState<AgeCategory>("adult");
  const [heightCm, setHeightCm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [waterGoal, setWaterGoal] = useState<number>(2200);
  const [proteinGoal, setProteinGoal] = useState<number>(55);
  const [caloriesGoal, setCaloriesGoal] = useState<number>(2000);

  const refreshProfiles = () => {
    const list = getFamilyProfiles();
    setProfiles(list);
    const active = getActiveProfile();
    setActiveProfile(active);
  };

  const handleSelectProfile = (profile: FamilyProfile) => {
    setActiveProfileId(profile.id);
    setActiveProfile(profile);
    toast.success(`Switched active profile to ${profile.name}`);
    if (onProfileSwitched) {
      onProfileSwitched(profile);
    }
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a profile name.");
      return;
    }

    const goals: UserGoals = {
      dailyWaterMl: waterGoal,
      dailyProteinG: proteinGoal,
      dailyCaloriesKcal: caloriesGoal,
      dailyFoodScansGoal: 3,
      weightTrackingFrequency: "daily",
    };

    const res = createFamilyProfile(
      name,
      relation,
      ageCategory,
      goals,
      heightCm ? parseFloat(heightCm) : undefined,
      weightKg ? parseFloat(weightKg) : undefined,
      subscriptionTier
    );

    if (res.success && res.profile) {
      toast.success(`Profile for ${res.profile.name} created!`);
      setIsAddModalOpen(false);
      setName("");
      refreshProfiles();
    } else {
      toast.error(res.error || "Failed to create profile.");
    }
  };

  const handleDelete = (profile: FamilyProfile) => {
    if (window.confirm(`Are you sure you want to delete profile for "${profile.name}"? Isolated meal scans will be permanently removed.`)) {
      const res = deleteFamilyProfile(profile.id);
      if (res.success) {
        toast.success(`Profile ${profile.name} deleted.`);
        refreshProfiles();
      } else {
        toast.error(res.error || "Failed to delete profile.");
      }
    }
  };

  const limitInfo = canAddMoreProfiles(subscriptionTier);

  return (
    <div id="family-profiles-container" className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
              <Users className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Family Profiles</h1>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-[10px]">
                  Data Isolated
                </Badge>
              </div>
              <p className="text-xs text-slate-300">
                Independent nutrition goals, food scans, and wellness tracking for every family member
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!limitInfo.allowed}
            className="rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md h-9 px-4 shrink-0"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            <span>Add Family Member ({limitInfo.currentCount}/{limitInfo.maxAllowed})</span>
          </Button>
        </div>

        {/* Plan Limit Pill */}
        {!limitInfo.allowed && (
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs flex items-center justify-between">
            <span>Free plan includes 2 profiles. Upgrade to Premium for up to 6 profiles.</span>
            {onUpgradeToPremium && (
              <Button size="sm" onClick={onUpgradeToPremium} className="h-7 text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold">
                Upgrade
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 1. Family Wellness Overview Card */}
      <Card className="rounded-3xl border-border/80 bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Family Wellness Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            High-level tracking summary. Private meal photos and medical logs remain strictly isolated.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {profiles.map((p) => {
              const isCurrent = p.id === activeProfile.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProfile(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isCurrent
                      ? "bg-primary/10 border-primary shadow-xs"
                      : "bg-muted/40 hover:bg-muted border-border/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{p.name}</span>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {p.relation}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-primary">{p.wellnessScore}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground flex items-center justify-between">
                    <span>🔥 {p.streakCount} Day Streak</span>
                    {isCurrent && <span className="text-primary font-bold text-[10px]">Active</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Detailed Profile Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground px-1 uppercase tracking-wider text-muted-foreground">
          Profiles & Personalized Goals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((p) => {
            const isCurrent = p.id === activeProfile.id;
            const isChild = p.ageCategory === "child";

            return (
              <Card
                key={p.id}
                className={`rounded-3xl border transition-all ${
                  isCurrent ? "border-primary/60 shadow-md bg-card" : "border-border/70 bg-card"
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-foreground">{p.name}</span>
                        {isCurrent && (
                          <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px]">
                            Current Active
                          </Badge>
                        )}
                        {isChild && (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px] flex items-center gap-1">
                            <Baby className="w-3 h-3" /> Child Profile
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground capitalize block">
                        Relation: {p.relation} • Age: {p.ageCategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isCurrent ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectProfile(p)}
                          className="h-8 rounded-full text-xs font-semibold"
                        >
                          Switch
                        </Button>
                      ) : (
                        <span className="p-1.5 rounded-full bg-emerald-500/15 text-emerald-600">
                          <Check className="w-4 h-4" />
                        </span>
                      )}

                      {profiles.length > 1 && (
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-2 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Child Safety Banner for Child Profiles */}
                  {isChild && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Child Safety Active
                      </span>
                      <p className="opacity-90 leading-relaxed">
                        Focused on healthy growth, whole foods, and active play. Calorie deficit and weight-loss recommendations are disabled.
                      </p>
                    </div>
                  )}

                  {/* Goals & Progress */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border/60">
                    <div className="p-2 rounded-xl bg-muted/60">
                      <span className="text-[10px] text-muted-foreground block">Water Goal</span>
                      <strong className="text-xs text-foreground font-bold">{p.goals.dailyWaterMl} ml</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-muted/60">
                      <span className="text-[10px] text-muted-foreground block">Protein Goal</span>
                      <strong className="text-xs text-foreground font-bold">{p.goals.dailyProteinG} g</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-muted/60">
                      <span className="text-[10px] text-muted-foreground block">Calories</span>
                      <strong className="text-xs text-foreground font-bold">{p.goals.dailyCaloriesKcal} kcal</strong>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Profile Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Add Family Profile</h2>
              <p className="text-xs text-muted-foreground">
                Set up an isolated profile space with customized nutrition goals
              </p>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav, Meera"
                  required
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Relation</label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value as FamilyRelationType)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs"
                  >
                    <option value="me">Me</option>
                    <option value="partner">Partner</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Age Category</label>
                  <select
                    value={ageCategory}
                    onChange={(e) => setAgeCategory(e.target.value as AgeCategory)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs"
                  >
                    <option value="adult">Adult</option>
                    <option value="senior">Senior (60+)</option>
                    <option value="teen">Teen (13-17)</option>
                    <option value="child">Child (Under 13)</option>
                  </select>
                </div>
              </div>

              {/* Optional Height & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Height (cm) — Optional</label>
                  <Input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="e.g. 165"
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Weight (kg) — Optional</label>
                  <Input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="e.g. 62"
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              {/* Goals */}
              <div className="p-3 rounded-2xl bg-muted/60 space-y-3">
                <span className="font-bold text-foreground block">Personal Daily Targets</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground block">Water (ml)</label>
                    <Input
                      type="number"
                      value={waterGoal}
                      onChange={(e) => setWaterGoal(parseInt(e.target.value, 10) || 2000)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground block">Protein (g)</label>
                    <Input
                      type="number"
                      value={proteinGoal}
                      onChange={(e) => setProteinGoal(parseInt(e.target.value, 10) || 50)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground block">Calories (kcal)</label>
                    <Input
                      type="number"
                      value={caloriesGoal}
                      onChange={(e) => setCaloriesGoal(parseInt(e.target.value, 10) || 1900)}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 rounded-xl font-bold bg-primary text-primary-foreground shadow-md"
              >
                Create Family Profile
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
