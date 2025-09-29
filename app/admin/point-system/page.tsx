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
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  X
} from 'lucide-react';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [configRes, transactionsRes, usersRes] = await Promise.all([
        fetch('/api/points/config', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        }),
        fetch('/api/points/transactions/all?limit=50', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        }),
        fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        })
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
      const response = await fetch('/api/points/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
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
    try {
      const response = await fetch('/api/points/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(awardForm)
      });

      if (response.ok) {
        setAwardForm({ userId: '', points: '', coins: '', description: '', transactionType: 'bonus' });
        setShowAwardForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error awarding points:', error);
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
            onCheckedChange={(checked) => setTempConfig(prev => ({ ...prev, enabled: checked }))}
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
              setTempConfig(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }));
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
        <Button onClick={() => setShowAwardForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Award Points
        </Button>
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
                  ${transactions.reduce((sum, t) => sum + (t.coins_change > 0 ? parseFloat(t.coins_change) : 0), 0).toFixed(2)}
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
                <select
                  id="userId"
                  value={awardForm.userId}
                  onChange={(e) => setAwardForm(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
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
    </div>
  );
}
