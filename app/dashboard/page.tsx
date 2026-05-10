"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Coins,
  Flame,
  ListTodo,
  Loader2,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";
import { dashboardService, LeaderboardEntry, UserActivity, UserStats } from "@/lib/dashboard-service";
import { authService } from "@/lib/auth-service";
import { isTokenExpired } from "@/lib/token-utils";
import { MiniSpinWheel } from "./_components/mini-spin-wheel";

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
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500 tracking-tight">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{hint}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            {icon}
          </div>
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
  const [dailyMessage, setDailyMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

    try {
      const [statsRes, activitiesRes, leaderboardRes, tasksRes] = await Promise.allSettled([
        dashboardService.getUserStats(0),
        dashboardService.getUserActivities(0, 4),
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
    } catch (error) {
      console.error("Dashboard fetch error", error);
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
    if (claimingDaily || isDailyClaimedToday) return;

    try {
      setClaimingDaily(true);
      setDailyMessage(null);

      const response = await dashboardService.updateUserStatsAfterDailyReward();
      if (!response.success) {
        setDailyMessage({ type: 'error', text: response.error || "Failed to claim daily reward." });
        return;
      }

      await fetchDashboardData({ silent: true });
      const awardedPoints = Number(response?.data?.points_awarded || 0);
      const bonusSpins = Number(response?.data?.bonus_spins_awarded || 0);
      setDailyMessage({
        type: 'success',
        text: `Claimed +${awardedPoints} points${bonusSpins > 0 ? `, +${bonusSpins} spins` : ""}.`
      });
      
      setTimeout(() => setDailyMessage(null), 5000);
    } catch (error: any) {
      setDailyMessage({ type: 'error', text: "Failed to claim daily reward." });
    } finally {
      setClaimingDaily(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-medium">Loading workspace...</span>
        </div>
      </div>
    );
  }

  const weeklyPoints = dashboardData.userStats?.weekly_points ?? 0;
  const totalCoins = Number(dashboardData.userStats?.total_coins || 0);
  const currentStreak = dashboardData.userStats?.current_streak ?? 0;
  const currentRank = currentUserLeaderboardEntry?.rank;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, monitor your progress and weekly standing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {dailyMessage && (
              <span className={`text-sm px-3 py-1.5 rounded-md border ${
                dailyMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {dailyMessage.text}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleClaimDaily}
              disabled={claimingDaily || isDailyClaimedToday}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {claimingDaily ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              {isDailyClaimedToday ? "Reward Claimed" : "Claim Daily"}
            </Button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Weekly Points"
            value={weeklyPoints.toLocaleString()}
            hint="Resets every Monday"
            icon={<Trophy className="h-5 w-5 text-slate-700" />}
          />
          <StatCard
            title="Total Balance"
            value={`${totalCoins.toFixed(2)} PC`}
            hint="Available PineCoins"
            icon={<Coins className="h-5 w-5 text-slate-700" />}
          />
          <StatCard
            title="Current Rank"
            value={currentRank ? `#${currentRank}` : "-"}
            hint="Global leaderboard"
            icon={<Users className="h-5 w-5 text-slate-700" />}
          />
          <StatCard
            title="Login Streak"
            value={`${currentStreak} days`}
            hint="Active daily streak"
            icon={<Flame className="h-5 w-5 text-slate-700" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-1 flex flex-col">
            {/* Mini Spin Wheel */}
            <div className="flex-1 min-h-[360px]">
              <MiniSpinWheel onSpinComplete={() => fetchDashboardData({ silent: true })} />
            </div>

            {/* Available Tasks */}
            <Card className="border-slate-200 bg-white shadow-sm flex-1">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-slate-700" />
                  Quick Tasks
                </CardTitle>
                <CardDescription>Complete tasks to earn points.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {dashboardData.availableTasks.length === 0 ? (
                  <div className="py-6 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-lg">
                    No pending tasks
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.availableTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-slate-900 line-clamp-1">{task.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{task.platform}</p>
                        </div>
                        <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-200 border-none">
                          +{task.reward_points}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full text-sm text-slate-600 mt-2" onClick={() => router.push("/dashboard/activities")}>
                      View All Tasks <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Leaderboard & Activity) */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Sleek Leaderboard Table */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-slate-700" />
                    Global Leaderboard
                  </CardTitle>
                  <CardDescription>Top performers this week.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/leaderboard")} className="hidden sm:flex">
                  View Full
                </Button>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-white border-b border-slate-100 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-medium">Rank</th>
                      <th className="px-6 py-4 font-medium">Player</th>
                      <th className="px-6 py-4 font-medium text-right">Points</th>
                      <th className="px-6 py-4 font-medium text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dashboardData.leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          No leaderboard data available.
                        </td>
                      </tr>
                    ) : (
                      dashboardData.leaderboard.slice(0, 6).map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-semibold ${
                              entry.rank === 1 ? 'bg-slate-900 text-white' :
                              entry.rank === 2 ? 'bg-slate-700 text-white' :
                              entry.rank === 3 ? 'bg-slate-500 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {entry.rank}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <div className="font-medium text-slate-900">{entry.name}</div>
                            <div className="text-xs text-slate-500">{entry.current_streak} day streak</div>
                          </td>
                          <td className="px-6 py-3 text-right font-medium text-slate-900">
                            {(entry.weekly_points || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-3 text-right text-slate-600">
                            {Number(entry.total_coins || 0).toFixed(2)} PC
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recent Activity (Compact) */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-medium text-slate-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-slate-700" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {dashboardData.recentActivities.length === 0 ? (
                  <div className="py-4 text-center text-sm text-slate-500">
                    No recent activity
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.recentActivities.map((item) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="mt-0.5 w-2 h-2 rounded-full bg-slate-300 ring-4 ring-slate-50" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">{item.description}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{formatActivityTime(item.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

