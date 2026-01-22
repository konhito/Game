"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { taskService } from '@/lib/task-service';
import { authService } from '@/lib/auth-service';

export default function ApiTestPage() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Test backend connection
  const testConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
              const response = await fetch('https://pinecrest.konhito.me/api/health');
      if (response.ok) {
        setIsConnected(true);
        setError(null);
      } else {
        setIsConnected(false);
        setError('Backend responded but not OK');
      }
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  // Get available tasks
  const getTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await taskService.getAvailableTasks();
      if (result.success) {
        setTasks(result.data.tasks || []);
      } else {
        setError(result.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status
  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">API Connection Test</h1>
      
      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle>Backend Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button onClick={testConnection} disabled={loading}>
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>
            <div className="flex items-center space-x-2">
              <span>Status:</span>
              {isConnected === null && <span className="text-gray-500">Not tested</span>}
              {isConnected === true && <span className="text-green-500">✅ Connected</span>}
              {isConnected === false && <span className="text-red-500">❌ Failed</span>}
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-sm">
              Error: {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Token:</strong> {authService.getToken() ? '✅ Present' : '❌ Missing'}</p>
            </div>
          ) : (
            <p className="text-gray-500">Not authenticated</p>
          )}
        </CardContent>
      </Card>

      {/* Task Management Test */}
      <Card>
        <CardHeader>
          <CardTitle>Task Management Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={getTasks} disabled={loading || !user}>
            {loading ? 'Loading...' : 'Get Available Tasks'}
          </Button>
          
          {tasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Available Tasks ({tasks.length}):</h3>
              {tasks.map((task) => (
                <div key={task.id} className="border p-3 rounded">
                  <p><strong>{task.title}</strong></p>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <p className="text-sm">Platform: {task.platform} | Type: {task.task_type}</p>
                  <p className="text-sm">Reward: {task.reward_points} points, {task.reward_coins} coins</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backend Info */}
      <Card>
        <CardHeader>
          <CardTitle>Backend Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
                            <p><strong>Backend URL:</strong> https://pinecrest.konhito.me</p>
            <p><strong>Health Check:</strong> /api/health</p>
            <p><strong>Tasks API:</strong> /api/tasks/*</p>
            <p><strong>Admin API:</strong> /api/admin/*</p>
            <p><strong>Authentication:</strong> JWT Bearer Token</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
