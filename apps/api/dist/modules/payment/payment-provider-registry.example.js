"use strict";
/**
 * PaymentProviderRegistry Usage Examples
 *
 * This file demonstrates how to use the PaymentProviderRegistry service
 * to register and retrieve payment providers dynamically.
 *
 * Validates Requirements 9.3, 9.4, 9.5
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.example1_RegisteringProviders = example1_RegisteringProviders;
exports.example2_GetProviderForMethod = example2_GetProviderForMethod;
exports.example3_GetProviderByName = example3_GetProviderByName;
exports.example4_ErrorHandling = example4_ErrorHandling;
exports.example5_CheckMethodSupport = example5_CheckMethodSupport;
const payment_provider_registry_service_1 = require("./payment-provider-registry.service");
const payment_method_enum_1 = require("./interfaces/payment-method.enum");
/**
 * Example 1: Registering providers at module initialization
 *
 * In a real application, providers would be registered in the PaymentModule
 * during the OnModuleInit lifecycle hook.
 */
async function example1_RegisteringProviders() {
    const registry = new payment_provider_registry_service_1.PaymentProviderRegistry();
    // Create provider instances (these would be actual implementations)
    const midtransProvider = {
        name: 'MIDTRANS',
        supportedMethods: [
            payment_method_enum_1.PaymentMethod.QRIS,
            payment_method_enum_1.PaymentMethod.VIRTUAL_ACCOUNT,
            payment_method_enum_1.PaymentMethod.EWALLET
        ],
        initialize: async (config) => {
            console.log('Initializing Midtrans with config:', config.environment);
        },
        createPayment: async (request) => ({
            transactionId: 'midtrans-123',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            paymentDetails: {
                qrCodeBase64: 'base64string...',
                qrString: 'qr-content',
                transactionId: 'midtrans-123'
            }
        }),
        checkPaymentStatus: async (transactionId) => ({
            transactionId,
            status: 'PENDING'
        }),
        validateWebhook: async (payload, signature) => true,
        processWebhook: async (payload) => ({
            transactionId: payload.order_id,
            status: 'PAID',
            paidAt: new Date()
        })
    };
    const stripeProvider = {
        name: 'STRIPE',
        supportedMethods: [payment_method_enum_1.PaymentMethod.STRIPE],
        initialize: async (config) => {
            console.log('Initializing Stripe with config:', config.environment);
        },
        createPayment: async (request) => ({
            transactionId: 'stripe-session-123',
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            paymentDetails: {
                sessionId: 'stripe-session-123',
                sessionUrl: 'https://checkout.stripe.com/...'
            }
        }),
        checkPaymentStatus: async (transactionId) => ({
            transactionId,
            status: 'PENDING'
        }),
        validateWebhook: async (payload, signature) => true,
        processWebhook: async (payload) => ({
            transactionId: payload.data.object.id,
            status: 'PAID',
            paidAt: new Date()
        })
    };
    // Register providers
    registry.registerProvider(midtransProvider);
    registry.registerProvider(stripeProvider);
    console.log('Registered providers:', registry.getAvailableProviderNames());
    console.log('Supported methods:', registry.getSupportedMethods());
}
/**
 * Example 2: Retrieving provider by payment method
 *
 * This is the primary way PaymentService will use the registry
 * to dynamically select the correct provider based on user's choice.
 */
async function example2_GetProviderForMethod(registry, method) {
    try {
        // Get the provider that handles this payment method
        const provider = registry.getProviderForMethod(method);
        console.log(`Provider for ${method}:`, provider.name);
        // Use the provider to create a payment
        const paymentResponse = await provider.createPayment({
            userId: 'user-123',
            amount: 100,
            fiatAmount: 100000,
            method: method
        });
        console.log('Payment created:', paymentResponse.transactionId);
        return paymentResponse;
    }
    catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}
/**
 * Example 3: Retrieving provider by name
 *
 * This is useful when processing webhooks where you know the provider name
 * from the webhook endpoint URL.
 */
async function example3_GetProviderByName(registry, providerName, webhookPayload, signature) {
    try {
        // Get provider by name
        const provider = registry.getProviderByName(providerName);
        // Validate webhook signature
        const isValid = await provider.validateWebhook(webhookPayload, signature);
        if (!isValid) {
            throw new Error('Invalid webhook signature');
        }
        // Process webhook
        const result = await provider.processWebhook(webhookPayload);
        console.log('Webhook processed:', result);
        return result;
    }
    catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}
/**
 * Example 4: Graceful error handling
 *
 * The registry provides helpful error messages when providers are not found.
 */
async function example4_ErrorHandling(registry) {
    try {
        // Try to get a provider for an unsupported method
        registry.getProviderForMethod(payment_method_enum_1.PaymentMethod.QRIS);
    }
    catch (error) {
        // Error message includes list of supported methods
        console.error('Method not supported:', error.message);
        // Example: "No payment provider is available for method 'QRIS'. Supported methods: STRIPE, TESTING"
    }
    try {
        // Try to get a non-existent provider
        registry.getProviderByName('NONEXISTENT');
    }
    catch (error) {
        // Error message includes list of available providers
        console.error('Provider not found:', error.message);
        // Example: "Payment provider 'NONEXISTENT' is not registered. Available providers: MIDTRANS, STRIPE"
    }
}
/**
 * Example 5: Checking method support before using
 *
 * This is useful for conditional logic or validation.
 */
function example5_CheckMethodSupport(registry, method) {
    if (registry.isMethodSupported(method)) {
        console.log(`${method} is supported`);
        return true;
    }
    else {
        console.log(`${method} is not supported`);
        return false;
    }
}
//# sourceMappingURL=payment-provider-registry.example.js.map