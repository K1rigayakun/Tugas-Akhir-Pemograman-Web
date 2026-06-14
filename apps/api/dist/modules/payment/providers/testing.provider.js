"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TestingProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestingProvider = void 0;
const common_1 = require("@nestjs/common");
const payment_method_enum_1 = require("../interfaces/payment-method.enum");
/**
 * TestingProvider
 *
 * A mock payment provider for development and demonstration purposes.
 * This provider simulates payment flows without requiring external payment gateway setup,
 * enabling immediate testing of the entire payment system.
 *
 * Features:
 * - In-memory storage of mock payment states
 * - Generates unique transaction IDs with 'test-' prefix
 * - 15-minute expiration for test payments
 * - completeTestPayment() method to simulate successful payment
 * - Returns helpful instructions for developers
 *
 * Validates Requirements 3.5, 8.1, 8.3
 */
let TestingProvider = TestingProvider_1 = class TestingProvider {
    constructor() {
        this.logger = new common_1.Logger(TestingProvider_1.name);
        this.name = 'TESTING';
        this.supportedMethods = [payment_method_enum_1.PaymentMethod.TESTING];
        // In-memory storage for mock payment states
        this.mockPayments = new Map();
    }
    /**
     * Initialize the testing provider
     * No external configuration needed for testing provider
     *
     * @param config - Provider configuration (not used by testing provider)
     */
    async initialize(config) {
        this.logger.log('TestingProvider initialized for development/testing');
    }
    /**
     * Create a mock payment transaction
     *
     * Generates a unique transaction ID and stores it in memory with PENDING status.
     * Returns mock payment details with instructions for completing the test payment.
     *
     * @param request - Payment creation request
     * @returns Payment response with transaction ID, 15-minute expiration, and test instructions
     *
     * Validates Requirements 3.5, 8.1
     */
    async createPayment(request) {
        // Generate unique transaction ID with test- prefix
        const transactionId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Set 15-minute expiration
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        this.logger.log(`Creating test payment: ${transactionId} for user ${request.userId}`);
        // Store mock payment in memory with PENDING status
        this.mockPayments.set(transactionId, {
            transactionId,
            status: 'PENDING',
        });
        // Create helpful testing details
        const paymentDetails = {
            transactionId,
            message: 'This is a test payment. Use the "Complete Test Payment" button to simulate successful payment.',
            instructions: [
                'Review the payment amount and details',
                'Click the "Complete Test Payment" button to simulate payment success',
                'Payment will be marked as PAID immediately',
                'The transaction will then be available for admin approval',
                'No real money is processed in testing mode'
            ]
        };
        this.logger.log(`Test payment created successfully: ${transactionId}, expires at ${expiresAt.toISOString()}`);
        return {
            transactionId,
            expiresAt,
            paymentDetails
        };
    }
    /**
     * Simulate successful test payment completion
     *
     * This method allows developers to manually trigger payment success
     * without waiting for actual payment gateway notifications.
     *
     * @param transactionId - The transaction ID to mark as paid
     * @throws Error if transaction not found
     *
     * Validates Requirements 3.5, 8.3
     */
    async completeTestPayment(transactionId) {
        const payment = this.mockPayments.get(transactionId);
        if (!payment) {
            this.logger.error(`Test payment not found: ${transactionId}`);
            throw new Error(`Test payment with ID ${transactionId} not found`);
        }
        if (payment.status === 'PAID') {
            this.logger.warn(`Test payment ${transactionId} is already marked as PAID`);
            return;
        }
        // Update payment status to PAID
        payment.status = 'PAID';
        payment.paidAt = new Date();
        this.logger.log(`Test payment ${transactionId} marked as PAID at ${payment.paidAt.toISOString()}`);
    }
    /**
     * Check the current status of a test payment
     *
     * @param transactionId - The transaction ID to check
     * @returns Current payment status and paid timestamp if applicable
     *
     * Validates Requirements 8.1
     */
    async checkPaymentStatus(transactionId) {
        const payment = this.mockPayments.get(transactionId);
        if (!payment) {
            this.logger.warn(`Test payment not found: ${transactionId}, returning EXPIRED status`);
            return {
                transactionId,
                status: 'EXPIRED'
            };
        }
        this.logger.debug(`Test payment ${transactionId} status: ${payment.status}`);
        return payment;
    }
    /**
     * Validate webhook signature
     *
     * For testing provider, all webhooks are considered valid.
     * This allows flexible testing of webhook processing logic.
     *
     * @param payload - The webhook payload
     * @param signature - The signature (not validated for testing)
     * @returns Always true for testing provider
     *
     * Validates Requirements 8.1
     */
    async validateWebhook(payload, signature) {
        this.logger.debug('TestingProvider: All webhooks are considered valid for testing');
        return true;
    }
    /**
     * Process webhook notification
     *
     * Processes test webhook payloads and returns the webhook result.
     * Expects payload to contain transactionId, status, and optionally paidAt.
     *
     * @param payload - The webhook payload
     * @returns Webhook result with transaction ID, status, and paid timestamp
     *
     * Validates Requirements 8.1
     */
    async processWebhook(payload) {
        this.logger.log(`Processing test webhook for transaction: ${payload.transactionId}`);
        const result = {
            transactionId: payload.transactionId,
            status: payload.status,
            paidAt: payload.paidAt ? new Date(payload.paidAt) : undefined
        };
        // Update internal state if transaction exists
        const payment = this.mockPayments.get(payload.transactionId);
        if (payment) {
            payment.status = payload.status;
            if (payload.paidAt) {
                payment.paidAt = new Date(payload.paidAt);
            }
            this.logger.log(`Updated test payment ${payload.transactionId} status to ${payload.status}`);
        }
        return result;
    }
    /**
     * Get all mock payments (for testing/debugging)
     *
     * @returns Map of all mock payments
     */
    getAllMockPayments() {
        return this.mockPayments;
    }
    /**
     * Clear all mock payments (for testing cleanup)
     */
    clearAllMockPayments() {
        this.mockPayments.clear();
        this.logger.log('All mock payments cleared');
    }
};
exports.TestingProvider = TestingProvider;
exports.TestingProvider = TestingProvider = TestingProvider_1 = __decorate([
    (0, common_1.Injectable)()
], TestingProvider);
//# sourceMappingURL=testing.provider.js.map