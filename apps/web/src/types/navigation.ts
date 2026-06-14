/**
 * Navigation Types
 * Type definitions for navigation components
 */

export interface WalletBalanceProps {
  balance: number;
  currency?: string;
  rank: string;
}

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  rank: string;
  xp: number;
  walletBalance: number;
  avatarUrl?: string;
  activeCoatFrame?: string | null;
  activeNameEffect?: string | null;
  activeWalletSkin?: string | null;
}

export interface ProfileDropdownProps {
  user: SessionUser;
  isOpen: boolean;
  onClose: () => void;
}

export interface BreadcrumbProps {
  className?: string;
}

export interface SettingsSidebarProps {
  currentPath?: string;
}

export interface RouteConfig {
  path: string;
  label: string;
  parent?: string;
}
