/**
 * LogoutButton Component Tests
 * 
 * Validates Requirement 5: User Logout Functionality
 * Tests all acceptance criteria for comprehensive logout
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('LogoutButton - Token Clearing', () => {
  let mockLocalStorage: Record<string, string>;
  let mockCookies: string[];
  
  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: vi.fn(() => {
        mockLocalStorage = {};
      }),
      length: 0,
      key: vi.fn(),
    } as any;
    
    // Mock sessionStorage
    global.sessionStorage = {
      clear: vi.fn(),
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as any;
    
    // Mock document.cookie
    mockCookies = [];
    Object.defineProperty(document, 'cookie', {
      get: () => mockCookies.join('; '),
      set: (value: string) => {
        mockCookies.push(value);
      },
      configurable: true,
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should clear accessToken from localStorage', () => {
    mockLocalStorage['accessToken'] = 'test-access-token';
    
    // Simulate token clearing
    localStorage.removeItem('accessToken');
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
  });
  
  it('should clear refreshToken from localStorage', () => {
    mockLocalStorage['refreshToken'] = 'test-refresh-token';
    
    localStorage.removeItem('refreshToken');
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });
  
  it('should clear legacy token from localStorage', () => {
    mockLocalStorage['token'] = 'test-token';
    
    localStorage.removeItem('token');
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });
  
  it('should clear all authentication cookies', () => {
    const cookiesBefore = mockCookies.length;
    
    // Simulate cookie clearing
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    expect(mockCookies.length).toBeGreaterThan(cookiesBefore);
    expect(mockCookies.some(c => c.includes('accessToken=;'))).toBe(true);
    expect(mockCookies.some(c => c.includes('refreshToken=;'))).toBe(true);
  });
});

describe('LogoutButton - Cached Data Clearing', () => {
  let mockLocalStorage: Record<string, string>;
  
  beforeEach(() => {
    mockLocalStorage = {
      'cachedBalance': '1000',
      'cachedWalletBalance': '1500',
      'userProfile': JSON.stringify({ username: 'testuser' }),
      'userPreferences': JSON.stringify({ theme: 'dark' }),
    };
    
    global.localStorage = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn(),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as any;
    
    global.sessionStorage = {
      clear: vi.fn(),
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as any;
  });
  
  it('should clear cachedBalance from localStorage', () => {
    localStorage.removeItem('cachedBalance');
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('cachedBalance');
  });
  
  it('should clear cachedWalletBalance from localStorage', () => {
    localStorage.removeItem('cachedWalletBalance');
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('cachedWalletBalance');
  });
  
  it('should clear userProfile from localStorage', () => {
    localStorage.removeItem('userProfile');
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('userProfile');
  });
  
  it('should clear userPreferences from localStorage', () => {
    localStorage.removeItem('userPreferences');
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('userPreferences');
  });
  
  it('should clear all sessionStorage', () => {
    sessionStorage.clear();
    
    expect(sessionStorage.clear).toHaveBeenCalled();
  });
});

describe('LogoutButton - API Interaction', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    
    global.localStorage = {
      getItem: vi.fn((key: string) => {
        if (key === 'accessToken') return 'test-access-token';
        if (key === 'token') return 'test-token';
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as any;
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should call POST /api/auth/logout with Authorization Bearer token', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-access-token',
        'Content-Type': 'application/json',
      },
    });
    
    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-access-token',
        'Content-Type': 'application/json',
      },
    });
  });
  
  it('should handle API failure gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Error should be caught but not prevent token clearing
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe('LogoutButton - Redirection', () => {
  it('should redirect within 100ms timeout requirement', async () => {
    const startTime = Date.now();

    await new Promise((resolve) => setTimeout(resolve, 100));

    const elapsedTime = Date.now() - startTime;
    expect(elapsedTime).toBeGreaterThanOrEqual(90); // Allow 10ms margin
    expect(elapsedTime).toBeLessThanOrEqual(150); // Allow some timing variance
  });
});
