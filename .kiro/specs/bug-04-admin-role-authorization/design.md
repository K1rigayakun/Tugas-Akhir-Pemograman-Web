# Design Document: Admin Role Authorization Fix

## Overview

This document provides the design for fixing BUG-04 where admin users cannot access role-protected endpoints due to missing `adminRole` field values in the database. The fix involves updating the seed script to properly set admin roles during user creation.

## Root Cause Analysis

The current seed script creates admin users without setting the `adminRole` field:

```typescript
const superAdmin = await prisma.user.upsert({
  where: { email: "admin@emeraldkingdom.id" },
  update: {},
  create: {
    email: "admin@emeraldkingdom.id",
    username: "TheEmperor",
    passwordHash: adminPassword,
    emailVerified: true,
    rank: "EMPEROR",
    totalExp: 99999,
    kycStatus: "APPROVED",
    // Missing: adminRole: "SUPER_ADMIN"
  },
});
```

This results in:
1. Database contains `adminRole: null` for admin users
2. JWT tokens include `adminRole: undefined` 
3. RolesGuard denies access because `user.adminRole` is undefined
4. All `@Roles()` decorated endpoints fail authorization

## Architecture

### Component Interaction Flow

```
Seed Script → Database (User with adminRole)
                ↓
User Login → Auth Service (reads adminRole from DB)
                ↓
JWT Generation → JWT Token (includes adminRole)
                ↓
API Request → RolesGuard (validates adminRole)
                ↓
Protected Endpoint (theme settings, etc.)
```

## Detailed Design

### 1. Seed Script Modifications

**File:** `packages/db/seed.ts`

**Changes Required:**

Update the `create` objects for each admin user to include the `adminRole` field:

```typescript
const superAdmin = await prisma.user.upsert({
  where: { email: "admin@emeraldkingdom.id" },
  update: {
    adminRole: "SUPER_ADMIN" as AdminRole,
  },
  create: {
    email: "admin@emeraldkingdom.id",
    username: "TheEmperor",
    passwordHash: adminPassword,
    emailVerified: true,
    rank: "EMPEROR",
    totalExp: 99999,
    kycStatus: "APPROVED",
    adminRole: "SUPER_ADMIN" as AdminRole,  // ADD THIS
  },
});

const auctionManager = await prisma.user.upsert({
  where: { email: "auction@emeraldkingdom.id" },
  update: {
    adminRole: "AUCTION_MANAGER" as AdminRole,
  },
  create: {
    email: "auction@emeraldkingdom.id",
    username: "AuctionMaster",
    passwordHash: adminPassword,
    emailVerified: true,
    rank: "DUKE",
    totalExp: 50000,
    kycStatus: "APPROVED",
    adminRole: "AUCTION_MANAGER" as AdminRole,  // ADD THIS
  },
});

const kycOfficer = await prisma.user.upsert({
  where: { email: "kyc@emeraldkingdom.id" },
  update: {
    adminRole: "KYC_OFFICER" as AdminRole,
  },
  create: {
    email: "kyc@emeraldkingdom.id",
    username: "KYCOfficer",
    passwordHash: adminPassword,
    emailVerified: true,
    rank: "MARQUIS",
    totalExp: 30000,
    kycStatus: "APPROVED",
    adminRole: "KYC_OFFICER" as AdminRole,  // ADD THIS
  },
});
```

**Key Design Decisions:**

1. **Using `upsert` with `update` field**: This ensures that existing admin users get their roles updated when the seed script runs again, making the fix backward-compatible.

2. **Type safety with `as AdminRole`**: TypeScript requires explicit type casting for enum values to ensure type safety.

3. **Regular users remain unchanged**: Regular users (knight@demo.id, etc.) should NOT have adminRole set, maintaining the principle that only designated administrators have admin privileges.

### 2. Import Statement Addition

The seed script must import the AdminRole enum from Prisma:

```typescript
import { PrismaClient, AdminRole } from "@prisma/client";
```

This import is necessary because `AdminRole` is an enum defined in the Prisma schema.

### 3. Validation Flow

After the fix, the authorization flow will work as follows:

```typescript
// 1. Seed creates admin with role
User in DB: { 
  email: "admin@emeraldkingdom.id", 
  adminRole: "SUPER_ADMIN" 
}

// 2. Auth service reads user and generates token
JWT Payload: { 
  userId: "...", 
  email: "admin@emeraldkingdom.id",
  role: "EMPEROR",
  adminRole: "SUPER_ADMIN"  // Now properly set
}

// 3. RolesGuard validates request
if (user.adminRole === AdminRole.SUPER_ADMIN) {
  return true;  // ✓ Access granted
}
```

## Data Model

No schema changes are required. The existing schema already defines the `adminRole` field:

```prisma
model User {
  // ... other fields
  adminRole  AdminRole?
  // ... other fields
}

enum AdminRole {
  SUPER_ADMIN
  AUCTION_MANAGER
  KYC_OFFICER
  CONTENT_MANAGER
  SUPPORT_OFFICER
}
```

## Testing Strategy

### Manual Testing Steps

1. **Database Preparation**
   - Run `npx prisma migrate reset` to reset the database
   - Run `npx ts-node packages/db/seed.ts` to seed with the fix

2. **Verify Database State**
   - Query the users table to confirm admin users have correct `adminRole` values:
   ```sql
   SELECT email, username, "adminRole" FROM users 
   WHERE email IN (
     'admin@emeraldkingdom.id', 
     'auction@emeraldkingdom.id', 
     'kyc@emeraldkingdom.id'
   );
   ```
   - Expected: Each admin should have their respective role

3. **Verify JWT Tokens**
   - Log in as each admin user
   - Decode the JWT access token (using jwt.io or similar)
   - Confirm `adminRole` field is present and correct

4. **Verify Endpoint Access**
   - Test theme settings endpoint with Super Admin (should succeed)
   - Test theme settings endpoint with Content Manager (should succeed if role exists)
   - Test theme settings endpoint with KYC Officer (should fail with "permission denied")
   - Test theme settings endpoint with regular user (should fail with "permission denied")

### Integration Test Scenarios

```typescript
// Test 1: Super Admin can access theme endpoint
describe('Theme Settings Endpoint', () => {
  it('should allow SUPER_ADMIN to change theme', async () => {
    const token = await loginAs('admin@emeraldkingdom.id');
    const response = await request(app)
      .put('/v1/admin/settings/theme')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'dark' });
    
    expect(response.status).toBe(200);
  });

  // Test 2: KYC Officer cannot access theme endpoint
  it('should deny KYC_OFFICER access to theme settings', async () => {
    const token = await loginAs('kyc@emeraldkingdom.id');
    const response = await request(app)
      .put('/v1/admin/settings/theme')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'dark' });
    
    expect(response.status).toBe(403);
    expect(response.body.message).toContain('permission denied');
  });

  // Test 3: Regular user cannot access theme endpoint
  it('should deny regular users access to theme settings', async () => {
    const token = await loginAs('knight@demo.id');
    const response = await request(app)
      .put('/v1/admin/settings/theme')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'dark' });
    
    expect(response.status).toBe(403);
  });
});
```

## Error Handling

The fix does not introduce new error conditions. Existing error handling in RolesGuard will continue to work:

```typescript
if (!hasRole) {
  throw new ForbiddenException(
    `Akses ditolak — role ${user.adminRole || "tidak ada"} tidak memiliki izin untuk aksi ini.`,
  );
}
```

With the fix, `user.adminRole` will no longer be undefined for admin users, so the error messages will correctly show the user's role (e.g., "role KYC_OFFICER tidak memiliki izin").

## Security Considerations

1. **Principle of Least Privilege**: Each admin role has specific permissions. The fix ensures that roles are properly assigned and enforced.

2. **JWT Token Integrity**: The adminRole is included in the JWT payload, which is signed by the server. This prevents role manipulation by clients.

3. **Database Consistency**: Using `upsert` with the `update` block ensures existing databases get the fix applied when the seed script runs.

4. **Regular Users Protected**: Regular users continue to have `adminRole: null`, ensuring they cannot access admin endpoints.

## Backward Compatibility

The fix is backward-compatible:

1. **Upsert with Update**: Existing admin users will have their roles updated when the seed script runs
2. **No Breaking Changes**: No API changes, schema changes, or client changes required
3. **Auth Service Already Supports**: The auth service already includes `adminRole` in JWT tokens (line 492 in auth.service.ts), it just wasn't set in the database

## Deployment Notes

1. Run the updated seed script on existing installations:
   ```bash
   npx ts-node packages/db/seed.ts
   ```

2. Admin users must log out and log back in to get new JWT tokens with the correct adminRole

3. No database migration required (adminRole field already exists in schema)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Admin role persistence

*For any* admin user created or updated by the seed script with a specified admin role, querying that user from the database should return the same admin role value.

**Validates: Requirements 1.1, 1.2, 1.3, 1.5**

### Property 2: JWT token consistency

*For any* admin user with a non-null adminRole in the database, the JWT token generated during login should contain an adminRole field with the exact same value.

**Validates: Requirements 2.1, 2.3, 2.4**

### Property 3: Authorization enforcement

*For any* request to a role-protected endpoint, the RolesGuard should grant access if and only if the user's adminRole matches one of the required roles or the user is SUPER_ADMIN.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 4: Regular user isolation

*For any* regular user (non-admin) with adminRole set to null, the JWT token should either omit the adminRole field or set it to undefined, and access to admin endpoints should be denied.

**Validates: Requirements 1.4, 2.2, 3.5**

### Property 5: Upsert idempotence

*For any* admin user email, running the seed script multiple times should result in the same adminRole value in the database, demonstrating that the upsert operation is idempotent.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

## Summary

The fix is straightforward and surgical:
- Add `adminRole` field to the `create` and `update` blocks for each admin user in the seed script
- Import the `AdminRole` enum from Prisma
- Regular users remain unchanged
- Auth service and RolesGuard already support admin roles correctly

This resolves the authorization issue while maintaining security and backward compatibility.
