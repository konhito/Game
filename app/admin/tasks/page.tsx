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
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  TrendingUp,
  Clock,
  Users,
  Calendar,
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

interface Task {
  id: number;
  title: string;
  description: string;
  platform: string;
  task_type: string;
  requirements: string;
  reward_points: number;
  reward_coins: number;
  max_participants: number;
  current_participants: number;
  status: string;
  priority: string;
  featured: boolean;
  deadline: string;
  url?: string;
  created_at: string;
  created_by: number;
  created_by_name: string;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    platform: '',
    task_type: '',
    requirements: '',
    reward_points: 0,
    reward_coins: 0,
    max_participants: 100,
    priority: 'medium',
    featured: false,
    deadline: '',
    url: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [currentPage, statusFilter, platformFilter, priorityFilter, featuredFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await taskService.getAllTasks({
        page: currentPage,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        platform: platformFilter === 'all' ? undefined : platformFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        featured: featuredFilter === 'all' ? undefined : featuredFilter
      });
      if (result.success) {
        setTasks(result.data.tasks || []);
        setTotalPages(result.data.pagination?.pages || 1);
      } else {
        setError(result.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTasks();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchTasks();
  };

  const openCreateDialog = () => {
    setTaskForm({
      title: '',
      description: '',
      platform: '',
      task_type: '',
      requirements: '',
      reward_points: 0,
      reward_coins: 0,
      max_participants: 100,
      priority: 'medium',
      featured: false,
      deadline: '',
      url: ''
    });
    setShowCreateDialog(true);
  };

  const closeCreateDialog = () => {
    setShowCreateDialog(false);
    setTaskForm({
      title: '',
      description: '',
      platform: '',
      task_type: '',
      requirements: '',
      reward_points: 0,
      reward_coins: 0,
      max_participants: 100,
      priority: 'medium',
      featured: false,
      deadline: '',
      url: ''
    });
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      platform: task.platform,
      task_type: task.task_type,
      requirements: task.requirements,
      reward_points: task.reward_points,
      reward_coins: task.reward_coins,
      max_participants: task.max_participants,
      priority: task.priority,
      featured: task.featured,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
      url: task.url || ''
    });
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setSelectedTask(null);
    setTaskForm({
      title: '',
      description: '',
      platform: '',
      task_type: '',
      requirements: '',
      reward_points: 0,
      reward_coins: 0,
      max_participants: 100,
      priority: 'medium',
      featured: false,
      deadline: '',
      url: ''
    });
  };

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedTask(null);
  };

  const openViewDialog = (task: Task) => {
    setSelectedTask(task);
    setShowViewDialog(true);
  };

  const closeViewDialog = () => {
    setShowViewDialog(false);
    setSelectedTask(null);
  };

  const handleCreateTask = async () => {
    try {
      setCreating(true);
      const result = await taskService.createTask(taskForm);
      
      if (result.success) {
        toast.success('Task created successfully!');
        closeCreateDialog();
        fetchTasks();
      } else {
        toast.error(result.error || 'Failed to create task');
      }
    } catch (err) {
      toast.error('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleEditTask = async () => {
    if (!selectedTask) return;

    try {
      setEditing(true);
      const result = await taskService.updateTask(selectedTask.id, taskForm);
      
      if (result.success) {
        toast.success('Task updated successfully!');
        closeEditDialog();
        fetchTasks();
      } else {
        toast.error(result.error || 'Failed to update task');
      }
    } catch (err) {
      toast.error('Failed to update task');
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      setDeleting(true);
      const result = await taskService.deleteTask(selectedTask.id);
      
      if (result.success) {
        toast.success('Task deleted successfully!');
        closeDeleteDialog();
        setTasks(tasks.filter(t => t.id !== selectedTask.id));
        
        // Refresh the list
        if (tasks.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchTasks();
        }
      } else {
        toast.error(result.error || 'Failed to delete task');
      }
    } catch (err) {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-lg">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Management</h1>
        <p className="text-gray-600">
          Create, edit, and manage all tasks on the platform ({tasks.length} tasks)
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); handleFilterChange(); }}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={platformFilter} onValueChange={(value) => { setPlatformFilter(value); handleFilterChange(); }}>
            <SelectTrigger>
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
          
          <Select value={priorityFilter} onValueChange={(value) => { setPriorityFilter(value); handleFilterChange(); }}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={featuredFilter} onValueChange={(value) => { setFeaturedFilter(value); handleFilterChange(); }}>
            <SelectTrigger>
              <SelectValue placeholder="Featured" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="true">Featured Only</SelectItem>
              <SelectItem value="false">Not Featured</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
          <Button onClick={fetchTasks} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
                    <Card>
            <CardContent className="p-8 text-center">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tasks found</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Task Basic Info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{task.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(task.status)} text-xs`}>
                          {task.status}
                        </Badge>
                        <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                          {task.priority}
                        </Badge>
                        {task.featured && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span>{task.current_participants}/{task.max_participants}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3 text-gray-500" />
                        <span>{task.reward_points} pts</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span>₽{task.reward_coins}</span>
                      </span>
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">Task Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform:</span>
                        <span className="font-medium capitalize">{task.platform}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{task.task_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{new Date(task.created_at).toLocaleDateString()}</span>
                      </div>
                      {task.deadline && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deadline:</span>
                          <span className="font-medium">{new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      {task.url && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">URL:</span>
                          <a 
                            href={task.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-800 underline truncate max-w-48"
                          >
                            {task.url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">Requirements</h4>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 line-clamp-3">
                        {task.requirements}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">Actions</h4>
                    <div className="space-y-2">
                      <Button
                        onClick={() => openViewDialog(task)}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        onClick={() => openEditDialog(task)}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => openDeleteDialog(task)}
                        size="sm"
                        variant="destructive"
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
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

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to the platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select value={taskForm.platform} onValueChange={(value) => setTaskForm({...taskForm, platform: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task_type">Task Type</Label>
                <Select value={taskForm.task_type} onValueChange={(value) => setTaskForm({...taskForm, task_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="like">Like</SelectItem>
                    <SelectItem value="share">Share</SelectItem>
                    <SelectItem value="follow">Follow</SelectItem>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="subscribe">Subscribe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({...taskForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={taskForm.requirements}
                onChange={(e) => setTaskForm({...taskForm, requirements: e.target.value})}
                placeholder="Enter task requirements"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="reward_points">Reward Points</Label>
                <Input
                  id="reward_points"
                  type="number"
                  value={taskForm.reward_points}
                  onChange={(e) => setTaskForm({...taskForm, reward_points: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="reward_coins">Reward Coins</Label>
                <Input
                  id="reward_coins"
                  type="number"
                  step="0.01"
                  value={taskForm.reward_coins}
                  onChange={(e) => setTaskForm({...taskForm, reward_coins: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={taskForm.max_participants}
                  onChange={(e) => setTaskForm({...taskForm, max_participants: parseInt(e.target.value) || 100})}
                  placeholder="100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="featured"
                  type="checkbox"
                  checked={taskForm.featured}
                  onChange={(e) => setTaskForm({...taskForm, featured: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="featured">Featured Task</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeCreateDialog}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={creating}>
              {creating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task: {selectedTask?.title}</DialogTitle>
            <DialogDescription>
              Update task information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Same form fields as create dialog */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Task Title</Label>
                <Input
                  id="edit-title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-platform">Platform</Label>
                <Select value={taskForm.platform} onValueChange={(value) => setTaskForm({...taskForm, platform: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-task_type">Task Type</Label>
                <Select value={taskForm.task_type} onValueChange={(value) => setTaskForm({...taskForm, task_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="like">Like</SelectItem>
                    <SelectItem value="share">Share</SelectItem>
                    <SelectItem value="follow">Follow</SelectItem>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="subscribe">Subscribe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({...taskForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-requirements">Requirements</Label>
              <Textarea
                id="edit-requirements"
                value={taskForm.requirements}
                onChange={(e) => setTaskForm({...taskForm, requirements: e.target.value})}
                placeholder="Enter task requirements"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-reward_points">Reward Points</Label>
                <Input
                  id="edit-reward_points"
                  type="number"
                  value={taskForm.reward_points}
                  onChange={(e) => setTaskForm({...taskForm, reward_points: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-reward_coins">Reward Coins</Label>
                <Input
                  id="edit-reward_coins"
                  type="number"
                  step="0.01"
                  value={taskForm.reward_coins}
                  onChange={(e) => setTaskForm({...taskForm, reward_coins: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-max_participants">Max Participants</Label>
                <Input
                  id="edit-max_participants"
                  type="number"
                  value={taskForm.max_participants}
                  onChange={(e) => setTaskForm({...taskForm, max_participants: parseInt(e.target.value) || 100})}
                  placeholder="100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-deadline">Deadline (Optional)</Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="edit-featured"
                  type="checkbox"
                  checked={taskForm.featured}
                  onChange={(e) => setTaskForm({...taskForm, featured: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit-featured">Featured Task</Label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-url">URL (Optional)</Label>
              <Input
                id="edit-url"
                type="url"
                placeholder="https://example.com"
                value={taskForm.url}
                onChange={(e) => setTaskForm({...taskForm, url: e.target.value})}
              />
              <p className="text-sm text-gray-500 mt-1">
                Paste the URL that users need to visit for this task
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              Cancel
            </Button>
            <Button onClick={handleEditTask} disabled={editing}>
              {editing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Task Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTask?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-800">
                This will permanently remove the task and all associated data.
              </span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteTask} 
              disabled={deleting}
              variant="destructive"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details: {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={`${getStatusColor(selectedTask.status)} mt-1`}>
                    {selectedTask.status}
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={`${getPriorityColor(selectedTask.priority)} mt-1`}>
                    {selectedTask.priority}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="mt-1 text-sm text-gray-700">{selectedTask.description}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Requirements</Label>
                <p className="mt-1 text-sm text-gray-700">{selectedTask.requirements}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Platform</Label>
                  <p className="mt-1 text-sm text-gray-700 capitalize">{selectedTask.platform}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Task Type</Label>
                  <p className="mt-1 text-sm text-gray-700 capitalize">{selectedTask.task_type}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Created By</Label>
                  <p className="mt-1 text-sm text-gray-700">{selectedTask.created_by_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Reward Points</Label>
                  <p className="mt-1 text-sm text-gray-700">{selectedTask.reward_points} pts</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Reward Coins</Label>
                  <p className="mt-1 text-sm text-gray-700">₽{selectedTask.reward_coins}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Participants</Label>
                  <p className="mt-1 text-sm text-gray-700">{selectedTask.current_participants}/{selectedTask.max_participants}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created Date</Label>
                  <p className="mt-1 text-sm text-gray-700">{new Date(selectedTask.created_at).toLocaleString()}</p>
                </div>
                
                {selectedTask.deadline && (
                  <div>
                    <Label className="text-sm font-medium">Deadline</Label>
                    <p className="mt-1 text-sm text-gray-700">{new Date(selectedTask.deadline).toLocaleString()}</p>
                  </div>
                )}
                
                {selectedTask.url && (
                  <div>
                    <Label className="text-sm font-medium">URL</Label>
                    <a 
                      href={selectedTask.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-blue-600 hover:text-blue-800 underline block break-all"
                    >
                      {selectedTask.url}
                    </a>
                  </div>
                )}
              </div>
              
              {selectedTask.featured && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
                    <span className="text-sm text-purple-700">This task is featured on the platform</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeViewDialog}>
              Close
            </Button>
            {selectedTask && (
              <Button onClick={() => { closeViewDialog(); openEditDialog(selectedTask); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
