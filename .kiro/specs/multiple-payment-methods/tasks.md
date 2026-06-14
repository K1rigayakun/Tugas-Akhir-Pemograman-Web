# Implementation Plan: Multiple Payment Methods

## Overview

This implementation plan transforms the multiple payment methods design into actionable coding tasks. The feature integrates QRIS, Virtual Account, E-Wallet, Testing, and Stripe payment methods with real-time status tracking, countdown timers, admin approval workflows, and Midtrans gateway integration. Tasks are organized to build incrementally from database foundation through backend services to frontend UI components.

## Tasks

- [x] 1. Database schema migration and Prisma updates
  - Extend TopUpRequest model with new fields: method, provider, bank, walletType, paymentDetails (Json), expiresAt, paidAt, reviewedBy, reviewedAt, adminNotes
  - Update TopUpStatus enum to include PENDING, PAID, APPROVED, REJECTED, EXPIRED, CANCELLED
  - Add database indexes on userId, status, method, expiresAt
  - Generate and apply Prisma migration
  - _Requirements: 2.2, 2.7, 2.8, 11.1, 11.4_

- [x] 2. Payment provider interface and registry
  - [x] 2.1 Define PaymentProvider interface
    - Create TypeScript interface with methods: initialize, createPayment, checkPaymentStatus, validateWebhook, processWebhook
    - Define request/response types: CreatePaymentRequest, PaymentResponse, PaymentStatusResponse, WebhookResult
    - Define PaymentMethod enum (QRIS, VIRTUAL_ACCOUNT, EWALLET, STRIPE, TESTING)
    - _Requirements: 9.1, 9.2_
  
  - [x] 2.2 Write property test for payment provider interface
    - **Property 2: Payment Amount Validation**
    - **Validates: Requirements 2.1**
  
  - [x] 2.3 Implement PaymentProviderRegistry service
    - Create NestJS service to register and retrieve providers by name or method
    - Implement getProviderForMethod and getProviderByName methods
    - Add graceful error handling for missing providers
    - _Requirements: 9.3, 9.4, 9.5_

- [x] 3. Testing payment provider (highest priority)
  - [x] 3.1 Implement TestingProvider class
    - Implement PaymentProvider interface
    - Create in-memory Map for mock payment storage
    - Implement createPayment to return mock payment details with 15-minute expiration
    - Implement completeTestPayment method for simulating successful payment
    - Implement checkPaymentStatus to query mock payment state
    - _Requirements: 3.5, 8.1, 8.3_
  
  - [x] 3.2 Write property test for Testing provider
    - **Property 3: Payment Creation Initializes Pending Status**
    - **Validates: Requirements 2.2**
  
  - [x] 3.3 Write unit tests for TestingProvider
    - Test createPayment returns valid transaction ID and expiration
    - Test completeTestPayment transitions status to PAID
    - Test checkPaymentStatus returns correct status
    - _Requirements: 3.5_

- [x] 4. Midtrans payment provider
  - [x] 4.1 Install and configure Midtrans SDK
    - Install midtrans-client package
    - Create Midtrans configuration in environment variables (serverKey, clientKey, isSandbox)
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [x] 4.2 Implement MidtransProvider class
    - Implement initialize method to create Snap and CoreApi clients
    - Implement createPayment for QRIS, Virtual Account, and E-Wallet
    - Parse Midtrans transaction responses into standardized PaymentResponse format
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 8.3_
  
  - [x] 4.3 Implement Midtrans webhook handling
    - Implement validateWebhook with SHA512 signature verification
    - Implement processWebhook to parse Midtrans notifications
    - Map Midtrans transaction_status to internal status codes
    - _Requirements: 5.2, 5.3, 5.6_
  
  - [x] 4.4 Write property test for Midtrans provider
    - **Property 4: Payment Details Persistence**
    - **Property 5: Expiration Timestamp Calculation**
    - **Validates: Requirements 2.7, 2.8**
  
  - [x] 4.5 Write integration tests for Midtrans sandbox
    - Test QRIS payment creation returns QR code
    - Test Virtual Account payment creation returns account number
    - Test E-Wallet payment creation returns redirect URL
    - _Requirements: 2.4, 2.5, 2.6_

- [x] 5. Core payment service
  - [x] 5.1 Implement PaymentService.initiatePayment
    - Validate amount greater than zero
    - Get appropriate provider from registry
    - Call provider.createPayment with request data
    - Create TopUpRequest record in database with payment details
    - Schedule expiration check using setTimeout
    - _Requirements: 2.1, 2.2, 2.3, 2.7, 2.8_
  
  - [x] 5.2 Write property tests for payment initiation
    - **Property 2: Payment Amount Validation**
    - **Property 3: Payment Creation Initializes Pending Status**
    - **Property 5: Expiration Timestamp Calculation**
    - **Validates: Requirements 2.1, 2.2, 2.8**
  
  - [x] 5.3 Implement PaymentService.handleWebhook
    - Validate webhook signature using provider
    - Process webhook payload to extract transaction ID and status
    - Query database for matching TopUpRequest by paymentDetails.transactionId
    - Update TopUpRequest status and paidAt timestamp
    - Emit payment.status.changed event for real-time updates
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  
  - [x] 5.4 Write unit tests for webhook handling
    - Test webhook signature validation rejection
    - Test successful status update from PENDING to PAID
    - Test event emission on status change
    - _Requirements: 5.2, 5.3, 5.6_
  
  - [x] 5.5 Implement expiration monitoring
    - Create scheduleExpirationCheck method to set timeout
    - After timeout, query TopUpRequest and update status to EXPIRED if still PENDING
    - Handle application restart by querying and scheduling pending requests
    - _Requirements: 4.4_

- [x] 6. Admin approval service
  - [x] 6.1 Implement PaymentService.approveTopUpRequest
    - Query TopUpRequest with user relation
    - Validate request status is PENDING or PAID
    - Use Prisma transaction to update request status to APPROVED and increment user balance
    - Record reviewedBy admin ID and reviewedAt timestamp
    - _Requirements: 6.3, 6.5, 6.6_
  
  - [x] 6.2 Write property tests for approval workflow
    - **Property 11: Balance Increment on Approval**
    - **Property 12: Approval Atomicity**
    - **Validates: Requirements 6.5, 11.6**
  
  - [x] 6.3 Implement PaymentService.rejectTopUpRequest
    - Query TopUpRequest by ID
    - Update status to REJECTED with admin notes
    - Record reviewedBy admin ID and reviewedAt timestamp
    - _Requirements: 6.4, 6.7_
  
  - [x] 6.4 Write unit tests for rejection workflow
    - Test rejection updates status to REJECTED
    - Test adminNotes are stored correctly
    - Test reviewedBy and reviewedAt are set
    - _Requirements: 6.4, 6.7_

- [x] 7. Proof of payment upload
  - [x] 7.1 Implement PaymentService.uploadProofImage
    - Validate file is image format (JPEG, PNG, WebP)
    - Validate file size is less than 5 MB
    - Upload file to storage service (S3/Cloudinary/Supabase Storage)
    - Update TopUpRequest.proofImageUrl with uploaded URL
    - _Requirements: 10.2, 10.3, 10.4, 10.6_
  
  - [x] 7.2 Write property tests for file upload validation
    - **Property 14: File Type Validation**
    - **Property 15: File Size Validation**
    - **Validates: Requirements 10.2, 10.3**
  
  - [x] 7.3 Write unit tests for proof upload
    - Test valid image upload succeeds
    - Test invalid file type rejection
    - Test oversized file rejection
    - _Requirements: 10.2, 10.3, 10.6_

- [x] 8. Payment controller and API endpoints
  - [x] 8.1 Create PaymentController with endpoints
    - POST /api/payments/initiate - Create new payment
    - GET /api/payments/:id - Get payment details
    - POST /api/payments/:id/upload-proof - Upload payment proof
    - POST /api/payments/webhook/:provider - Receive gateway webhooks
    - GET /api/payments/history - Get user's payment history
    - _Requirements: 2.1, 2.2, 5.1, 10.1, 12.1_
  
  - [x] 8.2 Implement admin payment endpoints
    - GET /api/admin/payments - List pending/paid payments
    - POST /api/admin/payments/:id/approve - Approve payment
    - POST /api/admin/payments/:id/reject - Reject payment
    - Add admin role guards to protect endpoints
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 8.3 Add request validation with class-validator
    - Create DTOs for all endpoint payloads
    - Validate amount, method, userId, file uploads
    - Return clear validation error messages
    - _Requirements: 2.1, 10.2, 10.3_
  
  - [x] 8.4 Write integration tests for API endpoints
    - Test POST /api/payments/initiate creates TopUpRequest
    - Test POST /api/payments/webhook/:provider updates status
    - Test admin approval/rejection endpoints
    - _Requirements: 2.2, 5.3, 6.3, 6.4_

- [x] 9. Checkpoint - Backend core functionality complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Frontend payment method selection
  - [x] 10.1 Create PaymentMethodCard component
    - Display payment method icon, label, and description
    - Handle onClick to select method
    - Add hover and active states
    - _Requirements: 1.3, 1.4_
  
  - [x] 10.2 Create PaymentMethodGrid component
    - Define PaymentMethodOption array with Testing, QRIS, VA, E-Wallet, Stripe
    - Sort methods by priority (Testing first)
    - Render grid layout with responsive columns
    - Handle method selection and navigation
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [x] 10.3 Write property tests for payment method display
    - **Property 1: Payment Method Display Completeness**
    - **Validates: Requirements 1.1, 1.3**
  
  - [x] 10.4 Write unit tests for payment selection
    - Test all payment methods render
    - Test method selection triggers navigation
    - Test responsive grid layout
    - _Requirements: 1.1, 1.2_

- [x] 11. Countdown timer component
  - [x] 11.1 Create CountdownTimer component
    - Accept expiresAt timestamp prop
    - Use setInterval to update remaining time every second
    - Calculate minutes and seconds from milliseconds remaining
    - Display in MM:SS format with zero-padding
    - Apply urgent styling when less than 5 minutes remain
    - Display expiration message when countdown reaches zero
    - Clean up interval on unmount
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_
  
  - [x] 11.2 Write property tests for countdown timer
    - **Property 8: Countdown Timer Format**
    - **Property 9: Countdown Timer Accuracy**
    - **Validates: Requirements 4.5, 4.2**
  
  - [x] 11.3 Write unit tests for countdown timer
    - Test timer displays correct MM:SS format
    - Test timer updates every second
    - Test expiration message at zero
    - Test urgent styling at 5 minutes
    - _Requirements: 4.1, 4.2, 4.5, 4.6_

- [x] 12. Method-specific payment display components
  - [x] 12.1 Create QRISPaymentDisplay component
    - Display QR code image from base64 data
    - Show step-by-step scanning instructions
    - Display payment amount
    - Include CountdownTimer
    - _Requirements: 3.1, 3.6, 3.7_
  
  - [x] 12.2 Write property tests for QRIS display
    - **Property 6: Method-Specific UI Content**
    - **Property 7: Payment Amount Display Accuracy**
    - **Validates: Requirements 3.1, 3.7**
  
  - [x] 12.3 Create VirtualAccountDisplay component
    - Display bank name and logo
    - Display virtual account number with copy button
    - Show payment amount with IDR formatting
    - Display transfer instructions
    - Include CountdownTimer
    - _Requirements: 3.2, 3.6, 3.7_
  
  - [x] 12.4 Write property tests for VA display
    - **Property 6: Method-Specific UI Content**
    - **Property 7: Payment Amount Display Accuracy**
    - **Validates: Requirements 3.2, 3.7**
  
  - [x] 12.5 Create EWalletPaymentDisplay component
    - Display wallet type (GoPay, OVO, Dana, etc.)
    - Provide button/link to open wallet app
    - Show payment amount
    - Display completion instructions
    - Include CountdownTimer
    - _Requirements: 3.3, 3.6, 3.7_
  
  - [x] 12.6 Create TestingPaymentDisplay component
    - Display testing instructions
    - Show "Complete Test Payment" button
    - Call API endpoint to mark payment as PAID on button click
    - Display success message after completion
    - _Requirements: 3.5_
  
  - [x] 12.7 Write unit tests for payment displays
    - Test QRIS displays QR code image
    - Test VA displays account number
    - Test E-Wallet displays redirect button
    - Test Testing displays completion button
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 13. Payment status tracker component
  - [x] 13.1 Create PaymentStatusTracker component
    - Define status configuration map (icon, color, message, showTimer)
    - Display current status with appropriate icon and styling
    - Show CountdownTimer for PENDING status
    - Display admin notes for REJECTED status
    - Show retry button for EXPIRED status
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [x] 13.2 Write property tests for status tracking
    - **Property 16: Status Display Consistency**
    - **Property 17: Status Message Accuracy**
    - **Validates: Requirements 7.1, 7.2**
  
  - [x] 13.3 Write unit tests for status display
    - Test each status renders correct icon and message
    - Test timer only shows for PENDING
    - Test admin notes display for REJECTED
    - Test retry button shows for EXPIRED
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 14. Real-time status updates
  - [x] 14.1 Set up Socket.IO event listeners
    - Connect to backend Socket.IO server
    - Subscribe to payment.status.changed events filtered by userId
    - Update local payment state when status changes
    - _Requirements: 7.2_
  
  - [x] 14.2 Implement polling fallback
    - Poll GET /api/payments/:id endpoint every 10 seconds as fallback
    - Stop polling when final status reached (APPROVED, REJECTED, EXPIRED)
    - _Requirements: 7.2_
  
  - [x] 14.3 Write integration tests for real-time updates
    - Test Socket.IO connection and event handling
    - Test status update within 5 seconds
    - Test polling fallback when WebSocket unavailable
    - _Requirements: 7.2_

- [x] 15. Proof of payment upload UI
  - [x] 15.1 Create ProofUploader component
    - Render file input with image format restrictions
    - Display file size limit (5 MB)
    - Show upload progress indicator
    - Display uploaded image preview
    - Call POST /api/payments/:id/upload-proof endpoint
    - Show success/error messages
    - _Requirements: 10.1, 10.2, 10.3, 10.6_
  
  - [x] 15.2 Write property tests for upload validation
    - **Property 14: File Type Validation**
    - **Property 15: File Size Validation**
    - **Validates: Requirements 10.2, 10.3**
  
  - [x] 15.3 Write unit tests for proof uploader
    - Test valid image upload
    - Test file type validation error
    - Test file size validation error
    - Test upload progress display
    - _Requirements: 10.1, 10.2, 10.3, 10.6_

- [x] 16. Admin payment review panel
  - [x] 16.1 Create AdminPaymentList component
    - Fetch pending/paid payments from GET /api/admin/payments
    - Display table with columns: user, amount, method, status, timestamp
    - Add filters for status and date range
    - Implement pagination
    - _Requirements: 6.1, 6.2_
  
  - [x] 16.2 Create AdminPaymentReview component
    - Display detailed payment information
    - Show uploaded proof image if available
    - Provide approve/reject buttons
    - Show text area for admin notes
    - Call approval/rejection API endpoints
    - Update UI after admin action
    - _Requirements: 6.2, 6.3, 6.4, 6.7, 10.5_
  
  - [x] 16.3 Write unit tests for admin review
    - Test payment list renders correctly
    - Test approve button calls API and updates status
    - Test reject button requires admin notes
    - Test proof image display
    - _Requirements: 6.3, 6.4, 6.7, 10.5_

- [x] 17. Payment history UI
  - [x] 17.1 Create PaymentHistory component
    - Fetch user's payments from GET /api/payments/history
    - Display paginated list (20 per page)
    - Show amount, method, status, timestamp for each transaction
    - Display admin notes for rejected payments
    - Implement pagination controls
    - Sort by createdAt descending
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 17.2 Write property tests for payment history
    - **Property 18: History Pagination**
    - **Property 19: History Sort Order**
    - **Validates: Requirements 12.3, 12.1**
  
  - [x] 17.3 Write unit tests for payment history
    - Test pagination displays 20 items per page
    - Test transactions sorted by date descending
    - Test rejected transaction shows admin notes
    - Test pagination controls work correctly
    - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [x] 18. Integration and wiring
  - [x] 18.1 Wire payment flow pages
    - Create payment selection page with PaymentMethodGrid
    - Create payment details page with method-specific displays
    - Create payment status page with PaymentStatusTracker
    - Add routing between pages
    - Pass payment data via URL params or state
    - _Requirements: 1.2, 3.1, 3.2, 3.3, 7.1_
  
  - [x] 18.2 Wire admin pages
    - Add admin payments route with AdminPaymentList
    - Add payment review route with AdminPaymentReview
    - Add role-based route guards
    - _Requirements: 6.1, 6.2_
  
  - [x] 18.3 Integrate payment history into user profile
    - Add PaymentHistory component to user profile page
    - Add navigation link to payment history
    - _Requirements: 12.1_
  
  - [x] 18.4 Write end-to-end integration tests
    - Test complete payment flow from selection to status tracking
    - Test admin approval workflow updates user balance
    - Test webhook processing updates payment status
    - _Requirements: 2.2, 5.3, 6.5_

- [x] 19. Error handling and edge cases
  - [x] 19.1 Add error boundaries
    - Wrap payment components in error boundaries
    - Display user-friendly error messages
    - Log errors to monitoring service
    - _Requirements: 2.1, 5.6_
  
  - [x] 19.2 Handle network errors
    - Add retry logic for failed API calls
    - Display connection error messages
    - Provide manual retry buttons
    - _Requirements: 7.2_
  
  - [x] 19.3 Handle expired payments
    - Display expiration message when countdown reaches zero
    - Disable payment completion actions for expired payments
    - Provide "Create New Payment" button
    - _Requirements: 4.3, 4.4, 7.7_
  
  - [x] 19.4 Write unit tests for error handling
    - Test error boundary displays fallback UI
    - Test network error retry logic
    - Test expired payment handling
    - _Requirements: 4.4, 7.7_

- [x] 20. Environment configuration and deployment
  - [x] 20.1 Configure environment variables
    - Add Midtrans server key, client key, sandbox flag
    - Add provider selection environment variable
    - Document all required environment variables
    - _Requirements: 8.2, 8.4, 9.3_
  
  - [x] 20.2 Add provider initialization to app startup
    - Register all payment providers in PaymentProviderRegistry
    - Initialize providers with configuration
    - Handle initialization failures gracefully
    - _Requirements: 9.4, 9.5_
  
  - [x] 20.3 Configure webhook endpoints
    - Set up public-facing webhook URLs
    - Configure webhook signatures in gateway dashboard
    - Test webhook delivery in sandbox mode
    - _Requirements: 5.1, 5.2_

- [x] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Testing/Demo payment provider is implemented first (highest priority) for immediate testing capability
- Midtrans integration is prioritized over Xendit for QRIS/VA/E-Wallet support
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end workflows and external service integration
- Real-time updates use Socket.IO with polling fallback for resilience
- Admin approval workflow uses database transactions to ensure atomicity of balance updates
