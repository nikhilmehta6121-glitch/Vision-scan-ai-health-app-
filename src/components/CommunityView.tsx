import React, { useState, useEffect } from "react";
import { 
  Users, 
  Sparkles, 
  Flame, 
  Award, 
  Send, 
  Heart, 
  Lock, 
  Globe, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  PlusCircle, 
  MessageCircle, 
  Share2, 
  Trophy,
  Droplet,
  Utensils
} from "lucide-react";
import { CommunityPost, WellnessChallenge } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const COMMUNITY_POSTS_KEY = "vsah_community_posts_v1";

export const CommunityView: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const raw = localStorage.getItem(COMMUNITY_POSTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to read community posts", e);
    }

    // Default high-value community wellness posts (privacy safe, no medical claims)
    return [
      {
        id: "post_1",
        authorName: "Nikhil M.",
        timestamp: Date.now() - 3 * 3600 * 1000,
        content: "Completed day 5 of tracking lunch meals and hit my daily hydration goal early today! Consistency is building up.",
        badge: "🔥 5-Day Streak",
        challengeCompleted: "7-Day Hydration Hero",
        cheersCount: 14,
        hasCheered: false,
        privacy: "public",
      },
      {
        id: "post_2",
        authorName: "Priya S.",
        timestamp: Date.now() - 7 * 3600 * 1000,
        content: "Added colorful salad and spinach dal to my lunch. Loving how easy it is to detect multiple meal items with the new scanner!",
        badge: "🥗 Fiber & Nutrient Boost",
        cheersCount: 22,
        hasCheered: true,
        privacy: "public",
      },
      {
        id: "post_3",
        authorName: "Wellness Team",
        timestamp: Date.now() - 20 * 3600 * 1000,
        content: "Announcement: Vision Scan AI Health 2.0 now features client-encrypted backups, AI Nutrition Coach, and Family Profiles! Keep up the healthy habits.",
        badge: "📢 App Announcement",
        cheersCount: 45,
        hasCheered: false,
        privacy: "public",
      },
    ];
  });

  const [postText, setPostText] = useState("");
  const [selectedBadge, setSelectedBadge] = useState<string>("🔥 5-Day Streak");
  const [privacySetting, setPrivacySetting] = useState<"private" | "followers" | "public">("private"); // Default is Private!
  const [isPosting, setIsPosting] = useState(false);

  // Active Wellness Challenges
  const challenges: WellnessChallenge[] = [
    {
      id: "ch_hydr",
      title: "7-Day Hydration Hero",
      description: "Hit your personalized daily water target for 7 consecutive days.",
      participantsCount: 1420,
      daysRemaining: 4,
      rewardBadge: "💧 Hydration Master",
      category: "hydration",
    },
    {
      id: "ch_prot",
      title: "Protein Power Week",
      description: "Reach your protein goal 5 out of 7 days using nutrient-dense foods.",
      participantsCount: 980,
      daysRemaining: 6,
      rewardBadge: "⚡ Protein Champion",
      category: "nutrition",
    },
    {
      id: "ch_scan",
      title: "3-Meal Scanner Streak",
      description: "Log breakfast, lunch, and dinner with Food Scanner 2.0.",
      participantsCount: 2150,
      daysRemaining: 3,
      rewardBadge: "📸 Food Scan Pro",
      category: "consistency",
    },
  ];

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) {
      toast.error("Please enter a message to share.");
      return;
    }

    setIsPosting(true);
    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      authorName: "You",
      timestamp: Date.now(),
      content: postText.trim(),
      badge: selectedBadge,
      cheersCount: 0,
      hasCheered: false,
      privacy: privacySetting,
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    try {
      localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Save post failed", err);
    }

    setPostText("");
    setIsPosting(false);
    toast.success(
      privacySetting === "private"
        ? "Post saved privately to your wellness journal!"
        : "Wellness milestone shared with the community!"
    );
  };

  const handleToggleCheer = (postId: string) => {
    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === postId) {
          const nextCheered = !p.hasCheered;
          return {
            ...p,
            hasCheered: nextCheered,
            cheersCount: p.cheersCount + (nextCheered ? 1 : -1),
          };
        }
        return p;
      });
      localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div id="community-view-container" className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-indigo-700 via-purple-700 to-blue-800 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Wellness Community</h1>
              <Badge className="bg-white/20 text-white border-white/30 text-[10px]">
                Safe & Moderated
              </Badge>
            </div>
            <p className="text-xs text-white/80">
              Celebrate healthy habits, share wellness milestones, and stay inspired
            </p>
          </div>
        </div>

        {/* Non-Medical Safety Banner */}
        <div className="p-3 rounded-2xl bg-black/25 backdrop-blur-xs border border-white/20 text-[11px] text-white/90 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
          <span>
            <strong>Safe Community Policy:</strong> This is a positive wellness community, not a medical forum. Private weights and personal medical information are never shared automatically.
          </span>
        </div>
      </div>

      {/* 1. Trending Wellness Challenges */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 px-1">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Trending Wellness Challenges</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {challenges.map((ch) => (
            <Card key={ch.id} className="rounded-2xl border-border/80 bg-card shadow-xs hover:border-primary/50 transition-colors">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                    {ch.category}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">{ch.daysRemaining} days left</span>
                </div>
                <h3 className="font-bold text-sm text-foreground">{ch.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{ch.description}</p>
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{ch.participantsCount.toLocaleString()} active</span>
                  <strong className="text-amber-600 dark:text-amber-400">{ch.rewardBadge}</strong>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. Create Post Card */}
      <Card className="rounded-3xl border-border/80 bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-primary" />
            <span>Share a Healthy Habit or Milestone</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What healthy habit did you complete today? (e.g. Drank 2L water, had a high-fiber lunch...)"
              rows={3}
              className="w-full p-3 rounded-2xl border border-input bg-background text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 resize-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Badge Selection */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold text-[11px]">Milestone:</span>
                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="h-8 px-2.5 rounded-xl border border-input bg-background text-xs"
                >
                  <option value="🔥 5-Day Streak">🔥 5-Day Streak</option>
                  <option value="🥗 Nutrient-Dense Meal">🥗 Nutrient-Dense Meal</option>
                  <option value="💧 Hydration Target Met">💧 Hydration Target Met</option>
                  <option value="⚡ Protein Goal Achieved">⚡ Protein Goal Achieved</option>
                  <option value="📸 Food Scanner Pro">📸 Food Scanner Pro</option>
                </select>
              </div>

              {/* Privacy Setting (DEFAULT IS PRIVATE) */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold text-[11px]">Privacy:</span>
                <select
                  value={privacySetting}
                  onChange={(e) => setPrivacySetting(e.target.value as any)}
                  className="h-8 px-2.5 rounded-xl border border-input bg-background text-xs font-semibold"
                >
                  <option value="private">🔒 Private (Only Me)</option>
                  <option value="followers">👥 Friends & Followers</option>
                  <option value="public">🌐 Public Community</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={!postText.trim() || isPosting}
                className="h-9 px-4 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-md ml-auto"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>Post</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 3. Community Feed */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground px-1 uppercase tracking-wider text-muted-foreground">
          Community Habit Feed
        </h2>

        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="rounded-3xl border-border/80 bg-card shadow-xs">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {post.authorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-foreground block">{post.authorName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(post.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {post.privacy === "public" ? (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Public
                      </span>
                    ) : post.privacy === "followers" ? (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> Friends
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Private
                      </span>
                    )}

                    {post.badge && (
                      <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px]">
                        {post.badge}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {post.challengeCompleted && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Completed Challenge: <strong>{post.challengeCompleted}</strong></span>
                  </div>
                )}

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleCheer(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-colors ${
                      post.hasCheered
                        ? "bg-rose-500/15 text-rose-600"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${post.hasCheered ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>{post.cheersCount} Cheers</span>
                  </button>

                  <span className="text-[10px] text-muted-foreground">
                    Wellness Milestone
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
