# PaymentProviderRegistry Service

## Overview

The `PaymentProviderRegistry` is a NestJS service that manages the registration and retrieval of payment providers for the Emerald Kingdom auction platform. It acts as a central registry where all payment providers (Midtrans, Xendit, Stripe, Testing) are registered during module initialization, allowing the `PaymentService` to dynamically select the appropriate provider based on the payment method requested by users.

**Validates Requirements:** 9.3, 9.4, 9.5

## Features

- ✅ **Provider Registration**: Register multiple payment providers at module initialization
- ✅ **Method-based Lookup**: Get the appropriate provider for any payment method (QRIS, VA, E-Wallet, Stripe, Testing)
- ✅ **Name-based Lookup**: Retrieve providers by their unique name (useful for webhook processing)
- ✅ **Graceful Error Handling**: Provides helpful error messages with available options when providers/methods not found
- ✅ **Support Checking**: Verify if a payment method is supported before processing
- ✅ **Injectable Service**: Fully integrated with NestJS dependency injection

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              PaymentProviderRegistry                    │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Provider Map (by name)                           │ │
│  │  MIDTRANS → MidtransProvider                      │ │
│  │  XENDIT → XenditProvider                          │ │
│  │  STRIPE → StripeProvider                          │ │
│  │  TESTING → TestingProvider                        │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Method-to-Provider Map                           │ │
│  │  QRIS → MidtransProvider                          │ │
│  │  VIRTUAL_ACCOUNT → MidtransProvider               │ │
│  │  EWALLET → MidtransProvider                       │ │
│  │  STRIPE → StripeProvider                          │ │
│  │  TESTING → TestingProvider                        │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## API Reference

### Core Methods

#### `registerProvider(provider: PaymentProvider): void`

Registers a payment provider in the registry. This method is called during module initialization.

**Parameters:**
- `provider`: The payment provider instance implementing the `PaymentProvider` interface

**Behavior:**
- Stores the provider by its name (case-insensitive, converted to uppercase)
- Maps each of the provider's supported methods to the provider
- If a provider with the same name already exists, logs a warning and skips registration
- If a method is already mapped to another provider, the first registered provider takes precedence

**Example:**
```typescript
const midtransProvider = new MidtransProvider();
registry.registerProvider(midtransProvider);
```

#### `getProviderByName(name: string): PaymentProvider`

Retrieves a payment provider by its unique name.

**Parameters:**
- `name`: The provider name (case-insensitive)

**Returns:** The `PaymentProvider` instance

**Throws:** `NotFoundException` if the provider is not registered

**Use Cases:**
- Processing webhooks (provider name from URL)
- Manual provider selection
- Testing specific providers

**Example:**
```typescript
const midtransProvider = registry.getProviderByName('MIDTRANS');
// or
const provider = registry.getProviderByName('midtrans'); // case-insensitive
```

#### `getProviderForMethod(method: PaymentMethod): PaymentProvider`

Retrieves the payment provider that handles the specified payment method. This is the **primary method** used by `PaymentService`.

**Parameters:**
- `method`: The payment method enum value (QRIS, VIRTUAL_ACCOUNT, EWALLET, STRIPE, TESTING)

**Returns:** The `PaymentProvider` that supports this method

**Throws:** `NotFoundException` if no provider supports the method

**Use Cases:**
- Creating payment transactions (user selects method, system finds provider)
- Validating method availability
- Dynamic provider selection

**Example:**
```typescript
// User selects QRIS payment
const provider = registry.getProviderForMethod(PaymentMethod.QRIS);
const payment = await provider.createPayment({ ... });
```

#### `isMethodSupported(method: PaymentMethod): boolean`

Checks if a payment method is currently supported by any registered provider.

**Parameters:**
- `method`: The payment method to check

**Returns:** `true` if supported, `false` otherwise

**Use Cases:**
- UI conditional rendering (show/hide payment options)
- Validation before processing
- Feature flags

**Example:**
```typescript
if (registry.isMethodSupported(PaymentMethod.QRIS)) {
  // Show QRIS option in UI
}
```

### Utility Methods

#### `getAvailableProviderNames(): string[]`

Returns an array of all registered provider names.

**Example:**
```typescript
const providers = registry.getAvailableProviderNames();
// ['MIDTRANS', 'STRIPE', 'TESTING']
```

#### `getSupportedMethods(): PaymentMethod[]`

Returns an array of all payment methods that have at least one registered provider.

**Example:**
```typescript
const methods = registry.getSupportedMethods();
// [PaymentMethod.QRIS, PaymentMethod.VIRTUAL_ACCOUNT, ...]
```

#### `getAllProviders(): PaymentProvider[]`

Returns an array of all registered payment provider instances.

**Example:**
```typescript
const allProviders = registry.getAllProviders();
```

#### `getProviderCount(): number`

Returns the total number of registered providers.

**Example:**
```typescript
const count = registry.getProviderCount(); // 4
```

#### `clearProviders(): void`

Clears all registered providers. Primarily used for testing.

**Example:**
```typescript
registry.clearProviders();
```

## Usage in PaymentModule

The registry is registered as a provider in the `PaymentModule` and providers are registered during module initialization:

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { PaymentProviderRegistry } from './payment-provider-registry.service';
import { MidtransProvider } from './providers/midtrans.provider';
import { StripeProvider } from './providers/stripe.provider';
import { TestingProvider } from './providers/testing.provider';

@Module({
  providers: [
    PaymentService,
    PaymentProviderRegistry,
    MidtransProvider,
    StripeProvider,
    TestingProvider
  ],
  exports: [PaymentService, PaymentProviderRegistry]
})
export class PaymentModule implements OnModuleInit {
  constructor(
    private readonly registry: PaymentProviderRegistry,
    private readonly midtransProvider: MidtransProvider,
    private readonly stripeProvider: StripeProvider,
    private readonly testingProvider: TestingProvider
  ) {}

  async onModuleInit() {
    // Register providers during module initialization
    this.registry.registerProvider(this.midtransProvider);
    this.registry.registerProvider(this.stripeProvider);
    this.registry.registerProvider(this.testingProvider);
    
    this.logger.log(
      `Registered payment providers: ${this.registry.getAvailableProviderNames().join(', ')}`
    );
  }
}
```

## Usage in PaymentService

The `PaymentService` uses the registry to dynamically select providers:

```typescript
@Injectable()
export class PaymentService {
  constructor(
    private readonly registry: PaymentProviderRegistry,
    private readonly prisma: PrismaService
  ) {}

  async initiatePayment(
    userId: string,
    amount: number,
    method: PaymentMethod
  ): Promise<TopUpRequest> {
    // Get provider for the selected method
    const provider = this.registry.getProviderForMethod(method);
    
    // Use the provider
    const paymentResponse = await provider.createPayment({
      userId,
      amount,
      fiatAmount: amount * 1000,
      method
    });
    
    // Store in database
    return this.prisma.topUpRequest.create({
      data: {
        userId,
        amount,
        method,
        provider: provider.name,
        paymentDetails: paymentResponse.paymentDetails,
        expiresAt: paymentResponse.expiresAt,
        status: 'PENDING'
      }
    });
  }

  async handleWebhook(providerName: string, payload: any, signature: string) {
    // Get provider by name
    const provider = this.registry.getProviderByName(providerName);
    
    // Validate and process
    const isValid = await provider.validateWebhook(payload, signature);
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
    
    return provider.processWebhook(payload);
  }
}
```

## Error Handling

The registry provides helpful error messages when providers or methods are not found:

### Provider Not Found

```typescript
try {
  registry.getProviderByName('NONEXISTENT');
} catch (error) {
  // NotFoundException: Payment provider 'NONEXISTENT' is not registered. 
  // Available providers: MIDTRANS, STRIPE, TESTING
}
```

### Method Not Supported

```typescript
try {
  registry.getProviderForMethod(PaymentMethod.QRIS);
} catch (error) {
  // NotFoundException: No payment provider is available for method 'QRIS'. 
  // Supported methods: STRIPE, TESTING
}
```

## Provider Precedence

When multiple providers support the same payment method, the **first registered provider** takes precedence:

```typescript
// If both Midtrans and Xendit support QRIS:
registry.registerProvider(midtransProvider);  // Registered first
registry.registerProvider(xenditProvider);     // Registered second

// QRIS will use Midtrans
const provider = registry.getProviderForMethod(PaymentMethod.QRIS);
console.log(provider.name); // "MIDTRANS"
```

To override this behavior, register providers in the desired order or implement a priority system.

## Testing

For testing, you can create mock providers and register them:

```typescript
const mockProvider: PaymentProvider = {
  name: 'MOCK',
  supportedMethods: [PaymentMethod.TESTING],
  initialize: async () => {},
  createPayment: async () => ({ ... }),
  checkPaymentStatus: async () => ({ ... }),
  validateWebhook: async () => true,
  processWebhook: async () => ({ ... })
};

const registry = new PaymentProviderRegistry();
registry.registerProvider(mockProvider);

// Use in tests
const provider = registry.getProviderForMethod(PaymentMethod.TESTING);
expect(provider.name).toBe('MOCK');
```

## Best Practices

1. **Register During Module Init**: Always register providers in the `OnModuleInit` lifecycle hook
2. **Use Method-Based Lookup**: Prefer `getProviderForMethod()` over `getProviderByName()` when creating payments
3. **Check Support**: Use `isMethodSupported()` for conditional logic before attempting to create payments
4. **Handle Errors**: Always wrap provider lookups in try-catch blocks
5. **Log Registration**: Log registered providers at startup for debugging
6. **Test Coverage**: Test both successful lookups and error cases

## Related Files

- `payment-provider.interface.ts` - PaymentProvider interface definition
- `payment-method.enum.ts` - PaymentMethod enum
- `payment-types.ts` - Type definitions for payment operations
- `payment-provider-registry.example.ts` - Detailed usage examples
- `payment.module.ts` - Module registration

## Requirements Validated

- **Requirement 9.3**: Registry supports retrieval by method and name
- **Requirement 9.4**: Providers are registered at application startup
- **Requirement 9.5**: Graceful error handling with helpful messages when providers are missing
