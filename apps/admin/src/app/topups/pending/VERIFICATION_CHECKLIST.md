# Task 4.5 Verification Checklist

## Implementation Verification for Admin Pending Top-Ups Page

**Task**: 4.5 - Create Admin Pending Top-Ups Page  
**Requirement**: 4.6  
**File**: `apps/admin/src/app/topups/pending/page.tsx`

---

## Pre-Verification Setup

### Environment Setup
- [ ] API server is running on `http://localhost:3001`
- [ ] Admin panel is running on `http://localhost:3002`
- [ ] Database contains test data with pending TopUpRequest records
- [ ] Admin user account exists with valid `adminRole` field
- [ ] Test user accounts exist for creating top-up requests

### Test Data Setup

Create test top-up requests using the user panel or API:

```bash
# Example: Create a pending top-up request via API
curl -X POST http://localhost:3001/api/v1/payment/initiate \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "fiatAmount": 150000,
    "method": "TESTING"
  }'
```

Ensure you have at least:
- [ ] 1 pending request with method "TESTING"
- [ ] 1 pending request with method "VA" and bank "BCA"
- [ ] 1 pending request with method "QRIS"

---

## Functional Verification

### 1. Page Access and Authentication

#### 1.1 Unauthenticated Access
- [ ] Navigate to `http://localhost:3002/topups/pending` without being logged in
- [ ] **Expected**: Redirect to `/login` page
- [ ] **Actual**: ___________

#### 1.2 Authenticated Admin Access
- [ ] Log in as admin user
- [ ] Navigate to `http://localhost:3002/topups/pending`
- [ ] **Expected**: Page loads successfully, no errors in console
- [ ] **Actual**: ___________

#### 1.3 Non-Admin User Access
- [ ] Log in as regular user (no `adminRole`)
- [ ] Navigate to `http://localhost:3002/topups/pending`
- [ ] **Expected**: API returns 403 Forbidden or 401 Unauthorized
- [ ] **Actual**: ___________

---

### 2. Page Layout and UI

#### 2.1 Header Section
- [ ] Page title displays: "Pending Top-Up Requests"
- [ ] Description displays: "Review and approve or reject pending top-up requests from users"
- [ ] Gold color scheme matches admin panel theme
- [ ] **Pass/Fail**: ___________

#### 2.2 Refresh Button
- [ ] Refresh button is visible
- [ ] Button shows refresh icon (circular arrows)
- [ ] Button text is "Refresh"
- [ ] **Pass/Fail**: ___________

#### 2.3 Table Headers
- [ ] Table displays with correct columns: User, Amount (CC), Fiat Amount (IDR), Method, Created At, Actions
- [ ] Headers are styled with gold color
- [ ] Headers are uppercase with letter spacing
- [ ] **Pass/Fail**: ___________

---

### 3. Data Fetching and Display

#### 3.1 Loading State
- [ ] Refresh the page
- [ ] Loading spinner displays during initial fetch
- [ ] Text "Loading pending requests..." displays
- [ ] **Pass/Fail**: ___________

#### 3.2 Data Display
- [ ] Pending requests are displayed in table rows
- [ ] User column shows username (bold) and email (gray)
- [ ] Amount (CC) column shows formatted amount with thousand separators + "CC" suffix in green
- [ ] Fiat Amount (IDR) column shows "Rp" prefix with thousand separators
- [ ] Method column shows payment method badge
- [ ] Provider info (bank/wallet type) displays below method if present
- [ ] Created At column shows formatted date/time
- [ ] **Pass/Fail**: ___________

#### 3.3 Empty State
- [ ] Clear all pending requests from database
- [ ] Refresh the page
- [ ] Empty state displays with checkmark icon
- [ ] Text "No Pending Requests" displays
- [ ] Sub-text "All top-up requests have been processed" displays
- [ ] **Pass/Fail**: ___________

#### 3.4 Error Handling
- [ ] Stop API server
- [ ] Refresh the page
- [ ] Error message displays in red card
- [ ] Error message includes meaningful description
- [ ] **Pass/Fail**: ___________

---

### 4. Approve Functionality

#### 4.1 Approve Button Interaction
- [ ] Approve button is visible for each pending request
- [ ] Button shows "✓ Approve" text
- [ ] Button has green styling
- [ ] Hover effect changes button background
- [ ] **Pass/Fail**: ___________

#### 4.2 Approve Workflow
- [ ] Click "Approve" button on a pending request
- [ ] Confirmation dialog appears: "Are you sure you want to approve this top-up request?"
- [ ] Click "Cancel" - nothing happens, request still pending
- [ ] Click "Approve" again, then "OK" on confirmation
- [ ] Processing state: button disables and both Approve/Reject buttons are disabled
- [ ] API call succeeds
- [ ] Success alert displays: "Top-up request approved successfully! User's wallet balance has been updated."
- [ ] Table automatically refreshes
- [ ] Approved request disappears from pending list
- [ ] **Pass/Fail**: ___________

#### 4.3 Backend Verification (After Approval)

Check database or API:

```bash
# Check TopUpRequest status
# Expected: status = "APPROVED", reviewedBy = admin_user_id, reviewedAt = timestamp

# Check WalletTransaction created
# Expected: new record with type = "TOP_UP", amount = request.amount

# Check WalletAccount balance
# Expected: balance increased by request.amount
```

- [ ] TopUpRequest status updated to "APPROVED"
- [ ] TopUpRequest.reviewedBy set to admin's user ID
- [ ] TopUpRequest.reviewedAt timestamp set
- [ ] WalletTransaction record created with type "TOP_UP"
- [ ] WalletTransaction.amount matches TopUpRequest.amount
- [ ] WalletAccount.balance increased by TopUpRequest.amount
- [ ] **Pass/Fail**: ___________

#### 4.4 User Verification
- [ ] Log in as the user whose top-up was approved
- [ ] Check wallet balance in user panel
- [ ] **Expected**: Balance increased by approved amount
- [ ] **Actual**: Balance = ___________
- [ ] **Pass/Fail**: ___________

---

### 5. Reject Functionality

#### 5.1 Reject Button Interaction
- [ ] Reject button is visible for each pending request
- [ ] Button shows "✗ Reject" text
- [ ] Button has red styling
- [ ] Hover effect changes button background
- [ ] **Pass/Fail**: ___________

#### 5.2 Reject Workflow - No Reason
- [ ] Click "Reject" button on a pending request
- [ ] Prompt appears: "Please enter the reason for rejection:"
- [ ] Leave field empty and click "OK"
- [ ] Alert displays: "Rejection reason is required"
- [ ] Request remains pending
- [ ] **Pass/Fail**: ___________

#### 5.3 Reject Workflow - With Reason
- [ ] Click "Reject" button on a different pending request
- [ ] Prompt appears: "Please enter the reason for rejection:"
- [ ] Enter reason: "Invalid payment proof"
- [ ] Confirmation dialog appears: "Are you sure you want to reject this top-up request?"
- [ ] Click "Cancel" - nothing happens, request still pending
- [ ] Click "Reject" again, enter reason, then "OK" on confirmation
- [ ] Processing state: buttons disable
- [ ] API call succeeds
- [ ] Success alert displays: "Top-up request rejected successfully."
- [ ] Table automatically refreshes
- [ ] Rejected request disappears from pending list
- [ ] **Pass/Fail**: ___________

#### 5.4 Backend Verification (After Rejection)

Check database or API:

```bash
# Check TopUpRequest status
# Expected: status = "REJECTED", reviewedBy = admin_user_id, adminNotes = reason
```

- [ ] TopUpRequest status updated to "REJECTED"
- [ ] TopUpRequest.reviewedBy set to admin's user ID
- [ ] TopUpRequest.reviewedAt timestamp set
- [ ] TopUpRequest.adminNotes contains rejection reason
- [ ] WalletAccount.balance unchanged (no transaction created)
- [ ] **Pass/Fail**: ___________

---

### 6. Refresh Functionality

#### 6.1 Manual Refresh
- [ ] Click the "Refresh" button
- [ ] Button shows "Refreshing..." text
- [ ] Spinner icon animates
- [ ] API call completes
- [ ] Table updates with latest data
- [ ] Button returns to "Refresh" text
- [ ] **Pass/Fail**: ___________

#### 6.2 Auto-refresh After Action
- [ ] Approve or reject a request
- [ ] **Expected**: Table automatically refreshes after action completes
- [ ] **Actual**: ___________
- [ ] **Pass/Fail**: ___________

---

### 7. Error Handling

#### 7.1 Network Error
- [ ] Disconnect network or stop API server
- [ ] Click "Approve" on a request
- [ ] **Expected**: Error alert displays with network error message
- [ ] **Actual**: ___________
- [ ] **Pass/Fail**: ___________

#### 7.2 API Error Response
- [ ] Create scenario where API returns 500 error
- [ ] Click "Approve" on a request
- [ ] **Expected**: Error alert displays with API error message
- [ ] **Actual**: ___________
- [ ] **Pass/Fail**: ___________

#### 7.3 Session Expiration (401)
- [ ] Clear admin token from localStorage: `localStorage.removeItem('admin_token')`
- [ ] Click "Approve" on a request
- [ ] **Expected**: Redirect to `/login` page
- [ ] **Actual**: ___________
- [ ] **Pass/Fail**: ___________

---

### 8. Concurrent Actions

#### 8.1 Processing Lock
- [ ] Click "Approve" on request #1
- [ ] While processing, try to click "Reject" on same request
- [ ] **Expected**: Buttons are disabled, action is prevented
- [ ] **Actual**: ___________
- [ ] **Pass/Fail**: ___________

#### 8.2 Multiple Requests
- [ ] Have 3+ pending requests visible
- [ ] Click "Approve" on request #1
- [ ] While processing, verify buttons on other requests remain enabled
- [ ] **Expected**: Only request #1 buttons are disabled during processing
- [ ] **Actual**: ___________
- [ ] **Pass/Fail**: ___________

---

### 9. Formatting and Styling

#### 9.1 Amount Formatting
- [ ] Verify amounts display with thousand separators
- [ ] Example: 1000 displays as "1,000 CC"
- [ ] Example: 150000 displays as "Rp 150,000"
- [ ] **Pass/Fail**: ___________

#### 9.2 Date Formatting
- [ ] Verify dates display in readable format
- [ ] Example: "Jan 15, 2024 10:30"
- [ ] Timezone appropriate for locale
- [ ] **Pass/Fail**: ___________

#### 9.3 Responsive Design
- [ ] Resize browser to mobile width (< 768px)
- [ ] Table scrolls horizontally
- [ ] All content remains visible
- [ ] Layout doesn't break
- [ ] **Pass/Fail**: ___________

---

### 10. Requirement Coverage

#### Requirement 4.6 Validation

**4.6**: THE Admin_Panel SHALL display a dedicated page at `/topups/pending` showing all TopUpRequest records where status is PENDING, ordered by createdAt descending

- [ ] Page exists at `/topups/pending` route
- [ ] Page fetches TopUpRequest records with status PENDING
- [ ] Records ordered by createdAt descending (backend)
- [ ] User email displayed: ✓
- [ ] Amount (CC) displayed: ✓
- [ ] FiatAmount (IDR) displayed: ✓
- [ ] Method displayed: ✓
- [ ] CreatedAt timestamp displayed: ✓
- [ ] Approve button present and functional: ✓
- [ ] Reject button present and functional: ✓
- [ ] Table refreshes after approval: ✓
- [ ] Table refreshes after rejection: ✓
- [ ] **Overall Pass/Fail**: ___________

---

### 11. Integration Tests

#### 11.1 Full Approve Flow
- [ ] Create new pending top-up request via user panel
- [ ] Note user's current wallet balance
- [ ] Navigate to admin panel `/topups/pending`
- [ ] Verify new request appears in table
- [ ] Approve the request
- [ ] Verify success message
- [ ] Verify request disappears from pending list
- [ ] Log in as user and verify wallet balance increased
- [ ] **Pass/Fail**: ___________

#### 11.2 Full Reject Flow
- [ ] Create new pending top-up request via user panel
- [ ] Note user's current wallet balance
- [ ] Navigate to admin panel `/topups/pending`
- [ ] Verify new request appears in table
- [ ] Reject the request with reason "Test rejection"
- [ ] Verify success message
- [ ] Verify request disappears from pending list
- [ ] Log in as user and verify wallet balance unchanged
- [ ] **Pass/Fail**: ___________

#### 11.3 Multiple Admins
- [ ] Create pending request
- [ ] Admin A opens `/topups/pending`
- [ ] Admin B opens `/topups/pending` in different browser
- [ ] Admin A approves the request
- [ ] Admin B clicks refresh button
- [ ] **Expected**: Admin B sees request removed from list
- [ ] **Actual**: ___________
- [ ] **Pass/Fail**: ___________

---

## Console Verification

### Check Browser Console
- [ ] No JavaScript errors logged
- [ ] No React warnings logged
- [ ] API requests logged in development mode
- [ ] **Pass/Fail**: ___________

### Check Network Tab
- [ ] GET request to `/v1/payment/admin/list?status=PENDING` returns 200
- [ ] POST request to `/v1/payment/admin/:id/approve` returns 200
- [ ] POST request to `/v1/payment/admin/:id/reject` returns 200
- [ ] Requests include `Authorization: Bearer` header
- [ ] **Pass/Fail**: ___________

---

## Performance Verification

### Load Time
- [ ] Page loads in < 2 seconds with 10 pending requests
- [ ] Page loads in < 5 seconds with 50 pending requests
- [ ] **Pass/Fail**: ___________

### Action Response Time
- [ ] Approve action completes in < 2 seconds
- [ ] Reject action completes in < 2 seconds
- [ ] Table refresh completes in < 1 second
- [ ] **Pass/Fail**: ___________

---

## Accessibility Verification

### Keyboard Navigation
- [ ] Tab key navigates through buttons
- [ ] Enter key activates focused button
- [ ] **Pass/Fail**: ___________

### Screen Reader (Optional)
- [ ] Table has appropriate ARIA labels
- [ ] Buttons have descriptive labels
- [ ] **Pass/Fail**: ___________

---

## Summary

### Overall Results

**Total Tests**: 100+  
**Passed**: ___________  
**Failed**: ___________  
**Pass Rate**: ___________%

### Critical Issues Found
1. ___________
2. ___________
3. ___________

### Non-Critical Issues Found
1. ___________
2. ___________
3. ___________

### Recommendations
1. ___________
2. ___________
3. ___________

---

## Sign-Off

**Tester Name**: ___________  
**Test Date**: ___________  
**Environment**: Development / Staging / Production  
**Browser**: ___________  
**OS**: ___________  

**Status**: ☐ PASS ☐ FAIL ☐ PASS WITH ISSUES

**Notes**:
___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________

---

## Appendix: Quick Test Commands

```bash
# Start services
cd apps/api && npm run dev
cd apps/admin && npm run dev

# Create test pending request (as user)
curl -X POST http://localhost:3001/api/v1/payment/initiate \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "fiatAmount": 150000, "method": "TESTING"}'

# Check pending requests (as admin)
curl -X GET "http://localhost:3001/api/v1/payment/admin/list?status=PENDING" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Check user wallet balance
curl -X GET http://localhost:3001/api/v1/wallet/balance \
  -H "Authorization: Bearer USER_TOKEN"
```
