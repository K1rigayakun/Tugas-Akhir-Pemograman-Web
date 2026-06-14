# Quick Start Guide: Admin Pending Top-Ups Page

## 🚀 Getting Started in 3 Steps

### Step 1: Access the Page
Navigate to: `http://localhost:3002/topups/pending`

(Or in production: `https://your-admin-domain.com/topups/pending`)

### Step 2: Review Pending Requests
Look at the table showing pending top-up requests with:
- User information (username & email)
- Crown Coins amount
- Payment amount in Rupiah
- Payment method and details
- Request timestamp

### Step 3: Take Action
Click **✓ Approve** to add coins to user's wallet  
OR  
Click **✗ Reject** to decline the request (reason required)

---

## 📖 Detailed Workflows

### ✅ How to Approve a Top-Up Request

**When to approve:**
- Payment proof is valid and verified
- Amount matches the payment
- Request is legitimate

**Steps:**
1. Find the request in the table
2. Click the green **"✓ Approve"** button
3. Confirm when prompted: "Are you sure you want to approve this top-up request?"
4. Wait for success message: "Top-up request approved successfully! User's wallet balance has been updated."
5. The request will disappear from the list (moved to APPROVED status)

**What happens behind the scenes:**
```
TopUpRequest status → APPROVED
WalletTransaction created → type: TOP_UP
User's wallet balance → increased by Crown Coins amount
ReviewedBy field → set to your admin ID
```

**Result:** User can now use their Crown Coins immediately! 🎉

---

### ❌ How to Reject a Top-Up Request

**When to reject:**
- Payment proof is missing or invalid
- Amount doesn't match
- Suspected fraud
- Duplicate request

**Steps:**
1. Find the request in the table
2. Click the red **"✗ Reject"** button
3. Enter rejection reason when prompted (e.g., "Invalid payment proof")
   - ⚠️ **Reason is required** - helps user understand why request was rejected
4. Confirm when prompted: "Are you sure you want to reject this top-up request?"
5. Wait for success message: "Top-up request rejected successfully."
6. The request will disappear from the list (moved to REJECTED status)

**What happens behind the scenes:**
```
TopUpRequest status → REJECTED
AdminNotes field → stores your rejection reason
User's wallet balance → unchanged (no coins added)
ReviewedBy field → set to your admin ID
```

**Result:** User will need to create a new top-up request. They may contact support to understand why their request was rejected.

---

## 🔄 Refresh Button

**When to use:**
- To check for new pending requests
- After processing requests on another device
- If you're waiting for a specific request to appear

**How to use:**
Simply click the **"Refresh"** button at the top of the page.

**Note:** The list automatically refreshes after every approve/reject action.

---

## 🎨 Understanding the UI

### Table Columns Explained

| Column | What It Shows | Example |
|--------|---------------|---------|
| **User** | Username (bold) + Email (gray) | `johndoe`<br>`john@example.com` |
| **Amount (CC)** | Crown Coins to be added (green) | `1,000 CC` |
| **Fiat Amount (IDR)** | Indonesian Rupiah paid | `Rp 150,000` |
| **Method** | Payment method + provider | `VA - BCA`<br>`QRIS`<br>`Testing` |
| **Created At** | When request was made | `Jan 15, 2024 10:30` |
| **Actions** | Approve/Reject buttons | ✓ Approve ✗ Reject |

### Status Indicators

**Loading State** 🔄
```
[Spinning icon]
Loading pending requests...
```

**Empty State** ✓
```
[Checkmark icon]
No Pending Requests
All top-up requests have been processed
```

**Error State** ⚠️
```
[Red box]
Error: Failed to fetch pending requests
```

---

## ⚡ Common Scenarios

### Scenario 1: Processing Multiple Requests

**Task:** You have 5 pending requests to process

**Steps:**
1. Review the first request
2. Decide approve or reject
3. Click appropriate button and confirm
4. Wait for success message (1-2 seconds)
5. List automatically refreshes
6. Move to next request
7. Repeat until all processed

**Time:** ~30 seconds per request (including verification)

---

### Scenario 2: Handling Invalid Payment Proof

**Task:** User uploaded unclear/invalid payment proof

**Steps:**
1. Identify the request with invalid proof
2. Click **"✗ Reject"**
3. Enter reason: `"Payment proof is unclear. Please re-upload a clear image showing transaction details."`
4. Confirm rejection
5. User will receive notification (if notifications enabled)
6. User can create a new request with valid proof

**Why reject instead of waiting:** Keeps the pending list clean and encourages users to provide proper documentation.

---

### Scenario 3: Bulk Processing During Peak Hours

**Task:** 20+ pending requests accumulated

**Recommendation:**
1. Sort by creation date (oldest first)
2. Work through systematically
3. Take breaks every 10 requests to avoid fatigue
4. Double-check amounts before approving
5. Use clear, consistent rejection reasons

**Tip:** Click refresh periodically to ensure you're seeing the latest data.

---

### Scenario 4: Uncertain About a Request

**Task:** Request seems legitimate but you're not 100% sure

**Options:**

**Option A: Verify Externally**
- Check payment gateway dashboard
- Verify bank transaction
- Contact user if needed
- Then approve or reject

**Option B: Ask for More Information**
- Reject with reason: `"Please provide additional payment confirmation (transaction ID or receipt)"`
- User can upload better proof and resubmit

**Best Practice:** When in doubt, ask for more information rather than approving immediately.

---

## 🛠️ Troubleshooting

### Problem: "Unauthorized" Error
**Cause:** Not logged in or session expired  
**Solution:** Log out and log back in as admin

### Problem: Buttons Don't Work
**Cause:** JavaScript error or network issue  
**Solution:** 
1. Open browser console (F12)
2. Check for errors
3. Refresh the page
4. Try again

### Problem: Request Disappeared But Balance Didn't Update
**Cause:** Rare - possible transaction failure  
**Solution:**
1. Check database directly
2. Look for WalletTransaction record
3. Verify WalletAccount balance
4. Contact technical support if needed

### Problem: Empty State Shows But Requests Exist
**Cause:** Requests already processed by another admin  
**Solution:** Check the main `/topups` page to see all requests (not just pending)

---

## 📊 Best Practices

### ✓ Do's

✓ **Verify payment proof** before approving  
✓ **Provide clear rejection reasons** to help users  
✓ **Double-check amounts** match payment proof  
✓ **Process requests in order** (oldest first)  
✓ **Use refresh button** to check for new requests  
✓ **Document unusual cases** in rejection notes  

### ✗ Don'ts

✗ **Don't approve without verification**  
✗ **Don't reject without a clear reason**  
✗ **Don't approve duplicate requests**  
✗ **Don't process too quickly** - take time to review  
✗ **Don't ignore suspicious patterns**  

---

## 🔒 Security Notes

- All actions are logged with your admin user ID
- Rejection reasons are stored permanently
- Users cannot see who approved/rejected their request
- Each approve action is irreversible (balance is immediately added)
- Confirm dialogs prevent accidental clicks

---

## 📈 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F5` | Refresh page |
| `Tab` | Navigate between buttons |
| `Enter` | Activate focused button |
| `Escape` | Close confirmation dialog (cancel) |

---

## 🆘 Getting Help

**For Technical Issues:**
- Check the README.md file
- Review VERIFICATION_CHECKLIST.md
- Contact development team

**For Payment Questions:**
- Review payment documentation
- Check payment gateway dashboard
- Contact finance team

**For User Questions:**
- Ask user to re-submit with correct information
- Provide clear rejection reasons
- Direct to support channel if needed

---

## ✨ Tips for Efficiency

1. **Set a Routine**: Check pending requests at specific times (e.g., every hour)
2. **Use Two Monitors**: Payment gateway on one screen, admin panel on another
3. **Keep Notes**: Document unusual patterns or frequently occurring issues
4. **Communicate**: If you see suspicious activity, notify other admins
5. **Stay Updated**: Check for new features or changes to the payment system

---

## 📞 Quick Reference

**Page URL:** `/topups/pending`  
**Approve Endpoint:** `POST /payment/admin/:id/approve`  
**Reject Endpoint:** `POST /payment/admin/:id/reject`  

**Access:** Admin role required  
**Browser Support:** Chrome, Firefox, Safari, Edge (latest versions)  
**Mobile:** Responsive design works on tablets and phones

---

## Summary

**Remember the 3 A's:**
1. **Access** - Navigate to `/topups/pending`
2. **Assess** - Review the request details
3. **Act** - Approve ✓ or Reject ✗

That's it! You're ready to manage pending top-up requests efficiently. 🎉

---

**Need more details?** See the full documentation:
- `README.md` - Complete feature guide
- `TASK_4.5_IMPLEMENTATION.md` - Technical details
- `VERIFICATION_CHECKLIST.md` - Testing procedures
