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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [poolForm, setPoolForm] = useState({
    title: '',
    description: '',
    prize_amount: '',
    entry_fee: '',
    max_participants: '',
    start_date: '',
    end_date: '',
    status: 'upcoming' as 'active' | 'upcoming' | 'completed',
    image_url: ''
  });

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

  const handleCreatePool = async () => {
    try {
      setCreating(true);
      
      const poolData = {
        title: poolForm.title,
        description: poolForm.description,
        prize_amount: parseFloat(poolForm.prize_amount),
        entry_fee: parseFloat(poolForm.entry_fee),
        max_participants: parseInt(poolForm.max_participants),
        start_date: poolForm.start_date || new Date().toISOString(),
        end_date: poolForm.end_date,
        status: poolForm.status,
        ...(poolForm.image_url && { image_url: poolForm.image_url })
      };
      
      const response = await prizePoolService.createPrizePool(poolData);
      
      if (response.success) {
        await fetchPrizePools();
        setShowCreateDialog(false);
        setPoolForm({
          title: '',
          description: '',
          prize_amount: '',
          entry_fee: '',
          max_participants: '',
          start_date: '',
          end_date: '',
          status: 'upcoming',
          image_url: ''
        });
        alert('Prize pool created successfully!');
      }
    } catch (error: any) {
      console.error("Error creating prize pool:", error);
      alert(error.message || "Failed to create prize pool. Please try again.");
    } finally {
      setCreating(false);
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Prize Pool Management</h1>
            <p className="text-slate-600">Manage prize pools and select winners</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <Plus className="w-5 h-5 mr-2" />
                Create Prize Pool
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Prize Pool</DialogTitle>
                <DialogDescription>
                  Create a new prize pool event. Winners are selected at random by AI.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={poolForm.title}
                    onChange={(e) => setPoolForm({...poolForm, title: e.target.value})}
                    placeholder="e.g., Weekly Grand Prize"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={poolForm.description}
                    onChange={(e) => setPoolForm({...poolForm, description: e.target.value})}
                    placeholder="Describe the prize pool and prizes to be won"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prize_amount">Prize Amount (PineCoins) *</Label>
                    <Input
                      id="prize_amount"
                      type="number"
                      value={poolForm.prize_amount}
                      onChange={(e) => setPoolForm({...poolForm, prize_amount: e.target.value})}
                      placeholder="5000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry_fee">Entry Fee (PineCoins) *</Label>
                    <Input
                      id="entry_fee"
                      type="number"
                      value={poolForm.entry_fee}
                      onChange={(e) => setPoolForm({...poolForm, entry_fee: e.target.value})}
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_participants">Max Participants *</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={poolForm.max_participants}
                    onChange={(e) => setPoolForm({...poolForm, max_participants: e.target.value})}
                    placeholder="100"
                  />
                  <p className="text-xs text-slate-500">Users can enter multiple times (max 10 times per pool)</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={poolForm.start_date}
                      onChange={(e) => setPoolForm({...poolForm, start_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={poolForm.end_date}
                      onChange={(e) => setPoolForm({...poolForm, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL (Optional)</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={poolForm.image_url}
                    onChange={(e) => setPoolForm({...poolForm, image_url: e.target.value})}
                    placeholder="https://example.com/prize-image.jpg"
                  />
                  <p className="text-xs text-slate-500">URL to image of the prize (for physical items like phones)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={poolForm.status} onValueChange={(value: 'active' | 'upcoming' | 'completed') => setPoolForm({...poolForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    onClick={handleCreatePool}
                    disabled={creating || !poolForm.title || !poolForm.prize_amount || !poolForm.entry_fee || !poolForm.max_participants || !poolForm.end_date}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Pool
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false);
                      setPoolForm({
                        title: '',
                        description: '',
                        prize_amount: '',
                        entry_fee: '',
                        max_participants: '',
                        start_date: '',
                        end_date: '',
                        status: 'upcoming',
                        image_url: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                {/* Prize Image */}
                {pool.image_url && (
                  <div className="mb-4 rounded-xl overflow-hidden border-2 border-slate-200">
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

