"use strict";
/**
 * Midtrans Configuration
 *
 * Validates and exports Midtrans payment gateway configuration
 * from environment variables for use throughout the application.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.midtransConfig = void 0;
exports.loadMidtransConfig = loadMidtransConfig;
/**
 * Load and validate Midtrans configuration from environment variables
 * @throws Error if required configuration is missing
 */
function loadMidtransConfig() {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    const isSandbox = process.env.MIDTRANS_IS_SANDBOX === 'true';
    // Validate required configuration
    if (!serverKey) {
        throw new Error('MIDTRANS_SERVER_KEY is required in environment variables. ' +
            'Get your key from https://dashboard.sandbox.midtrans.com/settings/config_info');
    }
    if (!clientKey) {
        throw new Error('MIDTRANS_CLIENT_KEY is required in environment variables. ' +
            'Get your key from https://dashboard.sandbox.midtrans.com/settings/config_info');
    }
    // Warn about placeholder values
    if (serverKey.includes('your-key-here') || clientKey.includes('your-key-here')) {
        console.warn('⚠️  WARNING: Midtrans is using placeholder credentials.\n' +
            '   Please update MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY in your .env file\n' +
            '   Get real keys from: https://dashboard.sandbox.midtrans.com/settings/config_info');
    }
    // Log configuration status (masked for security)
    console.log('✅ Midtrans configuration loaded:', {
        serverKey: maskKey(serverKey),
        clientKey: maskKey(clientKey),
        mode: isSandbox ? 'SANDBOX' : 'PRODUCTION',
    });
    return {
        serverKey,
        clientKey,
        isSandbox,
    };
}
/**
 * Mask sensitive key for logging (show first 10 and last 4 characters)
 */
function maskKey(key) {
    if (key.length <= 14) {
        return key.substring(0, 6) + '...' + key.substring(key.length - 4);
    }
    return key.substring(0, 10) + '...' + key.substring(key.length - 4);
}
/**
 * Midtrans configuration singleton
 */
exports.midtransConfig = loadMidtransConfig();
//# sourceMappingURL=midtrans.config.js.map