# Plan: Bid System & Anti-Snipe

## Tujuan
Mengimplementasikan sistem penawaran lelang (Bidding) yang aman dari *race condition*, dilengkapi fitur *anti-sniping* untuk perpanjangan waktu otomatis di detik terakhir lelang, dan penawaran otomatis rahasia (*Phantom Bid*).

---

## Step-by-Step

### Step 1 — Validasi & Proteksi Bid
- [x] Validasi status KYC user (harus `APPROVED`).
- [x] Validasi status lelang (harus `ACTIVE` atau `ENDING`).
- [x] Validasi rank user melampaui `minimumRank` lelang.
- [x] Validasi nominal bid harus lebih tinggi dari `currentPrice`.

### Step 2 — Transaksi Hold Saldo & Simpan Bid
- [x] Mengambil distributed lock (Redis `SETNX`) per `auctionId` untuk mencegah tabrakan bid ganda.
- [x] Lepas hold saldo penawaran user sebelumnya di lelang ini (jika ada).
- [x] Lakukan hold saldo untuk nominal bid baru.
- [x] Simpan data penawaran baru ke database dengan status `ACTIVE` dan set bid lama ke `OUTBID`.
- [x] Perbarui kolom `currentPrice` dan `highestBidderId` pada tabel lelang.

### Step 3 — Logika Anti-Sniping
- [x] Cek sisa durasi lelang. Jika penawaran masuk saat durasi lelang $\le 60$ detik:
  - [x] Perpanjang waktu selesai lelang (`endTime`) sebesar 60 detik.
  - [x] Ubah status lelang ke `ENDING`.
  - [x] Broadcast event WebSocket `timer:extended` ke client.

### Step 4 — Phantom Bid (Shadow Pledge)
- [x] Buat endpoint `POST /api/v1/auctions/:id/phantom-bid`.
- [x] Kunci saldo user sejumlah `maxAmount` batas atas auto-bid.
- [x] Enkripsi `maxAmount` menggunakan AES-256-CBC saat disimpan di database demi kerahasiaan (tidak dapat dibaca siapapun termasuk admin).
- [x] Buat kueri duel otomatis secara matematis (`runPhantomBidDuelInternal`) dengan dekripsi in-memory dan in-memory sorting agar penantang otomatis menaikkan harga lelang sebesar minimal increment (+100 CC) saat ter-outbid.
- [x] Bebaskan saldo hold dan nyatakan status phantom bid sebagai `EXHAUSTED` bagi yang kalah.

---

## Dependensi
* **Michael (DB & Lock)**: Memerlukan tabel `Bid` pada Prisma schema dan server Redis (Upstash) yang menyala untuk distributed lock.
* **Peter (Auth & KYC)**: Memerlukan database `kycStatus = "APPROVED"` agar penawaran user diijinkan.
* **Syaikah (UI)**: Memerlukan handler socket.io client untuk mendengar pembaruan harga lelang dan timer.

---

## Estimasi
* **Durasi**: 2 Sesi (1 Sesi Bidding core + Anti-Snipe, 1 Sesi Phantom Bid auto-duel logic).

---

## 🤝 Catatan Koordinasi Tim (Notes for Team)
* **Peter**: Hubungkan `NotificationService` saat Fatih memicu fungsi outbid (`triggerOutbidNotification`) untuk mengirimkan notifikasi.
