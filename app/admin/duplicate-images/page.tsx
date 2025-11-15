"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Users, 
  Image as ImageIcon,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Hash,
  Copy,
  ExternalLink
} from 'lucide-react';
import { taskService } from '@/lib/task-service';
import Link from 'next/link';
import { toast } from 'sonner';

interface DuplicateImage {
  hash: string;
  count: number;
  submissions: Array<{
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    task_title: string;
    task_platform: string;
    task_type: string;
    status: string;
    completed_at: string;
    proof_image: string;
    proof_description: string;
    admin_notes: string;
  }>;
}

interface DuplicateStats {
  totalImages: number;
  duplicateImages: number;
  uniqueHashes: number;
  duplicateRate: number;
}

export default function DuplicateImagesPage() {
  const [duplicateImages, setDuplicateImages] = useState<DuplicateImage[]>([]);
  const [stats, setStats] = useState<DuplicateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);

  useEffect(() => {
    fetchDuplicateImages();
  }, []);

  const fetchDuplicateImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/duplicate-images', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch duplicate images');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setDuplicateImages(result.data.duplicateImages);
        setStats(result.data.stats);
      } else {
        setError(result.error || 'Failed to fetch duplicate images');
      }
    } catch (err) {
      console.error('Error fetching duplicate images:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch duplicate images');
    } finally {
      setLoading(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success('Hash copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="bg-white/80 border-slate-200/50 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-slate-200 rounded w-16 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-slate-200 rounded w-24 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Duplicate Images Grid Skeleton */}
            <Card className="bg-white/80 border-slate-200/50 shadow-lg">
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded w-48 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-slate-50">
                      <div className="h-48 bg-slate-200 rounded-lg mb-4 animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                        <div className="flex gap-2 mt-3">
                          <div className="h-8 bg-slate-200 rounded w-20 animate-pulse"></div>
                          <div className="h-8 bg-slate-200 rounded w-20 animate-pulse"></div>
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

  if (error) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
        <Button onClick={fetchDuplicateImages} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Duplicate Images</h1>
            <p className="text-gray-600">
              Monitor and review duplicate image submissions across users
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={fetchDuplicateImages} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link href="/admin">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Duplicate Image Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Images</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalImages}</div>
                <p className="text-xs text-muted-foreground">
                  All submitted images
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duplicate Images</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.duplicateImages}</div>
                <p className="text-xs text-muted-foreground">
                  Images used multiple times
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Images</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.uniqueHashes}</div>
                <p className="text-xs text-muted-foreground">
                  Unique image hashes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duplicate Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.duplicateRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Percentage of duplicates
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Duplicate Images List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Duplicate Image Groups</h2>
        
        {duplicateImages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No duplicate images found</p>
              <p className="text-gray-400 mt-2">All submitted images are unique</p>
            </CardContent>
          </Card>
        ) : (
          duplicateImages.map((group) => (
            <Card key={group.hash} className="border-orange-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <CardTitle className="text-lg">
                        Duplicate Image Group ({group.count} submissions)
                      </CardTitle>
                      <p className="text-sm text-gray-600 font-mono">
                        Hash: {group.hash.substring(0, 16)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyHash(group.hash)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Hash
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedHash(
                        selectedHash === group.hash ? null : group.hash
                      )}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {selectedHash === group.hash ? 'Hide' : 'View'} Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {selectedHash === group.hash && (
                <CardContent>
                  <div className="space-y-4">
                    {group.submissions.map((submission, index) => (
                      <div key={submission.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          {/* Image Preview */}
                          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {submission.proof_image ? (
                              <img
                                src={submission.proof_image.startsWith('data:') 
                                  ? submission.proof_image 
                                  : `https://pinecrest.up.railway.app/${submission.proof_image}`
                                }
                                alt="Proof"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Submission Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={`${getStatusColor(submission.status)} rounded-lg`}>
                                {getStatusIcon(submission.status)}
                                <span className="ml-1">{submission.status}</span>
                              </Badge>
                              <span className="text-sm text-gray-500">
                                #{submission.id}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><strong>User:</strong> {submission.user_name}</p>
                                <p><strong>Email:</strong> {submission.user_email}</p>
                                <p><strong>Task:</strong> {submission.task_title}</p>
                              </div>
                              <div>
                                <p><strong>Platform:</strong> {submission.task_platform}</p>
                                <p><strong>Type:</strong> {submission.task_type}</p>
                                <p><strong>Submitted:</strong> {new Date(submission.completed_at).toLocaleString()}</p>
                              </div>
                            </div>
                            
                            {submission.proof_description && (
                              <div className="mt-2">
                                <p><strong>Description:</strong></p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  {submission.proof_description}
                                </p>
                              </div>
                            )}
                            
                            {submission.admin_notes && (
                              <div className="mt-2">
                                <p><strong>Admin Notes:</strong></p>
                                <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                                  {submission.admin_notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
