"use server";

import { prisma } from "@emerald-kingdom/db";
import { getSessionUser } from "./session";
import { cookies } from "next/headers";

export async function equipCosmeticAction(cosmeticId: string) {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, message: "Anda harus login untuk menggunakan fitur ini." };
  }

  try {
    // 1. Verify cosmetic existence
    const cosmetic = await prisma.cosmetic.findUnique({
      where: { id: cosmeticId },
    });

    if (!cosmetic) {
      return { success: false, message: "Kosmetik tidak ditemukan." };
    }

    // 2. Verify user ownership
    const ownership = await prisma.userCosmetic.findUnique({
      where: {
        userId_cosmeticId: {
          userId: user.id,
          cosmeticId: cosmetic.id,
        },
      },
    });

    // We allow equipping if they own it
    if (!ownership) {
      return { success: false, message: "Anda tidak memiliki kosmetik ini." };
    }

    // 3. Equip logic based on type
    const updateData: any = {};
    if (cosmetic.type === "WEB_CODE") {
      updateData.activeWebCodeId = cosmetic.id;
      // Also set cookie as fallback
      cookies().set("equipped_web_code_id", cosmetic.id, { maxAge: 60 * 60 * 24 * 30 });
    } else if (cosmetic.type === "FRAME") {
      updateData.activeCoatFrame = cosmetic.id;
      cookies().set("equipped_frame_id", cosmetic.id, { maxAge: 60 * 60 * 24 * 30 });
    } else if (cosmetic.type === "NAME_EFFECT") {
      updateData.activeNameEffect = cosmetic.id;
      cookies().set("equipped_name_effect_id", cosmetic.id, { maxAge: 60 * 60 * 24 * 30 });
    } else if (cosmetic.type === "WALLET_SKIN") {
      updateData.activeWalletSkin = cosmetic.id;
      cookies().set("equipped_wallet_skin_id", cosmetic.id, { maxAge: 60 * 60 * 24 * 30 });
    } else if (cosmetic.type === "BANNER") {
      updateData.activeBannerId = cosmetic.id;
      cookies().set("equipped_banner_id", cosmetic.id, { maxAge: 60 * 60 * 24 * 30 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return { success: true, message: `Kosmetik ${cosmetic.name} berhasil dipakai.` };
  } catch (error: any) {
    console.error("Failed to equip cosmetic:", error);
    return { success: false, message: "Gagal memakai kosmetik: " + (error?.message || "Kesalahan server") };
  }
}
