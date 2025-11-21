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
import config from "@/lib/config";
import { OnboardingTour } from "@/components/dashboard/onboarding-tour";

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
  const [nextReset, setNextReset] = useState<{
    nextReset: string;
    currentPeriod: number;
    nextPeriod: number;
    hoursUntilReset: number;
  } | null>(null);
  const [buyingSpin, setBuyingSpin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      // Only run on client side - moved inside the async function
      if (typeof window === 'undefined') {
        return;
      }
      
      console.log("Dashboard: Checking authentication...");
      
      // Check authentication status with retry logic
      const checkAuth = async (retryCount = 0) => {
        try {
          console.log("Dashboard: Authentication check (attempt", retryCount + 1, ")");
          
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
          
          console.log("Dashboard: Auth status - token:", token ? '✓' : '✗', "user:", user ? '✓' : '✗');
          
          // Check if we have both token and user
          if (!token || !user) {
            console.log("Dashboard: Missing auth data");
            
            // If this is the first attempt, wait a bit and retry
            if (retryCount === 0) {
              console.log("Dashboard: Retrying after 200ms...");
              await new Promise(resolve => setTimeout(resolve, 200));
              return checkAuth(1);
            }
            
            console.log("Dashboard: Redirecting to sign-in");
            router.push("/sign-in");
            return;
          }

          console.log("Dashboard: ✓ User authenticated:", user.email);
          setUser(user);
          
          // IMMEDIATELY start fetching dashboard data (most critical)
          const dashboardPromise = fetchDashboardData(user.id);
          
          // Run non-critical API calls in parallel WITHOUT blocking
          Promise.all([
            // Backend health check (non-blocking)
            checkBackendConnection().catch(err => 
              console.warn('Backend connection check failed:', err)
            ),
            
            // Fetch reset time (non-blocking)
            fetch(`${config.API_BASE}/api/spin-reset/next-reset`, {
              headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
              }
            })
            .then(response => response.ok ? response.json() : Promise.reject(response.status))
            .then(data => setNextReset(data.data))
            .catch(error => console.warn('Reset time fetch failed:', error))
          ]).catch(err => console.warn('Non-critical API calls failed:', err));
          
          // Wait only for critical dashboard data
          await dashboardPromise;
        } catch (error) {
          console.error('Dashboard: Authentication failed:', error);
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
      console.log('✅ Backend connected:', healthCheck);
    } catch (error) {
      console.error('⚠️ Backend connection failed:', error);
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
      console.log('📊 Loading dashboard data...');
      const startTime = performance.now();
      setLoading(true);
      setError(null);

      // Fetch all data in parallel using Promise.allSettled to handle individual failures gracefully
      const results = await Promise.allSettled([
        dashboardService.getUserStats(userId).catch(err => {
          console.error('❌ User stats failed:', err);
          return { success: false, error: err.message };
        }),
        dashboardService.getUserActivities(userId, 5).catch(err => {
          console.error('❌ Activities failed:', err);
          return { success: false, error: err.message };
        }),
        dashboardService.getLeaderboard(10).catch(err => {
          console.error('❌ Leaderboard failed:', err);
          return { success: false, error: err.message };
        }),
        dashboardService.getAvailableTasks().catch(err => {
          console.error('❌ Tasks failed:', err);
          return { success: false, error: err.message };
        }),
        dashboardService.getUserTaskHistory(userId).catch(err => {
          console.error('❌ Task history failed:', err);
          return { success: false, error: err.message };
        })
      ]);

      const loadTime = (performance.now() - startTime).toFixed(0);
      console.log(`✅ Dashboard data loaded in ${loadTime}ms`);

      // Process results - handle both fulfilled and rejected promises
      const statsResult = results[0].status === 'fulfilled' 
        ? results[0].value 
        : { success: false as const, error: results[0].reason?.message || 'Unknown error' };
      
      const activitiesResult = results[1].status === 'fulfilled' 
        ? results[1].value 
        : { success: false as const, error: results[1].reason?.message || 'Unknown error' };
      
      const leaderboardResult = results[2].status === 'fulfilled' 
        ? results[2].value 
        : { success: false as const, error: results[2].reason?.message || 'Unknown error' };
      
      const tasksResult = results[3].status === 'fulfilled' 
        ? results[3].value 
        : { success: false as const, error: results[3].reason?.message || 'Unknown error' };
      
      const historyResult = results[4].status === 'fulfilled' 
        ? results[4].value 
        : { success: false as const, error: results[4].reason?.message || 'Unknown error' };

      // Process user stats
      if (statsResult.success && 'data' in statsResult && statsResult.data?.users && statsResult.data.users.length > 0) {
        const userStats = statsResult.data.users[0];
        setDashboardData(prev => ({ ...prev, userStats }));
        
        // Check if daily reward was already claimed today
        if (userStats.last_daily_claim_date) {
          const lastClaimDate = new Date(userStats.last_daily_claim_date);
          const today = new Date();
          const isSameDay = lastClaimDate.toDateString() === today.toDateString();
          setDailyRewardClaimed(isSameDay);
        } else {
          setDailyRewardClaimed(false);
        }
      } else if ('error' in statsResult && statsResult.error) {
        console.error('User stats error:', statsResult.error);
        // Only set error if this is critical (user stats is required)
        if (!dashboardData.userStats) {
          setError(`Failed to load user stats: ${statsResult.error}`);
        }
      }

      // Process activities
      if (activitiesResult.success && 'data' in activitiesResult && activitiesResult.data) {
        setDashboardData(prev => ({ ...prev, recentActivities: activitiesResult.data.activities || [] }));
      }

      // Process leaderboard
      if (leaderboardResult.success && 'data' in leaderboardResult && leaderboardResult.data) {
        const leaderboard = leaderboardResult.data.users || [];
        const rankedLeaderboard = leaderboard.map((entry: any, index: number) => ({
          ...entry,
          rank: index + 1
        }));
        setDashboardData(prev => ({ ...prev, leaderboard: rankedLeaderboard }));
      }

      // Process tasks
      if (tasksResult.success && 'data' in tasksResult && tasksResult.data) {
        setDashboardData(prev => ({ ...prev, availableTasks: tasksResult.data.tasks || [] }));
      }

      // Process task history
      if (historyResult.success && 'data' in historyResult && historyResult.data) {
        setDashboardData(prev => ({ ...prev, userTaskHistory: historyResult.data.tasks || [] }));
      }

      // Log dashboard view activity (async, don't block)
      dashboardService.logActivity('dashboard_view', 'Viewed dashboard overview')
        .catch(error => console.error('Failed to log dashboard view activity:', error));

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to fetch dashboard data';
      
      // Check for network errors
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError(errorMessage);
      }
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
      
      // Update user stats on backend - this will handle the daily reset logic
      // Conversion rate: 1000 points = 1 PineCoin
      const coins = Math.round(selectedReward.points * 0.001 * 100) / 100;
      console.log('🎡 Spinning wheel:', { points: selectedReward.points, coins });
      
      const updateResponse = await dashboardService.updateUserStatsAfterSpin(selectedReward.points, coins);
      
      if (updateResponse.success) {
        console.log('✅ Spin successful');
        const now = new Date().toISOString();
        
        // IMMEDIATELY update all UI state - no reload needed!
        setDashboardData(prev => {
          const newUserStats = prev.userStats ? {
            ...prev.userStats,
            total_points: prev.userStats.total_points + selectedReward.points,
            weekly_points: (prev.userStats.weekly_points || 0) + selectedReward.points,
            spins_remaining: updateResponse.data?.spins_remaining || (prev.userStats.spins_remaining || 0) - 1,
            total_coins: prev.userStats.total_coins + coins
          } : null;
          
          // Add new spin activity to activities list
          const newActivity = {
            id: Date.now(),
            user_id: user?.id || 0,
            activity_type: 'spin_wheel',
            description: `Spin Wheel - Won ${selectedReward.points} points`,
            points: selectedReward.points,
            created_at: now,
            metadata: { reward: selectedReward.points, coins }
          };
          
          const updatedActivities = [newActivity, ...prev.recentActivities].slice(0, 5);
          
          // Update leaderboard if user is in it
          const updatedLeaderboard = prev.leaderboard.map(player => {
            if (player.user_id === user?.id) {
              return {
                ...player,
                total_points: player.total_points + selectedReward.points,
                weekly_points: (player.weekly_points || 0) + selectedReward.points
              };
            }
            return player;
          });
          
          return {
            ...prev,
            userStats: newUserStats,
            recentActivities: updatedActivities,
            leaderboard: updatedLeaderboard
          };
        });

        // Show result
        setSpinResult({
          points: selectedReward.points,
          message: `🎉 Congratulations! You won ${selectedReward.points} points and ${coins.toFixed(1)} PineCoins!`
        });
        
        console.log('✅ All UI updated - no reload needed!');
      } else {
        // Handle error from backend (e.g., no spins remaining in current period)
        console.error('❌ Spin failed:', updateResponse.error);
        setSpinResult({
          points: 0,
          message: updateResponse.error || 'Failed to update stats. Please try again.'
        });
      }

    } catch (error) {
      console.error('Error spinning wheel:', error);
      setSpinResult({
        points: 0,
        message: 'Failed to spin wheel. Please try again.'
      });
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
      
      console.log('🎁 Claiming daily reward:', {
        baseReward,
        currentStreak,
        streakBonus,
        totalReward,
        coins
      });
      
      // Update user stats on backend
      const response = await dashboardService.updateUserStatsAfterDailyReward(totalReward, coins);
      
      if (response.success) {
        console.log('✅ Daily reward claimed successfully');
        
        // IMMEDIATELY update all relevant state - no page reload needed!
        const now = new Date().toISOString();
        
        // 1. Update user stats with new values
        setDashboardData(prev => {
          const newUserStats = prev.userStats ? {
            ...prev.userStats,
            total_points: prev.userStats.total_points + totalReward,
            weekly_points: (prev.userStats.weekly_points || 0) + totalReward,
            current_streak: currentStreak + 1,
            total_coins: prev.userStats.total_coins + coins,
            last_daily_claim_date: now
          } : null;
          
          // 2. Add new activity to the top of activities list
          const newActivity = {
            id: Date.now(), // Temporary ID
            user_id: user?.id || 0,
            activity_type: 'daily_reward',
            description: `Daily Login Reward (${currentStreak + 1} day streak)`,
            points: totalReward,
            created_at: now,
            metadata: { streak: currentStreak + 1, coins }
          };
          
          const updatedActivities = [newActivity, ...prev.recentActivities].slice(0, 5);
          
          // 3. Update leaderboard position (if user is in top 10)
          const updatedLeaderboard = prev.leaderboard.map(player => {
            if (player.user_id === user?.id) {
              return {
                ...player,
                total_points: player.total_points + totalReward,
                weekly_points: (player.weekly_points || 0) + totalReward
              };
            }
            return player;
          });
          
          return {
            ...prev,
            userStats: newUserStats,
            recentActivities: updatedActivities,
            leaderboard: updatedLeaderboard
          };
        });

        // 4. Update claimed status
        setDailyRewardClaimed(true);
        
        // 5. Show success message
        setDailyRewardMessage(`🎉 Daily reward claimed! +${totalReward} points (${streakBonus} streak bonus) +${coins} PineCoins`);
        
        console.log('✅ All UI updated - no reload needed!');
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setDailyRewardMessage(null);
        }, 5000);
      } else {
        console.error('❌ Daily reward claim failed:', response.error);
        setDailyRewardMessage(response.error || 'Failed to claim daily reward. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error claiming daily reward:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 overflow-x-hidden">
        <div className="p-6 w-full">
          <div className="max-w-7xl mx-auto w-full">
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

  if (!dashboardData.userStats && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Failed to Load Dashboard</CardTitle>
            <CardDescription>
              {error || 'Unable to load user statistics. Please try refreshing the page.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => {
                if (user?.id) {
                  fetchDashboardData(user.id);
                } else {
                  window.location.reload();
                }
              }}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/sign-in')}
              className="w-full"
            >
              Sign In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add safe access helper
  const safeUserStats = dashboardData.userStats;
  const safeTotalPoints = safeUserStats?.total_points || 0;
  const safeTotalCoins = safeUserStats?.total_coins || 0;
  const safeCurrentStreak = safeUserStats?.current_streak || 0;
  const safeWeeklyPoints = safeUserStats?.weekly_points || 0;
  const safeSpinsRemaining = safeUserStats?.spins_remaining || 0;
  const safeLastLoginDate = safeUserStats?.last_login_date;

  // Calculate next reward
  const nextRewardAt = Math.max(0, 2500 - safeTotalPoints);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 overflow-x-hidden safe-top safe-bottom">
      {/* Main Content */}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6 w-full">
        <div className="max-w-7xl mx-auto w-full">
          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">⚠️</span>
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setError(null);
                        if (user?.id) {
                          fetchDashboardData(user.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-100 transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Welcome Header with Live Stats */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-4 sm:mb-5 md:mb-7"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-1.5 sm:mb-2 px-2 hover:text-slate-900 transition-colors duration-200 leading-tight">
              Welcome Back, {user?.name || 'Player'}! 👋
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base px-2 hover:text-slate-700 transition-colors duration-200">Ready to climb the leaderboard and earn PineCoins?</p>
            
            {/* Live Stats Display in Welcome Header */}
            

            <div className="mt-2 sm:mt-3 flex items-center justify-center gap-1.5 sm:gap-2 text-xs text-slate-500 px-2 hover:text-slate-600 transition-colors duration-200">
              <Calendar className="w-3 h-3 hover:text-slate-600 transition-colors duration-200" />
              <span>Last login: {safeLastLoginDate ? new Date(safeLastLoginDate).toLocaleDateString() : 'Today'}</span>
            </div>
          </motion.div>

          {/* Enhanced Stats Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8"
            data-tour="stats-cards"
          >
            {/* Total Points Card */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-shadow duration-150 overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 opacity-0 hover:opacity-100 transition-opacity duration-150"></div>
                <CardHeader className="pb-2 relative z-10 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-blue-100 flex items-center gap-2 hover:text-white transition-colors duration-200">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 hover:scale-110 transition-transform duration-200" />
                    Total Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-2xl sm:text-3xl font-bold mb-2 hover:scale-105 transition-transform duration-200">{safeTotalPoints.toLocaleString()}</div>
                  <Progress 
                                         value={Math.min(100, (safeTotalPoints / 2500) * 100)} 
                    className="h-2 bg-blue-400/30 hover:bg-blue-400/40 transition-colors duration-200" 
                  />
                  <p className="text-xs text-blue-100 mt-2 hover:text-white transition-colors duration-200">
                    {nextRewardAt > 0 ? `${nextRewardAt.toLocaleString()} to next reward` : '🎉 Max level reached!'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Weekly Points Card */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-emerald-500/50 transition-shadow duration-150 overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 opacity-0 hover:opacity-100 transition-opacity duration-150"></div>
                <CardHeader className="pb-2 relative z-10 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-emerald-100 flex items-center gap-2 hover:text-white transition-colors duration-200">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 hover:scale-110 transition-transform duration-200" />
                    Weekly Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-2xl sm:text-3xl font-bold mb-2 hover:scale-105 transition-transform duration-200">{safeWeeklyPoints.toLocaleString()}</div>
                  <div className="flex items-center gap-2 text-emerald-100 hover:text-white transition-colors duration-200">
                    <div className="w-2 h-2 bg-emerald-200 rounded-full animate-pulse hover:bg-emerald-100 transition-colors duration-200"></div>
                    <span className="text-xs">This week's progress</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Current Rank Card */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-amber-500/50 transition-shadow duration-150 overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 opacity-0 hover:opacity-100 transition-opacity duration-150"></div>
                <CardHeader className="pb-2 relative z-10 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-amber-100 flex items-center gap-2 hover:text-white transition-colors duration-200">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 hover:scale-110 transition-transform duration-200" />
                    Current Rank
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-2xl sm:text-3xl font-bold mb-2 hover:scale-105 transition-transform duration-200">
                    #{(dashboardData.leaderboard || []).find(entry => entry.user_id === user?.id)?.rank || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-amber-100 hover:text-white transition-colors duration-200">
                    <div className="w-2 h-2 bg-amber-200 rounded-full hover:bg-amber-100 transition-colors duration-200"></div>
                    <span className="text-xs">Leaderboard position</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* PineCoins Card */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-violet-500/50 transition-shadow duration-150 overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 opacity-0 hover:opacity-100 transition-opacity duration-150"></div>
                <CardHeader className="pb-2 relative z-10 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-violet-100 flex items-center gap-2 hover:text-white transition-colors duration-200">
                    <span className="text-base sm:text-lg hover:scale-110 transition-transform duration-200">₽</span>
                    PineCoins
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-2xl sm:text-3xl font-bold mb-2 hover:scale-105 transition-transform duration-200">₽{Number(safeTotalCoins).toFixed(2)}</div>
                  <div className="flex items-center gap-2 text-violet-100 hover:text-white transition-colors duration-200">
                    <div className="w-2 h-2 bg-violet-200 rounded-full animate-pulse hover:bg-violet-100 transition-colors duration-200"></div>
                    <span className="text-xs">Available balance</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

            {/* Spin Wheel Feature Card */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-6 sm:mb-7 md:mb-8"
            >
              <Card className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 border-0 shadow-xl overflow-hidden" data-tour="spin-wheel-card">
                <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-24 sm:-translate-y-32 translate-x-24 sm:translate-x-32 opacity-0 hover:opacity-100 transition-opacity duration-150"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full translate-y-16 sm:translate-y-24 -translate-x-16 sm:-translate-x-24 opacity-0 hover:opacity-100 transition-opacity duration-150"></div>
                <CardContent className="pt-6 sm:pt-7 pb-6 sm:pb-7 px-4 sm:px-5 md:px-6 relative z-10">
                  <div className="text-center">
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-3 sm:border-4 border-white/30">
                        <Target className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1.5 sm:mb-2">Daily Spin Wheel</h3>
                    <p className="text-white/90 text-sm sm:text-base md:text-lg mb-4 sm:mb-5 md:mb-6 leading-relaxed">Spin to win amazing rewards and PineCoins!</p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-5 md:mb-6">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 border border-white/30 flex-1 sm:flex-none">
                        <p className="text-white/80 text-xs sm:text-sm mb-0.5 sm:mb-1">Spins Remaining</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{dashboardData?.userStats?.spins_remaining || 0}</p>
                      </div>
                      {nextReset && (
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 border border-white/30 flex-1 sm:flex-none">
                          <p className="text-white/80 text-xs sm:text-sm mb-0.5 sm:mb-1">Next Reset</p>
                          <p className="text-lg sm:text-xl font-bold text-white flex items-center justify-center gap-1.5 sm:gap-2">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                            {nextReset.hoursUntilReset}h
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => setShowSpinWheel(true)}
                      className="bg-white text-emerald-600 hover:bg-white/90 active:bg-white/80 text-base sm:text-lg md:text-xl px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl shadow-lg transform hover:scale-105 active:scale-100 transition-all duration-150 font-bold w-full sm:w-auto touch-target no-select"
                      disabled={!dashboardData.userStats || (dashboardData.userStats.spins_remaining || 0) <= 0}
                    >
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      SPIN NOW
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3" />
                    </Button>
                    <p className="text-white/70 text-xs sm:text-sm mt-3 sm:mt-4">
                      Win 10-500 points + bonus PineCoins every spin!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          {/* Enhanced Main Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-4 sm:mb-6 md:mb-8"
          >

            {/* Daily Login Card */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-150 overflow-hidden" data-tour="daily-reward-card">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -translate-y-16 translate-x-16 opacity-0 hover:opacity-100 transition-opacity duration-150"></div>
                <CardHeader className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-slate-800 text-base sm:text-lg">Daily Login</CardTitle>
                        <CardDescription className="text-slate-600 text-xs sm:text-sm">
                          Claim your daily rewards
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshDailyRewardStatus}
                      className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-110 hover:rotate-180 active:scale-95 flex-shrink-0"
                    >
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🌅</div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-2">
                      {safeCurrentStreak} day streak
                    </p>
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm">
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
                    className={`w-full font-bold py-2.5 sm:py-3 text-sm sm:text-base rounded-xl shadow-lg transition-all duration-300 relative overflow-hidden group ${
                      dailyRewardClaimed 
                        ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                        : claimingDailyReward
                        ? 'bg-blue-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-xl transform hover:scale-105 active:scale-95'
                    }`}
                    onClick={handleDailyReward}
                    disabled={dailyRewardClaimed || claimingDailyReward}
                  >
                    {claimingDailyReward ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Claiming...</span>
                        <span className="sm:hidden">Claim...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="hidden sm:inline">{dailyRewardClaimed ? 'Already Claimed Today' : 'Claim Daily Reward'}</span>
                        <span className="sm:hidden">{dailyRewardClaimed ? 'Claimed' : 'Claim'}</span>
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-slate-600 text-center bg-white/50 rounded-lg p-2 sm:p-3 border border-blue-200/50 hover:bg-white/70 hover:border-blue-300/70 hover:text-slate-700 transition-all duration-200">
                    <div className="font-medium mb-1 hover:text-slate-800 transition-colors duration-200">
                      {dailyRewardClaimed ? '✅ Claimed today!' : '⏰ Come back tomorrow!'}
                    </div>
                    <div className="text-slate-500 text-xs hover:text-slate-600 transition-colors duration-200">
                      {dailyRewardClaimed ? 'Great job maintaining your streak!' : 'Streak bonus increases daily'}
                    </div>
                    {dailyRewardClaimed && (
                      <div className="mt-2 text-xs text-slate-400 hover:text-slate-500 transition-colors duration-200">
                        Next reward available in {Math.ceil((24 - new Date().getHours()) * 60 - new Date().getMinutes())} minutes
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress & Goals Card */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200 shadow-lg hover:shadow-xl transition-shadow duration-150 overflow-hidden" data-tour="progress-card">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/30 rounded-full -translate-y-16 translate-x-16 opacity-0 hover:opacity-100 transition-opacity duration-150"></div>
                <CardHeader className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-slate-800 text-base sm:text-lg">Progress & Goals</CardTitle>
                      <CardDescription className="text-slate-600 text-xs sm:text-sm">
                        Track your achievements
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
                  {/* Level Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-slate-700">Current Level</span>
                      <span className="text-xs sm:text-sm font-bold text-indigo-600 whitespace-nowrap">Level {Math.floor((safeTotalPoints || 0) / 100)}</span>
                    </div>
                    <Progress 
                      value={((safeTotalPoints || 0) % 100)} 
                      className="h-1.5 sm:h-2 bg-indigo-200" 
                    />
                    <p className="text-xs text-slate-500">
                      {100 - ((safeTotalPoints || 0) % 100)} points to next level
                    </p>
                  </div>

                  {/* Weekly Goal */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs sm:text-sm font-medium text-slate-700">Weekly Goal</span>
                      <span className="text-xs sm:text-sm font-bold text-purple-600 whitespace-nowrap">{safeWeeklyPoints}/500 pts</span>
                    </div>
                    <Progress 
                      value={(safeWeeklyPoints || 0) / 5} 
                      className="h-1.5 sm:h-2 bg-purple-200" 
                    />
                    <p className="text-xs text-slate-500">
                      {500 - (safeWeeklyPoints || 0)} points remaining this week
                    </p>
                  </div>

                  {/* Streak Info */}
                  <div className="bg-white/60 rounded-lg p-3 border border-indigo-200/50 hover:bg-white/80 hover:border-indigo-300/70 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl hover:scale-110 transition-transform duration-200">🔥</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 hover:text-slate-900 transition-colors duration-200">{safeCurrentStreak} Day Streak</p>
                          <p className="text-xs text-slate-600 hover:text-slate-700 transition-colors duration-200">Keep it going!</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600 hover:text-orange-700 transition-colors duration-200">+{Math.min(safeCurrentStreak * 5, 50)}</p>
                        <p className="text-xs text-slate-500 hover:text-slate-600 transition-colors duration-200">bonus points</p>
                      </div>
                    </div>
                  </div>

                  {/* Next Milestone */}
                  <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-3 border border-indigo-200/50 hover:from-indigo-200 hover:to-purple-200 hover:border-indigo-300/70 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-800 mb-1 hover:text-slate-900 transition-colors duration-200">Next Milestone</p>
                      <p className="text-xs text-slate-600 hover:text-slate-700 transition-colors duration-200">
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6"
          >
            {/* Enhanced Leaderboard */}
            <motion.div
              whileHover={{ scale: 1.005 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg hover:shadow-xl transition-shadow duration-150 overflow-hidden" data-tour="leaderboard-card">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -translate-y-16 translate-x-16 opacity-0 hover:opacity-100 transition-opacity duration-150"></div>
                <CardHeader className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-slate-800 text-base sm:text-lg">Weekly Leaderboard</CardTitle>
                      <CardDescription className="text-slate-600 text-xs sm:text-sm">
                        Top performers this week
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="space-y-2 sm:space-y-3">
                    {(dashboardData.leaderboard || []).slice(0, 5).map((player, index) => (
                      <motion.div 
                        key={player.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/60 hover:bg-white/90 transition-all duration-300 border border-amber-200/50 hover:border-amber-400/70 hover:scale-[1.02] hover:shadow-md hover:shadow-amber-200/50 cursor-pointer gap-2"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <span className="text-2xl sm:text-3xl flex-shrink-0">
                            {index === 0 ? "🏆" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}️⃣`}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm sm:text-base truncate hover:text-slate-900 transition-colors duration-200">{player.name}</p>
                            <p className="text-xs sm:text-sm text-slate-500 hover:text-slate-600 transition-colors duration-200">#{player.rank || index + 1}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-slate-800 text-base sm:text-lg hover:text-slate-900 transition-colors duration-200">{(player.total_points || 0).toLocaleString()}</p>
                          <p className="text-xs sm:text-sm text-slate-500 hover:text-slate-600 transition-colors duration-200">+{(player.weekly_points || 0)} this week</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 sm:mt-6 text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                      onClick={() => router.push('/dashboard/leaderboard')}
                    >
                      <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="hidden sm:inline">View Full Leaderboard</span>
                      <span className="sm:hidden">Leaderboard</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Recent Activities */}
            <motion.div
              whileHover={{ scale: 1.005 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg hover:shadow-xl transition-shadow duration-150 overflow-hidden" data-tour="activities-card">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -translate-y-16 translate-x-16 opacity-0 hover:opacity-100 transition-opacity duration-150"></div>
                <CardHeader className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-slate-800 text-base sm:text-lg">Recent Activities</CardTitle>
                      <CardDescription className="text-slate-600 text-xs sm:text-sm">
                        Your latest point earnings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="space-y-2 sm:space-y-3">
                    {(dashboardData.recentActivities || []).length > 0 ? (
                      (dashboardData.recentActivities || []).map((activity, index) => (
                        <motion.div 
                          key={activity.id} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/60 hover:bg-white/90 transition-all duration-300 border border-emerald-200/50 hover:border-emerald-400/70 hover:scale-[1.02] hover:shadow-md hover:shadow-emerald-200/50 cursor-pointer gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 text-sm sm:text-base truncate hover:text-slate-900 transition-colors duration-200">{activity.description || activity.activity_type}</p>
                            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1 hover:text-slate-600 transition-colors duration-200">
                              <Clock className="w-3 h-3 flex-shrink-0 hover:text-slate-600 transition-colors duration-200" />
                              <span className="truncate">{new Date(activity.created_at).toLocaleDateString()}</span>
                            </p>
                          </div>
                          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium px-2 sm:px-3 py-1 text-xs sm:text-sm flex-shrink-0 hover:from-emerald-600 hover:to-green-600 hover:scale-105 transition-all duration-200">
                            +{(activity.points || 10)} pts
                          </Badge>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📊</div>
                        <p className="text-slate-500 font-medium text-sm sm:text-base">No activities yet</p>
                        <p className="text-slate-400 text-xs sm:text-sm">Start earning points to see your history</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-6 text-center">
                    <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 hover:scale-105 transition-all duration-200 text-xs sm:text-sm">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="hidden sm:inline">View All Activities</span>
                      <span className="sm:hidden">Activities</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Enhanced Bottom CTA and Additional Features */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 sm:mt-8 space-y-4 sm:space-y-6"
          >
            {/* Achievements Section */}
            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow duration-150 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/30 rounded-full -translate-y-16 translate-x-16 opacity-0 hover:opacity-100 transition-opacity duration-150"></div>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6 relative z-10">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Your Achievements</h3>
                  <p className="text-slate-600 text-sm sm:text-base">Track your progress and unlock rewards</p>
                </div>
                
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white/60 rounded-lg p-3 sm:p-4 text-center border border-yellow-200/50 hover:bg-white/80 hover:border-yellow-300/70 hover:scale-105 hover:shadow-md hover:shadow-yellow-200/50 transition-all duration-300 cursor-pointer">
                    <div className="text-xl sm:text-2xl mb-2 hover:scale-110 transition-transform duration-300">🔥</div>
                    <p className="font-semibold text-slate-800 text-sm sm:text-base hover:text-slate-900 transition-colors duration-200">{safeCurrentStreak} Day Streak</p>
                    <p className="text-xs sm:text-sm text-slate-600 hover:text-slate-700 transition-colors duration-200">Keep it going!</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 sm:p-4 text-center border border-yellow-200/50 hover:bg-white/80 hover:border-yellow-300/70 hover:scale-105 hover:shadow-md hover:shadow-yellow-200/50 transition-all duration-300 cursor-pointer">
                    <div className="text-xl sm:text-2xl mb-2 hover:scale-110 transition-transform duration-300">⭐</div>
                    <p className="font-semibold text-slate-800 text-sm sm:text-base hover:text-slate-900 transition-colors duration-200">{Math.floor((safeTotalPoints || 0) / 100)} Level</p>
                    <p className="text-xs sm:text-sm text-slate-600 hover:text-slate-700 transition-colors duration-200">Every 100 points</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 sm:p-4 text-center border border-yellow-200/50 hover:bg-white/80 hover:border-yellow-300/70 hover:scale-105 hover:shadow-md hover:shadow-yellow-200/50 transition-all duration-300 cursor-pointer">
                    <div className="text-xl sm:text-2xl mb-2 hover:scale-110 transition-transform duration-300">🎯</div>
                    <p className="font-semibold text-slate-800 text-sm sm:text-base hover:text-slate-900 transition-colors duration-200">{safeSpinsRemaining} Spins</p>
                    <p className="text-xs sm:text-sm text-slate-600 hover:text-slate-700 transition-colors duration-200">Available today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main CTA */}
            <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-200 shadow-lg hover:shadow-xl transition-shadow duration-150 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -translate-y-16 translate-x-16 opacity-0 hover:opacity-100 transition-opacity duration-150"></div>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6 relative z-10">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">Ready to Win Big? 🚀</h3>
                  <p className="text-slate-600 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 px-2">
                    Join prize pools, compete in challenges, and turn your points into real rewards!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Button 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      onClick={() => router.push('/dashboard/prize-pool')}
                    >
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="hidden sm:inline">Join Prize Pool</span>
                      <span className="sm:hidden">Prize Pool</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 hover:scale-105 transition-all duration-200 py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-xl"
                      onClick={() => router.push('/dashboard/activities')}
                    >
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="hidden sm:inline">View Challenges</span>
                      <span className="sm:hidden">Challenges</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Footer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-white/60 rounded-lg p-2.5 sm:p-3 md:p-4 text-center border border-slate-200/50 hover:bg-white/80 active:bg-white/90 hover:border-slate-300/70 hover:shadow-md active:shadow-sm hover:scale-105 active:scale-100 transition-all duration-200 cursor-pointer touch-target no-select">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 hover:text-slate-900 transition-colors duration-200 leading-tight">{safeTotalPoints.toLocaleString()}</div>
                <p className="text-xs sm:text-sm text-slate-600 hover:text-slate-700 transition-colors duration-200 mt-0.5">Total Points</p>
              </div>
              <div className="bg-white/60 rounded-lg p-2.5 sm:p-3 md:p-4 text-center border border-slate-200/50 hover:bg-white/80 active:bg-white/90 hover:border-slate-300/70 hover:shadow-md active:shadow-sm hover:scale-105 active:scale-100 transition-all duration-200 cursor-pointer touch-target no-select">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 hover:text-slate-900 transition-colors duration-200 leading-tight">₽{Number(safeTotalCoins).toFixed(2)}</div>
                <p className="text-xs sm:text-sm text-slate-600 hover:text-slate-700 transition-colors duration-200 mt-0.5">PineCoins</p>
              </div>
              <div className="bg-white/60 rounded-lg p-2.5 sm:p-3 md:p-4 text-center border border-slate-200/50 hover:bg-white/80 active:bg-white/90 hover:border-slate-300/70 hover:shadow-md active:shadow-sm hover:scale-105 active:scale-100 transition-all duration-200 cursor-pointer touch-target no-select">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 hover:text-slate-900 transition-colors duration-200 leading-tight">{safeCurrentStreak}</div>
                <p className="text-xs sm:text-sm text-slate-600 hover:text-slate-700 transition-colors duration-200 mt-0.5">Day Streak</p>
              </div>
              <div className="bg-white/60 rounded-lg p-2.5 sm:p-3 md:p-4 text-center border border-slate-200/50 hover:bg-white/80 active:bg-white/90 hover:border-slate-300/70 hover:shadow-md active:shadow-sm hover:scale-105 active:scale-100 transition-all duration-200 cursor-pointer touch-target no-select">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 hover:text-slate-900 transition-colors duration-200 leading-tight">#{(dashboardData.leaderboard || []).find(entry => entry.user_id === user?.id)?.rank || 'N/A'}</div>
                <p className="text-xs sm:text-sm text-slate-600 hover:text-slate-700 transition-colors duration-200 mt-0.5">Current Rank</p>
              </div>
            </div>
          </motion.div>
      </div>
    </div>

      {/* Enhanced Spin Wheel Dialog */}
      {showSpinWheel && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto safe-top safe-bottom"
          onClick={() => {
            if (!spinning) {
              setShowSpinWheel(false);
              setSpinResult(null);
              setWheelRotation(0);
            }
          }}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-7 max-w-4xl w-full max-h-[92vh] overflow-y-auto scrollbar-hide shadow-2xl border border-slate-200 my-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-4 sm:mb-5">
              <div className="flex justify-center mb-2 sm:mb-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                Daily Spin Wheel
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm md:text-base">Test your luck and win amazing rewards!</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 items-start">
              {/* Improved Spinning Wheel */}
              <div className="flex justify-center py-2">
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                  
                  {/* Wheel Container */}
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
                    {/* Outer Ring with Gradient */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 shadow-2xl"></div>
                    
                    {/* Wheel */}
                    <div className="absolute inset-[8px] rounded-full overflow-hidden shadow-inner bg-white">
                      <svg 
                        viewBox="0 0 200 200" 
                        className="w-full h-full"
                        style={{
                          transform: `rotate(${wheelRotation}deg)`,
                          transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                        }}
                      >
                        {/* 6 Wheel Segments */}
                        {[
                          { color: '#3B82F6', points: 10, icon: '🎯' },
                          { color: '#10B981', points: 25, icon: '💎' },
                          { color: '#F59E0B', points: 50, icon: '🍀' },
                          { color: '#F97316', points: 100, icon: '⭐' },
                          { color: '#8B5CF6', points: 200, icon: '👑' },
                          { color: '#EC4899', points: 500, icon: '🚀' }
                        ].map((segment, index) => {
                          const angle = 60;
                          const rotation = index * angle;
                          const startAngle = (rotation - 90) * (Math.PI / 180);
                          const endAngle = (rotation + angle - 90) * (Math.PI / 180);
                          
                          const x1 = 100 + 100 * Math.cos(startAngle);
                          const y1 = 100 + 100 * Math.sin(startAngle);
                          const x2 = 100 + 100 * Math.cos(endAngle);
                          const y2 = 100 + 100 * Math.sin(endAngle);
                          
                          const textAngle = rotation + angle / 2;
                          const textRadius = 65;
                          const textX = 100 + textRadius * Math.cos((textAngle - 90) * (Math.PI / 180));
                          const textY = 100 + textRadius * Math.sin((textAngle - 90) * (Math.PI / 180));
                          
                          return (
                            <g key={index}>
                              <path
                                d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                                fill={segment.color}
                                stroke="white"
                                strokeWidth="2"
                              />
                              <text
                                x={textX}
                                y={textY - 8}
                                fontSize="24"
                                textAnchor="middle"
                                fill="white"
                                fontWeight="bold"
                              >
                                {segment.icon}
                              </text>
                              <text
                                x={textX}
                                y={textY + 12}
                                fontSize="14"
                                textAnchor="middle"
                                fill="white"
                                fontWeight="bold"
                              >
                                {segment.points}
                              </text>
                            </g>
                          );
                        })}
                        
                        {/* Center Circle */}
                        <circle cx="100" cy="100" r="25" fill="white" stroke="#E5E7EB" strokeWidth="3" />
                        <circle cx="100" cy="100" r="20" fill="url(#centerGradient)" />
                        <defs>
                          <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#14B8A6" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    
                    {/* Pointer - Fixed at top */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="relative">
                        <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[28px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-lg"></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Decorative Stars */}
                    {!spinning && (
                      <>
                        <div className="absolute -top-2 -left-2 text-2xl animate-bounce">⭐</div>
                        <div className="absolute -top-2 -right-2 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
                        <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>💫</div>
                        <div className="absolute -bottom-2 -right-2 text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>🌟</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls & Info */}
              <div className="space-y-3 sm:space-y-4">
                {/* Spin Button */}
                <Button
                  onClick={handleWheelSpin}
                  disabled={spinning || !dashboardData.userStats || (dashboardData.userStats.spins_remaining || 0) <= 0}
                  className={`w-full py-3.5 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg font-bold rounded-xl shadow-lg transition-all duration-200 touch-target no-select ${
                    spinning || !dashboardData.userStats || (dashboardData.userStats.spins_remaining || 0) <= 0
                      ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:from-emerald-700 active:to-teal-700 text-white transform hover:scale-105 active:scale-100'
                  }`}
                >
                  {spinning ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2 inline" />
                      Spinning...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" />
                      SPIN THE WHEEL
                    </>
                  )}
                </Button>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-2.5 sm:p-3 text-center border border-blue-200">
                    <p className="text-blue-600 text-xs font-medium mb-0.5 sm:mb-1">Spins Remaining</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700">{dashboardData?.userStats?.spins_remaining || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-2.5 sm:p-3 text-center border border-amber-200">
                    <p className="text-amber-600 text-xs font-medium mb-0.5 sm:mb-1">Daily Streak</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-700 flex items-center justify-center gap-1">
                      🔥 {dashboardData?.userStats?.current_streak || 0}
                    </p>
                  </div>
                </div>

                {/* Prizes */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 sm:p-4 border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-2.5 sm:mb-3 text-center text-sm sm:text-base">🎁 Prize Pool</h3>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {[
                      { icon: '🎯', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', points: '10 pts' },
                      { icon: '💎', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', points: '25 pts' },
                      { icon: '🍀', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', points: '50 pts' },
                      { icon: '⭐', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', points: '100 pts' },
                      { icon: '👑', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', points: '200 pts' },
                      { icon: '🚀', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', points: '500 pts' }
                    ].map((prize, idx) => (
                      <div key={idx} className={`${prize.bg} ${prize.border} border-2 rounded-lg p-2 flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-105 active:scale-95 transition-transform no-select`}>
                        <span className="text-base sm:text-lg">{prize.icon}</span>
                        <span className={`font-bold text-xs ${prize.color}`}>{prize.points}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Close Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSpinWheel(false);
                    setSpinResult(null);
                    setWheelRotation(0);
                  }}
                  disabled={spinning}
                  className="w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-100 active:bg-slate-200 py-3 sm:py-3.5 rounded-xl font-semibold text-sm touch-target no-select"
                >
                  Close
                </Button>
              </div>
            </div>

            {/* Result - Moved to bottom, below everything */}
            {spinResult && spinResult.points > 0 && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}
                className="mt-4 sm:mt-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3.5 sm:p-4 md:p-5 border-2 border-emerald-300 shadow-md w-full"
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2 animate-bounce">🎉</div>
                  <h3 className="font-bold text-emerald-800 text-lg sm:text-xl mb-1">Congratulations!</h3>
                  <p className="text-emerald-700 text-sm sm:text-base font-medium">
                    You won <span className="text-lg sm:text-xl font-bold">{spinResult.points}</span> points!
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Onboarding Tour */}
      <OnboardingTour />
    </div>
  );
}
