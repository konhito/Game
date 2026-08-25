"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Gift, Users, Loader2, Calendar, Crown, Target, TrendingUp, Check } from "lucide-react";
import { authService } from "@/lib/auth-service";
import { prizePoolService, PrizePool, UserParticipation } from "@/lib/prize-pool-service";

export default function PrizePoolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [prizePools, setPrizePools] = useState<PrizePool[]>([]);
  const [userParticipations, setUserParticipations] = useState<UserParticipation[]>([]);
  const [joiningPool, setJoiningPool] = useState<number | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = authService.getUser();
      const token = authService.getToken();
      
      if (!user || !token) {
        router.push("/sign-in");
        return;
      }
      
      setCurrentUser(user);
      await fetchPrizePools();
      await fetchUserParticipations();
    };

    checkAuth();
  }, [router]);

  const fetchPrizePools = async () => {
    try {
      setLoading(true);
      const response = await prizePoolService.getAllPrizePools();
      
      if (response.success && response.data) {
        setPrizePools(response.data.pools);
      }
    } catch (error) {
      console.error("Error fetching prize pools:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserParticipations = async () => {
    try {
      const response = await prizePoolService.getUserParticipations();
      
      if (response.success && response.data) {
        setUserParticipations(response.data.participations);
      }
    } catch (error) {
      console.error("Error fetching participations:", error);
    }
  };

  const handleJoinPool = async (poolId: number, entryFee: number) => {
    if (!currentUser) return;
    
    try {
      setJoiningPool(poolId);
      
      const response = await prizePoolService.joinPrizePool(poolId);
      
      if (response.success) {
        // Refresh prize pools and participations
        await fetchPrizePools();
        await fetchUserParticipations();
        
        alert(`Successfully joined the prize pool! Entry fee: ₽${entryFee}`);
      }
    } catch (error: any) {
      console.error("Error joining prize pool:", error);
      alert(error.message || "Failed to join prize pool. Please try again.");
    } finally {
      setJoiningPool(null);
    }
  };

  const getUserEntriesForPool = (poolId: number) => {
    return userParticipations.filter(p => p.pool_id === poolId).length;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-500 text-white">Upcoming</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500 text-white">Completed</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading prize pools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <Gift className="w-96 h-96" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                Prize Pools
              </h1>
            </div>
            <p className="text-slate-600 text-sm sm:text-lg">Join prize pools and win amazing rewards! 🎁</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6 mt-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Compete with players</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Win big prizes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Prize Pools */}
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-green-500" />
            Active Prize Pools
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prizePools.filter(pool => pool.status === 'active').map((pool) => (
              <Card key={pool.id} className="rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
                <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
                    <CardTitle className="text-lg sm:text-xl text-slate-800">{pool.title}</CardTitle>
                    {getStatusBadge(pool.status)}
                  </div>
                  <CardDescription className="text-slate-600">
                    {pool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {/* Prize Image */}
                  {pool.image_url && (
                    <div className="mb-5 overflow-hidden rounded-xl border border-slate-200">
                      <img 
                        src={pool.image_url} 
                        alt={pool.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Prize Amount */}
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Prize Pool</span>
                      <Trophy className="h-5 w-5 text-amber-600" />
                    </div>
                    <p className="text-3xl font-bold text-slate-800 mt-1">₽{pool.prize_amount.toLocaleString()}</p>
                  </div>

                  {/* Entry Fee */}
                  <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Entry Fee</span>
                      <span className="text-lg font-bold text-emerald-600">₽{pool.entry_fee}</span>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                      <span>Participants</span>
                      <span className="font-medium">{pool.current_participants}/{pool.max_participants}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(pool.current_participants / pool.max_participants) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="mb-4 text-sm text-slate-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Ends: {formatDate(pool.end_date)}</span>
                    </div>
                  </div>

                  {/* Join Button */}
                  {getUserEntriesForPool(pool.id) >= 10 ? (
                    <Button 
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold transition-all duration-300 cursor-not-allowed"
                      disabled
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Max 10 Entries Reached
                    </Button>
                  ) : (
                    <Button 
                      className="relative w-full overflow-hidden bg-emerald-600 font-semibold text-white transition-colors hover:bg-emerald-700"
                      onClick={() => handleJoinPool(pool.id, pool.entry_fee)}
                      disabled={joiningPool === pool.id || pool.current_participants >= pool.max_participants || getUserEntriesForPool(pool.id) >= 10}
                    >
                      {joiningPool === pool.id ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : getUserEntriesForPool(pool.id) >= 10 ? (
                        'Max Entries Reached'
                      ) : pool.current_participants >= pool.max_participants ? (
                        'Pool Full'
                      ) : (
                        <>
                          <Gift className="w-5 h-5 mr-2" />
                          Join Pool (₽{pool.entry_fee})
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Prize Pools */}
        {prizePools.filter(pool => pool.status === 'upcoming').length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              Upcoming Prize Pools
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prizePools.filter(pool => pool.status === 'upcoming').map((pool) => (
                <Card key={pool.id} className="rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl text-slate-800">{pool.title}</CardTitle>
                      {getStatusBadge(pool.status)}
                    </div>
                    <CardDescription className="text-slate-600">
                      {pool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Prize Pool</span>
                        <Crown className="h-5 w-5 text-amber-600" />
                      </div>
                      <p className="text-3xl font-bold text-slate-800 mt-1">₽{pool.prize_amount.toLocaleString()}</p>
                    </div>

                    <div className="text-sm text-slate-600 space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Starts: {formatDate(pool.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>Entry Fee: ₽{pool.entry_fee}</span>
                      </div>
                    </div>

                    <Button 
                      className="mt-4 w-full cursor-not-allowed bg-slate-200 font-semibold text-slate-500 hover:bg-slate-200"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <Card className="bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 text-white border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  How It Works
                </h3>
                <div className="space-y-3 text-white/90">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="font-bold">1</span>
                    </div>
                    <p>Choose a prize pool.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="font-bold">2</span>
                    </div>
                    <p>Pay the entry fee using your pinecoins.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="font-bold">3</span>
                    </div>
                    <p>Wait for the prize pool to end, and the winner will be automatically selected at random by the system AI.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="font-bold">4</span>
                    </div>
                    <p>Win amazing prizes in either physical items or pinecoins.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="font-bold">5</span>
                    </div>
                    <p>You can only enter a prize pool multiple times, but not more than ten time.</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Tips to Win
                </h3>
                <div className="space-y-3 text-white/90">
                  <div className="flex items-center gap-2">
                    <span>🎯</span>
                    <p>Complete daily tasks to boost your chances</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🔥</span>
                    <p>Maintain your daily streak for bonus points</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🎮</span>
                    <p>Spin the wheel daily for extra points</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💪</span>
                    <p>Stay active and engaged throughout the competition</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



