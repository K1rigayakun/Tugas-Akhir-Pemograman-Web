# Planning: Tier 2 — Advanced Customization

## Tujuan
Membuat 3 customization Tier 2 dengan animasi yang lebih kompleks dan efek visual.

---

## Tier 2 Characteristics
- Semua yang ada di Tier 1 PLUS:
- Animasi halus menggunakan Anime.js v4
- Partikel ringan (CSS particles atau canvas sederhana)
- Custom hover effects yang lebih kompleks
- Transisi halaman yang berbeda
- Background animasi (bukan statis)

---

## Customization 1: "Ember Forge"
- Tema: api dan besi tempa
- Partikel: percikan api kecil yang naik perlahan di background
- Hover: efek panas (glow oranye + sedikit shake)
- Card: border dengan efek "bara api" (gradient animasi)
- Library: Anime.js untuk partikel + CSS custom

## Customization 2: "Ocean Depths"
- Tema: laut dalam
- Partikel: gelembung udara yang naik perlahan
- Hover: efek ripple air
- Background: gradient biru gelap dengan animasi gelombang
- Card: efek underwater glass (blur + tint biru)
- Library: Anime.js + CSS animation

## Customization 3: "Aurora Borealis"
- Tema: cahaya utara
- Background: gradient warna-warni yang bergerak perlahan (hijau-biru-ungu)
- Partikel: bintang kecil berkedip
- Hover: efek cahaya yang mengikuti cursor (sederhana)
- Card: efek glass dengan warna aurora
- Library: Anime.js + CSS gradients

---

## Checklist
- [ ] Buat folder `tampilan/ember_forge/` dengan CSS + JS + manifest
- [ ] Buat folder `tampilan/ocean_depths/` dengan CSS + JS + manifest
- [ ] Buat folder `tampilan/aurora_borealis/` dengan CSS + JS + manifest
- [ ] Implementasi partikel menggunakan Anime.js v4
- [ ] Test performa: FPS harus tetap > 30 di laptop standar
- [ ] Test: tampilan berubah di semua halaman
