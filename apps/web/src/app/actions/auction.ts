"use server";

import { serverPostApi } from "./apiProxy";

export async function placePhantomBidAction(auctionId: string, maxAmount: number) {
  try {
    const result = await serverPostApi<any>(`/auctions/${auctionId}/phantom-bid`, {
      maxAmount,
      idempotencyKey: `phantom-${auctionId}-${Date.now()}`
    });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memasang Phantom Bid." };
  }
}
