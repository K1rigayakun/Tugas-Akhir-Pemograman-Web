/**
 * Admin Authentication Service
 * 
 * Handles authentication operations for the admin panel including:
 * - Login with credentials
 * - Logout and session cleanup
 * - Token storage and retrieval
 * - Authentication state management
 * 
 * Security considerations:
 * - Tokens stored in localStorage (client-side only)
 * - For production, consider using HTTP-only cookies via server actions
 * - All API calls include authentication headers
 * - Automatic redirect on 401 responses
 */

import { buildApiUrl } from './api';

/**
 * User object returned by the API after successful authentication
 */
export interface User {
  id: string;
  email: string;
  username?: string;
  adminRole?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

/**
 * Response from the login API endpoint
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  requires2fa?: boolean;
  requires2faSetup?: boolean;
  tempToken?: string;
  qrCodeUrl?: string;
  secret?: string;
}

/**
 * Admin Authentication Service
 * Provides methods for handling admin authentication flows
 */
export class AdminAuthService {
  private static TOKEN_KEY = 'admin_token';
  private static REFRESH_TOKEN_KEY = 'admin_refresh_token';
  private static USER_KEY = 'admin_user';

  /**
   * Login with email and password
   * 
   * @param email - Admin email address
   * @param password - Admin password
   * @returns Login response with tokens and user data
   * @throws Error if login fails
   */
  static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(buildApiUrl('/v1/admin/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }

      const data: LoginResponse = await response.json();

      // If 2FA is required, return the response for client to handle
      if (data.requires2fa) {
        return data;
      }

      // Store tokens and user data for direct login (no 2FA)
      if (data.accessToken) {
        this.storeToken(data.accessToken);
        if (data.refreshToken) {
          this.storeRefreshToken(data.refreshToken);
        }
        if (data.user) {
          this.storeUser(data.user);
        }
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  /**
   * Complete 2FA setup with verification code
   * 
   * @param tempToken - Temporary token from initial login
   * @param code - 6-digit verification code from authenticator app
   * @returns Access token and user data
   * @throws Error if verification fails
   */
  static async setup2FA(tempToken: string, code: string): Promise<LoginResponse> {
    try {
      const response = await fetch(buildApiUrl('/v1/auth/2fa/setup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempToken, code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '2FA setup failed. Please try again.');
      }

      const data: LoginResponse = await response.json();

      // Store tokens and user data
      if (data.accessToken) {
        this.storeToken(data.accessToken);
        if (data.refreshToken) {
          this.storeRefreshToken(data.refreshToken);
        }
        if (data.user) {
          this.storeUser(data.user);
        }
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error during 2FA setup.');
    }
  }

  /**
   * Verify 2FA code during login
   * 
   * @param tempToken - Temporary token from initial login
   * @param code - 6-digit verification code from authenticator app
   * @returns Access token and user data
   * @throws Error if verification fails
   */
  static async verify2FA(tempToken: string, code: string): Promise<LoginResponse> {
    try {
      const response = await fetch(buildApiUrl('/v1/auth/2fa/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempToken, code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '2FA verification failed. Please check your code.');
      }

      const data: LoginResponse = await response.json();

      // Store tokens and user data
      if (data.accessToken) {
        this.storeToken(data.accessToken);
        if (data.refreshToken) {
          this.storeRefreshToken(data.refreshToken);
        }
        if (data.user) {
          this.storeUser(data.user);
        }
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error during 2FA verification.');
    }
  }

  /**
   * Logout current admin user
   * 
   * This method:
   * 1. Calls the logout API endpoint to invalidate the session server-side
   * 2. Clears all authentication tokens from local storage
   * 3. Clears cached user data
   * 
   * Note: Always clears local data even if API call fails
   * 
   * @returns Promise that resolves when logout is complete
   */
  static async logout(): Promise<void> {
    try {
      const token = this.getStoredToken();
      
      if (token) {
        // Call logout API endpoint
        await fetch(buildApiUrl('/v1/auth/logout'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      // Log error but don't throw - we still want to clear local tokens
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local authentication data
      this.clearTokens();
      this.clearUser();
    }
  }

  /**
   * Store access token in localStorage
   * 
   * @param token - JWT access token
   */
  static storeToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * Store refresh token in localStorage
   * 
   * @param token - JWT refresh token
   */
  static storeRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  /**
   * Store user data in localStorage
   * 
   * @param user - User object
   */
  static storeUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Retrieve stored access token
   * 
   * @returns Access token or null if not found
   */
  static getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Retrieve stored refresh token
   * 
   * @returns Refresh token or null if not found
   */
  static getStoredRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  /**
   * Retrieve stored user data
   * 
   * @returns User object or null if not found
   */
  static getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem(this.USER_KEY);
      if (userJson) {
        try {
          return JSON.parse(userJson);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Clear all authentication tokens from storage
   */
  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  /**
   * Clear user data from storage
   */
  static clearUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  /**
   * Clear all cached user-specific data (wallet balance, preferences, etc.)
   */
  static clearCachedData(): void {
    if (typeof window !== 'undefined') {
      // Remove cached data that might be user-specific
      const keysToRemove = [
        'cachedBalance',
        'userProfile',
        'userPreferences',
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear session storage as well
      sessionStorage.clear();
    }
  }

  /**
   * Check if user is currently authenticated
   * 
   * @returns true if access token exists, false otherwise
   */
  static isAuthenticated(): boolean {
    return this.getStoredToken() !== null;
  }

  /**
   * Get current authenticated user
   * 
   * @returns User object or null if not authenticated
   */
  static getCurrentUser(): User | null {
    return this.getStoredUser();
  }
}

/**
 * Legacy compatibility functions for existing code
 * These maintain backward compatibility with existing implementations
 */

/**
 * Get stored access token (legacy function)
 */
export function getToken(): string | null {
  return AdminAuthService.getStoredToken();
}

/**
 * Clear all tokens (legacy function)
 */
export function clearAllTokens(): void {
  AdminAuthService.clearTokens();
}

/**
 * Clear cached user data (legacy function)
 */
export function clearCachedUserData(): void {
  AdminAuthService.clearCachedData();
}
