"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Gift, 
  Star,
  Trophy,
  Coins,
  Crown,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  Clock,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Reward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  coins_required: number;
  category: 'points' | 'coins' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  claimed: boolean;
  available: boolean;
}

export default function RewardsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user');
    
    if (!token || !userData) {
      router.push('/sign-in');
      return;
    }

    setUser(JSON.parse(userData));
    fetchUserStats();
    fetchRewards();
  }, [router]);

  const fetchUserStats = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('auth_user') || '{}');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://casinobackend-production-66bf.up.railway.app'}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchRewards = async () => {
    try {
      // Mock rewards data - in a real app, this would come from an API
      const mockRewards: Reward[] = [
        {
          id: 1,
          name: "Welcome Bonus",
          description: "Get started with extra points",
          points_required: 0,
          coins_required: 0,
          category: 'special',
          rarity: 'common',
          icon: '🎁',
          claimed: false,
          available: true
        },
        {
          id: 2,
          name: "Point Collector",
          description: "Earn 100 points to unlock this reward",
          points_required: 100,
          coins_required: 0,
          category: 'points',
          rarity: 'common',
          icon: '⭐',
          claimed: false,
          available: true
        },
        {
          id: 3,
          name: "Coin Master",
          description: "Collect 50 PineCoins to unlock this reward",
          points_required: 0,
          coins_required: 50,
          category: 'coins',
          rarity: 'rare',
          icon: '🪙',
          claimed: false,
          available: true
        },
        {
          id: 4,
          name: "High Roller",
          description: "Earn 500 points to unlock this exclusive reward",
          points_required: 500,
          coins_required: 0,
          category: 'points',
          rarity: 'epic',
          icon: '👑',
          claimed: false,
          available: true
        },
        {
          id: 5,
          name: "Wealthy Investor",
          description: "Collect 200 PineCoins to unlock this premium reward",
          points_required: 0,
          coins_required: 200,
          category: 'coins',
          rarity: 'epic',
          icon: '💎',
          claimed: false,
          available: true
        },
        {
          id: 6,
          name: "Legendary Achiever",
          description: "Earn 1000 points to unlock this legendary reward",
          points_required: 1000,
          coins_required: 0,
          category: 'points',
          rarity: 'legendary',
          icon: '🏆',
          claimed: false,
          available: true
        },
        {
          id: 7,
          name: "Diamond Collector",
          description: "Collect 500 PineCoins to unlock this legendary reward",
          points_required: 0,
          coins_required: 500,
          category: 'coins',
          rarity: 'legendary',
          icon: '💠',
          claimed: false,
          available: true
        }
      ];

      setRewards(mockRewards);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'rare': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'points': return <Star className="w-4 h-4" />;
      case 'coins': return <Coins className="w-4 h-4" />;
      case 'special': return <Gift className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const canClaimReward = (reward: Reward) => {
    if (reward.claimed || !userStats) return false;
    
    if (reward.category === 'points') {
      return userStats.total_points >= reward.points_required;
    } else if (reward.category === 'coins') {
      return userStats.total_coins >= reward.coins_required;
    } else if (reward.category === 'special') {
      return reward.available;
    }
    
    return false;
  };

  const claimReward = async (rewardId: number) => {
    // Mock claim functionality - in a real app, this would call an API
    setRewards(prev => prev.map(reward => 
      reward.id === rewardId ? { ...reward, claimed: true } : reward
    ));
  };

  const filteredRewards = rewards.filter(reward => {
    if (selectedCategory === 'all') return true;
    return reward.category === selectedCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-slate-500 text-lg">Loading rewards...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Rewards Center
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Claim rewards based on your progress and achievements
                  </p>
                </div>
              </div>
              
              {/* User Stats */}
              {userStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Total Points</p>
                        <p className="text-2xl font-bold text-slate-900">{userStats.total_points || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                        <Coins className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">PineCoins</p>
                        <p className="text-2xl font-bold text-slate-900">{userStats.total_coins || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Filter Rewards</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'all', label: 'All Rewards', icon: <Gift className="w-4 h-4" /> },
                { key: 'points', label: 'Points Rewards', icon: <Star className="w-4 h-4" /> },
                { key: 'coins', label: 'Coin Rewards', icon: <Coins className="w-4 h-4" /> },
                { key: 'special', label: 'Special Rewards', icon: <Sparkles className="w-4 h-4" /> }
              ].map((category) => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`flex items-center gap-2 ${
                    selectedCategory === category.key 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {category.icon}
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`group hover:shadow-lg transition-all duration-300 border border-slate-200 shadow-sm bg-white overflow-hidden ${
                  reward.claimed ? 'opacity-60' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Reward Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-3xl">{reward.icon}</div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg">{reward.name}</h3>
                              <Badge className={`text-xs ${getRarityColor(reward.rarity)}`}>
                                {reward.rarity.charAt(0).toUpperCase() + reward.rarity.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {reward.description}
                          </p>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                          {getCategoryIcon(reward.category)}
                          <span className="text-sm font-medium text-slate-700">Requirements</span>
                        </div>
                        <div className="space-y-2">
                          {reward.points_required > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Points needed:</span>
                              <span className="text-sm font-semibold text-slate-900">
                                {reward.points_required}
                                {userStats && (
                                  <span className={`ml-2 ${userStats.total_points >= reward.points_required ? 'text-emerald-600' : 'text-red-500'}`}>
                                    ({userStats.total_points || 0})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {reward.coins_required > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Coins needed:</span>
                              <span className="text-sm font-semibold text-slate-900">
                                {reward.coins_required}
                                {userStats && (
                                  <span className={`ml-2 ${userStats.total_coins >= reward.coins_required ? 'text-emerald-600' : 'text-red-500'}`}>
                                    ({userStats.total_coins || 0})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {reward.category === 'special' && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Status:</span>
                              <span className="text-sm font-semibold text-emerald-600">Available</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      {reward.claimed ? (
                        <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 rounded-xl border border-emerald-200">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">Claimed</span>
                        </div>
                      ) : canClaimReward(reward) ? (
                        <Button
                          onClick={() => claimReward(reward.id)}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 transition-all duration-300"
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Claim Reward
                        </Button>
                      ) : (
                        <div className="flex items-center justify-center gap-2 py-3 bg-slate-100 rounded-xl border border-slate-200">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-500">Not Available Yet</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredRewards.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Rewards Found</h3>
              <p className="text-slate-500 mb-6">Try selecting a different category to see more rewards.</p>
              <Button
                onClick={() => setSelectedCategory('all')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                View All Rewards
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
