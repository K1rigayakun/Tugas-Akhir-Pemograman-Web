"use server";

import { serverGetApi, serverPostApi } from "./apiProxy";

/**
 * Initiate a new payment
 * POST /payment/initiate
 */
export async function initiatePaymentAction(
  amount: number,
  fiatAmount: number,
  method: string,
  options?: { bank?: string; walletType?: string }
) {
  try {
    const data = await serverPostApi<any>("/payment/initiate", {
      amount,
      fiatAmount,
      method,
      ...options,
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Get payment details by ID
 * GET /payment/:id
 */
export async function getPaymentAction(paymentId: string) {
  try {
    const data = await serverGetApi<any>(`/payment/${paymentId}`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Complete a test payment
 * POST /payment/:id/complete-test
 */
export async function completeTestPaymentAction(paymentId: string) {
  try {
    const data = await serverPostApi<any>(`/payment/${paymentId}/complete-test`, {});
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Get user payment history
 * GET /payment/user/history
 */
export async function getPaymentHistoryAction(page: number = 1, limit: number = 20) {
  try {
    const data = await serverGetApi<{
      data: any[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/payment/user/history?page=${page}&limit=${limit}`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Upload proof of payment image
 * POST /payment/:id/upload-proof
 */
export async function uploadProofImageAction(paymentId: string, formData: FormData) {
  try {
    const { serverUploadApi } = await import("./apiProxy");
    const data = await serverUploadApi<{ proofImageUrl: string }>(
      `/payment/${paymentId}/upload-proof`,
      formData
    );
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
