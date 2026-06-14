# Midtrans SDK Configuration Guide

## Overview

This document provides setup instructions for the Midtrans payment gateway integration used in the Emerald Kingdom auction platform. Midtrans enables QRIS, Virtual Account, and E-Wallet payments for Indonesian users.

## Installation

The `midtrans-client` package (v1.4.3) has been installed in the API workspace:

```bash
cd apps/api
npm install midtrans-client
```

**Status:** ✅ Already installed (verified in package.json)

## Environment Configuration

### Required Environment Variables

Add the following variables to your `.env` file at the project root:

```env
# Midtrans Payment Gateway (Sandbox Mode)
# Get your sandbox credentials from: https://dashboard.sandbox.midtrans.com/settings/config_info
# Server Key: Used for backend API calls (keep secret!)
MIDTRANS_SERVER_KEY="SB-Mid-server-your-key-here"
# Client Key: Used for frontend integration (safe to expose)
MIDTRANS_CLIENT_KEY="SB-Mid-client-your-key-here"
# Set to "true" for sandbox/testing, "false" for production
MIDTRANS_IS_SANDBOX="true"
```

### Variable Descriptions

| Variable | Purpose | Where Used | Security Level |
|----------|---------|------------|----------------|
| `MIDTRANS_SERVER_KEY` | Authenticates backend API requests to Midtrans | Backend only (NestJS services) | 🔒 **Secret** - Never expose to frontend |
| `MIDTRANS_CLIENT_KEY` | Authenticates frontend SDK initialization | Frontend/Backend | ℹ️ Safe to expose |
| `MIDTRANS_IS_SANDBOX` | Toggles between sandbox and production mode | Backend configuration | ℹ️ Configuration flag |

### Getting Your Credentials

#### Sandbox Mode (Testing)

1. Create a Midtrans account at [https://dashboard.sandbox.midtrans.com/](https://dashboard.sandbox.midtrans.com/)
2. Navigate to **Settings** → **Access Keys**
3. Copy your **Server Key** (starts with `SB-Mid-server-`)
4. Copy your **Client Key** (starts with `SB-Mid-client-`)
5. Set `MIDTRANS_IS_SANDBOX="true"`

#### Production Mode (Live Payments)

⚠️ **Important:** Only switch to production when ready for real transactions!

1. Upgrade to production at [https://dashboard.midtrans.com/](https://dashboard.midtrans.com/)
2. Complete business verification requirements
3. Navigate to **Settings** → **Access Keys**
4. Copy your production **Server Key** and **Client Key**
5. Set `MIDTRANS_IS_SANDBOX="false"`

## SDK Usage in Code

### Initialization Example

```typescript
import { Snap, CoreApi } from 'midtrans-client';

// Initialize Snap API (for Snap Payment Gateway)
const snapClient = new Snap({
  isProduction: process.env.MIDTRANS_IS_SANDBOX !== 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Initialize Core API (for direct API transactions)
const coreApiClient = new CoreApi({
  isProduction: process.env.MIDTRANS_IS_SANDBOX !== 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});
```

### Configuration Validation

Add this validation in your service initialization:

```typescript
if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
  throw new Error(
    'MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY must be configured in environment variables'
  );
}

if (process.env.MIDTRANS_SERVER_KEY.includes('your-key-here')) {
  console.warn(
    '⚠️  WARNING: Using placeholder Midtrans credentials. Please update with real keys from Midtrans dashboard.'
  );
}
```

## Supported Payment Methods

The Midtrans SDK supports the following payment methods required by the specification:

### QRIS (QR Code Indonesian Standard)
- Universal QR code scannable by any Indonesian bank app
- Real-time payment confirmation
- 15-minute expiration window

### Virtual Account
- Supported banks: BCA, BNI, Mandiri, BRI, Permata
- Unique account number per transaction
- 24-hour expiration window (configurable)

### E-Wallet
- Supported wallets: GoPay, OVO, Dana, ShopeePay, LinkAja
- Mobile deep linking for seamless payment
- Automatic redirect after payment

## Testing in Sandbox Mode

### Test Credentials

When `MIDTRANS_IS_SANDBOX="true"`, use these test credentials:

#### QRIS Testing
- Scan the generated QR code with Midtrans Simulator app
- Or use the Midtrans Sandbox dashboard to simulate payment

#### Virtual Account Testing
- Use any amount ending in specific digits:
  - `xxx00`: Successful payment
  - `xxx01`: Pending payment
  - `xxx02`: Failed payment

#### E-Wallet Testing
- GoPay: Use test account in Midtrans simulator
- OVO/Dana: Automatic success in sandbox

### Webhook Testing

Configure webhook URL in Midtrans Dashboard:
```
https://your-domain.com/api/webhooks/midtrans
```

For local testing, use ngrok or similar tunneling service:
```bash
ngrok http 3001
# Update webhook URL to: https://xxxx.ngrok.io/api/webhooks/midtrans
```

## Security Best Practices

1. **Never commit actual keys to version control**
   - Use `.env` file (already in `.gitignore`)
   - For team collaboration, share keys through secure channels

2. **Validate webhook signatures**
   - Always verify webhook authenticity using signature validation
   - Reject webhooks with invalid signatures

3. **Use environment-specific keys**
   - Sandbox keys for development/staging
   - Production keys only in production environment

4. **Rotate keys regularly**
   - Midtrans allows key regeneration in dashboard
   - Update environment variables after rotation

## Troubleshooting

### Common Issues

**Issue:** "401 Unauthorized" error
- **Solution:** Verify your Server Key is correct and hasn't expired

**Issue:** "Sandbox mode not working"
- **Solution:** Ensure `MIDTRANS_IS_SANDBOX="true"` (not `"false"`)

**Issue:** "Webhook not received"
- **Solution:** Check webhook URL configuration in Midtrans dashboard

### Verification Commands

Check if package is installed:
```bash
cd apps/api
npm list midtrans-client
```

Test configuration loading:
```typescript
console.log('Midtrans Config:', {
  serverKey: process.env.MIDTRANS_SERVER_KEY?.substring(0, 10) + '...',
  isSandbox: process.env.MIDTRANS_IS_SANDBOX
});
```

## Next Steps

After completing this setup, proceed to:
1. **Task 4.2:** Implement MidtransProvider class
2. **Task 4.3:** Create payment creation endpoints
3. **Task 4.4:** Implement webhook handler

## References

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Midtrans Node.js SDK](https://github.com/Midtrans/midtrans-nodejs-client)
- [API Reference](https://api-docs.midtrans.com/)
- [Sandbox Dashboard](https://dashboard.sandbox.midtrans.com/)
- [Production Dashboard](https://dashboard.midtrans.com/)

## Validation Checklist

- [x] `midtrans-client` package installed in `apps/api/package.json`
- [x] Environment variables added to `.env` file
- [x] Configuration documentation created
- [ ] Replace placeholder keys with real sandbox keys from Midtrans dashboard
- [ ] Test SDK initialization in code
- [ ] Configure webhook URL in Midtrans dashboard

---

**Requirements Validated:** 8.1 (Payment Gateway SDK), 8.2 (Sandbox Mode Configuration), 8.4 (Provider-specific configuration in environment variables)
