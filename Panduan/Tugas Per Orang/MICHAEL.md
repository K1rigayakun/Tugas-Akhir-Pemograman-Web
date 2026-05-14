# 🏛️ Michael — Database, Infrastruktur, Live Auction, Keamanan, Admin

**Domain:** Fondasi teknis seluruh platform — database, cloud, keamanan, live auction, dan admin panel.

Sebelum satu baris kode production ditulis siapapun, fondasimu harus sudah berdiri.
Kamu bekerja di `packages/db` (schema), `apps/api` (module khusus), `apps/admin`, dan seluruh infrastruktur.

---

## Tanggung Jawab Utama

1. **Database Schema** — Fondasi seluruh data platform (kerjakan duluan di Fase 0)
2. **Infrastruktur & DevOps** — Monorepo, environment, CI/CD, cloud
3. **Live Auction** — Streaming real-time dan WebSocket room system
4. **Keamanan & Anti-Fraud** — Deteksi kecurangan dan perlindungan data
5. **Admin Panel** — Backend dan frontend untuk pengelolaan platform

---

## 1 — Database Schema (Fase 0 — Kerjakan Duluan)

### Kenapa Harus Selesai Duluan

Semua anggota tim bergantung pada schema ini. Kalau schema berubah setelah development dimulai, semua orang terdampak.
Buat schema lengkap dan minta persetujuan seluruh tim sebelum ada yang mulai coding fitur.

Schema didefinisikan menggunakan **Prisma** di `packages/db/schema.prisma`.

### Tabel-tabel Utama

**users** — Data utama setiap user

Field penting: `id`, `email`, `passwordHash`, `emailVerified`, `rank`, `totalExp`, `winStreak`, `longestStreak`, `totalWins`, `totalBids`, `kycStatus`, `privacyMode`, `twoFactorEnabled`, `twoFactorSecret` (encrypted), `notificationPrefs` (JSON), `activeTitle`, `activeCoatFrame`, `activeNameEffect`, `activeWalletSkin`, `isSuspended`, `suspendUntil`, `createdAt`, `lastActiveAt`

**user_kyc** — Data verifikasi identitas (tabel TERPISAH dari `users`)

Field penting: `id`, `userId`, `fullName` (encrypted), `nationalId` (encrypted, unique), `dateOfBirth` (encrypted), `phoneNumber` (encrypted), `streetAddress` (encrypted), `city`, `province`, `country`, `postalCode`, `idDocumentKey`, `selfieKey`, `reviewedBy`, `reviewNotes`, `submittedAt`, `reviewedAt`, `kycStatus`

> Kolom yang ditandai encrypted → enkripsi di application layer sebelum disimpan.

**auctions** — Data setiap lelang

Field penting: `id`, `title`, `description`, `category`, `rarity`, `auctionType`, `status`, `startingPrice`, `currentPrice`, `minimumIncrement`, `minimumPrice`, `decrementAmount`, `startTime`, `endTime`, `minimumRank`, `isSealed`, `imageUrls` (array), `videoUrl`, `modelUrl`, `winnerId`, `finalPrice`, `inMuseum`

**bids** — Setiap penawaran

Field penting: `id`, `auctionId`, `userId`, `amount`, `status`, `isPhantom`, `phantomMax` (encrypted), `placedAt`

**wallet_accounts** — Saldo CC per user

Field penting: `id`, `userId` (unique), `balance`, `pendingHold`, `totalTopUp`, `totalSpent`

**wallet_transactions** — Ledger keuangan. **Tidak boleh ada UPDATE atau DELETE.**

Field penting: `id`, `walletId`, `type`, `amount`, `description`, `referenceId`, `idempotencyKey` (unique), `createdAt`

**sessions** — Sesi login aktif

Field: `id`, `userId`, `deviceInfo`, `ipAddress`, `createdAt`, `lastActiveAt`, `isActive`

**achievements** — Definisi semua achievement

Field: `id`, `name`, `description`, `tier`, `trigger`, `condition` (JSON), `expReward`, `titleReward`, `cosmeticReward`

**user_achievements** — Junction: siapa sudah unlock achievement mana

Field: `id`, `userId`, `achievementId`, `unlockedAt`

**cosmetics** — Definisi semua cosmetic

Field: `id`, `name`, `type` (frame/banner/nameEffect/walletSkin/chatEffect), `rarity`, `imageUrl`, `previewUrl`, `obtainMethod` (shop/achievement/rank/event)

**user_cosmetics** — Koleksi cosmetic yang dimiliki user

Field: `id`, `userId`, `cosmeticId`, `obtainedAt`, `obtainedFrom`

**rank_history** — Log naik rank per user

Field: `id`, `userId`, `fromRank`, `toRank`, `changedAt`, `reason`

**exp_events** — Log setiap perolehan EXP

Field: `id`, `userId`, `amount`, `reason`, `multiplier`, `createdAt`

**events** — Event seasonal

Field: `id`, `name`, `theme`, `backgroundMode`, `accentColors` (JSON), `expMultiplier`, `startTime`, `endTime`, `isActive`

**notifications** — Notifikasi per user

Field: `id`, `userId`, `type`, `payload` (JSON), `isRead`, `createdAt`

**audit_logs** — Semua aksi admin. **Tidak boleh ada UPDATE atau DELETE.**

Field: `id`, `adminId`, `action`, `targetId`, `targetType`, `details` (JSON), `ipAddress`, `timestamp`

**shop_items** — Item di shop

Field: `id`, `name`, `type`, `cosmeticId`, `price`, `stock`, `isLimited`, `flashSalePrice`, `flashSaleEnd`, `isActive`

**shop_transactions** — Riwayat pembelian

Field: `id`, `userId`, `shopItemId`, `pricePaid`, `idempotencyKey`, `purchasedAt`

**daily_quests** — Definisi quest harian

Field: `id`, `title`, `description`, `condition` (JSON), `expReward`, `isActive`

**user_quest_progress** — Progress quest per user per hari

Field: `id`, `userId`, `questId`, `date`, `progress`, `isCompleted`, `claimedAt`

**museum_items** — Item yang dikurasi ke museum

Field: `id`, `auctionId`, `featuredAt`, `editorial` (teks kurasi dari admin)

**auction_watchlists** — Junction: user yang watch lelang tertentu

Field: `id`, `userId`, `auctionId`, `addedAt`

**phantom_bids** — Phantom bid aktif per user per lelang

Field: `id`, `userId`, `auctionId`, `maxAmount` (encrypted), `isActive`, `createdAt`

### Aturan Database Kritis

- `wallet_transactions` dan `audit_logs`: buat database constraint atau trigger yang mencegah UPDATE dan DELETE
- Kolom yang ditandai encrypted: enkripsi di application layer sebelum insert, dekripsi setelah select
- Semua tabel dengan volume tinggi (`bids`, `notifications`, `wallet_transactions`): pastikan ada index yang tepat
- Gunakan soft delete (`deletedAt`) untuk user — jangan hapus data user secara permanen
- **Setiap perubahan schema setelah Fase 0**: buat file migration baru dengan `prisma migrate dev --name nama-perubahan`. Jangan edit file migration yang sudah ada.

---

## 2 — Infrastruktur & DevOps

### Monorepo Setup (Fase 0)

Setup Turborepo di root project dengan struktur:

```
emerald-kingdom/
├── apps/
│   ├── web/
│   ├── admin/
│   ├── api/
│   └── oracle/
├── packages/
│   ├── db/
│   ├── ui/
│   └── types/
├── testing/          ← ada di .gitignore
├── turbo.json
└── package.json
```

Buat script di root `package.json` agar semua orang bisa jalankan project dengan satu perintah:
- `turbo dev` — Jalankan semua app sekaligus
- `turbo build` — Build semua app
- `turbo lint` — Lint semua package
- `npm run db:migrate` — Jalankan migration database

### File .gitignore

Pastikan ini ada di `.gitignore`:
```
.env
.env.local
.env.production
/testing
node_modules
```

### Environment

Buat file `.env.example` di root dengan komentar jelas untuk setiap variabel yang dibutuhkan.
Template ini yang dibagikan ke tim — isi nilainya masing-masing.

Tiga environment:
- **Development** — Lokal, pakai Neon dev database
- **Staging** — Railway, pakai Neon staging database (mirror production)
- **Production** — Railway, pakai Neon production database

### CI/CD (GitHub Actions)

Buat dua workflow:

**`ci.yml`** — Berjalan di setiap PR:
- Lint semua packages
- Type check (`tsc --noEmit`)
- Build semua apps
- Kalau salah satu gagal, PR tidak bisa di-merge

**`deploy.yml`** — Berjalan saat merge ke `main`:
- Build dan deploy ke Railway (backend)
- Deploy ke Vercel (frontend) — Vercel sudah otomatis terhubung ke GitHub

### Cloud Services

- **Neon** — PostgreSQL. Buat dua database: `emerald_dev` dan `emerald_staging`
- **Upstash** — Redis. Buat dua instance: dev dan staging
- **Cloudflare R2** — Satu bucket untuk semua environment, dibedakan via folder prefix (`dev/`, `staging/`, `production/`)
- **Railway** — Deploy `apps/api` dan `apps/oracle`
- **Vercel** — Deploy `apps/web` dan `apps/admin`

---

## 3 — Live Auction System

### Cara Kerjanya

Dua lapisan yang bekerja bersamaan:
1. **Video Streaming** — Host siaran via Agora.io
2. **Real-time Bidding** — Bid real-time via Socket.io + Redis Adapter

### Socket.io dengan Redis Adapter

Redis Adapter memungkinkan WebSocket bekerja di multiple server instance:

```ts
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

### Room System

Setiap live auction punya room sendiri di Socket.io:

| Room | Siapa yang Bisa Join |
|---|---|
| `auction:{id}` | Semua penonton |
| `auction:{id}:vip` | Rank Marquis ke atas |
| `auction:{id}:admin` | Host dan admin |

Saat user join halaman live auction, server cek rank-nya dan masukkan ke room yang sesuai.

### Endpoint Live Auction

```
POST /api/v1/admin/live-auctions/start    → Mulai sesi live
POST /api/v1/admin/live-auctions/:id/end  → Akhiri sesi live
GET  /api/v1/live-auctions/token          → Token untuk join video Agora
GET  /api/v1/live-auctions/active         → Live auction yang sedang berlangsung
```

---

## 4 — Keamanan & Anti-Fraud

### Rule-Based (Real-time)

Cek langsung saat transaksi terjadi:

- Lebih dari 5 bid per menit dari satu user → flag
- Win rate > 95% dalam 7 hari → masuk antrian review
- Top up besar tiba-tiba setelah tidak aktif lama → hold & review
- Login dari IP berbeda dalam waktu singkat → security alert email

### Enkripsi Data KYC

Kolom sensitif di tabel `user_kyc` dienkripsi sebelum disimpan:

```ts
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// Enkripsi sebelum insert
function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  // ...
}

// Dekripsi setelah select
function decrypt(encryptedText: string): string {
  // ...
}
```

`ENCRYPTION_KEY` disimpan di environment variable — tidak pernah ada di kode.

### Sistem Sanksi

```
POST /api/v1/admin/users/:id/warn           → Kirim peringatan
POST /api/v1/admin/users/:id/suspend        → Suspend sementara
POST /api/v1/admin/users/:id/ban-auction    → Larang ikut lelang
POST /api/v1/admin/users/:id/ban-permanent  → Ban permanen
```

Semua aksi ini dicatat ke `audit_logs` secara otomatis.

### Audit Log

Setiap aksi admin dicatat dan tidak bisa diubah:

```ts
async logAdminAction(adminId, action, targetId, details) {
  await db.auditLog.create({
    data: { adminId, action, targetId, details, ipAddress, timestamp: new Date() }
  });
  // Tidak ada update atau delete — append only
}
```

---

## 5 — Admin Panel

### Peran Admin (RBAC)

| Peran | Akses |
|---|---|
| Super Admin | Semua fitur |
| Auction Manager | Kelola lelang, review item |
| KYC Officer | Review pengajuan KYC |
| Content Manager | Museum, event, konten |
| Support Officer | Laporan user |

Implementasi dengan NestJS Guards dan decorator `@Roles()`.

### Halaman Admin Panel (`apps/admin`)

**Dashboard:**
- Statistik hari ini: user aktif, lelang aktif, total top up
- Alert fraud yang perlu ditindaklanjuti
- Grafik aktivitas platform 7 hari terakhir

**Kelola Lelang:**
- Buat lelang baru dengan form lengkap (upload foto, video, 3D model)
- Daftar semua lelang dengan filter status
- Monitor bid real-time saat lelang aktif
- Batalkan lelang (trigger refund otomatis ke semua bidder)

**Kelola User:**
- Search user (email, username)
- Lihat profil lengkap: riwayat bid, riwayat transaksi, riwayat sanksi
- Aksi: warn, suspend, ban

**Review KYC:**
- Antrian pengajuan yang perlu direview
- Tampilkan foto KTP dan selfie
- Approve atau Reject dengan catatan alasan

**Kelola Museum:**
- Kurasi item ke museum
- Tulis editorial per item
- Atur item yang ditampilkan

**Kelola Event:**
- Buat event baru dengan konfigurasi visual dan EXP multiplier
- Aktifkan dan akhiri event

**Audit Log:**
- Tampilan read-only semua aksi admin
- Tidak bisa difilter atau disembunyikan

### Endpoint Admin Penting

```
GET  /api/v1/admin/dashboard/stats
GET  /api/v1/admin/audit-logs
GET  /api/v1/admin/fraud-alerts
GET  /api/v1/admin/users/:id/full-profile
POST /api/v1/admin/auctions/:id/cancel         → Trigger refund semua hold
POST /api/v1/admin/museum/items/:auctionId     → Kurasi item ke museum
POST /api/v1/admin/events                      → Buat event baru
PUT  /api/v1/admin/events/:id/activate
PUT  /api/v1/admin/events/:id/end
```

---

## Koneksi dengan Tim

| Orang | Hubungan |
|---|---|
| **Semua** | Schema database dari kamu. Tidak ada yang bisa mulai sebelum schema selesai dan di-approve |
| **Fatih** | Redis bid lock implementasi bersama. WebSocket server setup bersama |
| **Syaikah** | WebSocket events dari live auction dikonsumsi Syaikah untuk update UI |
| **Peter** | Enkripsi data KYC dikoordinasikan — Peter yang handle endpoint, kamu yang setup enkripsi |
| **Visel** | Data museum dan event dari admin panel kamu dikonsumsi Visel di frontend |

---

## Checklist Michael

**Fase 0:**
- [ ] Monorepo Turborepo berjalan — semua orang bisa `turbo dev` di lokal
- [ ] Database schema lengkap dan di-approve semua anggota tim
- [ ] CI/CD pipeline aktif (lint + type check + build di setiap PR)
- [ ] Environment dev/staging terkonfigurasi
- [ ] Cloud resources siap: Neon, Upstash, R2

**Keamanan:**
- [ ] `wallet_transactions` dan `audit_logs`: ada constraint yang mencegah UPDATE & DELETE
- [ ] Enkripsi kolom sensitif KYC berfungsi (encrypt sebelum simpan, decrypt setelah ambil)
- [ ] Rate limiting aktif di semua endpoint
- [ ] Argon2 dipakai untuk hash password
- [ ] Audit log mencatat semua aksi admin

**Live Auction:**
- [ ] Socket.io dengan Redis Adapter berjalan
- [ ] Room system berfungsi: umum, VIP, admin
- [ ] Token Agora berfungsi untuk join video streaming
- [ ] Bid real-time di-broadcast ke semua penonton

**Admin Panel:**
- [ ] RBAC berfungsi — role berbeda akses berbeda
- [ ] Dashboard menampilkan statistik platform
- [ ] Review KYC bisa approve/reject dari panel
- [ ] Batalkan lelang otomatis trigger refund semua hold
- [ ] Audit log tampil dan tidak bisa dimanipulasi
