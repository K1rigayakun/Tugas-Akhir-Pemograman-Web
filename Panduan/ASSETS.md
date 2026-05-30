# 🎨 Emerald Kingdom — Assets

Semua elemen visual platform ada di sini.
Tidak ada warna, font, gradient, atau animasi yang boleh ditentukan di luar file ini.
Wajib dibaca sebelum mengerjakan apapun yang berhubungan dengan tampilan.

---

## Warna

Semua warna didefinisikan sebagai CSS custom property.
Letakkan di `apps/web/src/app/globals.css`.
Komponen tidak boleh hardcode nilai hex langsung — selalu pakai `var(--color-...)`.

```css
:root {
  /* Background */
  --color-bg-deep:          #0D3B2E;
  --color-bg-mid:           #0A2620;
  --color-bg-dark:          #050508;

  /* Aksen Utama */
  --color-gold:             #C9A84C;
  --color-gold-bright:      #E8A020;
  --color-gold-light:       #F5D080;
  --color-ivory:            #F5F0E8;

  /* Aksen Khusus */
  --color-crimson:          #8B1A1A;
  --color-sapphire:         #1A3A6B;
  --color-silver:           #C0C0C0;
  --color-bronze:           #CD7F32;

  /* Rank Accent — diubah via JS sesuai rank user */
  --color-rank-accent:      #C9A84C;
  --color-rank-glow:        rgba(201, 168, 76, 0.3);

  /* Rarity */
  --color-rarity-common:      #9E9E9E;
  --color-rarity-uncommon:    #4CAF50;
  --color-rarity-rare:        #2196F3;
  --color-rarity-epic:        #9C27B0;
  --color-rarity-legendary:   #FF9800;
  --color-rarity-transcendent:#F44336;
}
```

---

## Gradient

### Aturan Penting

Gradient di elemen penting **harus bergerak dan beranimasi** — tidak boleh statis.
Ini yang membuat platform terasa hidup dan premium.

### 1 — Background Utama

Latar belakang seluruh halaman. Bergerak perlahan terus-menerus.

```css
.bg-platform {
  background: linear-gradient(160deg, #0D3B2E 0%, #0A2620 40%, #050508 100%);
  background-size: 200% 200%;
  animation: gradient-breathe 12s ease infinite;
}

@keyframes gradient-breathe {
  0%   { background-position: 0% 0%; }
  50%  { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
}
```

### 2 — Gold Shimmer

Dipakai di tombol CTA, border item premium, teks harga besar, badge rank tinggi.
Efek emas yang bergerak dari kiri ke kanan.

```css
.gradient-gold {
  background: linear-gradient(90deg, #C9A84C 0%, #E8A020 40%, #F5D080 65%, #C9A84C 100%);
  background-size: 200% 100%;
  animation: gold-shimmer 3s linear infinite;
}

@keyframes gold-shimmer {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
```

### 3 — Aura Effect

Dipakai di avatar rank tinggi, card item Legendary/Transcendent, profil Duke ke atas.
Efek cahaya berdenyut yang keluar dari dalam elemen.

```css
/* Aura emas */
.aura-gold {
  box-shadow:
    0 0 15px rgba(201, 168, 76, 0.5),
    0 0 40px rgba(201, 168, 76, 0.25),
    0 0 80px rgba(201, 168, 76, 0.1);
  animation: aura-pulse 3s ease-in-out infinite;
}

@keyframes aura-pulse {
  0%, 100% {
    box-shadow:
      0 0 15px rgba(201, 168, 76, 0.5),
      0 0 40px rgba(201, 168, 76, 0.25),
      0 0 80px rgba(201, 168, 76, 0.1);
  }
  50% {
    box-shadow:
      0 0 25px rgba(201, 168, 76, 0.7),
      0 0 60px rgba(201, 168, 76, 0.4),
      0 0 100px rgba(201, 168, 76, 0.2);
  }
}

/* Variasi aura per rarity */
.aura-epic {
  animation: aura-pulse-epic 3s ease-in-out infinite;
}
@keyframes aura-pulse-epic {
  0%,100% { box-shadow: 0 0 15px rgba(156,39,176,0.5), 0 0 40px rgba(156,39,176,0.2); }
  50%     { box-shadow: 0 0 25px rgba(156,39,176,0.7), 0 0 60px rgba(156,39,176,0.4); }
}

.aura-legendary {
  animation: aura-pulse-legendary 3s ease-in-out infinite;
}
@keyframes aura-pulse-legendary {
  0%,100% { box-shadow: 0 0 15px rgba(255,152,0,0.5), 0 0 40px rgba(255,152,0,0.2); }
  50%     { box-shadow: 0 0 25px rgba(255,152,0,0.7), 0 0 60px rgba(255,152,0,0.4); }
}

.aura-emperor {
  animation: aura-pulse-emperor 2s ease-in-out infinite;
}
@keyframes aura-pulse-emperor {
  0%,100% {
    box-shadow: 0 0 20px rgba(255,215,0,0.6), 0 0 50px rgba(255,215,0,0.3), 0 0 100px rgba(255,215,0,0.1);
  }
  50% {
    box-shadow: 0 0 35px rgba(255,215,0,0.9), 0 0 80px rgba(255,215,0,0.5), 0 0 150px rgba(255,215,0,0.2);
  }
}
```

### 4 — Rank Dynamic

Warna aksen berubah otomatis mengikuti rank user yang login.
Syaikah implementasi komponen-nya, Fatih trigger perubahan via WebSocket.

```js
function applyRankTheme(rank) {
  const themes = {
    CIVIS:     { accent: "#4A7C6A", glow: "rgba(74,124,106,0.2)"  },
    MERCHANT:  { accent: "#5A8F7A", glow: "rgba(90,143,122,0.25)" },
    KNIGHT:    { accent: "#CD7F32", glow: "rgba(205,127,50,0.3)"  },
    BARON:     { accent: "#CD7F32", glow: "rgba(205,127,50,0.35)" },
    VISCOUNT:  { accent: "#C0C0C0", glow: "rgba(192,192,192,0.3)" },
    EARL:      { accent: "#C9A84C", glow: "rgba(201,168,76,0.35)" },
    MARQUIS:   { accent: "#C9A84C", glow: "rgba(201,168,76,0.4)"  },
    DUKE:      { accent: "#E8A020", glow: "rgba(232,160,32,0.45)" },
    SOVEREIGN: { accent: "#E5E4E2", glow: "rgba(229,228,226,0.4)" },
    EMPEROR:   { accent: "#FFD700", glow: "rgba(255,215,0,0.5)"   },
  };
  const t = themes[rank];
  document.documentElement.style.setProperty("--color-rank-accent", t.accent);
  document.documentElement.style.setProperty("--color-rank-glow",   t.glow);
}
```

### 5 — Rarity Border

Card item lelang punya border berwarna sesuai rarity dengan glow berdenyut.

```css
.rarity-border {
  border: 1px solid var(--rarity-color);
  box-shadow: 0 0 10px var(--rarity-color);
  animation: rarity-glow 2.5s ease-in-out infinite;
}

@keyframes rarity-glow {
  0%,100% { box-shadow: 0 0 10px var(--rarity-color); }
  50%     { box-shadow: 0 0 22px var(--rarity-color), 0 0 40px var(--rarity-color); }
}

.rarity-common      { --rarity-color: #9E9E9E; }
.rarity-uncommon    { --rarity-color: #4CAF50; }
.rarity-rare        { --rarity-color: #2196F3; }
.rarity-epic        { --rarity-color: #9C27B0; }
.rarity-legendary   { --rarity-color: #FF9800; }
.rarity-transcendent{ --rarity-color: #F44336; }
```

### 6 — Event Seasonal

Saat event aktif, aksen warna platform bergeser. Di-trigger dari backend via WebSocket.

| Event | Aksen Dari | Aksen Ke |
|---|---|---|
| Winter Court | `#4FC3F7` | `#1E88E5` |
| Night of Undying | `#7B1FA2` | `#311B92` |
| Golden Dragon Festival | `#F57F17` | `#E65100` |
| Spring Harvest | `#2E7D32` | `#1B5E20` |
| Imperial Anniversary | `#C9A84C` | `#E8A020` |

---

## Tipografi

```css
--font-heading:    'Cinzel Decorative', serif;
--font-subheading: 'Cinzel', serif;
--font-body:       'Lato', sans-serif;
--font-numeric:    'Orbitron', monospace;
```

| Token | Ukuran | Font | Dipakai Di |
|---|---|---|---|
| `text-hero` | 64–96px | Cinzel Decorative | Judul utama homepage |
| `text-section` | 32–48px | Cinzel | Heading tiap section |
| `text-title` | 24px | Cinzel | Judul card dan modal |
| `text-body` | 16px | Lato | Paragraf biasa |
| `text-small` | 14px | Lato | Label, metadata |
| `text-price` | 20–28px | Orbitron | Harga CC, countdown |
| `text-badge` | 11px | Cinzel | Label rarity, status |

---

## Layer Background Platform

```
Layer 1 : Gradient animated (bg-platform)
Layer 2 : Noise texture tipis — kesan velvet
Layer 3 : Vignette — sisi layar lebih gelap
Layer 4 : Particle system — titik emas melayang (Three.js)
Layer 5 : Emerald fog — kabut zamrud di bagian bawah
```

| Kondisi | Perubahan Visual |
|---|---|
| Live Auction aktif | Partikel lebih cepat, sisi layar berdenyut amber |
| Event aktif | Aksen warna bergeser ke tema event |
| Rank Emperor | Bintang emas bergerak di background |
| Winter Event | Serpihan salju emas jatuh perlahan |

---

## Icon System

Tidak ada emoji di seluruh UI. Semua diganti SVG icon.
Simpan di `packages/ui/src/icons/`.

### Sumber Icon

| Sumber | URL | Catatan |
|---|---|---|
| **Lucide Icons** | lucide.dev | Paling direkomendasikan, MIT |
| **Phosphor Icons** | phosphoricons.com | Banyak varian style, MIT |
| **Tabler Icons** | tabler-icons.io | Koleksi terbesar 4000+, MIT |
| **SVG Repo** | svgrepo.com | Cari kata kunci "medieval", "royal", "auction" |

### Daftar Icon yang Dibutuhkan

| Fungsi | Nama File | Kata Kunci |
|---|---|---|
| Notifikasi | `icon-bell.svg` | bell, notification |
| Favorit | `icon-heart.svg` | heart, favorite |
| Pengaturan | `icon-settings.svg` | settings, gear |
| Pencarian | `icon-search.svg` | search |
| Trophy | `icon-trophy.svg` | trophy, cup |
| Dokumen | `icon-scroll.svg` | scroll, document |
| Koin | `icon-coin.svg` | coin, currency |
| Mahkota | `icon-crown.svg` | crown |
| Palu Lelang | `icon-gavel.svg` | gavel, hammer |
| Live | `icon-flame.svg` | flame, fire |
| Kembali | `icon-back.svg` | arrow-left |
| User | `icon-user.svg` | user, person |
| Tutup | `icon-close.svg` | x, close |
| Berhasil | `icon-check.svg` | check |
| Keamanan | `icon-shield.svg` | shield |
| Upload | `icon-upload.svg` | upload, camera |
| Kalender | `icon-calendar.svg` | calendar |
| Peringkat | `icon-podium.svg` | podium, ranking |
| Museum | `icon-museum.svg` | museum, building |
| Terkunci | `icon-lock.svg` | lock |
| Pantau | `icon-eye.svg` | eye, view |
| Pedang | `icon-sword.svg` | sword, duel |
| Bintang | `icon-star.svg` | star |
| Logout | `icon-logout.svg` | logout, sign-out |
| Email | `icon-mail.svg` | mail, envelope |

---

## Animasi

| Library | Kegunaan |
|---|---|
| **Lenis** | Smooth scroll global — aktifkan di `layout.tsx` |
| **GSAP + ScrollTrigger** | Animasi saat scroll, reveal per section |
| **Framer Motion** | Transisi antar halaman, layout animation |
| **Anime.js** | Counter angka naik, micro-animation ringan |
| **Three.js / R3F** | Particle system, 3D viewer, wallet card 3D |

### Aturan
- Animasi kompleks wajib punya fallback `@media (prefers-reduced-motion: reduce)`
- Particle system minimal 60fps

---

## Checklist Visual Sebelum Push

- [ ] Tidak ada hex hardcode di komponen — semua `var(--color-...)`
- [ ] Tidak ada emoji — semua SVG icon
- [ ] Gradient di elemen penting sudah beranimasi
- [ ] Ada reduced-motion fallback untuk animasi kompleks
- [ ] Semua gambar konten pakai `next/image`
