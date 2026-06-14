# Design Document

## Introduction

This document provides the technical design for fixing BUG-01: Admin panel data sync issues. The solution involves creating a missing API utility module and ensuring the admin auction creation endpoint is fully functional.

## Architecture Overview

The fix involves three layers:

1. **Frontend Layer (Admin Panel)** - Already implemented in `apps/admin/src/app/auctions/page.tsx`
2. **API Client Layer** - **MISSING** - needs to be created at `apps/admin/src/lib/api.ts`
3. **Backend Layer (API Service)** - Already implemented in `apps/api/src/modules/admin/`

### Root Cause Analysis

The admin panel UI code references `fetchWithAuth` from `../../lib/api`, but this file does not exist. This causes:
- Module not found errors preventing the page from loading
- No way to make authenticated API calls
- Admin panel cannot fetch or create auction data

The backend API endpoint `/v1/admin/auctions` (GET and POST) is already implemented and functional. The issue is purely on the frontend side.

## Components

### Component 1: API Utility Module

**File:** `apps/admin/src/lib/api.ts`

**Purpose:** Provides authenticated HTTP client for admin panel API calls

**Interface:**

```typescript
interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData;
}

function fetchWithAuth(
  endpoint: string,
  options?: FetchOptions
): Promise<Response>
```

**Implementation Details:**

- Read JWT token from localStorage (key: `admin_token` or similar)
- Construct full API URL by prepending base URL to endpoint
- Add `Authorization: Bearer <token>` header to all requests
- For JSON requests, automatically add `Content-Type: application/json` header
- For FormData requests, let browser set multipart/form-data header
- Handle 401 responses by redirecting to login page
- Return raw Response object for caller to handle

**Error Handling:**

- Network errors: Log and re-throw
- 401 Unauthorized: Clear token and redirect to `/login`
- Other HTTP errors: Return response for caller to handle

### Component 2: Environment Configuration

**File:** `apps/admin/.env.local` (or similar)

**Purpose:** Configure API base URL

**Variables:**

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Usage:** API utility module reads this to construct full URLs

### Component 3: Admin Auctions Endpoint (Already Exists)

**Backend Endpoint:** `GET /api/v1/admin/auctions`

**Controller:** `apps/api/src/modules/admin/admin.controller.ts`

**Service:** `apps/api/src/modules/admin/admin.service.ts`

**Implementation Status:** ✅ Already implemented correctly

**Query Parameters:**
- `status` (optional): Filter by auction status (ACTIVE, UPCOMING, ENDED, CANCELLED)
- `type` (optional): Filter by auction type (LIVE, REGULAR)
- `page` (optional): Page number for pagination (default: 1)

**Response:**

```typescript
{
  data: Auction[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### Component 4: Create Auction Endpoint (Already Exists)

**Backend Endpoint:** `POST /api/v1/admin/auctions`

**Implementation Status:** ⚠️ **MISSING** - Needs to be added to controller

**Expected Request Body:**

```typescript
{
  title: string;
  description: string;
  category: string;
  rarity: string;
  auctionType: string;
  startingPrice: number;
  startTime: string;  // ISO date
  endTime: string;    // ISO date
  minimumIncrement?: number;
  minimumPrice?: number;  // For DESCENDING type
  decrementAmount?: number;  // For DESCENDING type
  minimumRank?: string;  // For RANK_EXCL type
  requiredAchievementId?: string;  // For RANK_EXCL type
  isSealed?: boolean;  // For SEALED_CHEST type
  imageUrls?: string[];
}
```

**Expected Response:**

```typescript
{
  success: boolean;
  data: Auction;
  message?: string;
}
```

## Data Models

### Auction (from Prisma schema)

```typescript
interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  rarity: ItemRarity;
  auctionType: AuctionType;
  status: AuctionStatus;
  startingPrice: number;
  currentPrice: number;
  minimumIncrement: number;
  minimumPrice?: number;
  decrementAmount?: number;
  startTime: Date;
  endTime: Date;
  minimumRank?: Rank;
  isSealed: boolean;
  imageUrls: string[];
  videoUrl?: string;
  modelUrl?: string;
  winnerId?: string;
  finalPrice?: number;
  inMuseum: boolean;
  createdAt: Date;
  updatedAt: Date;
  requiredAchievementId?: string;
  _count?: {
    bids: number;
    watchlists: number;
  };
}
```

## Integration Points

### Admin Panel → API Client

- Admin panel imports `fetchWithAuth` from `../../lib/api`
- All API calls use this function
- Token management handled transparently

### API Client → Backend API

- Base URL from environment variable
- Authentication via Bearer token in Authorization header
- JSON or FormData content types supported

### Backend API → Database

- Already working via Prisma ORM
- No changes needed

## Error Handling

### Missing Token

**Scenario:** User not logged in or token expired

**Handling:**
1. API client detects missing token
2. Redirect to `/login` page
3. Show message: "Session expired, please log in"

### Network Errors

**Scenario:** API server unreachable

**Handling:**
1. API client catches fetch error
2. Return error to component
3. Component shows user-friendly message
4. Provide retry button

### Validation Errors

**Scenario:** Invalid form data submitted

**Handling:**
1. Backend returns 400 with error message
2. Frontend extracts message from response
3. Display error in modal near submit button
4. Keep form data so user can correct

### Authorization Errors

**Scenario:** User lacks required admin role

**Handling:**
1. Backend returns 403 Forbidden
2. Frontend redirects to dashboard
3. Show message: "You don't have permission"

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Authentication header presence

*For any* authenticated API request, the request SHALL include a valid Authorization header with Bearer token format.

**Validates: Requirements 4.1**

### Property 2: Request-response data integrity

*For any* auction creation request with valid data, the created auction record SHALL contain all fields from the request.

**Validates: Requirements 2.3, 2.4**

### Property 3: Filter composition correctness

*For any* combination of status and type filters, the returned auctions SHALL match both filter criteria when both are specified.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Error message propagation

*For any* API error response, the error message SHALL be displayed to the user without loss of information.

**Validates: Requirements 2.6, 2.7, 4.3**

## Security Considerations

### Token Storage

- Store JWT in localStorage (acceptable for admin panel internal tool)
- Clear token on logout
- Clear token on 401 response

### CORS

- Ensure API server allows admin panel origin
- Admin panel runs on different port than API

### Input Validation

- Backend validates all auction creation fields
- Frontend provides client-side validation for UX
- Backend is source of truth for validation

## Testing Strategy

### Unit Tests

- Test `fetchWithAuth` with various input scenarios
- Mock fetch API responses
- Verify token inclusion in headers
- Verify error handling paths

### Integration Tests

- Test full flow: admin panel → API → database → response
- Verify auction creation end-to-end
- Verify filtering and pagination
- Test error scenarios

### Manual Testing Checklist

- [ ] Admin panel loads without module errors
- [ ] Auctions list displays existing data
- [ ] Status filters work correctly
- [ ] Type filters work correctly
- [ ] Create auction modal opens
- [ ] Create auction form validates input
- [ ] Create auction succeeds with valid data
- [ ] Create auction shows error with invalid data
- [ ] Token expiry redirects to login
- [ ] Network errors show user-friendly message

## Deployment Notes

### Prerequisites

- Admin panel has valid API URL configured
- Admin user has valid JWT token
- Backend API is running and accessible

### Migration Steps

1. Create `apps/admin/src/lib/api.ts`
2. Add `NEXT_PUBLIC_API_URL` to admin environment config
3. Add POST endpoint handler to admin controller (if not present)
4. Test in development environment
5. Deploy to production

### Rollback Plan

If issues arise:
1. Revert `api.ts` changes
2. Use temporary direct fetch calls
3. Fix issues and redeploy

No database changes required, so rollback is straightforward.

## Monitoring

### Metrics to Track

- Admin panel page load success rate
- API call success rate by endpoint
- Authentication failure rate
- Auction creation success rate

### Logging

- Log all admin API calls with user ID
- Log authentication failures
- Log validation errors on create
- Use existing AuditService for admin actions

## Future Enhancements

### Phase 2 Improvements

- Add request retry logic with exponential backoff
- Implement request caching for read operations
- Add optimistic UI updates
- WebSocket for real-time auction updates

### Phase 3 Improvements

- Implement refresh token rotation
- Add rate limiting on client side
- Batch multiple API calls
- Add request deduplication

## Appendix

### API Base URL Examples

**Development:**
```
http://localhost:3001/api
```

**Production:**
```
https://api.emeraldkingdom.com/api
```

### Token Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Full Endpoint Examples

**Get Auctions:**
```
GET /api/v1/admin/auctions?status=ACTIVE&type=LIVE&page=1
```

**Create Auction:**
```
POST /api/v1/admin/auctions
Content-Type: application/json

{
  "title": "Rare Emerald Sword",
  "description": "Legendary weapon",
  "category": "Weapons",
  "rarity": "LEGENDARY",
  "auctionType": "STANDARD",
  "startingPrice": 10000,
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-20T10:00:00Z"
}
```
