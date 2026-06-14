import { PaymentProvider } from './interfaces/payment-provider.interface';
import { PaymentMethod } from './interfaces/payment-method.enum';
/**
 * PaymentProviderRegistry Service
 *
 * Manages registration and retrieval of payment providers.
 * This service acts as a central registry where all payment providers
 * (Midtrans, Xendit, Stripe, Testing) are registered during module initialization.
 *
 * The PaymentService uses this registry to dynamically select the appropriate
 * provider based on the payment method requested by the user.
 *
 * Validates Requirements 9.3, 9.4, 9.5
 */
export declare class PaymentProviderRegistry {
    private readonly logger;
    private readonly providers;
    private readonly methodToProvider;
    /**
     * Register a payment provider
     *
     * This method is called during module initialization to register each provider.
     * It stores the provider by name and creates mappings from payment methods to providers.
     *
     * @param provider - The payment provider instance to register
     * @throws Error if a provider with the same name is already registered
     *
     * Validates Requirement 9.4
     */
    registerProvider(provider: PaymentProvider): void;
    /**
     * Get provider by name
     *
     * Retrieves a payment provider by its unique name (e.g., 'MIDTRANS', 'XENDIT', 'STRIPE', 'TESTING').
     *
     * @param name - The provider name (case-insensitive)
     * @returns The payment provider instance
     * @throws NotFoundException if the provider is not registered
     *
     * Validates Requirements 9.3, 9.5
     */
    getProviderByName(name: string): PaymentProvider;
    /**
     * Get provider for a specific payment method
     *
     * Retrieves the payment provider that handles the specified payment method.
     * This is the primary method used by PaymentService to select the appropriate provider.
     *
     * @param method - The payment method (QRIS, VIRTUAL_ACCOUNT, EWALLET, STRIPE, TESTING)
     * @returns The payment provider that supports this method
     * @throws NotFoundException if no provider supports the method
     *
     * Validates Requirements 9.3, 9.5
     */
    getProviderForMethod(method: PaymentMethod): PaymentProvider;
    /**
     * Get all registered provider names
     *
     * @returns Array of registered provider names
     */
    getAvailableProviderNames(): string[];
    /**
     * Get all supported payment methods
     *
     * @returns Array of payment methods that have at least one provider
     */
    getSupportedMethods(): PaymentMethod[];
    /**
     * Check if a payment method is supported
     *
     * @param method - The payment method to check
     * @returns true if a provider supports this method, false otherwise
     */
    isMethodSupported(method: PaymentMethod): boolean;
    /**
     * Get all registered providers
     *
     * @returns Array of all registered payment provider instances
     */
    getAllProviders(): PaymentProvider[];
    /**
     * Get the number of registered providers
     *
     * @returns The count of registered providers
     */
    getProviderCount(): number;
    /**
     * Clear all registered providers
     *
     * This is primarily used for testing purposes.
     * In production, providers should remain registered for the lifetime of the application.
     */
    clearProviders(): void;
}
//# sourceMappingURL=payment-provider-registry.service.d.ts.map