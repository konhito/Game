"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Trophy, 
  Star, 
  Target, 
  Activity,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Edit,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import ProfileEditDialog from '@/components/profile-edit-dialog';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total_points: number;
  total_coins: number;
  tasks_completed: number;
  tasks_approved: number;
  tasks_rejected: number;
  current_streak: number;
  longest_streak: number;
  weekly_points: number;
  spins_remaining: number;
  last_task_date?: string;
  last_login_date?: string;
}

interface UserActivity {
  id: number;
  activity_type: string;
  description: string;
  metadata?: any;
  created_at: string;
}

interface CompletedTask {
  id: number;
  status: string;
  completed_at: string;
  task: {
    id: number;
    title: string;
    platform: string;
    task_type: string;
    reward_points: number;
    reward_coins: number;
  };
}

interface ProfileData {
  user: UserProfile;
  stats: UserStats;
  recent_activities: UserActivity[];
  completed_tasks: CompletedTask[];
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me'}/api/users/${userId}`, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('User not found');
        } else {
          setError('Failed to load user profile');
        }
        return;
      }

      const result = await response.json();
      setProfileData(result.data);

      // Check if this is the current user's own profile
      const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      setIsOwnProfile(currentUser.id === parseInt(userId));

    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdated = (updatedUser: UserProfile) => {
    if (profileData) {
      setProfileData({
        ...profileData,
        user: updatedUser
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'task_approved':
        return <Award className="h-4 w-4 text-blue-500" />;
      case 'task_rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'daily_login':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'wheel_spin':
        return <Target className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'twitter':
        return '🐦';
      case 'youtube':
        return '📺';
      case 'tiktok':
        return '🎵';
      default:
        return '📱';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <XCircle className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Profile Not Found</h1>
          <p className="text-slate-600 mb-6">{error || 'This user profile could not be loaded.'}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { user, stats, recent_activities, completed_tasks } = profileData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold text-slate-800">User Profile</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {isOwnProfile && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{user.name}</h2>
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="mb-4">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center justify-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.whatsapp && (
                      <div className="flex items-center justify-center space-x-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>{user.whatsapp}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(user.created_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{stats.total_points}</div>
                    <div className="text-sm text-slate-600">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total_coins}</div>
                    <div className="text-sm text-slate-600">PineCoins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.tasks_completed}</div>
                    <div className="text-sm text-slate-600">Tasks Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.current_streak}</div>
                    <div className="text-sm text-slate-600">Day Streak</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Approved Tasks</span>
                    <span className="font-medium">{stats.tasks_approved}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Longest Streak</span>
                    <span className="font-medium">{stats.longest_streak} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Weekly Points</span>
                    <span className="font-medium">{stats.weekly_points}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activities and Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  <span>Recent Activities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recent_activities.length > 0 ? (
                  <div className="space-y-3">
                    {recent_activities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        {getActivityIcon(activity.activity_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{activity.description}</p>
                          <p className="text-xs text-slate-500">{formatDateTime(activity.created_at)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No recent activities</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Recent Completed Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completed_tasks.length > 0 ? (
                  <div className="space-y-3">
                    {completed_tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                      >
                        <div className="text-2xl">{getPlatformIcon(task.task.platform)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{task.task.title}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span className="capitalize">{task.task.platform}</span>
                            <span className="capitalize">{task.task.task_type}</span>
                            <span>{formatDateTime(task.completed_at)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">+{task.task.reward_points}</div>
                          <div className="text-xs text-slate-500">points</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No completed tasks yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Profile Edit Dialog */}
      {profileData && (
        <ProfileEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          user={profileData.user}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
}
