"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bot, 
  Eye, 
  Search, 
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  User,
  Calendar,
  TrendingUp,
  Settings,
  Download,
  ArrowLeft,
  Brain,
  Shield,
  Activity
} from 'lucide-react';
import { taskService } from '@/lib/task-service';
import Link from 'next/link';
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
import { toast } from 'sonner';

interface AIVerificationRecord {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  task_id: number;
  task_title: string;
  task_platform: string;
  status: 'approved' | 'rejected' | 'pending' | 'failed';
  ai_verified: boolean;
  ai_confidence: number;
  ai_reason: string;
  ai_response_time: number;
  proof_image: string;
  proof_description: string;
  admin_notes: string;
  reviewed_by: number;
  reviewed_at: string;
  created_at: string;
  error_message?: string;
  retry_count: number;
}

interface AIVerificationStats {
  total_verifications: number;
  ai_approved: number;
  ai_rejected: number;
  ai_failed: number;
  manual_reviewed: number;
  average_confidence: number;
  average_response_time: number;
  success_rate: number;
  error_rate: number;
}

export default function AIVerificationPage() {
  const [verifications, setVerifications] = useState<AIVerificationRecord[]>([]);
  const [stats, setStats] = useState<AIVerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<AIVerificationRecord | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAIVerifications();
  }, []);

  const fetchAIVerifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would be a new API endpoint for AI verification records
      const result = await taskService.getAIVerificationRecords({
        page: 1,
        limit: 100,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        confidence_min: confidenceFilter !== 'all' ? parseInt(confidenceFilter) : undefined
      });
      
      if (result.success) {
        setVerifications(result.data.verifications || []);
        setStats(result.data.stats || null);
      } else {
        setError(result.error || 'Failed to fetch AI verification records');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI verification records');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAIVerifications();
    setRefreshing(false);
  };

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = 
      verification.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const openImageDialog = (verification: AIVerificationRecord) => {
    setSelectedVerification(verification);
    setShowImageDialog(true);
  };

  const closeImageDialog = () => {
    setShowImageDialog(false);
    setSelectedVerification(null);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-lg">Loading AI verification records...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Verification Monitor</h1>
          <p className="text-gray-600">
            Monitor AI verification performance, user submissions, and system health
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Statistics Overview */}
      {stats && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">AI Verification Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
                <Bot className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_verifications}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stats.success_rate}%</span> success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.ai_approved}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.average_confidence.toFixed(1)}% avg confidence
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.ai_rejected}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.average_response_time.toFixed(0)}ms avg response
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Failed</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.ai_failed}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">{stats.error_rate}%</span> error rate
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by user, task, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-gray-200"
            />
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        <div className="flex space-x-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 rounded-xl border-gray-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
            <SelectTrigger className="w-40 rounded-xl border-gray-200">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="90">90%+ High</SelectItem>
              <SelectItem value="70">70%+ Medium</SelectItem>
              <SelectItem value="50">50%+ Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Verification Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Verification Records ({filteredVerifications.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVerifications.map((verification) => (
              <div 
                key={verification.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  {/* User Image/Icon */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {verification.proof_image ? (
                      <img
                        src={verification.proof_image.startsWith('data:') 
                          ? verification.proof_image 
                          : `https://casino-backend-obvo.onrender.com/${verification.proof_image}`
                        }
                        alt="Proof"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => openImageDialog(verification)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{verification.user_name}</h3>
                      <Badge className={`${getStatusColor(verification.status)} rounded-lg`}>
                        {verification.status}
                      </Badge>
                      {verification.ai_verified && (
                        <Badge variant="outline" className="text-xs">
                          <Bot className="h-3 w-3 mr-1" />
                          AI Verified
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Task:</strong> {verification.task_title} ({verification.task_platform})
                    </p>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      <strong>Description:</strong> {verification.proof_description}
                    </p>

                    {/* AI Response Details */}
                    {verification.ai_verified && (
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Confidence:</span>
                          <span className={`font-medium ${getConfidenceColor(verification.ai_confidence)}`}>
                            {verification.ai_confidence}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Response Time:</span>
                          <span className="font-medium">{verification.ai_response_time}ms</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500">Retries:</span>
                          <span className="font-medium">{verification.retry_count}</span>
                        </div>
                      </div>
                    )}

                    {/* AI Reason */}
                    {verification.ai_reason && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <strong>AI Reason:</strong> {verification.ai_reason}
                      </div>
                    )}

                    {/* Error Message */}
                    {verification.error_message && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                        <strong>Error:</strong> {verification.error_message}
                      </div>
                    )}

                    {/* Admin Notes */}
                    {verification.admin_notes && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <strong>Admin Notes:</strong> {verification.admin_notes}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(verification.created_at).toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{verification.user_email}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => openImageDialog(verification)}
                      className="rounded-lg"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Image
                    </Button>
                    {verification.status === 'failed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="rounded-lg text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVerifications.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No AI verification records found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image View Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Proof Image & AI Analysis</DialogTitle>
            <DialogDescription>
              View the uploaded proof image and AI verification details
            </DialogDescription>
          </DialogHeader>
          
          {selectedVerification && (
            <div className="space-y-6">
              {/* Image */}
              <div>
                <Label className="text-sm font-medium">Proof Image</Label>
                <div className="mt-2">
                  <img
                    src={selectedVerification.proof_image.startsWith('data:') 
                      ? selectedVerification.proof_image 
                      : `https://casino-backend-obvo.onrender.com/${selectedVerification.proof_image}`
                    }
                    alt="Proof"
                    className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              {/* AI Analysis */}
              {selectedVerification.ai_verified && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">AI Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className={`font-medium ${getConfidenceColor(selectedVerification.ai_confidence)}`}>
                          {selectedVerification.ai_confidence}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span className="font-medium">{selectedVerification.ai_response_time}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retry Count:</span>
                        <span className="font-medium">{selectedVerification.retry_count}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">AI Reasoning</h4>
                    <p className="text-sm text-blue-700">{selectedVerification.ai_reason}</p>
                  </div>
                </div>
              )}

              {/* Error Details */}
              {selectedVerification.error_message && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Error Details</h4>
                  <p className="text-sm text-red-700">{selectedVerification.error_message}</p>
                </div>
              )}

              {/* User Details */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">User & Task Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>User:</strong> {selectedVerification.user_name}</p>
                    <p><strong>Email:</strong> {selectedVerification.user_email}</p>
                  </div>
                  <div>
                    <p><strong>Task:</strong> {selectedVerification.task_title}</p>
                    <p><strong>Platform:</strong> {selectedVerification.task_platform}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeImageDialog} className="rounded-xl">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
