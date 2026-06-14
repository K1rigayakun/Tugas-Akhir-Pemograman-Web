export const demoLeaders = [
  { position: 1, userId: "1", username: "LordVareth", rank: "EMPEROR", value: 284000 },
  { position: 2, userId: "2", username: "SilverDuchess", rank: "SOVEREIGN", value: 196000 },
  { position: 3, userId: "3", username: "IronBaron99", rank: "DUKE", value: 142000 },
  { position: 4, userId: "4", username: "EmeraldSeer", rank: "MARQUIS", value: 98600 },
  { position: 5, userId: "5", username: "The Unknown", rank: "EARL", value: 87400 },
  { position: 6, userId: "6", username: "AstraKnight", rank: "KNIGHT", value: 63200 },
];

export const demoMuseum = [
  {
    id: "relic-1",
    editorial: "Mahkota pertama yang memecahkan rekor lelang kerajaan.",
    auction: {
      title: "Crown of the First Sovereign",
      rarity: "TRANSCENDENT",
      finalPrice: 88000,
      imageUrls: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=80"],
      endTime: "2026-02-18T12:00:00.000Z",
      winner: { username: "LordVareth", privacyMode: "PUBLIC", rank: "EMPEROR" },
      _count: { bids: 47 },
    },
  },
  {
    id: "relic-2",
    editorial: "Pedang seremonial dari masa awal Emerald Kingdom.",
    auction: {
      title: "Blade of the Fallen Emperor",
      rarity: "LEGENDARY",
      finalPrice: 42500,
      imageUrls: ["https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=80"],
      endTime: "2026-01-09T12:00:00.000Z",
      winner: { username: "SilverDuchess", privacyMode: "PUBLIC", rank: "SOVEREIGN" },
      _count: { bids: 31 },
    },
  },
  {
    id: "relic-3",
    editorial: "Relik langka yang menjadi simbol perdagangan kerajaan.",
    auction: {
      title: "Emerald Signet Ring",
      rarity: "EPIC",
      finalPrice: 12800,
      imageUrls: ["https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=80"],
      endTime: "2025-12-14T12:00:00.000Z",
      winner: { username: "The Unknown", privacyMode: "ANONYMOUS", rank: "DUKE" },
      _count: { bids: 18 },
    },
  },
];

export const demoAchievements = [
  { id: "a1", name: "First Blood", description: "Menangkan lelang pertamamu.", tier: "COMMON", expReward: 100, isUnlocked: true, progress: 1, target: 1 },
  { id: "a2", name: "Chain of Glory", description: "Raih 7 kemenangan berturut-turut.", tier: "RARE", expReward: 500, isUnlocked: false, progress: 4, target: 7 },
  { id: "a3", name: "Royal Treasurer", description: "Belanjakan 100.000 Crown Coin.", tier: "EPIC", expReward: 900, isUnlocked: false, progress: 64000, target: 100000 },
  { id: "a4", name: "Sovereign Ascension", description: "Capai rank Sovereign.", tier: "EPIC", expReward: 1500, isUnlocked: true, progress: 1, target: 1 },
  { id: "a5", name: "First Emperor", description: "Jadilah Emperor pertama kerajaan.", tier: "EPIC", expReward: 5000, isUnlocked: false, progress: 0, target: 1 },
];

export const demoEvents = [
  { id: "e1", name: "Emerald Jubilee", theme: "Festival kemenangan dan relik langka", expMultiplier: 2, isActive: true, startTime: "2026-06-01T00:00:00.000Z", endTime: "2026-06-30T23:59:59.000Z" },
  { id: "e2", name: "Winter Court", theme: "Lelang eksklusif dari istana utara", expMultiplier: 1.5, isActive: false, startTime: "2026-12-01T00:00:00.000Z", endTime: "2026-12-31T23:59:59.000Z" },
  { id: "e3", name: "Founders' Week", theme: "Mengenang para pendiri kerajaan", expMultiplier: 1.25, isActive: false, startTime: "2026-02-01T00:00:00.000Z", endTime: "2026-02-08T23:59:59.000Z" },
];

export const demoShop = [
  { id: "s1", name: "Gilded Laurel Frame", type: "FRAME", price: 2400, flashSalePrice: null, stock: null, isLimited: false },
  { id: "s2", name: "Sovereign Banner", type: "BANNER", price: 5200, flashSalePrice: 3900, stock: 18, isLimited: true },
  { id: "s3", name: "Emerald Name Effect", type: "NAME_EFFECT", price: 1800, flashSalePrice: null, stock: null, isLimited: false },
];
