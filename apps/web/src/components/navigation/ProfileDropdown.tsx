"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfileDropdownProps } from "@/types/navigation";
import { getRankColor } from "@/lib/navigation-utils";
import { API_URL } from "@/lib/api";

/**
 * ProfileDropdown Component
 * Structured dropdown menu for profile, actions, settings, and logout
 * Enhanced with keyboard navigation and focus management (Tasks 12.1, 12.2, 12.3)
 */
export default function ProfileDropdown({ user, isOpen, onClose }: ProfileDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const rankColor = getRankColor(user.rank);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Click outside and Escape key handlers
  useEffect(() => {
    if (!isOpen) return;

    // Task 12.1: Return focus to trigger button when dropdown closes
    const triggerButton = document.querySelector('[aria-haspopup="menu"]') as HTMLElement;
    
    // Task 12.2: Focus first menu item when dropdown opens
    if (firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
        // Return focus to trigger
        if (triggerButton) triggerButton.focus();
      }
    };

    // Task 12.2: Escape key closes dropdown
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        // Return focus to trigger
        if (triggerButton) triggerButton.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigation = (path: string) => {
    onClose();
    router.push(path);
  };

  /**
   * Implements comprehensive logout per Requirement 5
   * - Calls POST /api/auth/logout with Bearer token
   * - Clears all tokens and cached data
   * - Redirects to homepage within 100ms
   */
  const handleLogout = async () => {
    try {
      // Get auth token
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('accessToken') || localStorage.getItem('token'))
        : null;
      
      // Call logout API endpoint with Authorization header
      await fetch(`${API_URL}/auth/logout`, { 
        method: "POST",
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      // Requirement 5.6: Still clear local data even if API fails
      console.error("Logout API failed:", error);
    } finally {
      // Always clear tokens and cached data
      clearAllTokens();
      clearCachedUserData();
      
      onClose();
      
      // Requirement 5.5: Redirect within 100ms
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 100);
    }
  };
  
  /**
   * Clear all authentication tokens from localStorage and cookies
   */
  const clearAllTokens = () => {
    if (typeof window === 'undefined') return;
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear cookies
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };
  
  /**
   * Clear cached user data from storage
   */
  const clearCachedUserData = () => {
    if (typeof window === 'undefined') return;
    
    // Clear cached balance
    localStorage.removeItem('cachedBalance');
    localStorage.removeItem('cachedWalletBalance');
    
    // Clear cached user data
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userPreferences');
    
    // Clear session storage
    sessionStorage.clear();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Dropdown Container */}
      <div
        ref={dropdownRef}
        role="menu"
        aria-label="Menu profil"
        className="fixed md:absolute top-0 right-0 md:top-full md:mt-2 w-full md:w-80 h-full md:h-auto bg-slate-900/95 md:backdrop-blur-xl border-0 md:border border-white/10 md:rounded-xl shadow-2xl z-50 overflow-y-auto focus:outline-none"
        style={{
          animation: "slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Tutup menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Profile Info Section */}
        <div className="p-6 border-b border-white/10">
          <div className="text-base font-semibold text-gray-100">
            {user.username}
          </div>
          <div
            className="text-xs font-bold uppercase mt-1"
            style={{ color: rankColor }}
          >
            {user.rank}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            XP: {user.xp.toLocaleString('id-ID')}
          </div>
        </div>

        <Divider />

        {/* Quick Actions Section */}
        <div className="py-2">
          <MenuItem 
            ref={firstFocusableRef}
            onClick={() => handleNavigation("/profile")} 
            label="Profil Saya" 
          />
          <MenuItem 
            onClick={() => handleNavigation("/wallet")} 
            label="Wallet & Top Up" 
            highlight 
          />
          <MenuItem 
            onClick={() => handleNavigation("/vault")} 
            label="Koleksi Saya" 
          />
          <MenuItem 
            onClick={() => handleNavigation("/achievements")} 
            label="Pencapaian" 
          />
        </div>

        <Divider />

        {/* Settings Section */}
        <div className="py-2">
          <MenuItem 
            onClick={() => handleNavigation("/settings/account")} 
            label="Pengaturan Akun" 
          />
          <MenuItem 
            onClick={() => handleNavigation("/settings/display")} 
            label="Pengaturan Tampilan" 
          />
          <MenuItem 
            onClick={() => handleNavigation("/settings/privacy")} 
            label="Privasi" 
          />
        </div>

        <Divider />

        {/* Logout Action */}
        <div className="py-2">
          <MenuItem 
            onClick={handleLogout} 
            label="Keluar" 
            danger 
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (min-width: 768px) {
          @keyframes slideIn {
            from {
              transform: translateY(-10px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        }
      `}</style>
    </>
  );
}

// Visual Divider Component
function Divider() {
  return (
    <div
      className="h-px"
      style={{
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
      }}
    />
  );
}

// Menu Item Component
interface MenuItemProps {
  onClick: () => void;
  label: string;
  highlight?: boolean;
  danger?: boolean;
}

const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ onClick, label, highlight, danger }, ref) => {
    return (
      <button
        ref={ref}
        role="menuitem"
        onClick={onClick}
        // Task 12.3: Visible focus indicators
        className={`
          w-full px-6 py-3 text-left text-sm transition-all
          ${highlight ? "bg-emerald-500/10 text-emerald-400" : ""}
          ${danger ? "text-red-400" : !highlight ? "text-gray-200" : ""}
          hover:bg-white/5
          ${danger ? "hover:bg-red-500/10" : ""}
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset
        `}
        // Task 12.1: Ensure tab navigation works
        tabIndex={0}
      >
        {label}
      </button>
    );
  }
);

MenuItem.displayName = "MenuItem";

// Add React import for forwardRef
import * as React from "react";
