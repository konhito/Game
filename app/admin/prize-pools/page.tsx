"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Gift, Users, Loader2, Plus, Crown, Dices, Target, Check } from "lucide-react";
import { authService } from "@/lib/auth-service";
import { prizePoolService, PrizePool, Participant } from "@/lib/prize-pool-service";

export default function AdminPrizePoolsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [prizePools, setPrizePools] = useState<PrizePool[]>([]);
  const [selectedPool, setSelectedPool] = useState<PrizePool | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [selectionMethod, setSelectionMethod] = useState<'random' | 'manual'>('random');
  const [manualUserId, setManualUserId] = useState('');
  const [selectingWinner, setSelectingWinner] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = authService.getUser();
      const token = authService.getToken();
      
      if (!user || !token) {
        router.push("/sign-in");
        return;
      }
      
      if (user.role !== 'admin') {
        router.push("/dashboard");
        return;
      }
      
      setCurrentUser(user);
      await fetchPrizePools();
    };

    checkAuth();
  }, [router]);

  const fetchPrizePools = async () => {
    try {
      setLoading(true);
      const response = await prizePoolService.getAllPrizePools();
      
      if (response.success && response.data) {
        // Fetch participants for each pool
        const poolsWithParticipants = await Promise.all(
          response.data.pools.map(async (pool) => {
            try {
              const poolDetails = await prizePoolService.getPrizePoolById(pool.id);
              if (poolDetails.success && poolDetails.data) {
                return {
                  ...pool,
                  participants: poolDetails.data.participants
                };
              }
            } catch (error) {
              console.error(`Error fetching participants for pool ${pool.id}:`, error);
            }
            return pool;
          })
        );
        
        setPrizePools(poolsWithParticipants);
      }
    } catch (error) {
      console.error("Error fetching prize pools:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWinner = async () => {
    if (!selectedPool) return;
    
    try {
      setSelectingWinner(true);
      
      const winnerId = selectionMethod === 'manual' ? parseInt(manualUserId) : undefined;
      
      if (selectionMethod === 'manual' && (!winnerId || isNaN(winnerId))) {
        alert("Please enter a valid user ID!");
        return;
      }
      
      const response = await prizePoolService.selectWinner(
        selectedPool.id,
        selectionMethod,
        winnerId
      );
      
      if (response.success) {
        await fetchPrizePools();
        
        alert(`Winner selected successfully! User ID: ${response.data.winner_id}, Prize: ₽${response.data.prize_amount}`);
        setShowWinnerDialog(false);
        setSelectedPool(null);
        setManualUserId('');
      }
    } catch (error: any) {
      console.error("Error selecting winner:", error);
      alert(error.message || "Failed to select winner. Please try again.");
    } finally {
      setSelectingWinner(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading prize pools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Prize Pool Management</h1>
          <p className="text-slate-600">Manage prize pools and select winners</p>
        </div>

        {/* Prize Pools Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {prizePools.map((pool) => (
            <Card key={pool.id} className="bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-slate-800">{pool.title}</CardTitle>
                  <Badge className={
                    pool.status === 'active' ? 'bg-green-500' :
                    pool.status === 'completed' ? 'bg-gray-500' :
                    'bg-blue-500'
                  }>
                    {pool.status}
                  </Badge>
                </div>
                <CardDescription className="text-slate-600">
                  {pool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Pool Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
                    <p className="text-xs text-slate-600 mb-1">Prize Amount</p>
                    <p className="text-xl font-bold text-slate-800">₽{pool.prize_amount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
                    <p className="text-xs text-slate-600 mb-1">Entry Fee</p>
                    <p className="text-xl font-bold text-slate-800">₽{pool.entry_fee}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                    <p className="text-xs text-slate-600 mb-1">Participants</p>
                    <p className="text-xl font-bold text-slate-800">{pool.current_participants}/{pool.max_participants}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                    <p className="text-xs text-slate-600 mb-1">Total Pool</p>
                    <p className="text-xl font-bold text-slate-800">₽{(pool.entry_fee * pool.current_participants).toLocaleString()}</p>
                  </div>
                </div>

                {/* Winner Info */}
                {pool.winner_id && (
                  <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-yellow-600" />
                      <span className="font-bold text-slate-800">Winner Selected</span>
                    </div>
                    <p className="text-sm text-slate-700">Winner ID: {pool.winner_id}</p>
                    {pool.winner_name && <p className="text-sm text-slate-700">Name: {pool.winner_name}</p>}
                  </div>
                )}

                {/* Select Winner Button */}
                {pool.status === 'active' && (
                  <Dialog open={showWinnerDialog && selectedPool?.id === pool.id} onOpenChange={(open) => {
                    setShowWinnerDialog(open);
                    if (!open) {
                      setSelectedPool(null);
                      setManualUserId('');
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                        onClick={() => {
                          setSelectedPool(pool);
                          setShowWinnerDialog(true);
                        }}
                      >
                        <Trophy className="w-5 h-5 mr-2" />
                        Select Winner
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Trophy className="w-6 h-6 text-yellow-500" />
                          Select Winner
                        </DialogTitle>
                        <DialogDescription>
                          Choose how to select the winner for {pool.title}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6 py-4">
                        {/* Selection Method */}
                        <div className="space-y-2">
                          <Label>Selection Method</Label>
                          <Select value={selectionMethod} onValueChange={(value: 'random' | 'manual') => setSelectionMethod(value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="random">
                                <div className="flex items-center gap-2">
                                  <Dices className="w-4 h-4" />
                                  Random Selection
                                </div>
                              </SelectItem>
                              <SelectItem value="manual">
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  Manual Selection
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Manual User ID Input */}
                        {selectionMethod === 'manual' && (
                          <div className="space-y-2">
                            <Label htmlFor="userId">User ID</Label>
                            <Input
                              id="userId"
                              type="number"
                              placeholder="Enter user ID"
                              value={manualUserId}
                              onChange={(e) => setManualUserId(e.target.value)}
                            />
                            <p className="text-xs text-slate-500">Enter the ID of the user you want to select as winner</p>
                          </div>
                        )}

                        {/* Pool Info */}
                        <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                          <p className="text-sm text-slate-600 mb-2">Pool Information:</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-slate-700"><span className="font-medium">Participants:</span> {pool.current_participants}</p>
                            <p className="text-slate-700"><span className="font-medium">Prize:</span> ₽{pool.prize_amount.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Confirm Button */}
                        <Button 
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                          onClick={handleSelectWinner}
                          disabled={selectingWinner || (selectionMethod === 'manual' && !manualUserId)}
                        >
                          {selectingWinner ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Selecting...
                            </>
                          ) : (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              Confirm Selection
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {pool.status === 'completed' && (
                  <Button 
                    className="w-full bg-gray-400 text-white font-bold"
                    disabled
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Winner Selected
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

