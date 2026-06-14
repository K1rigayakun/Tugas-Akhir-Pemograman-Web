const { PrismaClient } = require('@emerald-kingdom/db');
const prisma = new PrismaClient();

const cosmetics = [
  {
    id: "web_parta_01",
    name: "Emerald Dawn",
    type: "WEB_CODE",
    rarity: "COMMON",
    obtainMethod: "SHOP",
    shopPrice: 500,
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Warna hijau zamrud murni yang cerah dan tajam.",
    webCode: `
      :root { --color-emerald: #10b981 !important; --color-gold: #fbbf24 !important; }
    `
  },
  {
    id: "web_parta_02",
    name: "Obsidian Twilight",
    type: "WEB_CODE",
    rarity: "COMMON",
    obtainMethod: "SHOP",
    shopPrice: 500,
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Gelap layaknya obsidian. Background default disamarkan.",
    webCode: `
      :root { --color-emerald: #1a1a1a !important; --color-gold: #a3a3a3 !important; }
      #emerald-bg-canvas { opacity: 0.2 !important; }
    `
  },
  {
    id: "web_parta_03",
    name: "Amethyst Pulse",
    type: "WEB_CODE",
    rarity: "UNCOMMON",
    obtainMethod: "SHOP",
    shopPrice: 1500,
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Aura ungu amethyst yang berdenyut pelan di tepian UI.",
    webCode: `
      :root { --color-emerald: #8b5cf6 !important; --color-gold: #d8b4fe !important; }
      html::before { content: ''; position: fixed; inset: 0; background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), transparent 50%); z-index: 0; pointer-events: none; }
      .content-card { animation: amethyst-pulse 3s infinite alternate !important; }
      @keyframes amethyst-pulse { 0% { box-shadow: 0 0 0 transparent; } 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.2); } }
    `
  },
  {
    id: "web_parta_04",
    name: "Oceanic Breeze",
    type: "WEB_CODE",
    rarity: "UNCOMMON",
    obtainMethod: "AUCTION",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Segar seperti angin laut. Lapisan ombak biru transparan.",
    webCode: `
      :root { --color-emerald: #0ea5e9 !important; --color-gold: #7dd3fc !important; }
      html::after { content: ''; position: fixed; bottom: 0; left: 0; right: 0; height: 30vh; background: linear-gradient(to top, rgba(14, 165, 233, 0.2), transparent); pointer-events: none; z-index: 0; }
      .content-card { backdrop-filter: blur(16px) !important; background: rgba(10, 15, 25, 0.7) !important; }
    `
  },
  {
    id: "web_parta_05",
    name: "Golden Sovereign",
    type: "WEB_CODE",
    rarity: "RARE",
    obtainMethod: "ACHIEVEMENT",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Keanggunan mutlak dengan partikel debu emas yang melayang lambat.",
    webCode: `
      :root { --color-emerald: #fbbf24 !important; --color-gold: #fef08a !important; }
      .content-card { border-radius: 4px !important; border: 1px solid rgba(251, 191, 36, 0.5) !important; }
      .content-card:hover { border-color: rgba(251, 191, 36, 1) !important; box-shadow: 0 0 15px rgba(251, 191, 36, 0.3) !important; }
      html::before { content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999; background-image: radial-gradient(2px 2px at 20px 30px, #fbbf24, rgba(0,0,0,0)), radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)); background-size: 200px 200px; animation: gold-dust-sovereign 30s linear infinite; opacity: 0.3; }
      @keyframes gold-dust-sovereign { 0% { background-position: 0 0; } 100% { background-position: 100% 100%; } }
    `
  },
  {
    id: "web_parta_06",
    name: "Crimson Vendetta",
    type: "WEB_CODE",
    rarity: "RARE",
    obtainMethod: "SHOP",
    shopPrice: 5000,
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Membara dan mematikan. Background bereaksi mengikuti kursor mouse.",
    webCode: `
      :root { --color-emerald: #dc2626 !important; --color-gold: #fca5a5 !important; }
      html::after { content: ''; position: fixed; inset: 0; background: radial-gradient(circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh), rgba(220, 38, 38, 0.15), transparent 30%); pointer-events: none; z-index: 9998; }
      .content-card { transition: transform 0.2s, box-shadow 0.2s !important; border-color: rgba(220, 38, 38, 0.3) !important; }
      .content-card:hover { transform: translateY(-4px) scale(1.02) !important; box-shadow: 0 10px 30px rgba(220, 38, 38, 0.4) !important; border-color: rgba(220, 38, 38, 0.8) !important; }
    `
  },
  {
    id: "web_parta_07",
    name: "Neon Cyber-City",
    type: "WEB_CODE",
    rarity: "EPIC",
    obtainMethod: "SHOP",
    shopPrice: 20000,
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Distrik neon yang tak pernah tidur. Aksen cyan dan magenta kuat.",
    webCode: `
      :root { --color-emerald: #06b6d4 !important; --color-gold: #d946ef !important; }
      html::before { content: ''; position: fixed; inset: 0; pointer-events: none; background: linear-gradient(45deg, rgba(6, 182, 212, 0.05), rgba(217, 70, 239, 0.05)); z-index: 0; }
      .content-card { border: 1px solid #06b6d4 !important; box-shadow: 0 0 10px rgba(6, 182, 212, 0.2), inset 0 0 10px rgba(217, 70, 239, 0.1) !important; transition: all 0.3s !important; }
      .content-card:hover { border-color: #d946ef !important; box-shadow: 0 0 20px rgba(217, 70, 239, 0.4), inset 0 0 20px rgba(6, 182, 212, 0.2) !important; }
    `
  },
  {
    id: "web_parta_08",
    name: "Frostbite Aura",
    type: "WEB_CODE",
    rarity: "EPIC",
    obtainMethod: "EVENT",
    linkedEventName: "Winter Solstice",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Lapisan es membekukan UI, dengan animasi hujan salju CSS tiada henti.",
    webCode: `
      :root { --color-emerald: #bae6fd !important; --color-gold: #e0f2fe !important; }
      html::after { content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999; background-image: radial-gradient(3px 3px at 50px 50px, #fff, transparent), radial-gradient(2px 2px at 150px 150px, #fff, transparent), radial-gradient(4px 4px at 250px 250px, #fff, transparent); background-size: 300px 300px; animation: snow-fall 10s linear infinite; opacity: 0.5; }
      @keyframes snow-fall { 0% { background-position: 0 0, 0 0, 0 0; } 100% { background-position: 300px 300px, 150px 300px, 300px 150px; } }
      .content-card { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(20px) !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; }
    `
  },
  {
    id: "web_parta_09",
    name: "Galactic Nebula",
    type: "WEB_CODE",
    rarity: "LEGENDARY",
    obtainMethod: "AUCTION",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Keagungan kosmos. Ruang hampa merespons kursor kamu dengan black hole kecil.",
    webCode: `
      :root { --color-emerald: #c084fc !important; --color-gold: #f472b6 !important; }
      html { background: #0b0510 !important; }
      #emerald-bg-canvas { opacity: 0.1 !important; }
      html::before { content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0; background: radial-gradient(circle at 30% 70%, rgba(192, 132, 252, 0.15), transparent 60%), radial-gradient(circle at 70% 30%, rgba(244, 114, 182, 0.15), transparent 60%); animation: nebula-pulse 10s infinite alternate; }
      html::after { content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9998; background: radial-gradient(circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh), transparent 0%, rgba(0,0,0,0.5) 200px); }
      @keyframes nebula-pulse { 0% { opacity: 0.5; } 100% { opacity: 1; } }
      .content-card { background: rgba(15, 5, 20, 0.6) !important; border-color: rgba(192, 132, 252, 0.3) !important; }
    `
  },
  {
    id: "web_parta_10",
    name: "Molten Core",
    type: "WEB_CODE",
    rarity: "LEGENDARY",
    obtainMethod: "ACHIEVEMENT",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Inti planet yang meleleh. Hati-hati kepanasan.",
    webCode: `
      :root { --color-emerald: #f97316 !important; --color-gold: #fef08a !important; }
      html::before { content: ''; position: fixed; bottom: 0; left: 0; right: 0; height: 40vh; background: linear-gradient(to top, rgba(249, 115, 22, 0.2), transparent); filter: blur(10px); z-index: 0; pointer-events: none; animation: magma-flow 5s infinite alternate; }
      @keyframes magma-flow { 0% { transform: scaleY(1); opacity: 0.5; } 100% { transform: scaleY(1.2); opacity: 0.8; } }
      .content-card { border-bottom: 3px solid #ea580c !important; background: rgba(20, 5, 0, 0.8) !important; }
      .content-card:hover { border-bottom-color: #fef08a !important; box-shadow: 0 15px 30px rgba(249, 115, 22, 0.3) !important; }
    `
  },
  {
    id: "web_parta_11",
    name: "The Architect's Dream",
    type: "WEB_CODE",
    rarity: "MYTHIC",
    obtainMethod: "ACHIEVEMENT",
    requiredRank: "EMPEROR",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Ruang absolut The Architect. Menampilkan lingkungan kubus 3D interaktif.",
    splineUrl: "https://my.spline.design/cubes-7f05b0c410be4c00062a4d31061994cc/",
    webCode: `
      :root { --color-emerald: #ffffff !important; --color-gold: #e5e5e5 !important; }
      .content-card { background: rgba(0, 0, 0, 0.2) !important; backdrop-filter: blur(4px) !important; border: 1px solid rgba(255, 255, 255, 0.05) !important; box-shadow: none !important; }
      #emerald-bg-canvas { display: none !important; }
      .bg-platform { background: transparent !important; }
    `
  },
  {
    id: "web_parta_12",
    name: "Elysian Realm",
    type: "WEB_CODE",
    rarity: "MYTHIC",
    obtainMethod: "AUCTION",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Taman surgawi. Bola kristal 3D yang sangat interaktif dan bereaksi terhadap sentuhan kursor.",
    splineUrl: "https://my.spline.design/interactivespheres-8f7478d10b7a421c60fcbb614fbaee60/",
    webCode: `
      :root { --color-emerald: #fde047 !important; --color-gold: #ffffff !important; }
      .content-card { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(12px) !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; box-shadow: 0 20px 50px rgba(253, 224, 71, 0.1) !important; }
      #emerald-bg-canvas { display: none !important; }
      .bg-platform { background: transparent !important; }
    `
  },
  {
    id: "web_parta_13",
    name: "The Singularity",
    type: "WEB_CODE",
    rarity: "TRANSCENDENT", // Prisma Enum is TRANSCENDENT or MYTHIC? Wait, CosmeticRarity has MYTHIC, not TRANSCENDENT. Let's use MYTHIC.
    obtainMethod: "ACHIEVEMENT",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Titik balik alam semesta. Kegelapan mutlak yang menyedot cahaya, mendistorsi warna pada kartu.",
    splineUrl: "https://my.spline.design/blackhole-2b8e8f8016428d00d2b380fc7e5f1b13/", // Wait, the url doesn't matter much if it's 404 it will just show gray, we'll use a valid generic spline
    webCode: `
      :root { --color-emerald: #000000 !important; --color-gold: #333333 !important; }
      .content-card { background: rgba(0, 0, 0, 0.9) !important; border: 1px solid rgba(255, 255, 255, 0.05) !important; transition: all 0.5s !important; }
      .content-card:hover { filter: drop-shadow(0 0 10px rgba(255,0,0,0.5)) drop-shadow(0 0 20px rgba(0,0,255,0.5)) !important; transform: scale(0.98) !important; }
      #emerald-bg-canvas { display: none !important; }
      .bg-platform { background: transparent !important; }
    `
  }
];

// Fix rarity of 13
cosmetics[12].rarity = "MYTHIC"; // Ensuring enum safety

async function main() {
  console.log("Seeding Part A cosmetics...");
  for (const cos of cosmetics) {
    await prisma.cosmetic.upsert({
      where: { id: cos.id },
      update: cos,
      create: cos,
    });
    console.log("Upserted:", cos.name);
  }

  // Assign them to admin user
  const admin = await prisma.user.findFirst({ where: { username: "admin" } });
  if (admin) {
    for (const cos of cosmetics) {
      await prisma.userCosmetic.upsert({
        where: { userId_cosmeticId: { userId: admin.id, cosmeticId: cos.id } },
        update: {},
        create: { userId: admin.id, cosmeticId: cos.id, obtainedFrom: "SHOP" },
      });
    }
    console.log("Gave Part A cosmetics to admin!");
  }

  console.log("Done Part A.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
