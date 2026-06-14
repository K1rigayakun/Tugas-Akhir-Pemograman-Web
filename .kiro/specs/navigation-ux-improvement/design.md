# Design Document: Navigation & UX Improvement

## Overview

This design implements a comprehensive navigation and user experience improvement for the Emerald Kingdom web application. The solution reorganizes the SiteHeader with an enhanced profile dropdown menu, splits settings into dedicated pages with sidebar navigation, adds breadcrumb navigation throughout the application, and ensures responsive behavior across all devices.

### Key Design Goals

1. **Enhanced User Navigation**: Structured profile dropdown with clear sections for profile info, quick actions, settings, and logout
2. **Organized Settings Management**: Split settings into Account and Display pages with persistent sidebar navigation
3. **Improved Wayfinding**: Breadcrumb navigation on all pages for clear location awareness
4. **Responsive Design**: Adaptive layouts for mobile (<768px) and desktop (≥768px) viewports
5. **Accessibility**: Full keyboard navigation and screen reader support

## Architecture

### Component Hierarchy

```
SiteHeader (Client Component)
├── Brand Logo
├── Main Navigation Links
├── Search Form
├── Wallet Balance Display (new)
│   └── Tooltip (hover state)
└── Profile Section
    ├── Notification Bell
    └── Profile Dropdown Trigger
        └── ProfileDropdown (new component)
            ├── Profile Info Section
            │   ├── Username
            │   ├── Rank Badge
            │   └── XP Display
            ├── Visual Divider
            ├── Quick Actions Section
            │   ├── My Profile Link
            │   ├── Wallet & Top Up Link
            │   ├── My Collection Link
            │   └── My Vault Link
            ├── Visual Divider
            ├── Settings Section
            │   ├── Account Settings Link
            │   ├── Display Settings Link
            │   └── Privacy Link
            ├── Visual Divider
            └── Logout Action

Breadcrumb (new component)
├── Home Link
├── Separator
├── Parent Page Link(s)
├── Separator
└── Current Page (non-interactive)

Settings Layout (new structure)
├── SettingsSidebar (new component)
│   ├── Account Settings Link
│   └── Display Settings Link
└── Settings Content Area
    ├── /settings/account → AccountSettingsPage
    └── /settings/display → DisplaySettingsPage
```

### Data Flow

```
User Interaction → Component Event Handler → State Update → UI Re-render
                                            ↓
                                    Navigation Action (optional)
                                            ↓
                                    Route Change (Next.js)
                                            ↓
                                    Component Remount with New State
```

#### State Management Pattern

The design uses React local state for UI interactions and relies on Next.js routing for page state:

1. **SiteHeader State**: Manages dropdown open/close state locally
2. **Settings State**: Managed by Next.js routing, no additional state needed
3. **Breadcrumb State**: Derived from `usePathname()` hook
4. **Wallet Balance**: Fetched from user session data (server component pattern)

## Component Specifications

### 1. WalletBalance Component

**Purpose**: Display user's wallet balance with hover tooltip

**Props**:
```typescript
interface WalletBalanceProps {
  balance: number;
  currency?: string;
  rank: string;
}
```

**Behavior**:
- Read-only display (no click handler)
- Shows formatted currency value
- Displays tooltip on hover with explanatory text: "Saldo Dompet Anda"
- Applies rank-based styling using `rankColors` mapping

**Styling**:
```typescript
const walletStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.4rem 0.8rem",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${rankColors[user.rank]}`,
    position: "relative",
  },
  amount: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: rankColors[user.rank],
  }
};
```

**Accessibility**:
- `role="status"` for balance container
- `aria-label="Saldo dompet: {formatted_amount}"` for screen readers

### 2. ProfileDropdown Component

**Purpose**: Structured menu for profile, actions, settings, and logout

**Props**:
```typescript
interface ProfileDropdownProps {
  user: SessionUser;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

interface SessionUser {
  id: string;
  username: string;
  rank: string;
  xp: number;
  avatarUrl?: string;
}
```

**Internal Structure**:

1. **Profile Info Section**:
   - Username (with optional name effect styling)
   - Rank badge (with rank color)
   - XP display with progress bar

2. **Quick Actions Section**:
   - My Profile (`/profile`)
   - Wallet & Top Up (`/wallet`) - visually distinct with wallet icon
   - My Collection (`/collection`)
   - My Vault (`/vault`)

3. **Settings Section**:
   - Account Settings (`/settings/account`)
   - Display Settings (`/settings/display`)
   - Privacy (`/settings/privacy`)

4. **Logout Action**:
   - Triggers `logoutAction()` server action
   - Closes dropdown and navigates to `/`

**Visual Dividers**:
```typescript
const Divider = () => (
  <div style={{
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
    margin: "0.5rem 0"
  }} />
);
```

**Responsive Behavior**:
- Desktop (≥768px): Dropdown positioned absolutely below trigger, 280px width
- Mobile (<768px): Full-screen overlay with slide-in animation from right

**Accessibility**:
- `role="menu"` for dropdown container
- `role="menuitem"` for each interactive item
- `aria-expanded={isOpen}` on trigger button
- Escape key closes dropdown
- Tab navigation cycles through menu items
- Focus trap when open (prevents tabbing outside)

### 3. Breadcrumb Component

**Purpose**: Display hierarchical navigation path

**Props**:
```typescript
interface BreadcrumbProps {
  className?: string;
}
```

**Implementation**:
```typescript
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const routeLabels: Record<string, string> = {
  "/": "Beranda",
  "/auction": "Lelang",
  "/leaderboard": "Peringkat",
  "/museum": "Museum",
  "/profile": "Profil",
  "/wallet": "Dompet",
  "/settings": "Pengaturan",
  "/settings/account": "Akun",
  "/settings/display": "Tampilan",
  // ... additional mappings
};
```

**Path Building Logic**:
1. Split pathname by `/`
2. Build cumulative path for each segment
3. Map each segment to Indonesian label
4. Render clickable links for parents, plain text for current page

**Styling**:
- Parent links: Subtle color, hover effect
- Current page: Rank color (from user's rank), non-interactive
- Separator: Chevron icon `›` with opacity 0.4

**Accessibility**:
- `aria-label="breadcrumb"` on nav container
- `aria-current="page"` on current page item

### 4. SettingsSidebar Component

**Purpose**: Persistent navigation between settings pages

**Props**:
```typescript
interface SettingsSidebarProps {
  currentPath: string;
}
```

**Navigation Items**:
```typescript
const settingsNav = [
  { path: "/settings/account", label: "Pengaturan Akun", icon: UserIcon },
  { path: "/settings/display", label: "Pengaturan Tampilan", icon: PaletteIcon },
];
```

**Active State Logic**:
```typescript
const isActive = (itemPath: string) => pathname === itemPath;
```

**Responsive Behavior**:
- Desktop (≥768px): Fixed sidebar, 280px width
- Mobile (<768px): Collapsible dropdown or tab navigation at top

**Styling**:
- Active item: Rank-colored left border, highlighted background
- Inactive items: Hover effect with subtle background change

### 5. Settings Page Structure

**File Structure**:
```
/app/settings/
├── layout.tsx (shared layout with sidebar)
├── account/
│   └── page.tsx (AccountSettingsPage)
└── display/
    └── page.tsx (DisplaySettingsPage)
```

**Shared Layout** (`/app/settings/layout.tsx`):
```typescript
export default function SettingsLayout({ children }: { children: React.Node }) {
  return (
    <div className="settings-container">
      <Breadcrumb />
      <div className="settings-grid">
        <SettingsSidebar />
        <main className="settings-content">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**AccountSettingsPage** (`/app/settings/account/page.tsx`):
- Username changer (existing component)
- Email display (read-only)
- Biography editor
- Avatar upload
- Security settings (2FA, password change)
- Privacy settings (vault visibility)

**DisplaySettingsPage** (`/app/settings/display/page.tsx`):
- Theme selection
- Language preference
- Notification preferences
- UI density controls
- Animation toggles

## Responsive Design Strategy

### Breakpoint System

```typescript
const breakpoints = {
  mobile: "max-width: 767px",
  desktop: "min-width: 768px",
};
```

### Mobile Adaptations (<768px)

1. **SiteHeader**:
   - Hamburger menu for main navigation links
   - Compact wallet balance (icon + amount, no label)
   - Profile trigger remains visible

2. **ProfileDropdown**:
   - Full-screen overlay (100vw × 100vh)
   - Slide-in animation from right
   - Close button in top-right corner
   - Larger touch targets (min 44px height)

3. **SettingsSidebar**:
   - Transforms to horizontal tab navigation at top
   - Sticky positioning below header
   - Swipeable tabs for touch navigation

4. **Breadcrumb**:
   - Truncate middle segments if path is long (show first, ..., last)
   - Smaller font size (0.75rem)

### Desktop Enhancements (≥768px)

1. **SiteHeader**:
   - Full navigation link display
   - Wallet balance with label: "Saldo: {amount}"
   - Profile dropdown positioned absolutely (280px width)

2. **ProfileDropdown**:
   - Dropdown card with backdrop blur
   - Smooth fade-in animation
   - Box shadow for depth

3. **SettingsSidebar**:
   - Fixed position sidebar (280px width)
   - Sticky scrolling behavior
   - Icons + labels for navigation items

## Styling System

### Color Palette (Rank-Based)

```typescript
const rankColors: Record<string, string> = {
  CIVIS: "#9ca3af",     // Gray
  KNIGHT: "#22c55e",    // Green
  BARON: "#3b82f6",     // Blue
  EARL: "#8b5cf6",      // Purple
  MARQUIS: "#f59e0b",   // Amber
  DUKE: "#ef4444",      // Red
  EMPEROR: "#ffd700",   // Gold
};
```

### Shared Styles

```typescript
const sharedStyles = {
  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.5) 100%)",
    borderRadius: "15px",
    border: "1px solid rgba(255,255,255,0.05)",
    padding: "1.5rem",
  },
  linkHover: {
    background: "rgba(255,255,255,0.05)",
    transition: "all 0.2s",
  },
  focusRing: {
    outline: "2px solid var(--color-emerald)",
    outlineOffset: "2px",
  },
};
```

### Animation Constants

```typescript
const animations = {
  dropdownFadeIn: "0.2s ease-out",
  mobileSlideIn: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  hoverTransition: "0.15s ease",
};
```

## Data Models

### User Session Extension

```typescript
interface SessionUser {
  id: string;
  username: string;
  email: string;
  rank: string;
  xp: number;
  walletBalance: number;        // NEW: for wallet display
  avatarUrl?: string;
  activeCoatFrame?: string | null;
  activeNameEffect?: string | null;
  activeWalletSkin?: string | null;
}
```

### Breadcrumb Route Config

```typescript
interface RouteConfig {
  path: string;
  label: string;
  parent?: string;
}

const routes: RouteConfig[] = [
  { path: "/", label: "Beranda" },
  { path: "/auction", label: "Lelang" },
  { path: "/profile", label: "Profil" },
  { path: "/wallet", label: "Dompet" },
  { path: "/settings", label: "Pengaturan" },
  { path: "/settings/account", label: "Akun", parent: "/settings" },
  { path: "/settings/display", label: "Tampilan", parent: "/settings" },
  // ... additional routes
];
```

## Error Handling

### Graceful Degradation

1. **Wallet Balance Fetch Failure**:
   - Display "—" placeholder
   - Show tooltip: "Tidak dapat memuat saldo"
   - Log error to monitoring

2. **User Data Missing**:
   - Fall back to email username
   - Display default rank (CIVIS)
   - Show XP as 0

3. **Navigation State Errors**:
   - Breadcrumb falls back to current page only
   - Sidebar highlights nothing if path doesn't match

4. **Mobile Detection Failure**:
   - Default to desktop layout (safer fallback)

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**:
   - ProfileDropdown lazy-loaded (only when opened)
   - Settings pages route-based code splitting (built-in Next.js)

2. **State Management**:
   - Local state for UI (dropdown open/close)
   - No global state needed (reduces complexity)

3. **Memoization**:
   - Breadcrumb route calculations memoized
   - Rank color lookups cached

4. **Bundle Size**:
   - Use existing icons where possible
   - Inline small SVGs (<1KB)
   - Lazy load larger components

## Accessibility Implementation

### ARIA Attributes

```typescript
// SiteHeader profile trigger
<button
  aria-haspopup="menu"
  aria-expanded={isDropdownOpen}
  aria-label="Buka menu profil"
>

// ProfileDropdown container
<div
  role="menu"
  aria-label="Menu profil"
  aria-orientation="vertical"
>

// Each menu item
<Link
  role="menuitem"
  tabIndex={0}
>

// Breadcrumb navigation
<nav aria-label="breadcrumb">
  <ol>
    <li><Link>...</Link></li>
    <li aria-current="page">Current Page</li>
  </ol>
</nav>

// Settings sidebar
<nav aria-label="Navigasi pengaturan">
  <Link
    aria-current={isActive ? "page" : undefined}
  >
</nav>
```

### Keyboard Navigation

1. **Tab Order**:
   - Skip to main content link (first)
   - Main nav links
   - Search input
   - Wallet balance (focusable for screen readers, but not clickable)
   - Profile trigger
   - When dropdown open: focus trapped in dropdown

2. **Keyboard Shortcuts**:
   - `Enter` / `Space`: Open/close dropdown, activate links
   - `Escape`: Close dropdown
   - `Tab`: Move forward through items
   - `Shift+Tab`: Move backward
   - Arrow keys: Navigate dropdown menu items (optional enhancement)

3. **Focus Management**:
   - Focus trapped in dropdown when open
   - Focus returns to trigger when closed
   - Focus visible indicator (outline) on all interactive elements

### Screen Reader Support

- Descriptive labels for all interactive elements
- State announcements (dropdown open/close)
- Current page indication in breadcrumbs and sidebar
- Wallet balance value announced with currency

## Migration Strategy

### Phase 1: Prepare Components
1. Create new components in `/components/navigation/`:
   - `WalletBalance.tsx`
   - `ProfileDropdown.tsx`
   - `Breadcrumb.tsx`
   - `SettingsSidebar.tsx`

### Phase 2: Update SiteHeader
1. Add wallet balance display
2. Refactor dropdown to use new ProfileDropdown component
3. Add responsive styles
4. Test in isolation

### Phase 3: Implement Settings Split
1. Create `/app/settings/layout.tsx`
2. Move existing settings to `/app/settings/account/page.tsx`
3. Create `/app/settings/display/page.tsx`
4. Add SettingsSidebar to layout

### Phase 4: Add Breadcrumbs
1. Add Breadcrumb component to main layout
2. Configure route mappings
3. Test on all pages

### Phase 5: Responsive & Accessibility
1. Add mobile breakpoint styles
2. Implement keyboard navigation
3. Add ARIA attributes
4. Test with screen readers

## Testing Strategy

### Unit Tests
- Wallet balance formatting
- Breadcrumb path building logic
- Active state detection in sidebar
- Dropdown open/close state management

### Component Tests
- ProfileDropdown renders all sections
- Settings sidebar highlights correct item
- Breadcrumb shows correct path
- Mobile/desktop responsive switching

### Integration Tests
- Navigation flow through dropdown
- Settings page navigation
- Breadcrumb navigation
- Logout flow

### Accessibility Tests
- Keyboard navigation through all elements
- Screen reader announcements
- Focus management
- ARIA attribute validation

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Wallet Balance Non-Interactivity

*For any* user with a wallet balance, the wallet balance display element shall have no click handlers and clicking it shall not trigger any navigation or state change.

**Validates: Requirements 1.1, 1.3**

### Property 2: Wallet Balance Rank Styling Consistency

*For any* user rank, the wallet balance display shall use the styling color that corresponds to the user's rank as defined in the rankColors mapping.

**Validates: Requirements 1.4**

### Property 3: Currency Formatting Consistency

*For any* numerical wallet balance value, the displayed format shall include appropriate thousands separators and exactly two decimal places for the currency representation.

**Validates: Requirements 1.5**

### Property 4: Profile Dropdown Closure on Outside Click

*For any* click event that occurs outside the profile dropdown boundaries when the dropdown is open, the dropdown shall transition to closed state.

**Validates: Requirements 2.7**

### Property 5: Profile Dropdown User Information Display

*For any* authenticated user, the profile dropdown shall display the user's username, rank, and XP in the profile information section when opened.

**Validates: Requirements 2.3, 8.1, 8.2, 8.3**

### Property 6: Profile Dropdown Rank-Based Styling

*For any* user rank, the profile information section in the dropdown shall apply styling colors that correspond to the user's rank as defined in the rankColors mapping.

**Validates: Requirements 8.4**

### Property 7: Settings Sidebar Active State Indication

*For any* settings page route (`/settings/account` or `/settings/display`), the corresponding navigation link in the settings sidebar shall display active state styling.

**Validates: Requirements 4.7, 11.1, 11.2**

### Property 8: Breadcrumb Path Hierarchy

*For any* valid page route, the breadcrumb navigation shall display the complete hierarchical path from the home page to the current page with each segment corresponding to a route segment.

**Validates: Requirements 5.2**

### Property 9: Breadcrumb Navigation Functionality

*For any* non-current breadcrumb item, clicking it shall trigger navigation to the corresponding route represented by that breadcrumb segment.

**Validates: Requirements 5.3**

### Property 10: Breadcrumb Current Page Distinction

*For any* page route, the breadcrumb item representing the current page shall have distinct styling (rank-based color, non-interactive) compared to parent breadcrumb items.

**Validates: Requirements 5.4**

### Property 11: Indonesian Language Localization

*For any* breadcrumb navigation item, the displayed text shall be in Indonesian language as defined in the routeLabels mapping, not English.

**Validates: Requirements 5.5**

### Property 12: Dropdown Navigation Auto-Close

*For any* navigation link within the profile dropdown, clicking the link shall close the dropdown after the navigation action is initiated.

**Validates: Requirements 11.3**

### Property 13: Breadcrumb Route Synchronization

*For any* navigation action that changes the current route, the breadcrumb navigation shall update to reflect the new hierarchical path corresponding to the new route.

**Validates: Requirements 11.4**

### Property 14: Navigation State Persistence

*For any* page route that a user navigates to (including back navigation), the navigation components (sidebar, breadcrumbs, active states) shall display the correct state corresponding to that route.

**Validates: Requirements 11.5**

### Property 15: ARIA Label Presence

*For any* navigation component (header, dropdown, breadcrumb, sidebar), appropriate ARIA labels and attributes shall be present for screen reader accessibility.

**Validates: Requirements 12.4**

### Property 16: Keyboard Focus Visual Indication

*For any* focusable navigation element, when that element receives keyboard focus, visual focus indicators (outline or ring) shall be displayed.

**Validates: Requirements 12.6**

## Implementation Examples

### Example 1: WalletBalance Component

```typescript
"use client";

import { useState } from "react";

interface WalletBalanceProps {
  balance: number;
  rank: string;
  currency?: string;
}

const rankColors: Record<string, string> = {
  CIVIS: "#9ca3af",
  KNIGHT: "#22c55e",
  BARON: "#3b82f6",
  EARL: "#8b5cf6",
  MARQUIS: "#f59e0b",
  DUKE: "#ef4444",
  EMPEROR: "#ffd700",
};

export default function WalletBalance({ balance, rank, currency = "IDR" }: WalletBalanceProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div
      role="status"
      aria-label={`Saldo dompet: ${formatCurrency(balance)}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.4rem 0.8rem",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.05)",
        border: `1px solid ${rankColors[rank]}`,
        position: "relative",
        cursor: "default",
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={rankColors[rank]} strokeWidth="2">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </svg>
      <span style={{
        fontSize: "0.9rem",
        fontWeight: 600,
        color: rankColors[rank],
      }}>
        {formatCurrency(balance)}
      </span>
      
      {showTooltip && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "0.5rem 0.75rem",
          background: "rgba(0, 0, 0, 0.9)",
          borderRadius: "6px",
          fontSize: "0.75rem",
          color: "#fff",
          whiteSpace: "nowrap",
          zIndex: 1000,
          pointerEvents: "none",
        }}>
          Saldo Dompet Anda
        </div>
      )}
    </div>
  );
}
```

### Example 2: ProfileDropdown Component

```typescript
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface ProfileDropdownProps {
  user: {
    username: string;
    rank: string;
    xp: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

const rankColors: Record<string, string> = {
  CIVIS: "#9ca3af",
  KNIGHT: "#22c55e",
  BARON: "#3b82f6",
  EARL: "#8b5cf6",
  MARQUIS: "#f59e0b",
  DUKE: "#ef4444",
  EMPEROR: "#ffd700",
};

export default function ProfileDropdown({ user, isOpen, onClose }: ProfileDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
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

  return (
    <div
      ref={dropdownRef}
      role="menu"
      aria-label="Menu profil"
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        width: "280px",
        background: "rgba(10, 15, 20, 0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
        zIndex: 100,
        overflow: "hidden",
      }}
    >
      {/* Profile Info Section */}
      <div style={{
        padding: "1rem",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f5f5f0" }}>
          {user.username}
        </div>
        <div style={{
          fontSize: "0.75rem",
          color: rankColors[user.rank],
          fontWeight: 600,
          textTransform: "uppercase",
          marginTop: "0.25rem",
        }}>
          {user.rank}
        </div>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: "0.25rem" }}>
          XP: {user.xp.toLocaleString()}
        </div>
      </div>

      <Divider />

      {/* Quick Actions Section */}
      <div style={{ padding: "0.5rem 0" }}>
        <MenuItem onClick={() => handleNavigation("/profile")} label="Profil Saya" />
        <MenuItem 
          onClick={() => handleNavigation("/wallet")} 
          label="Wallet & Top Up" 
          highlight 
        />
        <MenuItem onClick={() => handleNavigation("/collection")} label="Koleksi Saya" />
        <MenuItem onClick={() => handleNavigation("/vault")} label="My Vault" />
      </div>

      <Divider />

      {/* Settings Section */}
      <div style={{ padding: "0.5rem 0" }}>
        <MenuItem onClick={() => handleNavigation("/settings/account")} label="Pengaturan Akun" />
        <MenuItem onClick={() => handleNavigation("/settings/display")} label="Pengaturan Tampilan" />
        <MenuItem onClick={() => handleNavigation("/settings/privacy")} label="Privasi" />
      </div>

      <Divider />

      {/* Logout Action */}
      <div style={{ padding: "0.5rem 0" }}>
        <MenuItem 
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            onClose();
            router.push("/");
            router.refresh();
          }} 
          label="Keluar" 
          danger 
        />
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div style={{
      height: "1px",
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
      margin: "0",
    }} />
  );
}

interface MenuItemProps {
  onClick: () => void;
  label: string;
  highlight?: boolean;
  danger?: boolean;
}

function MenuItem({ onClick, label, highlight, danger }: MenuItemProps) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        padding: "0.75rem 1rem",
        background: highlight ? "rgba(16, 185, 129, 0.1)" : "transparent",
        border: "none",
        color: danger ? "#ef4444" : highlight ? "#10b981" : "#f5f5f0",
        textAlign: "left",
        fontSize: "0.85rem",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger 
          ? "rgba(239, 68, 68, 0.1)" 
          : "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = highlight 
          ? "rgba(16, 185, 129, 0.1)" 
          : "transparent";
      }}
    >
      {label}
    </button>
  );
}
```

### Example 3: Breadcrumb Component

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  "": "Beranda",
  "auction": "Lelang",
  "leaderboard": "Peringkat",
  "museum": "Museum",
  "achievements": "Triumphs",
  "events": "Events",
  "shop": "Market",
  "profile": "Profil",
  "wallet": "Dompet",
  "collection": "Koleksi",
  "vault": "Vault",
  "settings": "Pengaturan",
  "account": "Akun",
  "display": "Tampilan",
  "privacy": "Privasi",
  "notifications": "Notifikasi",
  "help": "Bantuan",
};

export default function Breadcrumb() {
  const pathname = usePathname();
  
  const buildBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ path: "/", label: "Beranda" }];
    
    let currentPath = "";
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment;
      breadcrumbs.push({ path: currentPath, label });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <nav aria-label="breadcrumb" style={{ padding: "1rem 0", fontSize: "0.85rem" }}>
      <ol style={{ display: "flex", alignItems: "center", gap: "0.5rem", listStyle: "none", margin: 0, padding: 0 }}>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={crumb.path} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {!isLast ? (
                <Link
                  href={crumb.path}
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#10b981"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current="page"
                  style={{
                    color: "#10b981",
                    fontWeight: 600,
                  }}
                >
                  {crumb.label}
                </span>
              )}
              
              {!isLast && (
                <span style={{ color: "rgba(255,255,255,0.4)", userSelect: "none" }}>›</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

### Example 4: SettingsSidebar Component

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const settingsNav = [
  { path: "/settings/account", label: "Pengaturan Akun" },
  { path: "/settings/display", label: "Pengaturan Tampilan" },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi pengaturan"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.5) 100%)",
        borderRadius: "15px",
        border: "1px solid rgba(255,255,255,0.05)",
        padding: "1.5rem",
        position: "sticky",
        top: "2rem",
      }}
    >
      <h2 style={{
        fontFamily: "var(--font-cinzel, serif)",
        color: "#c9a84c",
        fontSize: "1.2rem",
        marginBottom: "1.5rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid rgba(201,168,76,0.2)",
      }}>
        Pengaturan
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {settingsNav.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={isActive ? "page" : undefined}
              style={{
                padding: "0.8rem 1rem",
                borderRadius: "8px",
                background: isActive ? "rgba(201,168,76,0.1)" : "transparent",
                color: isActive ? "#f7d070" : "rgba(255,255,255,0.6)",
                textDecoration: "none",
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? "3px solid #c9a84c" : "3px solid transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                }
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### Example 5: Settings Layout

```typescript
// app/settings/layout.tsx
import { redirect } from "next/navigation";
import { getSessionUser } from "../actions/session";
import Breadcrumb from "../../components/navigation/Breadcrumb";
import SettingsSidebar from "../../components/navigation/SettingsSidebar";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();
  
  if (!sessionUser) {
    redirect("/auth/login");
  }

  return (
    <div style={{
      minHeight: "100vh",
      padding: "2rem",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <Breadcrumb />
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "2rem",
          alignItems: "start",
          marginTop: "2rem",
        }}
        className="settings-grid"
        >
          <SettingsSidebar />
          <main className="settings-content">
            {children}
          </main>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 767px) {
          .settings-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
```

## Security Considerations

### Authentication & Authorization

1. **Session Validation**: All navigation components must work with authenticated and unauthenticated states
2. **Settings Access**: Settings pages require authentication (redirect to login if no session)
3. **Wallet Data Protection**: Wallet balance fetched server-side, never exposed in client state unnecessarily

### XSS Prevention

1. **User Data Sanitization**: Username and display fields sanitized before rendering
2. **URL Validation**: Breadcrumb paths validated against allowed routes
3. **Link Target Validation**: All navigation links validated to prevent open redirects

## Backwards Compatibility

### Breaking Changes

1. **Settings Route Change**: `/settings` redirects to `/settings/account`
2. **Dropdown Structure**: Existing dropdown links reorganized into sections

### Migration Path

1. Add redirect rule: `/settings` → `/settings/account`
2. Update internal links to use new settings routes
3. Maintain old navigation structure temporarily with deprecation warnings
4. Remove old structure after 2 weeks

## Future Enhancements

### Phase 2 Features

1. **Notification Badge**: Real-time unread count on notification bell
2. **Quick Wallet Actions**: Inline top-up button in dropdown
3. **Search in Dropdown**: Filter quick actions
4. **Customizable Sidebar**: User-defined settings order
5. **Breadcrumb Icons**: Visual icons for each route segment
6. **Theme Switcher**: Quick theme toggle in profile dropdown

### Performance Optimizations

1. **Virtual Scrolling**: For long navigation lists
2. **Route Prefetching**: Prefetch likely next pages
3. **Animation Frame Throttling**: Smooth animations at 60fps
4. **Lazy Image Loading**: Avatar images in dropdown

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Implementation
