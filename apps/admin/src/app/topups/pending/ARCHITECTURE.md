# Architecture Overview: Admin Pending Top-Ups Page

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Admin Web Application                        │
│                     (Next.js - Port 3002)                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         /topups/pending/page.tsx (This Component)         │  │
│  │                                                            │  │
│  │  State:                                                    │  │
│  │  • requests: TopUpRequest[]                                │  │
│  │  • loading: boolean                                        │  │
│  │  • error: string | null                                    │  │
│  │  • processingId: string | null                             │  │
│  │                                                            │  │
│  │  Functions:                                                │  │
│  │  • fetchPendingRequests()                                  │  │
│  │  • handleApprove(requestId)                                │  │
│  │  • handleReject(requestId)                                 │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│                     │                                             │
│                     │ Uses fetchWithAuth()                        │
│                     ↓                                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              src/lib/api.ts (API Helper)                  │  │
│  │                                                            │  │
│  │  • fetchWithAuth(endpoint, options)                        │  │
│  │  • Adds Authorization header                               │  │
│  │  • Handles 401 → Redirects to /login                       │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
└────────────────────┼──────────────────────────────────────────────┘
                     │
                     │ HTTP Requests with JWT Token
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API Server (NestJS)                         │
│                        (Port 3001)                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      modules/payment/payment.controller.ts                │  │
│  │                                                            │  │
│  │  Endpoints:                                                │  │
│  │  • GET  /payment/admin/list?status=PENDING                │  │
│  │  • POST /payment/admin/:id/approve                         │  │
│  │  • POST /payment/admin/:id/reject                          │  │
│  │                                                            │  │
│  │  Guards: @UseGuards(AuthGuard)                             │  │
│  │  Validation: req.user.adminRole must exist                 │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│                     │                                             │
│                     ↓                                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        modules/payment/payment.service.ts                 │  │
│  │                                                            │  │
│  │  • getAdminPaymentList(status, ...)                        │  │
│  │  • approveTopUpRequest(id, adminId, notes)                 │  │
│  │  • rejectTopUpRequest(id, adminId, notes)                  │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│                     │                                             │
│                     ↓ Prisma ORM                                  │
└────────────────────┼──────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                           │
│                    (via Supabase)                                │
│                                                                   │
│  Tables:                                                          │
│  • TopUpRequest                                                   │
│    - id, userId, amount, fiatAmount, method, status, ...         │
│  • WalletAccount                                                  │
│    - id, userId, balance, totalTopUp, ...                        │
│  • WalletTransaction                                              │
│    - id, walletId, type, amount, referenceId, ...                │
│  • User                                                           │
│    - id, email, username, adminRole, ...                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Fetch Pending Requests Flow

```
User Opens Page
     ↓
Component Mounts
     ↓
useEffect() triggers
     ↓
fetchPendingRequests()
     ↓
setState({ loading: true })
     ↓
fetchWithAuth('/v1/payment/admin/list?status=PENDING')
     ↓
Add Authorization Header: "Bearer <JWT_TOKEN>"
     ↓
Send HTTP GET Request
     ↓
┌─────────────────────────────────────┐
│ API Server Receives Request         │
│ ↓                                    │
│ AuthGuard validates JWT token       │
│ ↓                                    │
│ Check user.adminRole exists         │
│ ↓                                    │
│ PaymentController.getAdminPaymentList() │
│ ↓                                    │
│ PaymentService.getAdminPaymentList() │
│ ↓                                    │
│ Prisma Query:                        │
│   TopUpRequest.findMany({           │
│     where: { status: 'PENDING' },   │
│     include: { user: true },        │
│     orderBy: { createdAt: 'desc' }  │
│   })                                 │
│ ↓                                    │
│ Return JSON response                 │
└─────────────────────────────────────┘
     ↓
Response received in frontend
     ↓
Parse JSON: const data = await response.json()
     ↓
Extract requests: const requestsData = data.data || data
     ↓
setState({ 
  requests: requestsData, 
  loading: false 
})
     ↓
Component Re-renders
     ↓
Table Displays with Data
```

---

### 2. Approve Request Flow

```
Admin Clicks "Approve" Button
     ↓
handleApprove(requestId) called
     ↓
Show Confirmation Dialog
     ↓
Admin Clicks "OK"
     ↓
setState({ processingId: requestId })
     ↓
fetchWithAuth(`/v1/payment/admin/${requestId}/approve`, {
  method: 'POST',
  body: JSON.stringify({})
})
     ↓
Send HTTP POST Request with JWT
     ↓
┌─────────────────────────────────────────────────────────┐
│ API Server Receives Request                             │
│ ↓                                                        │
│ AuthGuard validates JWT + adminRole                     │
│ ↓                                                        │
│ PaymentController.approvePayment(id, adminId, notes)    │
│ ↓                                                        │
│ PaymentService.approveTopUpRequest(id, adminId, notes)  │
│ ↓                                                        │
│ Start Database Transaction (Prisma.$transaction)        │
│ ↓                                                        │
│ 1. Update TopUpRequest:                                 │
│    - status = 'APPROVED'                                │
│    - reviewedBy = adminId                               │
│    - reviewedAt = new Date()                            │
│ ↓                                                        │
│ 2. Get WalletAccount by userId                          │
│ ↓                                                        │
│ 3. Create WalletTransaction:                            │
│    - walletId                                            │
│    - type = 'TOP_UP'                                    │
│    - amount = request.amount                            │
│    - referenceId = requestId                            │
│    - idempotencyKey = `topup-${requestId}-${timestamp}` │
│ ↓                                                        │
│ 4. Update WalletAccount:                                │
│    - balance = balance + request.amount                 │
│    - totalTopUp = totalTopUp + request.amount           │
│ ↓                                                        │
│ Commit Transaction                                       │
│ ↓                                                        │
│ Return { success: true }                                │
└─────────────────────────────────────────────────────────┘
     ↓
Response received: { success: true }
     ↓
setState({ processingId: null })
     ↓
Show Success Alert:
"Top-up request approved successfully! 
User's wallet balance has been updated."
     ↓
Call fetchPendingRequests() to refresh
     ↓
Table Updates (approved request removed)
     ↓
User's Wallet Balance Updated ✅
```

---

### 3. Reject Request Flow

```
Admin Clicks "Reject" Button
     ↓
handleReject(requestId) called
     ↓
Show Prompt: "Please enter the reason for rejection:"
     ↓
Admin Enters Reason
     ↓
Validate: reason.trim() !== ''
     ↓
Show Confirmation Dialog
     ↓
Admin Clicks "OK"
     ↓
setState({ processingId: requestId })
     ↓
fetchWithAuth(`/v1/payment/admin/${requestId}/reject`, {
  method: 'POST',
  body: JSON.stringify({ notes: reason })
})
     ↓
Send HTTP POST Request with JWT + notes
     ↓
┌─────────────────────────────────────────────────────────┐
│ API Server Receives Request                             │
│ ↓                                                        │
│ AuthGuard validates JWT + adminRole                     │
│ ↓                                                        │
│ PaymentController.rejectPayment(id, adminId, notes)     │
│ ↓                                                        │
│ PaymentService.rejectTopUpRequest(id, adminId, notes)   │
│ ↓                                                        │
│ Update TopUpRequest:                                     │
│   - status = 'REJECTED'                                 │
│   - reviewedBy = adminId                                │
│   - reviewedAt = new Date()                             │
│   - adminNotes = notes                                  │
│ ↓                                                        │
│ No WalletTransaction created                            │
│ No balance update                                       │
│ ↓                                                        │
│ Return { success: true }                                │
└─────────────────────────────────────────────────────────┘
     ↓
Response received: { success: true }
     ↓
setState({ processingId: null })
     ↓
Show Success Alert:
"Top-up request rejected successfully."
     ↓
Call fetchPendingRequests() to refresh
     ↓
Table Updates (rejected request removed)
     ↓
User's Wallet Balance Unchanged ❌
```

---

## Component Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│                   Component Lifecycle                     │
└──────────────────────────────────────────────────────────┘

1. Mount Phase
   ├─ Component renders with initial state
   ├─ loading = true
   ├─ requests = []
   └─ useEffect() executes
      └─ fetchPendingRequests()

2. Loading Phase
   ├─ Loading spinner displays
   └─ API call in progress

3. Data Loaded Phase
   ├─ loading = false
   ├─ requests populated
   └─ Table renders with data

4. User Interaction Phase
   ├─ User clicks Approve/Reject
   ├─ processingId set
   ├─ Buttons disable
   └─ API call executes

5. Post-Action Phase
   ├─ processingId cleared
   ├─ Success/Error alert shown
   ├─ fetchPendingRequests() called
   └─ Table refreshes with updated data

6. Unmount Phase
   └─ Component cleanup (if needed)
```

---

## State Management

```
Component State
├─ requests: TopUpRequest[]
│  └─ Stores fetched pending requests
│
├─ loading: boolean
│  ├─ true: Initial load or refresh in progress
│  └─ false: Data loaded or error occurred
│
├─ error: string | null
│  ├─ null: No error
│  └─ string: Error message to display
│
└─ processingId: string | null
   ├─ null: No action in progress
   └─ string: ID of request being processed
      └─ Used to disable buttons during processing
```

---

## Security Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
└────────────────────────────────────────────────────────────┘

Layer 1: Frontend Authentication Check
   └─ fetchWithAuth() includes JWT token
      └─ Token stored in localStorage

Layer 2: Transport Security
   └─ HTTPS in production
      └─ Encrypted data transmission

Layer 3: API Gateway
   └─ @UseGuards(AuthGuard)
      ├─ Validates JWT signature
      ├─ Checks token expiration
      └─ Extracts user from token

Layer 4: Authorization Check
   └─ Controller validates req.user.adminRole
      ├─ If missing: 403 Forbidden
      └─ If present: Allow access

Layer 5: Session Management
   └─ 401 Response triggers automatic redirect
      └─ User redirected to /login

Layer 6: Audit Trail
   └─ All actions logged with:
      ├─ reviewedBy: adminId
      ├─ reviewedAt: timestamp
      └─ adminNotes: rejection reason
```

---

## Error Handling Strategy

```
Error Type: Network Error
├─ Cause: Server unreachable, timeout
├─ Detection: try/catch in fetchPendingRequests()
├─ User Feedback: Error message box at top
└─ Recovery: Retry button available

Error Type: API Error (4xx/5xx)
├─ Cause: Invalid request, server error
├─ Detection: !response.ok check
├─ User Feedback: Alert with error message
└─ Recovery: User can retry action

Error Type: Authentication Error (401)
├─ Cause: Token expired/invalid
├─ Detection: response.status === 401
├─ User Feedback: Automatic redirect
└─ Recovery: User logs in again

Error Type: Authorization Error (403)
├─ Cause: User not admin
├─ Detection: response.status === 403
├─ User Feedback: "Forbidden" error message
└─ Recovery: User needs admin privileges

Error Type: Validation Error
├─ Cause: Empty rejection reason
├─ Detection: Frontend validation
├─ User Feedback: Alert message
└─ Recovery: User enters valid reason
```

---

## Performance Considerations

```
┌────────────────────────────────────────────────────────────┐
│                  Performance Optimizations                  │
└────────────────────────────────────────────────────────────┘

1. Data Fetching
   ├─ Single API call fetches all pending requests
   ├─ Backend filters by status=PENDING
   └─ Includes user data via join (no N+1 queries)

2. State Updates
   ├─ processingId prevents concurrent actions
   ├─ setState() batched by React
   └─ Table re-renders only when state changes

3. API Calls
   ├─ Atomic database transactions
   ├─ Idempotency keys prevent duplicates
   └─ Connection pooling in Prisma

4. UI Rendering
   ├─ Conditional rendering for states
   ├─ Minimal re-renders during processing
   └─ CSS animations hardware-accelerated

Expected Performance:
├─ Page load: < 2 seconds (10 requests)
├─ Approve/Reject: < 2 seconds
└─ Table refresh: < 1 second
```

---

## Database Schema Relations

```
┌──────────────────┐
│  TopUpRequest    │
├──────────────────┤
│ id (PK)          │
│ userId (FK) ─────┼───┐
│ amount           │   │
│ fiatAmount       │   │
│ method           │   │
│ status           │   │
│ reviewedBy (FK) ─┼───┼───┐
│ createdAt        │   │   │
│ reviewedAt       │   │   │
│ adminNotes       │   │   │
└──────────────────┘   │   │
                       │   │
┌──────────────────┐   │   │
│  User            │   │   │
├──────────────────┤   │   │
│ id (PK) ◄────────┼───┘   │
│ email            │       │
│ username         │       │
│ adminRole        │ ◄─────┘
└──────────────────┘
       │
       │ 1:1
       ↓
┌──────────────────┐
│  WalletAccount   │
├──────────────────┤
│ id (PK)          │
│ userId (FK)      │
│ balance          │
│ totalTopUp       │
└──────────────────┘
       │
       │ 1:N
       ↓
┌──────────────────┐
│ WalletTransaction│
├──────────────────┤
│ id (PK)          │
│ walletId (FK)    │
│ type             │
│ amount           │
│ referenceId      │
│ idempotencyKey   │
│ createdAt        │
└──────────────────┘
```

---

## Integration Points

```
┌────────────────────────────────────────────────────────────┐
│              External System Integrations                   │
└────────────────────────────────────────────────────────────┘

1. Authentication System
   ├─ Location: apps/admin/src/lib/auth.ts
   ├─ Provides: AdminAuthService
   ├─ Used For: Token storage and retrieval
   └─ Integration: getStoredToken()

2. API Client
   ├─ Location: apps/admin/src/lib/api.ts
   ├─ Provides: fetchWithAuth()
   ├─ Used For: Authenticated HTTP requests
   └─ Integration: All API calls

3. Backend API
   ├─ Location: apps/api/src/modules/payment/
   ├─ Provides: REST endpoints
   ├─ Used For: Data operations
   └─ Integration: HTTP requests with JWT

4. Database
   ├─ Provider: Supabase (PostgreSQL)
   ├─ ORM: Prisma
   ├─ Used For: Data persistence
   └─ Integration: Via Prisma client

5. Notification System (Future)
   ├─ Provider: WebSocket or Polling
   ├─ Used For: Real-time updates
   └─ Integration: Subscribe to balance changes
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Production Setup                        │
└────────────────────────────────────────────────────────────┘

Frontend (Admin Panel)
├─ Hosting: Vercel / Netlify / AWS
├─ Domain: admin.yourdomain.com
├─ Port: 443 (HTTPS)
└─ Environment Variables:
   └─ NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

Backend (API Server)
├─ Hosting: AWS / DigitalOcean / Railway
├─ Domain: api.yourdomain.com
├─ Port: 443 (HTTPS)
└─ Environment Variables:
   ├─ DATABASE_URL (with pgbouncer)
   ├─ DIRECT_URL (for migrations)
   └─ JWT_SECRET

Database
├─ Provider: Supabase
├─ Connection: PostgreSQL with PgBouncer
└─ Backup: Automated daily backups

CDN (Static Assets)
├─ Provider: Cloudflare / AWS CloudFront
└─ Caching: Images, CSS, JS
```

---

## Monitoring & Logging

```
Frontend Monitoring
├─ Console errors logged
├─ API request/response logged (dev mode)
└─ User actions tracked

Backend Monitoring
├─ All admin actions logged with:
│  ├─ Admin ID
│  ├─ Timestamp
│  ├─ Action type
│  └─ Request ID
├─ Database queries logged
└─ Error stack traces captured

Database Monitoring
├─ Query performance tracked
├─ Connection pool utilization
└─ Transaction rollbacks logged

Metrics to Track
├─ Average processing time per request
├─ Approval/rejection rate
├─ Peak usage times
└─ Error rate by type
```

---

This architecture ensures a secure, scalable, and maintainable system for managing pending top-up requests.
