# Quick Start - Manual Testing Task 6

**⏱️ Total Time**: 2-4 hours  
**📋 Main Document**: `TASK_6_EXECUTION_CHECKLIST.md`

---

## 🚀 Quick Setup (10 minutes)

### 1. Backup Database

```powershell
cd .kiro\specs\comprehensive-bug-fixes-and-improvements\scripts
powershell -ExecutionPolicy Bypass -File backup-database.ps1
```

**✅ Checklist**:
- [ ] Backup file created in `backups/` folder
- [ ] File size > 0 KB
- [ ] Note backup filename: `__________________________________`

---

### 2. Start All Services

**Terminal 1** (API):
```bash
cd apps\api
npm run dev
# Wait for: "Application is running on: http://localhost:3001"
```

**Terminal 2** (Admin):
```bash
cd apps\admin
npm run dev
# Wait for: "Local: http://localhost:3002"
```

**Terminal 3** (Web):
```bash
cd apps\web
npm run dev
# Wait for: "Local: http://localhost:3000"
```

**✅ Checklist**:
- [ ] API running on http://localhost:3001
- [ ] Admin running on http://localhost:3002
- [ ] Web running on http://localhost:3000

---

## 🧪 Fast Test Path (30 minutes minimum)

Test **critical path only** to verify no blockers:

### Test 1: Admin Login & Data (5 min)
1. Go to: http://localhost:3002/login
2. Login with admin credentials
3. Go to: http://localhost:3002/auctions
4. **Check**: Auctions display, console logs visible

**Status**: [ ] PASS / [ ] FAIL

---

### Test 2: Connection Pool (10 min)
```powershell
cd .kiro\specs\comprehensive-bug-fixes-and-improvements\scripts
powershell -ExecutionPolicy Bypass -File test-concurrent-load.ps1 -RequestCount 20
```

**Check output**:
- Success rate > 90%
- No 500 errors
- Total time < 10 seconds

**Status**: [ ] PASS / [ ] FAIL

---

### Test 3: Wallet Display (5 min)
1. Login as user: http://localhost:3000
2. **Check header**: Balance shows "X,XXX CC" format
3. Check console: No errors

**Status**: [ ] PASS / [ ] FAIL

---

### Test 4: Complete Payment Flow (10 min)

**User Side**:
1. Go to: http://localhost:3000/topup
2. Select: 100 CC + TESTING method
3. Click: "Bayar Test" button
4. Note Request ID: `_______________________`

**Admin Side**:
5. Go to: http://localhost:3002/topups/pending
6. Find request and click "Approve"

**User Side Again**:
7. Watch balance update (should happen in < 2 seconds)

**Status**: [ ] PASS / [ ] FAIL

---

### Test 5: Logout (5 min)
1. As user, click Logout button
2. **Check**: Redirected to homepage
3. **Check**: DevTools → Application → Storage (all cleared)
4. Try accessing protected page → should redirect to login

**Status**: [ ] PASS / [ ] FAIL

---

## ✅ Fast Path Result

**Total Tests**: 5  
**Passed**: [ ] / 5  
**Failed**: [ ] / 5

**Quick Decision**:
- ✅ All 5 PASS → Proceed with full testing or deploy to staging
- ❌ Any FAIL → Fix critical issues first

---

## 📋 Full Testing Path (2-4 hours)

Follow complete checklist: **`TASK_6_EXECUTION_CHECKLIST.md`**

**21 detailed tests** covering:
- 3 Admin authentication tests
- 3 Connection pool tests  
- 4 Wallet display tests
- 5 Payment flow tests
- 4 Logout tests
- 2 Performance tests

---

## 🐛 Common Issues & Fixes

### Issue: API won't start
**Error**: `EADDRINUSE: Port 3001 already in use`
**Fix**:
```powershell
# Find and kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F
```

---

### Issue: Database connection error
**Error**: `P1001: Can't reach database server`
**Fix**:
1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Test connection: `psql $DATABASE_URL -c "SELECT 1"`

---

### Issue: Admin login fails
**Error**: `401 Unauthorized`
**Fix**:
1. Verify admin account exists in database
2. Check password is correct
3. Verify JWT_SECRET matches in .env

---

### Issue: Wallet balance not updating
**Error**: Balance doesn't change after approval
**Fix**:
1. Check WebSocket connection in DevTools → Network → WS
2. Check API logs for approval errors
3. Refresh page manually to verify balance did update in DB

---

## 📊 Load Testing (Optional)

### Heavy Load Test (50 requests)
```powershell
powershell -ExecutionPolicy Bypass -File test-concurrent-load.ps1 -RequestCount 50
```

### Stress Test (100 requests)
```powershell
powershell -ExecutionPolicy Bypass -File test-concurrent-load.ps1 -RequestCount 100
```

### Monitor Connection Pool
Watch API logs for:
```
[Prisma] Connection pool metrics: {
  active: X,
  idle: Y,
  queueDepth: Z
}
```

**Target**: Utilization < 80% under normal load

---

## 📝 Document Results

After testing, fill out: **`TASK_6_EXECUTION_CHECKLIST.md`**

Key sections to complete:
- [ ] Checkpoint results table
- [ ] Critical issues found (if any)
- [ ] Overall assessment
- [ ] Sign-off

---

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. Mark Task 6 as COMPLETE in tasks.md
2. Update COMPLETION_SUMMARY.md
3. Mark spec as COMPLETE
4. Prepare staging deployment

### If Issues Found ❌
1. Document all issues in detail
2. Prioritize: CRITICAL / HIGH / MEDIUM / LOW
3. Fix critical blockers
4. Re-run affected tests
5. Sign-off when all pass

---

## 📞 Need Help?

**Reference Documents**:
- `TASK_6_FINAL_CHECKPOINT.md` - Detailed test procedures (800+ lines)
- `MANUAL_TESTING_GUIDE.md` - Additional testing scenarios
- `AUTOMATED_TESTING_GUIDE.md` - Jest setup (if needed)
- `FINAL_STATUS_REPORT.md` - Overall status and metrics

**Quick Links**:
- Admin Panel: http://localhost:3002
- User Web: http://localhost:3000
- API Swagger: http://localhost:3001/api (if configured)

---

**Good Luck! 🎉**

Start with **Fast Test Path** (30 min) to catch critical issues early.
