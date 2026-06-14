# Implementation Plan: Admin Role Authorization Fix

## Overview

Fix the missing admin role authorization by updating the database seed script to properly set the `adminRole` field for admin users. This is a focused bugfix that modifies only the seed script to ensure admin users have proper roles for accessing role-protected endpoints.

## Tasks

- [x] 1. Update seed script to set admin roles
  - Add `AdminRole` import from `@prisma/client`
  - Update `superAdmin` user upsert to include `adminRole: "SUPER_ADMIN"` in both `create` and `update` blocks
  - Update `auctionManager` user upsert to include `adminRole: "AUCTION_MANAGER"` in both `create` and `update` blocks
  - Update `kycOfficer` user upsert to include `adminRole: "KYC_OFFICER"` in both `create` and `update` blocks
  - Ensure regular users do NOT have `adminRole` set (should remain null/undefined)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.3, 5.4_

- [x] 2. Checkpoint - Verify seed script runs successfully
  - Run `npx ts-node packages/db/seed.ts` to execute the updated seed script
  - Verify no TypeScript compilation errors
  - Verify seed script completes without database errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Verify database state and JWT tokens
  - Query the database to confirm admin users have correct `adminRole` values
  - Log in as each admin user (super admin, auction manager, KYC officer)
  - Decode JWT tokens to verify `adminRole` field is present and correct
  - Verify regular users have `adminRole` as null/undefined in database and JWT
  - _Requirements: 4.1, 4.2, 2.1, 2.2, 2.3, 2.4_

- [ ]* 4. Write integration tests for admin role authorization
  - Test: SUPER_ADMIN can access theme settings endpoint (should return 200)
  - Test: AUCTION_MANAGER cannot access theme settings endpoint (should return 403)
  - Test: KYC_OFFICER cannot access theme settings endpoint (should return 403)
  - Test: Regular user cannot access theme settings endpoint (should return 403)
  - Test: JWT token contains correct adminRole for each admin user type
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.3, 4.4, 4.5, 4.6_

- [x] 5. Final verification checkpoint
  - Manually test theme settings endpoint with each user type
  - Verify error messages are clear when access is denied
  - Confirm backward compatibility: existing installations can run seed script to fix roles
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The fix is backward-compatible: running the seed script on existing installations will update admin roles via the `update` block in upsert operations
- No database migration required (adminRole field already exists in schema)
- Admin users must log out and log in again after seed script runs to get new JWT tokens with correct roles
