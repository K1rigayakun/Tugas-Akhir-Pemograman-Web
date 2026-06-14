"use server";

import { serverGetApi, serverPostApi } from "./apiProxy";

export async function getWalletBalanceAction() {
  try {
    const data = await serverGetApi<{
      totalBalance: number;
      pendingHold: number;
      availableBalance: number;
      totalTopUp: number;
      totalSpent: number;
    }>("/wallet/balance");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function topUpAction(amount: number) {
  try {
    const data = await serverPostApi<{
      orderId: string;
      amount: number;
      snapToken: string;
      redirectUrl: string;
    }>("/wallet/dummy-topup", { amount });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function manualTopUpAction(amount: number, fiatAmount: number, method: string) {
  try {
    const data = await serverPostApi<any>("/payment/manual", {
      amount,
      fiatAmount,
      method,
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getWalletTransactionsAction() {
  try {
    const data = await serverGetApi<any[]>("/wallet/transactions");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
