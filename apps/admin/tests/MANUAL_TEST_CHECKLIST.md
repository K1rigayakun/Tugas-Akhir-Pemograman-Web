# Manual E2E Test Checklist: Auction Creation Flow

**Task:** Test auction creation flow end-to-end  
**Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5  
**Date:** $(date)  
**Tester:** _____________

---

## Prerequisites

- [ ] API server running on `http://localhost:3001`
- [ ] Admin panel running on `http://localhost:3002`
- [ ] Valid admin token in localStorage
- [ ] Database accessible and seeded

### Setup Instructions

1. **Start API Server:**
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Start Admin Panel:**
   ```bash
   cd apps/admin
   npm run dev
   ```

3. **Get Admin Token:**
   - Log in to admin panel at `http://localhost:3002/login`
   - Open browser DevTools > Console
   - Run: `localStorage.getItem('admin_token')`
   - Copy token for API testing

---

## Test Case 1: Open Auction Page

**Requirement:** 2.1

- [ ] Navigate to `http://localhost:3002/auctions`
- [ ] Page loads without errors
- [ ] "Kelola Lelang" header is visible
- [ ] "+ Buat Lelang Baru" button is visible
- [ ] Filter tabs (ALL, ACTIVE, UPCOMING, ENDED, CANCELLED) are visible
- [ ] Type filter tabs (Semua Tipe, Live Auction, Regular Auction) are visible
- [ ] Existing auctions are displayed (if any)
- [ ] No console errors in browser DevTools

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

## Test Case 2: Click "Buat Lelang Baru" Button

**Requirement:** 2.1

- [ ] Click the "+ Buat Lelang Baru" button
- [ ] Modal appears with title "Buat Lelang Baru"
- [ ] Modal has golden border styling
- [ ] All form fields are visible:
  - [ ] Judul Lelang (text input)
  - [ ] Deskripsi (textarea)
  - [ ] Kategori (text input)
  - [ ] Rarity (dropdown)
  - [ ] Tipe Lelang (dropdown)
  - [ ] Harga Awal (number input)
  - [ ] Waktu Mulai (datetime-local input)
  - [ ] Waktu Selesai (datetime-local input)
  - [ ] Gambar Lelang (text + file upload)
- [ ] "Batal" and "Buat Lelang" buttons visible
- [ ] Modal can be closed by clicking outside or "Batal"

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

## Test Case 3: Fill All Required Fields (STANDARD Auction)

**Requirement:** 2.2, 2.3

Fill in the form with the following test data:

| Field | Value |
|-------|-------|
| Judul Lelang | Test Auction - Manual E2E |
| Deskripsi | This is a test auction for manual E2E testing |
| Kategori | Test Items |
| Rarity | RARE |
| Tipe Lelang | STANDARD |
| Harga Awal | 10000 |
| Waktu Mulai | Tomorrow at 10:00 AM |
| Waktu Selesai | Next week at 10:00 AM |
| Gambar Lelang | https://via.placeholder.com/300 |

- [ ] All fields accept input correctly
- [ ] No validation errors appear for valid data
- [ ] Form state is maintained (no fields reset unexpectedly)

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

## Test Case 4: Submit Form

**Requirement:** 2.2, 2.3, 2.4

- [ ] Click "Buat Lelang" button
- [ ] Button shows "Menyimpan..." loading state
- [ ] Button is disabled during submission
- [ ] No errors appear in browser console
- [ ] Network request visible in DevTools Network tab:
  - [ ] Method: POST
  - [ ] URL: `/api/v1/admin/auctions`
  - [ ] Status: 200 or 201
  - [ ] Request has Authorization header
  - [ ] Request has Content-Type: application/json
  - [ ] Request body contains all form data

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

## Test Case 5: Verify Success Message

**Requirement:** 2.4, 2.5

After successful submission:

- [ ] Success message appears (check for absence of error message)
- [ ] Modal closes automatically
- [ ] No error in red error box
- [ ] Form resets to initial state (if modal reopened)

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

## Test Case 6: Verify New Auction Appears in List

**Requirement:** 2.5

- [ ] Auction list automatically refreshes
- [ ] New auction appears in the grid
- [ ] Auction card displays:
  - [ ] Title: "Test Auction - Manual E2E"
  - [ ] Status badge: "DRAFT" (or "UPCOMING")
  - [ ] Rarity badge: "RARE"
  - [ ] Type badge: "STANDARD"
  - [ ] Current Price: "♛10,000" (formatted)
  - [ ] Total Bid: 0
- [ ] Auction card has hover effect (border changes to gold)
- [ ] Action buttons visible (Detail, etc.)

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

## Test Case 7: Filter by Status

**Requirement:** (Related to 2.5, verifying list display)

- [ ] Click "DRAFT" filter tab
- [ ] New auction appears in filtered list
- [ ] Click "ALL" filter tab
- [ ] New auction still visible

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

## Test Case 8: DESCENDING Auction Type (Conditional Fields)

**Requirement:** 2.3 (conditional fields)

- [ ] Open create modal
- [ ] Select "DESCENDING" as Tipe Lelang
- [ ] Additional fields appear:
  - [ ] Harga Minimum (number input)
  - [ ] Pengurangan per Jam (number input)
- [ ] Fill all fields including DESCENDING-specific fields
- [ ] Submit successfully
- [ ] New DESCENDING auction appears in list

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

## Test Case 9: RANK_EXCL Auction Type (Conditional Fields)

**Requirement:** 2.3 (conditional fields)

- [ ] Open create modal
- [ ] Select "RANK_EXCL" as Tipe Lelang
- [ ] Additional fields appear:
  - [ ] Rank Minimum (dropdown)
  - [ ] Syarat Achievement (text input, optional)
- [ ] Fill all fields including RANK_EXCL-specific fields
- [ ] Submit successfully
- [ ] New RANK_EXCL auction appears in list

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

## Test Case 10: SEALED_CHEST Auction Type (Checkbox)

**Requirement:** 2.3 (conditional fields)

- [ ] Open create modal
- [ ] Select "SEALED_CHEST" as Tipe Lelang
- [ ] Checkbox appears: "Sealed Chest (Sembunyikan Bidder & Harga)"
- [ ] Check the checkbox
- [ ] Fill all required fields
- [ ] Submit successfully
- [ ] New SEALED_CHEST auction appears in list

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

## Test Case 11: Image Upload

**Requirement:** 2.3 (image handling)

- [ ] Open create modal
- [ ] Click "Upload File" button
- [ ] Select an image file
- [ ] Image uploads successfully
- [ ] URL appears in "Gambar Lelang" field
- [ ] Fill remaining fields
- [ ] Submit successfully
- [ ] New auction created with uploaded image

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

## Error Handling Tests

### Test Case 12: Missing Required Fields

**Requirement:** 2.6, 2.7

- [ ] Open create modal
- [ ] Leave "Judul Lelang" empty
- [ ] Click "Buat Lelang"
- [ ] Error message appears
- [ ] Error message is clear and helpful
- [ ] Modal remains open
- [ ] Form data preserved

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

### Test Case 13: Invalid Date Range

**Requirement:** 2.6, 2.7

- [ ] Open create modal
- [ ] Set Waktu Selesai BEFORE Waktu Mulai
- [ ] Fill other fields correctly
- [ ] Click "Buat Lelang"
- [ ] Error message appears indicating invalid date range
- [ ] Modal remains open

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

### Test Case 14: Negative Price

**Requirement:** 2.6, 2.7

- [ ] Open create modal
- [ ] Enter negative number in "Harga Awal"
- [ ] Fill other fields correctly
- [ ] Click "Buat Lelang"
- [ ] Error message appears
- [ ] Modal remains open

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

### Test Case 15: Network Error Handling

**Requirement:** 2.7, 4.3

- [ ] Stop the API server
- [ ] Open create modal
- [ ] Fill form with valid data
- [ ] Click "Buat Lelang"
- [ ] Error message appears
- [ ] Error indicates network/connection issue
- [ ] Modal remains open
- [ ] Form data preserved

**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** _____________________________________________

---

## Browser Compatibility Tests

### Test Case 16: Chrome/Edge

- [ ] All tests pass in Chrome/Edge
- [ ] No console errors
- [ ] UI renders correctly

**Result:** ⬜ Pass / ⬜ Fail  
**Browser Version:** _____________

---

### Test Case 17: Firefox

- [ ] All tests pass in Firefox
- [ ] No console errors
- [ ] UI renders correctly

**Result:** ⬜ Pass / ⬜ Fail  
**Browser Version:** _____________

---

## Performance Tests

### Test Case 18: Page Load Performance

- [ ] Page loads in < 2 seconds
- [ ] No visible layout shifts
- [ ] Smooth animations

**Result:** ⬜ Pass / ⬜ Fail  
**Load Time:** _________ ms

---

### Test Case 19: Form Submit Performance

- [ ] Form submits in < 1 second (with valid data)
- [ ] Loading indicator appears immediately
- [ ] No UI freezing

**Result:** ⬜ Pass / ⬜ Fail  
**Submit Time:** _________ ms

---

## Summary

**Total Test Cases:** 19  
**Passed:** _____  
**Failed:** _____  
**Blocked:** _____  

**Overall Result:** ⬜ Pass / ⬜ Fail

**Critical Issues Found:**
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

**Minor Issues Found:**
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

**Recommendations:**
_____________________________________________
_____________________________________________
_____________________________________________

---

**Tester Signature:** _______________  
**Date:** _______________
