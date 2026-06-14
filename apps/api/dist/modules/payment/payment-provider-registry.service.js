"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PaymentProviderRegistry_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderRegistry = void 0;
const common_1 = require("@nestjs/common");
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
let PaymentProviderRegistry = PaymentProviderRegistry_1 = class PaymentProviderRegistry {
    constructor() {
        this.logger = new common_1.Logger(PaymentProviderRegistry_1.name);
        this.providers = new Map();
        this.methodToProvider = new Map();
    }
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
    registerProvider(provider) {
        const providerName = provider.name.toUpperCase();
        // Check if provider is already registered
        if (this.providers.has(providerName)) {
            this.logger.warn(`Provider ${providerName} is already registered. Skipping.`);
            return;
        }
        // Register provider by name
        this.providers.set(providerName, provider);
        this.logger.log(`Registered payment provider: ${providerName}`);
        // Map each supported method to this provider
        for (const method of provider.supportedMethods) {
            // Only register if no provider is already registered for this method
            // This allows for fallback providers if needed
            if (!this.methodToProvider.has(method)) {
                this.methodToProvider.set(method, provider);
                this.logger.log(`Mapped payment method ${method} to provider ${providerName}`);
            }
            else {
                this.logger.debug(`Payment method ${method} already mapped to ${this.methodToProvider.get(method)?.name}. Skipping ${providerName}.`);
            }
        }
    }
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
    getProviderByName(name) {
        const providerName = name.toUpperCase();
        const provider = this.providers.get(providerName);
        if (!provider) {
            this.logger.error(`Payment provider not found: ${providerName}`);
            throw new common_1.NotFoundException(`Payment provider '${name}' is not registered. Available providers: ${this.getAvailableProviderNames().join(', ')}`);
        }
        return provider;
    }
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
    getProviderForMethod(method) {
        const provider = this.methodToProvider.get(method);
        if (!provider) {
            this.logger.error(`No provider found for payment method: ${method}`);
            throw new common_1.NotFoundException(`No payment provider is available for method '${method}'. ` +
                `Supported methods: ${this.getSupportedMethods().join(', ')}`);
        }
        return provider;
    }
    /**
     * Get all registered provider names
     *
     * @returns Array of registered provider names
     */
    getAvailableProviderNames() {
        return Array.from(this.providers.keys());
    }
    /**
     * Get all supported payment methods
     *
     * @returns Array of payment methods that have at least one provider
     */
    getSupportedMethods() {
        return Array.from(this.methodToProvider.keys());
    }
    /**
     * Check if a payment method is supported
     *
     * @param method - The payment method to check
     * @returns true if a provider supports this method, false otherwise
     */
    isMethodSupported(method) {
        return this.methodToProvider.has(method);
    }
    /**
     * Get all registered providers
     *
     * @returns Array of all registered payment provider instances
     */
    getAllProviders() {
        return Array.from(this.providers.values());
    }
    /**
     * Get the number of registered providers
     *
     * @returns The count of registered providers
     */
    getProviderCount() {
        return this.providers.size;
    }
    /**
     * Clear all registered providers
     *
     * This is primarily used for testing purposes.
     * In production, providers should remain registered for the lifetime of the application.
     */
    clearProviders() {
        this.providers.clear();
        this.methodToProvider.clear();
        this.logger.log('All providers cleared');
    }
};
exports.PaymentProviderRegistry = PaymentProviderRegistry;
exports.PaymentProviderRegistry = PaymentProviderRegistry = PaymentProviderRegistry_1 = __decorate([
    (0, common_1.Injectable)()
], PaymentProviderRegistry);
//# sourceMappingURL=payment-provider-registry.service.js.map