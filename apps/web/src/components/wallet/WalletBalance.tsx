"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";

/**
 * WalletBalance Component
 * Standalone wallet balance display component
 * 
 * Features:
 * - Fetches balance from /api/v1/wallet/balance on mount
 * - Auto-updates when wallet changes (via custom event)
 * - Formats balance with thousand separators and "CC" suffix
 * - Handles zero balance (displays "0 CC")
 * - Implements localStorage caching with fallback on API failure
 * - Shows warning indicator when displaying cached data
 * 
 * Requirements: 3.1, 3.2, 3.4, 3.5, 3.6
 */

interface WalletBalanceComponentProps {
  className?: string;
  showIcon?: boolean;
  inline?: boolean;
}

export default function WalletBalance({ 
  className = "", 
  showIcon = true,
  inline = false 
}: WalletBalanceComponentProps) {
  const [balance, setBalance] = useState<number>(0);
  const [isCached, setIsCached] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Format balance with thousand separators and "CC" suffix
   * Requirement 3.4: Use toLocaleString('en-US') with "CC" suffix
   */
  const formatBalance = (amount: number): string => {
    return `${amount.toLocaleString('en-US')} CC`;
  };

  /**
   * Fetch balance from API endpoint
   * Requirement 3.2: Fetch from /api/v1/wallet/balance on mount and when wallet updates
   */
  const fetchBalance = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const response = await fetch(`${API_URL}/wallet/balance`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`);
      }

      const data = await response.json();
      // API may return { balance: number } or { totalBalance: number }
      const newBalance = data.balance ?? data.totalBalance ?? 0;
      
      setBalance(newBalance);
      setIsCached(false);
      setIsLoading(false);
      
      // Requirement 3.6: Cache balance in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cachedWalletBalance', String(newBalance));
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      
      // Requirement 3.6: Display cached balance with warning indicator on API failure
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('cachedWalletBalance');
        if (cached !== null) {
          const cachedBalance = Number(cached) || 0;
          setBalance(cachedBalance);
          setIsCached(true);
        }
      }
      setIsLoading(false);
    }
  };

  // Requirement 3.2: Fetch on mount and when wallet updates
  useEffect(() => {
    fetchBalance();

    // Poll for updates every 30 seconds
    const intervalId = setInterval(fetchBalance, 30000);

    // Listen for custom wallet update events
    const handleWalletUpdate = () => {
      fetchBalance();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('walletUpdated', handleWalletUpdate);
    }

    return () => {
      clearInterval(intervalId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('walletUpdated', handleWalletUpdate);
      }
    };
  }, []);

  // Requirement 3.5: Handle zero balance by displaying "0 CC"
  const formattedBalance = formatBalance(balance);

  if (inline) {
    return (
      <span className={className}>
        {formattedBalance}
        {isCached && (
          <span 
            title="Using cached balance (offline)" 
            style={{ marginLeft: '4px', color: '#f59e0b' }}
          >
            ⚠
          </span>
        )}
      </span>
    );
  }

  return (
    <div className={`wallet-balance ${className}`}>
      {showIcon && (
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'inline', marginRight: '8px' }}
        >
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
      )}
      
      <span className="balance-amount">
        {isLoading ? 'Loading...' : formattedBalance}
      </span>

      {/* Requirement 3.6: Warning indicator for cached data */}
      {isCached && !isLoading && (
        <span 
          className="warning-indicator" 
          title="Using cached balance (offline)"
          style={{ 
            marginLeft: '8px', 
            color: '#f59e0b',
            fontSize: '0.9em'
          }}
        >
          ⚠
        </span>
      )}
    </div>
  );
}

/**
 * Helper function to trigger wallet update event
 * Call this after successful top-up or transaction
 */
export function triggerWalletUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('walletUpdated'));
  }
}
