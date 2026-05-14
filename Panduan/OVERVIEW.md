# 👑 Emerald Kingdom — Overview

> *"Where Fortune Meets Glory."*
> *"Bid. Conquer. Ascend."*

---

## Apa Ini

Emerald Kingdom adalah platform lelang online premium berbasis web.
Temanya kerajaan medieval fantasy — setiap elemen terasa mahal, eksklusif, dan kompetitif.

Bukan sekadar tempat jual-beli. Ini arena sosial di mana rank, status, dan koleksi adalah identitas.

### Model Bisnis

**Consignment Auction** — mirip Sotheby's atau Christie's.

Seller titip barang ke platform secara fisik. Admin verifikasi, foto, dan lelang atas nama seller. Buyer tidak berurusan langsung dengan seller — semua lewat platform sebagai perantara terpercaya.

---

## Tim & Domain

| Nama | Domain |
|---|---|
| **Syaikah** | Frontend — tampilan, animasi, komponen UI, semua halaman |
| **Peter** | Auth, KYC, notifikasi, shop backend, upload file |
| **Visel** | Leaderboard, museum, achievement display, halaman statis |
| **Fatih** | Auction engine, bid, wallet, EXP & rank, achievement engine |
| **Michael** | Database schema, infrastruktur, live auction, keamanan, admin panel |

---

## Mata Uang Platform

- **Nama:** Crown Coin
- **Singkatan:** CC
- **Simbol:** ♛
- **Tampilan:** `♛ 12,500 CC`
- Dibeli dengan uang nyata (IDR) via Midtrans Sandbox
- Tidak bisa ditarik kembali ke uang nyata — satu arah
- Dipakai untuk bid, beli cosmetic, akselerasi rank

---

## Hierarki Rank (10 Level)

| # | Rank | Gelar |
|---|---|---|
| 1 | Civis | The Civis |
| 2 | Merchant | The Merchant |
| 3 | Knight | Sir / Dame [Username] |
| 4 | Baron | Baron / Baroness of [Username] |
| 5 | Viscount | Viscount / Viscountess |
| 6 | Earl | Earl / Countess of [Username] |
| 7 | Marquis | Marquis / Marchioness |
| 8 | Duke | Duke / Duchess of [Username] |
| 9 | Sovereign | The Sovereign |
| 10 | Emperor | The Emperor |

Rank naik otomatis berdasarkan EXP. Sovereign dan Emperor punya syarat tambahan selain EXP.

---

## Tipe Lelang

| Tipe | Deskripsi |
|---|---|
| Standard | Lelang biasa, durasi 1–7 hari |
| Scheduled | Dijadwalkan pada waktu tertentu |
| Live | Real-time dengan streaming video |
| Rank-Exclusive | Hanya untuk rank tertentu ke atas |
| Sealed Chest | Mystery auction — barang tidak diungkap penuh |
| Descending | Harga turun otomatis — siapa pertama bid, menang |

---

## Rute Platform

| Route | Nama Tematis |
|---|---|
| `/` | The Grand Vestibule |
| `/auction` | The Grand Colosseum |
| `/auction/[id]` | The Item Chamber |
| `/profile/[username]` | The Sigil of Prestige |
| `/wallet` | The Aerarium |
| `/shop` | The Royal Market |
| `/leaderboard` | The Grand Rankings |
| `/museum` | The Imperial Museum |
| `/achievements` | The Triumph Registry |
| `/events` | The Festival Calendar |
| `/settings` | The Sanctum of Preferences |
| `/notifications` | The Herald's Scroll |
| `/kyc` | The Citizen's Oath |
| `/help` | The Codex of Guidance |
| `/admin` | The Praetorian Console |

---

## Struktur Project

```
emerald-kingdom/
├── apps/
│   ├── web/          → Frontend user-facing (Next.js)
│   ├── admin/        → Frontend admin panel (Next.js)
│   ├── api/          → Backend (NestJS)
│   └── oracle/       → AI service (FastAPI Python)
├── packages/
│   ├── db/           → Prisma schema
│   ├── ui/           → Komponen UI shared
│   └── types/        → TypeScript types & konstanta shared
├── docs/
│   ├── plans/        → Plan task aktif
│   └── archive/      → File yang sudah tidak dibutuhkan
└── testing/          → Eksperimen — TIDAK di-push ke GitHub
```

---

## Tech Stack Ringkas

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, GSAP, Framer Motion, Three.js |
| Backend | NestJS, Prisma, Socket.io, BullMQ |
| Database | PostgreSQL (Neon), Redis (Upstash) |
| Storage | Cloudflare R2 |
| Deploy | Vercel (frontend), Railway (backend) |
| AI | FastAPI Python |

---

## File Dokumentasi

| File | Isi |
|---|---|
| `OVERVIEW.md` | Dokumen ini — gambaran besar |
| `ASSETS.md` | Warna, gradient, font, icon |
| `SHARED_VARIABLES.md` | Konstanta dan enum bersama |
| `PLAN.md` | Roadmap fase pengembangan |
| `TECH_CHOICES.md` | Keputusan teknologi dan layanan |
| `PERATURAN.md` | Aturan tim |
| `AI_CONTEXT.md` | Orientasi untuk AI agent |
| `AI_RULES.md` | Workflow dan aturan kerja AI |
| `AI_SKILL.md` | Log pelajaran selama development |
| `SYAIKAH.md` | Tugas Syaikah |
| `PETER.md` | Tugas Peter |
| `VISEL.md` | Tugas Visel |
| `FATIH.md` | Tugas Fatih |
| `MICHAEL.md` | Tugas Michael |

---

## Dependency Antar Anggota

Ini urutan yang harus diikuti — tidak bisa lompat langkah:

```
Michael (DB Schema + Infra)
          ↓
Fatih (Wallet, Auction, Rank) + Peter (Auth, KYC)
          ↓
Syaikah (Dynamic UI) + Visel (Leaderboard, Museum)
```

Tidak ada yang bisa mulai sebelum Michael selesai dengan schema database.
