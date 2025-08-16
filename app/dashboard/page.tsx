import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Gamepad2, TrendingUp, Calendar, BarChart3, Zap } from "lucide-react";

export default function DashboardPage() {
  // Mock data - replace with real data from your backend
  const userStats = {
    totalPoints: 1250,
    weeklyPoints: 450,
    rank: 5,
    totalPineCoins: 125.50,
    dailyLoginStreak: 3,
    spinsRemaining: 3,
    nextRewardAt: "2,500 points"
  };

  const leaderboard = [
    { rank: 1, name: "Player1", points: 3200, avatar: "👑" },
    { rank: 2, name: "Player2", points: 2850, avatar: "🥈" },
    { rank: 3, name: "Player3", points: 2600, avatar: "🥉" },
    { rank: 4, name: "Player4", points: 2400, avatar: "4️⃣" },
    { rank: 5, name: "You", points: 1250, avatar: "🎯" },
  ];

  const recentActivities = [
    { action: "Daily Login", points: 5, time: "2 hours ago" },
    { action: "Watched Ad", points: 5, time: "4 hours ago" },
    { action: "Spinning Wheel", points: 20, time: "6 hours ago" },
    { action: "Referral Bonus", points: 10, time: "1 day ago" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back, Player!</h1>
          <p className="text-gray-300">Ready to climb the leaderboard and win big?</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalPoints.toLocaleString()}</div>
              <Progress value={75} className="mt-2" />
              <p className="text-xs text-gray-400 mt-1">Next reward at {userStats.nextRewardAt}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Weekly Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.weeklyPoints.toLocaleString()}</div>
              <p className="text-xs text-gray-400 mt-1">This week's progress</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Current Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{userStats.rank}</div>
              <p className="text-slate-600 text-sm">
                You&apos;re currently ranked #{userStats.rank} on the leaderboard
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">PineCoins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${userStats.totalPineCoins}</div>
              <p className="text-xs text-gray-400 mt-1">Available balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Spinning Wheel */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-blue-400" />
                <CardTitle>Spinning Wheel</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Spin to win points and rewards!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <p className="text-sm text-gray-300">
                  {userStats.spinsRemaining} spins remaining
                </p>
                {userStats.dailyLoginStreak >= 3 && (
                  <Badge className="mt-2 bg-green-500">+2 Bonus Spins!</Badge>
                )}
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                Spin Now
              </Button>
              <div className="text-xs text-gray-400 text-center">
                Daily free spin • 3-day streak = bonus spins
              </div>
            </CardContent>
          </Card>

          {/* Daily Login */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-green-400" />
                <CardTitle>Daily Login</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Claim your daily rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🌅</div>
                <p className="text-sm text-gray-300">
                  {userStats.dailyLoginStreak} day streak
                </p>
                <Badge className="mt-2 bg-orange-500">
                  +5 points today
                </Badge>
              </div>
              <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                Claim Daily Reward
              </Button>
              <div className="text-xs text-gray-400 text-center">
                Come back tomorrow for more points!
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400" />
                <CardTitle>Quick Actions</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Earn points fast
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                📺 Watch Ad (+5 points)
              </Button>
              <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                📱 Share Post (+20 points)
              </Button>
              <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                👥 Invite Friends (+10 points)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard and Activities */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <CardTitle>Weekly Leaderboard</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Top performers this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((player) => (
                  <div key={player.rank} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{player.avatar}</span>
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-gray-400">#{player.rank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{player.points.toLocaleString()}</p>
                      <p className="text-sm text-gray-400">points</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  View Full Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <CardTitle>Recent Activities</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Your latest point earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-400">{activity.time}</p>
                    </div>
                    <Badge className="bg-green-500">+{activity.points} points</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  View All Activities
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-4">Ready to Win Big?</h3>
              <p className="text-gray-300 mb-6">
                Join prize pools, compete in challenges, and turn your points into real rewards!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold">
                  Join Prize Pool
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  View Challenges
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
