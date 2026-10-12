import config from './config';
import { getRegistrationDeviceIdentity } from './device-identity';

const API_BASE = config.API_BASE;

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  role: string;
  image?: string;
  referral_code?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  referral?: {
    applied: boolean;
    signup_points: number;
    referral_points: number;
  };
}

export interface RegistrationResponse {
  message: string;
  verification_required: true;
  user: Pick<User, 'id' | 'name' | 'email'>;
  verification_url?: string;
  referral?: {
    applied: boolean;
    signup_points: number;
    referral_points: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  whatsapp?: string;
  referral_code?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  // Helper to safely check if localStorage is available
  private isLocalStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined') {
        return false;
      }
      if (typeof localStorage === 'undefined') {
        return false;
      }
      // Test if localStorage methods actually work
      const testKey = '__localStorage_test__';
      try {
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  constructor() {
    // Load token and user from localStorage on initialization
    if (this.isLocalStorageAvailable()) {
      try {
        this.token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          try {
            this.user = JSON.parse(userStr);
          } catch (e) {
            console.error('Failed to parse stored user:', e);
          }
        }
      } catch (e) {
        console.warn('AuthService: Could not access localStorage during initialization:', e);
      }
    }
  }

  // Set token and user, save to localStorage
  setAuth(token: string, user: User) {
    console.log('AuthService: Setting auth - token:', token ? 'present' : 'missing', 'user:', user);
    this.token = token;
    this.user = user;
    if (this.isLocalStorageAvailable()) {
      // Set localStorage first
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      // Set cookies for middleware access with immediate effect
      this.setAuthCookies(token, user);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('authStateChanged'));
      
      console.log('AuthService: Saved to localStorage and cookies');
      console.log('  localStorage auth_token:', localStorage.getItem('auth_token') ? 'present' : 'missing');
      console.log('  localStorage auth_user:', localStorage.getItem('auth_user') ? 'present' : 'missing');
      console.log('  cookies set:', document.cookie);
    }
  }

  // Set authentication cookies with proper encoding and error handling
  private setAuthCookies(token: string, user: User) {
    try {
      // Store only essential data in cookies to avoid truncation
      const encodedToken = encodeURIComponent(token);
      
      // Create a minimal user object for cookies (avoid long URLs)
      const minimalUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
        // Exclude image URL to prevent cookie truncation
      };
      const encodedUserData = encodeURIComponent(JSON.stringify(minimalUser));
      
      // Determine if we're on HTTPS
      const isSecure = window.location.protocol === 'https:';
      const secureFlag = isSecure ? '; Secure' : '';
      
      // Set cookies with immediate effect - use explicit expiration date
      const expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
      const expires = `; expires=${expirationDate.toUTCString()}`;
      
      // Set cookies with all necessary flags
      document.cookie = `custom_auth_token=${encodedToken}; path=/${expires}; SameSite=Lax${secureFlag}`;
      document.cookie = `custom_user_data=${encodedUserData}; path=/${expires}; SameSite=Lax${secureFlag}`;
      
      // Small delay to ensure cookies are processed
      setTimeout(() => {
        // Verify cookies were set
        const tokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('custom_auth_token='));
        const userCookie = document.cookie.split(';').find(c => c.trim().startsWith('custom_user_data='));
        
        console.log('Cookie verification:', {
          tokenCookieSet: !!tokenCookie,
          userCookieSet: !!userCookie,
          tokenCookieLength: tokenCookie?.length || 0,
          userCookieLength: userCookie?.length || 0,
          allCookies: document.cookie
        });
        
        if (!tokenCookie || !userCookie) {
          console.warn('Failed to set authentication cookies properly, retrying...');
          // Retry once
          document.cookie = `custom_auth_token=${encodedToken}; path=/${expires}; SameSite=Lax${secureFlag}`;
          document.cookie = `custom_user_data=${encodedUserData}; path=/${expires}; SameSite=Lax${secureFlag}`;
        }
      }, 50);
    } catch (error) {
      console.error('Error setting auth cookies:', error);
    }
  }

  // Refresh auth state from localStorage
  refreshAuthState(): void {
    if (this.isLocalStorageAvailable()) {
      this.token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
      console.log('AuthService: Refreshed state - token:', this.token ? 'present' : 'missing', 'user:', this.user ? 'present' : 'missing');
    }
  }

  // Get current token
  getToken(): string | null {
    // Always read from localStorage to ensure we have the latest data
    if (this.isLocalStorageAvailable()) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  // Get current user
  getUser(): User | null {
    // Always read from localStorage to ensure we have the latest data
    if (this.isLocalStorageAvailable()) {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
    }
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // Always read from localStorage to ensure we have the latest data
    if (this.isLocalStorageAvailable()) {
      this.token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
    }
    return !!this.token && !!this.user;
  }

  // Register new user with email/password
  async register(data: RegisterRequest): Promise<RegistrationResponse> {
    try {
      const device = getRegistrationDeviceIdentity();
      const response = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          device_id: device.deviceId,
          device_fingerprint: device.fingerprint,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle validation errors with details array
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessage = errorData.details.map((d: any) => d.msg || d.message || d).join(', ');
          throw new Error(errorMessage || errorData.error || 'Registration failed');
        }
        throw new Error(errorData.error || errorData.message || 'Registration failed');
      }

      return response.json();
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof TypeError) {
        throw new Error('Could not connect to Pinecrest. Check your connection, refresh the page, and try again.');
      }
      throw error;
    }
  }

  // Login user with email/password
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle validation errors with details array
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessage = errorData.details.map((d: any) => d.msg || d.message || d).join(', ');
          throw new Error(errorMessage || errorData.error || 'Login failed');
        }
        // Handle error with details field (from login controller)
        if (errorData.details) {
          throw new Error(errorData.details || errorData.error || 'Login failed');
        }
        throw new Error(errorData.error || errorData.message || 'Login failed');
      }

      const result: AuthResponse = await response.json();
      this.setAuth(result.token, result.user);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Clear all authentication data
  clearAuth() {
    console.log('AuthService: Clearing all authentication data');
    this.token = null;
    this.user = null;
    
    if (this.isLocalStorageAvailable()) {
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Clear all auth-related cookies
      this.clearAuthCookies();
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('authStateChanged'));
      
      console.log('AuthService: All authentication data cleared');
    }
  }

  // Clear authentication cookies
  private clearAuthCookies() {
    try {
      // Clear all possible auth cookie names
      const cookieNames = [
        'custom_auth_token',
        'custom_user_data',
        'auth_token',
        'auth_user',
        'session_token',
        'user_session'
      ];
      
      cookieNames.forEach(cookieName => {
        // Clear for current domain
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        // Clear for parent domain
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        // Clear for subdomain
        const domain = window.location.hostname.split('.').slice(-2).join('.');
        if (domain !== window.location.hostname) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
        }
      });
      
      console.log('AuthService: All authentication cookies cleared');
    } catch (error) {
      console.error('Error clearing auth cookies:', error);
    }
  }

  // Handle Google OAuth success
  async handleGoogleAuth(idToken: string, referralCode?: string): Promise<void> {
    try {
      // Clear any existing authentication data before proceeding
      console.log('Clearing existing authentication data before Google login...');
      this.clearAuth();
      
      // Wait a moment for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // First, try to authenticate with the backend to get a proper JWT token
      try {
        console.log('Attempting backend Google OAuth authentication...');
        console.log('API Base URL:', config.API_BASE);
        const response = await fetch(`${config.API_BASE}/api/users/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ idToken, referral_code: referralCode }),
        });

        console.log('Backend response status:', response.status);
        console.log('Backend response headers:', response.headers);

        if (response.ok) {
          const result = await response.json();
          console.log('Backend response data:', result);
          
          if (result.success && result.token && result.user) {
            console.log('Backend authentication successful:', result);
            this.setAuth(result.token, result.user);
            
            // Wait a moment for cookies to be set
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Verify authentication state
            const isAuth = this.isAuthenticated();
            console.log('Post-backend auth verification:', isAuth);
            
            if (!isAuth) {
              throw new Error('Authentication state not properly set after backend auth');
            }
            
            return;
          } else {
            console.error('Backend authentication failed - invalid response format:', result);
            throw new Error('Invalid response format from backend');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Google authentication failed: ${response.status}`);
        }
      } catch (backendError) {
        console.error('Backend Google authentication failed:', backendError);
        throw backendError;
      }
      
      // Log the successful Google authentication
      console.log('Google OAuth successful - user authenticated:', this.isAuthenticated());
    } catch (error) {
      console.error('Google auth handling error:', error);
      throw error;
    }
  }

  // Logout user (works for both email and OAuth auth)
  logout(): void {
    this.clearAuth();
  }

  // Refresh cookies for current user (useful for ensuring server-side auth works)
  refreshCookies() {
    if (this.token && this.user) {
      console.log('AuthService: Refreshing cookies for current user');
      this.setAuthCookies(this.token, this.user);
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/api/users/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Email verification failed');
    }

    return response.json();
  }

  // Forgot password (email only)
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE}/api/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Password reset request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password (email only)
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE}/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Password reset failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Get user profile (requires authentication)
  async getProfile(): Promise<User> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    // If it's a Google token, return the stored user
    if (this.token.startsWith('google_')) {
      if (!this.user) {
        throw new Error('No user data found');
      }
      return this.user;
    }

    // For email auth, fetch from backend
    try {
      const response = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuth();
          throw new Error('Authentication expired');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const user = await response.json();
      this.user = user; // Update stored user
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile (requires authentication)
  async updateProfile(data: Partial<User>): Promise<{ message: string; user: User }> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    // Google users can't update profile through backend
    if (this.token.startsWith('google_')) {
      throw new Error('Profile updates not supported for Google OAuth users');
    }

    try {
      const response = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuth();
          throw new Error('Authentication expired');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      this.user = result.user; // Update stored user
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem('auth_user', JSON.stringify(result.user));
      }
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Change password (email only)
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    // Google users can't change password through backend
    if (this.token.startsWith('google_')) {
      throw new Error('Password changes not supported for Google OAuth users');
    }

    try {
      const response = await fetch(`${API_BASE}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuth();
          throw new Error('Authentication expired');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      return await response.json();
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Check if current user is from Google OAuth
  isGoogleUser(): boolean {
    return this.token ? this.token.startsWith('google_') : false;
  }

  // Check if current user is from email authentication
  isEmailUser(): boolean {
    return this.token ? !this.token.startsWith('google_') : false;
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
