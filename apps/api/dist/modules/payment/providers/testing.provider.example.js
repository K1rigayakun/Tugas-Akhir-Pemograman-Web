"use strict";
/**
 * TestingProvider Usage Examples
 *
 * This file demonstrates how to use the TestingProvider for development and testing.
 * The TestingProvider is automatically registered in the PaymentProviderRegistry
 * and can be accessed through the registry or directly injected.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentServiceExample = void 0;
exports.createTestPayment = createTestPayment;
exports.completeTestPaymentExample = completeTestPaymentExample;
exports.processTestWebhook = processTestWebhook;
exports.helperMethodsExample = helperMethodsExample;
exports.errorHandlingExample = errorHandlingExample;
const testing_provider_1 = require("./testing.provider");
const payment_method_enum_1 = require("../interfaces/payment-method.enum");
/**
 * Example 1: Creating a test payment
 */
async function createTestPayment() {
    const provider = new testing_provider_1.TestingProvider();
    await provider.initialize({
        environment: 'sandbox',
        serverKey: 'test-key'
    });
    const request = {
        userId: 'user-123',
        amount: 100, // 100 CC
        fiatAmount: 10000, // Rp 10,000
        method: payment_method_enum_1.PaymentMethod.TESTING
    };
    const response = await provider.createPayment(request);
    console.log('Payment Created:');
    console.log('- Transaction ID:', response.transactionId);
    console.log('- Expires At:', response.expiresAt);
    console.log('- Message:', response.paymentDetails.message);
    console.log('- Instructions:', response.paymentDetails.instructions);
    return response.transactionId;
}
/**
 * Example 2: Completing a test payment
 */
async function completeTestPaymentExample() {
    const provider = new testing_provider_1.TestingProvider();
    await provider.initialize({ environment: 'sandbox', serverKey: 'test-key' });
    // Create payment
    const request = {
        userId: 'user-123',
        amount: 100,
        fiatAmount: 10000,
        method: payment_method_enum_1.PaymentMethod.TESTING
    };
    const payment = await provider.createPayment(request);
    console.log('Created payment:', payment.transactionId);
    // Check initial status
    let status = await provider.checkPaymentStatus(payment.transactionId);
    console.log('Initial status:', status.status); // PENDING
    // Simulate user completing the payment
    await provider.completeTestPayment(payment.transactionId);
    console.log('Payment marked as completed');
    // Check updated status
    status = await provider.checkPaymentStatus(payment.transactionId);
    console.log('Updated status:', status.status); // PAID
    console.log('Paid at:', status.paidAt);
}
/**
 * Example 3: Processing webhook for test payment
 */
async function processTestWebhook() {
    const provider = new testing_provider_1.TestingProvider();
    await provider.initialize({ environment: 'sandbox', serverKey: 'test-key' });
    // Create payment
    const request = {
        userId: 'user-123',
        amount: 100,
        fiatAmount: 10000,
        method: payment_method_enum_1.PaymentMethod.TESTING
    };
    const payment = await provider.createPayment(request);
    // Simulate webhook from payment gateway
    const webhookPayload = {
        transactionId: payment.transactionId,
        status: 'PAID',
        paidAt: new Date().toISOString()
    };
    // Validate webhook (always returns true for testing provider)
    const isValid = await provider.validateWebhook(webhookPayload, 'test-signature');
    console.log('Webhook valid:', isValid);
    // Process webhook
    const result = await provider.processWebhook(webhookPayload);
    console.log('Webhook processed:', result);
}
/**
 * Example 4: Using TestingProvider via PaymentProviderRegistry
 *
 * In a real NestJS service, you would inject the registry and use it like this:
 */
class PaymentServiceExample {
    constructor(registry) {
        this.registry = registry;
    }
    async createTestPayment(userId, amount, fiatAmount) {
        // Get the testing provider from registry
        const provider = this.registry.getProviderForMethod(payment_method_enum_1.PaymentMethod.TESTING);
        // Create payment
        const payment = await provider.createPayment({
            userId,
            amount,
            fiatAmount,
            method: payment_method_enum_1.PaymentMethod.TESTING
        });
        return payment;
    }
    async completePayment(transactionId) {
        // Get testing provider
        const provider = this.registry.getProviderByName('TESTING');
        // Complete the test payment
        await provider.completeTestPayment(transactionId);
        return { success: true };
    }
}
exports.PaymentServiceExample = PaymentServiceExample;
/**
 * Example 5: Helper methods for testing/debugging
 */
async function helperMethodsExample() {
    const provider = new testing_provider_1.TestingProvider();
    await provider.initialize({ environment: 'sandbox', serverKey: 'test-key' });
    // Create multiple payments
    for (let i = 0; i < 3; i++) {
        await provider.createPayment({
            userId: `user-${i}`,
            amount: 100 * (i + 1),
            fiatAmount: 10000 * (i + 1),
            method: payment_method_enum_1.PaymentMethod.TESTING
        });
    }
    // Get all mock payments
    const allPayments = provider.getAllMockPayments();
    console.log(`Total mock payments: ${allPayments.size}`);
    allPayments.forEach((payment, txId) => {
        console.log(`- ${txId}: ${payment.status}`);
    });
    // Clear all payments (useful for test cleanup)
    provider.clearAllMockPayments();
    console.log('All payments cleared');
}
/**
 * Example 6: Error handling
 */
async function errorHandlingExample() {
    const provider = new testing_provider_1.TestingProvider();
    await provider.initialize({ environment: 'sandbox', serverKey: 'test-key' });
    try {
        // Attempting to complete non-existent payment
        await provider.completeTestPayment('non-existent-id');
    }
    catch (error) {
        console.error('Error:', error.message);
        // Error: Test payment with ID non-existent-id not found
    }
    // Checking status of non-existent payment returns EXPIRED
    const status = await provider.checkPaymentStatus('non-existent-id');
    console.log('Non-existent payment status:', status.status); // EXPIRED
}
//# sourceMappingURL=testing.provider.example.js.map