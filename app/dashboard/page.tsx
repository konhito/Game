"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Gift, Users, Loader2, RefreshCw, ArrowRight, Star, TrendingUp, Activity, Calendar, Clock, Target, Zap } from "lucide-react";
import { dashboardService, UserStats, UserActivity, LeaderboardEntry } from "@/lib/dashboard-service";

interface DashboardData {
  userStats: UserStats | null;
  recentActivities: UserActivity[];
  leaderboard: LeaderboardEntry[];
  availableTasks: any[];
  userTaskHistory: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    userStats: null,
    recentActivities: [],
    leaderboard: [],
    availableTasks: [],
    userTaskHistory: []
  });
  const [spinning, setSpinning] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<{ points: number; message: string } | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  const [claimingDailyReward, setClaimingDailyReward] = useState(false);
  const [dailyRewardMessage, setDailyRewardMessage] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      // Only run on client side - moved inside the async function
      if (typeof window === 'undefined') {
        return;
      }
      
      console.log("Dashboard: Waiting for auth service to initialize...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check authentication status with retry logic
      const checkAuth = async (retryCount = 0) => {
        try {
          console.log("Dashboard: Checking authentication... (attempt", retryCount + 1, ")");
          
          // Direct localStorage check first
          const token = localStorage.getItem('auth_token');
          const userStr = localStorage.getItem('auth_user');
          let user = null;
          
          if (userStr) {
            try {
              user = JSON.parse(userStr);
            } catch (e) {
              console.error('Failed to parse stored user:', e);
            }
          }
          
          console.log("Dashboard: Direct localStorage check:");
          console.log("  token:", token ? 'present' : 'missing');
          console.log("  user:", user ? 'present' : 'missing');
          console.log("  user data:", user);
          
          // Check if we have both token and user
          if (!token || !user) {
            console.log("Dashboard: Missing token or user data");
            
            // If this is the first attempt, wait a bit and retry
            if (retryCount === 0) {
              console.log("Dashboard: First attempt failed, waiting 1000ms and retrying...");
              await new Promise(resolve => setTimeout(resolve, 1000));
              return checkAuth(1);
            }
            
            console.log("Dashboard: Retry failed, redirecting to sign-in");
            router.push("/sign-in");
            return;
          }

          console.log("Dashboard: User authenticated, setting user data:", user);
          setUser(user);
          
          // Check backend connection
          await checkBackendConnection();
          
          // Fetch dashboard data
          await fetchDashboardData(user.id);
        } catch (error) {
          console.error('Dashboard: Failed to check authentication:', error);
          router.push("/sign-in");
        }
      };

      checkAuth();
    };

    initializeAuth();
  }, [router]);

  const checkBackendConnection = async () => {
    try {
      const healthCheck = await dashboardService.healthCheck();
      setBackendConnected(true);
      console.log('Backend connected:', healthCheck);
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendConnected(false);
    }
  };

  const refreshDailyRewardStatus = async () => {
    if (!user) return;
    
    try {
      const statsResponse = await dashboardService.getUserStats(user.id);
      if (statsResponse.success && statsResponse.data.users && statsResponse.data.users.length > 0) {
        const userStats = statsResponse.data.users[0];
        
        // Update user stats
        setDashboardData(prev => ({ ...prev, userStats }));
        
        // Check daily reward status
        if (userStats.last_daily_claim_date) {
          const lastClaimDate = new Date(userStats.last_daily_claim_date);
          const today = new Date();
          const isSameDay = lastClaimDate.toDateString() === today.toDateString();
          setDailyRewardClaimed(isSameDay);
        } else {
          setDailyRewardClaimed(false);
        }
      }
    } catch (error) {
      console.error('Error refreshing daily reward status:', error);
    }
  };

  const fetchDashboardData = async (userId: number) => {
    try {
      setLoading(true);

      // Fetch user stats
      const statsResponse = await dashboardService.getUserStats(userId);
      if (statsResponse.success && statsResponse.data.users && statsResponse.data.users.length > 0) {
        const userStats = statsResponse.data.users[0];
        setDashboardData(prev => ({ ...prev, userStats }));
        
        // Check if daily reward was already claimed today
        if (userStats.last_daily_claim_date) {
          const lastClaimDate = new Date(userStats.last_daily_claim_date);
          const today = new Date();
          const isSameDay = lastClaimDate.toDateString() === today.toDateString();
          setDailyRewardClaimed(isSameDay);
          console.log('Daily reward claim status:', {
            lastClaimDate: lastClaimDate.toDateString(),
            today: today.toDateString(),
            isSameDay,
            claimed: isSameDay
          });
        } else {
          setDailyRewardClaimed(false);
          console.log('No previous daily claim date found, reward available');
        }
      }

      // Fetch recent activities
      const activitiesResponse = await dashboardService.getUserActivities(userId, 5);
      if (activitiesResponse.success) {
        setDashboardData(prev => ({ ...prev, recentActivities: activitiesResponse.data.activities || [] }));
      }

      // Fetch leaderboard
      const leaderboardResponse = await dashboardService.getLeaderboard(10);
      if (leaderboardResponse.success) {
        const leaderboard = leaderboardResponse.data.users || [];
        // Add rank to leaderboard entries
        const rankedLeaderboard = leaderboard.map((entry: any, index: number) => ({
          ...entry,
          rank: index + 1
        }));
        setDashboardData(prev => ({ ...prev, leaderboard: rankedLeaderboard }));
      }

      // Fetch available tasks
      const tasksResponse = await dashboardService.getAvailableTasks();
      if (tasksResponse.success) {
        setDashboardData(prev => ({ ...prev, availableTasks: tasksResponse.data.tasks || [] }));
      }

      // Fetch user task history
      const historyResponse = await dashboardService.getUserTaskHistory(userId);
      if (historyResponse.success) {
        setDashboardData(prev => ({ ...prev, userTaskHistory: historyResponse.data.tasks || [] }));
      }

      // Log dashboard view activity
      try {
        await dashboardService.logActivity('dashboard_view', 'Viewed dashboard overview');
      } catch (error) {
        console.error('Failed to log dashboard view activity:', error);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWheelSpin = async () => {
    if (!dashboardData.userStats || (dashboardData.userStats.spins_remaining || 0) <= 0) return;

    try {
      setSpinning(true);
      setSpinResult(null);
      
      // Define wheel segments with rewards
      const wheelSegments = [
        { points: 10, probability: 0.3, color: "from-red-500 to-red-600", icon: "🎯" },
        { points: 25, probability: 0.25, color: "from-blue-500 to-blue-600", icon: "💎" },
        { points: 50, probability: 0.2, color: "from-green-500 to-green-600", icon: "🍀" },
        { points: 100, probability: 0.15, color: "from-yellow-500 to-yellow-600", icon: "⭐" },
        { points: 200, probability: 0.08, color: "from-purple-500 to-purple-600", icon: "👑" },
        { points: 500, probability: 0.02, color: "from-pink-500 to-pink-600", icon: "🚀" }
      ];

      // Calculate reward based on probability
      const random = Math.random();
      let cumulativeProbability = 0;
      let selectedReward = wheelSegments[0];

      for (const segment of wheelSegments) {
        cumulativeProbability += segment.probability;
        if (random <= cumulativeProbability) {
          selectedReward = segment;
          break;
        }
      }

      // Calculate rotation (5-10 full spins + random segment)
      const baseSpins = 5 + Math.random() * 5;
      const segmentAngle = 360 / wheelSegments.length;
      const segmentIndex = wheelSegments.indexOf(selectedReward);
      const finalRotation = (baseSpins * 360) + (segmentIndex * segmentAngle) + (Math.random() * segmentAngle);
      
      setWheelRotation(finalRotation);

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update user stats on backend
      const coins = selectedReward.points * 0.1;
      await dashboardService.updateUserStatsAfterSpin(selectedReward.points, coins);
      
      // Update local state
      setDashboardData(prev => ({
        ...prev,
        userStats: prev.userStats ? {
          ...prev.userStats,
          total_points: prev.userStats.total_points + selectedReward.points,
          weekly_points: (prev.userStats.weekly_points || 0) + selectedReward.points,
          spins_remaining: (prev.userStats.spins_remaining || 0) - 1,
          total_coins: prev.userStats.total_coins + coins
        } : null
      }));

      // Show result
      setSpinResult({
        points: selectedReward.points,
        message: `🎉 Congratulations! You won ${selectedReward.points} points and ${coins.toFixed(1)} PineCoins!`
      });

    } catch (error) {
      console.error('Error spinning wheel:', error);
      alert('Failed to spin wheel. Please try again.');
    } finally {
      setSpinning(false);
    }
  };

  const handleDailyReward = async () => {
    if (dailyRewardClaimed || claimingDailyReward) {
      setDailyRewardMessage('Daily reward already claimed today! Come back tomorrow.');
      return;
    }

    try {
      setClaimingDailyReward(true);
      setDailyRewardMessage(null);
      
      const baseReward = 20;
      const currentStreak = dashboardData.userStats?.current_streak || 0;
      const streakBonus = Math.min(currentStreak * 5, 50);
      const totalReward = baseReward + streakBonus;
      const coins = Math.round(totalReward * 0.05);
      
      console.log('Claiming daily reward:', {
        baseReward,
        currentStreak,
        streakBonus,
        totalReward,
        coins
      });
      
      // Update user stats on backend
      const response = await dashboardService.updateUserStatsAfterDailyReward(totalReward, coins);
      
      if (response.success) {
        // Update local state
        setDashboardData(prev => ({
          ...prev,
          userStats: prev.userStats ? {
            ...prev.userStats,
            total_points: prev.userStats.total_points + totalReward,
            weekly_points: (prev.userStats.weekly_points || 0) + totalReward,
            current_streak: currentStreak + 1,
            total_coins: prev.userStats.total_coins + coins,
            last_daily_claim_date: new Date().toISOString()
          } : null
        }));

        setDailyRewardClaimed(true);
        setDailyRewardMessage(`🎉 Daily reward claimed! +${totalReward} points (${streakBonus} streak bonus) +${coins} PineCoins`);
        
        // Refresh the dashboard data to ensure consistency
        setTimeout(() => {
          refreshDailyRewardStatus();
        }, 1000);
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setDailyRewardMessage(null);
        }, 5000);
      } else {
        setDailyRewardMessage(response.error || 'Failed to claim daily reward. Please try again.');
      }
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      if (error instanceof Error && error.message.includes('already claimed')) {
        setDailyRewardClaimed(true);
        setDailyRewardMessage('Daily reward already claimed today! Come back tomorrow.');
      } else {
        setDailyRewardMessage('Failed to claim daily reward. Please try again.');
      }
    } finally {
      setClaimingDailyReward(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header Skeleton */}
            <div className="text-center mb-8">
              <div className="h-10 bg-slate-200 rounded-lg w-96 mx-auto mb-2 animate-pulse"></div>
              <div className="h-6 bg-slate-200 rounded-lg w-80 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-48 mx-auto animate-pulse"></div>
            </div>

            {/* Stats Overview Skeleton */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="bg-white/80 border-slate-200/50 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-slate-200 rounded w-20 mb-2 animate-pulse"></div>
                    <div className="h-2 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded w-32 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Big Spin Button Skeleton */}
            <div className="text-center mb-8">
              <div className="h-16 bg-slate-200 rounded-2xl w-80 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-48 mx-auto animate-pulse"></div>
            </div>

            {/* Main Actions Skeleton */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="bg-white/80 border-slate-200/50 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
                      <div>
                        <div className="h-5 bg-slate-200 rounded w-24 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="h-12 bg-slate-200 rounded-full w-12 mx-auto mb-3 animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-32 mx-auto mb-2 animate-pulse"></div>
                      <div className="h-6 bg-slate-200 rounded w-20 mx-auto mb-4 animate-pulse"></div>
                    </div>
                    <div className="h-12 bg-slate-200 rounded-xl w-full animate-pulse"></div>
                    <div className="h-16 bg-slate-200 rounded-lg w-full animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Leaderboard and Activities Skeleton */}
            <div className="grid lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, index) => (
                <Card key={index} className="bg-white/80 border-slate-200/50 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
                      <div>
                        <div className="h-5 bg-slate-200 rounded w-32 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-slate-200 rounded w-40 animate-pulse"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...Array(5)].map((_, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between p-4 rounded-xl bg-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
                            <div>
                              <div className="h-4 bg-slate-200 rounded w-24 mb-1 animate-pulse"></div>
                              <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="h-4 bg-slate-200 rounded w-16 mb-1 animate-pulse"></div>
                            <div className="h-3 bg-slate-200 rounded w-12 animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 text-center">
                      <div className="h-10 bg-slate-200 rounded w-40 mx-auto animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData.userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Failed to load user stats</p>
        </div>
      </div>
    );
  }

  // Add safe access helper
  const safeUserStats = dashboardData.userStats || {};
  const safeTotalPoints = safeUserStats.total_points || 0;
  const safeTotalCoins = safeUserStats.total_coins || 0;
  const safeCurrentStreak = safeUserStats.current_streak || 0;
  const safeWeeklyPoints = safeUserStats.weekly_points || 0;
  const safeSpinsRemaining = safeUserStats.spins_remaining || 0;
  const safeLastLoginDate = safeUserStats.last_login_date;

  // Calculate next reward
  const nextRewardAt = Math.max(0, 2500 - safeTotalPoints);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">


      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header with Live Stats */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-2">
              Welcome Back, {user?.name || 'Player'}! 👋
            </h2>
            <p className="text-slate-600 text-lg">Ready to climb the leaderboard and earn PineCoins?</p>
            
            {/* Live Stats Display in Welcome Header */}
            

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>Last login: {safeLastLoginDate ? new Date(safeLastLoginDate).toLocaleDateString() : 'Today'}</span>
            </div>
          </motion.div>

          {/* Enhanced Stats Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Total Points Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Total Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                                     <div className="text-3xl font-bold mb-2">{safeTotalPoints.toLocaleString()}</div>
                  <Progress 
                                         value={Math.min(100, (safeTotalPoints / 2500) * 100)} 
                    className="h-2 bg-blue-400/30" 
                  />
                  <p className="text-xs text-blue-100 mt-2">
                    {nextRewardAt > 0 ? `${nextRewardAt.toLocaleString()} to next reward` : '🎉 Max level reached!'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Weekly Points Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-emerald-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Weekly Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                                     <div className="text-3xl font-bold mb-2">{safeWeeklyPoints.toLocaleString()}</div>
                  <div className="flex items-center gap-2 text-emerald-100">
                    <div className="w-2 h-2 bg-emerald-200 rounded-full animate-pulse"></div>
                    <span className="text-xs">This week's progress</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Current Rank Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-amber-100 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Current Rank
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold mb-2">
                    #{(dashboardData.leaderboard || []).find(entry => entry.user_id === user?.id)?.rank || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-amber-100">
                    <div className="w-2 h-2 bg-amber-200 rounded-full"></div>
                    <span className="text-xs">Leaderboard position</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* PineCoins Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.2, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-violet-100 flex items-center gap-2">
                    <span className="text-lg">₽</span>
                    PineCoins
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                                     <div className="text-3xl font-bold mb-2">₽{Number(safeTotalCoins).toFixed(2)}</div>
                  <div className="flex items-center gap-2 text-violet-100">
                    <div className="w-2 h-2 bg-violet-200 rounded-full animate-pulse"></div>
                    <span className="text-xs">Available balance</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

            {/* Big Spin Wheel Button */}
            <div className="text-center mb-8">
              <Button
                onClick={() => setShowSpinWheel(true)}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xl px-8 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                disabled={!dashboardData.userStats || (dashboardData.userStats.spins_remaining || 0) <= 0}
              >
                <Target className="w-8 h-8 mr-3" />
                🎯 DAILY SPIN WHEEL 🎯
                <Target className="w-8 h-8 ml-3" />
              </Button>
              <p className="text-slate-600 mt-2">
                {dashboardData?.userStats?.spins_remaining || 0} spins remaining today
              </p>
            </div>

          {/* Enhanced Main Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid lg:grid-cols-3 gap-6 mb-8"
          >
            {/* Spinning Wheel Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -translate-y-16 translate-x-16"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800 text-lg">Quick Spin</CardTitle>
                      <CardDescription className="text-slate-600">
                        Spin for instant rewards!
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🎯</div>
                    <p className="text-sm text-slate-600 mb-2">
                      {dashboardData?.userStats?.spins_remaining || 0} spins remaining
                    </p>
                    {dashboardData?.userStats?.current_streak >= 3 && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-medium px-3 py-1">
                        🔥 {safeCurrentStreak} Day Streak!
                      </Badge>
                    )}
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    onClick={handleWheelSpin}
                    disabled={spinning || !dashboardData.userStats || (dashboardData.userStats.spins_remaining || 0) <= 0}
                  >
                    {spinning ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Spinning...
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5 mr-2" />
                        Quick Spin
                      </>
                    )}
                  </Button>
                  <div className="text-xs text-slate-600 text-center bg-white/50 rounded-lg p-3 border border-emerald-200/50">
                    <div className="font-medium mb-1">🎁 Win 20-150 points + PineCoins!</div>
                    <div className="text-slate-500">Daily bonus available</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Daily Login Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -translate-y-16 translate-x-16"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-slate-800 text-lg">Daily Login</CardTitle>
                        <CardDescription className="text-slate-600">
                          Claim your daily rewards
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshDailyRewardStatus}
                      className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🌅</div>
                    <p className="text-sm text-slate-600 mb-2">
                      {safeCurrentStreak} day streak
                    </p>
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium px-3 py-1">
                      +{20 + Math.min(safeCurrentStreak * 5, 50)} points today
                    </Badge>
                  </div>
                  
                  {/* Daily Reward Message */}
                  {dailyRewardMessage && (
                    <div className={`p-3 rounded-xl text-center text-sm font-medium ${
                      dailyRewardMessage.includes('🎉') 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {dailyRewardMessage}
                    </div>
                  )}
                  
                  <Button 
                    className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all duration-200 ${
                      dailyRewardClaimed 
                        ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                        : claimingDailyReward
                        ? 'bg-blue-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-xl transform hover:scale-105'
                    }`}
                    onClick={handleDailyReward}
                    disabled={dailyRewardClaimed || claimingDailyReward}
                  >
                    {claimingDailyReward ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5 mr-2" />
                        {dailyRewardClaimed ? 'Already Claimed Today' : 'Claim Daily Reward'}
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-slate-600 text-center bg-white/50 rounded-lg p-3 border border-blue-200/50">
                    <div className="font-medium mb-1">
                      {dailyRewardClaimed ? '✅ Claimed today!' : '⏰ Come back tomorrow!'}
                    </div>
                    <div className="text-slate-500">
                      {dailyRewardClaimed ? 'Great job maintaining your streak!' : 'Streak bonus increases daily'}
                    </div>
                    {dailyRewardClaimed && (
                      <div className="mt-2 text-xs text-slate-400">
                        Next reward available in {Math.ceil((24 - new Date().getHours()) * 60 - new Date().getMinutes())} minutes
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress & Goals Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/30 rounded-full -translate-y-16 translate-x-16"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800 text-lg">Progress & Goals</CardTitle>
                      <CardDescription className="text-slate-600">
                        Track your achievements
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  {/* Level Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">Current Level</span>
                      <span className="text-sm font-bold text-indigo-600">Level {Math.floor((safeTotalPoints || 0) / 100)}</span>
                    </div>
                    <Progress 
                      value={((safeTotalPoints || 0) % 100)} 
                      className="h-2 bg-indigo-200" 
                    />
                    <p className="text-xs text-slate-500">
                      {100 - ((safeTotalPoints || 0) % 100)} points to next level
                    </p>
                  </div>

                  {/* Weekly Goal */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">Weekly Goal</span>
                      <span className="text-sm font-bold text-purple-600">{safeWeeklyPoints}/500 pts</span>
                    </div>
                    <Progress 
                      value={(safeWeeklyPoints || 0) / 5} 
                      className="h-2 bg-purple-200" 
                    />
                    <p className="text-xs text-slate-500">
                      {500 - (safeWeeklyPoints || 0)} points remaining this week
                    </p>
                  </div>

                  {/* Streak Info */}
                  <div className="bg-white/60 rounded-lg p-3 border border-indigo-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🔥</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{safeCurrentStreak} Day Streak</p>
                          <p className="text-xs text-slate-600">Keep it going!</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">+{Math.min(safeCurrentStreak * 5, 50)}</p>
                        <p className="text-xs text-slate-500">bonus points</p>
                      </div>
                    </div>
                  </div>

                  {/* Next Milestone */}
                  <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-3 border border-indigo-200/50">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-800 mb-1">Next Milestone</p>
                      <p className="text-xs text-slate-600">
                        {nextRewardAt > 0 
                          ? `${nextRewardAt.toLocaleString()} points to unlock special rewards!`
                          : '🎉 Max level reached!'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Enhanced Leaderboard and Activities */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Enhanced Leaderboard */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -translate-y-16 translate-x-16"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800 text-lg">Weekly Leaderboard</CardTitle>
                      <CardDescription className="text-slate-600">
                        Top performers this week
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3">
                    {(dashboardData.leaderboard || []).slice(0, 5).map((player, index) => (
                      <motion.div 
                        key={player.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-200 border border-amber-200/50 hover:border-amber-300/50 hover:scale-105"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">
                            {index === 0 ? "🏆" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}️⃣`}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800">{player.name}</p>
                            <p className="text-sm text-slate-500">#{player.rank || index + 1}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800 text-lg">{(player.total_points || 0).toLocaleString()}</p>
                          <p className="text-sm text-slate-500">+{(player.weekly_points || 0)} this week</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Button 
                      variant="outline" 
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 hover:scale-105 transition-all duration-200"
                      onClick={() => router.push('/dashboard/leaderboard')}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      View Full Leaderboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Recent Activities */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -translate-y-16 translate-x-16"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800 text-lg">Recent Activities</CardTitle>
                      <CardDescription className="text-slate-600">
                        Your latest point earnings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3">
                    {(dashboardData.recentActivities || []).length > 0 ? (
                      (dashboardData.recentActivities || []).map((activity, index) => (
                        <motion.div 
                          key={activity.id} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-200 border border-emerald-200/50 hover:border-emerald-300/50 hover:scale-105"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">{activity.description || activity.activity_type}</p>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(activity.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium px-3 py-1">
                            +{(activity.points || 10)} points
                          </Badge>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3">📊</div>
                        <p className="text-slate-500 font-medium">No activities yet</p>
                        <p className="text-slate-400 text-sm">Start earning points to see your history</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 text-center">
                    <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 hover:scale-105 transition-all duration-200">
                      <TrendingUp className="w-4 w-4 mr-2" />
                      View All Activities
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Enhanced Bottom CTA and Additional Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 space-y-6"
          >
            {/* Achievements Section */}
            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/30 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="pt-6 relative z-10">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Your Achievements</h3>
                  <p className="text-slate-600">Track your progress and unlock rewards</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/60 rounded-lg p-4 text-center border border-yellow-200/50">
                    <div className="text-2xl mb-2">🔥</div>
                    <p className="font-semibold text-slate-800">{safeCurrentStreak} Day Streak</p>
                    <p className="text-sm text-slate-600">Keep it going!</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4 text-center border border-yellow-200/50">
                    <div className="text-2xl mb-2">⭐</div>
                    <p className="font-semibold text-slate-800">{Math.floor((safeTotalPoints || 0) / 100)} Level</p>
                    <p className="text-sm text-slate-600">Every 100 points</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4 text-center border border-yellow-200/50">
                    <div className="text-2xl mb-2">🎯</div>
                    <p className="font-semibold text-slate-800">{safeSpinsRemaining} Spins</p>
                    <p className="text-sm text-slate-600">Available today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main CTA */}
            <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="pt-6 relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold text-slate-800 mb-4">Ready to Win Big? 🚀</h3>
                  <p className="text-slate-600 text-lg mb-6">
                    Join prize pools, compete in challenges, and turn your points into real rewards!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                      <Gift className="w-5 h-5 mr-2" />
                      Join Prize Pool
                    </Button>
                    <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 hover:scale-105 transition-all duration-200 py-3 px-6 rounded-xl">
                      <Target className="w-5 h-5 mr-2" />
                      View Challenges
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Footer */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white/60 rounded-lg p-4 text-center border border-slate-200/50">
                                 <div className="text-2xl font-bold text-slate-800">{safeTotalPoints.toLocaleString()}</div>
                <p className="text-sm text-slate-600">Total Points</p>
              </div>
                              <div className="bg-white/60 rounded-lg p-4 text-center border border-slate-200/50">
                 <div className="text-2xl font-bold text-slate-800">₽{Number(safeTotalCoins).toFixed(2)}</div>
                  <p className="text-sm text-slate-600">PineCoins</p>
                </div>
                <div className="bg-white/60 rounded-lg p-4 text-center border border-slate-200/50">
                 <div className="text-2xl font-bold text-slate-800">{safeCurrentStreak}</div>
                  <p className="text-sm text-slate-600">Day Streak</p>
                </div>
                <div className="bg-white/60 rounded-lg p-4 text-center border border-slate-200/50">
                 <div className="text-2xl font-bold text-slate-800">#{(dashboardData.leaderboard || []).find(entry => entry.user_id === user?.id)?.rank || 'N/A'}</div>
                  <p className="text-sm text-slate-600">Current Rank</p>
                </div>
            </div>
          </motion.div>
      </div>
    </div>

      {/* Clean & Professional Spinning Wheel */}
      {showSpinWheel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Daily Spin Wheel</h2>
              <p className="text-slate-600">Spin to win points and rewards</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Clean Spinning Wheel */}
              <div className="flex justify-center">
                <div className="relative w-72 h-72">
                  {/* Wheel Background */}
                  <div className="w-full h-full rounded-full bg-slate-100 border-4 border-slate-200 shadow-lg">
                    {/* Wheel Segments - Simple & Clean */}
                    <div 
                      className="relative w-full h-full"
                      style={{
                        transform: `rotate(${wheelRotation}deg)`,
                        transition: spinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
                      }}
                    >
                      {/* 6 equal segments */}
                      {[0, 60, 120, 180, 240, 300].map((rotation, index) => {
                        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-orange-500', 'bg-violet-500', 'bg-rose-500'];
                        const points = [10, 25, 50, 100, 200, 500];
                        const icons = ['🎯', '💎', '🍀', '⭐', '👑', '🚀'];
                        
                        return (
                          <div
                            key={index}
                            className={`absolute w-1/2 h-1/2 origin-bottom-left ${colors[index]} rounded-tr-full`}
                            style={{
                              transform: `rotate(${rotation}deg)`,
                              left: '50%',
                              top: '0%',
                            }}
                          >
                            {/* Segment Content */}
                            <div 
                              className="absolute text-white font-bold text-center"
                              style={{
                                transform: `rotate(30deg) translateY(-20px)`,
                                left: '20px',
                                top: '20px',
                              }}
                            >
                              <div className="text-2xl mb-1">{icons[index]}</div>
                              <div className="text-sm">{points[index]}</div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Center Circle */}
                      <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-300 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-lg">
                        <span className="text-slate-700 font-bold text-sm">SPIN</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pointer */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500"></div>
                  </div>
                </div>
              </div>

              {/* Controls & Info */}
              <div className="space-y-4">
                {/* Spin Button */}
                <Button
                  onClick={handleWheelSpin}
                  disabled={spinning || !dashboardData.userStats || (dashboardData.userStats.spins_remaining || 0) <= 0}
                  className={`w-full py-4 text-lg font-semibold rounded-xl ${
                    spinning || !dashboardData.userStats || (dashboardData.userStats.spins_remaining || 0) <= 0
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {spinning ? 'Spinning...' : 'Spin the Wheel'}
                </Button>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-slate-600 text-sm">Spins Left</p>
                    <p className="text-2xl font-bold text-slate-800">{dashboardData?.userStats?.spins_remaining || 0}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-slate-600 text-sm">Daily Streak</p>
                    <p className="text-2xl font-bold text-slate-800">{dashboardData?.userStats?.current_streak || 0}</p>
                  </div>
                </div>

                {/* Prizes */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 mb-3">Prizes</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">🎯</span>
                      <span className="text-slate-700">10 pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600">💎</span>
                      <span className="text-slate-700">25 pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600">🍀</span>
                      <span className="text-slate-700">50 pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">⭐</span>
                      <span className="text-slate-700">100 pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-violet-600">👑</span>
                      <span className="text-slate-700">200 pts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-600">🚀</span>
                      <span className="text-slate-700">500 pts</span>
                    </div>
                  </div>
                </div>

                {/* Result */}
                {spinResult && (
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎉</div>
                      <h3 className="font-bold text-emerald-800 mb-1">Congratulations!</h3>
                      <p className="text-emerald-700">You won {spinResult.points} points!</p>
                    </div>
                  </div>
                )}

                {/* Close */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSpinWheel(false);
                    setSpinResult(null);
                    setWheelRotation(0);
                  }}
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
