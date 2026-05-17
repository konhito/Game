"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Activity, 
  Search, 
  Filter,
  Calendar,
  User,
  ClipboardList,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  ArrowLeft,
  Eye,
  Download,
  Plus,
  Play,
  Upload,
  Check,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Star,
  Target,
  Zap,
  Award,
  Info,
  FileText,
  Sparkles,
  Trophy,
  Rocket
} from 'lucide-react';
import { taskService } from '@/lib/task-service';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { coinEventEmitter } from '@/lib/coin-event-emitter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TaskActivity {
  id: number;
  title: string;
  platform: string;
  task_type: string;
  status: string;
  reward_points: number;
  reward_coins: number;
  created_at: string;
  completed_at?: string;
  user_name: string;
  proof_image?: string;
  proof_description?: string;
  admin_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  url?: string;
  ai_verification?: {
    verified: boolean;
    confidence: number;
    reason: string;
    provider?: 'openai' | 'gemini' | 'basic';
  };
}

interface AvailableTask {
  id: number;
  title: string;
  description: string;
  platform: string;
  task_type: string;
  requirements: string;
  reward_points: number;
  reward_coins: number;
  max_participants?: number;
  current_participants: number;
  status: string;
  deadline?: string;
  url?: string;
  created_at: string;
}

type TaskItem = AvailableTask | (TaskActivity & { description?: string; requirements?: string });

export default function ActivitiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [proofImages, setProofImages] = useState<Record<number, File | null>>({});
  const [proofDescriptions, setProofDescriptions] = useState<Record<number, string>>({});
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [uploadingTasks, setUploadingTasks] = useState<Record<number, boolean>>({});
  const [startingTask, setStartingTask] = useState(false);
  const [refreshingTasks, setRefreshingTasks] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'started' | 'completed'>('all');
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (!token || !userStr) {
      router.push('/sign-in');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      loadAllTasks(userData.id);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      router.push('/sign-in');
    }
  }, [router]);

  const loadAllTasks = async (userId: number) => {
    try {
      setLoading(true);
      setRefreshingTasks(true);
      setError(null);
      
      const [availableResult, historyResult] = await Promise.all([
        taskService.getAvailableTasks({ limit: 50 }),
        taskService.getUserTaskHistory({ limit: 50 })
      ]);

      const available = availableResult.success ? (availableResult.data.tasks || []) : [];
      const history = historyResult.success ? (historyResult.data.tasks || []) : [];

      // Map history tasks to include full task details if available
      const startedAndCompletedTasks = history.map((ht: TaskActivity) => {
        const taskId = (ht as any).task_id || ht.id;
        const correspondingAvailableTask = available.find(at => at.id === taskId);
        return {
          ...correspondingAvailableTask,
          ...ht,
          id: taskId,
          status: ht.status?.toLowerCase().trim() || 'started',
          description: correspondingAvailableTask?.description || (ht as any).description,
          requirements: correspondingAvailableTask?.requirements || '',
          url: correspondingAvailableTask?.url || (ht as any).url,
        };
      });

      // Filter out tasks from 'available' that are already 'started' or 'completed' in history
      const uniqueAvailableTasks = available.filter(at => {
        const taskId = at.id;
        const hasHistory = startedAndCompletedTasks.some(st => {
          const stId = st.id;
          const stStatus = st.status?.toLowerCase().trim();
          return stId === taskId && (stStatus === 'started' || stStatus === 'pending' || stStatus === 'approved' || stStatus === 'rejected');
        });
        return !hasHistory;
      }).map(at => ({ ...at, status: 'available' }));

      const combinedTasksMap = new Map<number, TaskItem>();
      [...uniqueAvailableTasks, ...startedAndCompletedTasks].forEach(task => {
        combinedTasksMap.set(task.id, task);
      });

      const finalTasks = Array.from(combinedTasksMap.values());
      setAllTasks(finalTasks);
    } catch (err) {
      console.error('Error loading all tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshingTasks(false);
    }
  };

  const handleImageUpload = (taskId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setProofImages(prev => ({ ...prev, [taskId]: file }));
      setError(null);
    }
  };

  const handleDialogImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTask) return;
    handleImageUpload(selectedTask.id, event);
  };

  const openProofDialog = (task: TaskItem) => {
    setSelectedTask(task);
    setShowProofDialog(true);
  };

  const closeProofDialog = () => {
    setShowProofDialog(false);
    if (selectedTask) {
      setProofImages(prev => {
        const newState = { ...prev };
        delete newState[selectedTask.id];
        return newState;
      });
      setProofDescriptions(prev => {
        const newState = { ...prev };
        delete newState[selectedTask.id];
        return newState;
      });
    }
    setSelectedTask(null);
    setError(null);
  };

  const openTaskDialog = (task: TaskItem) => {
    setSelectedTask(task);
    setShowTaskDialog(true);
  };

  const closeTaskDialog = () => {
    setShowTaskDialog(false);
    setSelectedTask(null);
  };

  const startTask = async (taskId: number) => {
    setStartingTask(true);
    try {
      const result = await taskService.startTask(taskId);
      
      if (result.success) {
        toast.success('🎉 Task started successfully! You can now complete it and submit proof.');
        closeTaskDialog();
        if (user) {
          await loadAllTasks(user.id);
        }
      } else {
        const errorMsg = result.error || 'Failed to start task';
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to start task. Please try again.';
      toast.error(errorMsg);
    } finally {
      setStartingTask(false);
    }
  };

  const submitProof = async (task: TaskItem) => {
    if (!task) return;

    const description = proofDescriptions[task.id] || '';
    const image = proofImages[task.id];

    if (!description.trim()) {
      toast.error('Please provide a description for your proof');
      return;
    }

    if (!image) {
      toast.error('Please upload an image as proof of task completion');
      return;
    }

    if (task.status !== 'started') {
      toast.error('You must start the task before submitting proof.');
      return;
    }

    setUploadingTasks(prev => ({ ...prev, [task.id]: true }));
    try {
      const proofImageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(image);
      });
      
      const result = await taskService.completeTask({
        task_id: task.id,
        proof_description: description,
        proof_image_base64: proofImageBase64
      });
      
      if (result.success) {
        if (result.ai_verification) {
          if (result.ai_verification.verified) {
            toast.success(`🎉 Task approved by AI! ${result.message}`);
          } else {
            toast.error(`❌ Task rejected by AI: ${result.ai_verification.reason}`);
          }
        } else {
          toast.success('✅ Proof submitted successfully! Your task is now under review.');
        }
        
        setProofImages(prev => {
          const newState = { ...prev };
          delete newState[task.id];
          return newState;
        });
        setProofDescriptions(prev => {
          const newState = { ...prev };
          delete newState[task.id];
          return newState;
        });
        
        closeProofDialog();
        
        if (user) {
          await loadAllTasks(user.id);
          
          // Fetch updated user stats to reflect new coins/points
          try {
            const token = localStorage.getItem('auth_token');
            if (token) {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || ''}/api/users/stats`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
              });
              
              if (response.ok) {
                const statsResult = await response.json();
                if (statsResult.success && statsResult.data?.user) {
                  const userStats = statsResult.data.user;
                  // Emit coin update event to refresh navbar
                  coinEventEmitter.emitCoinUpdate({
                    pineCoins: parseFloat(userStats.total_coins) || 0,
                    weeklyPoints: userStats.weekly_points || 0
                  });
                  console.log('Activities: Emitted coin update after task completion');
                }
              }
            }
          } catch (err) {
            console.error('Failed to fetch updated user stats:', err);
          }
        }
      } else {
        toast.error(result.error || 'Failed to submit proof');
      }
    } catch (err) {
      toast.error('Failed to submit proof. Please try again.');
    } finally {
      setUploadingTasks(prev => ({ ...prev, [task.id]: false }));
    }
  };

  const getFilteredTasks = () => {
    let tasks = allTasks;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.platform.toLowerCase().includes(query) ||
        ('description' in task && task.description?.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (filter === 'completed') {
      tasks = tasks.filter(task => {
        const status = task.status?.toLowerCase().trim();
        return status === 'approved' || status === 'rejected' || status === 'pending';
      });
    } else if (filter !== 'all') {
      tasks = tasks.filter(task => {
        const status = task.status?.toLowerCase().trim();
        return status === filter;
      });
    }
    
    // Sort: in progress first, then available, then completed
    return tasks.sort((a, b) => {
      const statusA = a.status?.toLowerCase().trim() || '';
      const statusB = b.status?.toLowerCase().trim() || '';
      
      const getPriority = (status: string) => {
        if (status === 'started') return 1;
        if (status === 'available') return 2;
        if (status === 'approved' || status === 'rejected' || status === 'pending') return 3;
        return 4;
      };
      
      const priorityA = getPriority(statusA);
      const priorityB = getPriority(statusB);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  };

  const filteredTasks = getFilteredTasks();
  const availableCount = allTasks.filter(t => t.status?.toLowerCase().trim() === 'available').length;
  const startedCount = allTasks.filter(t => t.status?.toLowerCase().trim() === 'started').length;
  const completedCount = allTasks.filter(t => {
    const status = t.status?.toLowerCase().trim();
    return status === 'approved' || status === 'rejected' || status === 'pending';
  }).length;
  const approvedCount = allTasks.filter(t => t.status?.toLowerCase().trim() === 'approved').length;
  const totalPotentialPoints = allTasks.filter(t => t.status?.toLowerCase().trim() === 'available').reduce((sum, t) => sum + t.reward_points, 0);
  const earnedPoints = allTasks.filter(t => t.status?.toLowerCase().trim() === 'approved').reduce((sum, t) => sum + t.reward_points, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <p className="text-slate-600 font-semibold text-lg">Loading your tasks...</p>
          <p className="text-slate-500 text-sm mt-2">Please wait a moment</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-slate-300 text-slate-700 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => user && loadAllTasks(user.id)}
              disabled={refreshingTasks}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshingTasks ? 'animate-spin' : ''}`} />
              {refreshingTasks ? 'Refreshing...' : 'Refresh'}
            </Button>
          </motion.div>
          
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 border-0 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                      <Rocket className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                        Tasks & Activities
                      </h1>
                      <p className="text-emerald-50 text-lg">
                        Complete tasks, submit proof, and earn amazing rewards
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-300"></div>
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-100" />
                  <p className="text-blue-100 text-sm font-medium">Available</p>
                </div>
                <p className="text-3xl font-bold text-white">{availableCount}</p>
                <p className="text-blue-100 text-xs mt-1">Ready to start</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-300"></div>
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-amber-100" />
                  <p className="text-amber-100 text-sm font-medium">In Progress</p>
                </div>
                <p className="text-3xl font-bold text-white">{startedCount}</p>
                <p className="text-amber-100 text-xs mt-1">Active tasks</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-300"></div>
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-emerald-100" />
                  <p className="text-emerald-100 text-sm font-medium">Completed</p>
                </div>
                <p className="text-3xl font-bold text-white">{approvedCount}</p>
                <p className="text-emerald-100 text-xs mt-1">Tasks done</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-violet-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-300"></div>
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-violet-100" />
                  <p className="text-violet-100 text-sm font-medium">Earned</p>
                </div>
                <p className="text-3xl font-bold text-white">{earnedPoints}</p>
                <p className="text-violet-100 text-xs mt-1">Total points</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-500 to-pink-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-300"></div>
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-rose-100" />
                  <p className="text-rose-100 text-sm font-medium">Potential</p>
                </div>
                <p className="text-3xl font-bold text-white">{totalPotentialPoints}</p>
                <p className="text-rose-100 text-xs mt-1">Points available</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {/* Search Bar */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search tasks by title, platform, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Filter Tabs */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { key: 'all', label: 'All Tasks', count: allTasks.length, icon: ClipboardList, color: 'slate' },
                    { key: 'available', label: 'Available', count: availableCount, icon: Target, color: 'blue' },
                    { key: 'started', label: 'In Progress', count: startedCount, icon: Zap, color: 'amber' },
                    { key: 'completed', label: 'Completed', count: completedCount, icon: Trophy, color: 'emerald' },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = filter === tab.key;
                    return (
                      <Button
                        key={tab.key}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(tab.key as any)}
                        className={`relative transition-all duration-200 ${
                          isActive
                            ? `bg-${tab.color}-600 hover:bg-${tab.color}-700 text-white shadow-lg scale-105`
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.label}
                        {tab.count > 0 && (
                          <Badge 
                            className={`ml-2 ${
                              isActive 
                                ? 'bg-white/30 text-white' 
                                : `bg-${tab.color}-100 text-${tab.color}-700`
                            }`}
                          >
                            {tab.count}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredTasks.length === 0 ? (
              <Card className="bg-white border-slate-200 shadow-xl col-span-full">
                <CardContent className="p-16 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6"
                  >
                    <ClipboardList className="h-16 w-16 text-slate-400" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-3">
                    {searchQuery ? 'No Matches Found' : 'No Tasks Found'}
                  </h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto text-lg">
                    {searchQuery 
                      ? `No tasks match your search "${searchQuery}". Try different keywords!`
                      : filter === 'available' 
                      ? 'No available tasks at the moment. Check back later for new opportunities!'
                      : filter === 'started'
                      ? 'You have no tasks in progress. Start a task to begin earning rewards!'
                      : filter === 'completed'
                      ? 'You haven\'t completed any tasks yet. Start completing tasks to see them here!'
                      : 'No tasks match your current filter.'}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {searchQuery && (
                      <Button 
                        type="button"
                        onClick={() => setSearchQuery('')}
                        variant="outline"
                        className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Clear Search
                      </Button>
                    )}
                    {filter !== 'all' && (
                      <Button 
                        type="button"
                        onClick={() => setFilter('all')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <ClipboardList className="h-4 w-4 mr-2" />
                        View All Tasks
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task, index) => {
                const normalizedStatus = task.status?.toLowerCase().trim() || '';
                const isStarted = normalizedStatus === 'started';
                const isAvailable = normalizedStatus === 'available';
                const isCompleted = normalizedStatus === 'approved' || normalizedStatus === 'rejected' || normalizedStatus === 'pending';
                const isExpanded = expandedTaskId === task.id;
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className={`bg-white transition-all duration-300 hover:shadow-2xl h-full flex flex-col overflow-hidden ${
                      isStarted 
                        ? 'border-2 border-amber-400 shadow-xl shadow-amber-200/50' 
                        : isAvailable
                        ? 'border-2 border-blue-300 shadow-lg'
                        : 'border-2 border-slate-200 shadow-lg'
                    }`}>
                      {/* Card Header with Color Strip */}
                      <div className={`h-2 ${
                        isStarted ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                        isAvailable ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                        'bg-gradient-to-r from-emerald-400 to-green-400'
                      }`}></div>
                      
                      <CardContent className="p-6 flex flex-col flex-1">
                        <div className="space-y-4">
                          {/* Header Section */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <Badge 
                                  className={`text-xs font-bold px-3 py-1 ${
                                    isStarted 
                                      ? 'bg-amber-100 text-amber-800 border-2 border-amber-300' 
                                      : isAvailable
                                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                                      : 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
                                  }`}
                                >
                                  {isStarted ? '⚡ In Progress' : isAvailable ? '🎯 Available' : '✅ Completed'}
                                </Badge>
                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 text-xs px-2 py-1">
                                  {task.platform}
                                </Badge>
                              </div>
                              <h2 className="text-xl font-bold text-slate-900 mb-2 leading-tight line-clamp-2">
                                {task.title}
                              </h2>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-lg">
                                <p className="text-xs text-emerald-100 font-semibold mb-1 text-center">Reward</p>
                                <p className="text-3xl font-bold text-white text-center">{task.reward_points}</p>
                                <p className="text-xs text-emerald-100 font-medium text-center">points</p>
                                {task.reward_coins > 0 && (
                                  <div className="mt-2 pt-2 border-t border-white/30">
                                    <p className="text-lg font-bold text-white text-center">₽{task.reward_coins}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {'description' in task && task.description && (
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-slate-600" />
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Description</h3>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                                {task.description}
                              </p>
                            </div>
                          )}

                          {/* Expandable Details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden space-y-3"
                              >
                                {/* Requirements */}
                                {'requirements' in task && task.requirements && (
                                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CheckCircle className="w-4 h-4 text-blue-600" />
                                      <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Requirements</h3>
                                    </div>
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                      {task.requirements}
                                    </p>
                                  </div>
                                )}

                                {/* Task URL */}
                                {'url' in task && task.url && (
                                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-200">
                                    <div className="flex items-center gap-2">
                                      <ExternalLink className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                      <a 
                                        href={task.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-emerald-700 font-medium underline flex items-center gap-1 group transition-all duration-200"
                                      >
                                        <span className="truncate">Open Task Link</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                      </a>
                                    </div>
                                  </div>
                                )}

                                {/* Started Date */}
                                {isStarted && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
                                    <Clock className="w-4 h-4" />
                                    <span>Started: {new Date(task.created_at).toLocaleDateString('en-US', { 
                                      month: 'long', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}</span>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Action Section */}
                          <div className="mt-auto pt-4 border-t border-slate-200">
                            {isStarted ? (
                              <Button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openProofDialog(task);
                                }}
                                size="lg"
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 text-base py-6"
                              >
                                <Upload className="h-5 w-5 mr-2" />
                                Submit Proof
                              </Button>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {/* Details Toggle */}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setExpandedTaskId(isExpanded ? null : task.id);
                                  }}
                                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  {isExpanded ? 'Hide Details' : 'View Details'}
                                </Button>

                                {/* Main Action */}
                                {isAvailable && (
                                  <Button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      openTaskDialog(task);
                                    }}
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 py-6"
                                  >
                                    <Play className="h-5 w-5 mr-2" />
                                    Start Task
                                  </Button>
                                )}
                                {isCompleted && (
                                  <div className="flex items-center justify-center gap-2 text-slate-600 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border-2 border-emerald-200">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                    <span className="font-bold text-base">
                                      {normalizedStatus === 'approved' ? '✓ Approved' : 
                                       normalizedStatus === 'rejected' ? '✗ Rejected' : 
                                       '⏳ Under Review'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Task Start Dialog */}
          <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogContent className="max-w-3xl bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-bold text-slate-900">
                      Start Task
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 mt-1 text-base">
                      Review the task details before starting
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              {selectedTask && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200">
                    <Label className="text-sm font-bold text-blue-900 mb-2 block uppercase tracking-wide">Task Title</Label>
                    <p className="text-2xl text-slate-900 font-bold">{selectedTask.title}</p>
                  </div>
                  
                  {'description' in selectedTask && selectedTask.description && (
                    <div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-200">
                      <Label className="text-sm font-bold text-slate-700 mb-3 block uppercase tracking-wide">Description</Label>
                      <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedTask.description}</p>
                    </div>
                  )}
                  
                  {'requirements' in selectedTask && selectedTask.requirements && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-5 border-2 border-emerald-200">
                      <Label className="text-sm font-bold text-emerald-900 mb-3 block flex items-center gap-2 uppercase tracking-wide">
                        <CheckCircle className="w-5 h-5" />
                        Requirements
                      </Label>
                      <p className="text-base text-emerald-900 leading-relaxed whitespace-pre-wrap font-medium">{selectedTask.requirements}</p>
                    </div>
                  )}
                  
                  {'url' in selectedTask && selectedTask.url && (
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border-2 border-violet-200">
                      <Label className="text-sm font-bold text-violet-900 mb-3 block uppercase tracking-wide">Task URL</Label>
                      <a 
                        href={selectedTask.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-base text-violet-700 underline break-all flex items-center gap-2 font-medium transition-all duration-200"
                      >
                        {selectedTask.url}
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-lg">
                      <Label className="text-sm font-bold text-emerald-100 mb-2 block uppercase tracking-wide">Reward Points</Label>
                      <p className="text-4xl font-bold text-white">{selectedTask.reward_points}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-5 shadow-lg">
                      <Label className="text-sm font-bold text-blue-100 mb-2 block uppercase tracking-wide">Platform</Label>
                      <p className="text-2xl font-bold text-white">{selectedTask.platform}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-base font-bold text-amber-900 mb-2">What happens next?</p>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          Once you start this task, you'll need to complete it according to the requirements and then submit proof of completion. Make sure you understand all requirements before starting.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <DialogFooter className="gap-3 mt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={closeTaskDialog} 
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 px-6 py-3"
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (selectedTask) {
                      startTask(selectedTask.id);
                    }
                  }}
                  disabled={startingTask || !selectedTask}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold shadow-xl px-8 py-3"
                >
                  {startingTask ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start Task
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Submit Proof Dialog */}
          <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
            <DialogContent className="max-w-3xl bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-bold text-slate-900">
                      Submit Proof
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 mt-1 text-base">
                      Upload proof of completion for your task
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              {selectedTask && (
                <div className="space-y-5">
                  {/* Task Info Section */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-5 border-2 border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{selectedTask.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-300 text-sm px-3 py-1 font-bold">
                        {selectedTask.platform}
                      </Badge>
                      <Badge className="bg-emerald-100 text-emerald-800 border-2 border-emerald-300 text-sm px-3 py-1 font-bold">
                        {selectedTask.reward_points} pts
                      </Badge>
                      {selectedTask.reward_coins > 0 && (
                        <Badge className="bg-slate-100 text-slate-800 border-2 border-slate-300 text-sm px-3 py-1 font-bold">
                          ₽{selectedTask.reward_coins} PineCoins
                        </Badge>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3"
                      >
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-base font-bold text-blue-900 mb-2">Proof Requirements</p>
                        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                          <li>Upload a clear screenshot or image showing task completion</li>
                          <li>Provide a detailed description of how you completed the task</li>
                          <li>Image must be less than 5MB</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="proof-image" className="text-base font-bold text-slate-800 mb-3 block flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Proof Image *
                    </Label>
                    <div className="border-3 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-300">
                      <Input
                        id="proof-image"
                        type="file"
                        accept="image/*"
                        onChange={handleDialogImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="proof-image"
                        className="cursor-pointer flex flex-col items-center gap-4"
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
                          <ImageIcon className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-700">
                            {proofImages[selectedTask.id] 
                              ? proofImages[selectedTask.id]?.name 
                              : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-sm text-slate-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </label>
                    </div>
                    {proofImages[selectedTask.id] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center gap-3"
                      >
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                        <p className="text-base text-emerald-700 font-bold">{proofImages[selectedTask.id]?.name}</p>
                      </motion.div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="proof-description" className="text-base font-bold text-slate-800 mb-3 block flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Proof Description *
                    </Label>
                    <Textarea
                      id="proof-description"
                      placeholder="Describe in detail how you completed this task. Include any specific steps you took, screenshots you captured, or actions you performed..."
                      value={proofDescriptions[selectedTask.id] || ''}
                      onChange={(e) => setProofDescriptions(prev => ({ ...prev, [selectedTask.id]: e.target.value }))}
                      className="border-2 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 min-h-[150px] text-base rounded-xl"
                      rows={6}
                    />
                    <p className="text-sm text-slate-500 mt-2 font-medium">
                      {proofDescriptions[selectedTask.id]?.length || 0} characters
                    </p>
                  </div>
                </div>
              )}
              
              <DialogFooter className="gap-3 mt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={closeProofDialog} 
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 px-6 py-3"
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (selectedTask) {
                      submitProof(selectedTask);
                    }
                  }}
                  disabled={uploadingTasks[selectedTask?.id || 0] || !proofDescriptions[selectedTask?.id || 0]?.trim() || !proofImages[selectedTask?.id || 0]}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-xl disabled:opacity-50 px-8 py-3"
                >
                  {uploadingTasks[selectedTask?.id || 0] ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Submit Proof
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
