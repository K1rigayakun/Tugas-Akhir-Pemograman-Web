# Implementation Plan: Navigation & UX Improvement

## Overview

This implementation plan breaks down the navigation and user experience improvements into discrete coding tasks. The feature adds a wallet balance display, restructures the profile dropdown menu with four distinct sections, splits settings into separate pages with sidebar navigation, and adds breadcrumb navigation throughout the application. All components will be built with TypeScript, Next.js 14, React 18, and Tailwind CSS, following responsive design patterns for mobile and desktop viewports.

## Tasks

- [ ] 1. Set up TypeScript interfaces and utility functions
  - Create `/apps/web/src/types/navigation.ts` with type definitions for all navigation components
  - Define `WalletBalanceProps`, `ProfileDropdownProps`, `SessionUser`, `BreadcrumbProps`, `SettingsSidebarProps` interfaces
  - Create `/apps/web/src/lib/navigation-utils.ts` with currency formatting and rank color mapping utilities
  - Implement `rankColors` constant mapping rank names to color hex values
  - Implement `formatCurrency` function for consistent wallet balance formatting
  - _Requirements: 1.5, 8.4, 1.4_

- [ ] 2. Create WalletBalance component
  - [ ] 2.1 Implement core WalletBalance component
    - Create `/apps/web/src/components/navigation/WalletBalance.tsx` as a client component
    - Implement read-only display with wallet icon and formatted balance
    - Apply rank-based border and text colors using rankColors mapping
    - Add responsive styling: compact for mobile (<768px), full display for desktop (≥768px)
    - Ensure component has no click handlers (read-only requirement)
    - _Requirements: 1.1, 1.3, 1.4, 1.5_
  
  - [ ]* 2.2 Add hover tooltip to WalletBalance
    - Implement tooltip state management with useState hook
    - Display "Saldo Dompet Anda" tooltip on hover
    - Position tooltip below the balance display with proper z-index
    - _Requirements: 1.2_
  
  - [ ]* 2.3 Add accessibility attributes to WalletBalance
    - Add `role="status"` to container
    - Add `aria-label` with formatted balance text
    - Ensure tooltip is accessible to screen readers
    - _Requirements: 12.4_
  
  - [ ]* 2.4 Write property test for WalletBalance non-interactivity
    - **Property 1: Wallet Balance Non-Interactivity**
    - **Validates: Requirements 1.1, 1.3**
    - Test that WalletBalance has no onClick handler
    - Verify clicking the component does not trigger navigation or state changes

- [ ] 3. Create ProfileDropdown component
  - [ ] 3.1 Implement ProfileDropdown structure and sections
    - Create `/apps/web/src/components/navigation/ProfileDropdown.tsx` as a client component
    - Implement four-section structure: Profile Info, Quick Actions, Settings, Logout
    - Add visual dividers between sections using gradient backgrounds
    - Implement dropdown positioning (absolute on desktop, full-screen overlay on mobile)
    - Add responsive styling for desktop (≥768px) and mobile (<768px) viewports
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 6.2, 7.2_
  
  - [ ] 3.2 Implement Profile Info section
    - Display user username, rank, and XP in the top section
    - Apply rank-based styling to rank badge using rankColors
    - Format XP with thousands separators using toLocaleString()
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ] 3.3 Implement Quick Actions section with navigation links
    - Add navigation links for "Profil Saya" (/profile), "Wallet & Top Up" (/wallet), "Koleksi Saya" (/collection), "My Vault" (/vault)
    - Make "Wallet & Top Up" visually distinct with wallet icon and highlight background
    - Implement click handlers that close dropdown and navigate using Next.js router
    - _Requirements: 2.4, 3.1, 3.2, 3.3_
  
  - [ ] 3.4 Implement Settings section with navigation links
    - Add navigation links for "Pengaturan Akun" (/settings/account), "Pengaturan Tampilan" (/settings/display), "Privasi" (/settings/privacy)
    - Implement click handlers that close dropdown and navigate
    - _Requirements: 2.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [ ] 3.5 Implement Logout action
    - Create logout button at bottom of dropdown
    - Implement click handler that calls logout API endpoint, closes dropdown, and navigates to home
    - Apply danger styling (red color) to visually distinguish logout action
    - Separate logout from settings section with visual divider
    - _Requirements: 2.6, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ] 3.6 Add click-outside and escape key handlers
    - Implement useRef hook to track dropdown container
    - Add mousedown event listener to detect clicks outside dropdown
    - Add keydown event listener to detect Escape key press
    - Close dropdown when click-outside or Escape occurs
    - _Requirements: 2.7, 12.3_
  
  - [ ]* 3.7 Add ARIA attributes and keyboard navigation
    - Add `role="menu"` to dropdown container and `role="menuitem"` to each link
    - Add `aria-label="Menu profil"` to dropdown
    - Implement tab navigation through menu items
    - Add visual focus indicators for keyboard navigation
    - _Requirements: 12.1, 12.2, 12.4, 12.5, 12.6_
  
  - [ ]* 3.8 Write property test for dropdown closure behavior
    - **Property 4: Profile Dropdown Closure on Outside Click**
    - **Validates: Requirements 2.7**
    - Test that clicking outside dropdown boundaries closes the dropdown
    - Verify Escape key also closes the dropdown

- [ ] 4. Update SiteHeader component
  - [ ] 4.1 Integrate WalletBalance into SiteHeader
    - Add WalletBalance component to SiteHeader before profile section
    - Fetch wallet balance from user session data
    - Pass balance, currency, and rank props to WalletBalance
    - Adjust spacing and layout to accommodate new component
    - _Requirements: 1.1, 6.1, 7.1_
  
  - [ ] 4.2 Replace existing profile dropdown with new ProfileDropdown component
    - Import and integrate ProfileDropdown component
    - Implement dropdown open/close state management with useState
    - Pass user data (username, rank, XP), isOpen state, and onClose handler
    - Add profile trigger button with proper ARIA attributes (aria-haspopup, aria-expanded)
    - _Requirements: 2.1, 2.7, 7.2, 12.2_
  
  - [ ] 4.3 Add mobile responsive adaptations to SiteHeader
    - Implement hamburger menu for main navigation on mobile (<768px)
    - Create compact wallet display for mobile (icon + amount only)
    - Ensure profile dropdown uses full-screen overlay on mobile
    - Test touch interaction responsiveness
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [ ]* 4.4 Write property test for wallet balance rank styling
    - **Property 2: Wallet Balance Rank Styling Consistency**
    - **Validates: Requirements 1.4**
    - Test that wallet balance uses correct color for each rank in rankColors mapping
    - Verify styling consistency across all rank values

- [ ] 5. Create Breadcrumb component
  - [ ] 5.1 Implement Breadcrumb path building logic
    - Create `/apps/web/src/components/navigation/Breadcrumb.tsx` as a client component
    - Use `usePathname()` hook to get current route
    - Create `routeLabels` constant mapping route segments to Indonesian labels
    - Implement path splitting logic to build breadcrumb hierarchy
    - Build cumulative paths for each segment (e.g., "/" → "/settings" → "/settings/account")
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [ ] 5.2 Implement Breadcrumb rendering with navigation links
    - Render clickable Link components for parent breadcrumb items
    - Render non-interactive span for current page item
    - Add chevron separators between breadcrumb items
    - Apply rank-based color to current page item
    - Apply hover effects to parent items
    - _Requirements: 5.3, 5.4, 5.6_
  
  - [ ] 5.3 Add responsive breadcrumb styling
    - Implement path truncation for mobile (<768px): show first, ..., last
    - Use smaller font size on mobile (0.75rem)
    - Ensure breadcrumbs are readable on all screen sizes
    - _Requirements: 6.1_
  
  - [ ]* 5.4 Add ARIA attributes to Breadcrumb
    - Add `aria-label="breadcrumb"` to nav container
    - Add `aria-current="page"` to current page item
    - Structure breadcrumbs as ordered list (ol > li)
    - _Requirements: 12.4_
  
  - [ ]* 5.5 Write property test for breadcrumb hierarchy
    - **Property 8: Breadcrumb Path Hierarchy**
    - **Validates: Requirements 5.2**
    - Test that breadcrumbs display complete path from home to current page
    - Verify each segment corresponds to a route segment in the pathname
  
  - [ ]* 5.6 Write property test for breadcrumb navigation
    - **Property 9: Breadcrumb Navigation Functionality**
    - **Validates: Requirements 5.3**
    - Test that clicking non-current breadcrumb triggers navigation to that route
    - Verify current page breadcrumb is not clickable

- [ ] 6. Create SettingsSidebar component
  - [ ] 6.1 Implement SettingsSidebar navigation structure
    - Create `/apps/web/src/components/navigation/SettingsSidebar.tsx` as a client component
    - Use `usePathname()` hook to determine current route
    - Create navigation items array with path, label, and icon for each settings page
    - Implement active state detection logic (compare current path with item path)
    - _Requirements: 4.5, 4.7, 11.1, 11.2_
  
  - [ ] 6.2 Implement SettingsSidebar rendering and styling
    - Render navigation links with active state highlighting
    - Apply rank-colored left border and background to active item
    - Add hover effects to inactive items
    - Include icons next to labels for better visual recognition
    - _Requirements: 4.8_
  
  - [ ] 6.3 Add responsive behavior to SettingsSidebar
    - Desktop (≥768px): Fixed sidebar with 280px width
    - Mobile (<768px): Horizontal tab navigation or collapsible dropdown
    - Implement sticky positioning for mobile tabs
    - _Requirements: 6.3, 7.3_
  
  - [ ]* 6.4 Add ARIA attributes to SettingsSidebar
    - Add `aria-label="Navigasi pengaturan"` to nav container
    - Add `aria-current="page"` to active navigation item
    - Ensure keyboard focus indicators are visible
    - _Requirements: 12.4, 12.6_
  
  - [ ]* 6.5 Write property test for sidebar active state
    - **Property 7: Settings Sidebar Active State Indication**
    - **Validates: Requirements 4.7, 11.1, 11.2**
    - Test that sidebar highlights correct item based on current pathname
    - Verify active styling is applied only to the matching route

- [ ] 7. Create settings page structure
  - [ ] 7.1 Create shared settings layout with sidebar
    - Create `/apps/web/app/settings/layout.tsx` as a server component
    - Import and render Breadcrumb component at top
    - Create two-column grid layout: SettingsSidebar on left, content area on right
    - Implement responsive layout: stacked on mobile, side-by-side on desktop
    - _Requirements: 4.3, 4.8, 5.1_
  
  - [ ] 7.2 Create Account Settings page
    - Create `/apps/web/app/settings/account/page.tsx` as a server component
    - Move existing settings content (username changer, biography editor) to this page
    - Add page title "Pengaturan Akun"
    - Add security settings section (password change, 2FA toggle)
    - Add privacy settings section (vault visibility toggle)
    - _Requirements: 4.1, 4.4, 4.6_
  
  - [ ] 7.3 Create Display Settings page
    - Create `/apps/web/app/settings/display/page.tsx` as a server component
    - Add page title "Pengaturan Tampilan"
    - Implement theme selection dropdown (light/dark/auto)
    - Implement language preference dropdown
    - Add notification preferences section
    - Add UI density controls (compact/comfortable/spacious)
    - Add animation toggle switches
    - _Requirements: 4.2, 4.4, 4.6_
  
  - [ ]* 7.4 Write property test for navigation auto-close
    - **Property 12: Dropdown Navigation Auto-Close**
    - **Validates: Requirements 11.3**
    - Test that clicking navigation link in dropdown closes the dropdown
    - Verify dropdown closes before navigation occurs

- [ ] 8. Integrate Breadcrumb into main layout
  - [ ] 8.1 Add Breadcrumb to root layout or page templates
    - Import Breadcrumb component into main layout file
    - Position breadcrumb below SiteHeader and above page content
    - Add appropriate spacing and padding
    - _Requirements: 5.1_
  
  - [ ] 8.2 Configure route label mappings for all pages
    - Extend routeLabels constant with all application routes
    - Map all routes to Indonesian labels: auction → "Lelang", leaderboard → "Peringkat", etc.
    - Handle dynamic routes with proper label fallbacks
    - _Requirements: 5.5_
  
  - [ ]* 8.3 Write property test for Indonesian language localization
    - **Property 11: Indonesian Language Localization**
    - **Validates: Requirements 5.5**
    - Test that all breadcrumb labels are in Indonesian
    - Verify no English labels appear in breadcrumb navigation
  
  - [ ]* 8.4 Write property test for breadcrumb synchronization
    - **Property 13: Breadcrumb Route Synchronization**
    - **Validates: Requirements 11.4**
    - Test that breadcrumb updates after navigation action
    - Verify breadcrumb path matches current route after navigation

- [ ] 9. Implement state persistence and navigation behavior
  - [ ] 9.1 Ensure settings sidebar state persists across navigation
    - Verify usePathname() correctly updates on route changes
    - Test that active state updates when navigating between settings pages
    - Ensure no flickering or incorrect active states during transitions
    - _Requirements: 11.1, 11.2, 11.5_
  
  - [ ] 9.2 Implement dropdown auto-close on navigation
    - Ensure ProfileDropdown closes after any navigation link is clicked
    - Verify dropdown state resets when user navigates and returns
    - Test that back/forward browser navigation maintains correct state
    - _Requirements: 11.3, 11.5_
  
  - [ ]* 9.3 Write property test for navigation state persistence
    - **Property 14: Navigation State Persistence**
    - **Validates: Requirements 11.5**
    - Test that navigation components display correct state after navigation
    - Verify state is correct after back/forward browser navigation

- [ ] 10. Add error handling and graceful degradation
  - [ ] 10.1 Implement wallet balance fetch error handling
    - Display "—" placeholder if wallet balance fails to load
    - Show tooltip "Tidak dapat memuat saldo" on error state
    - Log errors to monitoring system
    - _Requirements: 1.1_
  
  - [ ] 10.2 Implement user data fallback logic
    - Fall back to email as username if username is missing
    - Display default rank (CIVIS) if rank data is unavailable
    - Show XP as 0 if XP data is missing
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 10.3 Implement breadcrumb error handling
    - Fall back to current page only if path parsing fails
    - Handle unknown routes with segment name as label
    - _Requirements: 5.2_
  
  - [ ] 10.4 Implement sidebar path matching fallback
    - Highlight nothing if current path doesn't match any sidebar item
    - Handle edge cases where pathname is malformed
    - _Requirements: 4.7_

- [ ] 11. Checkpoint - Ensure all components work together
  - Verify SiteHeader displays wallet balance and new dropdown correctly
  - Test navigation flow from dropdown to settings pages
  - Verify breadcrumbs appear on all pages with correct paths
  - Test settings sidebar navigation and active state
  - Check responsive behavior on mobile (<768px) and desktop (≥768px)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement comprehensive keyboard navigation
  - [ ] 12.1 Add Tab navigation through all interactive elements
    - Ensure tab order flows logically: header links → search → wallet → profile → dropdown items
    - Implement focus trap in ProfileDropdown when open
    - Return focus to trigger button when dropdown closes
    - _Requirements: 12.1, 12.2_
  
  - [ ] 12.2 Add keyboard shortcuts for dropdown control
    - Enter/Space on profile trigger opens dropdown
    - Escape key closes dropdown
    - Arrow keys navigate through dropdown items (optional enhancement)
    - _Requirements: 12.2, 12.3_
  
  - [ ] 12.3 Add visible focus indicators to all navigation elements
    - Apply outline ring to focused elements (2px solid emerald color)
    - Ensure focus indicators have sufficient color contrast
    - Test focus visibility on all background colors
    - _Requirements: 12.6_
  
  - [ ]* 12.4 Write property test for ARIA label presence
    - **Property 15: ARIA Label Presence**
    - **Validates: Requirements 12.4**
    - Test that all navigation components have appropriate ARIA labels
    - Verify header, dropdown, breadcrumb, and sidebar have correct attributes
  
  - [ ]* 12.5 Write property test for focus indicators
    - **Property 16: Keyboard Focus Visual Indication**
    - **Validates: Requirements 12.6**
    - Test that focused elements display visible outline or ring
    - Verify focus indicators appear on keyboard navigation

- [ ] 13. Final integration testing and polish
  - [ ] 13.1 Test complete user flows
    - Test flow: Login → View wallet balance → Open dropdown → Navigate to settings → Change settings → Logout
    - Test flow: Browse pages → Use breadcrumbs to navigate back → Navigate to different section
    - Test mobile responsiveness at various breakpoints
    - _Requirements: All_
  
  - [ ] 13.2 Verify responsive design implementation
    - Test mobile layout (<768px): hamburger menu, compact wallet, full-screen dropdown, horizontal tabs
    - Test desktop layout (≥768px): full nav, wallet with label, positioned dropdown, fixed sidebar
    - Test transitions between breakpoints
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 13.3 Verify accessibility compliance
    - Test with screen reader (NVDA or JAWS)
    - Test complete keyboard navigation flow
    - Verify all interactive elements are reachable via keyboard
    - Check color contrast ratios meet WCAG AA standards
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  
  - [ ]* 13.4 Write property test for currency formatting
    - **Property 3: Currency Formatting Consistency**
    - **Validates: Requirements 1.5**
    - Test that all wallet balance values display with thousands separators
    - Verify exactly two decimal places in currency representation
  
  - [ ]* 13.5 Write property test for profile info display
    - **Property 5: Profile Dropdown User Information Display**
    - **Validates: Requirements 2.3, 8.1, 8.2, 8.3**
    - Test that dropdown displays username, rank, and XP for any authenticated user
    - Verify all three fields are present in profile info section
  
  - [ ]* 13.6 Write property test for rank-based styling
    - **Property 6: Profile Dropdown Rank-Based Styling**
    - **Validates: Requirements 8.4**
    - Test that profile info section applies correct color for user's rank
    - Verify styling matches rankColors mapping for all ranks
  
  - [ ]* 13.7 Write property test for current page distinction
    - **Property 10: Breadcrumb Current Page Distinction**
    - **Validates: Requirements 5.4**
    - Test that current page breadcrumb has rank-based color and is non-interactive
    - Verify parent items have different styling and are interactive

- [ ] 14. Final checkpoint - Verify production readiness
  - Run full test suite including property tests and unit tests
  - Verify all acceptance criteria from requirements are met
  - Check that no console errors or warnings appear
  - Verify proper error handling and graceful degradation
  - Ensure performance is acceptable (no layout shifts, smooth animations)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All components use TypeScript for type safety and better developer experience
- Components follow Next.js 14 patterns: "use client" for interactive components, server components for layouts
- Responsive design uses 768px breakpoint: mobile (<768px) and desktop (≥768px)
- Rank-based styling uses centralized rankColors mapping for consistency
- All navigation links use Next.js Link component for optimized client-side navigation
- Property tests validate correctness properties defined in design document
- Unit tests validate specific examples and edge cases
- Each implementation task references specific requirements for traceability
- Accessibility is prioritized with ARIA attributes and keyboard navigation support

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "5.1", "6.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "3.3", "3.4", "3.5", "5.2", "6.2"] },
    { "id": 3, "tasks": ["2.4", "3.6", "3.7", "3.8", "4.1", "5.3", "5.4", "6.3", "6.4", "7.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "5.5", "5.6", "6.5", "7.2", "7.3"] },
    { "id": 5, "tasks": ["7.4", "8.1", "8.2", "10.1", "10.2", "10.3", "10.4"] },
    { "id": 6, "tasks": ["8.3", "8.4", "9.1", "9.2", "12.1", "12.2", "12.3"] },
    { "id": 7, "tasks": ["9.3", "12.4", "12.5", "13.1", "13.2", "13.3"] },
    { "id": 8, "tasks": ["13.4", "13.5", "13.6", "13.7"] }
  ]
}
```
