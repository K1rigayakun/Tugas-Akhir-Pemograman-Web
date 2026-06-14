/**
 * TestingProvider Usage Examples
 *
 * This file demonstrates how to use the TestingProvider for development and testing.
 * The TestingProvider is automatically registered in the PaymentProviderRegistry
 * and can be accessed through the registry or directly injected.
 */
/**
 * Example 1: Creating a test payment
 */
declare function createTestPayment(): Promise<string>;
/**
 * Example 2: Completing a test payment
 */
declare function completeTestPaymentExample(): Promise<void>;
/**
 * Example 3: Processing webhook for test payment
 */
declare function processTestWebhook(): Promise<void>;
/**
 * Example 4: Using TestingProvider via PaymentProviderRegistry
 *
 * In a real NestJS service, you would inject the registry and use it like this:
 */
declare class PaymentServiceExample {
    private readonly registry;
    constructor(registry: any);
    createTestPayment(userId: string, amount: number, fiatAmount: number): Promise<any>;
    completePayment(transactionId: string): Promise<{
        success: boolean;
    }>;
}
/**
 * Example 5: Helper methods for testing/debugging
 */
declare function helperMethodsExample(): Promise<void>;
/**
 * Example 6: Error handling
 */
declare function errorHandlingExample(): Promise<void>;
export { createTestPayment, completeTestPaymentExample, processTestWebhook, PaymentServiceExample, helperMethodsExample, errorHandlingExample };
//# sourceMappingURL=testing.provider.example.d.ts.map