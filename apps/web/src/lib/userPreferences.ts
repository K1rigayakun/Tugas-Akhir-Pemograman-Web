export type AppearanceMode = "dark" | "royal" | "high-contrast";
export type LayoutDensity = "comfortable" | "compact" | "spacious";
export type EventDisplayMode = "follow" | "personal" | "platform";
export type ProfilePrivacyMode = "PUBLIC" | "ANONYMOUS" | "SHADOW";
export type VisibilityAudience = "EVERYONE" | "FRIENDS" | "NONE";

export interface DisplayPreferences {
  appearance: AppearanceMode;
  language: "id" | "en";
  layoutDensity: LayoutDensity;
  eventMode: EventDisplayMode;
  webThemeId: string | null;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEffects: boolean;
  pageTransitions: boolean;
  backgroundEffects: boolean;
  reduceMotion: boolean;
}

export interface PrivacyPreferences {
  showBidStats: boolean;
  showAchievements: boolean;
  showWonItems: boolean;
  showCosmetics: boolean;
  showRankExp: boolean;
  showJoinedAt: boolean;
  showOnlineStatus: boolean;
  anonymousName: string;
  bidHistoryVisibility: VisibilityAudience;
  watchlistVisibility: Exclude<VisibilityAudience, "FRIENDS">;
}

export const ANONYMOUS_NAMES = [
  "The Silent Knight",
  "Shadow of Dusk",
  "The Iron Vassal",
  "Crimson Herald",
  "The Veiled Pilgrim",
  "The Ashen Scribe",
  "The Emerald Warden",
  "Moonlit Castellan",
  "The Hollow Baron",
  "The Wandering Duke",
  "Ivory Sentinel",
  "The Nameless Herald",
  "The Gilded Falcon",
  "Raven of the Keep",
  "The Frost Vassal",
  "The Distant Regent",
  "Sable Watcher",
  "The Amber Seer",
  "The Quiet Marshal",
  "The Old Gatekeeper",
  "Velvet Templar",
  "The Duskworn Heir",
  "The Glass Chancellor",
  "The Bronze Pilgrim",
  "The Last Courier",
  "The Hidden Lancer",
  "Warden of Thorns",
  "The Pale Minstrel",
  "The Starless Earl",
  "The Crownless Rider",
  "The Silver Oath",
  "The Obsidian Page",
  "The Green Cloak",
  "The Bitter Alchemist",
  "The Vowbound Scout",
  "The Quiet Falconer",
  "Keeper of Embers",
  "The Masked Envoy",
  "The Lowland Knight",
  "The Far Watch",
  "The Thorn Herald",
  "The Hidden Viscount",
  "The Mute Cartographer",
  "The Night Bailiff",
  "The Wandering Castellan",
  "The Saffron Guard",
  "The Rose Vassal",
  "The Ashen Envoy",
  "The Verdant Stranger",
  "The Clocktower Scribe",
  "The Unseen Warden",
  "The Golden Recluse",
];

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  appearance: "dark",
  language: "id",
  layoutDensity: "comfortable",
  eventMode: "follow",
  webThemeId: null,
  emailNotifications: true,
  pushNotifications: true,
  soundEffects: false,
  pageTransitions: true,
  backgroundEffects: true,
  reduceMotion: false,
};

export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  showBidStats: true,
  showAchievements: true,
  showWonItems: true,
  showCosmetics: true,
  showRankExp: true,
  showJoinedAt: true,
  showOnlineStatus: true,
  anonymousName: ANONYMOUS_NAMES[0],
  bidHistoryVisibility: "EVERYONE",
  watchlistVisibility: "EVERYONE",
};

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function pickString<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function pickBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function resolveDisplayPreferences(
  notificationPrefs: unknown,
  activeWebCodeId?: string | null,
): DisplayPreferences {
  const root = asRecord(notificationPrefs);
  const display = asRecord(root.display);

  return {
    appearance: pickString(display.appearance, ["dark", "royal", "high-contrast"], DEFAULT_DISPLAY_PREFERENCES.appearance),
    language: pickString(display.language, ["id", "en"], DEFAULT_DISPLAY_PREFERENCES.language),
    layoutDensity: pickString(display.layoutDensity, ["comfortable", "compact", "spacious"], DEFAULT_DISPLAY_PREFERENCES.layoutDensity),
    eventMode: pickString(display.eventMode, ["follow", "personal", "platform"], DEFAULT_DISPLAY_PREFERENCES.eventMode),
    webThemeId: typeof activeWebCodeId === "string" ? activeWebCodeId : (typeof display.webThemeId === "string" ? display.webThemeId : null),
    emailNotifications: pickBoolean(display.emailNotifications, DEFAULT_DISPLAY_PREFERENCES.emailNotifications),
    pushNotifications: pickBoolean(display.pushNotifications, DEFAULT_DISPLAY_PREFERENCES.pushNotifications),
    soundEffects: pickBoolean(display.soundEffects, DEFAULT_DISPLAY_PREFERENCES.soundEffects),
    pageTransitions: pickBoolean(display.pageTransitions, DEFAULT_DISPLAY_PREFERENCES.pageTransitions),
    backgroundEffects: pickBoolean(display.backgroundEffects, DEFAULT_DISPLAY_PREFERENCES.backgroundEffects),
    reduceMotion: pickBoolean(display.reduceMotion, DEFAULT_DISPLAY_PREFERENCES.reduceMotion),
  };
}

export function resolvePrivacyPreferences(notificationPrefs: unknown): PrivacyPreferences {
  const root = asRecord(notificationPrefs);
  const privacy = asRecord(root.privacy);

  return {
    showBidStats: pickBoolean(privacy.showBidStats, DEFAULT_PRIVACY_PREFERENCES.showBidStats),
    showAchievements: pickBoolean(privacy.showAchievements, DEFAULT_PRIVACY_PREFERENCES.showAchievements),
    showWonItems: pickBoolean(privacy.showWonItems, DEFAULT_PRIVACY_PREFERENCES.showWonItems),
    showCosmetics: pickBoolean(privacy.showCosmetics, DEFAULT_PRIVACY_PREFERENCES.showCosmetics),
    showRankExp: pickBoolean(privacy.showRankExp, DEFAULT_PRIVACY_PREFERENCES.showRankExp),
    showJoinedAt: pickBoolean(privacy.showJoinedAt, DEFAULT_PRIVACY_PREFERENCES.showJoinedAt),
    showOnlineStatus: pickBoolean(privacy.showOnlineStatus, DEFAULT_PRIVACY_PREFERENCES.showOnlineStatus),
    anonymousName: ANONYMOUS_NAMES.includes(privacy.anonymousName as string)
      ? (privacy.anonymousName as string)
      : DEFAULT_PRIVACY_PREFERENCES.anonymousName,
    bidHistoryVisibility: pickString(privacy.bidHistoryVisibility, ["EVERYONE", "FRIENDS", "NONE"], DEFAULT_PRIVACY_PREFERENCES.bidHistoryVisibility),
    watchlistVisibility: pickString(privacy.watchlistVisibility, ["EVERYONE", "NONE"], DEFAULT_PRIVACY_PREFERENCES.watchlistVisibility),
  };
}

export function mergePreferenceRoot(
  notificationPrefs: unknown,
  key: "display" | "privacy",
  value: Record<string, unknown>,
) {
  return {
    ...asRecord(notificationPrefs),
    [key]: value,
  };
}
