// Centralized API configuration for all admin and client requests
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE || 'https://pinecrest.konhito.me',
  ENDPOINTS: {
    // Admin
    ADMIN_DASHBOARD: '/api/admin/dashboard/stats',
    ADMIN_USERS: '/api/admin/users',
    ADMIN_TASKS: '/api/admin/tasks',
    ADMIN_SUBMISSIONS: '/api/admin/submissions/pending',
    ADMIN_ACTIVITIES: '/api/admin/activities',
    ADMIN_AUDIT_LOG: '/api/admin/audit-log',
    ADMIN_DUPLICATE_IMAGES: '/api/admin/duplicate-images',
    
    // News
    NEWS_ADMIN_ALL: '/api/news/admin/all',
    NEWS_ADMIN_CREATE: '/api/news/admin/create',
    NEWS_ADMIN_UPDATE: (id: number) => `/api/news/admin/${id}`,
    NEWS_ADMIN_DELETE: (id: number) => `/api/news/admin/${id}`,
    NEWS_PUBLIC: '/api/news',
    NEWS_BY_SLUG: (slug: string) => `/api/news/${slug}`,
    
    // Settings
    SETTINGS_ALL: '/api/settings',
    SETTINGS_UPDATE: (key: string) => `/api/settings/${key}`,
    
    // Prize Pools
    PRIZE_POOLS: '/api/prize-pools',
    PRIZE_POOL_BY_ID: (id: number) => `/api/prize-pools/${id}`,
    PRIZE_POOL_ENTRIES: (id: number) => `/api/prize-pools/${id}/entries`,
    
    // Withdrawals
    WITHDRAWALS: '/api/withdrawals',
    WITHDRAWAL_APPROVE: (id: number) => `/api/withdrawals/${id}/approve`,
    WITHDRAWAL_REJECT: (id: number) => `/api/withdrawals/${id}/reject`,
    
    // Points System
    POINTS_SYSTEM: '/api/points',
    POINTS_HISTORY: '/api/points/history',
    
    // AI Verification
    AI_VERIFICATION: '/api/admin/ai-verification',
    AI_VERIFICATION_STATS: '/api/admin/ai-verification/stats',
    
    // Tasks
    TASKS: '/api/tasks',
    TASK_BY_ID: (id: number) => `/api/tasks/${id}`,
    TASK_SUBMIT: (id: number) => `/api/tasks/${id}/submit`,
    
    // Users
    USERS: '/api/users',
    USER_BY_ID: (id: number) => `/api/users/${id}`,
    USER_STATS: '/api/users/stats',
  }
};

// Helper to get full URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Helper to get auth headers
export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// Helper for fetch with auth
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = getApiUrl(endpoint);
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };
  
  return fetch(url, {
    ...options,
    headers
  });
}
