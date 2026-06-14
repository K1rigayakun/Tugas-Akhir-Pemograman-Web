# Requirements Document

## Introduction

This document specifies the requirements for fixing BUG-04: Admin users getting "permission denied" when trying to change theme settings. The root cause is that admin users are created without the `adminRole` field set in the database seed script, resulting in JWT tokens with `adminRole: undefined` and subsequent authorization failures at role-protected endpoints.

## Glossary

- **Seed_Script**: The database seeding script at `packages/db/seed.ts` that creates initial admin users
- **Admin_User**: A user with administrative privileges requiring specific admin roles
- **AdminRole_Field**: The `adminRole` field in the User model that stores the user's administrative role
- **JWT_Token**: JSON Web Token containing user identity and role information for authentication
- **Auth_Service**: The authentication service at `apps/api/src/auth/auth.service.ts` that generates JWT tokens
- **Roles_Guard**: The authorization guard at `apps/api/src/common/guards/roles.guard.ts` that validates user roles
- **Theme_Endpoint**: The `PUT /v1/admin/settings/theme` API endpoint for changing theme settings
- **Super_Admin**: Admin user with SUPER_ADMIN role having full system access
- **Auction_Manager**: Admin user with AUCTION_MANAGER role for managing auctions
- **KYC_Officer**: Admin user with KYC_OFFICER role for managing KYC verifications
- **Content_Manager**: Admin user with CONTENT_MANAGER role for managing content

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want admin users created by the seed script to have their proper admin roles assigned, so that they can access role-protected endpoints without authorization errors.

#### Acceptance Criteria

1. WHEN the Seed_Script creates the super admin user THEN THE Seed_Script SHALL set the AdminRole_Field to "SUPER_ADMIN"
2. WHEN the Seed_Script creates the auction manager user THEN THE Seed_Script SHALL set the AdminRole_Field to "AUCTION_MANAGER"
3. WHEN the Seed_Script creates the KYC officer user THEN THE Seed_Script SHALL set the AdminRole_Field to "KYC_OFFICER"
4. WHEN the Seed_Script creates regular users THEN THE Seed_Script SHALL leave the AdminRole_Field as null
5. WHEN an admin user is created with an AdminRole_Field value THEN THE database SHALL store the role value correctly

### Requirement 2

**User Story:** As an admin user, I want my JWT token to include my admin role, so that I am properly authorized to access admin endpoints.

#### Acceptance Criteria

1. WHEN a user with a non-null AdminRole_Field logs in THEN THE Auth_Service SHALL include the adminRole in the JWT payload
2. WHEN a user with a null AdminRole_Field logs in THEN THE Auth_Service SHALL either omit adminRole or set it to undefined in the JWT payload
3. WHEN the JWT_Token is generated THEN THE JWT_Token SHALL contain the user's adminRole value exactly as stored in the database
4. WHEN the JWT_Token is decoded THEN THE decoded payload SHALL contain the adminRole field matching the user's database value

### Requirement 3

**User Story:** As an admin user with SUPER_ADMIN or CONTENT_MANAGER role, I want to access the theme settings endpoint, so that I can modify platform theme configurations.

#### Acceptance Criteria

1. WHEN a Super_Admin user sends a request to the Theme_Endpoint THEN THE Roles_Guard SHALL allow the request
2. WHEN a Content_Manager user sends a request to the Theme_Endpoint THEN THE Roles_Guard SHALL allow the request
3. WHEN an Auction_Manager user sends a request to the Theme_Endpoint THEN THE Roles_Guard SHALL deny the request with "permission denied"
4. WHEN a KYC_Officer user sends a request to the Theme_Endpoint THEN THE Roles_Guard SHALL deny the request with "permission denied"
5. WHEN a regular user with no adminRole sends a request to the Theme_Endpoint THEN THE Roles_Guard SHALL deny the request with "permission denied"

### Requirement 4

**User Story:** As a developer, I want to verify that the admin role authorization fix works correctly across all admin user types, so that I can confirm the bug is resolved.

#### Acceptance Criteria

1. WHEN the Seed_Script is executed THEN THE database SHALL contain admin users with correct AdminRole_Field values
2. WHEN each admin user logs in THEN THE JWT_Token SHALL contain the correct adminRole value
3. WHEN the Super_Admin tests the Theme_Endpoint THEN THE endpoint SHALL respond with success
4. WHEN the Content_Manager tests the Theme_Endpoint THEN THE endpoint SHALL respond with success (if Content_Manager is added)
5. WHEN the KYC_Officer tests the Theme_Endpoint THEN THE endpoint SHALL respond with permission denied
6. WHEN a regular user tests the Theme_Endpoint THEN THE endpoint SHALL respond with permission denied

### Requirement 5

**User Story:** As a system operator, I want existing admin users in the database to have their roles properly set, so that the fix applies to current installations without requiring a full database reset.

#### Acceptance Criteria

1. WHEN the seed script runs with existing admin users THEN THE Seed_Script SHALL update the AdminRole_Field using upsert operations
2. WHEN an admin user with email "admin@emeraldkingdom.id" already exists THEN THE Seed_Script SHALL set or update their AdminRole_Field to "SUPER_ADMIN"
3. WHEN an admin user with email "auction@emeraldkingdom.id" already exists THEN THE Seed_Script SHALL set or update their AdminRole_Field to "AUCTION_MANAGER"
4. WHEN an admin user with email "kyc@emeraldkingdom.id" already exists THEN THE Seed_Script SHALL set or update their AdminRole_Field to "KYC_OFFICER"
