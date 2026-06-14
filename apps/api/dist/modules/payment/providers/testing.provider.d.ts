import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { PaymentMethod } from '../interfaces/payment-method.enum';
import { CreatePaymentRequest, PaymentResponse, PaymentStatusResponse, WebhookResult, PaymentProviderConfig } from '../interfaces/payment-types';
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
export declare class TestingProvider implements PaymentProvider {
    private readonly logger;
    readonly name = "TESTING";
    readonly supportedMethods: PaymentMethod[];
    private mockPayments;
    /**
     * Initialize the testing provider
     * No external configuration needed for testing provider
     *
     * @param config - Provider configuration (not used by testing provider)
     */
    initialize(config: PaymentProviderConfig): Promise<void>;
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
    createPayment(request: CreatePaymentRequest): Promise<PaymentResponse>;
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
    completeTestPayment(transactionId: string): Promise<void>;
    /**
     * Check the current status of a test payment
     *
     * @param transactionId - The transaction ID to check
     * @returns Current payment status and paid timestamp if applicable
     *
     * Validates Requirements 8.1
     */
    checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse>;
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
    validateWebhook(payload: any, signature: string): Promise<boolean>;
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
    processWebhook(payload: any): Promise<WebhookResult>;
    /**
     * Get all mock payments (for testing/debugging)
     *
     * @returns Map of all mock payments
     */
    getAllMockPayments(): Map<string, PaymentStatusResponse>;
    /**
     * Clear all mock payments (for testing cleanup)
     */
    clearAllMockPayments(): void;
}
//# sourceMappingURL=testing.provider.d.ts.map