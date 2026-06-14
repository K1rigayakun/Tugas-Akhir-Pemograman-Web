"use client";

import { useState, useEffect } from "react";
import { WalletBalanceProps } from "@/types/navigation";
import { getRankColor } from "@/lib/navigation-utils";
import { API_URL } from "@/lib/api";

/**
 * WalletBalance Component
 * Displays user's wallet balance with hover tooltip
 * Fetches balance from API on mount and when wallet updates
 * Implements localStorage caching with fallback on API failure
 * 
 * Requirements: 3.1, 3.2, 3.4, 3.5, 3.6
 */
export default function WalletBalance({ balance: initialBalance, rank }: Omit<WalletBalanceProps, 'currency'>) {
  const [balance, setBalance] = useState<number>(initialBalance || 0);
  const [isCached, setIsCached] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const rankColor = getRankColor(rank);

  // Format balance with thousand separators and "CC" suffix
  // Requirement 3.4: Format with toLocaleString('en-US') and "CC" suffix
  const formatBalance = (amount: number): string => {
    return `${amount.toLocaleString('en-US')} CC`;
  };

  // Fetch balance from API
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
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      // API returns object with balance field or totalBalance field
      const newBalance = data.balance ?? data.totalBalance ?? 0;
      
      setBalance(newBalance);
      setIsCached(false);
      
      // Cache balance for offline use (Requirement 3.6)
      if (typeof window !== 'undefined') {
        localStorage.setItem('cachedWalletBalance', String(newBalance));
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      
      // Use cached balance on error (Requirement 3.6)
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('cachedWalletBalance');
        if (cached !== null) {
          setBalance(Number(cached) || 0);
          setIsCached(true);
        }
      }
    }
  };

  // Fetch balance on mount (Requirement 3.2)
  useEffect(() => {
    fetchBalance();

    // Set up polling for balance updates every 30 seconds
    const intervalId = setInterval(fetchBalance, 30000);

    // Listen for custom wallet update events (Requirement 3.2)
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
  const tooltipText = isCached ? "Saldo dari cache (offline)" : "Saldo Dompet Anda";

  return (
    <div
      role="status"
      aria-label={`Saldo dompet: ${formattedBalance}${isCached ? ' (cached)' : ''}`}
      className="relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-default"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: `1px solid ${rankColor}`,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Wallet Icon */}
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={rankColor} 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>

      {/* Balance Amount */}
      <span
        className="text-sm font-semibold hidden md:inline"
        style={{ color: rankColor }}
      >
        {formattedBalance}
      </span>

      {/* Mobile: Show only amount without label */}
      <span
        className="text-sm font-semibold md:hidden"
        style={{ color: rankColor }}
      >
        {balance.toLocaleString('en-US')} CC
      </span>

      {/* Warning indicator for cached data (Requirement 3.6) */}
      {isCached && (
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#f59e0b" 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Using cached balance"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )}

      {/* Hover Tooltip */}
      {showTooltip && (
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-md whitespace-nowrap pointer-events-none z-50"
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
        >
          {tooltipText}
          {/* Tooltip Arrow */}
          <div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderBottom: "4px solid rgba(0,0,0,0.9)",
            }}
          />
        </div>
      )}
    </div>
  );
}
