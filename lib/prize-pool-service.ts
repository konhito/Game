import { config } from './config';
import { authService } from './auth-service';

const API_BASE = config.API_BASE;

export interface PrizePool {
  id: number;
  title: string;
  description: string;
  prize_amount: number;
  entry_fee: number;
  max_participants: number;
  current_participants: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'upcoming' | 'completed';
  winner_id?: number;
  winner_name?: string;
  image_url?: string; // URL to image of the prize (for physical items)
}

export interface Participant {
  id: number;
  user_id: number;
  name: string;
  points_at_join: number;
  current_points: number;
  joined_at: string;
}

export interface UserParticipation {
  pool_id: number;
  pool_title: string;
  pool_status: string;
  prize_amount: number;
  joined_at: string;
  is_winner: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class PrizePoolService {
  private getAuthHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async getAllPrizePools(status?: string): Promise<ApiResponse<{ pools: PrizePool[] }>> {
    try {
      const url = status 
        ? `${API_BASE}/api/prize-pools?status=${status}`
        : `${API_BASE}/api/prize-pools`;
        
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch prize pools');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching prize pools:', error);
      throw error;
    }
  }

  async getPrizePoolById(poolId: number): Promise<ApiResponse<{ pool: PrizePool; participants: Participant[] }>> {
    try {
      const response = await fetch(`${API_BASE}/api/prize-pools/${poolId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch prize pool');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching prize pool:', error);
      throw error;
    }
  }

  async getUserParticipations(): Promise<ApiResponse<{ participations: UserParticipation[] }>> {
    try {
      const response = await fetch(`${API_BASE}/api/prize-pools/my-participations`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch participations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching participations:', error);
      throw error;
    }
  }

  async joinPrizePool(poolId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/api/prize-pools/join`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ poolId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join prize pool');
      }

      return data;
    } catch (error) {
      console.error('Error joining prize pool:', error);
      throw error;
    }
  }

  // Admin functions
  async createPrizePool(poolData: Partial<PrizePool>): Promise<ApiResponse<{ pool: PrizePool }>> {
    try {
      const response = await fetch(`${API_BASE}/api/prize-pools`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(poolData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create prize pool');
      }

      return data;
    } catch (error) {
      console.error('Error creating prize pool:', error);
      throw error;
    }
  }

  async updatePrizePool(poolId: number, updates: Partial<PrizePool>): Promise<ApiResponse<{ pool: PrizePool }>> {
    try {
      const response = await fetch(`${API_BASE}/api/prize-pools/${poolId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update prize pool');
      }

      return data;
    } catch (error) {
      console.error('Error updating prize pool:', error);
      throw error;
    }
  }

  async selectWinner(poolId: number, selectionMethod: 'random' | 'manual' | 'top_performer', userId?: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/api/prize-pools/select-winner`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          poolId,
          selectionMethod,
          ...(userId && { userId }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to select winner');
      }

      return data;
    } catch (error) {
      console.error('Error selecting winner:', error);
      throw error;
    }
  }

  async deletePrizePool(poolId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE}/api/prize-pools/${poolId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete prize pool');
      }

      return data;
    } catch (error) {
      console.error('Error deleting prize pool:', error);
      throw error;
    }
  }
}

export const prizePoolService = new PrizePoolService();

