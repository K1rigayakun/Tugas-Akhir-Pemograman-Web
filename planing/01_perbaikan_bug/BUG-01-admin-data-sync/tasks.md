# Implementation Plan: BUG-01 Admin Data Sync Fix

## Overview

This plan fixes the data sync issue between the admin panel and API backend by creating the missing API utility module (`apps/admin/src/lib/api.ts`) and ensuring the auction creation endpoint is properly implemented. The root cause is a missing API client module that the admin panel UI code references. The backend endpoints already exist and are functional.

## Tasks

- [ ] 1. Create API utility module and configure environment
  - [ ] 1.1 Create the `fetchWithAuth` function in `apps/admin/src/lib/api.ts`
    - Implement JWT token retrieval from localStorage (key: `admin_token`)
    - Add Authorization header with Bearer token format to all requests
    - Handle Content-Type headers (application/json for JSON, auto for FormData)
    - Implement 401 response handling with redirect to `/login`
    - Handle network errors with logging and re-throw
    - Return raw Response object for caller to handle
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 1.2 Write unit tests for `fetchWithAuth` function
    - **Property 1: Authentication header presence**
    - **Validates: Requirements 4.1**
    - Test token inclusion in Authorization header
    - Test 401 handling redirects to login
    - Test network error handling
    - Test JSON and FormData Content-Type handling
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 1.3 Configure environment variables for API base URL
    - Create or update `.env.local` in `apps/admin/` directory
    - Add `NEXT_PUBLIC_API_URL` variable with value `http://localhost:3001/api`
    - Document production URL format in comments
    - _Requirements: 1.1_

- [ ] 2. Checkpoint - Verify API client module works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Implement auction creation endpoint in backend
  - [ ] 3.1 Create CreateAuctionDto with validation
    - Define all required fields: title, description, category, rarity, auctionType, startingPrice, startTime, endTime
    - Define optional fields: minimumIncrement, minimumPrice, decrementAmount, minimumRank, requiredAchievementId, isSealed, imageUrls
    - Add class-validator decorators for type validation
    - Validate date range constraint (endTime must be after startTime)
    - Validate price constraints (positive numbers)
    - _Requirements: 2.3, 2.6_

  - [ ] 3.2 Add `createAuction` method to AdminService
    - Accept admin user ID and CreateAuctionDto as parameters
    - Validate input data against business rules
    - Create auction record using Prisma client
    - Set initial status based on startTime (DRAFT if future, UPCOMING if within 24h)
    - Set currentPrice to startingPrice
    - Log admin action to AuditService
    - Return created auction object
    - Handle database errors and return appropriate error messages
    - _Requirements: 2.3, 2.4, 2.6_

  - [ ] 3.3 Add `createAuction` POST endpoint to AdminController
    - Add POST route handler at `/admin/auctions`
    - Apply `@Roles` guard for SUPER_ADMIN and AUCTION_MANAGER roles
    - Extract CreateAuctionDto from request body with validation pipe
    - Extract admin user ID from request user object
    - Call `adminService.createAuction()` with admin ID and DTO
    - Return created auction with HTTP 201 status
    - Handle validation errors and return 400 with error details
    - _Requirements: 2.2, 2.3, 2.4, 2.6, 2.7_

  - [ ]* 3.4 Write property test for auction creation data integrity
    - **Property 2: Request-response data integrity**
    - **Validates: Requirements 2.3, 2.4**
    - Generate random valid auction creation data
    - Submit POST request to create auction
    - Verify all input fields are present in created record
    - Verify computed fields (currentPrice = startingPrice, status is correct)
    - _Requirements: 2.3, 2.4_

- [ ] 4. Checkpoint - Verify auction creation works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Verify admin panel integration
  - [ ] 5.1 Update admin auction page imports if needed
    - Ensure `apps/admin/src/app/auctions/page.tsx` correctly imports `fetchWithAuth`
    - Verify all API calls use the new `fetchWithAuth` function
    - Verify error handling displays user-friendly messages
    - _Requirements: 1.1, 4.3_

  - [ ]* 5.2 Write integration tests for auction list page
    - **Property 3: Filter composition correctness**
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - Test fetching auctions without filters returns all auctions
    - Test status filter returns only matching auctions
    - Test type filter returns only matching auctions
    - Test combined status + type filters return correct intersection
    - Test pagination works correctly
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4_

  - [ ]* 5.3 Write integration tests for auction creation flow
    - Test successful auction creation returns created record
    - Test validation errors return 400 with error messages
    - Test authentication errors redirect to login
    - **Property 4: Error message propagation**
    - **Validates: Requirements 2.6, 2.7, 4.3**
    - Verify error messages from API are displayed without loss
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 6. Final checkpoint - Complete integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test tasks that can be skipped for faster MVP
- The main fix is creating the missing `apps/admin/src/lib/api.ts` file
- Backend service already has `getAuctions()` working; we need to add `createAuction()`
- All tasks reference specific requirements for traceability
- Property tests validate correctness properties defined in the design document
- Checkpoints ensure incremental validation at key milestones

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3"] },
    { "id": 1, "tasks": ["1.2", "3.1"] },
    { "id": 2, "tasks": ["3.2"] },
    { "id": 3, "tasks": ["3.3"] },
    { "id": 4, "tasks": ["3.4", "5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3"] }
  ]
}
```
