"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Coins,
  Flame,
  Gift,
  ListTodo,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { dashboardService, LeaderboardEntry, UserActivity, UserStats } from "@/lib/dashboard-service";
import { authService } from "@/lib/auth-service";
import { isTokenExpired } from "@/lib/token-utils";

type DashboardData = {
  userStats: UserStats | null;
  recentActivities: UserActivity[];
  leaderboard: LeaderboardEntry[];
  availableTasks: Array<{
    id: number;
    title: string;
    platform: string;
    reward_points: number;
  }>;
};

function toLocalDayKey(dateLike?: string | null) {
  if (!dateLike) return null;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatActivityTime(value?: string) {
  if (!value) return "just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";
  return date.toLocaleString();
}

function formatRank(rank?: number) {
  if (!rank) return "N/A";
  return `#${rank}`;
}

function StatCard({
  title,
  value,
  hint,
  icon,
  tone,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: "amber" | "emerald" | "blue" | "slate";
}) {
  const styles = {
    amber: "from-amber-500/20 to-orange-500/20 border-amber-300/60 text-amber-900",
    emerald: "from-emerald-500/20 to-teal-500/20 border-emerald-300/60 text-emerald-900",
    blue: "from-blue-500/20 to-sky-500/20 border-blue-300/60 text-blue-900",
    slate: "from-slate-500/15 to-slate-600/15 border-slate-300/60 text-slate-900",
  }[tone];

  return (
    <Card className={`border bg-gradient-to-br ${styles} shadow-sm`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-600">{title}</p>
            <p className="mt-2 text-3xl font-semibold leading-none">{value}</p>
            <p className="mt-2 text-sm text-slate-700">{hint}</p>
          </div>
          <div className="rounded-xl bg-white/70 p-2">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [dailyMessage, setDailyMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    userStats: null,
    recentActivities: [],
    leaderboard: [],
    availableTasks: [],
  });

  const isDailyClaimedToday = useMemo(() => {
    const todayKey = toLocalDayKey(new Date().toISOString());
    const claimedKey = toLocalDayKey(dashboardData.userStats?.last_daily_claim_date || null);
    return Boolean(todayKey && claimedKey && todayKey === claimedKey);
  }, [dashboardData.userStats?.last_daily_claim_date]);

  const currentUserLeaderboardEntry = useMemo(() => {
    if (!user?.id) return null;
    return dashboardData.leaderboard.find((entry) => entry.user_id === user.id) || null;
  }, [dashboardData.leaderboard, user?.id]);

  const fetchDashboardData = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const [statsRes, activitiesRes, leaderboardRes, tasksRes] = await Promise.allSettled([
        dashboardService.getUserStats(0),
        dashboardService.getUserActivities(0, 6),
        dashboardService.getLeaderboard(10),
        dashboardService.getAvailableTasks(),
      ]);

      const nextState: DashboardData = {
        userStats:
          statsRes.status === "fulfilled" && statsRes.value.success
            ? statsRes.value.data.users[0] || null
            : dashboardData.userStats,
        recentActivities:
          activitiesRes.status === "fulfilled" && activitiesRes.value.success
            ? activitiesRes.value.data.activities || []
            : dashboardData.recentActivities,
        leaderboard:
          leaderboardRes.status === "fulfilled" && leaderboardRes.value.success
            ? (leaderboardRes.value.data.users || []).map((u, index) => ({ ...u, rank: index + 1 }))
            : dashboardData.leaderboard,
        availableTasks:
          tasksRes.status === "fulfilled" && tasksRes.value.success
            ? (tasksRes.value.data.tasks || []).map((task) => ({
                id: task.id,
                title: task.title,
                platform: task.platform,
                reward_points: task.reward_points,
              }))
            : dashboardData.availableTasks,
      };

      setDashboardData(nextState);
    } catch (fetchError: any) {
      const message = fetchError?.message || "Failed to load dashboard data";
      setError(message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const token = authService.getToken();
    const authUser = authService.getUser();

    if (!token || !authUser) {
      router.push("/sign-in");
      return;
    }

    if (isTokenExpired(token)) {
      authService.clearAuth();
      router.push("/sign-in");
      return;
    }

    setUser(authUser);
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData({ silent: true });
    setRefreshing(false);
  };

  const handleClaimDaily = async () => {
    if (claimingDaily || isDailyClaimedToday) {
      setDailyMessage("Daily reward already claimed today.");
      return;
    }

    try {
      setClaimingDaily(true);
      setDailyMessage(null);

      const response = await dashboardService.updateUserStatsAfterDailyReward();
      if (!response.success) {
        setDailyMessage(response.error || "Failed to claim daily reward.");
        return;
      }

      await fetchDashboardData({ silent: true });
      const awardedPoints = Number(response?.data?.points_awarded || 0);
      const bonusSpins = Number(response?.data?.bonus_spins_awarded || 0);
      setDailyMessage(
        `Daily reward claimed: +${awardedPoints} weekly points${bonusSpins > 0 ? `, +${bonusSpins} bonus spins` : ""}.`
      );
    } catch (claimError: any) {
      setDailyMessage(claimError?.message || "Failed to claim daily reward.");
    } finally {
      setClaimingDaily(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const weeklyPoints = dashboardData.userStats?.weekly_points ?? 0;
  const totalCoins = Number(dashboardData.userStats?.total_coins || 0);
  const currentStreak = dashboardData.userStats?.current_streak ?? 0;
  const spinsRemaining = dashboardData.userStats?.spins_remaining ?? 0;
  const currentRank = currentUserLeaderboardEntry?.rank;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(14,165,233,0.17),transparent_40%),radial-gradient(circle_at_84%_4%,rgba(245,158,11,0.14),transparent_35%),radial-gradient(circle_at_50%_96%,rgba(16,185,129,0.14),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl space-y-6 px-2 py-4 sm:px-4">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Operations Console</p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900">Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Weekly points drive leaderboard position. Weekly reset runs at Monday 00:00 UTC and reflected values appear here after refresh.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-slate-300 bg-white"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                onClick={handleClaimDaily}
                disabled={claimingDaily || isDailyClaimedToday}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                {claimingDaily ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                {isDailyClaimedToday ? "Claimed" : "Claim Daily Reward"}
              </Button>
            </div>
          </div>

          {dailyMessage && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {dailyMessage}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
        </motion.section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="stats-cards">
          <StatCard
            title="Weekly Points"
            value={weeklyPoints.toLocaleString()}
            hint="Resets weekly"
            icon={<Trophy className="h-5 w-5 text-amber-600" />}
            tone="amber"
          />
          <StatCard
            title="PineCoins"
            value={`?${totalCoins.toFixed(2)}`}
            hint="Wallet balance"
            icon={<Coins className="h-5 w-5 text-emerald-600" />}
            tone="emerald"
          />
          <StatCard
            title="Current Rank"
            value={formatRank(currentRank)}
            hint="Weekly leaderboard"
            icon={<Sparkles className="h-5 w-5 text-blue-600" />}
            tone="blue"
          />
          <StatCard
            title="Streak / Spins"
            value={`${currentStreak} / ${spinsRemaining}`}
            hint="Days and free spins"
            icon={<Flame className="h-5 w-5 text-slate-700" />}
            tone="slate"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-slate-200/70 bg-white/95 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900">Top Weekly Leaderboard</CardTitle>
                    <CardDescription>Ranking based on weekly points.</CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => router.push("/dashboard/leaderboard")}>
                    Open <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.leaderboard.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className="bg-slate-900 text-white">#{entry.rank}</Badge>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{entry.name}</p>
                        <p className="text-xs text-slate-600">Streak: {entry.current_streak || 0} days</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{(entry.weekly_points || 0).toLocaleString()} wk</p>
                      <p className="text-xs text-slate-600">?{Number(entry.total_coins || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Recent Activity</CardTitle>
                <CardDescription>Most recent account actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.recentActivities.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                    No activity yet.
                  </p>
                )}

                {dashboardData.recentActivities.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="mt-0.5 rounded-lg bg-slate-100 p-2">
                      <Activity className="h-4 w-4 text-slate-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.description}</p>
                      <p className="mt-1 text-xs text-slate-600">{formatActivityTime(item.created_at)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200/70 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <ListTodo className="h-4 w-4" />
                  Available Tasks
                </CardTitle>
                <CardDescription>Work queue with point rewards.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.availableTasks.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                    No tasks available right now.
                  </p>
                )}

                {dashboardData.availableTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                      <span>{task.platform}</span>
                      <span className="font-semibold text-emerald-700">+{task.reward_points} pts</span>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/activities")}> 
                  Open Activities <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-slate-300">Move through key flows.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button variant="secondary" className="justify-start" onClick={() => router.push("/dashboard/spin-wheel")}> 
                  <Target className="mr-2 h-4 w-4" /> Spin Wheel
                </Button>
                <Button variant="secondary" className="justify-start" onClick={() => router.push("/dashboard/prize-pool")}> 
                  <Gift className="mr-2 h-4 w-4" /> Prize Pools
                </Button>
                <Button variant="secondary" className="justify-start" onClick={() => router.push("/dashboard/rewards")}> 
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Rewards
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
