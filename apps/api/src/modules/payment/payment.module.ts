import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentProviderRegistry } from './payment-provider-registry.service';
import { PaymentGateway } from './payment.gateway';
import { PrismaModule } from '../../prisma/prisma.module';
import { TestingProvider } from './providers/testing.provider';
import { MidtransProvider } from './providers/midtrans.provider';
import { LocalPaymentProvider } from './providers/local-payment.provider';
import { midtransConfig } from '../../config/midtrans.config';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentController],
  providers: [
    PaymentService, 
    PaymentProviderRegistry,
    PaymentGateway,
    TestingProvider,
    MidtransProvider,
    LocalPaymentProvider
  ],
  exports: [PaymentService, PaymentProviderRegistry],
})
export class PaymentModule implements OnModuleInit {
  private readonly logger = new Logger(PaymentModule.name);

  constructor(
    private readonly registry: PaymentProviderRegistry,
    private readonly testingProvider: TestingProvider,
    private readonly midtransProvider: MidtransProvider,
    private readonly localPaymentProvider: LocalPaymentProvider,
  ) {}

  /**
   * Initialize and register payment providers on module initialization
   * Validates Requirements 9.4, 9.5, 8.3
   */
  async onModuleInit() {
    // Initialize TestingProvider
    await this.testingProvider.initialize({
      environment: 'sandbox',
      serverKey: 'test-key',
    });

    // Register TestingProvider with the registry
    this.registry.registerProvider(this.testingProvider);

    // Initialize MidtransProvider with configuration
    try {
      await this.midtransProvider.initialize({
        environment: midtransConfig.isSandbox ? 'sandbox' : 'production',
        serverKey: midtransConfig.serverKey,
        clientKey: midtransConfig.clientKey,
      });

      // Register MidtransProvider with the registry
      this.registry.registerProvider(this.midtransProvider);
      
      this.logger.log('✅ MidtransProvider registered successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize MidtransProvider. Indonesian payment methods will not be available.', error);
      // Continue application startup - graceful degradation per Requirement 9.5
    }

    await this.localPaymentProvider.initialize({
      environment: 'sandbox',
      serverKey: 'local-demo',
    });
    this.registry.registerProvider(this.localPaymentProvider);
    this.logger.log('LocalPaymentProvider registered for missing demo payment methods');
  }
}
