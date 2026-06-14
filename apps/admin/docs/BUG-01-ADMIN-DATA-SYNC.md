# BUG-01: Admin Panel Data Sync Fix - Complete Documentation

## Overview

This document provides comprehensive documentation for the BUG-01 fix, which resolved data sync issues between the admin panel and the web application. The fix involved creating a missing API utility module and ensuring proper integration with the backend API.

## Problem Statement

The admin panel was unable to fetch or display auction data that existed in the database and was visible on the public web application. The root cause was a missing API client module that the admin panel UI code referenced but didn't exist.

## Solution

The solution involved three main components:

1. **API Utility Module** - Created `src/lib/api.ts` with authenticated HTTP client
2. **Environment Configuration** - Set up `NEXT_PUBLIC_API_URL` environment variable
3. **Error Handling** - Implemented comprehensive error handling for validation, authentication, and network errors

## Implementation Details

### 1. API Utility Module (`src/lib/api.ts`)

#### Purpose
Provides a centralized, authenticated HTTP client for all admin panel API requests.

#### Key Features

**Authentication:**
- Automatically retrieves JWT token from localStorage (key: `admin_token`)
- Includes token in `Authorization: Bearer <token>` header for all requests
- Redirects to `/login` on 401 Unauthorized responses

**Content-Type Handling:**
- Automatically sets `Content-Type: application/json` for JSON requests
- Lets browser handle `multipart/form-data` boundary for FormData uploads

**Error Handling:**
- Catches and logs network errors
- Re-throws errors for caller to handle
- Clears invalid tokens and redirects to login

#### Usage Examples

```typescript
import { fetchWithAuth } from "@/lib/api";

// GET request - Fetch auctions
const response = await fetchWithAuth("/v1/admin/auctions?status=ACTIVE");
const data = await response.json();

// POST request - Create auction
const response = await fetchWithAuth("/v1/admin/auctions", {
  method: "POST",
  body: JSON.stringify({
    title: "New Auction",
    description: "Description",
    category: "Category",
    rarity: "RARE",
    auctionType: "STANDARD",
    startingPrice: 10000,
    startTime: "2024-01-15T10:00:00Z",
    endTime: "2024-01-20T10:00:00Z",
  })
});

// File upload with FormData
const formData = new FormData();
formData.append("file", file);
const response = await fetchWithAuth("/v1/upload", {
  method: "POST",
  body: formData, // Content-Type set automatically
});
```

### 2. Environment Variables

#### Required Variable: `NEXT_PUBLIC_API_URL`

**Purpose:** Specifies the base URL of the backend API service.

**Development Configuration:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Production Configuration:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

**Notes:**
- Must use `NEXT_PUBLIC_` prefix for browser exposure
- Changes require server restart
- Never commit `.env.local` to version control
- Set via hosting platform for production deployments

### 3. Error Handling

The implementation includes comprehensive error handling for three categories of errors:

#### Validation Errors (400 Bad Request)

**Scenarios:**
- Missing required fields (title, description, category, etc.)
- Invalid date ranges (endTime before startTime)
- Negative or zero prices
- Invalid enum values (rarity, auctionType)

**Response Format:**
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed: [specific error details]",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/v1/admin/auctions"
}
```

**User Experience:**
- Error message displayed in modal near submit button
- Form remains open with data intact
- User can correct errors and resubmit

#### Authentication Errors (401 Unauthorized)

**Scenarios:**
- Missing Authorization header
- Invalid token format
- Expired JWT token
- Token for wrong role/audience

**Response Format:**
```json
{
  "success": false,
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Token tidak ditemukan. Silakan login terlebih dahulu.",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "path": "/api/v1/admin/auctions"
}
```

**User Experience:**
- Token automatically cleared from localStorage
- Automatic redirect to `/login` page
- Message displayed: "Session expired, please log in"

#### Network Errors

**Scenarios:**
- API server unreachable (ECONNREFUSED)
- DNS resolution failure (ENOTFOUND)
- Request timeout
- Network connectivity loss

**Handling:**
```typescript
try {
  const response = await fetchWithAuth("/v1/admin/auctions");
  // Handle success
} catch (error) {
  // Network error caught
  console.error("Network error:", error.message);
  // Show user-friendly message with retry option
}
```

**User Experience:**
- User-friendly error message displayed
- Retry button provided
- No automatic redirects (to preserve user context)

## API Endpoints

### GET `/v1/admin/auctions`

**Purpose:** Fetch paginated list of auctions with optional filters.

**Query Parameters:**
- `status` (optional): Filter by auction status (DRAFT, ACTIVE, UPCOMING, ENDED, CANCELLED)
- `type` (optional): Filter by auction type (LIVE, REGULAR)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Auction Title",
      "description": "Description",
      "status": "ACTIVE",
      "rarity": "RARE",
      "auctionType": "STANDARD",
      "currentPrice": 10000,
      "_count": {
        "bids": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### POST `/v1/admin/auctions`

**Purpose:** Create a new auction.

**Request Body:**
```json
{
  "title": "Auction Title",
  "description": "Detailed description",
  "category": "Weapons",
  "rarity": "LEGENDARY",
  "auctionType": "STANDARD",
  "startingPrice": 10000,
  "minimumIncrement": 500,
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-20T10:00:00Z",
  "imageUrls": ["https://example.com/image.jpg"],
  
  // Optional fields based on auction type
  "minimumPrice": 5000,        // For DESCENDING type
  "decrementAmount": 500,       // For DESCENDING type
  "minimumRank": "SILVER",      // For RANK_EXCL type
  "isSealed": true              // For SEALED_CHEST type
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Auction Title",
    "status": "DRAFT",
    "currentPrice": 10000,
    // ... all auction fields
  },
  "message": "Auction created successfully"
}
```

## Auction Types

### STANDARD
Traditional ascending auction where users bid incrementally.

**Required Fields:**
- `startingPrice`: Initial auction price
- `minimumIncrement`: Minimum bid increment amount

### DESCENDING
Dutch auction where price decreases over time until a buyer accepts.

**Required Fields:**
- `startingPrice`: Initial high price
- `minimumPrice`: Lowest acceptable price
- `decrementAmount`: Amount price decreases by

### RANK_EXCL (Rank Exclusive)
Auction restricted to users with specific rank or achievement.

**Required Fields:**
- `startingPrice`: Initial auction price
- `minimumRank`: Required user rank (BRONZE, SILVER, GOLD, PLATINUM)
- `requiredAchievementId` (optional): Specific achievement required

### SEALED_CHEST
Blind auction where bids are hidden until auction ends.

**Required Fields:**
- `startingPrice`: Initial auction price
- `isSealed`: true

## Testing

### Test Suites

1. **Task 3: API Integration Tests** (`src/lib/api.test.ts`)
   - Tests fetchWithAuth import
   - Tests GET endpoint with various filters
   - Tests pagination
   - Tests empty state handling

2. **Task 5: Auction Creation E2E** (`tests/auction-creation-e2e.test.js`)
   - Tests complete auction creation flow
   - Tests data integrity
   - Tests auction appears in list after creation

3. **Task 6: Error Handling** (`tests/error-handling.test.js`)
   - Tests validation errors (10 scenarios)
   - Tests authentication errors (4 scenarios)
   - Tests network errors (3 scenarios)
   - Tests error message display

4. **Task 7: Comprehensive Verification** (`tests/task-7-verification.js`)
   - Tests complete user flow
   - Tests all filter combinations
   - Tests all auction types
   - Tests all error paths

### Running Tests

```bash
# Set up environment
export API_URL="http://localhost:3001/api"
export ADMIN_TOKEN="your-jwt-token"

# Or authenticate automatically
export ADMIN_EMAIL="admin@emeraldkingdom.id"
export ADMIN_PASSWORD="admin123!"

# Run all tests with authentication
node apps/admin/tests/run-all-tests.js

# Run specific test suites
node apps/admin/tests/error-handling.test.js
node apps/admin/tests/task-7-verification.js
```

## Deployment Checklist

### Pre-Deployment

- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Document production API URL
- [ ] Run all test suites and verify they pass
- [ ] Test with production-like data volumes
- [ ] Verify error messages are user-friendly (no stack traces)

### Deployment

- [ ] Set `NEXT_PUBLIC_API_URL` in hosting platform
- [ ] Verify API server allows admin panel origin (CORS)
- [ ] Test authentication flow in production
- [ ] Verify 401 redirect to login works
- [ ] Test network error handling

### Post-Deployment

- [ ] Monitor error rates for API endpoints
- [ ] Verify admin users can log in and access dashboard
- [ ] Test auction creation with all types
- [ ] Verify filters and pagination work correctly
- [ ] Check that error handling is working as expected

## Monitoring

### Key Metrics

1. **Admin Panel Page Load Success Rate**
   - Target: >99%
   - Alert if <95%

2. **API Call Success Rate**
   - Target: >98% (excluding 4xx errors)
   - Alert if <95%

3. **Authentication Failure Rate**
   - Target: <2% (excluding expired tokens)
   - Alert if >5%

4. **Auction Creation Success Rate**
   - Target: >95% (valid requests)
   - Alert if <90%

### Logging

All admin actions are logged via the backend's AuditService:
- API endpoint accessed
- User ID and role
- Action performed (view, create, update)
- Timestamp
- Result (success/failure)

## Troubleshooting

### Issue: "Module not found: Can't resolve '../../lib/api'"

**Cause:** API utility module doesn't exist  
**Solution:** Verify `apps/admin/src/lib/api.ts` file exists

### Issue: Auctions not loading (empty list)

**Possible Causes:**
1. API server not running
2. Wrong `NEXT_PUBLIC_API_URL` value
3. CORS issue (API doesn't allow admin origin)
4. No auctions in database

**Diagnosis:**
```bash
# Check API server is running
curl http://localhost:3001/api/health

# Check admin can access auctions endpoint
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/v1/admin/auctions
```

### Issue: 401 Unauthorized errors

**Possible Causes:**
1. No token in localStorage
2. Token expired
3. Token for wrong user role
4. Token format invalid

**Solution:**
- Check browser localStorage for `admin_token` key
- Try logging out and logging back in
- Verify user has SUPER_ADMIN or AUCTION_MANAGER role

### Issue: Create auction fails with validation error

**Diagnosis:**
- Check browser console for full error message
- Verify all required fields are present
- Verify date range is valid (endTime > startTime)
- Verify prices are positive numbers
- Verify enum values are valid (rarity, auctionType)

## Future Enhancements

### Phase 2
- Request retry logic with exponential backoff
- Request caching for read operations
- Optimistic UI updates
- WebSocket for real-time auction updates

### Phase 3
- Refresh token rotation
- Client-side rate limiting
- Request batching
- Request deduplication

## References

- [Design Document](../../../planing/01_perbaikan_bug/BUG-01-admin-data-sync/design.md)
- [Requirements Document](../../../planing/01_perbaikan_bug/BUG-01-admin-data-sync/requirements.md)
- [Tasks](../../../planing/01_perbaikan_bug/BUG-01-admin-data-sync/tasks.md)
- [API Documentation](../../api/README.md)

## Support

For issues or questions:
1. Check this documentation first
2. Review error logs in browser console
3. Check backend API logs
4. Contact development team

---

**Last Updated:** 2026-06-13  
**Status:** ✅ Completed  
**Version:** 1.0.0
