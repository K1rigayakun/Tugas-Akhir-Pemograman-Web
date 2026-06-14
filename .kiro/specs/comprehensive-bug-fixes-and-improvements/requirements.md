# Requirements Document

## Introduction

This document specifies the requirements for fixing critical authentication, data layer, and payment flow issues in the Emerald Kingdom auction platform. The system is a Next.js + NestJS monorepo with Prisma ORM, implementing a medieval-themed premium auction platform using Crown Coin (CC) as virtual currency. Five critical issues have been identified in the Auth & Data Layer cluster that prevent core functionality from working properly.

## Glossary

- **Admin_Panel**: The administrative interface application located at `apps/admin/` that allows administrators to manage auctions, users, top-up requests, and system content
- **Auction_Web**: The user-facing web application located at `apps/web/` that displays auctions and allows users to participate
- **API_Server**: The NestJS backend server located at `apps/api/` that handles all business logic and database operations
- **Database_Pool**: PostgreSQL connection pooling mechanism provided by Supabase PgBouncer that manages database connections with a configured limit
- **Wallet_System**: The Crown Coin (CC) virtual currency management system that tracks user balances and transactions
- **TopUp_Request**: A database record representing a user's request to purchase Crown Coins using various payment methods
- **Payment_Gateway**: External payment processing service (Stripe, Midtrans) that handles monetary transactions
- **Admin_Role**: User role enum defining administrative permissions (SUPER_ADMIN, AUCTION_MANAGER, KYC_OFFICER, CONTENT_MANAGER, SUPPORT_OFFICER)
- **Session**: Authentication session record that tracks logged-in users and their refresh tokens

## Requirements

### Requirement 1: Admin Authentication and Data Synchronization

**User Story:** As an administrator, I want to successfully log in to the admin panel and view accurate auction data synchronized from the database, so that I can manage the platform effectively.

#### Acceptance Criteria

1. WHEN an administrator submits valid credentials on the admin login page, THE Admin_Panel SHALL authenticate the user against the API_Server and establish a valid session
2. WHEN an authenticated administrator accesses the auctions management page, THE Admin_Panel SHALL fetch and display all auction records from the Database using the correct API endpoint
3. IF the admin panel receives a 401 unauthorized response from any API call, THEN THE Admin_Panel SHALL redirect the user to the login page
4. THE Admin_Panel SHALL store authentication tokens in secure HTTP-only cookies or secure storage
5. WHEN the API_Server authenticates an admin user, THE API_Server SHALL verify that the user has a valid adminRole field value from the Admin_Role enum
6. THE Admin_Panel SHALL include a fetchWithAuth helper function in `apps/admin/src/lib/api.ts` that automatically attaches authentication credentials to all API requests
7. WHEN the admin panel displays auction data, THE Admin_Panel SHALL show the same data that exists in the auctions table including title, description, status, currentPrice, and all other fields
8. IF the auctions table contains data but the admin panel shows empty results, THEN THE Admin_Panel SHALL log the API response and endpoint URL to the browser console for debugging

### Requirement 2: Database Connection Pool Management

**User Story:** As a system operator, I want the API server to properly manage database connections without exhausting the connection pool, so that the application remains stable under load.

#### Acceptance Criteria

1. THE API_Server SHALL configure Prisma Client with a connection pool size of 3 connections maximum to match the DATABASE_URL connection_limit parameter
2. WHEN a database query completes, THE API_Server SHALL release the connection back to the Database_Pool within 1 second
3. THE API_Server SHALL use the DATABASE_URL with pgbouncer=true parameter for all runtime database operations
4. THE API_Server SHALL implement connection timeouts of 10 seconds maximum for idle connections
5. WHEN the Database_Pool reaches 100% utilization, THE API_Server SHALL queue additional requests rather than creating new connections
6. THE API_Server SHALL refactor service methods to use transaction batching where multiple queries operate on related data
7. WHEN performing sequential database operations within a single request handler, THE API_Server SHALL use Prisma transactions to reuse a single connection
8. THE API_Server SHALL implement connection retry logic with exponential backoff starting at 100ms for failed connection attempts
9. IF a connection remains idle for more than 10 seconds, THEN THE API_Server SHALL close the connection and return it to the pool
10. THE API_Server SHALL log connection pool metrics including active connections, idle connections, and queue depth to the application logs every 60 seconds

### Requirement 3: Wallet Currency Display and Balance Accuracy

**User Story:** As a user, I want to see my correct Crown Coin balance displayed in the wallet interface with proper currency formatting, so that I know how much I can spend.

#### Acceptance Criteria

1. WHEN a user views the wallet balance in the header navigation, THE Auction_Web SHALL display the balance from the WalletAccount.balance field with the "CC" currency suffix
2. THE Auction_Web SHALL fetch the current wallet balance from the GET `/api/wallet/balance` endpoint on page load and when the wallet is updated
3. WHEN the wallet balance changes due to a top-up approval or bid transaction, THE Auction_Web SHALL update the displayed balance within 2 seconds without requiring a page refresh
4. THE Auction_Web SHALL format wallet balances with thousand separators (e.g., "1,500 CC" for 1500)
5. WHEN a user's wallet balance is 0, THE Auction_Web SHALL display "0 CC" rather than an empty string or error message
6. IF the wallet balance API call fails, THEN THE Auction_Web SHALL display the last known cached balance with a warning indicator
7. THE API_Server SHALL calculate wallet balance as the sum of WalletAccount.balance field, ensuring consistency with WalletTransaction records
8. WHEN a WalletTransaction is created, THE API_Server SHALL atomically update the corresponding WalletAccount.balance field within the same database transaction

### Requirement 4: Payment Flow and Top-Up System Completion

**User Story:** As a user, I want to purchase Crown Coins using multiple payment methods including QRIS, Virtual Account, E-Wallet, and a testing payment option, so that I can fund my wallet and participate in auctions.

#### Acceptance Criteria

1. WHEN a user accesses the top-up page, THE Auction_Web SHALL display payment method options including QRIS, Virtual Account (BCA/BNI/Mandiri/BRI/Permata), E-Wallet (GoPay/OVO/Dana/ShopeePay/LinkAja), Stripe card payment, Bank Transfer, and Testing Payment
2. WHEN a user selects QRIS payment method, THE Auction_Web SHALL display a QR code image that can be zoomed and downloaded, with a 15-minute countdown timer
3. WHEN a user selects Virtual Account method, THE API_Server SHALL generate a unique 16-digit VA number and THE Auction_Web SHALL display it with a copy-to-clipboard button and bank-specific payment instructions
4. WHEN a user creates a top-up request, THE API_Server SHALL create a TopUpRequest record with status PENDING and an expiresAt timestamp 15 minutes in the future
5. WHEN a user selects Testing Payment method, THE API_Server SHALL create a TopUpRequest with method="TESTING" and status="PENDING" without requiring payment gateway integration
6. THE Admin_Panel SHALL display a dedicated page at `/topups/pending` showing all TopUpRequest records where status is PENDING, ordered by createdAt descending
7. WHEN an administrator clicks "Approve" on a pending top-up request, THE API_Server SHALL update the TopUpRequest status to APPROVED, create a WalletTransaction with type TOP_UP, increment the user's WalletAccount.balance by the amount field, and set reviewedBy to the admin's user ID
8. WHEN an administrator clicks "Reject" on a pending top-up request, THE API_Server SHALL update the TopUpRequest status to REJECTED and record the reviewedBy admin ID
9. IF a TopUpRequest expiresAt timestamp is in the past and status is still PENDING, THEN THE API_Server SHALL automatically update status to EXPIRED when the record is next accessed
10. WHEN a top-up request is approved, THE Auction_Web SHALL update the user's displayed wallet balance within 2 seconds using WebSocket notification or polling
11. THE API_Server SHALL validate that amount and fiatAmount fields are positive integers greater than 0 when creating a TopUpRequest
12. WHEN generating a Virtual Account number, THE API_Server SHALL ensure uniqueness by checking existing TopUpRequest paymentDetails JSON field for duplicate VA numbers

### Requirement 5: User Logout Functionality

**User Story:** As a logged-in user, I want to successfully log out of my account, so that I can end my session securely.

#### Acceptance Criteria

1. WHEN a user clicks the logout button in the profile dropdown menu, THE Auction_Web SHALL send a POST request to `/api/auth/logout` endpoint with the current session token
2. WHEN the logout endpoint is called, THE API_Server SHALL invalidate the session by setting Session.isActive to false for the current session record
3. WHEN the logout endpoint is called, THE API_Server SHALL clear the refresh token by setting Session.refreshTokenHash to null
4. WHEN logout completes successfully, THE Auction_Web SHALL clear all authentication tokens from browser storage including cookies and localStorage
5. WHEN logout completes successfully, THE Auction_Web SHALL redirect the user to the homepage `/` or login page `/login` within 1 second
6. IF the logout API call fails with a network error, THEN THE Auction_Web SHALL still clear local authentication tokens and redirect to the homepage
7. WHEN a user logs out, THE Auction_Web SHALL clear any cached user data including wallet balance, profile information, and preferences
8. THE API_Server SHALL return HTTP 200 status code upon successful logout regardless of whether a valid session was found

## Non-Functional Requirements

### Performance

1. THE API_Server SHALL respond to authentication requests within 500 milliseconds at the 95th percentile
2. THE API_Server SHALL handle at least 100 concurrent database operations without connection pool exhaustion
3. THE Auction_Web SHALL render the wallet balance update within 2 seconds of receiving the data

### Security

1. THE Admin_Panel SHALL transmit authentication credentials only over HTTPS in production environments
2. THE API_Server SHALL hash all refresh tokens using bcrypt before storing in Session.refreshTokenHash field
3. THE API_Server SHALL validate admin role permissions before allowing access to admin-specific endpoints

### Reliability

1. THE API_Server SHALL implement graceful degradation when the Database_Pool is exhausted, queuing requests rather than rejecting them
2. THE Auction_Web SHALL display cached wallet balance data when the API is temporarily unavailable

### Maintainability

1. THE API_Server SHALL log all database connection pool events including connection acquisition, release, and timeout to structured logs
2. THE API_Server SHALL use idempotency keys in WalletTransaction records to prevent duplicate balance updates
