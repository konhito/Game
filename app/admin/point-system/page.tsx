'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Coins,
  Target,
  Gift,
  Users,
  TrendingUp,
  Award,
  Plus,
  Edit,
  Save,
  X,
  Minus,
  RotateCcw
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import config from '@/lib/config';

interface PointSystemConfig {
  [key: string]: {
    id: number;
    description: string;
    updated_at: string;
    [key: string]: any;
  };
}

interface PointTransaction {
  id: number;
  user_id: number;
  transaction_type: string;
  points_change: number;
  coins_change: number;
  description: string;
  created_at: string;
  metadata?: any;
}

interface User {
  id: number;
  name: string;
  email: string;
  total_points: number;
  total_coins: number;
}

export default function PointSystemAdmin() {
  const [configs, setConfigs] = useState<PointSystemConfig>({});
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [tempConfig, setTempConfig] = useState<any>({});
  const [awardForm, setAwardForm] = useState({
    userId: '',
    points: '',
    coins: '',
    description: '',
    transactionType: 'bonus'
  });
  const [showAwardForm, setShowAwardForm] = useState(false);
  const [showDeductForm, setShowDeductForm] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [deductForm, setDeductForm] = useState({
    userId: '',
    points: '',
    coins: '',
    description: ''
  });
  const [resetForm, setResetForm] = useState({
    userId: '',
    resetPoints: false,
    resetCoins: false,
    resetWeeklyPoints: false,
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const [configRes, transactionsRes, usersRes] = await Promise.all([
        fetch(`${config.API_BASE}/api/points/config`, { headers }),
        fetch(`${config.API_BASE}/api/points/transactions/all?limit=50`, { headers }),
        fetch(`${config.API_BASE}/api/admin/users?limit=500`, { headers })
      ]);

      if (configRes.ok) {
        const configData = await configRes.json();
        setConfigs(configData.data.configs);
      }

      if (transactionsRes.ok) {
        const transactionData = await transactionsRes.json();
        setTransactions(transactionData.data.transactions);
      }

      if (usersRes.ok) {
        const userData = await usersRes.json();
        setUsers(userData.data.users || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigEdit = (configKey: string) => {
    setEditingConfig(configKey);
    setTempConfig({ ...configs[configKey] });
  };

  const handleConfigSave = async (configKey: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${config.API_BASE}/api/points/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          configKey,
          configValue: tempConfig,
          description: tempConfig.description
        })
      });

      if (response.ok) {
        setConfigs(prev => ({
          ...prev,
          [configKey]: { ...prev[configKey], ...tempConfig }
        }));
        setEditingConfig(null);
        setTempConfig({});
      }
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const handleAwardPoints = async () => {
    if (!awardForm.userId) {
      alert('Please select a user');
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${config.API_BASE}/api/points/award`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...awardForm,
          userId: parseInt(awardForm.userId),
          points: awardForm.points ? parseInt(awardForm.points) : 0,
          coins: awardForm.coins ? parseFloat(awardForm.coins) : 0
        })
      });

      if (response.ok) {
        setAwardForm({ userId: '', points: '', coins: '', description: '', transactionType: 'bonus' });
        setShowAwardForm(false);
        fetchData();
        alert('Points awarded successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to award points');
      }
    } catch (error) {
      console.error('Error awarding points:', error);
      alert('An error occurred while awarding points');
    }
  };

  const handleDeductPoints = async () => {
    if (!deductForm.userId) {
      alert('Please select a user');
      return;
    }

    if (!deductForm.points && !deductForm.coins) {
      alert('Please enter points or coins to deduct');
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${config.API_BASE}/api/point-system/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: parseInt(deductForm.userId),
          points: deductForm.points ? parseInt(deductForm.points) : 0,
          coins: deductForm.coins ? parseFloat(deductForm.coins) : 0,
          description: deductForm.description || 'Admin penalty deduction'
        })
      });

      if (response.ok) {
        setDeductForm({ userId: '', points: '', coins: '', description: '' });
        setShowDeductForm(false);
        fetchData();
        alert('Points/coins deducted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to deduct points');
      }
    } catch (error) {
      console.error('Error deducting points:', error);
      alert('An error occurred while deducting points');
    }
  };

  const handleResetPoints = async () => {
    if (!resetForm.userId) {
      alert('Please select a user');
      return;
    }

    if (!resetForm.resetPoints && !resetForm.resetCoins && !resetForm.resetWeeklyPoints) {
      alert('Please select at least one option to reset');
      return;
    }

    if (!confirm('Are you sure you want to reset this user\'s stats? This action cannot be undone.')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${config.API_BASE}/api/point-system/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: parseInt(resetForm.userId),
          resetPoints: resetForm.resetPoints,
          resetCoins: resetForm.resetCoins,
          resetWeeklyPoints: resetForm.resetWeeklyPoints,
          description: resetForm.description || 'Admin reset penalty'
        })
      });

      if (response.ok) {
        setResetForm({ userId: '', resetPoints: false, resetCoins: false, resetWeeklyPoints: false, description: '' });
        setShowResetForm(false);
        fetchData();
        alert('User stats reset successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to reset user stats');
      }
    } catch (error) {
      console.error('Error resetting user stats:', error);
      alert('An error occurred while resetting user stats');
    }
  };

  const renderConfigValue = (configKey: string, value: any) => {
    if (editingConfig === configKey) {
      if (configKey.includes('rewards') || configKey.includes('levels')) {
        return (
          <Textarea
            value={JSON.stringify(tempConfig, null, 2)}
            onChange={(e) => {
              try {
                setTempConfig(JSON.parse(e.target.value));
              } catch (err) {
                // Invalid JSON, keep the text
              }
            }}
            className="min-h-[200px] font-mono text-sm"
          />
        );
      } else if (typeof value === 'boolean') {
        return (
          <Switch
            checked={tempConfig.enabled || false}
            onCheckedChange={(checked) => setTempConfig((prev: Record<string, unknown>) => ({ ...prev, enabled: checked }))}
          />
        );
      } else if (typeof value === 'number') {
        return (
          <Input
            type="number"
            value={tempConfig.points || tempConfig.coins || tempConfig.daily_spins || 0}
            onChange={(e) => {
              const key = configKey.includes('points') ? 'points' :
                configKey.includes('coins') ? 'coins' : 'daily_spins';
              setTempConfig((prev: Record<string, unknown>) => ({ ...prev, [key]: parseInt(e.target.value) || 0 }));
            }}
          />
        );
      }
    } else {
      if (typeof value === 'object') {
        return (
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(value, null, 2)}
          </pre>
        );
      }
      return <span>{value}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading point system configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Point System Management</h1>
          <p className="text-gray-600">Configure rewards, bonuses, and user progression</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAwardForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Award Points
          </Button>
          <Button onClick={() => setShowDeductForm(true)} variant="destructive" className="flex items-center gap-2">
            <Minus className="w-4 h-4" />
            Deduct Points
          </Button>
          <Button onClick={() => setShowResetForm(true)} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset Stats
          </Button>
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(configs).map(([key, config]) => (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">
                      {key.replace(/_/g, ' ')}
                    </CardTitle>
                    <div className="flex gap-2">
                      {editingConfig === key ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConfigSave(key)}
                            className="flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingConfig(null);
                              setTempConfig({});
                            }}
                            className="flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfigEdit(key)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderConfigValue(key, config)}
                  <div className="mt-2 text-xs text-gray-500">
                    Updated: {new Date(config.updated_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>All point and coin transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          transaction.transaction_type === 'earned' ? 'default' :
                            transaction.transaction_type === 'spent' ? 'destructive' :
                              transaction.transaction_type === 'bonus' ? 'secondary' : 'outline'
                        }>
                          {transaction.transaction_type}
                        </Badge>
                        <span className="font-medium">{transaction.description}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        User ID: {transaction.user_id} • {new Date(transaction.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      {transaction.points_change !== 0 && (
                        <div className={`font-medium ${transaction.points_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.points_change > 0 ? '+' : ''}{transaction.points_change} pts
                        </div>
                      )}
                      {transaction.coins_change !== 0 && (
                        <div className={`font-medium ${transaction.coins_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.coins_change > 0 ? '+' : ''}${transaction.coins_change}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Total Points Awarded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {transactions.reduce((sum, t) => sum + (t.points_change > 0 ? t.points_change : 0), 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Total Coins Awarded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${transactions.reduce((sum, t) => sum + (t.coins_change > 0 ? Number(t.coins_change) : 0), 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Award Points Modal */}
      {showAwardForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Award Points & Coins</CardTitle>
              <CardDescription>Manually award points and coins to a user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="userId">Select User</Label>
                <Select
                  value={awardForm.userId}
                  onValueChange={(value) => setAwardForm(prev => ({ ...prev, userId: value }))}
                  disabled={users.length === 0}
                >
                  <SelectTrigger id="userId" className="w-full">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {users.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">No users available to select.</p>
                )}
              </div>

              <div>
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={awardForm.points}
                  onChange={(e) => setAwardForm(prev => ({ ...prev, points: e.target.value }))}
                  placeholder="Enter points to award"
                />
              </div>

              <div>
                <Label htmlFor="coins">Coins</Label>
                <Input
                  id="coins"
                  type="number"
                  step="0.01"
                  value={awardForm.coins}
                  onChange={(e) => setAwardForm(prev => ({ ...prev, coins: e.target.value }))}
                  placeholder="Enter coins to award"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={awardForm.description}
                  onChange={(e) => setAwardForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Reason for awarding points"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAwardPoints} className="flex-1">
                  Award Points
                </Button>
                <Button variant="outline" onClick={() => setShowAwardForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deduct Points Modal */}
      {showDeductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Deduct Points & Coins (Penalty)</CardTitle>
              <CardDescription>Remove points/coins from a user as penalty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="deductUserId">Select User</Label>
                <Select
                  value={deductForm.userId}
                  onValueChange={(value) => setDeductForm(prev => ({ ...prev, userId: value }))}
                  disabled={users.length === 0}
                >
                  <SelectTrigger id="deductUserId">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {users.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">No users available to select.</p>
                )}
              </div>

              <div>
                <Label htmlFor="deductPoints">Points to Deduct</Label>
                <Input
                  id="deductPoints"
                  type="number"
                  value={deductForm.points}
                  onChange={(e) => setDeductForm(prev => ({ ...prev, points: e.target.value }))}
                  placeholder="Enter points to deduct"
                />
              </div>

              <div>
                <Label htmlFor="deductCoins">Coins to Deduct</Label>
                <Input
                  id="deductCoins"
                  type="number"
                  step="0.01"
                  value={deductForm.coins}
                  onChange={(e) => setDeductForm(prev => ({ ...prev, coins: e.target.value }))}
                  placeholder="Enter coins to deduct"
                />
              </div>

              <div>
                <Label htmlFor="deductDescription">Reason</Label>
                <Textarea
                  id="deductDescription"
                  value={deductForm.description}
                  onChange={(e) => setDeductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Reason for penalty"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleDeductPoints} variant="destructive" className="flex-1">
                  Deduct
                </Button>
                <Button variant="outline" onClick={() => setShowDeductForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reset Stats Modal */}
      {showResetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reset User Stats</CardTitle>
              <CardDescription>Completely reset user points/coins (irreversible)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resetUserId">Select User</Label>
                <Select
                  value={resetForm.userId}
                  onValueChange={(value) => setResetForm(prev => ({ ...prev, userId: value }))}
                  disabled={users.length === 0}
                >
                  <SelectTrigger id="resetUserId">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {users.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">No users available to select.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>What to Reset:</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="resetPoints"
                    checked={resetForm.resetPoints}
                    onChange={(e) => setResetForm(prev => ({ ...prev, resetPoints: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="resetPoints">Total Points</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="resetCoins"
                    checked={resetForm.resetCoins}
                    onChange={(e) => setResetForm(prev => ({ ...prev, resetCoins: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="resetCoins">Total Coins</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="resetWeeklyPoints"
                    checked={resetForm.resetWeeklyPoints}
                    onChange={(e) => setResetForm(prev => ({ ...prev, resetWeeklyPoints: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="resetWeeklyPoints">Weekly Points</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="resetDescription">Reason</Label>
                <Textarea
                  id="resetDescription"
                  value={resetForm.description}
                  onChange={(e) => setResetForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Reason for reset"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleResetPoints} variant="destructive" className="flex-1">
                  Reset Stats
                </Button>
                <Button variant="outline" onClick={() => setShowResetForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
