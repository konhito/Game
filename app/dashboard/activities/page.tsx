"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Activity, 
  Search, 
  ClipboardList,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  ArrowLeft,
  Eye,
  Play,
  Upload,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Target,
  Zap,
  Info,
  FileText,
  Trophy,
  Loader2,
  CheckCircle2,
  X
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
  priority?: string;
  max_participants?: number;
  current_participants: number;
  status: string;
  deadline?: string;
  url?: string;
  created_at: string;
}

type TaskItem = AvailableTask | (TaskActivity & { description?: string; requirements?: string });

type FilterKey = 'all' | 'available' | 'started' | 'completed';

function normalizeTaskStatus(status?: string | null) {
  return status?.toLowerCase().trim() || '';
}

function getTaskStatusMeta(status: string) {
  if (status === 'started') {
    return {
      label: 'In progress',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      panelClass: 'border-amber-200 bg-amber-50/50',
      actionTone: 'progress',
    };
  }

  if (status === 'available') {
    return {
      label: 'Available',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
      panelClass: 'border-slate-200 bg-white',
      actionTone: 'available',
    };
  }

  if (status === 'approved') {
    return {
      label: 'Approved',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      panelClass: 'border-slate-200 bg-white',
      actionTone: 'complete',
    };
  }

  if (status === 'pending') {
    return {
      label: 'Under review',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      panelClass: 'border-slate-200 bg-white',
      actionTone: 'complete',
    };
  }

  if (status === 'rejected') {
    return {
      label: 'Rejected',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      panelClass: 'border-slate-200 bg-white',
      actionTone: 'complete',
    };
  }

  return {
    label: 'Task',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    panelClass: 'border-slate-200 bg-white',
    actionTone: 'available',
  };
}

function getPriorityMeta(priority?: string | null) {
  const normalized = priority?.toLowerCase().trim() || 'normal';

  if (normalized === 'urgent') {
    return {
      label: 'Urgent',
      className: 'border-rose-200 bg-rose-50 text-rose-700',
    };
  }

  if (normalized === 'high') {
    return {
      label: 'High',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  if (normalized === 'low') {
    return {
      label: 'Low',
      className: 'border-slate-200 bg-slate-100 text-slate-600',
    };
  }

  return {
    label: 'Normal',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  };
}

function ActivitiesStatCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200/50 bg-white/90 shadow-md transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{hint}</p>
          </div>
          <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
  const [filter, setFilter] = useState<FilterKey>('all');
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

      const available: AvailableTask[] = availableResult.success ? (availableResult.data.tasks || []) : [];
      const history: TaskActivity[] = historyResult.success ? (historyResult.data.tasks || []) : [];

      // Map history tasks to include full task details if available
      const startedAndCompletedTasks = history.map((ht: TaskActivity) => {
        const taskId = (ht as any).task_id || ht.id;
        const correspondingAvailableTask = available.find((at: AvailableTask) => at.id === taskId);
        return {
          ...correspondingAvailableTask,
          ...ht,
          id: taskId,
          status: ht.status?.toLowerCase().trim() || 'started',
          description: correspondingAvailableTask?.description || (ht as any).description,
          requirements: correspondingAvailableTask?.requirements || '',
          priority: correspondingAvailableTask?.priority || (ht as any).priority || (ht as any).task?.priority,
          deadline: correspondingAvailableTask?.deadline || (ht as any).deadline || (ht as any).task?.deadline,
          url: correspondingAvailableTask?.url || (ht as any).url,
        };
      });

      // Filter out tasks from 'available' that are already 'started' or 'completed' in history
      const uniqueAvailableTasks = available.filter(at => {
        const taskId = at.id;
        const hasHistory = startedAndCompletedTasks.some((st: TaskItem) => {
          const stId = st.id;
          const stStatus = st.status?.toLowerCase().trim();
          return stId === taskId && (stStatus === 'started' || stStatus === 'pending' || stStatus === 'approved' || stStatus === 'rejected');
        });
        return !hasHistory;
      }).map((at: AvailableTask) => ({ ...at, status: 'available' }));

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

  const filteredTasks = useMemo(() => {
    let tasks = [...allTasks];
    
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
  }, [allTasks, filter, searchQuery]);

  const availableCount = allTasks.filter(t => normalizeTaskStatus(t.status) === 'available').length;
  const startedCount = allTasks.filter(t => normalizeTaskStatus(t.status) === 'started').length;
  const completedCount = allTasks.filter(t => {
    const status = normalizeTaskStatus(t.status);
    return status === 'approved' || status === 'rejected' || status === 'pending';
  }).length;
  const approvedCount = allTasks.filter(t => normalizeTaskStatus(t.status) === 'approved').length;
  const totalPotentialPoints = allTasks
    .filter(t => normalizeTaskStatus(t.status) === 'available')
    .reduce((sum, t) => sum + t.reward_points, 0);
  const earnedPoints = allTasks
    .filter(t => normalizeTaskStatus(t.status) === 'approved')
    .reduce((sum, t) => sum + t.reward_points, 0);
  const hasActiveFilters = Boolean(searchQuery.trim()) || filter !== 'all';
  const filterTabs: Array<{ key: FilterKey; label: string; count: number; icon: React.ElementType }> = [
    { key: 'all', label: 'All tasks', count: allTasks.length, icon: ClipboardList },
    { key: 'available', label: 'Available', count: availableCount, icon: Target },
    { key: 'started', label: 'In progress', count: startedCount, icon: Zap },
    { key: 'completed', label: 'Completed', count: completedCount, icon: Trophy },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-medium">Loading activities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 overflow-hidden relative pb-12">
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.18'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="space-y-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="bg-white/80 border-slate-200/60 text-slate-700 hover:bg-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Activities</h1>
              <p className="mt-1 text-sm text-slate-600">
                Start tasks, track progress, and submit proof from one workspace.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2 text-sm text-slate-600 shadow-sm">
              {filteredTasks.length} visible, {allTasks.length} total
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => user && loadAllTasks(user.id)}
              disabled={refreshingTasks}
              className="bg-white/80 border-slate-200/60 text-slate-700 hover:bg-white"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshingTasks ? 'animate-spin' : ''}`} />
              {refreshingTasks ? 'Refreshing' : 'Refresh'}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
        >
          <ActivitiesStatCard title="Available" value={availableCount} hint="Ready to start" icon={<Target className="h-5 w-5" />} />
          <ActivitiesStatCard title="In progress" value={startedCount} hint="Needs proof" icon={<Zap className="h-5 w-5" />} />
          <ActivitiesStatCard title="Completed" value={approvedCount} hint="Approved tasks" icon={<CheckCircle2 className="h-5 w-5" />} />
          <ActivitiesStatCard title="Earned points" value={earnedPoints} hint="From approved work" icon={<Trophy className="h-5 w-5" />} />
          <ActivitiesStatCard title="Open points" value={totalPotentialPoints} hint="Still available" icon={<Activity className="h-5 w-5" />} />
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-slate-200/50 bg-white/90 shadow-md">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1 max-w-2xl">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search by task title, platform, or description"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 border-slate-200 pl-9 pr-10 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {filterTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = filter === tab.key;

                    return (
                      <Button
                        key={tab.key}
                        type="button"
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(tab.key)}
                        className={isActive
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {tab.label}
                        <span className={`ml-2 rounded-md px-1.5 py-0.5 text-xs ${isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {tab.count}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                  <span>Filtering current activity list</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setFilter('all');
                    }}
                    className="h-8 px-2 text-slate-600 hover:text-slate-900"
                  >
                    Reset filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3"
        >
          {filteredTasks.length === 0 ? (
            <Card className="col-span-full border-slate-200/50 bg-white/90 shadow-md">
              <CardContent className="flex flex-col items-center px-6 py-16 text-center">
                <div className="mb-5 rounded-2xl bg-slate-100 p-5 text-slate-500">
                  <ClipboardList className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {searchQuery ? 'No matching tasks' : 'No tasks to show'}
                </h3>
                <p className="mt-2 max-w-lg text-sm text-slate-500">
                  {searchQuery
                    ? `No tasks match "${searchQuery}". Try broader keywords or clear your filters.`
                    : filter === 'available'
                    ? 'There are no available tasks right now.'
                    : filter === 'started'
                    ? 'You do not have any active tasks yet.'
                    : filter === 'completed'
                    ? 'Completed tasks will appear here once they are reviewed.'
                    : 'Your activity workspace is empty right now.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task, index) => {
              const normalizedStatus = normalizeTaskStatus(task.status);
              const isStarted = normalizedStatus === 'started';
              const isAvailable = normalizedStatus === 'available';
              const isCompleted = normalizedStatus === 'approved' || normalizedStatus === 'rejected' || normalizedStatus === 'pending';
              const isExpanded = expandedTaskId === task.id;
              const statusMeta = getTaskStatusMeta(normalizedStatus);
              const priorityMeta = getPriorityMeta('priority' in task ? task.priority : undefined);

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="h-full"
                >
                  <Card className={`flex h-full flex-col border shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${statusMeta.panelClass}`}>
                    <CardHeader className="space-y-4 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={`border ${statusMeta.badgeClass}`}>{statusMeta.label}</Badge>
                            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                              {task.platform}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl leading-tight text-slate-900">{task.title}</CardTitle>
                        </div>

                        <div className="min-w-[88px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Reward</div>
                          <div className="text-2xl font-bold text-slate-900">{task.reward_points}</div>
                          <div className="text-xs text-slate-500">points</div>
                          {task.reward_coins > 0 && (
                            <div className="mt-2 border-t border-slate-200 pt-2 text-sm font-semibold text-slate-700">
                              {task.reward_coins} coins
                            </div>
                          )}
                        </div>
                      </div>

                      {'description' in task && task.description && (
                        <CardDescription className="line-clamp-3 text-sm leading-6 text-slate-600">
                          {task.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col pt-0">
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {new Date(task.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge className={`border ${priorityMeta.className}`}>
                            Priority: {priorityMeta.label}
                          </Badge>
                          {'deadline' in task && task.deadline && (
                            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                              End date: {new Date(task.deadline).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </Badge>
                          )}
                        </div>

                        {'url' in task && task.url && (
                          <a
                            href={task.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-800 transition-colors hover:bg-emerald-50"
                          >
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Task URL</p>
                              <p className="truncate font-medium">{task.url}</p>
                            </div>
                            <ExternalLink className="h-4 w-4 flex-shrink-0" />
                          </a>
                        )}

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                {'requirements' in task && task.requirements && (
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requirements</p>
                                    <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">{task.requirements}</p>
                                  </div>
                                )}
                                {'url' in task && task.url && (
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Destination</p>
                                    <a
                                      href={task.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 break-all text-sm text-emerald-700 hover:text-emerald-800"
                                    >
                                      {task.url}
                                      <ArrowRight className="h-4 w-4" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="mt-auto pt-5">
                        <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setExpandedTaskId(isExpanded ? null : task.id);
                            }}
                            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {isExpanded ? 'Hide details' : 'View details'}
                          </Button>

                          {isStarted && (
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openProofDialog(task);
                              }}
                              className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Submit proof
                            </Button>
                          )}

                          {isAvailable && (
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openTaskDialog(task);
                              }}
                              className="bg-slate-900 text-white hover:bg-slate-800"
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Start task
                            </Button>
                          )}

                          {isCompleted && (
                            <div className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${statusMeta.badgeClass}`}>
                              <CheckCircle className="h-4 w-4" />
                              <span>{statusMeta.label}</span>
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

        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-slate-200 bg-white">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl text-slate-900">Start task</DialogTitle>
              <DialogDescription>Review the task details before you begin.</DialogDescription>
            </DialogHeader>

            {selectedTask && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
                      {selectedTask.platform}
                    </Badge>
                    <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">
                      {selectedTask.reward_points} points
                    </Badge>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{selectedTask.title}</p>
                </div>

                {'description' in selectedTask && selectedTask.description && (
                  <div className="space-y-2">
                    <Label className="text-slate-700">Description</Label>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                      {selectedTask.description}
                    </div>
                  </div>
                )}

                {'requirements' in selectedTask && selectedTask.requirements && (
                  <div className="space-y-2">
                    <Label className="text-slate-700">Requirements</Label>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 whitespace-pre-wrap">
                      {selectedTask.requirements}
                    </div>
                  </div>
                )}

                {'url' in selectedTask && selectedTask.url && (
                  <div className="space-y-2">
                    <Label className="text-slate-700">Task link</Label>
                    <a
                      href={selectedTask.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 break-all text-sm text-emerald-700 hover:text-emerald-800"
                    >
                      {selectedTask.url}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Start the task only when you are ready to complete the requirements and upload proof right after.
                </div>
              </div>
            )}

            <DialogFooter className="gap-3">
              <Button type="button" variant="outline" onClick={closeTaskDialog}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (selectedTask) startTask(selectedTask.id);
                }}
                disabled={startingTask || !selectedTask}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                {startingTask ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                {startingTask ? 'Starting task' : 'Start task'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-slate-200 bg-white">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl text-slate-900">Submit proof</DialogTitle>
              <DialogDescription>Upload proof of completion and describe what you completed.</DialogDescription>
            </DialogHeader>

            {selectedTask && (
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-slate-900">{selectedTask.title}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
                      {selectedTask.platform}
                    </Badge>
                    <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">
                      {selectedTask.reward_points} points
                    </Badge>
                    {selectedTask.reward_coins > 0 && (
                      <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
                        {selectedTask.reward_coins} coins
                      </Badge>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Add a clear screenshot or image under 5 MB, then describe the steps you completed.
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proof-image" className="text-slate-700">Proof image</Label>
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <Input
                      id="proof-image"
                      type="file"
                      accept="image/*"
                      onChange={handleDialogImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="proof-image" className="flex cursor-pointer flex-col items-center gap-3">
                      <div className="rounded-2xl bg-white p-4 text-slate-500 shadow-sm">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-700">
                          {proofImages[selectedTask.id] ? proofImages[selectedTask.id]?.name : 'Choose an image to upload'}
                        </p>
                        <p className="text-xs text-slate-500">PNG, JPG, or GIF up to 5 MB</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proof-description" className="text-slate-700">Proof description</Label>
                  <Textarea
                    id="proof-description"
                    placeholder="Describe how you completed the task and what the uploaded proof shows."
                    value={proofDescriptions[selectedTask.id] || ''}
                    onChange={(e) => setProofDescriptions(prev => ({ ...prev, [selectedTask.id]: e.target.value }))}
                    className="min-h-[140px] border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                    rows={6}
                  />
                  <p className="text-xs text-slate-500">
                    {proofDescriptions[selectedTask.id]?.length || 0} characters
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-3">
              <Button type="button" variant="outline" onClick={closeProofDialog}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (selectedTask) submitProof(selectedTask);
                }}
                disabled={uploadingTasks[selectedTask?.id || 0] || !proofDescriptions[selectedTask?.id || 0]?.trim() || !proofImages[selectedTask?.id || 0]}
                className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {uploadingTasks[selectedTask?.id || 0] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {uploadingTasks[selectedTask?.id || 0] ? 'Submitting proof' : 'Submit proof'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
