"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Crown, Calendar, Loader2, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LeaderboardEntry {
  id: number;
  user_id: number;
  name: string;
  total_points: number;
  weekly_points: number;
  total_coins: number;
  current_streak: number;
  tasks_completed: number;
}

interface WeeklyPool {
  pinecoins: number;
  naira: number;
  exchange_rate: number;
}

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyPool, setWeeklyPool] = useState<WeeklyPool | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.up.railway.app';
      const response = await fetch(`${API_BASE}/api/users/leaderboard/public?limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const result = await response.json();
      
      if (result.success && result.data.users) {
        // Add rank to each entry based on weekly_points
        const rankedData = result.data.users.map((entry: any, index: number) => ({
          ...entry,
          rank: index + 1
        }));
        setLeaderboardData(rankedData);
        
        // Set weekly pool data if available
        if (result.data.weekly_pool) {
          setWeeklyPool(result.data.weekly_pool);
        }
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate weekly rewards based on actual pool price
  const weeklyRewards = weeklyPool ? [
    { rank: 1, reward: "50%", amount: `₽${(weeklyPool.pinecoins * 0.5).toLocaleString()}`, naira: `₦${(weeklyPool.naira * 0.5).toLocaleString()}`, color: "bg-yellow-500" },
    { rank: 2, reward: "30%", amount: `₽${(weeklyPool.pinecoins * 0.3).toLocaleString()}`, naira: `₦${(weeklyPool.naira * 0.3).toLocaleString()}`, color: "bg-gray-400" },
    { rank: 3, reward: "15%", amount: `₽${(weeklyPool.pinecoins * 0.15).toLocaleString()}`, naira: `₦${(weeklyPool.naira * 0.15).toLocaleString()}`, color: "bg-orange-500" },
    { rank: "Random", reward: "5%", amount: `₽${(weeklyPool.pinecoins * 0.05).toLocaleString()}`, naira: `₦${(weeklyPool.naira * 0.05).toLocaleString()}`, color: "bg-purple-500" },
  ] : [
    { rank: 1, reward: "50%", amount: "₽2,500", naira: "₦0", color: "bg-yellow-500" },
    { rank: 2, reward: "30%", amount: "₽1,500", naira: "₦0", color: "bg-gray-400" },
    { rank: 3, reward: "15%", amount: "₽750", naira: "₦0", color: "bg-orange-500" },
    { rank: "Random", reward: "5%", amount: "₽250", naira: "₦0", color: "bg-purple-500" },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const getAvatar = (rank: number) => {
    if (rank === 1) return "👑";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    if (rank <= 10) return `${rank}️⃣`;
    return "🎯";
  };

  const getNextResetTime = () => {
    const now = new Date();
    const currentDay = now.getUTCDay();
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    const nextMonday = new Date(now);
    if (currentDay === 0 || daysToMonday === 0) {
      nextMonday.setUTCDate(now.getUTCDate() + (7 - daysToMonday));
    } else {
      nextMonday.setUTCDate(now.getUTCDate() + (7 - daysToMonday));
    }
    nextMonday.setUTCHours(0, 0, 0, 0);
    
    const daysUntilReset = Math.ceil((nextMonday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilReset;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <Trophy className="w-96 h-96" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Weekly Leaderboard
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-slate-600 text-lg">Compete for weekly rewards and climb to the top! 🚀</p>
            
            {/* Weekly Pool Display */}
            {weeklyPool && (
              <div className="mt-6 mb-4 p-6 bg-gradient-to-r from-yellow-100 via-orange-100 to-amber-100 rounded-2xl border-2 border-yellow-300 shadow-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Crown className="w-6 h-6 text-yellow-600" />
                    <span className="text-sm font-semibold text-slate-700">Weekly Prize Pool</span>
                  </div>
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-800">₽{weeklyPool.pinecoins.toLocaleString()}</div>
                      <div className="text-sm text-slate-600 mt-1">PineCoins</div>
                    </div>
                    <div className="w-px h-12 bg-slate-400"></div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-700">₦{weeklyPool.naira.toLocaleString()}</div>
                      <div className="text-sm text-slate-600 mt-1">Naira</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Exchange Rate: 1 PineCoin = 1 USDT = ₦{weeklyPool.exchange_rate.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Resets every Monday at 00:00 UTC</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-semibold">
                  {getNextResetTime()} days until reset
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-slate-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800 text-xl">Top Players</CardTitle>
                      <CardDescription className="text-slate-600">
                        Weekly rankings based on points earned this week
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md">
                    {getNextResetTime()} days left
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {leaderboardData.length === 0 ? (
                    <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300">
                      <div className="text-6xl mb-4">🏆</div>
                      <p className="text-slate-600 font-medium text-lg">No leaderboard data available yet.</p>
                      <p className="text-sm text-slate-500 mt-2">Start earning points to appear on the leaderboard!</p>
                      <Link href="/sign-up" className="mt-4 inline-block">
                        <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    leaderboardData.map((player, index) => (
                      <div 
                        key={player.id} 
                        className={`flex items-center justify-between p-5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                          player.rank === 1 
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 shadow-md' 
                            : player.rank === 2 
                            ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300 shadow-md' 
                            : player.rank === 3 
                            ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300 shadow-md' 
                            : 'bg-gradient-to-r from-white to-slate-50 border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{getAvatar(player.rank)}</span>
                            <div className="text-center min-w-[50px]">
                              <div className={`text-xl font-bold ${
                                player.rank === 1 ? 'text-yellow-600' :
                                player.rank === 2 ? 'text-gray-600' :
                                player.rank === 3 ? 'text-orange-600' : 'text-slate-700'
                              }`}>
                                #{player.rank}
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-lg text-slate-800">{player.name}</p>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <span className="text-orange-500">🔥</span> 
                                {player.current_streak || 0} day streak
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-emerald-500">💰</span> 
                                ₽{Number(player.total_coins || 0).toFixed(0)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-800">{player.weekly_points?.toLocaleString() || 0}</div>
                          <p className="text-sm text-slate-600">
                            <span className="text-green-600 font-medium">Weekly Points</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {player.total_points.toLocaleString()} total
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Rewards */}
            <Card className="bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-slate-200/50">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <span>Weekly Rewards</span>
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Prize pool distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {weeklyRewards.map((reward, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <Badge className={`${reward.color} text-white shadow-sm`}>
                          {reward.rank === "Random" ? "🎲" : `#${reward.rank}`}
                        </Badge>
                        <span className="font-semibold text-slate-700">{reward.reward}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-slate-800">{reward.amount}</p>
                        {reward.naira && reward.naira !== "₦0" && (
                          <p className="text-sm text-emerald-600 font-medium">{reward.naira}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {weeklyPool && (
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 shadow-sm">
                    <p className="text-sm text-center text-yellow-800 font-bold">
                      💰 Total Prize Pool: ₽{weeklyPool.pinecoins.toLocaleString()} / ₦{weeklyPool.naira.toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How to Climb */}
            <Card className="bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200/50">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span>How to Climb</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <span className="text-2xl">🆕</span>
                    <span className="font-medium text-slate-700">
                      Sign up: <span className="text-green-600 font-bold">+50 points</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <span className="text-2xl">👥</span>
                    <span className="font-medium text-slate-700">
                      Referral: <span className="text-blue-600 font-bold">+30 points</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <span className="text-2xl">📱</span>
                    <span className="font-medium text-slate-700">
                      Share a post on our social page: <span className="text-orange-600 font-bold">+20 points</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <span className="text-2xl">📰</span>
                    <span className="font-medium text-slate-700">
                      Share a news post on your social: <span className="text-amber-600 font-bold">+10 points</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <span className="text-2xl">💬</span>
                    <span className="font-medium text-slate-700">
                      Comment on our social post: <span className="text-purple-600 font-bold">+5 points</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-pink-50 border border-pink-200">
                    <span className="text-2xl">❤️</span>
                    <span className="font-medium text-slate-700">
                      Like our social post: <span className="text-pink-600 font-bold">+5 points</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 border border-teal-200">
                    <span className="text-2xl">📅</span>
                    <span className="font-medium text-slate-700">
                      Daily login: <span className="text-teal-600 font-bold">+5 points</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <span className="text-2xl">🔥</span>
                    <span className="font-medium text-slate-700">
                      3‑day login streak: <span className="text-yellow-600 font-bold">+2 extra spins</span> on day 3
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Info */}
            <Card className="bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200/50">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span>Leaderboard Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="text-blue-500">🔄</span>
                    <span>Resets every Monday at 00:00 UTC</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="text-yellow-500">🏆</span>
                    <span>Top 3 players get weekly rewards</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="text-purple-500">🎲</span>
                    <span>1 random player gets 5% bonus</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="text-green-500">💰</span>
                    <span>Rewards paid in PineCoins</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="text-emerald-500">📊</span>
                    <span>Weekly points reset, total preserved</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12">
          <Card className="bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 text-white border-0 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <CardContent className="pt-12 pb-12 relative z-10">
              <div className="text-center max-w-2xl mx-auto">
                <div className="text-6xl mb-6">🚀</div>
                <h3 className="text-4xl font-bold mb-4">Ready to Reach the Top?</h3>
                <p className="text-white/90 mb-8 text-lg">
                  Start earning points now and compete for weekly rewards!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    asChild
                    className="bg-white text-emerald-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Link href="/sign-up">
                      <Trophy className="w-5 h-5 mr-2" />
                      Get Started
                    </Link>
                  </Button>
                  <Button 
                    asChild
                    variant="outline" 
                    className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-bold text-lg px-8 py-6 rounded-xl hover:scale-105 transition-all duration-200"
                  >
                    <Link href="/sign-in">
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
