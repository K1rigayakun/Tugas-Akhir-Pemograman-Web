"use server";

import { serverGetApi, serverPostApi } from "./apiProxy";

export async function fetchShopItemsAction() {
  try {
    return await serverGetApi<any[]>("/shop/items");
  } catch (error) {
    return null;
  }
}

export async function purchaseShopItemAction(itemId: string) {
  try {
    const idempotencyKey = `web-${itemId}-${Date.now()}`;
    const result = await serverPostApi<any>(`/shop/purchase/${itemId}`, { idempotencyKey });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Pembelian gagal." };
  }
}
