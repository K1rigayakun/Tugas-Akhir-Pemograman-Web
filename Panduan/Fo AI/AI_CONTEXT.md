# 🤖 Emerald Kingdom — AI Context

Baca file ini sebelum melakukan apapun.
Ini adalah file orientasi utama untuk AI agent yang bekerja di project ini.

---

## Project Ini Apa

Emerald Kingdom adalah platform lelang online premium berbasis web bertema kerajaan medieval fantasy.
Bukan toko online biasa — ini arena sosial kompetitif di mana status, rank, dan pencapaian penting.

Model bisnis: **Consignment Auction** — seller titip barang ke platform, admin verifikasi dan lelang, buyer bid pakai mata uang virtual Crown Coin (CC).

**Ini adalah proyek tugas kelas** yang dikerjakan 5 junior developer.
Anggap mereka belum terlalu berpengalaman. Jelaskan hal-hal yang tidak jelas, jangan asumsikan mereka tahu sesuatu yang belum diajarkan.

---

## Tim

| Nama | Domain |
|---|---|
| Syaikah | Frontend — tampilan, animasi, komponen, halaman |
| Peter | Auth, KYC, notifikasi, shop backend, upload file |
| Visel | Leaderboard, museum, achievement display, halaman statis |
| Fatih | Auction engine, bid, wallet, rank, achievement engine |
| Michael | Database schema, infrastruktur, live auction, admin panel |

---

## File yang Harus Dibaca Sebelum Kerja

Selalu baca dalam urutan ini sebelum mulai mengerjakan apapun:

```
1. AI_CONTEXT.md      → (ini) gambaran besar
2. AI_RULES.md        → cara kerja, workflow, aturan
3. AI_SKILL.md        → pelajaran dari error dan temuan sebelumnya
4. SHARED_VARIABLES.md → konstanta dan enum yang dipakai semua orang
5. ASSETS.md          → warna, gradient, font, icon
6. PERATURAN.md       → aturan tim
7. [File tugas orang yang minta bantuan]
```

---

## Struktur Project

```
emerald-kingdom/
├── apps/
│   ├── web/          → Frontend Next.js (user-facing) — Syaikah, Visel, Peter (UI)
│   ├── admin/        → Frontend Next.js (admin panel) — Michael
│   ├── api/          → Backend NestJS — semua backend
│   └── oracle/       → AI service Python FastAPI — Michael
├── packages/
│   ├── db/           → Prisma schema (sumber kebenaran database)
│   ├── ui/           → Komponen UI shared (Syaikah)
│   └── types/        → TypeScript types dan konstanta (semua orang pakai ini)
├── docs/
│   ├── plans/        → Plan task yang sedang aktif
│   └── archive/      → File yang sudah tidak dibutuhkan
└── testing/          → Eksperimen dan file test — TIDAK di-push ke GitHub
```

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, GSAP, Three.js, Framer Motion |
| Backend | NestJS, Prisma, Socket.io, BullMQ |
| Database | PostgreSQL (Neon), Redis (Upstash) |
| Storage | Cloudflare R2 |
| Deploy | Vercel (frontend), Railway (backend) |
| AI Service | FastAPI Python |
| Language | TypeScript (semua kecuali oracle yang Python) |

---

## Hal Penting yang Selalu Diingat

### Kode
- Type bersama → `packages/types` — jangan definisikan ulang di tempat lain
- Komponen UI yang dipakai lebih dari 1 halaman → `packages/ui`
- Tidak ada warna hardcode — pakai CSS variable dari `ASSETS.md`
- Tidak ada emoji di UI — semua SVG icon
- Gradient di elemen penting harus beranimasi, tidak statis

### Database
- `wallet_transactions` → tidak boleh UPDATE atau DELETE, pernah
- `audit_logs` → tidak boleh UPDATE atau DELETE, pernah
- Perubahan schema → selalu buat file migration baru (`prisma migrate dev --name nama`), jangan edit migration yang sudah ada
- Data KYC sensitif → enkripsi sebelum simpan ke database

### Security
- Password → hash dengan Argon2
- Setiap transaksi wallet → wajib pakai idempotency key
- Bid bersamaan → gunakan Redis distributed lock
- 1 NIK = 1 akun — validasi selalu aktif

---

## Cara Berkomunikasi

- Gunakan bahasa Indonesia yang mudah dipahami
- Kalau ada istilah teknis, jelaskan artinya
- Jelaskan logika/alasan sebelum kasih kode
- Kalau ada beberapa cara, rekomendasikan yang paling mudah untuk junior
- Kalau task besar → pecah jadi plan dulu, baru kerjakan

---

## Lokasi File Penting

| Kebutuhan | Lokasi |
|---|---|
| TypeScript types | `packages/types/src/` |
| Prisma schema | `packages/db/schema.prisma` |
| Migration database | `packages/db/migrations/` |
| Komponen UI shared | `packages/ui/src/` |
| CSS variables | `apps/web/src/app/globals.css` |
| Icon SVG | `packages/ui/src/icons/` |
| Environment template | `.env.example` (root) |
| File test/eksperimen | `/testing` (tidak di-push ke GitHub) |
| Plan task aktif | `docs/plans/` |
| File yang diarsipkan | `docs/archive/` |
