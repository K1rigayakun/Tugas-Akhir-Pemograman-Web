# Emerald Kingdom — Skill Log

## Cara Update
Update file ini setiap kali ada:
- Error yang butuh waktu lama untuk debug
- Cara yang lebih efisien ditemukan
- Library/tool yang bermasalah
- Pattern berguna yang bisa dipakai ulang

## Log Entries

### 2026-05-30 — Setup Monorepo Awal

**Situasi:** Setup monorepo Turborepo dari nol

**Temuan:**
- Prisma client singleton pattern wajib dipakai di Next.js supaya tidak ada multiple instance saat hot reload
- `transpilePackages` di next.config.js wajib untuk workspace packages
- CSS variables untuk warna HARUS didefinisikan di globals.css, bukan di komponen individual
- Migration file yang sudah ada TIDAK BOLEH diedit — selalu buat baru

**Berlaku untuk:** Seluruh project

### 2026-05-30 — Enkripsi Data KYC

**Situasi:** Implementasi enkripsi untuk data sensitif KYC

**Temuan:**
- Format encrypted: `iv:authTag:ciphertext` (semua hex)
- ENCRYPTION_KEY harus 64 karakter hex (32 bytes)
- Generate key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- nationalId di-hash satu arah untuk cek duplikasi (1 NIK = 1 akun)
- Dekripsi bisa gagal kalau key berubah — handle error-nya

**Berlaku untuk:** `apps/api/src/common/encryption/`

### 2026-05-30 — Append-Only Tables

**Situasi:** Implementasi constraint untuk wallet_transactions dan audit_logs

**Temuan:**
- Gunakan PostgreSQL trigger BEFORE UPDATE/DELETE yang RAISE EXCEPTION
- Trigger harus dijalankan via migration SQL manual (bukan Prisma schema)
- File migration ada di `packages/db/migrations/00_append_only_constraints/`

**Berlaku untuk:** `packages/db/migrations/`

### 2026-05-30 — Audit & Perbaikan Kritis

**Situasi:** Audit jujur mengungkap banyak gap kritis

**Temuan KRITIS:**
- **SELALU gunakan `prisma.$transaction()`** untuk operasi yang melibatkan beberapa tabel (refund, cancel auction, dll). Tanpa ini, data bisa corrupt kalau gagal di tengah
- **AuthGuard WAJIB dijalankan sebelum RolesGuard** — urutan di `@UseGuards()` penting. AuthGuard set `req.user`, RolesGuard cek `req.user.adminRole`
- **JANGAN pakai `@Body() body: any`** — selalu pakai DTO dengan class-validator. Input user TIDAK BISA dipercaya
- **ThrottlerGuard harus global** — pakai `APP_GUARD` di module, bukan per-controller. Kalau per-controller, endpoint yang lupa akan terbuka
- **banFromAuction harus benar-benar melakukan sesuatu** — audit log saja TIDAK CUKUP. Harus ada flag di database
- **Agora token HMAC biasa TIDAK AKAN diterima Agora** — harus pakai builder yang benar dengan privilege system
- **Redis Adapter wajib di-setup** kalau mau scale WebSocket — `Map<>` hilang saat restart
- **Tailwind WAJIB ada tailwind.config.js dan postcss.config.js** di setiap Next.js app

**Pola yang Benar:**
```typescript
// BENAR: $transaction untuk operasi multi-tabel
await prisma.$transaction(async (tx) => {
  await tx.auction.update({ ... });
  await tx.bid.update({ ... });
  await tx.walletAccount.update({ ... });
});

// SALAH: sequential tanpa transaction
await prisma.auction.update({ ... });
await prisma.bid.update({ ... }); // kalau ini gagal, auction udah ke-update
```

**Berlaku untuk:** Seluruh backend

### 2026-06-07 — Migrasi GSAP ke Anime.js v4

**Situasi:** Mengganti GSAP + ScrollTrigger dengan Anime.js v4 di seluruh apps/web

**Temuan:**
- Anime.js v4 menggunakan named import: `import { animate, stagger, createScope, createTimeline } from "animejs"`
- `createScope` callback menerima `scope: Scope | undefined` — BUKAN `Scope` saja
- Untuk scroll-triggered animations tanpa ScrollTrigger, gunakan `IntersectionObserver` native + `animate()`. Pattern:
  ```typescript
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(target, { opacity: [0, 1], translateY: [30, 0], duration: 800 });
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.15 });
  observer.observe(target);
  ```
- Stagger di Anime.js v4: `delay: stagger(200, { start: 300 })` = mulai setelah 300ms, jarak 200ms antar item
- Untuk cleanup di React useEffect: `const anim = animate(...); return () => anim.pause();`
- Easing names berubah: `power3.out` → `outCubic`, `power2.out` → `outQuad`
- `gsap.set()` diganti dengan DOM langsung: `el.style.opacity = "0"` sebelum animate
- **HATI-HATI** saat edit globals.css — edit partial bisa menghapus header `:root`. Lebih aman overwrite seluruh file jika edit complex

**Berlaku untuk:** `apps/web/src/components/`, `apps/web/src/hooks/`

### 2026-06-08 — Session Persistence & Admin Panel Fixes

**Situasi:** Login session web hilang setelah refresh. Beberapa halaman admin 404. KYC pending crash.

**Temuan:**
- **Cookie-based session di Next.js**: Gunakan `cookies()` dari `next/headers` di server action, bukan localStorage. Pattern:
  ```typescript
  // Server action - set cookie setelah login
  cookieStore.set('accessToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
  
  // Server action - baca session user
  const token = cookies().get("accessToken")?.value;
  // lalu fetch /auth/me dengan Bearer token
  ```
- **Layout server component + client header**: Layout (server) fetch user data, pass sebagai prop ke client component header. Ini lebih reliable daripada useEffect di client.
- **@Query parameter SELALU string**: NestJS `@Query("page")` mengembalikan string, BUKAN number. SELALU parse dengan `parseInt(page, 10) || 1` sebelum dipakai di Prisma `skip`.
- **Prisma `db push` vs `generate` saat proses API berjalan**: File `query_engine-windows.dll.node` akan locked kalau ada Node.js process yang sedang pakai Prisma. HARUS kill semua node processes dulu sebelum `prisma generate`.
- **`parseInt` untuk FormData fields**: Saat terima data dari FormData (multipart), semua field datang sebagai string. Field numerik seperti `order` harus di-parse: `parseInt(data.order, 10) || 0`.
- **PlatformSetting sebagai key-value store**: Model `PlatformSetting { key @id, value Json }` cocok untuk config seperti tema, feature flags, dll. Pakai `upsert` untuk update.

**Berlaku untuk:** Seluruh project

### 2026-06-08 — Cosmetic Injection System (CSS/JS)

**Situasi:** Implementasi sistem kosmetik yang admin inject via raw CSS/JS code, bukan gambar.

**Temuan:**
- **CosmeticsInjector** di layout.tsx: Server component yang baca cookie `equipped_*_id`, query Prisma untuk `webCode`, lalu render `<style dangerouslySetInnerHTML>`. Harus di-render sebelum konten halaman.
- **equipCosmeticAction**: Server action set cookie per-tipe (equipped_web_code_id, equipped_frame_id, dll.) dengan maxAge 30 hari.
- **Admin panel cosmetics**: Type `WEB_CODE` menggunakan textarea untuk kode CSS. Tipe lain (FRAME, BANNER, NAME_EFFECT) juga bisa punya `webCode` field untuk efek CSS.
- **CosmeticRarity enum**: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, MYTHIC. Gunakan UPPERCASE. TRANSCENDENT TIDAK ada di enum.
- **Seed script**: Jalankan dari `apps/api` directory: `node ../../packages/db/seed-cosmetics.js`. Karena bcryptjs mungkin tidak ter-install di `packages/db`, hardcode password hash.

**Berlaku untuk:** `apps/web/src/components/CosmeticsInjector.tsx`, `apps/web/src/app/actions/cosmetics.ts`, `apps/admin/src/app/cosmetics/`

### 2026-06-08 — Auction Gating Logic

**Situasi:** Lelang yang memerlukan rank/achievement tertentu tidak boleh muncul di beranda/search untuk user yang tidak memenuhi syarat.

**Temuan:**
- **`serverGetApi` vs `fetchApi`**: `fetchApi` (lib/api.ts) TIDAK kirim auth header → semua request dianggap anonymous. Untuk gated content, HARUS pakai `serverGetApi` (actions/apiProxy.ts) yang baca cookie `accessToken`.
- **Gating filter di AuctionService.findAll**: User tanpa login atau tanpa rank cukup → filter `(!a.minimumRank || a.minimumRank === "CIVIS") && !a.requiredAchievementId`.
- **Import path**: File di `src/app/page.tsx` import dari `./actions/apiProxy` (satu level). File di subdirectory (`search/page.tsx`, `auction/page.tsx`) import dari `../actions/apiProxy` (naik satu level). JANGAN tertukar.

**Berlaku untuk:** `apps/web/src/app/page.tsx`, `apps/api/src/modules/auction/auction.service.ts`

### 2026-06-08 — Localhost vs 127.0.0.1

**Situasi:** Login dan fetch ke API gagal dengan "fetch failed" di Next.js server-side.

**Temuan:**
- Di Windows, `localhost` bisa resolve ke IPv6 `::1` yang tidak di-listen oleh NestJS.
- **Solusi**: Ganti default API_URL dari `http://localhost:3001` ke `http://127.0.0.1:3001` di `apps/web/src/lib/api.ts`.

**Berlaku untuk:** `apps/web/src/lib/api.ts`

### 2026-06-08 — Search Rarity Filter Mismatch

**Situasi:** Item di beranda ada tapi di search tidak muncul.

**Temuan:**
- Backend mengembalikan rarity dalam format UPPERCASE: `"LEGENDARY"`, `"EPIC"`, dll.
- Filter di SearchClient.tsx menggunakan Title Case: `"Common"`, `"Legendary"` → TIDAK MATCH.
- **Solusi**: Samakan filter values dengan backend enum: `["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"]`.

**Berlaku untuk:** `apps/web/src/app/search/SearchClient.tsx`

### 2026-06-08 — Advanced Cosmetic Animation Rule

**Situasi:** Membuat animasi kosmetik yang sangat high-end (EPIC ke atas).

**Temuan:**
- **WAJIB** menggunakan **Anime.js v4** untuk animasi JavaScript kompleks, ATAU **Spline 3D** (@splinetool/react-spline) untuk elemen 3D interaktif yang mutakhir.
- Animasi harus memiliki state **idle yang berlangsung terus-menerus** (continuous loop) tanpa jeda yang aneh, sehingga terasa hidup.
- Hindari animasi CSS murni jika sudah terlalu kompleks (banyak keyframes, elemen bersarang). Gunakan splineUrl atau hook JS kustom jika diperlukan.
- Desain harus benar-benar WOW (glassmorphism, micro-animations, glowing particles).

**Berlaku untuk:** Semua kosmetik level tinggi (Avatar Frames, Namecards, dsb).

### 2026-06-13 — Multiple Payment Methods Implementation

**Situasi:** Implementasi sistem pembayaran lengkap dengan 5 metode (Testing, QRIS, VA, E-Wallet, Stripe)

**Temuan:**
- **PaymentProviderRegistry pattern**: Register providers saat module init, lookup by method saat runtime. Extensible tanpa mengubah service logic.
- **Approve TopUp HARUS pakai `$transaction`**: Update status + increment balance + create wallet transaction HARUS atomic. Kalau increment balance berhasil tapi create transaction gagal, data inkonsisten.
- **Testing provider in-memory storage**: `Map<string, PaymentStatusResponse>` — hilang saat restart, tapi cukup untuk development. Jangan pakai di production.
- **Admin panel fallback**: Kalau API endpoint baru belum ready, admin panel harus fallback ke legacy endpoint. Pattern: `try new API → catch → try legacy API`.
- **Multi-step form di Next.js**: Gunakan state machine sederhana (`step: "select-package" | "select-method" | "payment-details" | "status"`) — lebih readable daripada step number.
- **Sub-selection pattern**: Untuk VA → perlu pilih bank, untuk E-Wallet → perlu pilih wallet type. Validasi sub-selection sebelum initiate payment.
- **SVG icons bukan emoji**: Per aturan project, gunakan SVG inline `<svg>` dengan `path d="..."` — bukan emoji/unicode. Simpan icon paths sebagai string constant.
- **Proof upload MVP**: Base64 data URL cukup untuk MVP. Untuk production, ganti ke Cloudflare R2 / Supabase Storage.

**Berlaku untuk:** `apps/api/src/modules/payment/`, `apps/web/src/components/payment/`, `apps/web/src/app/topup/`

### 2026-06-14 — Pagination NaN Bug & 2FA Bypass

**Situasi:** Semua halaman admin panel (Users, Auctions, Events, Museum, Finance, KYC) mengembalikan 500 Internal Server Error. Login admin terblokir oleh 2FA.

**Temuan:**
- **NestJS `@Query("page")` tanpa value → NaN**: Meskipun ada default value `page: number = 1`, NestJS `ValidationPipe` dengan `enableImplicitConversion: true` mengubah query parameter kosong menjadi `NaN`. `(NaN - 1) * 20 = NaN`, dan Prisma menolak `skip: NaN` dengan error `"Argument skip is missing"`.
- **Solusi: `safePaginate()` helper**:
  ```typescript
  private safePaginate(page?: number, limit?: number) {
    const p = (typeof page === 'number' && !isNaN(page) && page >= 1) ? Math.floor(page) : 1;
    const l = (typeof limit === 'number' && !isNaN(limit) && limit >= 1) ? Math.min(Math.floor(limit), 100) : 20;
    return { skip: (p - 1) * l, take: l, page: p, limit: l };
  }
  ```
- **2FA memaksa semua login**: Auth service `login()` selalu memerlukan 2FA — baik setup (jika belum enable) maupun verify (jika sudah enable). Tidak ada jalur "tanpa 2FA".
- **Solusi: Bypass jika 2FA di-reset**: Jika `twoFactorEnabled === false && twoFactorSecret === null`, langsung issue token tanpa 2FA flow. Reset database: `UPDATE users SET "twoFactorEnabled" = false, "twoFactorSecret" = null WHERE email = '...'`.
- **Empty search query**: `searchUsers` dengan query `""` menerapkan filter `OR` yang tidak perlu. Solusi: cek `query && query.trim().length > 0` sebelum menerapkan filter.

**Berlaku untuk:** `apps/api/src/modules/admin/admin.service.ts`, `apps/api/src/auth/auth.service.ts`

### 2026-06-14 — API URL Mismatch di SSR Data Fetch

**Situasi:** Homepage Museum section menampilkan "No featured items available yet" padahal API `/api/v1/museum/featured` mengembalikan 5 item. Leaderboard homepage juga tidak refresh data secara client-side.

**Temuan:**
- **DUA api helper berbeda dengan URL berbeda**: `API_URL` di `lib/api.ts` = `http://127.0.0.1:3001/api/v1` (benar), tapi `API_BASE_URL` di `lib/serverDataFetch.ts` = `http://localhost:3001` (salah — tidak ada `/api/v1` prefix).
- **Akibat**: `serverFetchParallel('/museum/featured')` fetch ke `http://localhost:3001/museum/featured` yang return 404.
- **Bug ganda**: `Museum.tsx` dan `Leaderboard.tsx` client-side components juga menggunakan `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'` tanpa `/api/v1` prefix.
- **Solusi**: Ubah SEMUA fallback URL ke `http://127.0.0.1:3001/api/v1` di:
  - `apps/web/src/lib/serverDataFetch.ts`
  - `apps/web/src/components/home/Museum.tsx`
  - `apps/web/src/components/home/Leaderboard.tsx`
- **Pelajaran**: Setiap kali membuat file baru yang akses API, SELALU gunakan import dari `lib/api.ts` (`API_URL`) daripada hardcode URL sendiri.

**Berlaku untuk:** `apps/web/src/lib/serverDataFetch.ts`, `apps/web/src/components/home/`
