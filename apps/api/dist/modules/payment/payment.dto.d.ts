/**
 * Payment method enum for DTO validation
 */
export declare enum PaymentMethodDto {
    QRIS = "QRIS",
    VIRTUAL_ACCOUNT = "VIRTUAL_ACCOUNT",
    EWALLET = "EWALLET",
    STRIPE = "STRIPE",
    BANK_TRANSFER = "BANK_TRANSFER",
    TESTING = "TESTING"
}
/**
 * DTO for initiating a new payment
 * Validates Requirements 2.1, 10.2, 10.3
 */
export declare class InitiatePaymentDto {
    amount: number;
    fiatAmount: number;
    method: PaymentMethodDto;
    bank?: string;
    walletType?: string;
}
/**
 * DTO for approving a payment
 * Validates Requirements 6.3, 6.5
 */
export declare class ApprovePaymentDto {
    notes?: string;
}
/**
 * DTO for rejecting a payment
 * Validates Requirements 6.4, 6.7
 */
export declare class RejectPaymentDto {
    notes: string;
}
/**
 * DTO for payment list query parameters
 */
export declare class PaymentListQueryDto {
    status?: string;
    method?: string;
    page?: number;
    limit?: number;
}
//# sourceMappingURL=payment.dto.d.ts.map