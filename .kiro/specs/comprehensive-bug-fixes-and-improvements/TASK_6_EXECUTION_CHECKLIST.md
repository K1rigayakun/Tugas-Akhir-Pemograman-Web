# Task 6: Execution Checklist - Quick Start Guide

**Date**: June 14, 2026  
**Tester**: [Your Name]  
**Environment**: Local Development  

---

## Pre-Flight Checklist

### ✅ Step 1: Environment Check

```bash
# Check PostgreSQL is running
psql --version
# Expected: PostgreSQL 14.x or later

# Check Node.js version
node --version
# Expected: v18.x or later

# Check all dependencies installed
cd m:\Download\Tugas-Akhir-Pemograman-Web-main\Tugas-Akhir-Pemograman-Web-main
npm install
```

**Status**: ⬜ Environment Ready

---

### ✅ Step 2: Database Backup

**IMPORTANT**: Backup database sebelum testing!

```bash
# Create backup directory
mkdir -p backups

# Backup database
pg_dump $DATABASE_URL > backups/emerald_kingdom_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup created
ls -lh backups/
```

**Backup File**: `_______________________________`  
**Backup Size**: `_______________________________`  
**Status**: ⬜ Database Backed Up

---

### ✅ Step 3: Check Database Connection

```bash
# Test connection
psql $DATABASE_URL -c "SELECT COUNT(*) as user_count FROM \"User\";"
psql $DATABASE_URL -c "SELECT COUNT(*) as auction_count FROM \"Auction\";"
psql $DATABASE_URL -c "SELECT COUNT(*) as wallet_count FROM \"WalletAccount\";"
```

**Results**:
- Users: `_______`
- Auctions: `_______`
- Wallets: `_______`

**Status**: ⬜ Database Connected

---

### ✅ Step 4: Start All Services

Open 3 separate terminal windows:

**Terminal 1: API Server**
```bash
cd apps/api
npm run dev
# Wait for: "Application is running on: http://localhost:3001"
```
**Status**: ⬜ API Running on Port 3001

**Terminal 2: Admin App**
```bash
cd apps/admin
npm run dev
# Wait for: "Local: http://localhost:3002"
```
**Status**: ⬜ Admin Running on Port 3002

**Terminal 3: Web App**
```bash
cd apps/web
npm run dev
# Wait for: "Local: http://localhost:3000"
```
**Status**: ⬜ Web Running on Port 3000

---

## 🧪 Checkpoint 1: Admin Authentication (15 minutes)

### Test 1.1: Admin Login

1. **Navigate**: http://localhost:3002/login
2. **Enter Credentials**:
   - Email: `admin@test.com` (or your admin email)
   - Password: `[your-password]`
3. **Click**: "Login"
4. **Observe**: Should redirect to dashboard/auctions within 500ms

**✅ PASS Criteria**:
- ⬜ Login successful
- ⬜ Token stored (check DevTools → Application → Cookies/LocalStorage)
- ⬜ Redirected to dashboard
- ⬜ No 401 errors in console

**❌ FAIL Actions**:
- Check credentials in database
- Verify API server running
- Check console for errors

**Result**: ⬜ PASS / ⬜ FAIL  
**Notes**: `_______________________________`

---

### Test 1.2: Auction Data Display

1. **Navigate**: http://localhost:3002/auctions (after login)
2. **Open**: DevTools → Console (F12)
3. **Look for logs**:
   ```
   [Admin Auctions] Fetching from endpoint: /api/v1/admin/auctions
   [Admin Auctions] API Response: { status: 200, auctionCount: X }
   ```

**✅ PASS Criteria**:
- ⬜ Console logs visible
- ⬜ Auction cards displayed
- ⬜ All fields visible (title, price, status, times)
- ⬜ No JavaScript errors
- ⬜ Status badges color-coded

**Current Auction Count**: `_______`

**Result**: ⬜ PASS / ⬜ FAIL  
**Notes**: `_______________________________`

---

### Test 1.3: Data Synchronization

**Quick Test**: Create test auction via API

```bash
curl -X POST http://localhost:3001/api/v1/admin/auctions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Checkpoint Test Auction",
    "description": "Created for Task 6 verification",
    "category": "Test",
    "rarity": "COMMON",
    "auctionType": "STANDARD",
    "startingPrice": 100,
    "startTime": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "endTime": "'$(date -u -d "+7 days" +"%Y-%m-%dT%H:%M:%SZ")'"
  }'
```

**Then**: Refresh admin auctions page → verify new auction appears

**Result**: ⬜ PASS / ⬜ FAIL  
**Notes**: `_______________________________`

---

**Checkpoint 1 Summary**: ⬜ PASS / ⬜ FAIL

---

## 🔌 Checkpoint 2: Connection Pool (30 minutes)

### Test 2.1: Pool Configuration Check

```bash
# Check DATABASE_URL
echo $DATABASE_URL | grep -E "pgbouncer=true|connection_limit=3"

# Check API logs for pool initialization
cd apps/api
npm run dev | grep -i "connection"
```

**✅ PASS Criteria**:
- ⬜ DATABASE_URL contains `pgbouncer=true`
- ⬜ DATABASE_URL contains `connection_limit=3`
- ⬜ No connection errors in startup logs

**Result**: ⬜ PASS / ⬜ FAIL  
**Notes**: `_______________________________`

---

### Test 2.2: Concurrent Load Test (Windows PowerShell)

**Save as**: `test-concurrent-load.ps1`

```powershell
# Test 20 concurrent requests
$jobs = 1..20 | ForEach-Object {
    Start-Job -ScriptBlock {
        Invoke-WebRequest -Uri "http://localhost:3001/api/v1/auctions" -UseBasicParsing
    }
}

# Wait for all to complete
$jobs | Wait-Job

# Check results
$results = $jobs | Receive-Job
$success = ($results | Where-Object { $_.StatusCode -eq 200 }).Count
$errors = ($results | Where-Object { $_.StatusCode -ne 200 }).Count

Write-Host "Success: $success / 20"
Write-Host "Errors: $errors / 20"

# Cleanup
$jobs | Remove-Job
```

**Execute**:
```bash
powershell -ExecutionPolicy Bypass -File test-concurrent-load.ps1
```

**✅ PASS Criteria**:
- ⬜ Success rate > 90% (18+/20)
- ⬜ No 500 errors
- ⬜ No "connection pool exhausted" in API logs
- ⬜ All requests complete in < 5 seconds

**Result**: Success `___/20`, Errors `___/20`  
**Status**: ⬜ PASS / ⬜ FAIL

---

### Test 2.3: Transaction Atomicity

**Create payment and approve atomically**:

1. **As User**: Create TESTING payment
   ```bash
   curl -X POST http://localhost:3001/api/v1/payment/initiate \
     -H "Authorization: Bearer USER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"amount":100,"fiatAmount":15000,"method":"TESTING"}'
   ```
   **Request ID**: `_______________________________`

2. **Complete testing payment** via UI (click "Bayar Test")

3. **As Admin**: Approve payment
   ```bash
   curl -X POST http://localhost:3001/api/v1/payment/admin/REQUEST_ID/approve \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

4. **Verify atomicity**:
   ```sql
   SELECT 
     tr.id, tr.status, tr.amount,
     wa.balance, wt.amount as tx_amount
   FROM "TopUpRequest" tr
   JOIN "User" u ON tr."userId" = u.id
   JOIN "WalletAccount" wa ON wa."userId" = u.id
   LEFT JOIN "WalletTransaction" wt ON wt."referenceId" = tr.id::text
   WHERE tr.id = 'REQUEST_ID';
   ```

**✅ PASS Criteria**:
- ⬜ TopUpRequest status = APPROVED
- ⬜ WalletTransaction created
- ⬜ Balance increased by 100
- ⬜ All updates atomic (no partial)

**Result**: ⬜ PASS / ⬜ FAIL  
**Notes**: `_______________________________`

---

**Checkpoint 2 Summary**: ⬜ PASS / ⬜ FAIL

---

## 💰 Checkpoint 3: Wallet Display (20 minutes)

### Test 3.1: Balance Display Format

1. **Login as user**: http://localhost:3000
2. **Check wallet display** in header/navbar
3. **Verify format**: Should show "X,XXX CC" with thousand separator

**Test Cases**:

| DB Balance | Expected Display | Actual Display | Status |
|------------|------------------|----------------|--------|
| 1500 | 1,500 CC | _____________ | ⬜ |
| 0 | 0 CC | _____________ | ⬜ |
| 100000 | 100,000 CC | _____________ | ⬜ |

**Test Zero Balance**:
```sql
UPDATE "WalletAccount" 
SET balance = 0 
WHERE "userId" = 'YOUR_USER_ID';
```
Refresh page → should show "0 CC"

**✅ PASS Criteria**:
- ⬜ Thousand separators present
- ⬜ "CC" suffix displayed
- ⬜ Zero shows "0 CC" (not empty)

**Result**: ⬜ PASS / ⬜ FAIL

---

### Test 3.2: Balance Accuracy

**Verify balance matches database**:

```sql
SELECT 
  u.username,
  wa.balance as displayed_balance,
  (
    SELECT COALESCE(SUM(
      CASE 
        WHEN wt.type IN ('TOP_UP', 'BID_RELEASE', 'REFUND') THEN wt.amount
        WHEN wt.type IN ('BID_DEDUCT', 'SHOP_PURCHASE') THEN -wt.amount
        ELSE 0
      END
    ), 0)
    FROM "WalletTransaction" wt 
    WHERE wt."walletId" = wa.id
  ) as calculated_balance
FROM "User" u
JOIN "WalletAccount" wa ON wa."userId" = u.id
WHERE u.email = 'YOUR_EMAIL';
```

**✅ PASS Criteria**:
- ⬜ UI balance = database balance
- ⬜ Database balance = sum of transactions

**Displayed Balance**: `_______`  
**Database Balance**: `_______`  
**Calculated Balance**: `_______`

**Result**: ⬜ PASS / ⬜ FAIL

---

### Test 3.3: Real-Time Updates

**Test Procedure**:
1. **User**: Open web app, note current balance
2. **Admin**: Approve a pending top-up for this user
3. **Observer**: Watch user's browser (DON'T refresh manually)
4. **Measure**: Time until balance updates automatically

**Initial Balance**: `_______`  
**Top-Up Amount**: `_______`  
**Expected New Balance**: `_______`  
**Time to Update**: `_______ seconds`

**✅ PASS Criteria**:
- ⬜ Balance updates automatically (no manual refresh)
- ⬜ Update occurs < 2 seconds
- ⬜ New balance correct

**Result**: ⬜ PASS / ⬜ FAIL

---

### Test 3.4: BID_HOLD/BID_RELEASE Bug Fix

**Verify bug fix: BID_HOLD and BID_RELEASE return 0**

```sql
-- Get initial balance
SELECT balance FROM "WalletAccount" WHERE "userId" = 'YOUR_USER_ID';
```
**Initial**: `_______`

**Place a bid** (via UI or API) → creates BID_HOLD transaction

```sql
-- Check balance after BID_HOLD
SELECT balance FROM "WalletAccount" WHERE "userId" = 'YOUR_USER_ID';
```
**After BID_HOLD**: `_______`

**Cancel or lose bid** → creates BID_RELEASE transaction

```sql
-- Check balance after BID_RELEASE
SELECT balance FROM "WalletAccount" WHERE "userId" = 'YOUR_USER_ID';
```
**After BID_RELEASE**: `_______`

**✅ PASS Criteria**:
- ⬜ Balance unchanged after BID_HOLD
- ⬜ Balance unchanged after BID_RELEASE
- ⬜ Both transactions recorded (check WalletTransaction table)
- ⬜ pendingHold field updated correctly

**Result**: ⬜ PASS / ⬜ FAIL  
**Notes**: `_______________________________`

---

**Checkpoint 3 Summary**: ⬜ PASS / ⬜ FAIL

---

## 💳 Checkpoint 4: Payment Flow (45 minutes)

### Test 4.1: Complete TESTING Payment Flow

**Step 1: Create Payment**
1. Navigate: http://localhost:3000/topup
2. Verify packages: ⬜ 50 CC ⬜ 100 CC ⬜ 500 CC ⬜ 1000 CC
3. Select: 100 CC package
4. Select: TESTING payment method
5. Click: Submit

**Request Created**: ⬜ YES / ⬜ NO  
**Request ID**: `_______________________________`  
**Status**: `_______________________________`

---

**Step 2: Complete Test Payment**
1. Click: "Bayar Test" button
2. Verify status changes to PAID

**Status After**: `_______________________________`  
**Result**: ⬜ PASS / ⬜ FAIL

---

**Step 3: Admin View Pending**
1. Navigate: http://localhost:3002/topups/pending
2. Verify request appears in list

**Request Visible**: ⬜ YES / ⬜ NO  
**Amount Correct**: ⬜ YES (100 CC)  
**Method Shows**: `_______________________________`

---

**Step 4: Admin Approve**
1. Click: "Approve" button
2. Wait for success message

**Approval Time**: `_______ ms`  
**Success Message**: ⬜ YES / ⬜ NO

---

**Step 5: User Balance Update**
1. Switch to user browser
2. Wait (don't refresh manually)
3. Observe balance increase

**Previous Balance**: `_______`  
**New Balance**: `_______` (should be +100)  
**Update Time**: `_______ seconds`

**✅ PASS Criteria**:
- ⬜ All 5 steps successful
- ⬜ Balance updated < 2 seconds
- ⬜ Amount correct (+100 CC)

**Result**: ⬜ PASS / ⬜ FAIL

---

### Test 4.2: QRIS UI

1. Navigate: http://localhost:3000/topup
2. Select: 500 CC
3. Select: QRIS method
4. Submit

**Check UI Elements**:
- ⬜ QR code image displayed
- ⬜ Zoom button works (click → full screen)
- ⬜ Download button present
- ⬜ 15-minute countdown timer visible
- ⬜ Instructions clear
- ⬜ Status polling active (check Network tab)

**Result**: ⬜ PASS / ⬜ FAIL

---

### Test 4.3: Virtual Account UI

1. Navigate: http://localhost:3000/topup
2. Select: 1000 CC
3. Select: Virtual Account → BCA
4. Submit

**Check UI Elements**:
- ⬜ 16-digit VA number displayed: `________________`
- ⬜ Copy button works (toast notification)
- ⬜ Bank-specific instructions (5 steps for BCA)
- ⬜ Important notice about exact amount
- ⬜ Countdown timer (24 hours)

**Test Other Banks**:
- ⬜ BNI - Shows BNI Mobile Banking instructions
- ⬜ Mandiri - Shows Mandiri instructions
- ⬜ BRI - Shows BRI instructions
- ⬜ Permata - Shows Permata instructions

**Result**: ⬜ PASS / ⬜ FAIL

---

### Test 4.4: Payment Expiration

**Force expiration**:
```sql
-- Find recent pending request
SELECT id, "expiresAt" FROM "TopUpRequest" 
WHERE status = 'PENDING' 
ORDER BY "createdAt" DESC LIMIT 1;

-- Force expiration
UPDATE "TopUpRequest" 
SET "expiresAt" = NOW() - INTERVAL '1 hour'
WHERE id = 'YOUR_REQUEST_ID';
```

**Refresh payment page** → Observe

**✅ PASS Criteria**:
- ⬜ Status shows EXPIRED
- ⬜ Badge shows "Kadaluarsa" (gray)
- ⬜ Message: "Waktu pembayaran telah habis"
- ⬜ "Coba Lagi" button visible
- ⬜ Progress bar at 0%

**Click "Coba Lagi"**:
- ⬜ Redirects to package selection
- ⬜ Can create new payment
- ⬜ New payment has different ID

**Result**: ⬜ PASS / ⬜ FAIL

---

### Test 4.5: Admin Approval API

**Create 3 test payments**:
```bash
for i in {1..3}; do
  curl -X POST http://localhost:3001/api/v1/payment/initiate \
    -H "Authorization: Bearer USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"amount":100,"fiatAmount":15000,"method":"TESTING"}'
  sleep 1
done
```

**Complete all 3** (click "Bayar Test" for each)

**Admin fetch pending**:
```bash
curl -X GET "http://localhost:3001/api/v1/payment/admin/list?status=PENDING" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**✅ PASS Criteria**:
- ⬜ Returns 3 requests
- ⬜ All have status PENDING
- ⬜ User info included
- ⬜ Amounts correct

**Approve first one**:
```bash
curl -X POST "http://localhost:3001/api/v1/payment/admin/REQUEST_ID/approve" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response Time**: `_______ ms`  
**Response**: ⬜ `{"success": true}`

**Verify**:
- ⬜ Status = APPROVED
- ⬜ Balance increased
- ⬜ Transaction created

**Result**: ⬜ PASS / ⬜ FAIL

---

**Checkpoint 4 Summary**: ⬜ PASS / ⬜ FAIL

---

## 🚪 Checkpoint 5: User Logout (15 minutes)

### Test 5.1: Logout Flow

**Before Logout - Check Storage**:
1. Open: DevTools → Application → Storage
2. Document tokens present:
   - ⬜ Cookies: `accessToken` present
   - ⬜ LocalStorage: `accessToken` present
   - ⬜ LocalStorage: `refreshToken` present
   - ⬜ LocalStorage: `cachedBalance` present

**Perform Logout**:
1. Click: Logout button
2. Observe: Loading state shows "Logging out..."
3. Time the operation

**Logout Time**: `_______ ms` (should be < 1000ms)

**After Logout - Check Storage**:
- ⬜ All tokens cleared from cookies
- ⬜ All tokens cleared from localStorage
- ⬜ cachedBalance cleared
- ⬜ userProfile cleared (if exists)
- ⬜ sessionStorage cleared

**✅ PASS Criteria**:
- ⬜ All storage cleared
- ⬜ Redirected to homepage (/)
- ⬜ Logout time < 1 second
- ⬜ No errors in console

**Result**: ⬜ PASS / ⬜ FAIL

---

### Test 5.2: Session Invalidation

**Get session before logout**:
```sql
SELECT id, "isActive", "refreshTokenHash" 
FROM "Session" 
WHERE "userId" = 'YOUR_USER_ID' 
ORDER BY "createdAt" DESC 
LIMIT 1;
```

**Session ID**: `_______________________________`  
**Before - isActive**: `_______`  
**Before - refreshTokenHash**: `_______ (not null)`

**Perform logout via UI**

**Check session after logout**:
```sql
SELECT id, "isActive", "refreshTokenHash" 
FROM "Session" 
WHERE id = 'SESSION_ID';
```

**After - isActive**: `_______` (should be false)  
**After - refreshTokenHash**: `_______` (should be null)

**✅ PASS Criteria**:
- ⬜ isActive = false
- ⬜ refreshTokenHash = null

**Result**: ⬜ PASS / ⬜ FAIL

---

### Test 5.3: Token Rejection After Logout

**Try to use old token**:
```bash
# Save token before logout
OLD_TOKEN="your-token-here"

# After logout, try to access protected endpoint
curl -X GET http://localhost:3001/api/v1/wallet/balance \
  -H "Authorization: Bearer $OLD_TOKEN"
```

**Expected Response**: 401 Unauthorized

**Response Code**: `_______`  
**Response Body**: `_______________________________`

**✅ PASS Criteria**:
- ⬜ Returns 401 status
- ⬜ Old token rejected

**Result**: ⬜ PASS / ⬜ FAIL

---

### Test 5.4: Graceful Error Handling

**Stop API server** (Ctrl+C in API terminal)

**Perform logout** (API is down)

**✅ PASS Criteria**:
- ⬜ Tokens still cleared locally
- ⬜ User still redirected to homepage
- ⬜ No blocking error modal
- ⬜ Error logged to console (acceptable)

**Restart API** → **Login again** → Should work normally

**Result**: ⬜ PASS / ⬜ FAIL

---

**Checkpoint 5 Summary**: ⬜ PASS / ⬜ FAIL

---

## 📊 Performance Verification

### Response Time Targets

Open: DevTools → Network tab → Clear log before each test

| Endpoint | Target (p95) | Actual | Status |
|----------|--------------|--------|--------|
| POST /auth/login | < 500ms | ____ms | ⬜ |
| GET /wallet/balance | < 200ms | ____ms | ⬜ |
| POST /payment/initiate | < 1000ms | ____ms | ⬜ |
| POST /payment/admin/:id/approve | < 1500ms | ____ms | ⬜ |
| GET /admin/auctions | < 500ms | ____ms | ⬜ |

**Overall Performance**: ⬜ PASS / ⬜ FAIL

---

### Connection Pool Utilization

**Check API logs** during concurrent testing:

Look for:
```
[Prisma] Connection pool metrics: {
  active: X,
  idle: Y,
  queueDepth: Z
}
```

**Under Normal Load** (< 10 concurrent requests):
- Active: `_______` (expected: 1-2)
- Idle: `_______` (expected: 1-2)
- Queue Depth: `_______` (expected: 0)
- **Utilization**: `________%` (should be < 80%)

**Under Heavy Load** (20+ concurrent requests):
- Active: `_______` (expected: 2-3)
- Idle: `_______` (expected: 0-1)
- Queue Depth: `_______` (expected: 0-5, transient)
- **Utilization**: `________%` (should be < 100%)

**✅ PASS Criteria**:
- ⬜ Normal load < 80% utilization
- ⬜ No queue buildup under normal load
- ⬜ Queue clears after spike

**Result**: ⬜ PASS / ⬜ FAIL

---

## 🎯 Final Summary

### Checkpoint Results

| Checkpoint | Tests | Passed | Failed | Status |
|------------|-------|--------|--------|--------|
| 1. Admin Auth | 3 | ____ | ____ | ⬜ PASS / ⬜ FAIL |
| 2. Connection Pool | 3 | ____ | ____ | ⬜ PASS / ⬜ FAIL |
| 3. Wallet Display | 4 | ____ | ____ | ⬜ PASS / ⬜ FAIL |
| 4. Payment Flow | 5 | ____ | ____ | ⬜ PASS / ⬜ FAIL |
| 5. Logout | 4 | ____ | ____ | ⬜ PASS / ⬜ FAIL |
| 6. Performance | 2 | ____ | ____ | ⬜ PASS / ⬜ FAIL |
| **TOTAL** | **21** | **____** | **____** | **____** |

---

### Critical Issues Found

**List any failures or blockers**:

1. `_______________________________________________________`
2. `_______________________________________________________`
3. `_______________________________________________________`

**Priority**: ⬜ CRITICAL / ⬜ HIGH / ⬜ MEDIUM / ⬜ LOW / ⬜ NONE

---

### Overall Assessment

**Task 6 Status**: ⬜ COMPLETE / ⬜ INCOMPLETE

**Ready for Production**: ⬜ YES / ⬜ NO / ⬜ WITH FIXES

**Recommendation**: `_______________________________________________________`

---

### Sign-Off

**Tested By**: `_______________________________`  
**Date**: June 14, 2026  
**Time Spent**: `_______ hours`  
**Environment**: Local Development

**Signature**: ✅ ⬜

---

## 📝 Next Steps

### If All Tests Pass ✅

1. ✅ Mark Task 6 as COMPLETE
2. ✅ Update tasks.md status
3. ✅ Mark spec as COMPLETE
4. 🚀 Prepare for staging deployment

### If Issues Found ❌

1. 📋 Document all issues in detail
2. 🔧 Fix critical blockers
3. ♻️ Re-run affected checkpoints
4. ✅ Sign-off when all pass

---

## 🚀 Staging Deployment Checklist

**After Task 6 passes**:

### Pre-Deployment
- [ ] Database backup created
- [ ] .env.staging configured
- [ ] Migrations ready
- [ ] Rollback plan documented

### Staging Tests
- [ ] Deploy to staging environment
- [ ] Smoke test all 5 checkpoints
- [ ] Load test connection pool
- [ ] Test with real Midtrans sandbox
- [ ] Monitor logs for 1 hour

### Production Go/No-Go
- [ ] All staging tests pass
- [ ] Performance acceptable
- [ ] No critical errors
- [ ] Team trained on changes
- [ ] Monitoring dashboards ready

**Go Live**: ⬜ APPROVED / ⬜ DELAYED

---

**END OF CHECKLIST**

