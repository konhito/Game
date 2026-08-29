"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  TrendingUp,
  Crown,
  Calendar,
  Loader2,
  RefreshCw,
  Flame,
  Clock3,
  CircleHelp,
  Gift,
  Target,
} from "lucide-react";
import { dashboardService } from "@/lib/dashboard-service";
import { authService } from "@/lib/auth-service";

interface LeaderboardEntry {
  id: number;
  user_id: number;
  name: string;
  rank?: number;
  weekly_points: number;
  current_streak: number;
  tasks_completed: number;
}

interface WeeklyPool {
  pinecoins: number;
  naira: number;
  exchange_rate: number;
  buy_rate?: number;
  sell_rate?: number;
  last_updated?: string;
}

interface WeeklyRewardConfig {
  rank: number | string;
  pinecoins: number;
  naira: number;
  percentage: number;
}

interface TaskPointRules {
  signup_points: number;
  referral_points: number;
  share_social_points: number;
  share_news_points: number;
  comment_points: number;
  like_points: number;
  daily_login_points: number;
  login_streak_bonus_days: number;
  login_streak_bonus_spins: number;
}

const defaultTaskPointRules: TaskPointRules = {
  signup_points: 50,
  referral_points: 30,
  share_social_points: 20,
  share_news_points: 10,
  comment_points: 5,
  like_points: 5,
  daily_login_points: 5,
  login_streak_bonus_days: 3,
  login_streak_bonus_spins: 2,
};

export default function LeaderboardPage() {
  const POLL_INTERVAL_MS = 5000;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [weeklyPool, setWeeklyPool] = useState<WeeklyPool | null>(null);
  const [weeklyRewardConfig, setWeeklyRewardConfig] = useState<WeeklyRewardConfig[]>([]);
  const [taskPointRules, setTaskPointRules] = useState<TaskPointRules>(defaultTaskPointRules);
  const leaderboardRequestRef = useRef<Promise<void> | null>(null);

  const poolDisplay = weeklyPool || {
    pinecoins: 0,
    naira: 0,
    exchange_rate: 0,
    buy_rate: 0,
    sell_rate: 0,
  };

  const weeklyRewards =
    weeklyRewardConfig.length > 0
      ? weeklyRewardConfig.map((reward) => {
          const rank = reward.rank;
          const tone =
            rank === 1
              ? "bg-amber-100 text-amber-800 border-amber-200"
              : rank === 2
                ? "bg-slate-200 text-slate-700 border-slate-300"
                : rank === 3
                  ? "bg-orange-100 text-orange-800 border-orange-200"
                  : "bg-emerald-100 text-emerald-800 border-emerald-200";

          return {
            rank,
            rankLabel: typeof rank === "number" ? `#${rank}` : String(rank),
            reward: `${Number(reward.percentage || 0).toFixed(2).replace(/\.00$/, "")}%`,
            amount: `PC ${Number(reward.pinecoins || 0).toLocaleString()}`,
            naira: `NGN ${Number(reward.naira || 0).toLocaleString()}`,
            tone,
          };
        })
      : [
          { rank: 1, rankLabel: "#1", reward: "50%", amount: "PC 2,500", naira: "NGN 0", tone: "bg-amber-100 text-amber-800 border-amber-200" },
          { rank: 2, rankLabel: "#2", reward: "30%", amount: "PC 1,500", naira: "NGN 0", tone: "bg-slate-200 text-slate-700 border-slate-300" },
          { rank: 3, rankLabel: "#3", reward: "15%", amount: "PC 750", naira: "NGN 0", tone: "bg-orange-100 text-orange-800 border-orange-200" },
          { rank: "Random", rankLabel: "Random", reward: "5%", amount: "PC 250", naira: "NGN 0", tone: "bg-emerald-100 text-emerald-800 border-emerald-200" },
        ];

  useEffect(() => {
    const checkAuth = async () => {
      const user = authService.getUser();
      const token = authService.getToken();

      if (!user || !token) {
        router.push("/sign-in");
        return;
      }

      setCurrentUser(user);
      await fetchLeaderboard({ showLoader: true });
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;

    const intervalId = setInterval(() => {
      fetchLeaderboard({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [currentUser]);

  const fetchLeaderboard = async (options?: { showLoader?: boolean; silent?: boolean }) => {
    if (leaderboardRequestRef.current) return leaderboardRequestRef.current;

    const showLoader = Boolean(options?.showLoader);
    const silent = Boolean(options?.silent);

    const request = (async () => {
      try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await dashboardService.getLeaderboard(50);

      if (response.success && response.data.users) {
        setLeaderboardData(response.data.users as LeaderboardEntry[]);

        if (response.data.weekly_pool) {
          setWeeklyPool(response.data.weekly_pool);
        }
        if (Array.isArray(response.data.weekly_rewards)) {
          setWeeklyRewardConfig(response.data.weekly_rewards);
        }
        if (response.data.task_point_rules) {
          setTaskPointRules({
            ...defaultTaskPointRules,
            ...response.data.task_point_rules,
          });
        }

        setErrorMessage(null);
      }
      } catch (error) {
      console.error("Error fetching leaderboard:", error);
      if (!silent) {
        setErrorMessage("Leaderboard is temporarily unavailable. Retrying every 5 seconds.");
      }
      } finally {
      if (showLoader) {
        setLoading(false);
      }
      }
    })();

    leaderboardRequestRef.current = request;
    try {
      await request;
    } finally {
      if (leaderboardRequestRef.current === request) leaderboardRequestRef.current = null;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard({ silent: true });
    setRefreshing(false);
  };

  const getUserRank = () => {
    if (!currentUser) return null;
    const userEntry = leaderboardData.find((entry) => entry.user_id === currentUser.id);
    return userEntry?.rank || null;
  };

  const getUserPoints = () => {
    if (!currentUser) return 0;
    const userEntry = leaderboardData.find((entry) => entry.user_id === currentUser.id);
    return userEntry?.weekly_points || 0;
  };

  const getUserWeeklyPoints = () => {
    if (!currentUser) return 0;
    const userEntry = leaderboardData.find((entry) => entry.user_id === currentUser.id);
    return userEntry?.weekly_points || 0;
  };

  const getUserStreak = () => {
    if (!currentUser) return 0;
    const userEntry = leaderboardData.find((entry) => entry.user_id === currentUser.id);
    return userEntry?.current_streak || 0;
  };

  const getNextResetTime = () => {
    const now = new Date();
    const currentDay = now.getUTCDay();
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    const nextMonday = new Date(now);
    nextMonday.setUTCDate(now.getUTCDate() + (7 - daysSinceMonday));
    nextMonday.setUTCHours(0, 0, 0, 0);

    const daysUntilReset = Math.ceil((nextMonday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilReset;
  };

  const getRankTone = (rank?: number) => {
    if (rank === 1) {
      return "bg-amber-50 border-amber-200";
    }
    if (rank === 2) {
      return "bg-slate-100 border-slate-300";
    }
    if (rank === 3) {
      return "bg-orange-50 border-orange-200";
    }
    return "bg-white border-slate-200";
  };

  const getRankBadgeTone = (rank?: number) => {
    if (rank === 1) {
      return "bg-amber-600 text-amber-50";
    }
    if (rank === 2) {
      return "bg-slate-600 text-slate-50";
    }
    if (rank === 3) {
      return "bg-orange-600 text-orange-50";
    }
    return "bg-slate-700 text-slate-50";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[oklch(0.98_0.01_190)] p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex items-center justify-center gap-3 text-slate-700">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-base font-medium">Loading leaderboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.98_0.01_190)] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6 px-1 sm:px-0">
        <header className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                <Trophy className="h-3.5 w-3.5" />
                Weekly competition
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Leaderboard</h1>
              <p className="max-w-[70ch] text-sm text-slate-600">
                Rankings update continuously, rewards settle every Monday at 00:00 UTC.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {errorMessage && <p className="mt-3 text-sm text-red-700">{errorMessage}</p>}
        </header>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2 border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-slate-900">Top players</CardTitle>
                  <CardDescription>Top 10 by weekly points</CardDescription>
                </div>
                <Badge variant="secondary" className="w-fit rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                  {getNextResetTime()} days to reset
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {leaderboardData.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-base font-medium text-slate-800">No leaderboard data available yet.</p>
                  <p className="mt-1 text-sm text-slate-600">Complete activities to appear in the rankings.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboardData.slice(0, 10).map((player) => {
                    const isCurrentUser = currentUser?.id === player.user_id;
                    return (
                      <div
                        key={player.id}
                        className={`rounded-xl border p-3 transition-colors sm:p-4 ${getRankTone(player.rank)} ${
                          isCurrentUser ? "ring-1 ring-emerald-300" : ""
                        }`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getRankBadgeTone(
                                player.rank
                              )}`}
                            >
                              #{player.rank}
                            </span>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">{player.name}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                                <span className="inline-flex items-center gap-1">
                                  <Flame className="h-3.5 w-3.5 text-orange-600" />
                                  {player.current_streak || 0} day streak
                                </span>
                                {isCurrentUser && (
                                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                    You
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-lg font-semibold text-slate-900 sm:text-xl">{(player.weekly_points || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Crown className="h-5 w-5 text-amber-700" />
                  Reward distribution
                </CardTitle>
                <CardDescription>How the weekly pool is shared</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {weeklyRewards.map((reward, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${reward.tone}`}>
                        {reward.rankLabel}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{reward.reward}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{reward.amount}</p>
                      <p className="text-xs text-emerald-700">{reward.naira}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <TrendingUp className="h-5 w-5 text-blue-700" />
                  Earning actions
                </CardTitle>
                <CardDescription>Configured point values</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Sign up</span>
                  <span className="font-medium text-slate-800">+{taskPointRules.signup_points}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Referral</span>
                  <span className="font-medium text-slate-800">+{taskPointRules.referral_points}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Share social post</span>
                  <span className="font-medium text-slate-800">+{taskPointRules.share_social_points}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Share news post</span>
                  <span className="font-medium text-slate-800">+{taskPointRules.share_news_points}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Comment on social post</span>
                  <span className="font-medium text-slate-800">+{taskPointRules.comment_points}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Like social post</span>
                  <span className="font-medium text-slate-800">+{taskPointRules.like_points}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Daily login</span>
                  <span className="font-medium text-slate-800">+{taskPointRules.daily_login_points}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>{taskPointRules.login_streak_bonus_days}-day streak bonus</span>
                  <span className="font-medium text-slate-800">+{taskPointRules.login_streak_bonus_spins} spins</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <CircleHelp className="h-5 w-5 text-indigo-700" />
                  Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <p>Leaderboard resets every Monday at 00:00 UTC.</p>
                <p>Top 3 ranks receive fixed reward shares, and 5% goes to one randomly selected user.</p>
                <p>Points drive rank placement, PineCoin rewards settle weekly.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Target className="h-5 w-5 text-emerald-700" />
                Your snapshot
              </CardTitle>
              <CardDescription>Live stats for your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Current rank</p>
                <p className="text-xl font-semibold text-slate-900">{getUserRank() ? `#${getUserRank()}` : "Unranked"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Weekly points</p>
                <p className="text-xl font-semibold text-slate-900">{getUserPoints().toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">This week</p>
                <p className="text-xl font-semibold text-slate-900">{getUserWeeklyPoints().toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Current streak</p>
                <p className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                  <Flame className="h-4 w-4 text-orange-600" />
                  {getUserStreak()} days
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Gift className="h-5 w-5 text-emerald-700" />
                  Weekly prize pool
                </CardTitle>
              <CardDescription>Current weekly payout snapshot</CardDescription>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total PineCoins</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">PC {poolDisplay.pinecoins.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Estimated Naira value</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">NGN {poolDisplay.naira.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  Payout rate: NGN {(poolDisplay.buy_rate || poolDisplay.exchange_rate).toLocaleString()} / PC
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  Market rate: NGN {poolDisplay.exchange_rate.toLocaleString()} / PC
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  Sell rate: NGN {(poolDisplay.sell_rate || poolDisplay.exchange_rate).toLocaleString()} / PC
                </div>
              </div>
              {poolDisplay.last_updated && (
                <p className="mt-2 text-xs text-slate-500">Last updated: {new Date(poolDisplay.last_updated).toLocaleString()}</p>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Continue earning points</h2>
              <p className="mt-1 text-sm text-slate-600">Complete activities now to improve your next weekly position.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => router.push("/dashboard")} className="bg-emerald-600 hover:bg-emerald-700">
                <Trophy className="mr-2 h-4 w-4" />
                Go to dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/activities")}>
                <Calendar className="mr-2 h-4 w-4" />
                View activities
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
