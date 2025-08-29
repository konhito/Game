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

interface ActivityItem {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  activity_type: string;
  description: string;
  metadata: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

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
  created_at: string;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [tasks, setTasks] = useState<TaskActivity[]>([]);
  const [availableTasks, setAvailableTasks] = useState<AvailableTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [taskFilter, setTaskFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<ActivityItem | TaskActivity | null>(null);
  const [selectedTask, setSelectedTask] = useState<AvailableTask | TaskActivity | null>(null);
  const [taskStats, setTaskStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    total_points: 0,
    total_coins: 0,
    completion_rate: 0
  });
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
      fetchActivities(userData.id);
      fetchTasks(userData.id);
      fetchAvailableTasks();
    } catch (error) {
      console.error('Failed to parse user data:', error);
      router.push('/sign-in');
    }
  }, []);

  const fetchActivities = async (userId: number) => {
    try {
      const result = await dashboardService.getUserActivities(userId, 50);
      if (result.success) {
        setActivities(result.data.activities || []);
      } else {
        setError(result.error || 'Failed to fetch activities');
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
      setError('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (userId: number) => {
    try {
      const result = await taskService.getUserTaskHistory({ limit: 50 });
      if (result.success) {
        // Transform tasks to include user information
        const tasksWithUsers = (result.data.tasks || []).map((task: any) => ({
          ...task,
          title: task.title || task.task?.title || 'Untitled Task',
          platform: task.platform || task.task?.platform || 'Unknown Platform',
          task_type: task.task_type || task.task?.task_type || 'Unknown Type',
          reward_points: task.reward_points || task.task?.reward_points || 0,
          reward_coins: task.reward_coins || task.task?.reward_coins || 0,
          user_name: user?.name || "User",
          completed_at: task.completed_at || null,
          proof_image: task.proof_image || null,
          proof_description: task.proof_description || null
        }));
        setTasks(tasksWithUsers);
        calculateTaskStats();
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const fetchAvailableTasks = async () => {
    try {
      setRefreshingTasks(true);
      const result = await taskService.getAvailableTasks({ limit: 20 });
      if (result.success) {
        setAvailableTasks(result.data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to fetch available tasks:', err);
    } finally {
      setRefreshingTasks(false);
    }
  };

  // Function to check if a task is available for the current user
  const isTaskAvailable = (taskId: number) => {
    // Check if task exists in available tasks
    return availableTasks.some(task => task.id === taskId);
  };

  const calculateTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'approved').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const totalPoints = tasks.reduce((sum, t) => sum + (Number(t.reward_points) || 0), 0);
    const totalCoins = tasks.reduce((sum, t) => sum + (Number(t.reward_coins) || 0), 0);
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    setTaskStats({
      total_tasks: total,
      completed_tasks: completed,
      pending_tasks: pending,
      total_points: totalPoints,
      total_coins: totalCoins,
      completion_rate: completionRate
    });
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

  const openTaskDialog = (task: AvailableTask) => {
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
        toast.success('Task started successfully!');
        // Refresh both task lists to ensure UI is up to date
        await Promise.all([
          fetchTasks(user.id),
          fetchAvailableTasks()
        ]);
        closeTaskDialog();
      } else {
        toast.error(result.error || 'Failed to start task');
      }
    } catch (err) {
      console.error('Failed to start task:', err);
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

    console.log('🚀 Starting proof submission for task:', selectedTask.id);
    console.log('📝 Proof description:', proofDescription);
    console.log('🖼️ Has proof image:', !!proofImage);

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
          toast.success('Proof submitted successfully! Your task is now under review.');
          // Refresh both task lists to ensure UI is up to date
          await Promise.all([
            fetchTasks(user.id),
            fetchAvailableTasks()
          ]);
          closeProofDialog();
          setError(null);
        } else {
          console.error('❌ Backend returned error:', result.error);
          toast.error(result.error || 'Failed to submit proof');
        }
      } else {
        console.log('📤 Submitting proof without image to backend...');
        // Submit without image
        const result = await taskService.completeTask({
          task_id: selectedTask.id,
          proof_description: proofDescription
        });
        
        console.log('📥 Backend response:', result);
        
        if (result.success) {
          console.log('✅ Proof submitted successfully!');
          toast.success('Proof submitted successfully! Your task is now under review.');
          // Refresh both task lists to ensure UI is up to date
          await Promise.all([
            fetchTasks(user.id),
            fetchAvailableTasks()
          ]);
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

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      (activity.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.activity_type || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.platform || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <User className="h-4 w-4" />;
      case 'start_task': return <ClipboardList className="h-4 w-4" />;
      case 'complete_task': return <CheckCircle className="h-4 w-4" />;
      case 'admin_action': return <TrendingUp className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-blue-100 text-blue-800';
      case 'start_task': return 'bg-yellow-100 text-yellow-800';
      case 'complete_task': return 'bg-green-100 text-green-800';
      case 'admin_action': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const openItem = (item: any) => {
    setSelectedItem(item);
  };

  const closeItem = () => {
    setSelectedItem(null);
  };

  const handleFilterChange = () => {
    if (user) {
      fetchActivities(user.id);
      fetchTasks(user.id);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-lg text-slate-600">Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Activities</h1>
          <p className="text-slate-600 mt-2">
            Track all your activities, task completions, and point earnings
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-900">{taskStats.total_tasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{taskStats.completed_tasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{taskStats.pending_tasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Points</p>
                <p className="text-2xl font-bold text-purple-900">{taskStats.total_points}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Tasks Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Available Tasks ({availableTasks.length})</h2>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => fetchAvailableTasks()}
            disabled={refreshingTasks}
            className="rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshingTasks ? 'animate-spin' : ''}`} />
            {refreshingTasks ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {refreshingTasks && (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p className="text-slate-500">Updating available tasks...</p>
            </div>
          )}
          {!refreshingTasks && availableTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">{task.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs rounded-lg">
                        {task.platform}
                      </Badge>
                      <Badge variant="outline" className="text-xs rounded-lg">
                        {task.task_type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium">{task.reward_points} pts</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{task.current_participants}/{task.max_participants || '∞'}</span>
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => openTaskDialog(task)} 
                    className="w-full rounded-xl"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start/Restart Task
                                     </Button>
                 </div>
               </CardContent>
             </Card>
           ))}
           
           {!refreshingTasks && availableTasks.length === 0 && (
            <Card className="col-span-full border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <ClipboardList className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg font-medium">No available tasks at the moment</p>
                <p className="text-slate-400 mt-2">Check back later for new opportunities!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search activities and tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-slate-200"
            />
          </div>
          <Select value={dateFilter} onValueChange={(value) => { setDateFilter(value); handleFilterChange(); }}>
            <SelectTrigger className="w-32 rounded-xl border-slate-200">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-3">
          <Select value={activityFilter} onValueChange={(value) => { setActivityFilter(value); handleFilterChange(); }}>
            <SelectTrigger className="w-40 rounded-xl border-slate-200">
              <SelectValue placeholder="Activity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="login">Logins</SelectItem>
              <SelectItem value="start_task">Task Started</SelectItem>
              <SelectItem value="complete_task">Task Completed</SelectItem>
              <SelectItem value="admin_action">Admin Actions</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={taskFilter} onValueChange={(value) => { setTaskFilter(value); handleFilterChange(); }}>
            <SelectTrigger className="w-40 rounded-xl border-slate-200">
              <SelectValue placeholder="Task Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="started">Started</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Activities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">User Activities ({filteredActivities.length})</h2>
            <Button size="sm" variant="outline" className="rounded-xl">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <Card 
                key={activity.id} 
                className={`cursor-pointer transition-all hover:shadow-md border-0 shadow-sm ${
                  selectedItem?.id === activity.id ? 'ring-2 ring-emerald-500' : ''
                }`}
                onClick={() => openItem(activity)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.activity_type)}`}>
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-slate-900">{activity.user_name}</h3>
                        <Badge variant="outline" className="text-xs rounded-lg">
                          {activity.activity_type}
                        </Badge>
                      </div>
                                             <p className="text-sm text-slate-600 mb-2">{activity.description || 'No description'}</p>
                       <div className="flex items-center space-x-4 text-xs text-slate-500">
                         <span className="flex items-center space-x-1">
                           <Clock className="h-3 w-3" />
                           <span>{activity.created_at ? new Date(activity.created_at).toLocaleString() : 'Unknown Date'}</span>
                         </span>
                         <span>{activity.ip_address || 'Unknown IP'}</span>
                       </div>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-lg">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No activities found</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Task Activities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Your Tasks ({filteredTasks.length})</h2>
            <Button size="sm" variant="outline" className="rounded-xl">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card 
                key={task.id} 
                className={`cursor-pointer transition-all hover:shadow-md border-0 shadow-sm ${
                  selectedItem?.id === task.id ? 'ring-2 ring-emerald-500' : ''
                }`}
                onClick={() => openItem(task)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      {task.proof_image ? (
                        <img
                          src={task.proof_image.startsWith('data:') 
                            ? task.proof_image 
                            : `https://casino-backend-obvo.onrender.com/${task.proof_image}`
                          }
                          alt="Task proof"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                                                 <h3 className="font-medium text-slate-900 line-clamp-1">{task.title || 'Untitled Task'}</h3>
                                                 <Badge className={`${getTaskStatusColor(task.status || 'unknown')} rounded-lg`}>
                           {task.status || 'unknown'}
                         </Badge>
                      </div>
                                             <p className="text-sm text-slate-600 mb-2">
                         {task.user_name || 'User'} • {task.platform || 'Unknown'} • {task.task_type || 'Unknown'}
                       </p>
                       <div className="flex items-center space-x-4 text-xs text-slate-500">
                         <span className="flex items-center space-x-1">
                           <TrendingUp className="h-3 w-3" />
                           <span>{task.reward_points || 0} pts, ₽{task.reward_coins || 0}</span>
                         </span>
                         <span className="flex items-center space-x-1">
                           <Calendar className="h-3 w-3" />
                           <span>{task.created_at ? new Date(task.created_at).toLocaleDateString() : 'Unknown Date'}</span>
                         </span>
                       </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                                             {(task.status === 'started' || task.status === 'unknown') && (
                         <Button 
                           size="sm" 
                           onClick={(e) => {
                             e.stopPropagation();
                             openProofDialog(task);
                           }}
                           className="rounded-lg"
                         >
                           <Upload className="h-4 w-4 mr-2" />
                           Submit Proof
                         </Button>
                       )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No tasks found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detail View */}
      {selectedItem && (
        <div className="mt-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900">Activity Details</CardTitle>
                <Button onClick={closeItem} variant="outline" size="sm" className="rounded-xl">
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Information - Only show for ActivityItem */}
              {'user_email' in selectedItem && selectedItem.user_email && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">User Information</span>
                  </div>
                  <p className="text-sm"><strong>Name:</strong> {selectedItem.user_name}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedItem.user_email}</p>
                  <p className="text-sm"><strong>IP Address:</strong> {selectedItem.ip_address}</p>
                  <p className="text-sm"><strong>User Agent:</strong> {selectedItem.user_agent}</p>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Activity Details</span>
                </div>
                <p className="text-sm"><strong>Type:</strong> {'activity_type' in selectedItem ? (selectedItem.activity_type || 'Unknown') : (selectedItem.status || 'Unknown')}</p>
                <p className="text-sm"><strong>Description:</strong> {'description' in selectedItem ? (selectedItem.description || 'No description') : (selectedItem.title || 'No title')}</p>
                <p className="text-sm"><strong>Timestamp:</strong> {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString() : 'Unknown'}</p>
                {'metadata' in selectedItem && selectedItem.metadata && (
                  <p className="text-sm"><strong>Metadata:</strong> {JSON.stringify(selectedItem.metadata, null, 2)}</p>
                )}
              </div>

              {/* Proof Image - Only show for TaskActivity */}
              {'proof_image' in selectedItem && selectedItem.proof_image && (
                <div>
                  <Label className="text-sm font-medium">Proof Image</Label>
                  <div className="mt-2">
                    <img
                      src={selectedItem.proof_image.startsWith('data:') 
                        ? selectedItem.proof_image 
                        : `https://casino-backend-obvo.onrender.com/${selectedItem.proof_image}`
                      }
                      alt="Proof"
                      className="w-full max-h-64 object-contain rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* Proof Description - Only show for TaskActivity */}
              {'proof_description' in selectedItem && selectedItem.proof_description && (
                <div>
                  <Label className="text-sm font-medium">Proof Description</Label>
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700">{selectedItem.proof_description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Task Start Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-md">
                     <DialogHeader>
             <DialogTitle>Start/Restart Task</DialogTitle>
             <DialogDescription>
               Are you sure you want to start or restart this task? Once started, you'll need to complete it and submit proof.
             </DialogDescription>
           </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Task</Label>
                <p className="text-sm text-slate-600">{selectedTask.title}</p>
              </div>
              {'requirements' in selectedTask && (
                <div>
                  <Label className="text-sm font-medium">Requirements</Label>
                  <p className="text-sm text-slate-600">{selectedTask.requirements}</p>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <div>
                  <Label className="text-sm font-medium">Reward</Label>
                  <p className="text-sm text-slate-600">{selectedTask.reward_points} points</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Platform</Label>
                  <p className="text-sm text-slate-600">{selectedTask.platform}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeTaskDialog} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={() => selectedTask && startTask(selectedTask.id)}
              disabled={startingTask || !selectedTask}
              className="rounded-xl"
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Task Proof</DialogTitle>
            <DialogDescription>
              Upload proof that you've completed the task. This will be reviewed by an admin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="proof-image">Proof Image (Optional)</Label>
              <Input
                id="proof-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-1 rounded-xl"
              />
              <p className="text-xs text-slate-500 mt-1">
                Upload an image showing task completion. Max 5MB.
              </p>
            </div>
            
            <div>
              <Label htmlFor="proof-description">Proof Description *</Label>
              <Textarea
                id="proof-description"
                placeholder="Describe how you completed the task..."
                value={proofDescription}
                onChange={(e) => setProofDescription(e.target.value)}
                className="mt-1 rounded-xl"
                rows={3}
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeProofDialog} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={submitProof}
              disabled={uploading || !proofDescription.trim()}
              className="rounded-xl"
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
  );
}
