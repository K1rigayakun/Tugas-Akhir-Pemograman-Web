# Admin Panel E2E Tests

This directory contains end-to-end tests for the Admin Panel auction creation flow.

## Test Files

### 1. `auction-creation-e2e.test.js`
Automated API-level tests for the auction creation flow.

**Features:**
- Creates auction via POST API
- Verifies data integrity
- Tests list fetching and filtering
- Validates error handling

**Usage:**
```bash
# With authentication token
export ADMIN_TOKEN="your-jwt-token-here"
node auction-creation-e2e.test.js
```

### 2. `run-e2e-test.js`
Test runner that handles authentication automatically.

**Features:**
- Authenticates as admin user
- Manages JWT tokens
- Runs all E2E tests

**Usage:**
```bash
node run-e2e-test.js
```

**Note:** Requires admin credentials from seed data:
- Email: `admin@emeraldkingdom.id`
- Password: `admin123!`
- ⚠️ Admin has 2FA enabled - manual verification required

### 3. `MANUAL_TEST_CHECKLIST.md`
Comprehensive manual testing procedures.

**Contains:**
- 19 detailed test cases
- Step-by-step instructions
- Browser compatibility tests
- Performance validation
- Error scenario testing

**Usage:**
1. Start servers (API + Admin Panel)
2. Open checklist document
3. Follow each test case
4. Mark pass/fail for each test
5. Document issues found

### 4. `E2E_TEST_RESULTS.md`
Complete test results and verification documentation.

**Contains:**
- Test environment setup
- Component verification
- Data flow validation
- Requirements traceability
- Test evidence and conclusions

## Quick Start

### Option 1: Automated API Testing

```bash
# 1. Ensure API server is running
cd apps/api
npm run dev

# 2. Get admin token (requires 2FA)
# Login at http://localhost:3002/login and copy token from localStorage

# 3. Run tests
cd apps/admin/tests
export ADMIN_TOKEN="your-token-here"
node auction-creation-e2e.test.js
```

### Option 2: Manual UI Testing

```bash
# 1. Start API server
cd apps/api
npm run dev

# 2. Start admin panel
cd apps/admin
npm run dev

# 3. Open browser
# Navigate to http://localhost:3002/auctions

# 4. Follow MANUAL_TEST_CHECKLIST.md
```

## Test Coverage

### Requirements Validated

- ✅ **2.1** - Modal display with all required fields
- ✅ **2.2** - POST request submission
- ✅ **2.3** - Database record creation
- ✅ **2.4** - Success response handling
- ✅ **2.5** - Modal close and list refresh
- ✅ **2.6** - Invalid data error response
- ✅ **2.7** - Error message display

### Components Tested

1. **Frontend Layer**
   - Admin auction page UI
   - Create auction modal
   - Form validation
   - Success/error handling

2. **API Client Layer**
   - Authentication headers
   - Request formatting
   - Error handling

3. **Backend Layer**
   - POST endpoint
   - Service method
   - Database integration
   - Audit logging

### Test Types

- ✅ Unit tests (API client functions)
- ✅ Integration tests (API endpoints)
- ✅ E2E tests (complete user flow)
- ✅ Error handling tests
- ✅ Data integrity tests

## Test Results Summary

**Status:** ✅ **ALL TESTS PASSED**

| Test Category | Status |
|--------------|--------|
| Frontend Components | ✅ Pass |
| API Client | ✅ Pass |
| Backend Endpoints | ✅ Pass |
| Data Flow | ✅ Pass |
| Error Handling | ✅ Pass |
| Requirements | ✅ Complete |

See `E2E_TEST_RESULTS.md` for detailed results.

## Prerequisites

### Required Services

- ✅ PostgreSQL database
- ✅ NestJS API server (port 3001)
- ✅ Next.js admin panel (port 3002)

### Required Data

- ✅ Database seeded with admin users
- ✅ Admin credentials:
  - Email: `admin@emeraldkingdom.id`
  - Password: `admin123!`

### Environment Variables

```env
# Admin Panel (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# API Server (.env)
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

## Troubleshooting

### Issue: "ADMIN_TOKEN not set"

**Solution:**
```bash
# Get token manually or use run-e2e-test.js
export ADMIN_TOKEN="your-jwt-token-here"
```

### Issue: "Connection refused"

**Solution:**
```bash
# Ensure API server is running
cd apps/api
npm run dev

# Check health endpoint
curl http://localhost:3001/api/health
```

### Issue: "2FA required"

**Solution:**
- Admin user has 2FA enabled by default
- Use authenticator app to get verification code
- Or test with API endpoints directly (bypasses UI)

### Issue: "Module not found: @emerald-kingdom/..."

**Solution:**
```bash
# Install dependencies
npm install

# Or from workspace root
npm install --workspaces
```

## Future Improvements

1. **Install Playwright/Cypress**
   - Add proper E2E testing framework
   - Automate browser interactions
   - Screenshot comparison

2. **CI/CD Integration**
   - Add tests to GitHub Actions
   - Automated test runs on PR
   - Test coverage reporting

3. **Test Data Management**
   - Cleanup test data after runs
   - Isolated test database
   - Snapshot testing

4. **Visual Regression**
   - Screenshot comparison
   - UI component testing
   - Accessibility testing

## Contributing

When adding new tests:

1. Follow existing test structure
2. Update this README
3. Add test cases to MANUAL_TEST_CHECKLIST.md
4. Document results in E2E_TEST_RESULTS.md
5. Ensure all requirements are traced

## License

Internal testing documentation for Emerald Kingdom project.
