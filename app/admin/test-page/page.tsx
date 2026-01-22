"use client";

import { useState, useEffect } from 'react';
import { taskService } from '@/lib/task-service';
import { dashboardService } from '@/lib/dashboard-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Trash2, 
  Plus, 
  Eye, 
  RefreshCw,
  Bot,
  Trophy,
  BarChart3,
  Upload,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export default function AdminTestPage() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  // Task creation form
  const [taskForm, setTaskForm] = useState({
    title: 'Test Task - Admin Testing',
    description: 'This is a test task created by admin for testing purposes',
    platform: 'youtube',
    task_type: 'like',
    requirements: 'Like the video and provide screenshot proof',
    reward_points: '100',
    reward_coins: '0.1',
    max_participants: '10',
    deadline: '',
    url: 'https://www.youtube.com/watch?v=test'
  });

  // Task deletion
  const [deleteTaskId, setDeleteTaskId] = useState('');
  const [createdTaskId, setCreatedTaskId] = useState<number | null>(null);

  // AI Verification
  const [aiVerificationImage, setAiVerificationImage] = useState<string | null>(null);
  const [aiVerificationTaskId, setAiVerificationTaskId] = useState('');
  const [aiVerificationResult, setAiVerificationResult] = useState<any>(null);

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Leaderboard
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test 1: Create Task
  const testCreateTask = async () => {
    setLoading(true);
    addTestResult({ name: 'Create Task', status: 'pending' });

    try {
      const taskData = {
        title: taskForm.title,
        description: taskForm.description,
        platform: taskForm.platform,
        task_type: taskForm.task_type,
        requirements: taskForm.requirements,
        reward_points: parseInt(taskForm.reward_points) || 0,
        reward_coins: parseFloat(taskForm.reward_coins) || 0,
        max_participants: taskForm.max_participants ? parseInt(taskForm.max_participants) : undefined,
        deadline: taskForm.deadline || undefined,
        url: taskForm.url || undefined
      };

      const result = await taskService.createTask(taskData);

      if (result.success) {
        setCreatedTaskId(result.data.id);
        addTestResult({
          name: 'Create Task',
          status: 'success',
          message: `Task created successfully with ID: ${result.data.id}`,
          data: result.data
        });
        toast.success('Task created successfully!');
      } else {
        addTestResult({
          name: 'Create Task',
          status: 'error',
          message: result.error || 'Failed to create task',
          data: result
        });
        toast.error(result.error || 'Failed to create task');
      }
    } catch (error: any) {
      addTestResult({
        name: 'Create Task',
        status: 'error',
        message: error.message || 'Failed to create task',
        data: error
      });
      toast.error(error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Delete Task
  const testDeleteTask = async () => {
    const taskId = deleteTaskId || createdTaskId;
    
    if (!taskId) {
      toast.error('Please provide a task ID or create a task first');
      return;
    }

    setLoading(true);
    addTestResult({ name: 'Delete Task', status: 'pending' });

    try {
      const result = await taskService.deleteTask(Number(taskId));

      if (result.success) {
        addTestResult({
          name: 'Delete Task',
          status: 'success',
          message: `Task ${taskId} deleted successfully`,
          data: result
        });
        toast.success('Task deleted successfully!');
        if (Number(taskId) === createdTaskId) {
          setCreatedTaskId(null);
        }
      } else {
        addTestResult({
          name: 'Delete Task',
          status: 'error',
          message: result.error || 'Failed to delete task',
          data: result
        });
        toast.error(result.error || 'Failed to delete task');
      }
    } catch (error: any) {
      addTestResult({
        name: 'Delete Task',
        status: 'error',
        message: error.message || 'Failed to delete task',
        data: error
      });
      toast.error(error.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  // Test 3: AI Verification
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAiVerificationImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const testAIVerification = async () => {
    if (!aiVerificationImage) {
      toast.error('Please upload an image first');
      return;
    }

    if (!aiVerificationTaskId && !createdTaskId) {
      toast.error('Please provide a task ID or create a task first');
      return;
    }

    setLoading(true);
    addTestResult({ name: 'AI Verification', status: 'pending' });

    try {
      const taskId = aiVerificationTaskId || createdTaskId;
      
      // First, we need to start the task
      await taskService.startTask(Number(taskId));

      // Then complete it with the image
      const result = await taskService.completeTask({
        task_id: Number(taskId),
        proof_description: 'Test proof submission for AI verification',
        proof_image_base64: aiVerificationImage
      });

      if (result.success) {
        setAiVerificationResult(result.ai_verification || result);
        addTestResult({
          name: 'AI Verification',
          status: 'success',
          message: `AI Verification completed. Status: ${result.data?.status || 'pending'}`,
          data: {
            ...result,
            ai_verification: result.ai_verification
          }
        });
        toast.success('AI Verification completed!');
      } else {
        addTestResult({
          name: 'AI Verification',
          status: 'error',
          message: result.error || 'Failed to complete AI verification',
          data: result
        });
        toast.error(result.error || 'Failed to complete AI verification');
      }
    } catch (error: any) {
      addTestResult({
        name: 'AI Verification',
        status: 'error',
        message: error.message || 'Failed to complete AI verification',
        data: error
      });
      toast.error(error.message || 'Failed to complete AI verification');
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Dashboard Data Loading
  const testDashboardData = async () => {
    setLoading(true);
    addTestResult({ name: 'Dashboard Data Loading', status: 'pending' });

    try {
      // Get user stats first to get user ID
      const statsResult = await dashboardService.getUserStats(0);
      
      if (!statsResult.success || !statsResult.data.users || statsResult.data.users.length === 0) {
        throw new Error('Failed to get user stats');
      }

      const userId = statsResult.data.users[0].user_id;

      // Fetch all dashboard data
      const [stats, activities, leaderboard, tasks, history] = await Promise.allSettled([
        dashboardService.getUserStats(userId),
        dashboardService.getUserActivities(userId, 5),
        dashboardService.getLeaderboard(10),
        dashboardService.getAvailableTasks(),
        dashboardService.getUserTaskHistory(userId)
      ]);

      const dashboardData = {
        stats: stats.status === 'fulfilled' ? stats.value : null,
        activities: activities.status === 'fulfilled' ? activities.value : null,
        leaderboard: leaderboard.status === 'fulfilled' ? leaderboard.value : null,
        tasks: tasks.status === 'fulfilled' ? tasks.value : null,
        history: history.status === 'fulfilled' ? history.value : null
      };

      setDashboardData(dashboardData);

      addTestResult({
        name: 'Dashboard Data Loading',
        status: 'success',
        message: 'Dashboard data loaded successfully',
        data: dashboardData
      });
      toast.success('Dashboard data loaded successfully!');
    } catch (error: any) {
      addTestResult({
        name: 'Dashboard Data Loading',
        status: 'error',
        message: error.message || 'Failed to load dashboard data',
        data: error
      });
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Test 5: Leaderboard
  const testLeaderboard = async () => {
    setLoading(true);
    addTestResult({ name: 'Leaderboard', status: 'pending' });

    try {
      const result = await dashboardService.getLeaderboard(50);

      if (result.success && result.data.users) {
        setLeaderboardData(result.data.users);
        addTestResult({
          name: 'Leaderboard',
          status: 'success',
          message: `Leaderboard loaded with ${result.data.users.length} users`,
          data: result.data
        });
        toast.success(`Leaderboard loaded with ${result.data.users.length} users!`);
      } else {
        addTestResult({
          name: 'Leaderboard',
          status: 'error',
          message: 'Failed to load leaderboard',
          data: result
        });
        toast.error('Failed to load leaderboard');
      }
    } catch (error: any) {
      addTestResult({
        name: 'Leaderboard',
        status: 'error',
        message: error.message || 'Failed to load leaderboard',
        data: error
      });
      toast.error(error.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    clearResults();
    await testCreateTask();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testDashboardData();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testLeaderboard();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Test Page</h1>
          <p className="text-gray-600 mt-2">Test all admin features with admin values</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={loading} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Run All Tests
          </Button>
          <Button onClick={clearResults} variant="outline" disabled={loading}>
            Clear Results
          </Button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Results of all test operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : result.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.status === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : result.status === 'error' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                      )}
                      <span className="font-semibold">{result.name}</span>
                    </div>
                    <Badge
                      variant={
                        result.status === 'success'
                          ? 'default'
                          : result.status === 'error'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {result.status}
                    </Badge>
                  </div>
                  {result.message && (
                    <p className="mt-2 text-sm text-gray-700">{result.message}</p>
                  )}
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test 1: Create Task */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Test 1: Create Task
            </CardTitle>
            <CardDescription>Create a new task with admin values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Input
                  id="platform"
                  value={taskForm.platform}
                  onChange={(e) => setTaskForm({ ...taskForm, platform: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task_type">Task Type</Label>
                <Input
                  id="task_type"
                  value={taskForm.task_type}
                  onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="reward_points">Reward Points</Label>
                <Input
                  id="reward_points"
                  type="number"
                  value={taskForm.reward_points}
                  onChange={(e) => setTaskForm({ ...taskForm, reward_points: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={taskForm.requirements}
                onChange={(e) => setTaskForm({ ...taskForm, requirements: e.target.value })}
                rows={2}
              />
            </div>
            {createdTaskId && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  <strong>Created Task ID:</strong> {createdTaskId}
                </p>
              </div>
            )}
            <Button onClick={testCreateTask} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test 2: Delete Task */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Test 2: Delete Task
            </CardTitle>
            <CardDescription>Delete a task by ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="delete_task_id">Task ID</Label>
              <Input
                id="delete_task_id"
                placeholder={createdTaskId ? `Using created task: ${createdTaskId}` : 'Enter task ID'}
                value={deleteTaskId}
                onChange={(e) => setDeleteTaskId(e.target.value)}
              />
              {createdTaskId && (
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to delete the task you just created (ID: {createdTaskId})
                </p>
              )}
            </div>
            <Button
              onClick={testDeleteTask}
              disabled={loading || (!deleteTaskId && !createdTaskId)}
              variant="destructive"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test 3: AI Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Test 3: AI Verification
            </CardTitle>
            <CardDescription>Test AI verification with image upload</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ai_task_id">Task ID</Label>
              <Input
                id="ai_task_id"
                placeholder={createdTaskId ? `Using created task: ${createdTaskId}` : 'Enter task ID'}
                value={aiVerificationTaskId}
                onChange={(e) => setAiVerificationTaskId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="image_upload">Upload Image</Label>
              <div className="mt-2">
                <Input
                  id="image_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              {aiVerificationImage && (
                <div className="mt-2">
                  <img
                    src={aiVerificationImage}
                    alt="Preview"
                    className="max-w-full h-32 object-contain border rounded"
                  />
                </div>
              )}
            </div>
            {aiVerificationResult && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-semibold text-blue-900 mb-2">AI Verification Result:</p>
                <div className="text-xs space-y-1 text-blue-800">
                  <p><strong>Verified:</strong> {aiVerificationResult.verified ? 'Yes' : 'No'}</p>
                  {aiVerificationResult.confidence && (
                    <p><strong>Confidence:</strong> {aiVerificationResult.confidence}%</p>
                  )}
                  {aiVerificationResult.reason && (
                    <p><strong>Reason:</strong> {aiVerificationResult.reason}</p>
                  )}
                  {aiVerificationResult.decision && (
                    <p><strong>Decision:</strong> {aiVerificationResult.decision}</p>
                  )}
                </div>
              </div>
            )}
            <Button
              onClick={testAIVerification}
              disabled={loading || !aiVerificationImage || (!aiVerificationTaskId && !createdTaskId)}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Test AI Verification
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test 4: Dashboard Data Loading */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Test 4: Dashboard Data Loading
            </CardTitle>
            <CardDescription>Test loading all dashboard data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testDashboardData} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Load Dashboard Data
                </>
              )}
            </Button>
            {dashboardData && (
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <p><strong>Stats:</strong> {dashboardData.stats ? '✓ Loaded' : '✗ Failed'}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p><strong>Activities:</strong> {dashboardData.activities ? '✓ Loaded' : '✗ Failed'}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p><strong>Leaderboard:</strong> {dashboardData.leaderboard ? '✓ Loaded' : '✗ Failed'}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p><strong>Tasks:</strong> {dashboardData.tasks ? '✓ Loaded' : '✗ Failed'}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p><strong>History:</strong> {dashboardData.history ? '✓ Loaded' : '✗ Failed'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test 5: Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Test 5: Leaderboard
            </CardTitle>
            <CardDescription>Test loading leaderboard data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testLeaderboard} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Load Leaderboard
                </>
              )}
            </Button>
            {leaderboardData.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Top {leaderboardData.length} Users:</p>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {leaderboardData.slice(0, 10).map((user, index) => (
                    <div key={user.id || index} className="p-2 bg-gray-50 rounded text-xs">
                      <p>
                        <strong>#{index + 1}</strong> {user.name} - {user.total_points} points
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
