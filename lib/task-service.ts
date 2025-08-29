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
}

class TaskService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
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

  // Complete a task
  async completeTask(data: CompleteTaskRequest): Promise<TaskResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/complete`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete task');
      }

      return await response.json();
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
      const response = await fetch(`${API_BASE}/api/admin/dashboard/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Get admin dashboard stats error:', error);
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
}

// Create and export a singleton instance
export const taskService = new TaskService();
