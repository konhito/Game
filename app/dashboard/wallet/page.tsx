"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  ArrowLeft,
  DollarSign,
  Building2,
  Coins,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import config from '@/lib/config';

interface WithdrawalRequest {
  id: number;
  amount: string;
  payment_method: string;
  payment_details: any;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
}

export default function WalletPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [minWithdrawal, setMinWithdrawal] = useState(10);
  const [maxWithdrawal, setMaxWithdrawal] = useState(10000);
  const [pointsToCoinsRatio, setPointsToCoinsRatio] = useState(10);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    account_name: '',
    account_number: '',
    bank_name: '',
    routing_number: '',
    swift_code: '',
    iban: '',
    branch_code: '',
    branch_name: '',
    bank_address: '',
    account_type: '',
    notes: ''
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');
      
      if (!token || !userStr) {
        router.push('/sign-in');
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        fetchWithdrawalConfig();
        fetchUserStats();
        fetchWithdrawals();
      } catch (error) {
        console.error('Failed to parse user data:', error);
        router.push('/sign-in');
      }
    };

    checkAuth();
  }, [router]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${config.API_BASE}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalConfig = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${config.API_BASE}/api/withdrawals/config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.success && data?.data) {
          setMinWithdrawal(Number(data.data.min_withdrawal_amount || 10));
          setMaxWithdrawal(Number(data.data.max_withdrawal_amount || 10000));
          setPointsToCoinsRatio(Number(data.data.points_to_coins_ratio || 10));
        }
      }
    } catch (error) {
      console.error('Error fetching withdrawal config:', error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${config.API_BASE}/api/withdrawals/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.data.withdrawals || []);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      toast.error('Please enter the withdrawal amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Minimum withdrawal: ₽10 PineCoins
    if (amountNum < minWithdrawal) {
      toast.error(`Minimum withdrawal amount is ₽${minWithdrawal} PineCoins`);
      return;
    }

    if (amountNum > maxWithdrawal) {
      toast.error(`Maximum withdrawal amount is ₽${maxWithdrawal} PineCoins`);
      return;
    }

    if (!userStats || parseFloat(userStats.total_coins || 0) < amountNum) {
      toast.error('Insufficient PineCoins balance');
      return;
    }

    // Validate bank transfer details
    if (!paymentDetails.account_name || !paymentDetails.account_number || !paymentDetails.bank_name) {
      toast.error('Please fill in all required bank transfer details');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${config.API_BASE}/api/withdrawals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amountNum,
          payment_method: 'bank_transfer',
          payment_details: paymentDetails
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Withdrawal request submitted successfully!');
        setAmount('');
        setPaymentDetails({
          account_name: '',
          account_number: '',
          bank_name: '',
          routing_number: '',
          swift_code: '',
          iban: '',
          branch_code: '',
          branch_name: '',
          bank_address: '',
          account_type: '',
          notes: ''
        });
        fetchUserStats();
        fetchWithdrawals();
      } else {
        toast.error(data.error || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast.error('Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 transition-colors duration-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 transition-colors duration-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors duration-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200 transition-colors duration-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const currentBalance = parseFloat(userStats?.total_coins || 0);
  const pineCoinToUsd = 0.95;
  const usdEquivalent = (currentBalance * pineCoinToUsd).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-[1.01] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-white">
                  <Wallet className="w-6 h-6" />
                  Your Wallet
                </CardTitle>
                <CardDescription className="text-emerald-100">
                  Available PineCoins balance
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl sm:text-5xl font-bold mb-2 hover:scale-105 transition-transform duration-200">
                  ₽{currentBalance.toFixed(2)}
                </div>
                <div className="flex items-center gap-4 text-sm text-emerald-100">
                  <p>≈ ${usdEquivalent} USD</p>
                  <p>•</p>
                  <p>1 PineCoin = ₽1 = ${pineCoinToUsd}</p>
                </div>
                <p className="text-emerald-100 text-sm mt-2">Withdrawal range: ₽{minWithdrawal.toFixed(2)} to ₽{maxWithdrawal.toFixed(2)} PineCoins</p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Withdrawal Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    Request Withdrawal
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Fill out the bank transfer details below to request a withdrawal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-slate-700 font-medium">
                        Amount (PineCoins) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold">₽</span>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min={minWithdrawal}
                          max={Math.min(maxWithdrawal, currentBalance)}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder={minWithdrawal.toFixed(2)}
                          className="pl-8 border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                          required
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Available: ₽{currentBalance.toFixed(2)} | Min: ₽{minWithdrawal.toFixed(2)} | Max: ₽{maxWithdrawal.toFixed(2)} | ≈ ${(parseFloat(amount || '0') * pineCoinToUsd).toFixed(2)} USD
                      </p>
                    </div>

                    {/* Bank Transfer Details */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        Bank Transfer Details
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="account_name" className="text-slate-700 font-medium">
                            Account Holder Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="account_name"
                            value={paymentDetails.account_name}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, account_name: e.target.value })}
                            placeholder="John Doe"
                            className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="account_number" className="text-slate-700 font-medium">
                            Account Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="account_number"
                            value={paymentDetails.account_number}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, account_number: e.target.value })}
                            placeholder="1234567890"
                            className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bank_name" className="text-slate-700 font-medium">
                            Bank Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="bank_name"
                            value={paymentDetails.bank_name}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, bank_name: e.target.value })}
                            placeholder="Bank of America"
                            className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="routing_number" className="text-slate-700 font-medium">
                            Routing Number / Sort Code
                          </Label>
                          <Input
                            id="routing_number"
                            value={paymentDetails.routing_number}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, routing_number: e.target.value })}
                            placeholder="123456789"
                            className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="swift_code" className="text-slate-700 font-medium">
                            SWIFT Code / BIC
                          </Label>
                          <Input
                            id="swift_code"
                            value={paymentDetails.swift_code}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, swift_code: e.target.value })}
                            placeholder="SWIFTCODE123"
                            className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="iban" className="text-slate-700 font-medium">
                            IBAN
                          </Label>
                          <Input
                            id="iban"
                            value={paymentDetails.iban}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, iban: e.target.value })}
                            placeholder="GB82 WEST 1234 5698 7654 32"
                            className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="branch_code" className="text-slate-700 font-medium">
                            Branch Code
                          </Label>
                          <Input
                            id="branch_code"
                            value={paymentDetails.branch_code}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, branch_code: e.target.value })}
                            placeholder="12345"
                            className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="branch_name" className="text-slate-700 font-medium">
                            Branch Name
                          </Label>
                          <Input
                            id="branch_name"
                            value={paymentDetails.branch_name}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, branch_name: e.target.value })}
                            placeholder="Main Branch"
                            className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bank_address" className="text-slate-700 font-medium">
                            Bank Address
                          </Label>
                          <Textarea
                            id="bank_address"
                            value={paymentDetails.bank_address}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, bank_address: e.target.value })}
                            placeholder="Bank street address, City, Country"
                            className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="account_type" className="text-slate-700 font-medium">
                            Account Type
                          </Label>
                          <Input
                            id="account_type"
                            value={paymentDetails.account_type}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, account_type: e.target.value })}
                            placeholder="Savings / Checking"
                            className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bank_notes" className="text-slate-700 font-medium">
                            Additional Notes (Optional)
                          </Label>
                          <Textarea
                            id="bank_notes"
                            value={paymentDetails.notes}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, notes: e.target.value })}
                            placeholder="Any additional information about your bank account"
                            className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info Alert */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800">
                        Withdrawal requests are typically processed within 24-48 hours. You will be notified once your request is reviewed. 
                        <br />
                        <span className="font-medium">Exchange Rate:</span> 1 PineCoin = ₽1 = ${pineCoinToUsd} USD
                        <br />
                        <span className="font-medium">Reward Conversion:</span> {pointsToCoinsRatio} points = 1 PineCoin
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={submitting || currentBalance < minWithdrawal || !amount || !paymentDetails.account_name || !paymentDetails.account_number || !paymentDetails.bank_name}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Building2 className="w-4 h-4 mr-2" />
                          Submit Withdrawal Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Withdrawal History */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Withdrawal History
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Track your withdrawal requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {withdrawals.length === 0 ? (
                    <div className="text-center py-8">
                      <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No withdrawal requests yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {withdrawals.map((withdrawal) => (
                        <div
                          key={withdrawal.id}
                          className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 bg-slate-50 hover:bg-white"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-800">
                                ₽{parseFloat(withdrawal.amount).toFixed(2)} PineCoins
                              </p>
                              <p className="text-xs text-slate-500">
                                ≈ ${(parseFloat(withdrawal.amount) * pineCoinToUsd).toFixed(2)} USD
                              </p>
                              <p className="text-xs text-slate-500 capitalize mt-1">
                                Bank Transfer
                              </p>
                            </div>
                            {getStatusBadge(withdrawal.status)}
                          </div>
                          <div className="text-xs text-slate-500 mt-2">
                            <p>Requested: {new Date(withdrawal.created_at).toLocaleDateString()}</p>
                            {withdrawal.processed_at && (
                              <p>Processed: {new Date(withdrawal.processed_at).toLocaleDateString()}</p>
                            )}
                            {withdrawal.admin_notes && (
                              <p className="mt-2 text-slate-600 italic">
                                Note: {withdrawal.admin_notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
