/**
 * Unit tests for Admin Authentication Service
 * Task 1.1: Create Admin Authentication Service and API Client
 * Requirements: 1.1, 1.3, 1.4, 1.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AdminAuthService, getToken, clearAllTokens, clearCachedUserData } from './auth';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

describe('AdminAuthService', () => {
  beforeEach(() => {
    // Clear all mocks and storage before each test
    vi.clearAllMocks();
    localStorageMock.clear();
    sessionStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Requirement 1.1: Authenticate admin user with valid credentials
      const mockUser = {
        id: '123',
        email: 'admin@example.com',
        username: 'admin',
        adminRole: 'SUPER_ADMIN',
      };

      const mockResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await AdminAuthService.login('admin@example.com', 'password123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@example.com', password: 'password123' }),
        })
      );

      expect(result).toEqual(mockResponse);
      
      // Requirement 1.4: Store authentication tokens securely
      expect(localStorageMock.getItem('admin_token')).toBe('mock-access-token');
      expect(localStorageMock.getItem('admin_refresh_token')).toBe('mock-refresh-token');
      expect(localStorageMock.getItem('admin_user')).toBe(JSON.stringify(mockUser));
    });

    it('should throw error for invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      });

      await expect(
        AdminAuthService.login('invalid@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should handle 2FA requirement', async () => {
      const mockResponse = {
        requires2fa: true,
        tempToken: 'temp-token-123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await AdminAuthService.login('admin@example.com', 'password123');

      expect(result).toEqual(mockResponse);
      // Tokens should not be stored when 2FA is required
      expect(localStorageMock.getItem('admin_token')).toBeNull();
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        AdminAuthService.login('admin@example.com', 'password123')
      ).rejects.toThrow('Network error');
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      // Set up authenticated state
      localStorageMock.setItem('admin_token', 'test-token');
      localStorageMock.setItem('admin_refresh_token', 'test-refresh');
      localStorageMock.setItem('admin_user', JSON.stringify({ id: '123', email: 'test@example.com' }));
      localStorageMock.setItem('cachedBalance', '1000');
      localStorageMock.setItem('userProfile', JSON.stringify({ name: 'Test' }));
    });

    it('should call logout API and clear all tokens', async () => {
      // Requirement 1.3: Clear authentication tokens on logout
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await AdminAuthService.logout();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/logout'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );

      // Verify all tokens are cleared
      expect(localStorageMock.getItem('admin_token')).toBeNull();
      expect(localStorageMock.getItem('admin_refresh_token')).toBeNull();
      expect(localStorageMock.getItem('admin_user')).toBeNull();
    });

    it('should clear tokens even if API call fails', async () => {
      // Requirement: Always clear local data even if API fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await AdminAuthService.logout();

      // Tokens should still be cleared
      expect(localStorageMock.getItem('admin_token')).toBeNull();
      expect(localStorageMock.getItem('admin_refresh_token')).toBeNull();
      expect(localStorageMock.getItem('admin_user')).toBeNull();
    });

    it('should clear cached user data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await AdminAuthService.logout();
      AdminAuthService.clearCachedData();

      expect(localStorageMock.getItem('cachedBalance')).toBeNull();
      expect(localStorageMock.getItem('userProfile')).toBeNull();
    });
  });

  describe('token storage and retrieval', () => {
    it('should store and retrieve access token', () => {
      // Requirement 1.4: Token storage and retrieval methods
      AdminAuthService.storeToken('test-access-token');
      expect(AdminAuthService.getStoredToken()).toBe('test-access-token');
    });

    it('should store and retrieve refresh token', () => {
      AdminAuthService.storeRefreshToken('test-refresh-token');
      expect(AdminAuthService.getStoredRefreshToken()).toBe('test-refresh-token');
    });

    it('should store and retrieve user data', () => {
      const user = { id: '123', email: 'test@example.com', adminRole: 'SUPER_ADMIN' };
      AdminAuthService.storeUser(user);
      expect(AdminAuthService.getStoredUser()).toEqual(user);
    });

    it('should handle invalid JSON in user data', () => {
      localStorageMock.setItem('admin_user', 'invalid-json');
      expect(AdminAuthService.getStoredUser()).toBeNull();
    });

    it('should return null for missing tokens', () => {
      expect(AdminAuthService.getStoredToken()).toBeNull();
      expect(AdminAuthService.getStoredRefreshToken()).toBeNull();
      expect(AdminAuthService.getStoredUser()).toBeNull();
    });
  });

  describe('authentication state', () => {
    it('should return true when authenticated', () => {
      localStorageMock.setItem('admin_token', 'test-token');
      expect(AdminAuthService.isAuthenticated()).toBe(true);
    });

    it('should return false when not authenticated', () => {
      expect(AdminAuthService.isAuthenticated()).toBe(false);
    });

    it('should get current user when authenticated', () => {
      const user = { id: '123', email: 'test@example.com' };
      localStorageMock.setItem('admin_user', JSON.stringify(user));
      expect(AdminAuthService.getCurrentUser()).toEqual(user);
    });

    it('should return null for current user when not authenticated', () => {
      expect(AdminAuthService.getCurrentUser()).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should clear all authentication tokens', () => {
      localStorageMock.setItem('admin_token', 'test-token');
      localStorageMock.setItem('admin_refresh_token', 'test-refresh');
      
      AdminAuthService.clearTokens();
      
      expect(localStorageMock.getItem('admin_token')).toBeNull();
      expect(localStorageMock.getItem('admin_refresh_token')).toBeNull();
    });
  });

  describe('clearUser', () => {
    it('should clear user data', () => {
      localStorageMock.setItem('admin_user', JSON.stringify({ id: '123' }));
      
      AdminAuthService.clearUser();
      
      expect(localStorageMock.getItem('admin_user')).toBeNull();
    });
  });

  describe('clearCachedData', () => {
    it('should clear all cached user-specific data', () => {
      localStorageMock.setItem('cachedBalance', '1000');
      localStorageMock.setItem('userProfile', JSON.stringify({ name: 'Test' }));
      localStorageMock.setItem('userPreferences', JSON.stringify({ theme: 'dark' }));
      
      AdminAuthService.clearCachedData();
      
      expect(localStorageMock.getItem('cachedBalance')).toBeNull();
      expect(localStorageMock.getItem('userProfile')).toBeNull();
      expect(localStorageMock.getItem('userPreferences')).toBeNull();
    });
  });

  describe('2FA setup', () => {
    it('should complete 2FA setup with valid code', async () => {
      const mockResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { id: '123', email: 'admin@example.com' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await AdminAuthService.setup2FA('temp-token', '123456');

      expect(result).toEqual(mockResponse);
      expect(localStorageMock.getItem('admin_token')).toBe('mock-access-token');
    });

    it('should throw error for invalid 2FA code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid code' }),
      });

      await expect(
        AdminAuthService.setup2FA('temp-token', '000000')
      ).rejects.toThrow('Invalid code');
    });
  });

  describe('2FA verification', () => {
    it('should verify 2FA code during login', async () => {
      const mockResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { id: '123', email: 'admin@example.com' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await AdminAuthService.verify2FA('temp-token', '123456');

      expect(result).toEqual(mockResponse);
      expect(localStorageMock.getItem('admin_token')).toBe('mock-access-token');
    });

    it('should throw error for invalid verification code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid verification code' }),
      });

      await expect(
        AdminAuthService.verify2FA('temp-token', '000000')
      ).rejects.toThrow('Invalid verification code');
    });
  });

  describe('legacy compatibility functions', () => {
    it('should support getToken legacy function', () => {
      localStorageMock.setItem('admin_token', 'legacy-token');
      expect(getToken()).toBe('legacy-token');
    });

    it('should support clearAllTokens legacy function', () => {
      localStorageMock.setItem('admin_token', 'test-token');
      localStorageMock.setItem('admin_refresh_token', 'test-refresh');
      
      clearAllTokens();
      
      expect(localStorageMock.getItem('admin_token')).toBeNull();
      expect(localStorageMock.getItem('admin_refresh_token')).toBeNull();
    });

    it('should support clearCachedUserData legacy function', () => {
      localStorageMock.setItem('cachedBalance', '1000');
      
      clearCachedUserData();
      
      expect(localStorageMock.getItem('cachedBalance')).toBeNull();
    });
  });
});
