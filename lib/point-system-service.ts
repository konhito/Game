import config from './config';

const API_BASE = config.API_BASE;

export interface PointSystemConfig {
  [key: string]: {
    id: number;
    description: string;
    updated_at: string;
    [key: string]: any;
  };
}

export interface PointTransaction {
  id: number;
  user_id: number;
  transaction_type: string;
  points_change: number;
  coins_change: number;
  description: string;
  created_at: string;
  metadata?: any;
}

export interface UserLevel {
  id: number;
  user_id: number;
  current_level: number;
  weekly_points: number;
  points_to_next_level: number;
  level_benefits: any;
  last_level_up?: string;
}

export interface PointSystemAnalytics {
  transactionSummary: Array<{
    transaction_type: string;
    weekly_points: number;
    total_coins: number;
    count: number;
  }>;
  dailyTrends: Array<{
    date: string;
    weekly_points: number;
    total_coins: number;
    transaction_count: number;
  }>;
  topUsers: Array<{
    user_id: number;
    weekly_points: number;
    total_coins: number;
    user_name: string;
    user_email: string;
  }>;
  period: string;
}

class PointSystemService {
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
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Get all point system configurations
  async getPointSystemConfig(): Promise<{ success: boolean; data: { configs: PointSystemConfig } }> {
    try {
      const response = await fetch(`${API_BASE}/api/points/config`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch point system config');
      }

      return await response.json();
    } catch (error) {
      console.error('PointSystemService: Error getting config:', error);
      throw new Error('Failed to fetch point system configuration');
    }
  }

  // Update point system configuration
  async updatePointSystemConfig(configKey: string, configValue: any, description?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE}/api/points/config`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          configKey,
          configValue,
          description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update point system config');
      }

      return await response.json();
    } catch (error) {
      console.error('PointSystemService: Error updating config:', error);
      throw new Error('Failed to update point system configuration');
    }
  }

  // Get user point transactions
  async getUserPointTransactions(limit = 50, offset = 0, type?: string): Promise<{ success: boolean; data: { transactions: PointTransaction[] } }> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(type && { type })
      });

      const response = await fetch(`${API_BASE}/api/points/transactions?${params}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user transactions');
      }

      return await response.json();
    } catch (error) {
      console.error('PointSystemService: Error getting user transactions:', error);
      throw new Error('Failed to fetch user transactions');
    }
  }

  // Get all point transactions (admin only)
  async getAllPointTransactions(limit = 100, offset = 0, userId?: number, type?: string, startDate?: string, endDate?: string): Promise<{ success: boolean; data: { transactions: PointTransaction[] } }> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(userId && { userId: userId.toString() }),
        ...(type && { type }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`${API_BASE}/api/points/transactions/all?${params}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all transactions');
      }

      return await response.json();
    } catch (error) {
      console.error('PointSystemService: Error getting all transactions:', error);
      throw new Error('Failed to fetch all transactions');
    }
  }

  // Award points to user (admin only)
  async awardPoints(userId: number, points: number, coins: number, description: string, transactionType = 'bonus'): Promise<{ success: boolean; message: string; data: { transaction: PointTransaction } }> {
    try {
      const response = await fetch(`${API_BASE}/api/points/award`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          userId,
          points,
          coins,
          description,
          transactionType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to award points');
      }

      return await response.json();
    } catch (error) {
      console.error('PointSystemService: Error awarding points:', error);
      throw new Error('Failed to award points');
    }
  }

  // Get user level information
  async getUserLevel(): Promise<{ success: boolean; data: { userLevel: UserLevel; levelSystem: any } }> {
    try {
      const response = await fetch(`${API_BASE}/api/points/level`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user level');
      }

      return await response.json();
    } catch (error) {
      console.error('PointSystemService: Error getting user level:', error);
      throw new Error('Failed to fetch user level');
    }
  }

  // Get point system analytics (admin only)
  async getPointSystemAnalytics(days = 30): Promise<{ success: boolean; data: PointSystemAnalytics }> {
    try {
      const response = await fetch(`${API_BASE}/api/points/analytics?days=${days}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('PointSystemService: Error getting analytics:', error);
      throw new Error('Failed to fetch analytics');
    }
  }

  // Helper method to get specific config value
  async getConfigValue(configKey: string): Promise<any> {
    try {
      const response = await this.getPointSystemConfig();
      return response.data.configs[configKey];
    } catch (error) {
      console.error('PointSystemService: Error getting config value:', error);
      return null;
    }
  }

  // Helper method to check if a feature is enabled
  async isFeatureEnabled(featureKey: string): Promise<boolean> {
    try {
      const config = await this.getConfigValue(featureKey);
      return config?.enabled === true;
    } catch (error) {
      console.error('PointSystemService: Error checking feature:', error);
      return false;
    }
  }

  // Helper method to get spin wheel configuration
  async getSpinWheelConfig(): Promise<{ daily_spins: number; max_spins: number; enabled: boolean }> {
    try {
      const config = await this.getConfigValue('spin_wheel_config');
      return config || { daily_spins: 5, max_spins: 10, enabled: true };
    } catch (error) {
      console.error('PointSystemService: Error getting spin wheel config:', error);
      return { daily_spins: 5, max_spins: 10, enabled: true };
    }
  }

  // Helper method to get spin rewards
  async getSpinRewards(): Promise<Array<{ points: number; probability: number }>> {
    try {
      const config = await this.getConfigValue('spin_rewards');
      return config?.rewards || [
        { points: 10, probability: 0.3 },
        { points: 25, probability: 0.25 },
        { points: 50, probability: 0.2 },
        { points: 100, probability: 0.15 },
        { points: 200, probability: 0.08 },
        { points: 500, probability: 0.02 }
      ];
    } catch (error) {
      console.error('PointSystemService: Error getting spin rewards:', error);
      return [
        { points: 10, probability: 0.3 },
        { points: 25, probability: 0.25 },
        { points: 50, probability: 0.2 },
        { points: 100, probability: 0.15 },
        { points: 200, probability: 0.08 },
        { points: 500, probability: 0.02 }
      ];
    }
  }

  // Helper method to get login bonus configuration
  async getLoginBonusConfig(): Promise<{ daily: { points: number; coins: number; enabled: boolean }; weekly: { points: number; coins: number; enabled: boolean }; monthly: { points: number; coins: number; enabled: boolean } }> {
    try {
      const [daily, weekly, monthly] = await Promise.all([
        this.getConfigValue('daily_login_bonus'),
        this.getConfigValue('weekly_login_bonus'),
        this.getConfigValue('monthly_login_bonus')
      ]);

      return {
        daily: daily || { points: 10, coins: 5, enabled: true },
        weekly: weekly || { points: 50, coins: 25, enabled: true },
        monthly: monthly || { points: 200, coins: 100, enabled: true }
      };
    } catch (error) {
      console.error('PointSystemService: Error getting login bonus config:', error);
      return {
        daily: { points: 10, coins: 5, enabled: true },
        weekly: { points: 50, coins: 25, enabled: true },
        monthly: { points: 200, coins: 100, enabled: true }
      };
    }
  }
}

// Create and export a singleton instance
export const pointSystemService = new PointSystemService();
