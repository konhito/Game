interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  weekly_points: number;
  total_coins: number;
  tasks_completed: number;
  tasks_approved: number;
  tasks_rejected: number;
  current_streak: number;
  longest_streak: number;
  spins_remaining: number;
  last_task_date?: string;
  last_login_date?: string;
}

interface UserActivity {
  id: number;
  activity_type: string;
  description: string;
  metadata?: any;
  created_at: string;
}

interface CompletedTask {
  id: number;
  status: string;
  completed_at: string;
  task: {
    id: number;
    title: string;
    platform: string;
    task_type: string;
    reward_points: number;
    reward_coins: number;
  };
}

interface ProfileData {
  user: UserProfile;
  stats: UserStats;
  recent_activities: UserActivity[];
  completed_tasks: CompletedTask[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class UserProfileService {
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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async getUserProfile(userId: number): Promise<ApiResponse<ProfileData>> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me'}/api/users/${userId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to fetch user profile');
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('UserProfileService: Error fetching user profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user profile',
      };
    }
  }

  async updateUserProfile(userId: number, profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me'}/api/users/profile`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(profileData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      return {
        success: true,
        data: result.user,
      };
    } catch (error) {
      console.error('UserProfileService: Error updating profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  async getUserStats(userId: number): Promise<ApiResponse<UserStats>> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me'}/api/users/stats`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('UserProfileService: Error fetching user stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user stats',
      };
    }
  }

  async getUserActivities(userId: number, limit: number = 10): Promise<ApiResponse<UserActivity[]>> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me'}/api/users/activities?limit=${limit}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user activities');
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data.activities,
      };
    } catch (error) {
      console.error('UserProfileService: Error fetching user activities:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user activities',
      };
    }
  }

  async searchUsers(query: string): Promise<ApiResponse<UserProfile[]>> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me'}/api/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('UserProfileService: Error searching users:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search users',
      };
    }
  }
}

export const userProfileService = new UserProfileService();
export type { UserProfile, UserStats, UserActivity, CompletedTask, ProfileData };
