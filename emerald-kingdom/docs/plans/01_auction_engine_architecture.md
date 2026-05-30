# 🗺️ Panduan Arsitektur & Integrasi Auction Engine

Dokumen ini menjelaskan secara teknis struktur penempatan file, model database yang diperlukan, alur data, dan petunjuk integrasi lengkap untuk menghubungkan modul buatan **Fatih** dengan modul buatan anggota tim lainnya (**Michael**, **Syaikah**, **Peter**, dan **Visel**).

---

## 📁 1. Struktur Folder NestJS (apps/api)

Seluruh logika bisnis Fatih ditempatkan di bawah folder **`apps/api/src/modules/`**:

```text
apps/api/src/
├── app.module.ts                  # Module utama api (import AuctionModule, WalletModule, dll)
├── prisma/
│   └── prisma.service.ts          # Wrapper Prisma Client (dihubungkan ke database Neon)
└── modules/
    ├── auction/
    │   ├── auction.module.ts      # Registrasi controller, service, gateway
    │   ├── auction.controller.ts  # Endpoint HTTP REST lelang
    │   ├── auction.service.ts     # Siklus hidup lelang, cashback, EXP, museum
    │   └── dto/
    │       ├── create-auction.dto.ts
    │       └── update-auction.dto.ts
    ├── bid/
    │   ├── bid.module.ts
    │   ├── bid.service.ts         # Logika bid, Redis Lock (SETNX), & Anti-Snipe
    │   ├── bid.gateway.ts         # WebSocket Gateway (Socket.io) lelang real-time
    │   └── dto/
    │       └── place-bid.dto.ts
    └── wallet/
        ├── wallet.module.ts
        ├── wallet.controller.ts   # Endpoint dompet & Midtrans callback
        └── wallet.service.ts      # Logika hold/release/deduct & ledger append-only
```

---

## 🗄️ 2. Petunjuk Untuk **Michael** (Database Schema & Infrastruktur)

Agar modul Fatih dapat beroperasi, Michael wajib menyediakan model Prisma berikut di `packages/db/prisma/schema.prisma`:

### A. Model `User`
```prisma
model User {
  id                String              @id @default(uuid())
  username          String              @unique
  email             String              @unique
  balance           Int                 @default(0)   // Total Saldo (Crown Coin)
  holdBalance       Int                 @default(0)   // Saldo ter-hold untuk lelang aktif
  rank              String              @default("CIVIS") // CIVIS, MERCHANT, KNIGHT, etc.
  exp               Int                 @default(0)
  kycStatus         String              @default("NONE") // NONE, PENDING, APPROVED, REJECTED
  bids              Bid[]
  walletTransactions WalletTransaction[]
  rankHistories     RankHistory[]
  museumItems       MuseumItem[]
}
```

### B. Model `Auction` & `Item`
```prisma
model Auction {
  id              String   @id @default(uuid())
  title           String
  description     String
  startPrice      Int
  currentPrice    Int
  minimumPrice    Int?     // Khusus lelang Descending (Reverse)
  startTime       DateTime
  endTime         DateTime
  type            String   // STANDARD, SCHEDULED, LIVE, RANK_EXCL, SEALED_CHEST, DESCENDING
  status          String   // DRAFT, UPCOMING, ACTIVE, ENDING, ENDED, CANCELLED
  minimumRank     String   @default("CIVIS")
  isSealed        Boolean  @default(false)
  itemId          String
  item            Item     @relation(fields: [itemId], references: [id])
  winnerId        String?
  highestBidderId String?
  bids            Bid[]
  museumItems     MuseumItem[]
}

model Item {
  id          String       @id @default(uuid())
  name        String
  rarity      String       // COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, TRANSCENDENT
  auctions    Auction[]
  museumItems MuseumItem[]
}
```

### C. Model `Bid` (Catatan Penawaran)
```prisma
model Bid {
  id         String   @id @default(uuid())
  auctionId  String
  auction    Auction  @relation(fields: [auctionId], references: [id])
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  amount     Int
  status     String   // ACTIVE, OUTBID, WON, REFUNDED
  createdAt  DateTime @default(now())
}
```

### D. Model `WalletTransaction` (Ledger Saldo CC)
```prisma
model WalletTransaction {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  amount         Int
  type           String   // TOP_UP, BID_HOLD, BID_RELEASE, BID_DEDUCT, CASHBACK, SHOP_PURCHASE, REFUND
  idempotencyKey String   @unique // Mencegah pemotongan ganda
  referenceId    String?  // ID Lelang terkait
  description    String
  createdAt      DateTime @default(now())
}
```

### E. Model `RankHistory` & `MuseumItem`
```prisma
model RankHistory {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  oldRank   String
  newRank   String
  reason    String
  createdAt DateTime @default(now())
}

model MuseumItem {
  id           String   @id @default(uuid())
  itemId       String
  item         Item     @relation(fields: [itemId], references: [id])
  auctionId    String
  auction      Auction  @relation(fields: [auctionId], references: [id])
  acquiredById String
  user         User     @relation(fields: [acquiredById], references: [id])
  pricePaid    Int
  description  String
  createdAt    DateTime @default(now())
}
```

---

## 💻 3. Petunjuk Untuk **Syaikah** (Frontend UI & Real-Time)

Syaikah bertugas menghubungkan antarmuka Next.js dengan API lelang & WebSocket.

### A. Integrasi REST API (Detail & List)
* **Ambil list lelang:** Hit `GET /api/v1/auctions?status=ACTIVE`
* **Ambil detail lelang & riwayat bid:** Hit `GET /api/v1/auctions/:id`
* **Mengajukan tawaran (Bid):**
  * Endpoint: `POST /api/v1/auctions/:id/bids`
  * Request Header: `X-Idempotency-Key: <UUID>` (Wajib dibuat unik di frontend setiap klik tombol bid untuk mencegah klik ganda).
  * Request Body: `{ "amount": 15000 }`

### B. Integrasi WebSocket (Socket.io)
Hubungkan client ke namespace `/auction` pada backend socket server.

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/auction');

// 1. Masuk ke ruangan lelang spesifik saat membuka halaman detail
socket.emit('join-auction', { auctionId: 'id-lelang-anda' });

// 2. Dengar event bid baru untuk memperbarui daftar harga/penawar di layar
socket.on('bid:new', (data) => {
  console.log('Bid baru masuk!', data);
  // data: { userId, amount, username, rank, timestamp }
  // Perbarui currentPrice lelang dan list penawar teratas di UI
});

// 3. Dengar event perpanjangan waktu (Anti-Snipe)
socket.on('timer:extended', (data) => {
  alert(data.message); 
  // data: { newEndTime, message }
  // Update hitung mundur di UI dengan newEndTime yang baru
});

// 4. Dengar jumlah penonton aktif di lelang tersebut
socket.on('viewer:count', (data) => {
  console.log('Penonton aktif:', data.count); // data: { count }
});

// 5. Tinggalkan ruangan saat berpindah halaman
socket.emit('leave-auction', { auctionId: 'id-lelang-anda' });
```

---

## 🛡️ 4. Petunjuk Untuk **Peter** (Auth, KYC & Shop)

Peter bertugas menghubungkan otorisasi user, KYC, notifikasi, dan transaksi shop dengan modul Fatih.

### A. Verifikasi Status KYC Sebelum Bid
* Logika bid Fatih di `BidService.placeBid` secara ketat memvalidasi status KYC user.
* Peter harus memastikan bahwa setelah melakukan verifikasi manual dari admin panel, status user diubah di DB ke `kycStatus = "APPROVED"` agar user tersebut diizinkan berpartisipasi dalam lelang.

### B. Notifikasi Outbid & Pemenang
* Di dalam `BidService`, Fatih menyediakan fungsi `triggerOutbidNotification(userId, itemTitle, newBidAmount)`.
* Di dalam `AuctionService.endAuction`, Fatih menandai titik pengiriman notifikasi pemenang lelang.
* Peter cukup menyambungkan backend `NotificationService` miliknya ke dalam service Fatih untuk mengirimkan notifikasi push (FCM) dan email (Resend).

### C. Pemotongan Saldo Pembelian Kosmetik Toko
* Ketika user membeli avatar frame atau badge di toko kosmetik Peter, Peter harus memanggil fungsi milik Fatih:
  ```typescript
  await this.walletService.deductBalance(
    userId,
    hargaKosmetik,
    WalletTxType.SHOP_PURCHASE,
    idempotencyKey, // Peter men-generate UUID di backend/frontend
    referenceIdKosmetik,
    false // isBidHoldDeduct = false (karena bukan memotong saldo dari hold lelang)
  );
  ```

---

## 📊 5. Petunjuk Untuk **Visel** (Leaderboard & Museum)

Visel bertugas menyajikan data leaderboard berkinerja tinggi dan data museum.

### A. Konsumsi Cache Leaderboard
* Mengambil data leaderboard langsung ke basis data Neon setiap saat sangat lambat dan membebani server database.
* Fatih membuat background scheduler yang menyimpan cache leaderboard di Redis dengan key format:
  * `leaderboard:<kategori>:<periode>` (Contoh: `leaderboard:prestige:weekly` atau `leaderboard:wealth:all-time`).
* Visel cukup mengimpor Redis service di controllernya dan mengambil nilainya langsung dari Redis:
  ```typescript
  const dataCache = await this.redis.get(`leaderboard:${category}:${period}`);
  return JSON.parse(dataCache);
  ```

### B. Museum Galeri
* Saat lelang berakhir di `AuctionService.endAuction`, jika item lelang berkategori `LEGENDARY` atau `TRANSCENDENT`, Fatih otomatis mencatatnya ke tabel `museumItem`.
* Visel tinggal melakukan fetch ke tabel `museumItem` untuk merender barang-barang bersejarah yang dipajang di halaman `/museum` (The Imperial Museum).
