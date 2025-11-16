"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Wallet,
  ArrowLeft,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  AlertCircle,
  CreditCard,
  Building2,
  Coins
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import config from '@/lib/config';

interface WithdrawalRequest {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  amount: string;
  payment_method: string;
  payment_details: any;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  admin_notes?: string;
  processed_by?: number;
  processed_at?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    transaction_id: '',
    admin_notes: ''
  });
  const [rejectForm, setRejectForm] = useState({
    admin_notes: ''
  });

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const url = statusFilter === 'all' 
        ? `${config.API_BASE}/api/withdrawals/all`
        : `${config.API_BASE}/api/withdrawals/all?status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.data.withdrawals || []);
      } else {
        toast.error('Failed to fetch withdrawal requests');
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to fetch withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Are you sure you want to approve this withdrawal request? This will deduct the amount from the user\'s balance.')) {
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${config.API_BASE}/api/withdrawals/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Withdrawal request approved successfully');
        fetchWithdrawals();
      } else {
        toast.error(data.error || 'Failed to approve withdrawal request');
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast.error('Failed to approve withdrawal request');
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedWithdrawal) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${config.API_BASE}/api/withdrawals/${selectedWithdrawal.id}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: completeForm.transaction_id || undefined,
          admin_notes: completeForm.admin_notes || undefined
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Withdrawal request marked as completed');
        setShowCompleteDialog(false);
        setCompleteForm({ transaction_id: '', admin_notes: '' });
        fetchWithdrawals();
      } else {
        toast.error(data.error || 'Failed to complete withdrawal request');
      }
    } catch (error) {
      console.error('Error completing withdrawal:', error);
      toast.error('Failed to complete withdrawal request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${config.API_BASE}/api/withdrawals/${selectedWithdrawal.id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_notes: rejectForm.admin_notes || undefined
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Withdrawal request rejected');
        setShowRejectDialog(false);
        setRejectForm({ admin_notes: '' });
        fetchWithdrawals();
      } else {
        toast.error(data.error || 'Failed to reject withdrawal request');
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast.error('Failed to reject withdrawal request');
    } finally {
      setProcessing(false);
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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'paypal':
        return <CreditCard className="w-4 h-4" />;
      case 'bank_transfer':
        return <Building2 className="w-4 h-4" />;
      case 'crypto':
        return <Coins className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
  const approvedCount = withdrawals.filter(w => w.status === 'approved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Withdrawal Management</h1>
                  <p className="text-slate-600 text-sm">Manage user withdrawal requests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Approved</p>
                    <p className="text-2xl font-bold text-blue-600">{approvedCount}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Requests</p>
                    <p className="text-2xl font-bold text-slate-800">{withdrawals.length}</p>
                  </div>
                  <Wallet className="w-8 h-8 text-slate-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <Card className="bg-white border-slate-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Label className="text-slate-700 font-medium">Filter by Status:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchWithdrawals}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <Loader2 className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawals List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : withdrawals.length === 0 ? (
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardContent className="p-12 text-center">
                <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No withdrawal requests found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <Card
                  key={withdrawal.id}
                  className="bg-white border-slate-200 shadow-lg hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getPaymentMethodIcon(withdrawal.payment_method)}
                          <div>
                            <p className="font-bold text-lg text-slate-900">
                              ₽{parseFloat(withdrawal.amount).toFixed(2)} PineCoins
                            </p>
                            <p className="text-xs text-slate-500">
                              ≈ ${(parseFloat(withdrawal.amount) * 0.95).toFixed(2)} USD
                            </p>
                            <p className="text-sm text-slate-600 capitalize mt-1">
                              {withdrawal.payment_method.replace('_', ' ')}
                            </p>
                          </div>
                          {getStatusBadge(withdrawal.status)}
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                          <p><span className="font-medium">User:</span> {withdrawal.user_name || 'Unknown'} ({withdrawal.user_email || 'N/A'})</p>
                          <p><span className="font-medium">Requested:</span> {new Date(withdrawal.created_at).toLocaleString()}</p>
                          {withdrawal.processed_at && (
                            <p><span className="font-medium">Processed:</span> {new Date(withdrawal.processed_at).toLocaleString()}</p>
                          )}
                          {withdrawal.transaction_id && (
                            <p><span className="font-medium">Transaction ID:</span> {withdrawal.transaction_id}</p>
                          )}
                          {withdrawal.admin_notes && (
                            <p className="text-slate-700 italic"><span className="font-medium">Notes:</span> {withdrawal.admin_notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setShowDetailsDialog(true);
                          }}
                          className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        {withdrawal.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(withdrawal.id)}
                              disabled={processing}
                              className="bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
                            >
                              {processing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setShowRejectDialog(true);
                              }}
                              disabled={processing}
                              className="hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        {withdrawal.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setShowCompleteDialog(true);
                            }}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700 text-white hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Details Dialog */}
          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="max-w-2xl bg-white">
              <DialogHeader>
                <DialogTitle>Withdrawal Request Details</DialogTitle>
                <DialogDescription>
                  View complete withdrawal request information
                </DialogDescription>
              </DialogHeader>
              {selectedWithdrawal && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600">Amount</Label>
                      <p className="font-bold text-lg">₽{parseFloat(selectedWithdrawal.amount).toFixed(2)} PineCoins</p>
                      <p className="text-sm text-slate-500">≈ ${(parseFloat(selectedWithdrawal.amount) * 0.95).toFixed(2)} USD</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
                    </div>
                    <div>
                      <Label className="text-slate-600">Payment Method</Label>
                      <p className="capitalize">{selectedWithdrawal.payment_method.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">User</Label>
                      <p>{selectedWithdrawal.user_name || 'Unknown'}</p>
                      <p className="text-sm text-slate-500">{selectedWithdrawal.user_email}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-600">Payment Details</Label>
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedWithdrawal.payment_details, null, 2)}
                      </pre>
                    </div>
                  </div>
                  {selectedWithdrawal.admin_notes && (
                    <div>
                      <Label className="text-slate-600">Admin Notes</Label>
                      <p className="mt-1 text-slate-700">{selectedWithdrawal.admin_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Complete Dialog */}
          <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Mark Withdrawal as Completed</DialogTitle>
                <DialogDescription>
                  Enter transaction details after sending the payment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction_id">Transaction ID (Optional)</Label>
                  <Input
                    id="transaction_id"
                    value={completeForm.transaction_id}
                    onChange={(e) => setCompleteForm({ ...completeForm, transaction_id: e.target.value })}
                    placeholder="e.g., TXN123456789"
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complete_notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="complete_notes"
                    value={completeForm.admin_notes}
                    onChange={(e) => setCompleteForm({ ...completeForm, admin_notes: e.target.value })}
                    placeholder="Add any notes about this transaction"
                    className="border-slate-300"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCompleteDialog(false);
                    setCompleteForm({ transaction_id: '', admin_notes: '' });
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Completed
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reject Dialog */}
          <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Reject Withdrawal Request</DialogTitle>
                <DialogDescription>
                  Provide a reason for rejecting this withdrawal request
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reject_notes">Rejection Reason</Label>
                  <Textarea
                    id="reject_notes"
                    value={rejectForm.admin_notes}
                    onChange={(e) => setRejectForm({ ...rejectForm, admin_notes: e.target.value })}
                    placeholder="Enter the reason for rejection"
                    className="border-slate-300"
                    rows={4}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectForm({ admin_notes: '' });
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={processing || !rejectForm.admin_notes.trim()}
                  variant="destructive"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Request
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

