# Requirements Document

## Introduction

This document specifies the requirements for fixing BUG-01: Data sync issues between admin panel and web application. The bug prevents administrators from viewing auction data that exists in the database and is visible on the public web application.

## Glossary

- **Admin_Panel**: The administrative interface located at `/apps/admin/` used by authorized administrators
- **Web_App**: The public-facing web application located at `/apps/web/` accessible to all users
- **API_Service**: The NestJS backend service at `/apps/api/` that provides data access
- **Auction_Endpoint**: The `/v1/admin/auctions` API endpoint that returns auction listings
- **Create_Modal**: The "Buat Lelang Baru" (Create New Auction) user interface component

## Requirements

### Requirement 1

**User Story:** As an administrator, I want to view all existing auction data in the admin panel, so that I can monitor and manage auctions on the platform.

#### Acceptance Criteria

1. WHEN an administrator accesses the auctions page THEN THE Admin_Panel SHALL fetch auction data from the Auction_Endpoint
2. WHEN the Auction_Endpoint receives a request THEN THE API_Service SHALL query the database for auction records
3. WHEN auction records exist in the database THEN THE API_Service SHALL return those records in the response
4. WHEN the Admin_Panel receives auction data THEN THE Admin_Panel SHALL display each auction with its title, status, rarity, type, current price, and bid count
5. WHEN no auctions exist in the database THEN THE Admin_Panel SHALL display a message indicating no auctions are found

### Requirement 2

**User Story:** As an administrator, I want to create new auctions through the admin panel, so that I can add auction items to the platform without manual database manipulation.

#### Acceptance Criteria

1. WHEN an administrator clicks "Buat Lelang Baru" THEN THE Admin_Panel SHALL display the Create_Modal with all required input fields
2. WHEN an administrator fills the create form and clicks submit THEN THE Admin_Panel SHALL send a POST request to the Auction_Endpoint with the form data
3. WHEN the API_Service receives a create request with valid data THEN THE API_Service SHALL create a new auction record in the database
4. WHEN auction creation succeeds THEN THE API_Service SHALL return the created auction with a success status
5. WHEN auction creation succeeds THEN THE Admin_Panel SHALL close the Create_Modal and refresh the auction list
6. IF the create request contains invalid data THEN THE API_Service SHALL return an error message describing the validation failure
7. WHEN the Admin_Panel receives an error response THEN THE Admin_Panel SHALL display the error message to the administrator

### Requirement 3

**User Story:** As an administrator, I want the admin panel to filter auctions by status and type, so that I can quickly find specific categories of auctions.

#### Acceptance Criteria

1. WHEN an administrator selects a status filter THEN THE Admin_Panel SHALL request auctions with that status from the Auction_Endpoint
2. WHEN an administrator selects a type filter THEN THE Admin_Panel SHALL request auctions with that type from the Auction_Endpoint
3. WHEN the Auction_Endpoint receives status and type filters THEN THE API_Service SHALL return only auctions matching both criteria
4. WHEN an administrator selects "ALL" for a filter THEN THE Admin_Panel SHALL request auctions without that filter constraint

### Requirement 4

**User Story:** As a system integrator, I want proper error handling and authentication in the admin API client, so that the admin panel operates reliably and securely.

#### Acceptance Criteria

1. THE Admin_Panel SHALL include authentication tokens in all API requests
2. WHEN an API request fails due to authentication THEN THE Admin_Panel SHALL redirect to the login page
3. WHEN an API request fails due to network error THEN THE Admin_Panel SHALL display an error message and retry option
4. WHEN the Admin_Panel sends a request with Content-Type application/json THEN THE API_Service SHALL correctly parse the request body
