"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ClipboardList, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Shield,
  BarChart3,
  Settings,
  Eye,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { taskService } from '@/lib/task-service';
import Link from 'next/link';

interface DashboardStats {
  total_users: number;
  total_tasks: number;
  total_submissions: number;
  pending_submissions: number;
  approved_submissions: number;
  rejected_submissions: number;
  total_revenue: number;
  active_users_today: number;
  tasks_created_today: number;
  submissions_today: number;
  top_performing_users: Array<{
    id: number;
    name: string;
    total_points: number;
    total_coins: number;
    tasks_approved: number;
  }>;
  recent_activities: Array<{
    id: number;
    user_name: string;
    activity_type: string;
    description: string;
    created_at: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await taskService.getAdminDashboardStats();
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
        <Button onClick={fetchDashboardStats} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the admin dashboard. Monitor and manage your platform from here.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/create-task">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Plus className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-medium">Create Task</h3>
                <p className="text-sm text-gray-600">Add new tasks</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/pending-proofs">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium">Review Proofs</h3>
                <p className="text-sm text-gray-600">{stats.pending_submissions} pending</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium">Manage Users</h3>
                <p className="text-sm text-gray-600">{stats.total_users} users</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/tasks">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <ClipboardList className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <h3 className="font-medium">Manage Tasks</h3>
                <p className="text-sm text-gray-600">{stats.total_tasks} tasks</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Key Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{stats.active_users_today}</span> active today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_tasks}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{stats.tasks_created_today}</span> created today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_submissions}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-orange-600">+{stats.submissions_today}</span> submitted today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₽{stats.total_revenue}</div>
              <p className="text-xs text-muted-foreground">
                From approved tasks
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submission Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Submission Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_submissions}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {stats.approved_submissions} approved
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <XCircle className="h-3 w-3 mr-1" />
                  {stats.rejected_submissions} rejected
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_submissions > 0 
                  ? Math.round((stats.approved_submissions / stats.total_submissions) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.approved_submissions} out of {stats.total_submissions} submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending_submissions}</div>
              <p className="text-xs text-muted-foreground">
                Require admin attention
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Users */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Top Performing Users</h2>
          <Card>
            <CardContent className="p-6">
              {stats.top_performing_users.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No user data available</p>
              ) : (
                <div className="space-y-4">
                  {stats.top_performing_users.slice(0, 5).map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-medium text-emerald-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.tasks_approved} tasks approved</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{user.total_points} pts</p>
                        <p className="text-sm text-gray-600">₽{user.total_coins}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full">
                    View All Users
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          <Card>
            <CardContent className="p-6">
              {stats.recent_activities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activities</p>
              ) : (
                <div className="space-y-4">
                  {stats.recent_activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.user_name}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <Link href="/admin/activities">
                  <Button variant="outline" className="w-full">
                    View All Activities
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/tasks">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <ClipboardList className="h-6 w-6 text-indigo-600" />
                  <div>
                    <h3 className="font-medium">Task Management</h3>
                    <p className="text-sm text-gray-600">Create, edit, and manage tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/pending-proofs">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Eye className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Proof Review</h3>
                    <p className="text-sm text-gray-600">Review and approve task submissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  <div>
                    <h3 className="font-medium">User Management</h3>
                    <p className="text-sm text-gray-600">Manage user accounts and roles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/activities">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Activity className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-medium">Activity Monitor</h3>
                    <p className="text-sm text-gray-600">Track user activities and system events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/audit-log">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="font-medium">Audit Log</h3>
                    <p className="text-sm text-gray-600">Monitor admin actions and changes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/create-task">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Plus className="h-6 w-6 text-emerald-600" />
                  <div>
                    <h3 className="font-medium">Create Task</h3>
                    <p className="text-sm text-gray-600">Add new tasks to the platform</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
