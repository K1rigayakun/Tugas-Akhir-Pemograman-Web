"use server";

import { cookies } from "next/headers";
import { API_URL } from "../../lib/api";

/**
 * getSessionUser — Baca cookie accessToken, lalu fetch /auth/me untuk data user.
 * Return null jika belum login atau token expired.
 */
export async function getSessionUser(): Promise<{
  id: string;
  username: string;
  email: string;
  rank: string;
  avatarUrl?: string;
  kycStatus?: string;
  totalExp?: number;
  totalWins?: number;
  totalBids?: number;
  activeCoatFrame?: string | null;
  activeNameEffect?: string | null;
  activeWalletSkin?: string | null;
  activeWebCodeId?: string | null;
  activeBannerId?: string | null;
  walletBalance?: number;
} | null> {
  try {
    const token = cookies().get("accessToken")?.value;
    if (!token) return null;

    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();
    
    // Fetch wallet balance if user is authenticated
    let walletBalance = 0;
    try {
      const walletResponse = await fetch(`${API_URL}/wallet/balance`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        walletBalance = walletData.balance || 0;
      }
    } catch {
      // If wallet fetch fails, default to 0
      walletBalance = 0;
    }

    return {
      id: data.id,
      username: data.username || data.email?.split("@")[0] || "User",
      email: data.email,
      rank: data.rank || "CIVIS",
      avatarUrl: data.avatarUrl,
      kycStatus: data.kycStatus,
      totalExp: data.totalExp,
      totalWins: data.totalWins,
      totalBids: data.totalBids,
      activeCoatFrame: data.activeCoatFrame,
      activeNameEffect: data.activeNameEffect,
      activeWalletSkin: data.activeWalletSkin,
      activeWebCodeId: data.activeWebCodeId,
      activeBannerId: data.activeBannerId,
      walletBalance,
    };
  } catch {
    return null;
  }
}

/**
 * logoutAction — Hapus cookie accessToken dan refreshToken.
 */
export async function logoutAction() {
  const cookieStore = cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}
