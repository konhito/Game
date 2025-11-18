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
  FileText
} from 'lucide-react';
import { taskService } from '@/lib/task-service';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
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
        // The backend returns task ID as 'id', but we need to check both id and task_id
        const taskId = (ht as any).task_id || ht.id;
        const correspondingAvailableTask = available.find(at => at.id === taskId);
        return {
          ...correspondingAvailableTask, // Include details from available task
          ...ht, // Override with history-specific details like status, proof, etc.
          id: taskId, // Ensure ID is task_id for consistency
          status: ht.status?.toLowerCase().trim() || 'started', // Normalize status
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
      }).map(at => ({ ...at, status: 'available' })); // Explicitly set status for available tasks

      // Combine and ensure unique tasks by ID, prioritizing started/completed
      const combinedTasksMap = new Map<number, TaskItem>();
      [...uniqueAvailableTasks, ...startedAndCompletedTasks].forEach(task => {
        combinedTasksMap.set(task.id, task);
      });

      const finalTasks = Array.from(combinedTasksMap.values());
      console.log('📊 Loaded tasks summary:', {
        total: finalTasks.length,
        available: finalTasks.filter(t => t.status?.toLowerCase().trim() === 'available').length,
        started: finalTasks.filter(t => t.status?.toLowerCase().trim() === 'started').length,
        completed: finalTasks.filter(t => ['approved', 'rejected', 'pending'].includes(t.status?.toLowerCase().trim() || '')).length,
        tasks: finalTasks.map(t => ({ id: t.id, title: t.title, status: t.status }))
      });
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
      console.log('🚀 Starting task:', taskId);
      const result = await taskService.startTask(taskId);
      
      console.log('📦 Start task result:', result);
      
      if (result.success) {
        toast.success('🎉 Task started successfully! You can now complete it and submit proof.');
        // Close dialog first
        closeTaskDialog();
        // Then reload tasks to update the UI
        if (user) {
          console.log('🔄 Reloading tasks after start...');
          await loadAllTasks(user.id);
          console.log('✅ Tasks reloaded');
        }
      } else {
        const errorMsg = result.error || 'Failed to start task';
        console.error('❌ Task start failed:', errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error('💥 Task start error:', err);
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
        
        // Clear form
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
        
        if (user) {
          await loadAllTasks(user.id);
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
    if (filter === 'all') return allTasks;
    if (filter === 'completed') {
      return allTasks.filter(task => task.status === 'approved' || task.status === 'rejected' || task.status === 'pending');
    }
    return allTasks.filter(task => task.status === filter);
  };

  const filteredTasks = getFilteredTasks();
  const availableCount = allTasks.filter(t => t.status === 'available').length;
  const startedCount = allTasks.filter(t => t.status === 'started').length;
  const completedCount = allTasks.filter(t => t.status === 'approved' || t.status === 'rejected' || t.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          </motion.div>
          <p className="text-slate-600 font-medium">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400 hover:shadow-md transition-all duration-200"
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
                className="border-slate-300 text-slate-700 hover:bg-slate-100 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshingTasks ? 'animate-spin' : ''}`} />
                {refreshingTasks ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            
            <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 border-0 shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                      <ClipboardList className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                        Tasks & Activities
                      </h1>
                      <p className="text-emerald-50 text-base">
                        Complete tasks, submit proof, and earn rewards
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                      <p className="text-white text-sm font-medium">Total Tasks</p>
                      <p className="text-white text-2xl font-bold">{allTasks.length}</p>
                    </div>
                  </div>
                </div>
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
                className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { key: 'all', label: 'All Tasks', count: allTasks.length, icon: ClipboardList },
                    { key: 'available', label: 'Available', count: availableCount, icon: Target },
                    { key: 'started', label: 'In Progress', count: startedCount, icon: Zap },
                    { key: 'completed', label: 'Completed', count: completedCount, icon: CheckCircle },
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
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md scale-105'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-emerald-300'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.label}
                        {tab.count > 0 && (
                          <Badge 
                            className={`ml-2 ${
                              isActive 
                                ? 'bg-white/30 text-white' 
                                : 'bg-emerald-100 text-emerald-700'
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

          {/* Tasks List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {filteredTasks.length === 0 ? (
              <Card className="bg-white border-slate-200 shadow-lg col-span-full">
                <CardContent className="p-12 sm:p-16 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <ClipboardList className="h-12 w-12 text-slate-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">No Tasks Found</h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    {filter === 'available' 
                      ? 'No available tasks at the moment. Check back later for new opportunities!'
                      : filter === 'started'
                      ? 'You have no tasks in progress. Start a task to begin earning rewards!'
                      : filter === 'completed'
                      ? 'You haven\'t completed any tasks yet. Start completing tasks to see them here!'
                      : 'No tasks match your current filter.'}
                  </p>
                  {filter !== 'all' && (
                    <Button 
                      type="button"
                      onClick={() => setFilter('all')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      View All Tasks
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task, index) => {
                // Normalize status for comparison
                const normalizedStatus = task.status?.toLowerCase().trim() || '';
                const isStarted = normalizedStatus === 'started';
                const isAvailable = normalizedStatus === 'available';
                const isCompleted = normalizedStatus === 'approved' || normalizedStatus === 'rejected' || normalizedStatus === 'pending';
                const isExpanded = expandedTaskId === task.id;
                
                // Debug logging
                if (isStarted) {
                  console.log('✅ Task is started:', task.id, task.title, 'status:', task.status);
                }
                
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <Card className={`bg-white border-2 transition-all duration-300 hover:shadow-xl ${
                      isStarted 
                        ? 'border-emerald-400 shadow-md' 
                        : isAvailable
                        ? 'border-blue-300 shadow-sm'
                        : 'border-slate-200 shadow-sm'
                    }`}>
                      <CardContent className="p-4 sm:p-5">
                        <div className="space-y-3">
                          {/* Task Header */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge 
                                  className={`text-xs font-semibold px-2 py-0.5 ${
                                    isStarted 
                                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
                                      : isAvailable
                                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                                      : isCompleted
                                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {isStarted ? '🟢 In Progress' : isAvailable ? '🔵 Available' : isCompleted ? '✅ Completed' : task.status}
                                </Badge>
                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 text-xs px-2 py-0.5">
                                  {task.platform}
                                </Badge>
                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 text-xs px-2 py-0.5">
                                  {task.task_type}
                                </Badge>
                              </div>
                              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 leading-tight">
                                {task.title}
                              </h2>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-2 sm:p-3 border border-emerald-200 text-center">
                                <p className="text-xs text-emerald-700 font-semibold mb-0.5">Reward</p>
                                <p className="text-xl sm:text-2xl font-bold text-emerald-600">{task.reward_points}</p>
                                <p className="text-xs text-emerald-700 font-medium">pts</p>
                                {task.reward_coins > 0 && (
                                  <div className="mt-1.5 pt-1.5 border-t border-emerald-200">
                                    <p className="text-sm font-bold text-slate-700">₽{task.reward_coins}</p>
                                    <p className="text-xs text-slate-600">PineCoins</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Task Description - Always Visible */}
                          {'description' in task && task.description && (
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-slate-600" />
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Description</h3>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">
                                {task.description}
                              </p>
                            </div>
                          )}

                          {/* Requirements - Always Visible */}
                          {'requirements' in task && task.requirements && (
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">Requirements</h3>
                              </div>
                              <p className="text-xs text-blue-800 leading-relaxed">
                                {task.requirements}
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
                                {/* Task URL */}
                                {'url' in task && task.url && (
                                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-2.5 border border-emerald-200">
                                    <div className="flex items-center gap-2">
                                      <ExternalLink className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-emerald-700 mb-0.5">Task Link</p>
                                        <a 
                                          href={task.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-xs text-emerald-700 hover:text-emerald-900 font-medium break-all underline flex items-center gap-1 group truncate"
                                        >
                                          <span className="truncate">{task.url}</span>
                                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Started Date */}
                                {isStarted && (
                                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-2">
                                    <Clock className="w-3 h-3" />
                                    <span>Started: {new Date(task.created_at).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}</span>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Submit Proof Form - Directly on Card for Started Tasks */}
                          {isStarted && (
                            <div className="pt-4 border-t-2 border-emerald-200 space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Upload className="w-4 h-4 text-emerald-600" />
                                <h3 className="text-base font-bold text-slate-900">Submit Proof</h3>
                              </div>
                              
                              <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-lg p-2.5 mb-3">
                                <div className="flex items-start gap-2">
                                  <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold text-emerald-900 mb-1">Requirements</p>
                                    <ul className="text-xs text-emerald-800 space-y-0.5 list-disc list-inside">
                                      <li>Upload screenshot/image (max 5MB)</li>
                                      <li>Provide detailed description</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <Label htmlFor={`proof-image-${task.id}`} className="text-xs font-semibold text-slate-700 mb-2 block flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" />
                                    Proof Image *
                                  </Label>
                                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors">
                                    <Input
                                      id={`proof-image-${task.id}`}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(task.id, e)}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor={`proof-image-${task.id}`}
                                      className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-emerald-600" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-slate-700">
                                          {proofImages[task.id] 
                                            ? proofImages[task.id]?.name 
                                            : 'Click to upload'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">Max 5MB</p>
                                      </div>
                                    </label>
                                  </div>
                                  {proofImages[task.id] && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2"
                                    >
                                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                                      <p className="text-xs text-emerald-700 font-medium truncate">{proofImages[task.id]?.name}</p>
                                    </motion.div>
                                  )}
                                </div>
                                
                                <div>
                                  <Label htmlFor={`proof-description-${task.id}`} className="text-xs font-semibold text-slate-700 mb-2 block flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    Description *
                                  </Label>
                                  <Textarea
                                    id={`proof-description-${task.id}`}
                                    placeholder="Describe how you completed the task..."
                                    value={proofDescriptions[task.id] || ''}
                                    onChange={(e) => setProofDescriptions(prev => ({ ...prev, [task.id]: e.target.value }))}
                                    className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 min-h-[80px] text-sm"
                                    rows={3}
                                  />
                                  <p className="text-xs text-slate-500 mt-1">
                                    {proofDescriptions[task.id]?.length || 0} characters
                                  </p>
                                </div>
                                
                                <Button 
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    submitProof(task);
                                  }}
                                  disabled={uploadingTasks[task.id] || !proofDescriptions[task.id]?.trim() || !proofImages[task.id]}
                                  size="sm"
                                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                                >
                                  {uploadingTasks[task.id] ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Submit Proof
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Action Section for Available and Completed Tasks */}
                          {!isStarted && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t border-slate-200">
                              {/* Expand/Collapse Button */}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setExpandedTaskId(isExpanded ? null : task.id);
                                }}
                                className="flex-1 sm:flex-initial border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 text-xs h-8"
                              >
                                <Eye className="h-3 w-3 mr-1.5" />
                                {isExpanded ? 'Hide' : 'Details'}
                              </Button>

                              {/* Primary Action Button */}
                              {isAvailable && (
                                <Button 
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openTaskDialog(task);
                                  }}
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 h-8"
                                >
                                  <Play className="h-4 w-4 mr-1.5" />
                                  Start Task
                                </Button>
                              )}
                              {isCompleted && (
                                <div className="flex-1 flex items-center justify-center gap-2 text-slate-600 bg-slate-50 rounded-lg p-2 text-xs">
                                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                                  <span className="font-medium">
                                    {task.status === 'approved' ? 'Approved ✓' : 
                                     task.status === 'rejected' ? 'Rejected' : 
                                     'Under Review'}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Task Start Dialog - Enhanced */}
          <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogContent className="max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Play className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-slate-900">
                      Start Task
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 mt-1">
                      Review the task details before starting
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              {selectedTask && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">Task Title</Label>
                    <p className="text-lg text-slate-900 font-semibold">{selectedTask.title}</p>
                  </div>
                  
                  {'description' in selectedTask && selectedTask.description && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">Description</Label>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedTask.description}</p>
                    </div>
                  )}
                  
                  {'requirements' in selectedTask && selectedTask.requirements && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <Label className="text-sm font-semibold text-blue-900 mb-2 block flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Requirements
                      </Label>
                      <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">{selectedTask.requirements}</p>
                    </div>
                  )}
                  
                  {'url' in selectedTask && selectedTask.url && (
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                      <Label className="text-sm font-semibold text-emerald-900 mb-2 block">Task URL</Label>
                      <a 
                        href={selectedTask.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-700 hover:text-emerald-900 underline break-all flex items-center gap-2"
                      >
                        {selectedTask.url}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                      <Label className="text-sm font-semibold text-emerald-700 mb-1 block">Reward Points</Label>
                      <p className="text-2xl font-bold text-emerald-600">{selectedTask.reward_points}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <Label className="text-sm font-semibold text-slate-700 mb-1 block">Platform</Label>
                      <p className="text-lg font-semibold text-slate-900">{selectedTask.platform}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900 mb-1">What happens next?</p>
                        <p className="text-sm text-amber-800">
                          Once you start this task, you'll need to complete it according to the requirements and then submit proof of completion. Make sure you understand all requirements before starting.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <DialogFooter className="gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={closeTaskDialog} 
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
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
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg"
                >
                  {startingTask ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Task
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Submit Proof Dialog - Enhanced */}
          <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
            <DialogContent className="max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Upload className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-slate-900">
                      Submit Proof
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 mt-1">
                      Upload proof of completion for: <span className="font-semibold">{selectedTask?.title}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              {selectedTask && (
                <div className="space-y-6">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
                      >
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">Proof Requirements</p>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                          <li>Upload a clear screenshot or image showing task completion</li>
                          <li>Provide a detailed description of how you completed the task</li>
                          <li>Image must be less than 5MB</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="proof-image" className="text-sm font-semibold text-slate-700 mb-3 block flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Proof Image *
                    </Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                      <Input
                        id="proof-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="proof-image"
                        className="cursor-pointer flex flex-col items-center gap-3"
                      >
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {proofImages[selectedTask.id] 
                              ? proofImages[selectedTask.id]?.name 
                              : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </label>
                    </div>
                    {proofImages[selectedTask.id] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <p className="text-sm text-emerald-700 font-medium">{proofImages[selectedTask.id]?.name}</p>
                      </motion.div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="proof-description" className="text-sm font-semibold text-slate-700 mb-3 block flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Proof Description *
                    </Label>
                    <Textarea
                      id="proof-description"
                      placeholder="Describe in detail how you completed this task. Include any specific steps you took, screenshots you captured, or actions you performed..."
                      value={proofDescriptions[selectedTask.id] || ''}
                      onChange={(e) => setProofDescriptions(prev => ({ ...prev, [selectedTask.id]: e.target.value }))}
                      className="border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 min-h-[120px]"
                      rows={5}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      {proofDescriptions[selectedTask.id]?.length || 0} characters
                    </p>
                  </div>
                </div>
              )}
              
              <DialogFooter className="gap-3">
                <Button 
                  variant="outline" 
                  onClick={closeProofDialog} 
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitProof}
                  disabled={uploadingTasks[selectedTask?.id || 0] || !proofDescriptions[selectedTask?.id || 0]?.trim() || !proofImages[selectedTask?.id || 0]}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-lg disabled:opacity-50"
                >
                  {uploadingTasks[selectedTask?.id || 0] ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
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
