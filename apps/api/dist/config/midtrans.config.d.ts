/**
 * Midtrans Configuration
 *
 * Validates and exports Midtrans payment gateway configuration
 * from environment variables for use throughout the application.
 */
export interface MidtransConfig {
    serverKey: string;
    clientKey: string;
    isSandbox: boolean;
}
/**
 * Load and validate Midtrans configuration from environment variables
 * @throws Error if required configuration is missing
 */
export declare function loadMidtransConfig(): MidtransConfig;
/**
 * Midtrans configuration singleton
 */
export declare const midtransConfig: MidtransConfig;
//# sourceMappingURL=midtrans.config.d.ts.map