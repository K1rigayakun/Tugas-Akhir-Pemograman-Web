const { PrismaClient } = require('@emerald-kingdom/db');

const prisma = new PrismaClient();

const cosmetics = [
  {
    id: "web_common_ruby",
    name: "Ruby Tint Web",
    type: "WEB_CODE",
    rarity: "COMMON",
    obtainMethod: "SHOP",
    shopPrice: 100,
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Warna kemerahan sederhana yang elegan.",
    webCode: `
      /* Mengganti aksen warna utama ke merah ruby */
      :root {
        --color-emerald: #e11d48 !important;
        --color-gold: #fbbf24 !important;
      }
    `,
  },
  {
    id: "web_uncommon_sapphire",
    name: "Sapphire Pulse Web",
    type: "WEB_CODE",
    rarity: "UNCOMMON",
    obtainMethod: "SHOP",
    shopPrice: 500,
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Biru safir dengan sedikit animasi berdenyut pada kotak.",
    webCode: `
      :root {
        --color-emerald: #3b82f6 !important;
      }
      @keyframes sapphire-glow {
        0% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.2); }
        100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
      }
      .content-card {
        animation: sapphire-glow 2s infinite alternate !important;
        border-color: rgba(59, 130, 246, 0.5) !important;
      }
    `,
  },
  {
    id: "web_rare_neon",
    name: "Neon Syndicate Web",
    type: "WEB_CODE",
    rarity: "RARE",
    obtainMethod: "SHOP",
    shopPrice: 2000,
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Tema cyberpunk neon yang bereaksi terhadap kursor mouse.",
    webCode: `
      :root {
        --color-emerald: #0ea5e9 !important;
      }
      /* Efek radial yang mengikuti posisi mouse global menggunakan var(--mouse-x) */
      html::after {
        content: '';
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        z-index: 9998;
        background: radial-gradient(
          600px circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh),
          rgba(14, 165, 233, 0.15),
          transparent 40%
        );
      }
      .content-card {
        background: rgba(10, 10, 15, 0.8) !important;
        border: 1px solid rgba(14, 165, 233, 0.3) !important;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .content-card:hover {
        transform: translateY(-5px) !important;
        box-shadow: 0 10px 30px rgba(14, 165, 233, 0.3) !important;
      }
    `,
  },
  {
    id: "web_epic_rgb",
    name: "RGB Chroma Web",
    type: "WEB_CODE",
    rarity: "EPIC",
    obtainMethod: "SHOP",
    shopPrice: 10000,
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Tema gaming RGB sejati dengan animasi pelangi terus menerus.",
    webCode: `
      @keyframes rgb-breathing {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
      /* Latar belakang dengan animasi gradient RGB */
      html::before {
        content: '';
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
        background-size: 400%;
        opacity: 0.1;
        animation: rgb-breathing 10s linear infinite;
      }
      /* Border RGB yang dinamis pada card */
      .content-card {
        position: relative !important;
        background: rgba(0,0,0,0.85) !important;
        border: 2px solid transparent !important;
        background-clip: padding-box !important;
        overflow: hidden !important;
      }
      .content-card::before {
        content: '';
        position: absolute;
        top: -2px; left: -2px; right: -2px; bottom: -2px;
        z-index: -1;
        background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
        background-size: 400%;
        animation: rgb-breathing 5s linear infinite;
      }
    `,
  },
  {
    id: "web_legendary_abyss",
    name: "Abyssal Void Web",
    type: "WEB_CODE",
    rarity: "LEGENDARY",
    obtainMethod: "SHOP",
    shopPrice: 50000,
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Latar belakang bintang jatuh 3D yang megah dengan partikel gelap murni CSS.",
    webCode: `
      @keyframes falling-stars {
        0% { transform: translateY(-100vh) rotate(45deg); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateY(100vh) rotate(45deg); opacity: 0; }
      }
      html { background: #050505 !important; }
      html::after {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background-image: 
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
        background-size: 50px 50px;
        transform: perspective(500px) rotateX(60deg) scale(2);
        transform-origin: top;
        animation: falling-stars 20s linear infinite;
        opacity: 0.3;
      }
      .content-card {
        background: rgba(10, 10, 10, 0.7) !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 20px 40px rgba(0,0,0,0.8) !important;
      }
    `,
  },
  {
    id: "web_mythic_creator",
    name: "The Creator's Canvas",
    type: "WEB_CODE",
    rarity: "MYTHIC",
    obtainMethod: "ACHIEVEMENT",
    requiredRank: "EMPEROR",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    description: "Kemewahan absolut dengan integrasi Spline 3D Scene dinamis.",
    splineUrl: "https://my.spline.design/interactivespheres-8f7478d10b7a421c60fcbb614fbaee60/",
    webCode: `
      /* Kosmetik ini menggunakan Spline 3D Scene sebagai utamanya. 
         Disini kita hanya perlu menyesuaikan kartu agar tembus pandang 
         sehingga background Spline terlihat maksimal. */
      .content-card {
        background: rgba(15, 15, 20, 0.3) !important;
        backdrop-filter: blur(8px) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
      }
      /* Sembunyikan partikel default secara agresif agar tidak crash dengan 3D Spline */
      #emerald-bg-canvas { display: none !important; }
      .bg-platform { background: transparent !important; }
    `,
  }
];

async function main() {
  console.log("Seeding progressive cosmetics...");
  for (const cos of cosmetics) {
    await prisma.cosmetic.upsert({
      where: { id: cos.id },
      update: cos,
      create: cos,
    });
    console.log("Upserted:", cos.name);
  }

  // Assign them to Emperor user for testing
  const user = await prisma.user.findFirst({ where: { username: "Emperor" } });
  if (user) {
    for (const cos of cosmetics) {
      await prisma.userCosmetic.upsert({
        where: { userId_cosmeticId: { userId: user.id, cosmeticId: cos.id } },
        update: {},
        create: { userId: user.id, cosmeticId: cos.id, obtainedFrom: "SHOP" },
      });
    }
    console.log("Gave cosmetics to Emperor!");
  } else {
    // Try "admin"
    const admin = await prisma.user.findFirst({ where: { username: "admin" } });
    if (admin) {
      for (const cos of cosmetics) {
        await prisma.userCosmetic.upsert({
          where: { userId_cosmeticId: { userId: admin.id, cosmeticId: cos.id } },
          update: {},
          create: { userId: admin.id, cosmeticId: cos.id, obtainedFrom: "SHOP" },
        });
      }
      console.log("Gave cosmetics to admin!");
    }
  }

  console.log("Done.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
