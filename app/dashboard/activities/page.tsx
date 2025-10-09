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
  RefreshCw
} from 'lucide-react';
import { AIVerificationBadge, AIVerificationDetails } from '@/components/ui/ai-verification-badge';
import { dashboardService } from '@/lib/dashboard-service';
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

export default function ActivitiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [availableTasks, setAvailableTasks] = useState<AvailableTask[]>([]);
  const [startedTasks, setStartedTasks] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<AvailableTask | TaskActivity | null>(null);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofDescription, setProofDescription] = useState('');
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [startingTask, setStartingTask] = useState(false);
  const [refreshingTasks, setRefreshingTasks] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (!token || !userStr) {
      router.push('/sign-in');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      
      // Stagger API calls to prevent rate limiting
      const loadData = async () => {
        console.log('🔄 Loading dashboard data with staggered requests...');
        
        try {
          // Load available tasks
          await fetchAvailableTasks();
          
          // Load started tasks
          await fetchStartedTasks(userData.id);
          
          console.log('✅ All dashboard data loaded');
        } catch (error) {
          console.error('❌ Error loading dashboard data:', error);
        } finally {
          // Always set loading to false, regardless of success or failure
          setLoading(false);
        }
      };
      
      loadData();
    } catch (error) {
      console.error('Failed to parse user data:', error);
      router.push('/sign-in');
    }
  }, []);



  const fetchAvailableTasks = async () => {
    try {
      setRefreshingTasks(true);
      console.log('🔄 Fetching available tasks...');
      const result = await taskService.getAvailableTasks({ limit: 20 });
      if (result.success) {
        console.log('📋 Available tasks from API:', result.data.tasks);
        console.log('📋 Task IDs from API:', result.data.tasks.map((t: any) => t.id));
        setAvailableTasks(result.data.tasks || []);
      } else {
        console.error('❌ Failed to fetch tasks:', result.error);
      }
    } catch (err) {
      console.error('Failed to fetch available tasks:', err);
    } finally {
      setRefreshingTasks(false);
    }
  };

  const fetchStartedTasks = async (userId: number) => {
    try {
      console.log('🔄 Fetching started tasks...');
      const result = await taskService.getUserTaskHistory({ limit: 10 });
      if (result.success) {
        // Filter only started tasks
        const startedTasksOnly = (result.data.tasks || [])
          .filter((task: any) => task.status === 'started')
          .map((task: any) => ({
            ...task,
            title: task.title || 'Untitled Task',
            platform: task.platform || 'Unknown Platform',
            task_type: task.task_type || 'Unknown Type',
            reward_points: task.reward_points || 0,
            reward_coins: task.reward_coins || 0,
            user_name: user?.name || "User",
            completed_at: task.completed_at || null,
            proof_image: task.proof_image || null,
            proof_description: task.proof_description || null,
            ai_verification: task.ai_verification || null
          }));
        
        console.log('✅ Started tasks loaded:', startedTasksOnly.length);
        setStartedTasks(startedTasksOnly);
      } else {
        console.error('❌ Failed to fetch started tasks:', result.error);
        setStartedTasks([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch started tasks:', err);
      setStartedTasks([]);
    }
  };

  // Function to check if a task is available for the current user
  const isTaskAvailable = (taskId: number) => {
    // Check if task exists in available tasks
    return availableTasks.some(task => task.id === taskId);
  };


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      setProofImage(file);
      setError(null);
    }
  };

  const openProofDialog = (task: TaskActivity) => {
    console.log('🔍 Opening proof dialog for task:', task);
    console.log('🔍 Task ID being set:', task.id);
    // Only allow proof submission for started tasks
    if (task.status !== 'started') {
      setError('You must start the task before submitting proof.');
      toast.error('You must start the task before submitting proof.');
      return;
    }
    setSelectedTask(task);
    setProofImage(null);
    setProofDescription('');
    setShowProofDialog(true);
  };

  const closeProofDialog = () => {
    setShowProofDialog(false);
    setSelectedTask(null);
    setProofImage(null);
    setProofDescription('');
  };

  const openTaskDialog = (task: AvailableTask | TaskActivity) => {
    console.log('🔍 Opening task dialog for task:', task);
    console.log('🔍 Task ID being set:', task.id);
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
      console.log('📊 Start task result:', result);
      
      if (result.success) {
        toast.success('Task started successfully!');
        
        // Update selectedTask status if it's the same task
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            status: 'started'
          });
        }
        
        // Refresh started tasks to show the newly started task
        await fetchStartedTasks(user.id);
        
        closeTaskDialog();
      } else {
        console.error('❌ Failed to start task:', result.error);
        toast.error(result.error || 'Failed to start task');
      }
    } catch (err) {
      console.error('❌ Failed to start task:', err);
      toast.error('Failed to start task. Please try again.');
    } finally {
      setStartingTask(false);
    }
  };

  const submitProof = async () => {
    if (!selectedTask || !proofDescription.trim()) {
      setError('Please provide a description for your proof');
      return;
    }

    if (!proofImage) {
      setError('Please upload an image as proof of task completion');
      return;
    }

    console.log('🚀 Starting proof submission for task:', selectedTask.id);
    console.log('📝 Proof description:', proofDescription);
    console.log('🖼️ Has proof image:', !!proofImage);

    // Validate that this is a started task (should be checked before opening dialog)
    if (selectedTask.status !== 'started') {
      setError('You must start the task before submitting proof.');
      toast.error('You must start the task before submitting proof.');
      return;
    }

    setUploading(true);
    try {
      if (proofImage) {
        console.log('🔄 Converting image to base64...');
        // Convert file to base64 using Promise-based approach
        const proofImageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            console.log('✅ Image converted to base64 successfully');
            resolve(reader.result as string);
          };
          reader.onerror = () => {
            console.error('❌ Failed to read image file');
            reject(new Error('Failed to read image file'));
          };
          reader.readAsDataURL(proofImage);
        });
        
        console.log('📤 Submitting proof with image to backend...');
        // Submit proof with image
        const result = await taskService.completeTask({
          task_id: selectedTask.id,
          proof_description: proofDescription,
          proof_image_base64: proofImageBase64
        });
        
        console.log('📥 Backend response:', result);
        
        if (result.success) {
          console.log('✅ Proof submitted successfully!');
          
          // Show different messages based on AI verification
          if (result.ai_verification) {
            if (result.ai_verification.verified) {
              toast.success(`🎉 Task approved by AI! ${result.message}`);
            } else {
              toast.error(`❌ Task rejected by AI: ${result.ai_verification.reason}`);
            }
          } else {
            toast.success('Proof submitted successfully! Your task is now under review.');
          }
          
          // Refresh started tasks to remove completed task
          await fetchStartedTasks(user.id);
          
          closeProofDialog();
          setError(null);
        } else {
          console.error('❌ Backend returned error:', result.error);
          toast.error(result.error || 'Failed to submit proof');
        }
      }
    } catch (err) {
      console.error('❌ Exception during proof submission:', err);
      setError('Failed to submit proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };




  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'started': return 'bg-blue-100 text-blue-800';
      case 'unknown': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 bg-slate-200 rounded-lg w-48 mb-2 animate-pulse"></div>
              <div className="h-5 bg-slate-200 rounded-lg w-96 animate-pulse"></div>
            </div>

            {/* Available Tasks Skeleton */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-8 bg-slate-200 rounded w-64 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-96 animate-pulse"></div>
                </div>
                <div className="h-9 bg-slate-200 rounded w-24 animate-pulse"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="bg-white/90 border-slate-200/50 shadow-xl backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="h-6 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
                            <div className="h-4 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
                            <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                          </div>
                          <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-slate-200 rounded-full w-20 animate-pulse"></div>
                          <div className="h-6 bg-slate-200 rounded-full w-16 animate-pulse"></div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
                              <div>
                                <div className="h-3 bg-slate-200 rounded w-12 mb-1 animate-pulse"></div>
                                <div className="h-5 bg-slate-200 rounded w-16 animate-pulse"></div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
                              <div>
                                <div className="h-3 bg-slate-200 rounded w-16 mb-1 animate-pulse"></div>
                                <div className="h-4 bg-slate-200 rounded w-12 animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="h-12 bg-slate-200 rounded-xl w-full animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Available Tasks
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Discover and start new tasks to earn points and rewards
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-emerald-700">Live Tasks</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-200">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700">AI Verified</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Available Tasks Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  Available Tasks
                  <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-200">
                    {availableTasks.length} available
                  </Badge>
                </h2>
                <p className="text-slate-600 mt-2">Discover new tasks and start earning rewards</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  console.log('🔄 Force refreshing tasks...');
                  fetchAvailableTasks();
                }}
                disabled={refreshingTasks}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshingTasks ? 'animate-spin' : ''}`} />
                {refreshingTasks ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
        
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {refreshingTasks && (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p className="text-slate-500 text-lg">Updating available tasks...</p>
                </div>
              )}
              {!refreshingTasks && availableTasks.map((task, index) => {
                const colors = [
                  'bg-emerald-500',
                  'bg-slate-600',
                  'bg-emerald-500',
                  'bg-slate-600'
                ];
                const cardColor = colors[index % colors.length];
                
                return (
                  <Card key={task.id} className="group hover:shadow-lg transition-all duration-300 border border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Task Header */}
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900 text-lg line-clamp-2 group-hover:text-slate-700 transition-colors">
                                {task.title}
                              </h3>
                              <p className="text-sm text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                                {task.description}
                              </p>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <div className={`w-12 h-12 ${cardColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                <TrendingUp className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Task Details */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                              {task.platform}
                            </Badge>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              {task.task_type}
                            </Badge>
                          </div>
                          
                          {/* Rewards & Stats */}
                          <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 ${cardColor} rounded-lg flex items-center justify-center`}>
                                  <TrendingUp className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 font-medium">Reward</p>
                                  <p className="text-lg font-bold text-slate-900">{task.reward_points} pts</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-slate-500 font-medium">Participants</p>
                                  <p className="text-sm font-bold text-slate-900">
                                    {task.current_participants}/{task.max_participants || '∞'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {task.reward_coins > 0 && (
                              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                                <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">₽</span>
                                </div>
                                <span className="text-sm font-medium text-slate-700">
                                  +{task.reward_coins} PineCoins
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <Button 
                          onClick={() => openTaskDialog(task)} 
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 transition-all duration-300"
                          size="lg"
                        >
                          <Play className="h-5 w-5 mr-2" />
                          Start Task
                        </Button>
                       </div>
                     </CardContent>
                   </Card>
                 );
               })}
           
              {!refreshingTasks && availableTasks.length === 0 && (
                <Card className="col-span-full bg-white border border-slate-200 shadow-sm">
                  <CardContent className="p-16 text-center">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ClipboardList className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Available Tasks</h3>
                    <p className="text-slate-500 text-lg mb-6">Check back later for new opportunities!</p>
                    <Button 
                      onClick={fetchAvailableTasks}
                      variant="outline" 
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check Again
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Started Tasks Section - For Proof Submission */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  Submit Proof
                </h2>
                <p className="text-slate-600 mt-2">Upload proof for tasks you've started</p>
              </div>
            </div>
        
            {startedTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {startedTasks.map((task, index) => {
                  const colors = [
                    'bg-slate-600',
                    'bg-emerald-500',
                    'bg-slate-600',
                    'bg-emerald-500'
                  ];
                  const cardColor = colors[index % colors.length];
                  
                  return (
                    <Card key={task.id} className="group bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Task Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900 text-lg mb-2">{task.title}</h3>
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                  {task.platform}
                                </Badge>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                  {task.task_type}
                                </Badge>
                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                  Started
                                </Badge>
                              </div>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <div className={`w-12 h-12 ${cardColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                <Upload className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Task Details */}
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 ${cardColor} rounded-lg flex items-center justify-center`}>
                                  <TrendingUp className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 font-medium">Reward</p>
                                  <p className="text-lg font-bold text-slate-900">{task.reward_points} pts</p>
                                </div>
                              </div>
                              {task.reward_coins > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">₽</span>
                                  </div>
                                  <span className="text-sm font-medium text-slate-700">
                                    +{task.reward_coins} PineCoins
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Started Date */}
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="h-4 w-4" />
                            <span>Started: {new Date(task.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          {/* Submit Proof Button */}
                          <Button 
                            onClick={() => openProofDialog(task)} 
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 transition-all duration-300"
                            size="lg"
                          >
                            <Upload className="h-5 w-5 mr-2" />
                            Submit Proof
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-white border border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Submit Proof?</h3>
                    <p className="text-slate-600 mb-6">
                      Once you start a task, it will appear here for proof submission.
                    </p>
                    <div className="bg-slate-50 rounded-xl p-4 max-w-md mx-auto border border-slate-200">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">i</span>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-slate-900 mb-1">How it works:</p>
                          <ol className="text-xs text-slate-700 space-y-1">
                            <li>1. Start a task from the available tasks above</li>
                            <li>2. Complete the task requirements</li>
                            <li>3. Return here to upload proof</li>
                            <li>4. AI will verify your submission automatically</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
      </div>

          {/* Task Start Dialog */}
          <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Start/Restart Task
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Are you sure you want to start or restart this task? Once started, you'll need to complete it and submit proof.
                </DialogDescription>
              </DialogHeader>
              
              {selectedTask && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl p-4 border border-slate-200">
                    <Label className="text-sm font-medium text-slate-700">Task</Label>
                    <p className="text-sm text-slate-700 font-medium">{selectedTask.title}</p>
                  </div>
                  {'requirements' in selectedTask && (
                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-100">
                      <Label className="text-sm font-medium text-emerald-700">Requirements</Label>
                      <p className="text-sm text-slate-700">{selectedTask.requirements}</p>
                    </div>
                  )}
                  {'url' in selectedTask && selectedTask.url && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                      <Label className="text-sm font-medium text-blue-700">Task URL</Label>
                      <div className="mt-2">
                        <a 
                          href={selectedTask.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {selectedTask.url}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-3 border border-emerald-100">
                      <Label className="text-sm font-medium text-emerald-700">Reward</Label>
                      <p className="text-sm text-slate-700 font-bold">{selectedTask.reward_points} points</p>
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl p-3 border border-blue-100">
                      <Label className="text-sm font-medium text-blue-700">Platform</Label>
                      <p className="text-sm text-slate-700 font-medium">{selectedTask.platform}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={closeTaskDialog} className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                  Cancel
                </Button>
                <Button 
                  onClick={() => selectedTask && startTask(selectedTask.id)}
                  disabled={startingTask || !selectedTask}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                >
                  {startingTask ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start/Restart Task
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Proof Submission Dialog */}
          <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
            <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Submit Task Proof
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Upload proof that you've completed the task. AI will automatically verify your submission.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <Label htmlFor="proof-image" className="text-slate-700 font-medium">Proof Image *</Label>
                  <Input
                    id="proof-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    required
                    className="mt-2 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                  />
                  <p className="text-xs text-slate-600 mt-2">
                    Upload an image showing task completion. Max 5MB. <span className="text-red-500 font-medium">Required</span>
                  </p>
                </div>
                
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <Label htmlFor="proof-description" className="text-emerald-700 font-medium">Proof Description *</Label>
                  <Textarea
                    id="proof-description"
                    placeholder="Describe how you completed the task..."
                    value={proofDescription}
                    onChange={(e) => setProofDescription(e.target.value)}
                    className="mt-2 rounded-xl border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                    rows={3}
                  />
                </div>
                
                {error && (
                  <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={closeProofDialog} className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                  Cancel
                </Button>
                <Button 
                  onClick={submitProof}
                  disabled={uploading || !proofDescription.trim() || !proofImage}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

