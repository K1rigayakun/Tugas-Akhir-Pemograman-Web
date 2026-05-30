# ⚔️ Fatih — Auction Engine, Bid, Wallet, Rank, Achievement

**Domain:** Semua logika bisnis inti platform — lelang, tawaran, uang virtual, dan sistem prestige.

Kamu adalah jantung platform ini. Kalau bagianmu tidak bekerja, tidak ada yang bisa dilakukan.
Kamu bekerja di `apps/api`. Baca `SHARED_VARIABLES.md` — semua enum dan konstanta yang kamu butuhkan ada di sana.

---

## Tanggung Jawab Utama

1. **Auction Engine** — Mesin lelang semua tipe
2. **Bid System** — Mekanisme penawaran, phantom bid, anti-snipe
3. **Wallet System** — Crown Coin, transaksi, hold, cashback
4. **EXP & Rank System** — Perhitungan EXP, naik rank, privilege
5. **Achievement Engine** — Unlock achievement dan distribusi reward
6. **Event & Quest System** — Multiplier EXP, daily quest, seasonal

---

## 1 — Auction Engine

### Cara Kerjanya

Setiap lelang adalah sebuah state machine — melewati status secara berurutan:
`DRAFT → UPCOMING → ACTIVE → ENDING → ENDED` (atau `CANCELLED`).

Transisi antar status dijalankan oleh **BullMQ background job** secara terjadwal — bukan manual.

### Endpoint Lelang

```
GET  /api/v1/auctions                   → Daftar semua lelang (dengan filter)
GET  /api/v1/auctions/:id               → Detail satu lelang
GET  /api/v1/auctions/:id/bids          → Riwayat bid lelang
GET  /api/v1/auctions/live              → Lelang live yang sedang aktif
GET  /api/v1/auctions/upcoming          → Lelang mendatang
GET  /api/v1/auctions/ending-soon       → Lelang yang hampir berakhir (< 6 jam)
POST /api/v1/auctions/:id/watchlist     → Tambah ke watchlist
DELETE /api/v1/auctions/:id/watchlist   → Hapus dari watchlist
GET  /api/v1/auctions/watchlist         → Semua watchlist user

POST /api/v1/admin/auctions             → Buat lelang (admin)
PUT  /api/v1/admin/auctions/:id         → Update lelang (admin, sebelum aktif)
POST /api/v1/admin/auctions/:id/publish → Publish lelang (admin)
POST /api/v1/admin/auctions/:id/cancel  → Batalkan lelang (admin) — trigger refund semua hold
```

### Tipe Lelang

**Standard** — Durasi tetap 1–7 hari. Semua user terverifikasi bisa bid.

**Scheduled** — Dijadwalkan pada waktu tertentu. BullMQ job ubah status ke `ACTIVE` pada waktu yang ditentukan.

**Rank-Exclusive** — Punya field `minimumRank`. Saat user coba bid, backend cek rank user dulu. Kalau tidak memenuhi syarat, tolak dengan pesan jelas.

**Sealed Chest (Mystery)** — Field `isSealed: true`. Nama dan foto spesifik item disembunyikan — hanya kategorinya yang ditampilkan. Frontend Syaikah menampilkan placeholder mystery berdasarkan field ini.

**Descending (Reverse Auction)** — Harga turun otomatis setiap interval waktu. Siapa yang bid pertama = menang. BullMQ job yang kurangi harga berkala. Kalau harga sudah mencapai `minimumPrice`, lelang berakhir tanpa pemenang.

### Saat Lelang Berakhir (`ENDED`)

Semua ini harus terjadi secara berurutan:
1. Tentukan pemenang (bidder dengan tawaran tertinggi)
2. Potong saldo CC pemenang (dari hold ke deducted)
3. Kembalikan hold semua bidder yang kalah
4. Kirim notifikasi ke pemenang (YOU_WON) dan semua bidder yang kalah (OUTBID final)
5. Trigger EXP reward untuk pemenang
6. Trigger cashback untuk pemenang
7. Trigger achievement check
8. Kalau item memenuhi syarat → masuk museum (background job)

---

## 2 — Bid System

### Alur Bid Normal

Saat user submit bid, ini yang harus dicek dan dilakukan secara berurutan:

1. User sudah KYC?
2. Lelang sedang `ACTIVE` atau `ENDING`?
3. Jumlah bid lebih besar dari harga tertinggi saat ini?
4. Saldo tersedia cukup? (saldo total - pending hold >= jumlah bid)
5. **Acquire Redis lock** untuk lelang ini (cegah race condition)
6. Hold saldo CC sejumlah bid
7. Kalau user punya bid aktif sebelumnya di lelang ini → release hold lama
8. Update harga tertinggi lelang
9. **Release Redis lock**
10. Broadcast via WebSocket event `bid:new` ke semua penonton
11. Cek anti-snipe
12. Simpan ke tabel `bids`
13. Kirim notifikasi OUTBID ke bidder sebelumnya

```
POST /api/v1/auctions/:id/bids
Body: { amount: number, idempotencyKey: string }
```

### Redis Distributed Lock — Penting!

Ketika dua user bid bersamaan, harus ada mekanisme yang memastikan hanya satu yang diproses.
Gunakan Redis SETNX (SET if Not eXists):

```ts
async placeBid(auctionId: string, userId: string, amount: number) {
  const lockKey = `bid-lock:${auctionId}`;
  const lockValue = `${userId}-${Date.now()}`;

  // Coba ambil lock — kalau gagal, berarti ada bid lain yang sedang diproses
  const acquired = await redis.set(lockKey, lockValue, "PX", 5000, "NX");
  if (!acquired) {
    throw new Error("Another bid is being processed. Try again.");
  }

  try {
    await this.processBid(auctionId, userId, amount);
  } finally {
    // Selalu lepas lock setelah selesai
    const current = await redis.get(lockKey);
    if (current === lockValue) await redis.del(lockKey);
  }
}
```

### Anti-Sniping

Kalau bid masuk dalam `ANTI_SNIPE_WINDOW_SEC` (60 detik) terakhir:
- Perpanjang timer lelang sebesar `ANTI_SNIPE_EXTENSION_SEC` (60 detik)
- Ubah status lelang ke `ENDING`
- Broadcast WebSocket event `timer:extended` dengan pesan dari `ANTI_SNIPE_MESSAGE`

Konstanta ada di `SHARED_VARIABLES.md`.

### Phantom Bid (Shadow Pledge)

User bisa pasang batas maksimal bid secara rahasia. Sistem auto-bid atas nama mereka.

```
POST /api/v1/auctions/:id/phantom-bid
Body: { maxAmount: number }
```

Cara kerjanya: setiap kali ada bid baru masuk, cek apakah ada phantom bid aktif yang bisa merespons. Kalau ada dan masih dalam batas maksimalnya, auto-bid dengan increment minimum.

`maxAmount` disimpan terenkripsi — tidak bisa dibaca siapapun termasuk admin.

---

## 3 — Wallet System

### Prinsip Utama

Semua mutasi saldo dicatat sebagai transaksi baru — tidak ada UPDATE atau DELETE.
Ini adalah ledger keuangan, bukan kolom angka biasa.

```
Saldo tersedia = Saldo total - Total hold aktif
```

### Endpoint Wallet

```
GET  /api/v1/wallet/balance            → Saldo + pending hold
GET  /api/v1/wallet/transactions       → Riwayat transaksi (paginated)
POST /api/v1/wallet/top-up             → Inisiasi top up
POST /api/v1/wallet/top-up/callback    → Webhook dari Midtrans (Sandbox)
GET  /api/v1/wallet/cashback           → Riwayat cashback
```

### Idempotency Key

Setiap request transaksi harus punya idempotency key (UUID yang dibuat di frontend).
Dikirim di header: `X-Idempotency-Key: uuid-v4`.

Backend cek dulu apakah key ini sudah pernah diproses:
- Sudah ada → kembalikan hasil yang sama, jangan proses ulang
- Belum ada → proses transaksi baru

Ini mencegah double charge kalau user klik tombol dua kali atau network retry.

### Hold Mechanism

- Bid aktif → buat transaksi `BID_HOLD` (saldo hold bertambah)
- Di-outbid → buat transaksi `BID_RELEASE` (saldo hold berkurang)
- Menang lelang → buat transaksi `BID_DEDUCT` (saldo total berkurang, hold dikurangi)

### Cashback Otomatis

Setelah user menang lelang, hitung cashback berdasarkan rank dari `CASHBACK_RATE` di `SHARED_VARIABLES.md`.
Buat transaksi `CASHBACK` secara otomatis.

---

## 4 — EXP & Rank System

### Cara Kerjanya

EXP dikumpulkan dari berbagai aktivitas. Setiap kali EXP bertambah, sistem cek apakah user layak naik rank.
Proses ini sepenuhnya otomatis.

Semua nilai EXP per aktivitas ada di `EXP_REWARDS` di `SHARED_VARIABLES.md`.
Semua threshold EXP per rank ada di `RANK_EXP_THRESHOLDS`.

### Win Streak Multiplier

Setiap kemenangan berturut-turut dapat multiplier EXP lebih besar:
- 3 kemenangan berturut: x1.5
- 5 kemenangan berturut: x2.0
- 10 kemenangan berturut: x3.0

Multiplier dari `WIN_STREAK_MULTIPLIER` di `SHARED_VARIABLES.md`.

### Rank Up

Saat user naik rank:
1. Update kolom `rank` di tabel `users`
2. Simpan riwayat ke tabel `rank_history`
3. Assign cosmetic rank baru ke user (otomatis)
4. Kirim WebSocket event `rank:changed` ke client user — Syaikah listen ini untuk update CSS variable
5. Kirim notifikasi `RANK_UP`
6. Kalau rank baru = EMPEROR → kirim notifikasi global `EMPEROR_ASCENSION` ke semua user

**Syarat khusus Sovereign:**
- Minimal 300 kemenangan lelang
- Akun aktif minimal 1 tahun
- Tidak pernah di-suspend

**Syarat khusus Emperor:**
- Minimal 500 kemenangan lelang
- Pernah menang minimal 1 live auction
- Akun aktif minimal 2 tahun
- Sudah di rank Sovereign minimal 6 bulan

Akselerasi rank (beli di shop) tidak berlaku untuk Duke → Sovereign dan Sovereign → Emperor.

---

## 5 — Achievement Engine

### Cara Kerjanya

Achievement engine berjalan event-driven. Setiap kali ada aksi penting di sistem, engine cek apakah ada achievement yang terpenuhi.

Buat `AchievementService` yang dipanggil dari service lain:

```ts
// Dipanggil dari AuctionService setelah lelang selesai
await achievementService.check(userId, "AUCTION_WON", { auctionId });

// Dipanggil dari BidService setelah bid ditempatkan
await achievementService.check(userId, "BID_PLACED", { amount });

// Dipanggil dari RankService setelah rank naik
await achievementService.check(userId, "RANK_UP", { newRank });
```

### Saat Achievement Unlock

1. Insert ke tabel `user_achievements`
2. Award EXP sesuai tier achievement (dari `EXP_REWARDS`)
3. Assign gelar (title) ke user kalau achievement ada reward gelar
4. Assign cosmetic ke user kalau achievement ada reward cosmetic
5. Kirim notifikasi `NEW_ACHIEVEMENT`
6. Broadcast WebSocket ke client user — untuk animasi unlock real-time

---

## 6 — Event & Quest System

### Event Seasonal

Event mengubah perilaku platform selama berlangsung:
- EXP multiplier aktif
- Achievement khusus tersedia
- Background visual berubah (Syaikah yang terapkan, kamu yang trigger via WebSocket)

Saat event aktif, `awardExp` harus ambil multiplier dari event aktif dulu.

Saat event dimulai, broadcast ke semua client:
```ts
socketServer.emit("event:started", {
  eventId,
  backgroundMode, // Syaikah pakai ini untuk ganti background
  accentColors,
});
```

### Daily Quest

Quest harian yang reset setiap tengah malam via BullMQ job.

```
GET  /api/v1/quests/daily        → Quest hari ini + progress user
POST /api/v1/quests/daily/claim  → Klaim reward quest yang selesai
```

### Leaderboard Cache

Buat BullMQ job yang berjalan setiap 5 menit untuk hitung ulang semua kategori leaderboard dan simpan ke Redis.
Visel yang mengonsumsi cache ini — bukan query langsung ke database.

```ts
// Setiap 5 menit
async refreshAllLeaderboards() {
  for (const category of LEADERBOARD_CATEGORIES) {
    for (const period of ["weekly", "monthly", "all-time"]) {
      const data = await this.calculateLeaderboard(category, period);
      await redis.set(
        `leaderboard:${category}:${period}`,
        JSON.stringify(data),
        "EX", 360 // Expire 6 menit
      );
    }
  }
}
```

---

## WebSocket Events yang Kamu Emit

Syaikah dan Visel listen event-event ini. Pastikan nama dan strukturnya sesuai `WS_EVENTS` di `SHARED_VARIABLES.md`.

| Event | Kapan Di-emit | Data yang Dikirim |
|---|---|---|
| `bid:new` | Setelah bid berhasil | `{ userId, amount, username, rank, timestamp }` |
| `timer:update` | Setiap detik saat lelang aktif | `{ timeLeft, status }` |
| `timer:extended` | Setelah anti-snipe aktif | `{ newEndTime, message }` |
| `auction:ended` | Saat lelang berakhir | `{ winnerId, finalAmount }` |
| `rank:changed` | Saat user naik rank | `{ newRank, cssVars }` |
| `event:started` | Saat event aktif | `{ eventId, backgroundMode, accentColors }` |

---

## Koneksi dengan Tim

| Orang | Hubungan |
|---|---|
| **Michael** | Schema database dari Michael. Redis bid lock koordinasi dengan Michael. |
| **Syaikah** | Kamu emit WebSocket events, Syaikah listen untuk update UI. |
| **Peter** | `NotificationService` Peter kamu panggil untuk semua notifikasi. Wallet service kamu dipanggil Peter saat shop purchase. |
| **Visel** | Leaderboard cache yang kamu siapkan dikonsumsi Visel. |

---

## Checklist Fatih

- [ ] Standard auction berjalan penuh: buat → aktif → bidding → selesai → pemenang
- [ ] Redis distributed lock mencegah race condition saat bid bersamaan
- [ ] Anti-snipe: bid dalam 60 detik terakhir perpanjang timer 60 detik
- [ ] Phantom bid: auto-bid hingga batas maksimal
- [ ] Wallet hold/release/deduct benar untuk semua skenario
- [ ] Idempotency key mencegah double transaction
- [ ] Cashback otomatis saat menang sesuai rate rank
- [ ] EXP diberikan untuk semua aktivitas di `EXP_REWARDS`
- [ ] Win streak multiplier aktif
- [ ] Rank naik otomatis saat EXP cukup
- [ ] Syarat khusus Sovereign dan Emperor dicek sebelum promosi
- [ ] Achievement unlock ter-trigger dari semua event yang relevan
- [ ] Leaderboard cache refresh setiap 5 menit
- [ ] Daily quest reset setiap tengah malam
- [ ] Event multiplier EXP aktif saat event berlangsung
- [ ] Semua WebSocket event nama dan strukturnya sesuai `SHARED_VARIABLES.md`
