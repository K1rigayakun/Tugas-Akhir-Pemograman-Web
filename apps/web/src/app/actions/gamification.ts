"use server";

import { serverGetApi } from "./apiProxy";

export async function fetchUserAchievementsAction() {
  try {
    const user = await serverGetApi<any>("/auth/me");
    if (user && user.id) {
      return await serverGetApi<any[]>(`/users/${user.id}/achievements`);
    }
  } catch (error) {
    // Abaikan error jika belum login
  }
  
  // Fallback ke public achievements
  try {
    return await serverGetApi<any[]>("/achievements");
  } catch (error) {
    return [];
  }
}
