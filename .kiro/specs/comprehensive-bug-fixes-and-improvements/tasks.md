# Implementation Plan: Comprehensive Bug Fixes and Improvements

## Overview

This implementation plan addresses five critical bugs in the Emerald Kingdom auction platform's authentication, data layer, and payment systems. The fixes target admin panel authentication and data synchronization, database connection pool exhaustion, wallet currency display inaccuracies, incomplete payment flows with multiple methods, and user logout functionality. Each task builds incrementally to restore core platform functionality while maintaining the existing Next.js + NestJS monorepo architecture.

## Tasks

- [ ] 1. Fix Admin Panel Authentication and API Integration
  - [x] 1.1 Create Admin Authentication Service and API Client
    - Create `apps/admin/src/lib/auth.ts` with AdminAuthService implementing login, logout, token storage, and authentication state management
    - Create `apps/admin/src/lib/api.ts` with `fetchWithAuth()` helper that attaches Bearer token to all requests and handles 401 responses with automatic redirect to login
    - Implement secure token storage using HTTP-only cookies or secure localStorage with token retrieval methods
    - _Requirements: 1.1, 1.3, 1.4, 1.6_
  
  - [x] 1.2 Implement Admin Authentication Guard in API
    - Create `apps/api/src/auth/guards/admin-auth.guard.ts` implementing NestJS CanActivate interface
    - Verify JWT token from Authorization header and check user has valid adminRole field (SUPER_ADMIN, AUCTION_MANAGER, KYC_OFFICER, CONTENT_MANAGER, SUPPORT_OFFICER)
    - Throw UnauthorizedException if token invalid or user lacks admin role
    - _Requirements: 1.5_
  
  - [~] 1.3 Fix Admin Auctions Management Page
    - Update `apps/admin/src/app/auctions/page.tsx` to fetch auction data using `fetchWithAuth('/api/v1/admin/auctions')`
    - Render auction table displaying all fields: title, description, status, currentPrice, startTime, endTime
    - Add console logging for API responses to debug empty data issues
    - Handle 401 responses with redirect to login page
    - _Requirements: 1.2, 1.3, 1.7, 1.8_

- [ ] 2. Fix Database Connection Pool Management
  - [x] 2.1 Configure Prisma Client with Connection Pool Limits
    - Update `packages/db/src/client.ts` to configure Prisma Client with connection pool size of 3
    - Verify DATABASE_URL includes `?pgbouncer=true&connection_limit=3` parameters
    - Set connection timeout to 10 seconds in Prisma Client configuration
    - Implement connection pool metrics logging every 60 seconds showing active, idle connections, and queue depth
    - _Requirements: 2.1, 2.3, 2.4, 2.10_
  
  - [-] 2.2 Create Transaction Batching Service
    - Create `apps/api/src/common/services/transaction-batching.service.ts` as Injectable NestJS service
    - Implement `executeInTransaction()` method accepting operation callback and timeout parameter (default 10s)
    - Ensure connections are released within 1 second after transaction completion
    - Add timeout handling that rejects transactions exceeding time limit
    - _Requirements: 2.2, 2.6, 2.7, 2.9_
  
  - [~] 2.3 Implement Connection Retry Logic
    - Create `apps/api/src/common/interceptors/connection-retry.interceptor.ts`
    - Implement `retryWithBackoff()` function with exponential backoff starting at 100ms
    - Retry failed connection attempts up to 3 times before throwing error
    - Log retry attempts and final failures to application logs
    - _Requirements: 2.8_
  
  - [x] 2.4 Add connection pool monitoring tests
    - Write unit tests verifying connection pool size is limited to 3
    - Test connection timeout behavior after 10 seconds idle time
    - Test exponential backoff retry logic with mock connection failures
    - _Requirements: 2.1, 2.4, 2.8_
    - **Status**: ✅ COMPLETE - 18 tests implemented (11 unit + 7 E2E). See `TASK_2.4_COMPLETE.md` and `AUTOMATED_TESTING_GUIDE.md`

- [ ] 3. Fix Wallet Currency Display and Balance Accuracy
  - [x] 3.1 Create Wallet Balance API Endpoint
    - Update or create `apps/api/src/wallet/wallet.controller.ts` with GET `/balance` endpoint
    - Fetch WalletAccount.balance field for authenticated user using Prisma select query
    - Return JSON response with balance field, handling null wallets by returning 0
    - Ensure response time < 200ms by using indexed queries
    - _Requirements: 3.2, 3.7_
  
  - [x] 3.2 Implement Wallet Balance Display Component
    - Create or update `apps/web/src/components/wallet/WalletBalance.tsx` React component
    - Fetch balance from `/api/v1/wallet/balance` on mount and when wallet updates
    - Format balance using `toLocaleString('en-US')` with "CC" suffix (e.g., "1,500 CC")
    - Handle zero balance by displaying "0 CC"
    - Implement localStorage caching with fallback display on API failure showing warning indicator
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6_
    - **Status**: ✅ COMPLETE - Component fully implemented and verified
    - **Implementation**: See `TASK_3.2_IMPLEMENTATION.md` for details
  
  - [~] 3.3 Fix Wallet Transaction Service for Atomic Balance Updates
    - Update `apps/api/src/wallet/wallet.service.ts` with `createTransaction()` method
    - Wrap transaction creation and balance update in Prisma $transaction
    - Create WalletTransaction record with type, amount, description, referenceId, and idempotencyKey
    - Atomically update WalletAccount.balance using increment/decrement based on transaction type
    - Implement `calculateBalanceChange()` helper handling all WalletTxType enum values (TOP_UP: +, BID_HOLD: -, BID_RELEASE: +, etc.)
    - _Requirements: 3.8_
  
  - [x] 3.4 Add balance update notification system
    - Implement WebSocket or polling mechanism for real-time balance updates
    - Update displayed balance within 2 seconds when wallet changes occur
    - Test balance update propagation after top-up approval
    - _Requirements: 3.3_
    - **Status**: ✅ COMPLETE - Dual-mechanism notification system fully implemented
    - **Implementation**: See `TASK_3.4_IMPLEMENTATION.md` for details

- [ ] 4. Complete Payment Flow and Top-Up System
  - [x] 4.1 Create Top-Up Request Page with Payment Methods
    - Create or update `apps/web/src/app/topup/page.tsx` with amount selection UI (50, 100, 500, 1000 CC or custom)
    - Display payment method buttons: QRIS, Virtual Account, E-Wallet, Stripe Card, Bank Transfer, Testing Payment
    - Implement form submission to POST `/api/v1/payment/create` with amount, fiatAmount, method, and provider
    - Handle response containing requestId and paymentDetails, routing to appropriate payment UI
    - _Requirements: 4.1_
  
  - [x] 4.2 Implement QRIS Payment Component
    - Create `apps/web/src/components/payment/QRISPayment.tsx` displaying QR code image from paymentDetails.qrCodeUrl
    - Add zoom functionality for QR code image
    - Add download button for QR code
    - Implement 15-minute countdown timer using useEffect and setInterval
    - Poll payment status every 5 seconds using exponential backoff
    - _Requirements: 4.2_
  
  - [x] 4.3 Implement Virtual Account Payment Component
    - Create `apps/web/src/components/payment/VirtualAccountPayment.tsx` displaying 16-digit VA number
    - Add copy-to-clipboard button using navigator.clipboard API
    - Display bank-specific payment instructions based on provider (BCA/BNI/Mandiri/BRI/Permata)
    - Show countdown timer for payment expiration
    - _Requirements: 4.3_
  
  - [x] 4.4 Create Payment Creation API Endpoint
    - Create or update `apps/api/src/payment/payment.controller.ts` with POST `/create` endpoint
    - Validate amount and fiatAmount are positive integers > 0
    - Create TopUpRequest record with status PENDING, expiresAt timestamp 15 minutes in future
    - Implement `generatePaymentDetails()` method handling QRIS (QR code generation), VA (unique 16-digit number), and TESTING (approval message)
    - Ensure VA number uniqueness by checking existing paymentDetails JSON field in TopUpRequest table
    - Return requestId and method-specific paymentDetails
    - _Requirements: 4.4, 4.5, 4.11, 4.12_
  
  - [~] 4.5 Create Admin Pending Top-Ups Page
    - Create `apps/admin/src/app/topups/pending/page.tsx` displaying table of pending TopUpRequest records
    - Fetch data from GET `/api/v1/admin/topups/pending` using fetchWithAuth
    - Display columns: user email, amount (CC), fiatAmount (IDR), method, createdAt timestamp
    - Add Approve and Reject buttons for each request calling respective API endpoints
    - Refresh table data after approval/rejection actions
    - _Requirements: 4.6_
  
  - [x] 4.6 Implement Admin Top-Up Approval API Endpoints
    - Verified existing implementation in `apps/api/src/modules/payment/payment.controller.ts` and `payment.service.ts`
    - ✅ GET `/payment/admin/list?status=PENDING` endpoint fetches TopUpRequest records where status=PENDING ordered by createdAt desc
    - ✅ Added auto-expiry logic to `getAdminPaymentList()` and `getPendingTopups()` checking expiresAt < now and updating status to EXPIRED
    - ✅ POST `/payment/admin/:id/approve` endpoint wraps approval in Prisma $transaction:
      - Updates TopUpRequest status to APPROVED, sets reviewedBy and reviewedAt
      - Creates WalletTransaction with type TOP_UP and idempotency key `topup-approve-{requestId}`
      - Increments WalletAccount.balance and totalTopUp by request.amount atomically
    - ✅ POST `/payment/admin/:id/reject` endpoint updates status to REJECTED with reviewedBy and adminNotes
    - _Requirements: 4.7, 4.8, 4.9_
    - **Status**: ✅ COMPLETE - All requirements satisfied. See `TASK_4.6_VERIFICATION.md`, `TASK_4.6_IMPLEMENTATION.md`, and `TASK_4.6_TESTS.md` for details
  
  - [x] 4.7 Add payment expiration handling
    - Test automatic expiration of TopUpRequest records past expiresAt timestamp
    - Verify frontend detects EXPIRED status and displays appropriate message
    - Test new top-up request creation after expiration
    - _Requirements: 4.9_
    - **Status**: ✅ COMPLETE - See `TASK_4.7_VERIFICATION.md`
  
  - [x] 4.8 Add payment status polling and notification
    - Implement polling mechanism with exponential backoff (1s → 2s → 5s → 10s)
    - Update wallet balance display within 2 seconds of approval using WebSocket or polling
    - Test end-to-end flow: request creation → admin approval → balance update
    - _Requirements: 4.10_
    - **Status**: ✅ COMPLETE - See `TASK_4.7_VERIFICATION.md` (combined with 4.7)

- [ ] 5. Fix User Logout Functionality
  - [x] 5.1 Create Logout Button Component
    - Create or update `apps/web/src/components/auth/LogoutButton.tsx` handling logout button click
    - Call POST `/api/v1/auth/logout` with Authorization Bearer token
    - Implement `clearAllTokens()` clearing accessToken and refreshToken from cookies and localStorage
    - Implement `clearCachedUserData()` removing cachedBalance, userProfile, userPreferences from storage
    - Handle API failures gracefully by still clearing local tokens and redirecting
    - Redirect to homepage `/` using Next.js router within 100ms after token clearing
    - _Requirements: 5.1, 5.4, 5.5, 5.7_
  
  - [x] 5.2 Implement Logout API Endpoint
    - Create or update `apps/api/src/auth/auth.controller.ts` with POST `/logout` endpoint
    - Verify JWT token and find matching Session record for authenticated user
    - Update Session.isActive to false and Session.refreshTokenHash to null
    - Handle errors gracefully and always return 200 status with success message
    - _Requirements: 5.2, 5.3, 5.6, 5.8_
  
  - [x] 5.3 Add logout flow integration tests
    - Test logout button triggers API call with correct token
    - Verify session invalidation in database after logout
    - Test token clearing from browser storage
    - Verify redirect to homepage after successful logout
    - Test graceful handling when API fails but local tokens are cleared
    - _Requirements: 5.1, 5.2, 5.4, 5.5_
    - **Status**: ✅ COMPLETE - See `TASK_5_VERIFICATION.md`

- [ ] 6. Checkpoint - Verify Core Functionality
  - Ensure all tests pass for authentication, connection pooling, wallet, and payment flows
  - Test admin login → auction data display → accurate data synchronization
  - Test database connection pool metrics showing < 80% utilization under normal load
  - Test wallet balance display with correct formatting and real-time updates
  - Test complete top-up flow: user request → payment method UI → admin approval → balance update
  - Test user logout clearing tokens and redirecting properly
  - Ask the user if questions arise or if manual testing reveals issues
  - **Status**: ⏳ READY TO EXECUTE - See `QUICK_START_TESTING.md` and `TASK_6_EXECUTION_CHECKLIST.md`

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP deployment
- Each task references specific requirements for traceability
- All database operations use Prisma transactions to ensure atomicity
- Connection pool management is critical for stability under load
- Payment method UI components are modular and reusable
- Admin endpoints are protected with AdminAuthGuard to enforce role-based access
- Idempotency keys prevent duplicate wallet transactions
- Logout functionality includes graceful error handling to ensure tokens are always cleared

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "2.2", "3.1"] },
    { "id": 2, "tasks": ["1.3", "2.3", "3.2", "3.3", "5.2"] },
    { "id": 3, "tasks": ["2.4", "3.4", "4.1", "5.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "4.5"] },
    { "id": 5, "tasks": ["4.6", "5.3"] },
    { "id": 6, "tasks": ["4.7", "4.8"] }
  ]
}
```
