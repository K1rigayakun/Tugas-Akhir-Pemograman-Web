# Manual Testing Guide

## Overview

This guide provides step-by-step manual testing procedures for:
- **Task 1.3**: Admin Auctions Management Page
- **Task 2.4**: Connection Pool Monitoring

---

## Prerequisites

### Environment Setup

```bash
# 1. Ensure all services are running
cd apps/api
npm run dev  # Start API server (port 3001)

cd apps/admin
npm run dev  # Start admin panel (port 3002)

cd apps/web
npm run dev  # Start user web (port 3000)

# 2. Ensure database is accessible
psql $DATABASE_URL -c "SELECT 1"  # Should return 1

# 3. Verify environment variables
cat .env | grep DATABASE_URL
# Should show: DATABASE_URL="...?pgbouncer=true&connection_limit=3"
```

### Test Data Setup

```sql
-- Create test admin user (if not exists)
INSERT INTO "User" (id, email, username, "hashedPassword", "emailVerified", "adminRole")
VALUES (
  'test-admin-001',
  'admin@test.com',
  'testadmin',
  '$2b$10$DUMMY_HASH',  -- Replace with actual bcrypt hash
  true,
  'SUPER_ADMIN'
)
ON CONFLICT DO NOTHING;

-- Create test auctions (if table is empty)
INSERT INTO "Auction" (id, title, description, category, rarity, "auctionType", "startingPrice", "currentPrice", status, "startTime", "endTime", "createdAt", "updatedAt")
VALUES
  ('auction-001', 'Medieval Sword', 'Ancient blade from 15th century', 'Weapons', 'LEGENDARY', 'STANDARD', 5000, 5000, 'ACTIVE', NOW(), NOW() + INTERVAL '7 days', NOW(), NOW()),
  ('auction-002', 'Royal Crown', 'Gold crown with emeralds', 'Jewelry', 'TRANSCENDENT', 'LIVE', 10000, 10000, 'UPCOMING', NOW() + INTERVAL '1 day', NOW() + INTERVAL '8 days', NOW(), NOW()),
  ('auction-003', 'Ancient Scroll', 'Historical manuscript', 'Documents', 'RARE', 'STANDARD', 1000, 1200, 'ACTIVE', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', NOW(), NOW())
ON CONFLICT DO NOTHING;
```

---

## Task 1.3: Admin Auctions Management Page

### Test 1: Admin Login and Page Access

**Objective**: Verify admin can log in and access auctions page

**Steps**:
1. Open browser to `http://localhost:3002/login`
2. Enter admin credentials:
   - Email: `admin@test.com`
   - Password: `[your-test-password]`
3. Click "Login"
4. Navigate to `http://localhost:3002/auctions`

**Expected Results**:
✅ Login successful  
✅ Redirected to admin dashboard or auctions page  
✅ No 401 errors  
✅ Auctions page loads

**Verification**:
- [ ] Login form accepts credentials
- [ ] JWT token stored in cookies/localStorage
- [ ] Auctions page accessible
- [ ] No redirect to login page

---

### Test 2: Fetch and Display Auction Data

**Objective**: Verify auctions are fetched and displayed correctly

**Steps**:
1. On auctions page (`/auctions`)
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Observe page load

**Expected Console Logs**:
```
[Admin Auctions] Fetching from endpoint: /api/v1/admin/auctions
[Admin Auctions] API Response: {
  endpoint: "/api/v1/admin/auctions",
  status: 200,
  ok: true,
  dataKeys: ["data", "total", "page", "totalPages"],
  auctionCount: 3,
  firstAuction: { id: "auction-001", title: "Medieval Sword", ... }
}
[Admin Auctions] Successfully loaded 3 auctions
```

**Expected UI**:
- ✅ Auction cards displayed in grid
- ✅ Each card shows:
  - Title (e.g., "Medieval Sword")
  - Description (truncated if long)
  - Status badge (ACTIVE, UPCOMING, ENDED, etc.)
  - Rarity badge (color-coded)
  - Current price (formatted with ♛ symbol)
  - Bid count
  - Start and end times
  - Action buttons (Detail, Cancel if ACTIVE)

**Verification**:
- [ ] Console shows successful API call
- [ ] Console logs auction count
- [ ] All auction fields visible on cards
- [ ] No JavaScript errors in console

---

### Test 3: Filter Functionality

**Objective**: Verify status and type filters work

**Steps**:
1. On auctions page
2. Click "ACTIVE" status filter
3. Observe URL and displayed auctions
4. Click "ALL" to reset
5. Click "LIVE" type filter
6. Observe URL and displayed auctions

**Expected Behavior**:

**ACTIVE Filter**:
- URL changes to: `/auctions?status=ACTIVE` (not visible in UI but check Network tab)
- Console log: `[Admin Auctions] Fetching from endpoint: /api/v1/admin/auctions?status=ACTIVE`
- Only ACTIVE auctions displayed
- Filter button highlighted in gold

**LIVE Filter**:
- URL changes to include: `type=LIVE`
- Console log shows: `/api/v1/admin/auctions?type=LIVE`
- Only LIVE auctions displayed
- Filter button highlighted in emerald

**Verification**:
- [ ] Filter buttons change visual state when clicked
- [ ] API endpoint includes correct query parameters
- [ ] Auction list updates to match filter
- [ ] Multiple filters work together (e.g., ACTIVE + LIVE)

---

### Test 4: Empty Data Scenario

**Objective**: Verify empty state displays correctly

**Steps**:
1. Apply filter that returns no results (e.g., "CANCELLED")
2. Observe UI and console

**Expected Console**:
```
[Admin Auctions] API Response: {
  auctionCount: 0,
  ...
}
[Admin Auctions] Empty auction data received. Check database and API endpoint.
```

**Expected UI**:
- Empty state message: "Tidak ada lelang yang ditemukan untuk status CANCELLED."
- Message displayed in center of grid area
- No auction cards shown

**Verification**:
- [ ] Console warning logged
- [ ] Empty state message displayed
- [ ] No loading spinner stuck
- [ ] Page remains functional (filters still work)

---

### Test 5: 401 Unauthorized Handling

**Objective**: Verify automatic redirect on expired session

**Steps**:
1. Open Browser DevTools → Application → Storage
2. Delete authentication tokens:
   - Cookies: `accessToken`, `refreshToken`
   - LocalStorage: `accessToken`, `refreshToken`, `user`
3. Try to navigate to `/auctions` or refresh page

**Expected Behavior**:
- Automatic redirect to `/login`
- URL changes from `http://localhost:3002/auctions` to `http://localhost:3002/login`
- No error message shown to user
- Console may show: "Unauthorized" or 401 error (acceptable)

**Verification**:
- [ ] Redirect occurs immediately (< 1 second)
- [ ] User ends up on login page
- [ ] No error modal/alert shown
- [ ] User can log in again normally

---

### Test 6: Create Auction Modal

**Objective**: Verify auction creation works

**Steps**:
1. Click "+ Buat Lelang Baru" button
2. Fill in form:
   - Judul: "Test Auction"
   - Deskripsi: "Test description"
   - Kategori: "Art"
   - Rarity: "RARE"
   - Tipe Lelang: "STANDARD"
   - Harga Awal: "1000"
   - Waktu Mulai: [Select future date/time]
   - Waktu Selesai: [Select date after start]
3. Click "Buat Lelang"

**Expected Behavior**:
- Modal appears with form
- All fields editable
- "Buat Lelang" button submits form
- Loading state shows "Menyimpan..."
- On success: Modal closes, auction list refreshes
- New auction appears in list

**Verification**:
- [ ] Modal displays without errors
- [ ] Form validation works (required fields)
- [ ] Submit creates auction
- [ ] List refreshes automatically
- [ ] New auction visible with correct data

---

### Test 7: Cancel Auction

**Objective**: Verify auction cancellation works

**Steps**:
1. Find an ACTIVE auction
2. Click "Batalkan" button
3. Enter cancellation reason: "Test cancellation"
4. Click "Konfirmasi Batalkan"

**Expected Behavior**:
- Cancel modal appears
- Reason textarea required
- Confirmation button enabled after reason entered
- On confirm: Modal closes, auction status changes to CANCELLED
- Auction list refreshes

**Verification**:
- [ ] Cancel modal displays
- [ ] Reason input required (empty reason rejected)
- [ ] Cancellation succeeds
- [ ] Status badge changes to CANCELLED
- [ ] Auction no longer shows "Batalkan" button

---

### Test 8: Network Error Handling

**Objective**: Verify graceful error handling

**Steps**:
1. Stop API server: `Ctrl+C` in `apps/api` terminal
2. Try to refresh auctions page or apply filter
3. Observe behavior

**Expected Behavior**:
- Loading spinner shows
- After timeout, error logged to console
- UI shows empty state or error message
- No white screen of death
- Page remains responsive

**Restart API and test recovery**:
4. Start API server again: `npm run dev`
5. Click "Refresh" or reload page
6. Auctions should load normally

**Verification**:
- [ ] Network errors handled gracefully
- [ ] No unhandled promise rejections
- [ ] User can retry after network recovers
- [ ] UI doesn't break permanently

---

## Task 2.4: Connection Pool Monitoring

### Test 1: Verify Pool Configuration

**Objective**: Confirm connection pool settings are correct

**Steps**:
```bash
# 1. Check DATABASE_URL
cat .env | grep DATABASE_URL

# 2. Should show:
# DATABASE_URL="postgresql://user:pass@host:port/db?pgbouncer=true&connection_limit=3"

# 3. Check Prisma client config
cat packages/db/src/client.ts
```

**Expected in client.ts**:
```typescript
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,  // includes ?pgbouncer=true&connection_limit=3
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});
```

**Verification**:
- [ ] DATABASE_URL contains `pgbouncer=true`
- [ ] DATABASE_URL contains `connection_limit=3`
- [ ] Prisma Client configured correctly
- [ ] Logging enabled

---

### Test 2: Run Unit Tests

**Objective**: Execute connection pool unit tests

**Steps**:
```bash
cd apps/api

# Run connection pool tests
npm test -- prisma-pool.spec.ts

# Or run all tests
npm test
```

**Expected Output**:
```
PASS  src/common/database/prisma-pool.spec.ts
  Prisma Connection Pool
    Connection Pool Size (Requirement 2.1)
      ✓ should limit active connections to 3 (1025ms)
      ✓ should queue requests when pool is at capacity (428ms)
      ✓ should not reject requests when pool is full (234ms)
    Connection Timeout (Requirement 2.4)
      ○ skipped should release idle connections after timeout period
      ✓ should reconnect after idle timeout (152ms)
    Retry Logic (Requirement 2.8)
      ✓ should retry failed operations with exponential backoff (312ms)
      ✓ should fail after max retries exceeded (315ms)
      ✓ should use correct exponential backoff sequence (420ms)
      ✓ should succeed on first attempt if operation works (5ms)
    Transaction Connection Reuse (Requirement 2.7)
      ✓ should reuse single connection within transaction (89ms)
      ✓ should release connection after transaction completes (201ms)
    Connection Pool Metrics (Requirement 2.10)
      ✓ should track connection usage (12ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 1 skipped, 11 total
```

**Verification**:
- [ ] All tests pass (except skipped timeout test)
- [ ] No test failures
- [ ] Exponential backoff timing correct
- [ ] Transaction tests pass

---

### Test 3: Run Integration Tests

**Objective**: Execute E2E connection pool tests

**Steps**:
```bash
cd apps/api

# Run E2E tests
npm run test:e2e -- connection-pool.e2e-spec.ts
```

**Expected Output**:
```
PASS  test/connection-pool.e2e-spec.ts
  Connection Pool Integration (E2E)
    Concurrent Read Requests
      ✓ should handle 20 concurrent wallet balance requests (524ms)
      ✓ should handle 50 concurrent auction list requests (1089ms)
    Mixed Operations
      ✓ should handle concurrent reads and writes (845ms)
    Transaction Load
      ✓ should handle multiple concurrent transactions (1234ms)
    Sustained Load
      ✓ should remain stable under 2-second sustained load (2156ms)
    Connection Recovery
      ✓ should recover after temporary connection spike (678ms)
    Query Timeout
      ✓ should timeout long-running queries gracefully (89ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
```

**Verification**:
- [ ] All E2E tests pass
- [ ] No connection pool exhaustion errors
- [ ] Success rate > 90% under load
- [ ] System recovers after spike

---

### Test 4: Monitor Connection Metrics (Manual)

**Objective**: Observe connection pool behavior in running app

**Steps**:
1. Start API server with logging:
```bash
cd apps/api
npm run dev
```

2. Look for metrics logs (every 60 seconds):
```
[Prisma] Connection pool metrics: {
  active: 2,
  idle: 1,
  queueDepth: 0
}
```

3. Generate load while monitoring:
```bash
# In another terminal
for i in {1..20}; do
  curl -X GET http://localhost:3001/api/v1/auctions &
done
wait
```

4. Observe metrics immediately after load

**Expected Behavior**:
- Active connections increase during load
- Active connections ≤ 3 at all times
- Idle connections increase after load completes
- Queue depth increases briefly under heavy load
- No errors in logs

**Verification**:
- [ ] Metrics logged every 60 seconds
- [ ] active + idle ≤ 3 always
- [ ] Queue depth handles overflow gracefully
- [ ] Connections release after queries complete

---

### Test 5: Load Testing with Artillery

**Objective**: Verify pool behavior under sustained load

**Installation**:
```bash
npm install -g artillery
```

**Create load test config** (`load-test.yml`):
```yaml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      name: "Sustained load"
    - duration: 60
      arrivalRate: 20
      name: "Peak load"
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "Auction browsing"
    flow:
      - get:
          url: '/api/v1/auctions'
      - think: 2
      - get:
          url: '/api/v1/auctions/{{ $randomString() }}'
          
  - name: "Wallet balance"
    weight: 30
    flow:
      - get:
          url: '/api/v1/wallet/balance'
          headers:
            Authorization: 'Bearer YOUR_TEST_TOKEN'
```

**Run load test**:
```bash
artillery run load-test.yml
```

**Expected Output**:
```
Summary report @ 15:45:23
  Scenarios launched:  1800
  Scenarios completed: 1785
  Requests completed:  3570
  Mean response/sec: 14.88
  Response time (msec):
    min: 23
    max: 1245
    median: 89
    p95: 245
    p99: 567
  Codes:
    200: 3420
    404: 135
    500: 15
```

**Success Criteria**:
- ✅ Response time p95 < 500ms
- ✅ Success rate > 95% (< 5% errors)
- ✅ No connection pool exhaustion errors
- ✅ Server remains responsive throughout

**Verification**:
- [ ] Load test completes without crashes
- [ ] Response times acceptable (p95 < 500ms)
- [ ] Error rate low (< 5%)
- [ ] No connection pool warnings in logs

---

### Test 6: Concurrent Transaction Load

**Objective**: Verify transactions don't exhaust pool

**Steps**:
1. Create test script (`test-transactions.js`):
```javascript
const axios = require('axios');

async function createPayment(token) {
  try {
    const res = await axios.post('http://localhost:3001/api/v1/payment/initiate', {
      amount: 100,
      fiatAmount: 15000,
      method: 'TESTING'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.status;
  } catch (err) {
    return err.response?.status || 500;
  }
}

async function main() {
  const token = 'YOUR_TEST_TOKEN';
  
  console.log('Starting concurrent transaction test...');
  
  // Create 10 concurrent payment requests
  const promises = Array(10).fill(null).map(() => createPayment(token));
  
  const results = await Promise.all(promises);
  
  const success = results.filter(s => s < 400).length;
  const clientErr = results.filter(s => s >= 400 && s < 500).length;
  const serverErr = results.filter(s => s >= 500).length;
  
  console.log({
    total: results.length,
    success,
    clientErr,
    serverErr,
    successRate: `${(success / results.length * 100).toFixed(1)}%`
  });
}

main();
```

2. Run script:
```bash
node test-transactions.js
```

**Expected Output**:
```
Starting concurrent transaction test...
{
  total: 10,
  success: 9,
  clientErr: 1,
  serverErr: 0,
  successRate: '90.0%'
}
```

**Verification**:
- [ ] Most transactions succeed
- [ ] No server errors (500)
- [ ] Success rate > 80%
- [ ] No connection pool exhaustion

---

## Test Results Documentation

### Test Summary Template

Copy and fill out after completing tests:

```markdown
## Manual Testing Results

**Date**: [YYYY-MM-DD]
**Tester**: [Your Name]
**Environment**: [Dev/Staging/Local]

### Task 1.3: Admin Auctions Page

| Test | Status | Notes |
|------|--------|-------|
| Login and access | ✅/❌ | |
| Fetch and display data | ✅/❌ | |
| Filter functionality | ✅/❌ | |
| Empty state | ✅/❌ | |
| 401 handling | ✅/❌ | |
| Create auction | ✅/❌ | |
| Cancel auction | ✅/❌ | |
| Network errors | ✅/❌ | |

**Overall**: ✅ PASS / ❌ FAIL

**Issues Found**: [List any issues]

### Task 2.4: Connection Pool

| Test | Status | Notes |
|------|--------|-------|
| Pool configuration | ✅/❌ | |
| Unit tests | ✅/❌ | X passed, Y failed |
| Integration tests | ✅/❌ | X passed, Y failed |
| Metrics monitoring | ✅/❌ | |
| Artillery load test | ✅/❌ | P95: Xms, Success: Y% |
| Transaction load | ✅/❌ | |

**Overall**: ✅ PASS / ❌ FAIL

**Performance Metrics**:
- Connection pool size: [observed max]
- Load test p95: [ms]
- Success rate under load: [%]

**Issues Found**: [List any issues]
```

---

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot connect to database"
**Solution**:
```bash
# Check database is running
psql $DATABASE_URL -c "SELECT 1"

# Restart database if needed
# (depends on your setup - Docker, local PostgreSQL, etc.)
```

**Issue**: Artillery not found
**Solution**:
```bash
npm install -g artillery
# or use npx
npx artillery run load-test.yml
```

**Issue**: Admin login fails
**Solution**:
```sql
-- Verify admin user exists
SELECT email, "adminRole" FROM "User" WHERE email = 'admin@test.com';

-- Should show adminRole = 'SUPER_ADMIN'
```

**Issue**: Connection pool tests timeout
**Solution**:
- Increase Jest timeout in test file
- Reduce load size for slower machines
- Check database connection latency

---

## Next Steps After Testing

1. Document all test results in template above
2. File bug reports for any issues found
3. Update test cases if new scenarios discovered
4. Share results with team for review
5. Mark tasks as verified in tasks.md

---

**Guide Version**: 1.0  
**Last Updated**: 2024  
**Tasks Covered**: 1.3, 2.4
