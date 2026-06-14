# Requirements Document

## Introduction

This document specifies the requirements for implementing a comprehensive multiple payment methods feature for the Emerald Kingdom auction platform. The feature enables users to top up their account balance using various Indonesian payment methods including QRIS, Virtual Accounts, E-Wallets, Testing/Demo payment, and existing Stripe integration. The system provides method-specific user interfaces, real-time status tracking, countdown timers for payment expiration, and an admin approval workflow that increments user balance upon successful payment verification.

## Glossary

- **Payment_Gateway**: The external service provider (e.g., Midtrans, Xendit) that processes payment transactions
- **Payment_System**: The backend module responsible for managing payment requests, status tracking, and gateway integration
- **Payment_UI**: The frontend components that display payment options and transaction status
- **Top_Up_Request**: A database record representing a user's request to add funds to their account
- **QRIS**: Quick Response Code Indonesian Standard - a unified QR code payment standard
- **Virtual_Account**: A temporary bank account number assigned for a specific payment transaction
- **E_Wallet**: Digital wallet services such as GoPay, OVO, Dana, ShopeePay, and LinkAja
- **Testing_Payment**: A mock payment method for development and demonstration purposes
- **Admin_Panel**: The administrative interface for reviewing and approving payment requests
- **Balance**: The user's available cryptocurrency/token amount in the auction platform
- **Payment_Status**: The current state of a payment (PENDING, APPROVED, REJECTED, EXPIRED, PAID)
- **Countdown_Timer**: A UI component displaying remaining time until payment expiration
- **QR_Code**: A base64-encoded image containing payment information for QRIS transactions
- **Payment_Instructions**: Method-specific guidance displayed to users for completing payment
- **Sandbox_Mode**: A testing environment where payments use mock data or test credentials
- **Webhook**: An HTTP callback from the Payment_Gateway to notify payment status changes

## Requirements

### Requirement 1

**User Story:** As a user, I want to select from multiple payment methods, so that I can choose the most convenient option for my top-up transaction.

#### Acceptance Criteria

1. THE Payment_UI SHALL display a grid of available payment methods including Testing/Demo Payment, QRIS, Virtual Account, E-Wallet, and Stripe
2. WHEN a user clicks on a payment method card, THE Payment_System SHALL navigate to the method-specific payment flow
3. THE Payment_UI SHALL display each payment method with a descriptive icon and label
4. THE Payment_UI SHALL organize payment methods in a responsive grid layout that adapts to screen size
5. WHERE the Testing/Demo Payment method is selected, THE Payment_UI SHALL prioritize its display position above other methods

### Requirement 2

**User Story:** As a user, I want to initiate a payment using my selected method, so that I can begin the top-up process with the amount I specify.

#### Acceptance Criteria

1. WHEN a user enters a top-up amount, THE Payment_System SHALL validate the amount is greater than zero
2. WHEN a user confirms the payment amount, THE Payment_System SHALL create a Top_Up_Request record with status PENDING
3. THE Payment_System SHALL invoke the Payment_Gateway API to generate payment details for the selected method
4. WHERE QRIS is selected, THE Payment_System SHALL receive a QR_Code from the Payment_Gateway
5. WHERE Virtual_Account is selected, THE Payment_System SHALL receive a bank-specific account number and payment instructions
6. WHERE E_Wallet is selected, THE Payment_System SHALL receive a redirect URL or deep link for the wallet app
7. THE Payment_System SHALL store the payment details in the Top_Up_Request record
8. THE Payment_System SHALL calculate and store the expiration timestamp based on the Payment_Gateway response

### Requirement 3

**User Story:** As a user, I want to see method-specific payment instructions, so that I know how to complete my payment transaction.

#### Acceptance Criteria

1. WHERE QRIS is the payment method, THE Payment_UI SHALL display the QR_Code as a scannable image
2. WHERE Virtual_Account is the payment method, THE Payment_UI SHALL display the bank name, account number, and payment amount
3. WHERE E_Wallet is the payment method, THE Payment_UI SHALL provide a button to open the wallet application
4. WHERE Stripe is the payment method, THE Payment_UI SHALL redirect to the Stripe checkout session
5. WHERE Testing_Payment is the payment method, THE Payment_UI SHALL display a mock payment completion button
6. THE Payment_UI SHALL display step-by-step Payment_Instructions specific to the selected method
7. THE Payment_UI SHALL display the exact payment amount the user must transfer

### Requirement 4

**User Story:** As a user, I want to see a countdown timer for my payment, so that I know how much time remains before the payment expires.

#### Acceptance Criteria

1. WHEN payment details are displayed, THE Payment_UI SHALL render a Countdown_Timer showing remaining minutes and seconds
2. WHILE the timer is active, THE Countdown_Timer SHALL update every second
3. WHEN the Countdown_Timer reaches zero, THE Payment_UI SHALL display an expiration message
4. WHEN the Countdown_Timer reaches zero, THE Payment_System SHALL update the Top_Up_Request status to EXPIRED
5. THE Countdown_Timer SHALL display time in MM:SS format
6. THE Payment_UI SHALL visually emphasize the Countdown_Timer when less than 5 minutes remain

### Requirement 5

**User Story:** As a user, I want the system to detect when I complete payment, so that my transaction status updates automatically without manual intervention.

#### Acceptance Criteria

1. WHEN the Payment_Gateway receives payment confirmation, THE Payment_Gateway SHALL send a Webhook notification to the Payment_System
2. WHEN the Payment_System receives a valid Webhook, THE Payment_System SHALL verify the webhook signature for authenticity
3. WHEN webhook verification succeeds, THE Payment_System SHALL update the corresponding Top_Up_Request status to PAID
4. WHERE Sandbox_Mode is active, THE Payment_System SHALL accept test webhook signatures from the Payment_Gateway
5. THE Payment_System SHALL log all Webhook events with timestamp and payload details
6. IF webhook signature verification fails, THEN THE Payment_System SHALL reject the webhook and log a security warning

### Requirement 6

**User Story:** As an administrator, I want to review and approve pending top-up requests, so that I can verify legitimate transactions and prevent fraud.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a list of Top_Up_Request records with status PENDING or PAID
2. WHEN an administrator views a Top_Up_Request, THE Admin_Panel SHALL display the user details, amount, payment method, and timestamp
3. WHEN an administrator approves a Top_Up_Request, THE Payment_System SHALL update the status to APPROVED
4. WHEN an administrator rejects a Top_Up_Request, THE Payment_System SHALL update the status to REJECTED
5. WHEN an administrator approves a Top_Up_Request, THE Payment_System SHALL increment the user's Balance by the request amount
6. THE Payment_System SHALL record the administrator's user ID in the reviewedBy field
7. THE Admin_Panel SHALL allow administrators to add optional adminNotes to a Top_Up_Request during review

### Requirement 7

**User Story:** As a user, I want to track the status of my payment in real-time, so that I know whether my transaction is pending, paid, approved, or rejected.

#### Acceptance Criteria

1. THE Payment_UI SHALL display the current Payment_Status for each Top_Up_Request
2. WHEN the Payment_Status changes, THE Payment_UI SHALL update the displayed status within 5 seconds
3. WHERE the Payment_Status is PENDING, THE Payment_UI SHALL display a waiting indicator
4. WHERE the Payment_Status is PAID, THE Payment_UI SHALL display a confirmation message indicating admin review is pending
5. WHERE the Payment_Status is APPROVED, THE Payment_UI SHALL display a success message and the updated Balance
6. WHERE the Payment_Status is REJECTED, THE Payment_UI SHALL display the adminNotes if provided
7. WHERE the Payment_Status is EXPIRED, THE Payment_UI SHALL display an option to create a new payment request

### Requirement 8

**User Story:** As a developer, I want the system to use real payment gateway SDKs in sandbox mode, so that integration testing reflects production behavior without processing real transactions.

#### Acceptance Criteria

1. THE Payment_System SHALL use the official Payment_Gateway SDK libraries
2. WHERE Sandbox_Mode is enabled, THE Payment_System SHALL configure the SDK with test API keys
3. WHERE Sandbox_Mode is enabled, THE Payment_Gateway SHALL return test QR codes, virtual accounts, and payment URLs
4. THE Payment_System SHALL set Sandbox_Mode based on the environment configuration
5. THE Payment_System SHALL log whether each transaction uses Sandbox_Mode or production mode

### Requirement 9

**User Story:** As a developer, I want payment method configuration to be extensible, so that new payment providers can be added without modifying core system logic.

#### Acceptance Criteria

1. THE Payment_System SHALL define a payment provider interface specifying methods for initialization, payment creation, and status checking
2. WHEN a new payment method is added, THE Payment_System SHALL require only implementation of the provider interface
3. THE Payment_System SHALL store provider-specific configuration in environment variables
4. THE Payment_System SHALL register available payment providers at application startup
5. THE Payment_System SHALL gracefully handle provider initialization failures without crashing the application

### Requirement 10

**User Story:** As a user, I want to upload proof of payment for manual verification, so that I can complete transactions when automatic detection fails.

#### Acceptance Criteria

1. THE Payment_UI SHALL provide a file upload button for payment proof images
2. WHEN a user uploads an image, THE Payment_System SHALL validate the file is an image format (JPEG, PNG, or WebP)
3. WHEN a user uploads an image, THE Payment_System SHALL validate the file size is less than 5 MB
4. THE Payment_System SHALL store the uploaded image URL in the proofImageUrl field of the Top_Up_Request
5. WHEN an administrator reviews a Top_Up_Request, THE Admin_Panel SHALL display the uploaded proof image if provided
6. IF image validation fails, THEN THE Payment_UI SHALL display an error message specifying the validation requirement

### Requirement 11

**User Story:** As a system operator, I want all payment transactions to be stored in the database with audit trails, so that transactions can be traced and reconciled.

#### Acceptance Criteria

1. THE Payment_System SHALL create a Top_Up_Request record for every payment initiation
2. THE Payment_System SHALL record the createdAt timestamp when a Top_Up_Request is created
3. THE Payment_System SHALL update the updatedAt timestamp whenever a Top_Up_Request status changes
4. THE Payment_System SHALL store the userId, amount, fiatAmount, method, provider, and status for each Top_Up_Request
5. THE Payment_System SHALL preserve all historical Top_Up_Request records without deletion
6. THE Payment_System SHALL maintain referential integrity between Top_Up_Request and User records

### Requirement 12

**User Story:** As a user, I want to view my payment history, so that I can track all my past top-up transactions and their outcomes.

#### Acceptance Criteria

1. THE Payment_UI SHALL display a paginated list of the user's Top_Up_Request records ordered by createdAt descending
2. WHEN a user views their payment history, THE Payment_UI SHALL display the amount, method, status, and timestamp for each transaction
3. THE Payment_UI SHALL display a maximum of 20 transactions per page
4. THE Payment_UI SHALL provide pagination controls to navigate through transaction history
5. WHERE a transaction has status REJECTED, THE Payment_UI SHALL display the adminNotes if present
