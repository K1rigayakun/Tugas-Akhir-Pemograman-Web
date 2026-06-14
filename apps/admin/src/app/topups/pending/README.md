# Admin Pending Top-Ups Page

A dedicated admin interface for reviewing and managing pending top-up requests from users.

## Overview

This page allows administrators to:
- View all pending top-up requests in a clean, organized table
- Approve top-up requests, which immediately adds Crown Coins to user wallets
- Reject top-up requests with a required reason for audit purposes
- Refresh the list to see the latest pending requests

## Access

**URL**: `http://localhost:3002/topups/pending` (or `/topups/pending` on your admin domain)

**Requirements**: 
- Must be logged in as an admin user
- Must have a valid `adminRole` field in the user record

## Features

### 📋 Data Display

The table shows the following information for each pending request:

| Column | Description |
|--------|-------------|
| **User** | Username and email of the user who made the request |
| **Amount (CC)** | Crown Coins amount to be added to user's wallet |
| **Fiat Amount (IDR)** | Indonesian Rupiah amount the user is paying |
| **Method** | Payment method (QRIS, VA, E-Wallet, Testing, etc.) with provider details |
| **Created At** | When the request was created |
| **Actions** | Approve/Reject buttons |

### ✅ Approve Request

**What happens when you approve:**
1. TopUpRequest status changes to `APPROVED`
2. A WalletTransaction record is created with type `TOP_UP`
3. User's WalletAccount balance is increased by the Crown Coins amount
4. The `reviewedBy` field is set to your admin user ID
5. The request disappears from the pending list

**How to approve:**
1. Click the green "✓ Approve" button
2. Confirm in the dialog
3. Wait for success message
4. The list automatically refreshes

### ❌ Reject Request

**What happens when you reject:**
1. TopUpRequest status changes to `REJECTED`
2. The rejection reason is stored in `adminNotes` field
3. The `reviewedBy` field is set to your admin user ID
4. User's wallet balance remains unchanged
5. The request disappears from the pending list

**How to reject:**
1. Click the red "✗ Reject" button
2. Enter a reason for rejection (required)
3. Confirm in the dialog
4. Wait for success message
5. The list automatically refreshes

### 🔄 Refresh

Click the "Refresh" button at the top to manually reload the pending requests list. The list also automatically refreshes after every approve/reject action.

## User Interface

### Loading State
- Displays an animated spinner while fetching data
- Shows "Loading pending requests..." message

### Empty State
- Shows when there are no pending requests
- Displays a checkmark icon with "No Pending Requests" message

### Error State
- Displays error messages in a red card at the top of the page
- Includes details about what went wrong

### Processing State
- Disables both Approve and Reject buttons for the request being processed
- Prevents accidental double-clicks or concurrent actions

## API Endpoints Used

### Fetch Pending Requests
```
GET /v1/payment/admin/list?status=PENDING
```
Returns an array of pending TopUpRequest records with user information.

### Approve Request
```
POST /v1/payment/admin/:id/approve
Body: {}
```
Approves the top-up request and updates user's wallet balance.

### Reject Request
```
POST /v1/payment/admin/:id/reject
Body: { "notes": "reason for rejection" }
```
Rejects the top-up request with a reason.

## Common Workflows

### Workflow 1: Approve Multiple Requests
1. Navigate to `/topups/pending`
2. Review each request in the table
3. Click "Approve" on the first request and confirm
4. Wait for success message and auto-refresh
5. Repeat for other requests
6. Continue until all valid requests are approved

### Workflow 2: Handle Invalid Payment Proof
1. Navigate to `/topups/pending`
2. Identify request with invalid/missing payment proof
3. Click "Reject" button
4. Enter reason: "Invalid payment proof - image unclear"
5. Confirm rejection
6. User will not receive Crown Coins and will need to create a new request

### Workflow 3: Check and Refresh
1. Navigate to `/topups/pending`
2. View current pending requests
3. Verify payment proofs externally (if needed)
4. Click "Refresh" button to see if new requests have arrived
5. Process new requests as needed

## Troubleshooting

### Issue: Page shows "Unauthorized" error
**Solution**: 
- Log out and log back in as admin
- Verify your user account has an `adminRole` field
- Check that your authentication token is valid

### Issue: Approve/Reject buttons don't work
**Solution**:
- Check browser console for JavaScript errors
- Verify API server is running on port 3001
- Check network tab for failed API requests
- Ensure you're using a modern browser with JavaScript enabled

### Issue: Request disappears but user balance didn't update
**Solution**:
- Check the TopUpRequest record in the database
- Verify WalletTransaction was created
- Check WalletAccount.balance field
- Review API logs for errors
- This should be rare due to atomic database transactions

### Issue: Empty state shows but I know there are pending requests
**Solution**:
- Click the "Refresh" button
- Check if requests have already been processed by another admin
- Verify database connection
- Check API server logs for errors

## Security Notes

- All API requests include authentication tokens
- Backend verifies admin role before allowing access
- Session expiration automatically redirects to login
- All actions are logged with `reviewedBy` field for audit trails
- Rejection reasons are required and stored for accountability

## Development

### Files
- **Component**: `apps/admin/src/app/topups/pending/page.tsx`
- **Auth Helper**: `apps/admin/src/lib/auth.ts`
- **API Helper**: `apps/admin/src/lib/api.ts`
- **Backend Controller**: `apps/api/src/modules/payment/payment.controller.ts`

### Testing
See `VERIFICATION_CHECKLIST.md` for comprehensive testing instructions.

### Styling
- Uses medieval-themed color scheme
- Gold accent color: `#c9a84c`
- Dark background with transparency layers
- Responsive design for mobile devices

## Related Pages

- **Main Top-Ups Page**: `/topups` - Shows all top-up requests (all statuses)
- **Payments Page**: `/payments` - General payment management
- **Finance Dashboard**: `/finance` - Financial overview and reports

## Support

For issues or questions:
1. Check the verification checklist: `VERIFICATION_CHECKLIST.md`
2. Review implementation details: `TASK_4.5_IMPLEMENTATION.md`
3. Check API server logs
4. Verify database schema matches requirements

---

**Task**: 4.5 - Create Admin Pending Top-Ups Page  
**Requirement**: 4.6  
**Status**: ✅ Complete
