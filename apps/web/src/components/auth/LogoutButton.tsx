"use client";

import { useRouter } from "next/navigation";
import { API_URL } from "../../lib/api";

/**
 * LogoutButton Component
 * 
 * Implements comprehensive logout functionality per Requirement 5:
 * - Calls POST /api/auth/logout with Authorization Bearer token
 * - Clears all authentication tokens from cookies and localStorage
 * - Clears cached user data (balance, profile, preferences)
 * - Handles API failures gracefully by clearing local tokens anyway
 * - Redirects to homepage within 100ms after token clearing
 * 
 * Task 5.1: Create Logout Button Component
 */
export function LogoutButton() {
  const router = useRouter();
  
  async function handleLogout() {
    try {
      // Requirement 5.1: Call POST /api/auth/logout with Authorization Bearer token
      const token = getToken();
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
    } catch (error) {
      // Requirement 5.6: Even if API fails, still clear local data
      console.error('Logout API failed:', error);
    } finally {
      // Requirement 5.4 & 5.3: Always clear all authentication tokens and cached data
      clearAllTokens();
      clearCachedUserData();
      
      // Requirement 5.5: Redirect to homepage within 100ms (using 100ms timeout)
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 100);
    }
  }
  
  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

/**
 * Get current authentication token from localStorage
 * Checks multiple possible token keys for compatibility
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Check common token storage keys
  return localStorage.getItem('accessToken') 
    || localStorage.getItem('token')
    || null;
}

/**
 * Requirement 5.4: Clear all authentication tokens from cookies and localStorage
 * 
 * Clears:
 * - accessToken from localStorage
 * - refreshToken from localStorage
 * - token from localStorage (legacy/alternate key)
 * - user object from localStorage
 * - accessToken from cookies
 * - refreshToken from cookies
 */
function clearAllTokens(): void {
  if (typeof window === 'undefined') return;
  
  // Clear localStorage tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Clear cookie tokens by setting expired date
  // Note: This clears cookies for the current path
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

/**
 * Requirement 5.7: Clear cached user data from storage
 * 
 * Removes:
 * - cachedBalance / cachedWalletBalance
 * - userProfile
 * - userPreferences
 * - All sessionStorage data
 */
function clearCachedUserData(): void {
  if (typeof window === 'undefined') return;
  
  // Clear cached balance (used in wallet components)
  localStorage.removeItem('cachedBalance');
  localStorage.removeItem('cachedWalletBalance');
  
  // Clear cached user profile data
  localStorage.removeItem('userProfile');
  
  // Clear user preferences
  localStorage.removeItem('userPreferences');
  
  // Clear all session storage
  sessionStorage.clear();
}

/**
 * Default export for easier importing
 */
export default LogoutButton;
