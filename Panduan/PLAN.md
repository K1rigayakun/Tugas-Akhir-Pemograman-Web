# 🗺️ Emerald Kingdom — Development Plan

Roadmap pengembangan dibagi menjadi fase-fase. Setiap fase harus selesai sebelum fase berikutnya dimulai.
Fase 0 adalah fondasi teknis — tidak ada fitur yang dibangun sebelum ini selesai.

---

## Fase 0 — Fondasi *(Minggu 1–2)*

Semua anggota bekerja paralel untuk menyiapkan lingkungan kerja bersama.
Tidak ada fitur — hanya fondasi.

| Tugas | PIC |
|---|---|
| Setup monorepo Turborepo, semua workspace bisa jalan | Michael |
| Finalisasi schema database lengkap — di-approve semua anggota | Michael |
| Setup cloud: Neon, Upstash, Cloudflare R2, Railway, Vercel | Michael |
| Setup CI/CD pipeline (GitHub Actions) | Michael |
| Design system: CSS variables, font, gradient di `globals.css` | Syaikah |
| Semua SVG icon tersedia di `packages/ui/src/icons/` | Syaikah |
| Definisikan semua shared types di `packages/types` | Michael + Fatih |
| Auth dasar: register, verifikasi email, login | Peter |

**Fase 0 selesai kalau:**
- Semua anggota bisa jalankan `turbo dev` di lokal tanpa error
- Schema database sudah di-approve — tidak ada breaking change setelah ini
- CI pipeline hijau di GitHub

---

## Fase 1 — MVP *(Bulan 1–2)*

Platform bisa digunakan untuk lelang dasar secara end-to-end.

| Fitur | PIC |
|---|---|
| KYC wizard 4 step + manual review admin | Peter |
| Standard Auction & Scheduled Auction fungsional penuh | Fatih |
| Bid system + Redis lock + anti-snipe | Fatih |
| Wallet Crown Coin: top up (Midtrans Sandbox), hold, refund | Fatih |
| Sistem Rank dasar: 10 rank, EXP otomatis | Fatih |
| Komponen UI dasar (Button, Card, Modal, dll.) | Syaikah |
| Background platform + particle system | Syaikah |
| Homepage dasar | Syaikah |
| Halaman profil dasar | Syaikah |
| Halaman wallet + wallet card | Syaikah |
| Halaman daftar lelang + detail lelang | Syaikah |
| Notifikasi in-app + email | Peter |
| Admin panel: kelola user, lelang, KYC | Michael |
| Database constraints (wallet append-only, audit log) | Michael |

**Fase 1 selesai kalau:**
- User bisa daftar → KYC → top up CC → bid → menang → saldo terpotong otomatis
- Admin bisa buat dan monitor lelang
- Anti-snipe aktif dan sudah ditest

---

## Fase 2 — Prestige System *(Bulan 3–4)*

Sistem yang membuat platform terasa berbeda dari lelang biasa.

| Fitur | PIC |
|---|---|
| Dynamic UI per rank — CSS variable berubah otomatis | Syaikah + Fatih |
| Phantom bid (Shadow Pledge) | Fatih |
| Cashback otomatis per rank | Fatih |
| Achievement engine + semua achievement | Fatih |
| Cosmetic system: semua tipe, bisa dipasang | Fatih (logic) + Syaikah (UI) |
| Shop backend + frontend | Peter (backend) + Syaikah (UI) |
| Profil lengkap: Trophy Hall, Showcase Vault, gelar | Syaikah |
| Privacy settings | Peter |
| Leaderboard 7 kategori + cache | Fatih (cache) + Visel (display) |
| Museum dasar | Visel |
| Achievement display | Visel |
| Halaman settings lengkap | Syaikah |
| Flash sale di shop | Peter |
| Web push notification (FCM) | Peter |

**Fase 2 selesai kalau:**
- Rank naik → UI berubah otomatis
- Achievement bisa diraih dan tampil di profil
- Shop berfungsi: beli cosmetic → terpasang di profil
- Leaderboard update setiap 5 menit

---

## Fase 3 — Live & Events *(Bulan 5–6)*

Platform terasa hidup, kompetitif, dan bernilai entertainment.

| Fitur | PIC |
|---|---|
| Live Auction penuh: streaming Agora + real-time bid + VIP room | Michael |
| Rank-Exclusive Auction | Fatih |
| Sealed Chest Auction | Fatih |
| Descending (Reverse) Auction | Fatih |
| Event seasonal: multiplier EXP, achievement event, visual berubah | Fatih + Syaikah |
| Daily Quest | Fatih |
| Halaman event + detail event | Visel |
| Museum lengkap + editorial | Visel |
| Halaman help/FAQ | Visel |
| Victory animation saat menang | Syaikah |
| Share Victory Card ke media sosial | Syaikah |
| Anti-fraud rule-based | Michael |

**Fase 3 selesai kalau:**
- Live auction bisa dijalankan dengan streaming dan real-time bid
- Event seasonal mengubah tampilan platform otomatis
- Daily quest aktif dan memberikan EXP

---

## Fase 4 — Polish & Presentasi *(Bulan 7)*

Platform siap dipresentasikan — semua fitur ditest dan dipoles.

| Tugas | PIC |
|---|---|
| Bug fixing dari semua fase sebelumnya | Semua |
| Performance testing: pastikan halaman cepat | Michael |
| Pastikan semua animasi smooth di berbagai device | Syaikah |
| Load testing sederhana untuk live auction | Michael |
| Siapkan akun demo: beberapa user dengan rank berbeda | Semua |
| Siapkan skenario demo yang menarik | Semua |
| Update Railway ke Hobby plan (seminggu sebelum presentasi) | Michael |
| Dokumentasi cara setup lokal yang jelas | Michael |

---

## Dependency Map

Urutan yang harus diikuti — tidak bisa lompat langkah:

```
Michael (DB Schema + Infra)    ← Harus selesai duluan
          ↓
Fatih (Auction, Wallet, Rank)  ← Bergantung ke schema Michael
Peter (Auth, KYC)              ← Bergantung ke schema Michael
          ↓
Syaikah (Dynamic UI)           ← Bergantung ke rank system Fatih
Visel (Leaderboard, Museum)    ← Bergantung ke leaderboard cache Fatih
```

---

## Prioritas Mutlak Sebelum Presentasi

Ini yang harus benar-benar berfungsi tanpa bug:

1. Registrasi dan login berfungsi
2. KYC bisa submit dan admin bisa approve
3. Top up CC berhasil (Midtrans Sandbox)
4. Bid berfungsi — tidak ada race condition
5. Anti-snipe aktif
6. Rank naik otomatis
7. Shop: beli cosmetic → terpasang di profil
8. Notifikasi terkirim saat outbid dan menang
9. Leaderboard tampil dan update
10. Live auction bisa dijalankan dengan streaming

---

## Aturan Fase

- Setiap fase dimulai dengan planning singkat — apa yang dikerjakan siapa minggu ini
- Setiap akhir fase ada review bersama — test semua fitur yang seharusnya sudah selesai
- Kalau ada fitur fase sebelumnya yang masih rusak, perbaiki dulu sebelum mulai fase berikutnya
- Dokumentasi update setiap ada keputusan teknis baru
