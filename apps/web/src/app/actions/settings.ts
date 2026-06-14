"use server";

import { revalidatePath } from "next/cache";
import { Prisma, prisma } from "@emerald-kingdom/db";
import { getSessionUser } from "./session";
import {
  ANONYMOUS_NAMES,
  DisplayPreferences,
  PrivacyPreferences,
  ProfilePrivacyMode,
  mergePreferenceRoot,
  resolveDisplayPreferences,
  resolvePrivacyPreferences,
} from "../../lib/userPreferences";

async function getAuthenticatedUser() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  return prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      rank: true,
      notificationPrefs: true,
      activeWebCodeId: true,
    },
  });
}

export async function updateDisplaySettingsAction(input: Partial<DisplayPreferences>) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "Anda harus login terlebih dahulu." };
  }

  const current = resolveDisplayPreferences(user.notificationPrefs, user.activeWebCodeId);
  const next: DisplayPreferences = {
    ...current,
    appearance: ["dark", "royal", "high-contrast"].includes(input.appearance || "")
      ? input.appearance!
      : current.appearance,
    language: input.language === "en" || input.language === "id" ? input.language : current.language,
    layoutDensity: ["comfortable", "compact", "spacious"].includes(input.layoutDensity || "")
      ? input.layoutDensity!
      : current.layoutDensity,
    eventMode: ["follow", "personal", "platform"].includes(input.eventMode || "")
      ? input.eventMode!
      : current.eventMode,
    webThemeId: typeof input.webThemeId === "string" ? input.webThemeId : input.webThemeId === null ? null : current.webThemeId,
    emailNotifications: typeof input.emailNotifications === "boolean" ? input.emailNotifications : current.emailNotifications,
    pushNotifications: typeof input.pushNotifications === "boolean" ? input.pushNotifications : current.pushNotifications,
    soundEffects: typeof input.soundEffects === "boolean" ? input.soundEffects : current.soundEffects,
    pageTransitions: typeof input.pageTransitions === "boolean" ? input.pageTransitions : current.pageTransitions,
    backgroundEffects: typeof input.backgroundEffects === "boolean" ? input.backgroundEffects : current.backgroundEffects,
    reduceMotion: typeof input.reduceMotion === "boolean" ? input.reduceMotion : current.reduceMotion,
  };

  if (next.webThemeId) {
    const ownsTheme = user.rank === "EMPEROR"
      ? await prisma.cosmetic.count({ where: { id: next.webThemeId, type: "WEB_CODE" } })
      : await prisma.userCosmetic.count({
          where: {
            userId: user.id,
            cosmeticId: next.webThemeId,
            cosmetic: { type: "WEB_CODE" },
          },
        });

    if (!ownsTheme) {
      return { success: false, error: "Tema website tidak tersedia untuk akun ini." };
    }
  }

  const notificationPrefs = mergePreferenceRoot(user.notificationPrefs, "display", next as unknown as Record<string, unknown>);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      notificationPrefs: notificationPrefs as Prisma.InputJsonObject,
      activeWebCodeId: next.webThemeId,
    },
  });

  revalidatePath("/settings/display");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updatePrivacySettingsAction(
  privacyMode: ProfilePrivacyMode,
  input: Partial<PrivacyPreferences>,
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "Anda harus login terlebih dahulu." };
  }

  const current = resolvePrivacyPreferences(user.notificationPrefs);
  const next: PrivacyPreferences = {
    ...current,
    showBidStats: typeof input.showBidStats === "boolean" ? input.showBidStats : current.showBidStats,
    showAchievements: typeof input.showAchievements === "boolean" ? input.showAchievements : current.showAchievements,
    showWonItems: typeof input.showWonItems === "boolean" ? input.showWonItems : current.showWonItems,
    showCosmetics: typeof input.showCosmetics === "boolean" ? input.showCosmetics : current.showCosmetics,
    showRankExp: typeof input.showRankExp === "boolean" ? input.showRankExp : current.showRankExp,
    showJoinedAt: typeof input.showJoinedAt === "boolean" ? input.showJoinedAt : current.showJoinedAt,
    showOnlineStatus: typeof input.showOnlineStatus === "boolean" ? input.showOnlineStatus : current.showOnlineStatus,
    anonymousName: ANONYMOUS_NAMES.includes(input.anonymousName || "")
      ? input.anonymousName!
      : current.anonymousName,
    bidHistoryVisibility: ["EVERYONE", "FRIENDS", "NONE"].includes(input.bidHistoryVisibility || "")
      ? input.bidHistoryVisibility!
      : current.bidHistoryVisibility,
    watchlistVisibility: input.watchlistVisibility === "EVERYONE" || input.watchlistVisibility === "NONE"
      ? input.watchlistVisibility
      : current.watchlistVisibility,
  };

  const safePrivacyMode: ProfilePrivacyMode = ["PUBLIC", "ANONYMOUS", "SHADOW"].includes(privacyMode)
    ? privacyMode
    : "PUBLIC";
  const notificationPrefs = mergePreferenceRoot(user.notificationPrefs, "privacy", next as unknown as Record<string, unknown>);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      privacyMode: safePrivacyMode,
      notificationPrefs: notificationPrefs as Prisma.InputJsonObject,
    },
  });

  revalidatePath("/settings/privacy");
  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: true };
}
