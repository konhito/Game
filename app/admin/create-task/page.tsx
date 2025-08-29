"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { taskService } from '@/lib/task-service';
import { Plus, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const platforms = [
  'facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin', 'telegram', 'discord'
];

const taskTypes = [
  'like', 'share', 'follow', 'comment', 'subscribe', 'retweet', 'mention', 'review'
];

export default function CreateTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('id');
  const isEditing = !!taskId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: '',
    task_type: '',
    requirements: '',
    reward_points: '',
    reward_coins: '',
    max_participants: '',
    deadline: ''
  });

  useEffect(() => {
    if (isEditing && taskId) {
      fetchTaskForEdit(parseInt(taskId));
    }
  }, [isEditing, taskId]);

  const fetchTaskForEdit = async (id: number) => {
    try {
      setLoading(true);
      const result = await taskService.getTaskById(id);
      if (result.success) {
        const task = result.data;
        setFormData({
          title: task.title || '',
          description: task.description || '',
          platform: task.platform || '',
          task_type: task.task_type || '',
          requirements: task.requirements || '',
          reward_points: task.reward_points?.toString() || '',
          reward_coins: task.reward_coins?.toString() || '',
          max_participants: task.max_participants?.toString() || '',
          deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ''
        });
      } else {
        setError('Failed to fetch task for editing');
      }
    } catch (err) {
      setError('Failed to fetch task for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.platform || !formData.task_type || !formData.requirements) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const taskData = {
        title: formData.title,
        description: formData.description,
        platform: formData.platform,
        task_type: formData.task_type,
        requirements: formData.requirements,
        reward_points: parseInt(formData.reward_points) || 0,
        reward_coins: parseFloat(formData.reward_coins) || 0,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
        deadline: formData.deadline || undefined
      };

      let result;
      if (isEditing && taskId) {
        result = await taskService.updateTask(parseInt(taskId), taskData);
      } else {
        result = await taskService.createTask(taskData);
      }

      if (result.success) {
        setSuccess(isEditing ? 'Task updated successfully!' : 'Task created successfully!');
        
        if (!isEditing) {
          // Reset form only for new tasks
          setFormData({
            title: '',
            description: '',
            platform: '',
            task_type: '',
            requirements: '',
            reward_points: '',
            reward_coins: '',
            max_participants: '',
            deadline: ''
          });
        }

        // Redirect to tasks list after 2 seconds
        setTimeout(() => {
          router.push('/admin/tasks');
        }, 2000);
      } else {
        setError(result.error || `Failed to ${isEditing ? 'update' : 'create'} task`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} task`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Update the task details below' : 'Create a new social media task for users to complete'}
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isEditing ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            <span>{isEditing ? 'Edit Task' : 'Task Details'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Like our Facebook post"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Task Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what users need to do..."
                rows={3}
                required
              />
            </div>

            {/* Platform and Task Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="platform">Social Media Platform *</Label>
                <Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task_type">Task Type *</Label>
                <Select value={formData.task_type} onValueChange={(value) => handleInputChange('task_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label htmlFor="requirements">Detailed Requirements *</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Provide detailed instructions for users..."
                rows={4}
                required
              />
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="reward_points">Reward Points</Label>
                <Input
                  id="reward_points"
                  type="number"
                  value={formData.reward_points}
                  onChange={(e) => handleInputChange('reward_points', e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward_coins">Reward Coins</Label>
                <Input
                  id="reward_coins"
                  type="number"
                  step="0.01"
                  value={formData.reward_coins}
                  onChange={(e) => handleInputChange('reward_coins', e.target.value)}
                  placeholder="0.00"
                  min="0"
                />
              </div>
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="max_participants">Max Participants (Optional)</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => handleInputChange('max_participants', e.target.value)}
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                />
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link href="/admin/tasks">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                ) : (
                  <>
                    {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    {isEditing ? 'Update Task' : 'Create Task'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
