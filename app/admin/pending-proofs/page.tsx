"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ClipboardList, 
  Search, 
  Filter,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Eye,
  ArrowLeft,
  TrendingUp,
  Clock,
  Image as ImageIcon,
  AlertCircle
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

interface Submission {
  id: number;
  status: string;
  proof_image: string;
  proof_description: string;
  completed_at: string;
  started_at: string;
  submission_count: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  task: {
    id: number;
    title: string;
    platform: string;
    task_type: string;
    reward_points: number;
    reward_coins: number;
    requirements: string;
  };
}

export default function PendingProofsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage, platformFilter, taskTypeFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await taskService.getPendingSubmissions({
        page: currentPage,
        limit: 20,
        platform: platformFilter === 'all' ? undefined : platformFilter,
        task_type: taskTypeFilter === 'all' ? undefined : taskTypeFilter
      });
      if (result.success) {
        setSubmissions(result.data.submissions || []);
        setTotalPages(result.data.pagination?.pages || 1);
      } else {
        setError(result.error || 'Failed to fetch submissions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.task.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.task.task_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openReviewDialog = (submission: Submission, action: 'approve' | 'reject') => {
    setSelectedSubmission(submission);
    setReviewAction(action);
    setAdminNotes('');
    setShowReviewDialog(true);
  };

  const closeReviewDialog = () => {
    setShowReviewDialog(false);
    setSelectedSubmission(null);
    setReviewAction(null);
    setAdminNotes('');
  };

  const handleReview = async () => {
    if (!selectedSubmission || !reviewAction) return;

    try {
      setReviewing(true);
      let result;

      if (reviewAction === 'approve') {
        result = await taskService.approveSubmission(selectedSubmission.id, adminNotes);
      } else {
        result = await taskService.rejectSubmission(selectedSubmission.id, adminNotes);
      }

      if (result.success) {
        toast.success(`Submission ${reviewAction}d successfully!`);
        // Remove the reviewed submission from the list
        setSubmissions(submissions.filter(s => s.id !== selectedSubmission.id));
        closeReviewDialog();
        
        // Refresh the list
        if (submissions.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchSubmissions();
        }
      } else {
        toast.error(result.error || `Failed to ${reviewAction} submission`);
      }
    } catch (err) {
      toast.error(`Failed to ${reviewAction} submission`);
    } finally {
      setReviewing(false);
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchSubmissions();
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 bg-slate-200 rounded-lg w-64 mb-2 animate-pulse"></div>
              <div className="h-5 bg-slate-200 rounded-lg w-96 animate-pulse"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="bg-white/80 border-slate-200/50 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-slate-200 rounded w-16 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded w-20 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters Skeleton */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="h-10 bg-slate-200 rounded w-64 animate-pulse"></div>
              <div className="h-10 bg-slate-200 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-slate-200 rounded w-32 animate-pulse"></div>
            </div>

            {/* Submissions List Skeleton */}
            <Card className="bg-white/80 border-slate-200/50 shadow-lg">
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded w-48 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="border rounded-lg p-6 bg-slate-50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="h-5 bg-slate-200 rounded w-48 mb-2 animate-pulse"></div>
                          <div className="h-4 bg-slate-200 rounded w-32 mb-2 animate-pulse"></div>
                          <div className="h-3 bg-slate-200 rounded w-24 animate-pulse"></div>
                        </div>
                        <div className="h-6 bg-slate-200 rounded-full w-20 animate-pulse"></div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="h-48 bg-slate-200 rounded-lg animate-pulse"></div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                          <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                          <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                          <div className="flex gap-2 mt-4">
                            <div className="h-9 bg-slate-200 rounded w-20 animate-pulse"></div>
                            <div className="h-9 bg-slate-200 rounded w-20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Proofs Review</h1>
        <p className="text-gray-600">
          Review and approve/reject task submissions from users ({submissions.length} pending)
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by user name, task title, platform, or task type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={platformFilter} onValueChange={(value) => { setPlatformFilter(value); handleFilterChange(); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
          <Select value={taskTypeFilter} onValueChange={(value) => { setTaskTypeFilter(value); handleFilterChange(); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Task Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="like">Like</SelectItem>
              <SelectItem value="share">Share</SelectItem>
              <SelectItem value="follow">Follow</SelectItem>
              <SelectItem value="comment">Comment</SelectItem>
              <SelectItem value="subscribe">Subscribe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
                    <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pending submissions found</p>
              <p className="text-gray-400 mt-2">All submissions have been reviewed</p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* User and Task Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">User Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{submission.user.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{submission.user.email}</p>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Submitted: {new Date(submission.completed_at).toLocaleString()}
                          </span>
                        </div>
                        {submission.submission_count > 1 && (
                          <Badge variant="outline" className="text-xs">
                            Attempt #{submission.submission_count}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Task Information</h3>
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">{submission.task.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {submission.task.platform}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {submission.task.task_type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{submission.task.reward_points} pts</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>₽{submission.task.reward_coins}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Proof Image */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Proof Image</h3>
                    {submission.proof_image ? (
                      <div className="relative">
                        <img
                          src={submission.proof_image.startsWith('data:') 
                            ? submission.proof_image 
                            : `https://pinecrest.konhito.me/${submission.proof_image}`
                          }
                          alt="Task proof"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                          onClick={() => window.open(submission.proof_image.startsWith('data:') 
                            ? submission.proof_image 
                            : `https://pinecrest.konhito.me/${submission.proof_image}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Full
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No image provided</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Proof Description and Actions */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Proof Description</h3>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          {submission.proof_description || 'No description provided'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Task Requirements</h3>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          {submission.task.requirements}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => openReviewDialog(submission, 'approve')}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => openReviewDialog(submission, 'reject')}
                        variant="destructive"
                        className="w-full"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Submission' : 'Reject Submission'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? 'Are you sure you want to approve this submission? The user will receive their rewards.'
                : 'Are you sure you want to reject this submission? Please provide a reason.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-notes">Admin Notes</Label>
              <Textarea
                id="admin-notes"
                placeholder={reviewAction === 'approve' 
                  ? 'Optional notes for the user...' 
                  : 'Reason for rejection (required)'
                }
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="mt-1"
                rows={3}
                required={reviewAction === 'reject'}
              />
            </div>
            
            {reviewAction === 'reject' && !adminNotes.trim() && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">Please provide a reason for rejection</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeReviewDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={reviewing || (reviewAction === 'reject' && !adminNotes.trim())}
              className={reviewAction === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {reviewing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
              ) : (
                <>
                  {reviewAction === 'approve' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
