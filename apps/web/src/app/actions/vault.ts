"use server";

import { serverGetApi, serverPostApi } from "./apiProxy";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "./session";
import { prisma } from "@emerald-kingdom/db";

export async function submitVaultOfferingAction(data: any) {
  try {
    const result = await serverPostApi<any>("/vault-offering", data);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Pengajuan gagal." };
  }
}

export async function fetchVaultOfferingsAction() {
  try {
    return await serverGetApi<any[]>("/vault-offering/status");
  } catch (error) {
    return null;
  }
}

/**
 * Toggles the visibility of a vault item (cosmetic or auction)
 * on the user's public profile.
 */
export async function toggleVaultItemVisibilityAction(itemId: string, itemType: "cosmetic" | "auction", isHidden: boolean) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { hiddenVaultItems: true }
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    let hiddenItems = user.hiddenVaultItems as { cosmetics?: string[], auctions?: string[] } | null;
    
    if (!hiddenItems || typeof hiddenItems !== "object" || Array.isArray(hiddenItems)) {
      hiddenItems = { cosmetics: [], auctions: [] };
    }
    
    if (!hiddenItems.cosmetics) hiddenItems.cosmetics = [];
    if (!hiddenItems.auctions) hiddenItems.auctions = [];

    const targetArray = itemType === "cosmetic" ? hiddenItems.cosmetics : hiddenItems.auctions;

    if (isHidden) {
      if (!targetArray.includes(itemId)) {
        targetArray.push(itemId);
      }
    } else {
      const index = targetArray.indexOf(itemId);
      if (index !== -1) {
        targetArray.splice(index, 1);
      }
    }

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { hiddenVaultItems: hiddenItems }
    });

    revalidatePath("/vault");
    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to toggle visibility:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Equips a cosmetic item for the user.
 */
export async function equipCosmeticAction(cosmeticId: string | null, cosmeticType: "FRAME" | "BANNER" | "NAME_EFFECT" | "WALLET_SKIN" | "WEB_CODE") {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return { success: false, error: "Not authenticated" };
    }

    const updateData: any = {};
    if (cosmeticType === "FRAME") updateData.activeCoatFrame = cosmeticId;
    else if (cosmeticType === "BANNER") updateData.activeBannerId = cosmeticId;
    else if (cosmeticType === "NAME_EFFECT") updateData.activeNameEffect = cosmeticId;
    else if (cosmeticType === "WALLET_SKIN") updateData.activeWalletSkin = cosmeticId;
    else if (cosmeticType === "WEB_CODE") updateData.activeWebCodeId = cosmeticId;

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: updateData
    });

    // Revalidate the entire application layout so injected cosmetics take effect immediately
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (err: any) {
    console.error("Failed to equip cosmetic:", err);
    return { success: false, error: err.message };
  }
}
