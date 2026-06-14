/**
 * Daftar Nama Anonim Medieval (50+ variasi)
 * Digunakan saat user memilih mode privasi ANONYMOUS.
 * Nama-nama ini bertema kerajaan/medieval sesuai identitas Emerald Kingdom.
 */
export const MEDIEVAL_ANONYMOUS_NAMES = [
  "The Silent Knight",
  "Shadow of Dusk",
  "The Iron Vassal",
  "Crimson Herald",
  "The Veiled Pilgrim",
  "Ashen Sentinel",
  "The Hollow Crown",
  "Ember Warden",
  "The Wandering Scribe",
  "Obsidian Phantom",
  "The Masked Sovereign",
  "Silver Wraith",
  "The Hidden Blade",
  "Midnight Templar",
  "The Lost Paladin",
  "Storm Harbinger",
  "The Unnamed Baron",
  "Cloaked Justicar",
  "The Raven's Shadow",
  "Forgotten Crusader",
  "The Shrouded Sage",
  "Iron Wolf",
  "The Nameless Duke",
  "Ghostly Squire",
  "The Fallen Centurion",
  "Twilight Archer",
  "The Silent Watcher",
  "Pale Marauder",
  "The Emerald Specter",
  "Bonfire Keeper",
  "The Blind Oracle",
  "Dust Walker",
  "The Oath Breaker",
  "Nightfall Rider",
  "The Grey Merchant",
  "Thornback Ranger",
  "The Whispering King",
  "Driftwood Vagabond",
  "The Gilded Stranger",
  "Frostbane Guardian",
  "The Dark Legionnaire",
  "Copper Alchemist",
  "The Scarred Monk",
  "Lantern Seeker",
  "The Ivory Ghost",
  "Wormwood Wanderer",
  "The Unseen Hand",
  "Blazing Inquisitor",
  "The Rusted Crown",
  "Moorland Exile",
  "The Velvet Dagger",
  "Ashen Fox",
  "The Broken Shield",
  "Sapphire Sellsword",
  "The Hooded Tribunal",
  "Cairn Watcher",
  "The Quiet Tempest",
  "Blackthorn Hunter",
  "The Faceless Noble",
  "Cinderveil Monk",
] as const;

export type MedievalAnonymousName = (typeof MEDIEVAL_ANONYMOUS_NAMES)[number];

/**
 * Pilih nama anonim secara random dari daftar.
 */
export function getRandomAnonymousName(): MedievalAnonymousName {
  const index = Math.floor(Math.random() * MEDIEVAL_ANONYMOUS_NAMES.length);
  return MEDIEVAL_ANONYMOUS_NAMES[index];
}

/**
 * Mode privasi yang tersedia untuk profil user.
 */
export enum PrivacyMode {
  /** Semua orang bisa lihat profil */
  PUBLIC = "PUBLIC",
  /** Nama ditampilkan sebagai nama anonim medieval */
  ANONYMOUS = "ANONYMOUS",
  /** Profil tidak bisa dilihat orang lain sama sekali */
  SHADOW = "SHADOW",
}
