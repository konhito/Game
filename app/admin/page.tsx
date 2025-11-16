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
  Trash2,
  Bot,
  Brain,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { taskService } from '@/lib/task-service';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
  ai_approved_submissions?: number;
  ai_rejected_submissions?: number;
  manual_approved_submissions?: number;
  manual_rejected_submissions?: number;
  ai_verification_rate?: number;
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('Please sign in to access the admin dashboard');
      setLoading(false);
      return;
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardStats} className="bg-emerald-600 hover:bg-emerald-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No dashboard data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const safeStats = {
    total_users: stats.total_users || 0,
    total_tasks: stats.total_tasks || 0,
    total_submissions: stats.total_submissions || 0,
    pending_submissions: stats.pending_submissions || 0,
    approved_submissions: stats.approved_submissions || 0,
    rejected_submissions: stats.rejected_submissions || 0,
    total_revenue: stats.total_revenue || 0,
    active_users_today: stats.active_users_today || 0,
    tasks_created_today: stats.tasks_created_today || 0,
    submissions_today: stats.submissions_today || 0,
    ai_approved_submissions: stats.ai_approved_submissions || 0,
    ai_rejected_submissions: stats.ai_rejected_submissions || 0,
    manual_approved_submissions: stats.manual_approved_submissions || 0,
    manual_rejected_submissions: stats.manual_rejected_submissions || 0,
    ai_verification_rate: stats.ai_verification_rate || 0,
    top_performing_users: stats.top_performing_users || [],
    recent_activities: stats.recent_activities || []
  };

  const approvalRate = safeStats.total_submissions > 0 
    ? Math.round((safeStats.approved_submissions / safeStats.total_submissions) * 100)
    : 0;

  const quickActions = [
    {
      title: "Review Proofs",
      description: `${safeStats.pending_submissions} pending`,
      href: "/admin/pending-proofs",
      icon: Eye,
      color: "blue",
      urgent: safeStats.pending_submissions > 0
    },
    {
      title: "Create Task",
      description: "Add new tasks",
      href: "/admin/create-task",
      icon: Plus,
      color: "emerald"
    },
    {
      title: "Manage Users",
      description: `${safeStats.total_users} users`,
      href: "/admin/users",
      icon: Users,
      color: "purple"
    },
    {
      title: "Manage Tasks",
      description: `${safeStats.total_tasks} tasks`,
      href: "/admin/tasks",
      icon: ClipboardList,
      color: "indigo"
    },
    {
      title: "Withdrawals",
      description: "Process requests",
      href: "/admin/withdrawals",
      icon: DollarSign,
      color: "emerald"
    },
    {
      title: "Activity Monitor",
      description: "Track activities",
      href: "/admin/activities",
      icon: Activity,
      color: "green"
    }
  ];

  const adminTools = [
    { title: "AI Verification", href: "/admin/ai-verification", icon: Bot, color: "purple" },
    { title: "Duplicate Images", href: "/admin/duplicate-images", icon: AlertTriangle, color: "orange" },
    { title: "Audit Log", href: "/admin/audit-log", icon: Shield, color: "red" },
    { title: "Prize Pools", href: "/admin/prize-pools", icon: BarChart3, color: "indigo" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
              <p className="text-slate-600">Monitor and manage your platform</p>
            </div>
            <Button
              onClick={fetchDashboardStats}
              variant="outline"
              size="sm"
              className="border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </motion.div>

          {/* Key Metrics - Compact Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs font-medium mb-1">Total Users</p>
                    <p className="text-2xl font-bold">{safeStats.total_users.toLocaleString()}</p>
                    <p className="text-blue-100 text-xs mt-1">+{safeStats.active_users_today} today</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-xs font-medium mb-1">Pending Reviews</p>
                    <p className="text-2xl font-bold">{safeStats.pending_submissions}</p>
                    <p className="text-emerald-100 text-xs mt-1">+{safeStats.submissions_today} today</p>
                  </div>
                  <Clock className="w-8 h-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs font-medium mb-1">Total Tasks</p>
                    <p className="text-2xl font-bold">{safeStats.total_tasks.toLocaleString()}</p>
                    <p className="text-purple-100 text-xs mt-1">+{safeStats.tasks_created_today} today</p>
                  </div>
                  <ClipboardList className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-xs font-medium mb-1">Revenue</p>
                    <p className="text-2xl font-bold">₽{safeStats.total_revenue.toLocaleString()}</p>
                    <p className="text-amber-100 text-xs mt-1">From tasks</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-amber-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const colorClasses = {
                  blue: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
                  emerald: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700",
                  purple: "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700",
                  indigo: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700",
                  green: "bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                };
                return (
                  <Link key={index} href={action.href}>
                    <Card className={`${colorClasses[action.color as keyof typeof colorClasses]} border-2 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer ${action.urgent ? 'ring-2 ring-orange-400' : ''}`}>
                      <CardContent className="p-4 text-center">
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${action.urgent ? 'animate-pulse' : ''}`} />
                        <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                        <p className="text-xs opacity-75">{action.description}</p>
                        {action.urgent && (
                          <Badge className="mt-2 bg-orange-500 text-white text-xs">Urgent</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Stats Overview - Collapsible Sections */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Submission Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      Submission Overview
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSection(expandedSection === 'submissions' ? null : 'submissions')}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowRight className={`w-4 h-4 transition-transform ${expandedSection === 'submissions' ? 'rotate-90' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900">{safeStats.total_submissions}</p>
                      <p className="text-xs text-slate-600 mt-1">Total</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{safeStats.approved_submissions}</p>
                      <p className="text-xs text-slate-600 mt-1">Approved</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{safeStats.rejected_submissions}</p>
                      <p className="text-xs text-slate-600 mt-1">Rejected</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Approval Rate</span>
                    <span className="text-lg font-bold text-emerald-600">{approvalRate}%</span>
                  </div>
                  {expandedSection === 'submissions' && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">AI Approved:</span>
                        <span className="font-semibold text-green-600">{safeStats.ai_approved_submissions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">AI Rejected:</span>
                        <span className="font-semibold text-red-600">{safeStats.ai_rejected_submissions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Manual Approved:</span>
                        <span className="font-semibold text-blue-600">{safeStats.manual_approved_submissions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">AI Verification Rate:</span>
                        <span className="font-semibold text-purple-600">{safeStats.ai_verification_rate}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Performers */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {safeStats.top_performing_users.length === 0 ? (
                    <p className="text-slate-500 text-center py-4 text-sm">No user data available</p>
                  ) : (
                    <div className="space-y-3">
                      {safeStats.top_performing_users.slice(0, 5).map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-amber-500 text-white' :
                              index === 1 ? 'bg-slate-400 text-white' :
                              index === 2 ? 'bg-amber-700 text-white' :
                              'bg-slate-200 text-slate-700'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{user.name}</p>
                              <p className="text-xs text-slate-600">{user.tasks_approved} tasks</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900 text-sm">{user.total_points.toLocaleString()} pts</p>
                            <p className="text-xs text-emerald-600">₽{user.total_coins.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                      <Link href="/admin/users">
                        <Button variant="outline" className="w-full mt-3 text-sm">
                          View All Users
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activities */}
          {safeStats.recent_activities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      Recent Activities
                    </CardTitle>
                    <Link href="/admin/activities">
                      <Button variant="ghost" size="sm" className="text-sm">
                        View All
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {safeStats.recent_activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{activity.user_name}</p>
                          <p className="text-sm text-slate-600">{activity.description}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Admin Tools */}
          {adminTools.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Admin Tools</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {adminTools.map((tool, index) => {
                  const Icon = tool.icon;
                  const colorClasses = {
                    purple: "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700",
                    orange: "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700",
                    red: "bg-red-50 hover:bg-red-100 border-red-200 text-red-700",
                    blue: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
                    indigo: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700",
                    slate: "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  };
                  return (
                    <Link key={index} href={tool.href}>
                      <Card className={`${colorClasses[tool.color as keyof typeof colorClasses]} border-2 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer`}>
                        <CardContent className="p-4 text-center">
                          <Icon className="w-5 h-5 mx-auto mb-2" />
                          <h3 className="font-medium text-xs">{tool.title}</h3>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
