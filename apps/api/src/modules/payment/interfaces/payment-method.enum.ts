/**
 * Payment methods supported by the payment system
 * Validates Requirements 9.1, 9.2
 */
export enum PaymentMethod {
  QRIS = 'QRIS',
  VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT',
  EWALLET = 'EWALLET',
  STRIPE = 'STRIPE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  TESTING = 'TESTING'
}
