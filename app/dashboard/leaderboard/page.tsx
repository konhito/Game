import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Gift, Target, Crown, Calendar } from "lucide-react";

export default function LeaderboardPage() {
  // Mock data - replace with real data from your backend
  const leaderboardData = [
    { rank: 1, name: "Player1", points: 3200, avatar: "👑", weeklyPoints: 850, totalPineCoins: 320, streak: 7 },
    { rank: 2, name: "Player2", points: 2850, avatar: "🥈", weeklyPoints: 720, totalPineCoins: 285, streak: 5 },
    { rank: 3, name: "Player3", points: 2600, avatar: "🥉", weeklyPoints: 680, totalPineCoins: 260, streak: 6 },
    { rank: 4, name: "Player4", points: 2400, avatar: "4️⃣", weeklyPoints: 620, totalPineCoins: 240, streak: 4 },
    { rank: 5, name: "Player5", points: 2200, avatar: "5️⃣", weeklyPoints: 580, totalPineCoins: 220, streak: 3 },
    { rank: 6, name: "Player6", points: 2000, avatar: "6️⃣", weeklyPoints: 520, totalPineCoins: 200, streak: 5 },
    { rank: 7, name: "Player7", points: 1850, avatar: "7️⃣", weeklyPoints: 480, totalPineCoins: 185, streak: 2 },
    { rank: 8, name: "Player8", points: 1700, avatar: "8️⃣", weeklyPoints: 440, totalPineCoins: 170, streak: 4 },
    { rank: 9, name: "Player9", points: 1550, avatar: "9️⃣", weeklyPoints: 400, totalPineCoins: 155, streak: 3 },
    { rank: 10, name: "Player10", points: 1400, avatar: "🔟", weeklyPoints: 360, totalPineCoins: 140, streak: 2 },
  ];

  const weeklyRewards = [
    { rank: 1, reward: "50%", amount: "₦25,000", color: "bg-yellow-500" },
    { rank: 2, reward: "30%", amount: "₦15,000", color: "bg-gray-400" },
    { rank: 3, reward: "15%", amount: "₦7,500", color: "bg-orange-500" },
    { rank: "Random", reward: "5%", amount: "₦2,500", color: "bg-purple-500" },
  ];

  const currentUser = { rank: 15, points: 1250, weeklyPoints: 450 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏆 Weekly Leaderboard</h1>
          <p className="text-gray-300">Compete for weekly rewards and climb to the top!</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Your Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">#{currentUser.rank}</div>
              <p className="text-sm text-gray-400">Current position</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Your Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentUser.points.toLocaleString()}</div>
              <p className="text-sm text-gray-400">Total points</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Weekly Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentUser.weeklyPoints.toLocaleString()}</div>
              <p className="text-sm text-gray-400">This week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <CardTitle>Top 10 Players</CardTitle>
                  </div>
                  <Badge className="bg-green-500">Resets in 3 days</Badge>
                </div>
                <CardDescription className="text-gray-300">
                  Weekly rankings based on points earned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData.map((player) => (
                    <div key={player.rank} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{player.avatar}</span>
                          <div className="text-center min-w-[40px]">
                            <div className={`text-lg font-bold ${
                              player.rank === 1 ? 'text-yellow-400' :
                              player.rank === 2 ? 'text-gray-300' :
                              player.rank === 3 ? 'text-orange-400' : 'text-white'
                            }`}>
                              #{player.rank}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-lg">{player.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>🔥 {player.streak} day streak</span>
                            <span>💰 ${player.totalPineCoins}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{player.points.toLocaleString()}</div>
                        <p className="text-sm text-gray-400">+{player.weeklyPoints} this week</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Your Position */}
                <div className="mt-6 p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">🎯</div>
                      <div>
                        <p className="font-medium text-lg">Your Position</p>
                        <p className="text-sm text-gray-300">Keep playing to climb higher!</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">#{currentUser.rank}</div>
                      <p className="text-sm text-gray-400">{currentUser.points.toLocaleString()} points</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Rewards */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Weekly Rewards
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Prize pool distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weeklyRewards.map((reward, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <Badge className={reward.color}>
                          {reward.rank === "Random" ? "🎲" : `#${reward.rank}`}
                        </Badge>
                        <span className="font-medium">{reward.reward}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{reward.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                  <p className="text-sm text-center text-yellow-200">
                    💰 Total Prize Pool: ₦50,000
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How to Climb */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  How to Climb
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">🎯</span>
                    <span>Daily Login: +5 points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">🎮</span>
                    <span>Spinning Wheel: 1-50 points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">📺</span>
                    <span>Watch Ads: +5 points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400">📱</span>
                    <span>Share Posts: +20 points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-pink-400">👥</span>
                    <span>Refer Friends: +10 points</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Info */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Leaderboard Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>🔄 Resets every Monday at 00:00 UTC</p>
                  <p>🏆 Top 3 players get weekly rewards</p>
                  <p>🎲 1 random player gets 5% bonus</p>
                  <p>💰 Rewards paid in PineCoins</p>
                  <p>📊 Your total points are preserved</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-4">Ready to Reach the Top?</h3>
              <p className="text-gray-300 mb-6">
                Start earning points now and compete for weekly rewards!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold">
                  Start Playing
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  View All Activities
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
