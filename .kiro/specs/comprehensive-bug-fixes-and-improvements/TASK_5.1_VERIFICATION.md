# Task 5.1 Verification Checklist

Use this checklist to manually verify the logout functionality implementation.

## Pre-Verification Setup

1. **Start the development servers:**
   ```bash
   # Terminal 1 - API Server
   cd apps/api
   npm run dev
   
   # Terminal 2 - Web App
   cd apps/web
   npm run dev
   ```

2. **Open Browser DevTools:**
   - Press F12 or right-click → Inspect
   - Go to Application tab → Storage section
   - Keep Console tab visible for errors

## Verification Steps

### ✅ Step 1: Basic Logout Flow

1. **Login to the application:**
   - [ ] Navigate to login page
   - [ ] Enter valid credentials
   - [ ] Click "Login"
   - [ ] Verify you're redirected to homepage

2. **Check tokens are stored:**
   - [ ] Open DevTools → Application → Local Storage
   - [ ] Verify `accessToken` or `token` exists
   - [ ] Note the token value for later

3. **Trigger logout:**
   - [ ] Click on profile icon/avatar
   - [ ] Profile dropdown should open
   - [ ] Click "Keluar" (Logout) button
   - [ ] Verify dropdown closes

4. **Verify redirect:**
   - [ ] Verify you're redirected to homepage `/`
   - [ ] Verify redirect happens quickly (<1 second)

### ✅ Step 2: Token Clearing Verification

1. **Check localStorage:**
   - [ ] Open DevTools → Application → Local Storage
   - [ ] Verify `accessToken` is removed
   - [ ] Verify `refreshToken` is removed
   - [ ] Verify `token` is removed
   - [ ] Verify `user` is removed

2. **Check cookies:**
   - [ ] Open DevTools → Application → Cookies
   - [ ] Verify authentication cookies are expired/removed
   - [ ] Check for `accessToken`, `refreshToken`, `token` cookies

3. **Check sessionStorage:**
   - [ ] Open DevTools → Application → Session Storage
   - [ ] Verify sessionStorage is empty or cleared

### ✅ Step 3: Cached Data Clearing Verification

1. **Before logout (setup):**
   - [ ] Login again
   - [ ] Navigate to wallet page
   - [ ] Wait for balance to load
   - [ ] Open DevTools → Application → Local Storage
   - [ ] Verify `cachedWalletBalance` exists with a value

2. **After logout:**
   - [ ] Click logout
   - [ ] Check Local Storage again
   - [ ] Verify `cachedWalletBalance` is removed
   - [ ] Verify `cachedBalance` is removed
   - [ ] Verify `userProfile` is removed
   - [ ] Verify `userPreferences` is removed

### ✅ Step 4: API Call Verification

1. **Login and open Network tab:**
   - [ ] Login to the application
   - [ ] Open DevTools → Network tab
   - [ ] Clear network log
   - [ ] Click logout button

2. **Check API call:**
   - [ ] Find `logout` request in network log
   - [ ] Verify method is `POST`
   - [ ] Verify endpoint is `/api/v1/auth/logout` or `/api/auth/logout`
   - [ ] Click on request → Headers tab
   - [ ] Verify `Authorization: Bearer <token>` header exists
   - [ ] Verify response status is `200`

3. **Check response:**
   - [ ] Click on Response tab
   - [ ] Verify response contains `success: true`
   - [ ] Verify response contains `message: "Logged out successfully"` or similar

### ✅ Step 5: Error Handling Verification

1. **Simulate network failure:**
   - [ ] Login to the application
   - [ ] Open DevTools → Network tab
   - [ ] Set throttling to "Offline"
   - [ ] Click logout button

2. **Verify graceful handling:**
   - [ ] Verify you're still redirected to homepage
   - [ ] Open Local Storage
   - [ ] Verify tokens are still cleared despite API failure
   - [ ] Verify cached data is still cleared
   - [ ] Check Console for error message (should be logged but not block)

3. **Reset network:**
   - [ ] Set throttling back to "Online" or "No throttling"

### ✅ Step 6: Session Invalidation Verification

1. **Logout and try to use old token:**
   - [ ] Login to the application
   - [ ] Open DevTools → Console
   - [ ] Copy the access token:
     ```javascript
     localStorage.getItem('accessToken')
     ```
   - [ ] Click logout
   - [ ] Try to use the old token:
     ```javascript
     fetch('http://localhost:3001/api/v1/auth/me', {
       headers: { 'Authorization': 'Bearer <paste-old-token>' }
     }).then(r => r.json()).then(console.log)
     ```
   - [ ] Verify response is `401 Unauthorized` or similar error

2. **Check session in database (optional):**
   - [ ] If you have database access, check the `Session` table
   - [ ] Find the session for your user
   - [ ] Verify `isActive` is `false`
   - [ ] Verify `refreshTokenHash` is `null`

### ✅ Step 7: Multiple Tabs Verification

1. **Open multiple tabs:**
   - [ ] Login in Tab 1
   - [ ] Open Tab 2 with the app (should be logged in)
   - [ ] Click logout in Tab 1
   - [ ] Switch to Tab 2
   - [ ] Try to navigate or perform authenticated action
   - [ ] Verify Tab 2 detects logout (may require page refresh)

### ✅ Step 8: Redirect Timing Verification

1. **Measure redirect time:**
   - [ ] Login to the application
   - [ ] Open DevTools → Console
   - [ ] Run this before clicking logout:
     ```javascript
     window.logoutStartTime = Date.now();
     ```
   - [ ] Click logout button
   - [ ] When homepage loads, run in console:
     ```javascript
     Date.now() - window.logoutStartTime
     ```
   - [ ] Verify time is ~100-200ms (should be fast)

### ✅ Step 9: Component Integration Verification

1. **Check ProfileDropdown integration:**
   - [ ] Login to the application
   - [ ] Click profile icon/avatar
   - [ ] Verify "Keluar" button is visible
   - [ ] Verify button styling looks correct
   - [ ] Hover over button (should show hover effect)
   - [ ] Click button
   - [ ] Verify logout works as expected

2. **Check standalone LogoutButton (if used elsewhere):**
   - [ ] Navigate to any page using standalone LogoutButton
   - [ ] Click the button
   - [ ] Verify same logout behavior as ProfileDropdown

## Expected Results Summary

After completing all verification steps, you should observe:

✅ **Tokens Cleared:**
- `accessToken` removed from localStorage
- `refreshToken` removed from localStorage  
- `token` removed from localStorage
- `user` removed from localStorage
- Authentication cookies expired/removed

✅ **Cached Data Cleared:**
- `cachedWalletBalance` removed
- `cachedBalance` removed
- `userProfile` removed
- `userPreferences` removed
- sessionStorage cleared

✅ **API Interaction:**
- POST request to `/api/auth/logout`
- Authorization Bearer token included
- HTTP 200 response received
- Session invalidated in database

✅ **User Experience:**
- Quick redirect to homepage (~100ms)
- Smooth logout flow
- No visible errors
- Works even when network fails

✅ **Security:**
- Old tokens cannot be reused
- Session marked inactive in database
- Refresh token hash cleared

## Troubleshooting

### Issue: Tokens not cleared
- **Check:** Are you looking at the right domain/origin in DevTools?
- **Fix:** Make sure you're on `localhost:3000` (web app domain)

### Issue: Still logged in after logout
- **Check:** Did the API call succeed? Check Network tab
- **Fix:** Verify backend is running on correct port (3001)

### Issue: Redirect doesn't happen
- **Check:** Console for JavaScript errors
- **Fix:** Verify Next.js router is working, try page refresh

### Issue: API call returns 401
- **Check:** Token might be expired or invalid
- **Fix:** Login again with fresh credentials

### Issue: Network error on logout
- **Check:** Is backend server running?
- **Fix:** Start API server: `cd apps/api && npm run dev`

## Success Criteria

Task 5.1 is successfully verified if:
- ✅ All tokens are cleared from localStorage
- ✅ All authentication cookies are cleared
- ✅ All cached user data is cleared
- ✅ Logout API is called with Bearer token
- ✅ User is redirected to homepage quickly
- ✅ Logout works even when API fails
- ✅ Old tokens cannot be reused after logout

## Next Steps After Verification

If all checks pass:
1. Mark Task 5.1 as complete in tasks.md
2. Proceed to Task 5.2 (Implement Logout API Endpoint) - Note: This already exists, just needs verification
3. Proceed to Task 5.3 (Add logout flow integration tests)

If issues found:
1. Document the issue in detail
2. Check implementation files for errors
3. Review TASK_5.1_IMPLEMENTATION.md for technical details
4. Fix issues and re-run verification
