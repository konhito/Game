import config from './config';

const API_BASE = config.API_BASE;

export interface UserStats {
  id: number;
  user_id: number;
  total_points: number;
  total_coins: number;
  tasks_completed: number;
  tasks_approved: number;
  tasks_rejected: number;
  current_streak: number;
  longest_streak: number;
  last_task_date?: string;
  spins_remaining?: number;
  weekly_points?: number;
  last_login_date?: string;
  last_daily_claim_date?: string;
  last_spin_reset_date?: string;
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  activity_type: string;
  description: string;
  metadata: any;
  ip_address: string;
  user_agent: string;
  points?: number;
  created_at: string;
}

export interface LeaderboardEntry {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  total_points: number;
  total_coins: number;
  tasks_completed: number;
  tasks_approved: number;
  current_streak: number;
  longest_streak: number;
  weekly_points?: number;
  rank?: number;
}

export interface WeeklyPool {
  pinecoins: number;
  naira: number;
  exchange_rate: number;
  buy_rate?: number;
  sell_rate?: number;
  last_updated?: string;
}

export interface WeeklyReward {
  rank: number | string;
  pinecoins: number;
  naira: number;
  percentage: number;
}

export interface TaskPointRules {
  signup_points: number;
  referral_points: number;
  share_social_points: number;
  share_news_points: number;
  comment_points: number;
  like_points: number;
  daily_login_points: number;
  login_streak_bonus_days: number;
  login_streak_bonus_spins: number;
}

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
  is_featured?: boolean;
  priority?: string;
  tags?: string[];
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
  started_at?: string;
  submission_count?: number;
  created_at: string;
  updated_at: string;
  task?: Task;
}

export interface TaskCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  metal_type: string;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  product?: Product;
}

export interface AdminAuditLog {
  id: number;
  admin_id: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface DashboardOverview {
  userStats: UserStats | null;
  recentActivities: UserActivity[];
  leaderboard: LeaderboardEntry[];
  availableTasks: Task[];
  userTaskHistory: UserTask[];
  taskCategories: TaskCategory[];
  userProducts: Product[];
  userOrders: Order[];
  achievements: Achievement[];
  notifications: Notification[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
  progress: number;
  max_progress: number;
}

export interface Notification {
  id: string;
  type: 'task_approved' | 'task_rejected' | 'new_task' | 'achievement' | 'daily_reward' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class DashboardService {
  private getAuthHeaders(): HeadersInit {
    let token: string | null = null;
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const testKey = '__test__';
        try {
          localStorage.setItem(testKey, 'test');
          localStorage.removeItem(testKey);
          token = localStorage.getItem('auth_token');
        } catch (e) {
          // localStorage exists but doesn't work properly
        }
      }
    } catch (e) {
      // Silently fail - we're probably in SSR
    }
    console.log('DashboardService: Getting auth headers, token present:', !!token);

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    console.log('DashboardService: Auth headers:', headers);
    return headers;
  }

  // Health check endpoint
  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/health`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        console.error('Health check failed with status:', response.status);
        throw new Error(`Health check failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Health check error:', error);
      throw new Error('Backend connection failed');
    }
  }

  // Get user statistics — always bypasses browser cache
  async getUserStats(userId: number): Promise<ApiResponse<{ users: UserStats[] }>> {
    try {
      const response = await fetch(`${API_BASE}/api/users/stats`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401) {
          const error = new Error('Authentication expired');
          (error as any).status = 401;
          throw error;
        }
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to fetch user stats: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (result.success && result.data && result.data.user) {
        return {
          success: true,
          data: { users: [result.data.user] },
        };
      } else {
        throw new Error('Invalid response format from backend');
      }
    } catch (error: any) {
      console.error('DashboardService: Error in getUserStats:', error);
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Get user activities with retry logic
  async getUserActivities(userId: number, limit: number = 10): Promise<ApiResponse<{ activities: UserActivity[] }>> {
    const maxRetries = 3;
    let retryCount = 0;

    const attemptRequest = async (): Promise<ApiResponse<{ activities: UserActivity[] }>> => {
      try {
        console.log(`🔍 DashboardService: Getting user activities for user: ${userId} (attempt ${retryCount + 1})`);
        console.log('🌐 API URL:', `${API_BASE}/api/users/activities?limit=${limit}`);

        const response = await fetch(`${API_BASE}/api/users/activities?limit=${limit}`, {
          headers: this.getAuthHeaders(),
          credentials: 'include',
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          if (response.status === 401) {
            const error = new Error('Authentication expired');
            (error as any).status = 401;
            throw error;
          }

          if (response.status === 429 && retryCount < maxRetries) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`⏳ Rate limited, retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return attemptRequest();
          }

          let errorData;
          try {
            errorData = await response.json();
          } catch (parseError) {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
          console.error('❌ API Error:', errorData);
          throw new Error(`Failed to fetch user activities: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('📊 Activities response:', result);

        if (result.success && result.data && result.data.activities) {
          return {
            success: true,
            data: { activities: result.data.activities },
          };
        } else {
          console.error('❌ Invalid response format:', result);
          throw new Error('Invalid response format from backend');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (retryCount < maxRetries && (errorMessage.includes('429') || errorMessage.includes('rate limit'))) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`⏳ Request failed, retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptRequest();
        }

        console.error('DashboardService: Error in getUserActivities:', error);
        throw new Error('Failed to fetch user activities');
      }
    };

    return attemptRequest();
  }

  // Get leaderboard — computed live from local DB (weekly_points summed from userActivity this week),
  // ordered by weekly_points desc then total_points desc. No browser cache.
  async getLeaderboard(limit: number = 10): Promise<ApiResponse<{ users: LeaderboardEntry[]; weekly_pool?: WeeklyPool; weekly_rewards?: WeeklyReward[]; task_point_rules?: TaskPointRules }>> {
    try {
      const response = await fetch(`/api/leaderboard?limit=${limit}`, {
        headers: this.getAuthHeaders(),
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401) {
          const error = new Error('Authentication expired');
          (error as any).status = 401;
          throw error;
        }
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to fetch leaderboard: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (result.success && result.data && result.data.users) {
        return {
          success: true,
          data: {
            users: result.data.users,
            weekly_pool: result.data.weekly_pool,
            weekly_rewards: result.data.weekly_rewards,
            task_point_rules: result.data.task_point_rules,
          },
        };
      } else {
        throw new Error('Invalid response format from backend');
      }
    } catch (error: any) {
      console.error('DashboardService: Error in getLeaderboard:', error);
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Get available tasks
  async getAvailableTasks(): Promise<ApiResponse<{ tasks: Task[] }>> {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/available`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          const error = new Error('Authentication expired');
          (error as any).status = 401;
          throw error;
        }
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to fetch available tasks: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (result.success && result.data && result.data.tasks) {
        return {
          success: true,
          data: { tasks: result.data.tasks },
        };
      } else {
        throw new Error('Invalid response format from backend');
      }
    } catch (error: any) {
      console.error('DashboardService: Error in getAvailableTasks:', error);
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Get user task history
  async getUserTaskHistory(userId: number): Promise<ApiResponse<{ tasks: UserTask[] }>> {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/history`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          const error = new Error('Authentication expired');
          (error as any).status = 401;
          throw error;
        }
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to fetch user task history: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (result.success && result.data && result.data.tasks) {
        return {
          success: true,
          data: { tasks: result.data.tasks },
        };
      } else {
        throw new Error('Invalid response format from backend');
      }
    } catch (error: any) {
      console.error('DashboardService: Error in getUserTaskHistory:', error);
      if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Get task categories
  async getTaskCategories(): Promise<ApiResponse<{ categories: TaskCategory[] }>> {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/categories`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch task categories');
      }

      const result = await response.json();

      if (result.success && result.data && result.data.categories) {
        return {
          success: true,
          data: { categories: result.data.categories },
        };
      } else {
        throw new Error('Invalid response format from backend');
      }
    } catch (error) {
      console.error('DashboardService: Error in getTaskCategories:', error);
      throw new Error('Failed to fetch task categories');
    }
  }

  // Get user products
  async getUserProducts(): Promise<ApiResponse<{ products: Product[] }>> {
    try {
      const response = await fetch(`${API_BASE}/api/products/user`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user products');
      }

      const result = await response.json();

      if (result.success && result.data && result.data.products) {
        return {
          success: true,
          data: { products: result.data.products },
        };
      } else {
        throw new Error('Invalid response format from backend');
      }
    } catch (error) {
      console.error('DashboardService: Error in getUserProducts:', error);
      throw new Error('Failed to fetch user products');
    }
  }

  // Get user orders
  async getUserOrders(): Promise<ApiResponse<{ orders: Order[] }>> {
    try {
      const response = await fetch(`${API_BASE}/api/orders/user`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user orders');
      }

      const result = await response.json();

      if (result.success && result.data && result.data.orders) {
        return {
          success: true,
          data: { orders: result.data.orders },
        };
      } else {
        throw new Error('Invalid response format from backend');
      }
    } catch (error) {
      console.error('DashboardService: Error in getUserOrders:', error);
      throw new Error('Failed to fetch user orders');
    }
  }

  // Get user achievements
  async getUserAchievements(): Promise<ApiResponse<{ achievements: Achievement[] }>> {
    try {
      const response = await fetch(`${API_BASE}/api/users/achievements`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user achievements');
      }

      const result = await response.json();

      if (result.success && result.data && result.data.achievements) {
        return {
          success: true,
          data: { achievements: result.data.achievements },
        };
      } else {
        throw new Error('Invalid response format from backend');
      }
    } catch (error) {
      console.error('DashboardService: Error in getUserAchievements:', error);
      throw new Error('Failed to fetch user achievements');
    }
  }

  // Get user notifications
  async getUserNotifications(): Promise<ApiResponse<{ notifications: Notification[] }>> {
    try {
      const response = await fetch(`${API_BASE}/api/users/notifications`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user notifications');
      }

      const result = await response.json();

      if (result.success && result.data && result.data.notifications) {
        return {
          success: true,
          data: { notifications: result.data.notifications },
        };
      } else {
        throw new Error('Invalid response format from backend');
      }
    } catch (error) {
      console.error('DashboardService: Error in getUserNotifications:', error);
      throw new Error('Failed to fetch user notifications');
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/users/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('DashboardService: Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  // Log user activity
  async logActivity(activityType: string, description: string, metadata?: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/users/activities`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ activity_type: activityType, description, metadata }),
      });

      if (!response.ok) {
        throw new Error('Failed to log activity');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('DashboardService: Error logging activity:', error);
      throw new Error('Failed to log activity');
    }
  }

  // Get comprehensive dashboard data
  async getDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
    try {
      const [
        statsResponse,
        activitiesResponse,
        leaderboardResponse,
        tasksResponse,
        historyResponse,
        categoriesResponse,
        productsResponse,
        ordersResponse,
        achievementsResponse,
        notificationsResponse,
      ] = await Promise.all([
        this.getUserStats(0),
        this.getUserActivities(0, 5),
        this.getLeaderboard(10),
        this.getAvailableTasks(),
        this.getUserTaskHistory(0),
        this.getTaskCategories(),
        this.getUserProducts(),
        this.getUserOrders(),
        this.getUserAchievements(),
        this.getUserNotifications(),
      ]);

      return {
        success: true,
        data: {
          userStats: statsResponse.success ? statsResponse.data.users[0] : null,
          recentActivities: activitiesResponse.success ? activitiesResponse.data.activities : [],
          leaderboard: leaderboardResponse.success ? leaderboardResponse.data.users : [],
          availableTasks: tasksResponse.success ? tasksResponse.data.tasks : [],
          userTaskHistory: historyResponse.success ? historyResponse.data.tasks : [],
          taskCategories: categoriesResponse.success ? categoriesResponse.data.categories : [],
          userProducts: productsResponse.success ? productsResponse.data.products : [],
          userOrders: ordersResponse.success ? ordersResponse.data.orders : [],
          achievements: achievementsResponse.success ? achievementsResponse.data.achievements : [],
          notifications: notificationsResponse.success ? notificationsResponse.data.notifications : [],
        },
      };
    } catch (error) {
      console.error('DashboardService: Error getting dashboard overview:', error);
      throw new Error('Failed to get dashboard overview');
    }
  }

  // Spin the wheel (integrated with point system)
  async spinWheel(): Promise<ApiResponse<{ points: number; coins: number; message: string }>> {
    try {
      const response = await fetch(`${API_BASE}/api/points/config`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get spin wheel configuration');
      }

      const configData = await response.json();
      const spinConfig = configData.data.configs.spin_wheel_config;
      const spinRewards = configData.data.configs.spin_rewards;

      if (!spinConfig?.enabled) {
        throw new Error('Spin wheel is currently disabled');
      }

      const wheelSegments = spinRewards?.rewards || [
        { points: 10, probability: 0.70 },
        { points: 25, probability: 0.20 },
        { points: 50, probability: 0.08 },
        { points: 100, probability: 0.015 },
        { points: 200, probability: 0.004 },
        { points: 500, probability: 0.001 },
      ];

      const random = Math.random();
      let cumulativeProbability = 0;
      let selectedReward = wheelSegments[0];

      for (const segment of wheelSegments) {
        cumulativeProbability += segment.probability;
        if (random <= cumulativeProbability) {
          selectedReward = segment;
          break;
        }
      }

      const coins = Math.round(selectedReward.points * 0.001 * 100) / 100;

      return {
        success: true,
        data: {
          points: selectedReward.points,
          coins,
          message: `Congratulations! You won ${selectedReward.points} points and ${coins} PineCoins!`,
        },
      };
    } catch (error) {
      console.error('DashboardService: Error spinning wheel:', error);
      throw new Error('Failed to spin wheel');
    }
  }

  // Update user stats after spinning wheel
  async updateUserStatsAfterSpin(points: number, coins: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/users/stats`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ action: 'spin_wheel', points, coins }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user stats');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('DashboardService: Error updating user stats after spin:', error);
      throw new Error('Failed to update user stats');
    }
  }

  // Buy additional spins
  async buySpin(): Promise<ApiResponse<{ spinsRemaining: number; coinsRemaining: number; spinCost: number }>> {
    try {
      const response = await fetch(`${API_BASE}/api/users/buy-spin`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to buy spin');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('DashboardService: Error buying spin:', error);
      throw new Error('Failed to buy spin');
    }
  }

  // Update user stats after claiming daily reward.
  // Backend resolves configured daily points/spins; client should not pass reward values.
  async updateUserStatsAfterDailyReward(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/users/stats`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ action: 'daily_reward' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user stats');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('DashboardService: Error updating user stats after daily reward:', error);
      throw new Error('Failed to update user stats');
    }
  }
}

// Create and export a singleton instance
export const dashboardService = new DashboardService();
