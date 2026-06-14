# Design Document: Comprehensive Bug Fixes and Improvements

## Overview

This design document outlines the technical architecture for fixing five critical issues in the Emerald Kingdom auction platform: admin authentication and data synchronization, database connection pool management, wallet currency display accuracy, payment flow completion with multiple methods, and user logout functionality. The solution maintains the existing Next.js + NestJS monorepo architecture with Prisma ORM while implementing targeted fixes for authentication, data layer, and payment subsystems.

## System Context

### Technology Stack
- **Frontend**: Next.js 14+ with TypeScript (App Router)
- **Admin Panel**: Separate Next.js application at `apps/admin/`
- **User Web**: Separate Next.js application at `apps/web/`
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL via Supabase with PgBouncer connection pooling
- **ORM**: Prisma Client
- **Payment Gateways**: Stripe (cards), Midtrans (local Indonesian methods)
- **Real-time Updates**: WebSocket or polling for wallet balance updates

### Architecture Pattern
The system follows a monorepo structure with separate applications communicating via REST API:
```
apps/
  ├── admin/     # Admin panel (port 3002)
  ├── web/       # User-facing web (port 3000)
  └── api/       # NestJS backend (port 3001)
packages/
  └── db/        # Shared Prisma schema and client
```

## Component Architecture

### 1. Admin Authentication and Data Synchronization

#### Components

**1.1 Admin Panel Authentication Service**

Location: `apps/admin/src/lib/auth.ts`

Responsibilities:
- Handle admin login form submission
- Store authentication tokens securely in HTTP-only cookies
- Manage session state in browser
- Handle 401 unauthorized responses and redirect to login

Key Functions:
```typescript
interface AdminAuthService {
  login(email: string, password: string): Promise<{accessToken: string, user: User}>;
  logout(): Promise<void>;
  getStoredToken(): string | null;
  clearTokens(): void;
  isAuthenticated(): boolean;
}
```

**1.2 Admin Panel API Client**

Location: `apps/admin/src/lib/api.ts`

Responsibilities:
- Provide `fetchWithAuth()` helper that attaches authentication credentials to all API requests
- Handle automatic token refresh
- Detect 401 responses and trigger logout/redirect

Key Functions:
```typescript
async function fetchWithAuth(url: string, options?: RequestInit): Promise<Response> {
  const token = getStoredToken();
  const headers = {
    ...options?.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  return response;
}
```

**1.3 Auctions Management Page**

Location: `apps/admin/src/app/auctions/page.tsx`

Responsibilities:
- Fetch auction data from API using correct endpoint
- Display auction records in table/grid format
- Log API responses for debugging when data mismatches occur

Data Flow:
1. Page loads → Call `fetchWithAuth('/api/v1/admin/auctions')`
2. Receive auction data → Render table with all fields
3. If 401 → Redirect to login
4. If data empty but DB has records → Log response and endpoint to console

**1.4 API Admin Authentication Guard**

Location: `apps/api/src/auth/guards/admin-auth.guard.ts`

Responsibilities:
- Verify JWT token from Authorization header
- Check user has valid `adminRole` field (enum: SUPER_ADMIN, AUCTION_MANAGER, KYC_OFFICER, CONTENT_MANAGER, SUPPORT_OFFICER)
- Reject requests if token invalid or user not admin
- Pass validated user object to controller

```typescript
@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.adminRole) {
      throw new UnauthorizedException('Admin access required');
    }
    
    return true;
  }
}
```

### 2. Database Connection Pool Management

#### Components

**2.1 Prisma Client Configuration**

Location: `packages/db/src/client.ts`

Responsibilities:
- Configure Prisma Client with connection pool size of 3 connections
- Set connection timeout to 10 seconds
- Configure pgbouncer=true in DATABASE_URL
- Implement connection retry logic with exponential backoff

Configuration:
```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // includes ?pgbouncer=true&connection_limit=3
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

// Connection pool monitoring
setInterval(async () => {
  const metrics = await prisma.$metrics.json();
  logger.log('Connection pool metrics:', {
    active: metrics.activeConnections,
    idle: metrics.idleConnections,
    queueDepth: metrics.queueDepth
  });
}, 60000);
```

Environment Variables:
```
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=3"
DIRECT_URL="postgresql://user:pass@host:5432/db"  # for migrations only
```

**2.2 Transaction Batching Service**

Location: `apps/api/src/common/services/transaction-batching.service.ts`

Responsibilities:
- Provide helper methods for batching multiple operations in a single transaction
- Ensure connections are released promptly after transaction completion
- Implement timeout handling for long-running transactions

```typescript
@Injectable()
export class TransactionBatchingService {
  constructor(private prisma: PrismaClient) {}
  
  async executeInTransaction<T>(
    operations: (tx: Prisma.TransactionClient) => Promise<T>,
    timeoutMs: number = 10000
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return await Promise.race([
        operations(tx),
        this.timeout(timeoutMs)
      ]);
    });
  }
  
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Transaction timeout')), ms)
    );
  }
}
```

**2.3 Connection Retry Interceptor**

Location: `apps/api/src/common/interceptors/connection-retry.interceptor.ts`

Responsibilities:
- Intercept database connection errors
- Implement exponential backoff starting at 100ms
- Retry up to 3 times before failing

```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 100
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

### 3. Wallet Currency Display and Balance Accuracy

#### Components

**3.1 Wallet Balance Display Component**

Location: `apps/web/src/components/wallet/WalletBalance.tsx`


Responsibilities:
- Display wallet balance in header navigation
- Format balance with thousand separators and "CC" suffix
- Handle zero balance display ("0 CC")
- Show cached balance with warning indicator if API fails
- Update display when balance changes

```typescript
function formatBalance(amount: number): string {
  return `${amount.toLocaleString('en-US')} CC`;
}

export function WalletBalance() {
  const [balance, setBalance] = useState<number>(0);
  const [isCached, setIsCached] = useState(false);
  
  useEffect(() => {
    fetchBalance();
    // Subscribe to balance updates (WebSocket or polling)
    const unsubscribe = subscribeToBalanceUpdates(setBalance);
    return unsubscribe;
  }, []);
  
  async function fetchBalance() {
    try {
      const response = await fetch('/api/v1/wallet/balance');
      const data = await response.json();
      setBalance(data.balance);
      setIsCached(false);
      // Cache for offline use
      localStorage.setItem('cachedBalance', String(data.balance));
    } catch (error) {
      // Use cached balance on error
      const cached = localStorage.getItem('cachedBalance');
      setBalance(Number(cached) || 0);
      setIsCached(true);
    }
  }
  
  return (
    <div>
      <span>{formatBalance(balance)}</span>
      {isCached && <WarningIcon />}
    </div>
  );
}
```

**3.2 Wallet Balance API Endpoint**


Location: `apps/api/src/wallet/wallet.controller.ts`

Responsibilities:
- Return current wallet balance from WalletAccount.balance field
- Ensure balance consistency with WalletTransaction records
- Handle requests efficiently with minimal database queries

```typescript
@Controller('wallet')
export class WalletController {
  @Get('balance')
  async getBalance(@CurrentUser() user: User) {
    const wallet = await this.prisma.walletAccount.findUnique({
      where: { userId: user.id },
      select: { balance: true }
    });
    
    return { balance: wallet?.balance || 0 };
  }
}
```

**3.3 Wallet Transaction Service**

Location: `apps/api/src/wallet/wallet.service.ts`

Responsibilities:
- Create WalletTransaction records with idempotency keys
- Atomically update WalletAccount.balance in same transaction
- Ensure balance consistency with transaction sum

```typescript
@Injectable()
export class WalletService {
  async createTransaction(
    walletId: string,
    type: WalletTxType,
    amount: number,
    description: string,
    idempotencyKey: string
  ): Promise<WalletTransaction> {
    return await this.prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId,
          type,
          amount,
          description,
          idempotencyKey,
        },
      });
      
      // Update wallet balance atomically
      const balanceChange = this.calculateBalanceChange(type, amount);
      await tx.walletAccount.update({
        where: { id: walletId },
        data: { balance: { increment: balanceChange } },
      });
      
      return transaction;
    });
  }
  
  private calculateBalanceChange(type: WalletTxType, amount: number): number {
    switch (type) {
      case 'TOP_UP':
      case 'BID_RELEASE':
      case 'CASHBACK':
      case 'REFUND':
      case 'BONUS':
        return amount;
      case 'BID_HOLD':
      case 'BID_DEDUCT':
      case 'SHOP_PURCHASE':
        return -amount;
      default:
        throw new Error(`Unknown transaction type: ${type}`);
    }
  }
}
```

### 4. Payment Flow and Top-Up System

#### Components

**4.1 Top-Up Request Page**

Location: `apps/web/src/app/topup/page.tsx`

Responsibilities:
- Display amount selection (50, 100, 500, 1000 CC or custom)
- Show payment method options: QRIS, Virtual Account, E-Wallet, Stripe Card, Bank Transfer, Testing Payment
- Handle method-specific flows (QR code, VA number, redirect)
- Display countdown timer for expiring payments
- Show status updates via WebSocket or polling

UI Flow:
1. User selects CC amount → Calculate fiat amount
2. User selects payment method → Submit to API
3. API returns payment details (QR, VA number, etc.)
4. Display method-specific UI:
   - QRIS: QR code image with zoom/download + 15-min timer
   - VA: 16-digit VA number with copy button + bank instructions
   - Testing: "Waiting for admin approval" message
5. Poll payment status or receive WebSocket updates
6. On approval: Show success and updated balance

**4.2 QRIS Payment Component**

Location: `apps/web/src/components/payment/QRISPayment.tsx`

Responsibilities:
- Display QR code image generated by backend
- Provide zoom functionality
- Provide download button
- Show 15-minute countdown timer
- Poll payment status

```typescript
export function QRISPayment({ paymentDetails }: { paymentDetails: any }) {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <h2>Scan QR Code</h2>
      <img 
        src={paymentDetails.qrCodeUrl} 
        alt="QRIS QR Code"
        className="cursor-zoom-in"
        onClick={handleZoom}
      />
      <button onClick={() => downloadQR(paymentDetails.qrCodeUrl)}>
        Download QR Code
      </button>
      <div>Time remaining: {formatTime(timeLeft)}</div>
    </div>
  );
}
```

**4.3 Virtual Account Payment Component**


Location: `apps/web/src/components/payment/VirtualAccountPayment.tsx`

Responsibilities:
- Display 16-digit VA number with copy-to-clipboard button
- Show bank-specific payment instructions (BCA, BNI, Mandiri, BRI, Permata)
- Display countdown timer

```typescript
export function VirtualAccountPayment({ paymentDetails }: { paymentDetails: any }) {
  const { vaNumber, bank } = paymentDetails;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(vaNumber);
    toast.success('VA number copied!');
  };
  
  return (
    <div>
      <h2>Virtual Account - {bank}</h2>
      <div className="va-number">{vaNumber}</div>
      <button onClick={copyToClipboard}>Copy VA Number</button>
      <BankInstructions bank={bank} />
    </div>
  );
}
```

**4.4 Payment Creation API Endpoint**

Location: `apps/api/src/payment/payment.controller.ts`

Responsibilities:
- Create TopUpRequest record with status PENDING
- Generate payment-method-specific details (QR code, VA number)
- Set expiresAt to 15 minutes in future
- Validate amount and fiatAmount are positive integers
- Ensure VA number uniqueness

```typescript
@Controller('payment')
export class PaymentController {
  @Post('create')
  async createTopUpRequest(
    @CurrentUser() user: User,
    @Body() dto: CreateTopUpDto
  ) {
    // Validate amounts
    if (dto.amount <= 0 || dto.fiatAmount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    
    // Generate payment details based on method
    const paymentDetails = await this.generatePaymentDetails(dto.method, dto.provider);
    
    // Create request
    const request = await this.prisma.topUpRequest.create({
      data: {
        userId: user.id,
        amount: dto.amount,
        fiatAmount: dto.fiatAmount,
        method: dto.method,
        provider: dto.provider,
        status: 'PENDING',
        paymentDetails,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });
    
    return { requestId: request.id, paymentDetails };
  }
  
  private async generatePaymentDetails(method: string, provider?: string) {
    switch (method) {
      case 'QRIS':
        return await this.generateQRCode();
      case 'VA':
        return await this.generateVirtualAccount(provider);
      case 'TESTING':
        return { message: 'Waiting for admin approval' };
      default:
        return {};
    }
  }
  
  private async generateVirtualAccount(bank: string): Promise<any> {
    let vaNumber: string;
    let isUnique = false;
    
    while (!isUnique) {
      vaNumber = this.generateRandomVA();
      const existing = await this.prisma.topUpRequest.findFirst({
        where: {
          paymentDetails: {
            path: ['vaNumber'],
            equals: vaNumber,
          },
        },
      });
      isUnique = !existing;
    }
    
    return { vaNumber, bank };
  }
  
  private generateRandomVA(): string {
    return Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 10)
    ).join('');
  }
}
```


**4.5 Admin Top-Up Approval Page**

Location: `apps/admin/src/app/topups/pending/page.tsx`

Responsibilities:
- Display all TopUpRequest records with status PENDING
- Order by createdAt descending
- Show Approve and Reject buttons
- Display user info, amount, method, and request time

```typescript
export default function PendingTopUpsPage() {
  const [requests, setRequests] = useState<TopUpRequest[]>([]);
  
  useEffect(() => {
    fetchPendingRequests();
  }, []);
  
  async function fetchPendingRequests() {
    const response = await fetchWithAuth('/api/v1/admin/topups/pending');
    const data = await response.json();
    setRequests(data.requests);
  }
  
  async function handleApprove(requestId: string) {
    await fetchWithAuth(`/api/v1/admin/topups/${requestId}/approve`, {
      method: 'POST',
    });
    // Refresh list
    await fetchPendingRequests();
  }
  
  async function handleReject(requestId: string) {
    await fetchWithAuth(`/api/v1/admin/topups/${requestId}/reject`, {
      method: 'POST',
    });
    await fetchPendingRequests();
  }
  
  return (
    <div>
      <h1>Pending Top-Up Requests</h1>
      <table>
        {requests.map(req => (
          <tr key={req.id}>
            <td>{req.user.email}</td>
            <td>{req.amount} CC</td>
            <td>{req.fiatAmount} IDR</td>
            <td>{req.method}</td>
            <td>{formatDate(req.createdAt)}</td>
            <td>
              <button onClick={() => handleApprove(req.id)}>Approve</button>
              <button onClick={() => handleReject(req.id)}>Reject</button>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```


**4.6 Admin Top-Up Approval API Endpoints**

Location: `apps/api/src/admin/topup-admin.controller.ts`

Responsibilities:
- Provide endpoints for fetching pending requests
- Handle approval: update status, create WalletTransaction, increment balance, set reviewedBy
- Handle rejection: update status and reviewedBy
- Automatically expire requests past expiresAt timestamp

```typescript
@Controller('admin/topups')
@UseGuards(AdminAuthGuard)
export class TopUpAdminController {
  @Get('pending')
  async getPendingRequests() {
    const requests = await this.prisma.topUpRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { id: true, email: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    
    // Auto-expire old requests
    const now = new Date();
    for (const req of requests) {
      if (req.expiresAt && req.expiresAt < now) {
        await this.prisma.topUpRequest.update({
          where: { id: req.id },
          data: { status: 'EXPIRED' },
        });
      }
    }
    
    // Re-fetch after expiry updates
    const updatedRequests = await this.prisma.topUpRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { id: true, email: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    
    return { requests: updatedRequests };
  }
  
  @Post(':id/approve')
  async approveTopUp(
    @Param('id') requestId: string,
    @CurrentUser() admin: User
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // Update request status
      const request = await tx.topUpRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      });
      
      // Get user's wallet
      const wallet = await tx.walletAccount.findUnique({
        where: { userId: request.userId },
      });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // Create wallet transaction
      const idempotencyKey = `topup-${requestId}-${Date.now()}`;
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'TOP_UP',
          amount: request.amount,
          description: `Top-up approved: ${request.method}`,
          referenceId: requestId,
          idempotencyKey,
        },
      });
      
      // Increment wallet balance
      await tx.walletAccount.update({
        where: { id: wallet.id },
        data: { 
          balance: { increment: request.amount },
          totalTopUp: { increment: request.amount },
        },
      });
      
      return { success: true };
    });
  }
  
  @Post(':id/reject')
  async rejectTopUp(
    @Param('id') requestId: string,
    @CurrentUser() admin: User
  ) {
    await this.prisma.topUpRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        reviewedBy: admin.id,
        reviewedAt: new Date(),
      },
    });
    
    return { success: true };
  }
}
```

### 5. User Logout Functionality

#### Components

**5.1 Logout UI Component**

Location: `apps/web/src/components/auth/LogoutButton.tsx`

Responsibilities:
- Trigger logout when user clicks logout button in profile dropdown
- Handle successful logout (clear tokens, redirect)
- Handle failed logout (clear tokens anyway, redirect)
- Clear cached user data

```typescript
export function LogoutButton() {
  const router = useRouter();
  
  async function handleLogout() {
    try {
      // Call logout API
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
    } catch (error) {
      // Even if API fails, still clear local data
      console.error('Logout API failed:', error);
    } finally {
      // Always clear local authentication and cached data
      clearAllTokens();
      clearCachedUserData();
      
      // Redirect to homepage within 1 second
      setTimeout(() => {
        router.push('/');
      }, 100);
    }
  }
  
  return <button onClick={handleLogout}>Logout</button>;
}

function clearAllTokens() {
  // Clear cookies
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Clear localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

function clearCachedUserData() {
  localStorage.removeItem('cachedBalance');
  localStorage.removeItem('userProfile');
  localStorage.removeItem('userPreferences');
  sessionStorage.clear();
}
```

**5.2 Logout API Endpoint**

Location: `apps/api/src/auth/auth.controller.ts`

Responsibilities:
- Invalidate session by setting Session.isActive to false
- Clear refresh token by setting Session.refreshTokenHash to null
- Return 200 status regardless of session validity

```typescript
@Controller('auth')
export class AuthController {
  @Post('logout')
  async logout(@CurrentUser() user: User, @Req() request: Request) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    try {
      // Find session by user and token
      const payload = this.jwtService.verify(token);
      
      await this.prisma.session.updateMany({
        where: {
          userId: user.id,
          isActive: true,
        },
        data: {
          isActive: false,
          refreshTokenHash: null,
        },
      });
    } catch (error) {
      // Ignore errors, still return 200
      console.log('Logout error (non-critical):', error);
    }
    
    // Always return 200 for successful logout
    return { success: true, message: 'Logged out successfully' };
  }
}
```

## Data Models

### Updated TopUpRequest Schema

The existing TopUpRequest model in `schema.prisma` already contains all required fields. No schema changes needed:

```prisma
model TopUpRequest {
  id             String      @id @default(cuid())
  userId         String
  amount         Int         // Crown Coins
  fiatAmount     Int         // Rupiah
  method         String      // QRIS, VA, EWALLET, CARD, TRANSFER, TESTING
  provider       String?     // BCA, BNI, GOPAY, etc.
  bank           String?
  walletType     String?
  status         TopUpStatus @default(PENDING)
  proofImageUrl  String?
  paymentDetails Json?       // QR code URL, VA number, etc.
  expiresAt      DateTime?
  paidAt         DateTime?
  adminNotes     String?
  reviewedBy     String?
  reviewedAt     DateTime?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  admin          User?       @relation("AdminTopUps", fields: [reviewedBy], references: [id])
  user           User        @relation("UserTopUps", fields: [userId], references: [id], onDelete: Cascade)
}
```

## Error Handling

### Connection Pool Exhaustion


When connection pool reaches capacity:
1. Queue requests in Prisma Client automatically
2. Log warning: "Connection pool near capacity"
3. If queue grows beyond threshold, return 503 Service Unavailable with retry-after header
4. Frontend displays user-friendly message: "Server busy, please try again"

### Authentication Failures

When admin authentication fails:
1. API returns 401 Unauthorized
2. Frontend `fetchWithAuth()` intercepts 401
3. Clear tokens and redirect to login page
4. Display message: "Session expired, please log in again"

### Payment Expiration

When TopUpRequest expires:
1. Backend auto-updates status to EXPIRED on next access
2. Frontend polling detects EXPIRED status
3. Display message: "Payment expired, please create a new request"
4. Provide button to start new top-up

### Wallet Balance Mismatch

If WalletAccount.balance doesn't match sum of WalletTransaction records:
1. Log critical error with user ID and discrepancy amount
2. Trigger manual review alert for administrators
3. Display cached balance to user with warning indicator
4. Prevent new transactions until resolved

## Security Considerations

### Authentication Token Storage
- Admin panel: Store tokens in HTTP-only cookies with secure flag
- User web: Store tokens in HTTP-only cookies with secure flag
- Never store sensitive tokens in localStorage (vulnerable to XSS)

### Admin Role Verification
- Every admin endpoint must use `@UseGuards(AdminAuthGuard)`
- Guard checks both token validity and adminRole field
- Log all admin actions to AuditLog table

### Payment Security
- Validate all amounts are positive integers
- Use idempotency keys to prevent duplicate wallet transactions
- Atomic database transactions for balance updates
- Log all payment approvals/rejections to audit trail

### Database Connection Security
- Use pgbouncer parameter to enable connection pooling
- Set connection_limit=3 to prevent exhaustion
- Never expose DIRECT_URL to runtime applications (migrations only)

## Performance Optimization

### Database Query Optimization


1. **Index Optimization**: Existing indexes on TopUpRequest.status, TopUpRequest.userId are sufficient
2. **Transaction Batching**: Group related operations in single Prisma transaction
3. **Select Only Needed Fields**: Use `select` to fetch only required columns
4. **Connection Reuse**: Use Prisma transactions for sequential operations

### Frontend Optimization

1. **Balance Caching**: Store last known balance in localStorage for offline display
2. **Polling Optimization**: Use exponential backoff for payment status polling (1s → 2s → 5s → 10s)
3. **WebSocket for Real-time**: Consider WebSocket for instant balance updates instead of polling
4. **Lazy Loading**: Load payment method components on-demand

### API Response Time Targets

- Authentication: < 500ms (p95)
- Wallet balance fetch: < 200ms (p95)
- Top-up creation: < 1000ms (p95)
- Admin approval: < 1500ms (p95) (includes transaction)

## Testing Strategy

### Unit Tests
- WalletService.createTransaction() with various transaction types
- formatBalance() with various amounts (0, 1000, 1500000)
- generateRandomVA() uniqueness
- calculateBalanceChange() for all WalletTxType enum values

### Integration Tests
- Admin login flow: credentials → API → session → token storage
- Top-up approval flow: admin approves → transaction created → balance updated
- Logout flow: API call → session invalidated → tokens cleared → redirect

### End-to-End Tests
1. Admin logs in → views auctions → sees correct data
2. User creates QRIS top-up → QR displayed → admin approves → balance updates
3. User creates Testing Payment → admin approves → wallet balance increases
4. User logs out → tokens cleared → redirected to homepage

## Deployment Considerations

### Environment Variables

Required for all applications:
```
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=3"
DIRECT_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="..."
FRONTEND_URL="https://emerald-kingdom.com"
ADMIN_URL="https://admin.emerald-kingdom.com"
```

### Database Migration


No schema changes required. Run existing migrations if database is out of sync:
```bash
npm run db:migrate
```

### Monitoring

Key metrics to monitor:
1. Database connection pool utilization (target: < 80%)
2. Average response time for wallet balance endpoint (target: < 200ms)
3. Top-up approval success rate (target: > 99%)
4. Authentication failure rate (target: < 1%)
5. Payment expiration rate (target: < 5%)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Admin authentication establishes valid sessions

*For any* administrator with valid credentials, submitting them to the admin login endpoint should successfully authenticate against the API_Server and establish a session with a valid token.

**Validates: Requirements 1.1**

### Property 2: Admin panel fetches correct auction data

*For any* authenticated administrator accessing the auctions management page, the Admin_Panel should fetch and display all auction records from the database matching what exists in the auctions table.

**Validates: Requirements 1.2, 1.7**

### Property 3: Admin role validation enforces permissions

*For any* user authentication attempt at admin endpoints, the API_Server should verify the user has a valid adminRole field value from the Admin_Role enum before granting access.

**Validates: Requirements 1.5**

### Property 4: Authenticated requests include credentials

*For any* API request made through the fetchWithAuth helper, authentication credentials should be automatically attached to the request headers.

**Validates: Requirements 1.6**


### Property 5: Database connections are released promptly

*For any* database query that completes execution, the API_Server should release the connection back to the Database_Pool within 1 second.

**Validates: Requirements 2.2**

### Property 6: Idle connections timeout correctly

*For any* database connection that remains idle for more than 10 seconds, the API_Server should close the connection and return it to the pool.

**Validates: Requirements 2.4, 2.9**

### Property 7: Connection pool saturation triggers queuing

*For any* request arriving when the Database_Pool reaches 100% utilization, the API_Server should queue the request rather than creating a new connection.

**Validates: Requirements 2.5**

### Property 8: Sequential operations reuse connections

*For any* request handler performing sequential database operations, the API_Server should use Prisma transactions to reuse a single connection across all operations.

**Validates: Requirements 2.7**

### Property 9: Connection failures retry with backoff

*For any* failed connection attempt, the API_Server should implement retry logic with exponential backoff starting at 100ms.

**Validates: Requirements 2.8**

### Property 10: Wallet balance displays with correct formatting

*For any* wallet balance value (including zero), the Auction_Web should display it with thousand separators and the "CC" suffix in the correct format (e.g., "1,500 CC").

**Validates: Requirements 3.1, 3.4, 3.5**

### Property 11: Balance updates reflect within time limit

*For any* wallet balance change due to top-up approval or bid transaction, the Auction_Web should update the displayed balance within 2 seconds.

**Validates: Requirements 3.3**

### Property 12: Balance calculation matches transaction sum

*For any* wallet account, the WalletAccount.balance field should equal the sum of all associated WalletTransaction amounts (considering transaction types).

**Validates: Requirements 3.7**

### Property 13: Wallet transactions update balance atomically

*For any* WalletTransaction creation, the API_Server should atomically update the corresponding WalletAccount.balance field within the same database transaction.

**Validates: Requirements 3.8**


### Property 14: Virtual Account numbers are unique

*For any* Virtual Account top-up request, the API_Server should generate a unique 16-digit VA number that does not duplicate any existing VA number in the paymentDetails of other TopUpRequest records.

**Validates: Requirements 4.3, 4.12**

### Property 15: Top-up requests have correct expiration

*For any* top-up request created by a user, the API_Server should create a TopUpRequest record with status PENDING and expiresAt timestamp set to exactly 15 minutes in the future.

**Validates: Requirements 4.4**

### Property 16: Pending requests display correctly ordered

*For any* set of TopUpRequest records in the database, the Admin_Panel should display all records where status is PENDING, ordered by createdAt in descending order.

**Validates: Requirements 4.6**

### Property 17: Top-up approval updates all required state

*For any* pending top-up request that an administrator approves, the API_Server should update the TopUpRequest status to APPROVED, create a WalletTransaction with type TOP_UP, increment the user's WalletAccount.balance by the amount field, and set reviewedBy to the admin's user ID, all within a single atomic transaction.

**Validates: Requirements 4.7**

### Property 18: Top-up rejection records reviewer

*For any* pending top-up request that an administrator rejects, the API_Server should update the TopUpRequest status to REJECTED and record the reviewedBy admin ID.

**Validates: Requirements 4.8**

### Property 19: Expired requests auto-update status

*For any* TopUpRequest with expiresAt timestamp in the past and status still PENDING, the API_Server should automatically update status to EXPIRED when the record is next accessed.

**Validates: Requirements 4.9**

### Property 20: Balance updates notify user promptly

*For any* approved top-up request, the Auction_Web should update the user's displayed wallet balance within 2 seconds using WebSocket notification or polling.

**Validates: Requirements 4.10**

### Property 21: Amount validation rejects invalid values

*For any* top-up request creation attempt, the API_Server should validate that amount and fiatAmount fields are positive integers greater than 0, rejecting any non-positive values.

**Validates: Requirements 4.11**


### Property 22: Logout sends request with token

*For any* authenticated user session where the user triggers logout, the Auction_Web should send a POST request to the `/api/auth/logout` endpoint with the current session token.

**Validates: Requirements 5.1**

### Property 23: Logout invalidates session

*For any* active user session when the logout endpoint is called, the API_Server should invalidate the session by setting Session.isActive to false and Session.refreshTokenHash to null for the current session record.

**Validates: Requirements 5.2, 5.3**

### Property 24: Logout clears all local authentication data

*For any* successful logout completion, the Auction_Web should clear all authentication tokens from browser storage including cookies and localStorage.

**Validates: Requirements 5.4**

### Property 25: Logout redirects within time limit

*For any* logout operation (successful or failed), the Auction_Web should redirect the user to the homepage or login page within 1 second of completion.

**Validates: Requirements 5.5**

### Property 26: Logout clears cached user data

*For any* user logout operation, the Auction_Web should clear all cached user data including wallet balance, profile information, and preferences from browser storage.

**Validates: Requirements 5.7**

### Property 27: Logout always returns success status

*For any* logout API call regardless of session validity, the API_Server should return HTTP 200 status code to indicate successful logout processing.

**Validates: Requirements 5.8**

## Implementation Notes

### Code Examples Language

All code examples in this design document use **TypeScript** with Next.js and NestJS frameworks, matching the existing project technology stack.

### Phased Implementation Approach

Recommended implementation order:
1. **Phase 1**: Admin authentication and API client fixes (Requirements 1)
2. **Phase 2**: Database connection pool configuration (Requirements 2)
3. **Phase 3**: Wallet balance display and transaction atomicity (Requirements 3)
4. **Phase 4**: Payment flow and top-up system (Requirements 4)
5. **Phase 5**: User logout functionality (Requirements 5)

Each phase can be developed, tested, and deployed independently to minimize risk.
