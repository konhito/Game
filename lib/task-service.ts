import config from './config';

const API_BASE = config.API_BASE;

export interface Task {
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
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface UserTask {
  id: number;
  user_id: number;
  task_id: number;
  status: string;
  proof_image?: string;
  proof_description?: string;
  admin_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  task?: Task;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  total_points?: number;
  total_coins?: number;
  tasks_completed?: number;
  tasks_approved?: number;
  tasks_rejected?: number;
  current_streak?: number;
  longest_streak?: number;
}

export interface Activity {
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

export interface CreateTaskRequest {
  title: string;
  description: string;
  platform: string;
  task_type: string;
  requirements: string;
  reward_points: number;
  reward_coins: number;
  max_participants?: number;
  deadline?: string;
  url?: string;
}

export interface CompleteTaskRequest {
  task_id: number;
  proof_description: string;
  proof_image_base64?: string;
}

export interface TaskResponse {
  success: boolean;
  data: any;
  message?: string;
  error?: string;
  ai_verification?: {
    verified: boolean;
    confidence: number;
    reason: string;
  };
}

class TaskService {
  private getAuthHeaders(): HeadersInit {
    // Only access localStorage in the browser and ensure it's properly available
    let token: string | null = null;
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        // Test if localStorage actually works
        const testKey = '__test__';
        try {
          localStorage.setItem(testKey, 'test');
          localStorage.removeItem(testKey);
          // If we get here, localStorage works
          token = localStorage.getItem('auth_token');
        } catch (e) {
          // localStorage exists but doesn't work properly
        }
      }
    } catch (e) {
      // Silently fail - we're probably in SSR
    }
    console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
    
    console.log('📋 Final headers:', headers);
    return headers;
  }

  // Get available tasks
  async getAvailableTasks(params?: {
    platform?: string;
    task_type?: string;
    page?: number;
    limit?: number;
  }): Promise<TaskResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.platform) queryParams.append('platform', params.platform);
      if (params?.task_type) queryParams.append('task_type', params.task_type);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${API_BASE}/api/tasks/available?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        cache: 'no-store', // Prevent browser caching
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tasks');
      }

      return await response.json();
    } catch (error) {
      console.error('Get available tasks error:', error);
      throw error;
    }
  }

  // Get task details by ID
  async getTaskById(id: number): Promise<TaskResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch task');
      }

      return await response.json();
    } catch (error) {
      console.error('Get task by ID error:', error);
      throw error;
    }
  }

  // Start a task
  async startTask(taskId: number): Promise<TaskResponse> {
    try {
      const headers = this.getAuthHeaders();
      console.log('🔐 Auth headers:', headers);
      console.log('🌐 Making request to:', `${API_BASE}/api/tasks/start`);
      console.log('📝 Request body:', { task_id: taskId });
      
      const response = await fetch(`${API_BASE}/api/tasks/start`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ task_id: taskId }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Response error:', errorData);
        throw new Error(errorData.error || 'Failed to start task');
      }

      const result = await response.json();
      console.log('✅ Response success:', result);
      return result;
    } catch (error) {
      console.error('💥 Start task error:', error);
      throw error;
    }
  }

  // Get current task status for a specific task with retry logic
  async getCurrentTaskStatus(taskId: number): Promise<TaskResponse> {
    const maxRetries = 3;
    let retryCount = 0;
    
    const attemptRequest = async (): Promise<TaskResponse> => {
      try {
        console.log(`🔍 Getting current task status for task: ${taskId} (attempt ${retryCount + 1})`);
        console.log('🌐 API URL:', `${API_BASE}/api/tasks/status/${taskId}`);
        console.log('🔐 Auth headers:', this.getAuthHeaders());
        
        const response = await fetch(`${API_BASE}/api/tasks/status/${taskId}`, {
          method: 'GET',
          headers: this.getAuthHeaders(),
          credentials: 'include',
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', response.headers);

        if (!response.ok) {
          if (response.status === 429 && retryCount < maxRetries) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
            console.log(`⏳ Rate limited, retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return attemptRequest();
          }
          
          let errorData;
          try {
            errorData = await response.json();
          } catch (parseError) {
            // If response is not JSON, create a generic error
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
          console.error('❌ API Error:', errorData);
          throw new Error(errorData.error || `Failed to get task status: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Task status retrieved:', result);
        return result;
      } catch (error) {
        if (retryCount < maxRetries && (error instanceof Error && (error.message.includes('429') || error.message.includes('rate limit')))) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`⏳ Request failed, retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptRequest();
        }
        
        console.error('Get task status error:', error);
        throw error;
      }
    };
    
    return attemptRequest();
  }

  // Complete a task
  async completeTask(data: CompleteTaskRequest): Promise<TaskResponse> {
    try {
      console.log('🤖 Completing task with AI verification...');
      console.log('📝 Request data:', data);
      console.log('🌐 API URL:', `${API_BASE}/api/tasks/complete`);
      console.log('🔐 Auth headers:', this.getAuthHeaders());
      
      const response = await fetch(`${API_BASE}/api/tasks/complete`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        let errorData;
        try {
          const responseText = await response.text();
          console.log('📄 Raw response text:', responseText);
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          // If response is not JSON, create a generic error
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('❌ Complete task API error:', errorData);
        throw new Error(errorData.error || `Failed to complete task: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Complete task success:', result);
      
      // Log AI verification result if present
      if (result.ai_verification) {
        console.log('🤖 AI Verification Result:', result.ai_verification);
        console.log(`   Verified: ${result.ai_verification.verified}`);
        console.log(`   Confidence: ${result.ai_verification.confidence}%`);
        console.log(`   Reason: ${result.ai_verification.reason}`);
      }

      return result;
    } catch (error) {
      console.error('Complete task error:', error);
      throw error;
    }
  }

  // Get user's task history
  async getUserTaskHistory(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<TaskResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${API_BASE}/api/tasks/history?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        cache: 'no-store', // Prevent browser caching
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch task history');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user task history error:', error);
      throw error;
    }
  }

  // Admin: Get all tasks
  async getAllTasks(params?: {
    status?: string;
    platform?: string;
    priority?: string;
    featured?: string;
    page?: number;
    limit?: number;
  }): Promise<TaskResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.platform) queryParams.append('platform', params.platform);
      if (params?.priority) queryParams.append('priority', params.priority);
      if (params?.featured) queryParams.append('featured', params.featured);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${API_BASE}/api/admin/tasks?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch all tasks');
      }

      return await response.json();
    } catch (error) {
      console.error('Get all tasks error:', error);
      throw error;
    }
  }

  // Admin: Create new task
  async createTask(data: CreateTaskRequest): Promise<TaskResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/tasks`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      return await response.json();
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  }

  // Admin: Update task
  async updateTask(id: number, data: Partial<CreateTaskRequest>): Promise<TaskResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/tasks/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      return await response.json();
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  }

  // Admin: Delete task
  async deleteTask(id: number): Promise<TaskResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/tasks/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  }

  // Admin: Get pending submissions
  async getPendingSubmissions(params?: {
    page?: number;
    limit?: number;
    platform?: string;
    task_type?: string;
  }): Promise<TaskResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.platform) queryParams.append('platform', params.platform);
      if (params?.task_type) queryParams.append('task_type', params.task_type);

      const response = await fetch(`${API_BASE}/api/admin/submissions/pending?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch pending submissions');
      }

      return await response.json();
    } catch (error) {
      console.error('Get pending submissions error:', error);
      throw error;
    }
  }

  // Admin: Approve submission
  async approveSubmission(id: number, adminNotes?: string): Promise<TaskResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/submissions/${id}/approve`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ admin_notes: adminNotes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve submission');
      }

      return await response.json();
    } catch (error) {
      console.error('Approve submission error:', error);
      throw error;
    }
  }

  // Admin: Reject submission
  async rejectSubmission(id: number, adminNotes?: string): Promise<TaskResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/submissions/${id}/reject`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ admin_notes: adminNotes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject submission');
      }

      return await response.json();
    } catch (error) {
      console.error('Reject submission error:', error);
      throw error;
    }
  }

  // Admin: Get dashboard stats
  async getAdminDashboardStats(): Promise<TaskResponse> {
    try {
      console.log('🔍 Fetching admin dashboard stats from:', `${API_BASE}/api/admin/dashboard/stats`);
      
      const headers = this.getAuthHeaders();
      console.log('🔑 Headers being sent:', headers);
      
      const response = await fetch(`${API_BASE}/api/admin/dashboard/stats`, {
        method: 'GET',
        headers,
        credentials: 'include', // Include cookies for CORS
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = 'Failed to fetch dashboard stats';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Dashboard stats received:', data);
      return data;
    } catch (error) {
      console.error('❌ Get admin dashboard stats error:', error);
      throw error;
    }
  }

  // Admin: Get all users
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<TaskResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.role) queryParams.append('role', params.role);
      if (params?.status) queryParams.append('status', params.status);

      const response = await fetch(`${API_BASE}/api/admin/users?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      return await response.json();
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  // Admin: Get user emails as JSON
  async getUserEmails(params?: {
    role?: string;
    status?: string;
  }): Promise<TaskResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.role) queryParams.append('role', params.role);
      if (params?.status) queryParams.append('status', params.status);

      const response = await fetch(`${API_BASE}/api/admin/users/emails?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get user emails');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user emails error:', error);
      throw error;
    }
  }

  // Admin: Export user emails as CSV
  async exportUserEmails(params?: {
    role?: string;
    status?: string;
  }): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.role) queryParams.append('role', params.role);
      if (params?.status) queryParams.append('status', params.status);

      const response = await fetch(`${API_BASE}/api/admin/users/export/emails?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        // Try to parse as JSON for error message
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to export user emails');
        } else {
          throw new Error(`Failed to export user emails: ${response.status} ${response.statusText}`);
        }
      }

      return await response.blob();
    } catch (error) {
      console.error('Export user emails error:', error);
      throw error;
    }
  }

  // Admin: Update user
  async updateUser(id: number, data: {
    role?: string;
    is_active?: boolean;
    phone?: string;
    whatsapp?: string;
  }): Promise<TaskResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      return await response.json();
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  // Admin: Delete user
  async deleteUser(id: number): Promise<TaskResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      return await response.json();
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Admin: Get user activities
  async getUserActivities(params?: {
    page?: number;
    limit?: number;
    user_id?: number;
    activity_type?: string;
    date_range?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<TaskResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
      if (params?.activity_type) queryParams.append('activity_type', params.activity_type);
      if (params?.date_range) queryParams.append('date_range', params.date_range);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);

      const response = await fetch(`${API_BASE}/api/admin/activities?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user activities');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user activities error:', error);
      throw error;
    }
  }

  // Admin: Get audit log
  async getAdminAuditLog(params?: {
    page?: number;
    limit?: number;
    admin_id?: number;
    action?: string;
    entity_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<TaskResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.admin_id) queryParams.append('admin_id', params.admin_id.toString());
      if (params?.action) queryParams.append('action', params.action);
      if (params?.entity_type) queryParams.append('entity_type', params.entity_type);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);

      const response = await fetch(`${API_BASE}/api/admin/audit-log?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch audit log');
      }

      return await response.json();
    } catch (error) {
      console.error('Get admin audit log error:', error);
      throw error;
    }
  }

  // Admin: Get AI verification records
  async getAIVerificationRecords(params?: {
    page?: number;
    limit?: number;
    status?: string;
    confidence_min?: number;
    user_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<TaskResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.confidence_min) queryParams.append('confidence_min', params.confidence_min.toString());
      if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);

      const response = await fetch(`${API_BASE}/api/admin/ai-verification?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch AI verification records');
      }

      return await response.json();
    } catch (error) {
      console.error('Get AI verification records error:', error);
      throw error;
    }
  }

  // Admin: Retry AI verification
  async retryAIVerification(verificationId: number): Promise<TaskResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/ai-verification/${verificationId}/retry`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retry AI verification');
      }

      return await response.json();
    } catch (error) {
      console.error('Retry AI verification error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const taskService = new TaskService();
