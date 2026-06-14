# Planning: Tier 3 — Premium/Exclusive Customization

## Tujuan
Membuat 3 customization Tier 3 yang benar-benar berbeda dan eksklusif. Menggunakan Three.js, Spline, dan Anime.js v4 secara penuh.

---

## Tier 3 Characteristics
- Semua yang ada di Tier 1 dan 2 PLUS:
- Scene 3D menggunakan Three.js atau Spline
- Partikel 3D yang kompleks
- Efek interaktif: partikel mengikuti cursor
- Animasi 3D pada elemen-elemen tertentu
- Tata letak yang benar-benar berbeda dari default
- Sound effects opsional
- Setiap tier 3 harus SANGAT berbeda satu sama lain — benar-benar eksklusif

---

## Customization 1: "Void Emperor"
- Tema: kegelapan kosmik, void, nebula
- Background: Scene 3D Three.js — nebula berputar dengan bintang dan partikel cosmic
- Cursor: partikel gelap yang mengikuti mouse (trail effect)
- Card: floating card dengan efek parallax 3D (gyroscope/mouse)
- Navigation: efek morph saat hover
- Live Auction: arena void dengan efek distorsi
- Profil: frame dengan efek portal void (lingkaran berputar)
- Library: Three.js + Anime.js v4
- Warna: ungu gelap (#2D0A4E), hitam (#050505), cyan (#00FFFF)

## Customization 2: "Dragon's Sanctum"
- Tema: naga, api, kuil kuno
- Background: Spline 3D scene — kuil dengan api yang berkobar
- Cursor: jejak api saat mouse bergerak
- Card: efek batu kuno dengan api di tepi
- Navigation: animasi naga kecil di logo
- Live Auction: arena colosseum dengan obor 3D
- Profil: frame dengan efek sisik naga (texture animated)
- Library: Spline + Anime.js v4
- Warna: merah api (#FF4500), emas (#FFD700), hitam (#1a1a0a)

## Customization 3: "Crystal Palace"
- Tema: kristal, es, elegansi
- Background: Three.js scene — kristal yang berputar dan memantulkan cahaya
- Cursor: partikel kristal yang berpendar mengikuti mouse
- Card: efek glass-crystal dengan refraksi cahaya
- Navigation: efek kristal pecah saat hover
- Live Auction: ruangan kristal dengan pantulan cahaya
- Profil: frame kristal 3D yang berputar pelan
- Library: Three.js + Anime.js v4
- Warna: biru kristal (#88C8E8), putih (#F0F0FF), perak (#C0C0C0)

---

## Detail Teknis

### Three.js Scene Setup
```javascript
// Contoh setup dasar — setiap tier punya scene sendiri
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
// ... partikel, lighting, model 3D custom
```

### Spline Integration
```javascript
// Load Spline scene
import { Application } from '@splinetool/runtime';
const spline = new Application(canvas);
spline.load('url-to-spline-scene');
```

### Cursor Particle Trail (Anime.js)
```javascript
// Contoh efek partikel mengikuti kursor
document.addEventListener('mousemove', (e) => {
  // Buat partikel di posisi cursor
  // Animasikan dengan anime.js
  anime({ targets: particle, opacity: [1, 0], scale: [1, 0], duration: 800 });
});
```

---

## Checklist
- [ ] Buat folder `tampilan/void_emperor/` dengan Three.js scene
- [ ] Buat folder `tampilan/dragons_sanctum/` dengan Spline scene
- [ ] Buat folder `tampilan/crystal_palace/` dengan Three.js scene
- [ ] Implementasi cursor particle trail untuk setiap tier
- [ ] Test performa 3D di berbagai device
- [ ] Pastikan setiap tier SANGAT berbeda visual
- [ ] Test fallback: jika WebGL tidak didukung → ke default
- [ ] Test: customization berlaku di SEMUA halaman website
