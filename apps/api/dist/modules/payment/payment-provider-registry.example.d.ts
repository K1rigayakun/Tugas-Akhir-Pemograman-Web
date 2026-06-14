/**
 * PaymentProviderRegistry Usage Examples
 *
 * This file demonstrates how to use the PaymentProviderRegistry service
 * to register and retrieve payment providers dynamically.
 *
 * Validates Requirements 9.3, 9.4, 9.5
 */
import { PaymentProviderRegistry } from './payment-provider-registry.service';
import { PaymentMethod } from './interfaces/payment-method.enum';
import { PaymentResponse, WebhookResult } from './interfaces/payment-types';
/**
 * Example 1: Registering providers at module initialization
 *
 * In a real application, providers would be registered in the PaymentModule
 * during the OnModuleInit lifecycle hook.
 */
declare function example1_RegisteringProviders(): Promise<void>;
/**
 * Example 2: Retrieving provider by payment method
 *
 * This is the primary way PaymentService will use the registry
 * to dynamically select the correct provider based on user's choice.
 */
declare function example2_GetProviderForMethod(registry: PaymentProviderRegistry, method: PaymentMethod): Promise<PaymentResponse>;
/**
 * Example 3: Retrieving provider by name
 *
 * This is useful when processing webhooks where you know the provider name
 * from the webhook endpoint URL.
 */
declare function example3_GetProviderByName(registry: PaymentProviderRegistry, providerName: string, webhookPayload: any, signature: string): Promise<WebhookResult>;
/**
 * Example 4: Graceful error handling
 *
 * The registry provides helpful error messages when providers are not found.
 */
declare function example4_ErrorHandling(registry: PaymentProviderRegistry): Promise<void>;
/**
 * Example 5: Checking method support before using
 *
 * This is useful for conditional logic or validation.
 */
declare function example5_CheckMethodSupport(registry: PaymentProviderRegistry, method: PaymentMethod): boolean;
/**
 * Example 6: Integration with NestJS PaymentModule
 *
 * This shows how the registry would be used in the actual module.
 */
/**
 * Example 7: Usage in PaymentService
 *
 * This shows how PaymentService would use the registry to process payments.
 */
export { example1_RegisteringProviders, example2_GetProviderForMethod, example3_GetProviderByName, example4_ErrorHandling, example5_CheckMethodSupport };
//# sourceMappingURL=payment-provider-registry.example.d.ts.map