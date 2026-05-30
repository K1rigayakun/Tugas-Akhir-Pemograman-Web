# Plan: Wallet System (Crown Coin / CC)

## Tujuan
Membangun dompet digital internal kerajaan (Crown Coin) berbasis ledger pembukuan transaksi *append-only* (hanya tambah baris baru, tanpa `UPDATE` atau `DELETE` saldo langsung) terintegrasi dengan Midtrans Sandbox Payment Gateway dan penanganan klik ganda (*idempotency*).

---

## Step-by-Step

### Step 1 — Saldo & Pembukuan Ledger
- [x] Sediakan endpoint `GET /api/v1/wallet/balance` untuk menampilkan total, hold, dan available balance.
- [x] Hitung saldo tersedia (Available = Total - Hold).
- [x] Sediakan endpoint `GET /api/v1/wallet/transactions` untuk riwayat paginated.
- [x] Pastikan seluruh mutasi nominal menggunakan Prisma transaction untuk menjamin konsistensi ACID.

### Step 2 — Mekanisme Hold, Release & Deduct
- [x] **`holdBalance`**: Mengunci saldo CC saat user menawar di lelang.
- [x] **`releaseBalance`**: Melepas saldo CC ter-hold saat user kalah bid (outbid) atau lelang dibatalkan.
- [x] **`deductBalance`**: Memotong saldo aslinya (`balance` berkurang, `holdBalance` berkurang) jika memenangkan lelang atau membeli kosmetik di shop.

### Step 3 — Midtrans Sandbox Top-up
- [x] Sediakan endpoint `POST /api/v1/wallet/top-up` untuk inisiasi nominal top-up.
- [x] Sambungkan ke Midtrans Sandbox Snap API untuk men-generate snap token dan redirect payment page.
- [x] Sediakan endpoint webhook callback `POST /api/v1/wallet/top-up/callback` untuk menerima notifikasi pelunasan dari Midtrans.
- [x] Update saldo user dan catat transaksi jenis `TOP_UP` jika status callback `settlement` atau `capture`.

### Step 4 — Pencegahan Klik Ganda (Idempotency)
- [x] Pasang validasi `idempotencyKey` unik pada tabel `WalletTransaction`.
- [x] Jika kueri mendeteksi key yang sama sudah diproses sebelumnya, langsung kembalikan status sukses transaksi lama tanpa memproses mutasi saldo ulang.

---

## Dependensi
* **Michael (DB Schema)**: Memerlukan tabel `WalletTransaction` di Prisma dengan field `idempotencyKey` bersyarat `@unique`.
* **Peter (Shop & Webhooks)**: Memerlukan Midtrans server key credentials pada file `.env` dan router callback agar webhook bisa menembak server lokal.

---

## Estimasi
* **Durasi**: 2 Sesi (1 Sesi saldo + ledger transaction, 1 Sesi Midtrans Snap API + callback handlers).

---

## 🤝 Catatan Koordinasi Tim (Notes for Team)
* **Peter**: Saat membuat fitur pembelian item kosmetik di toko (shop), panggil fungsi Fatih `WalletService.deductBalance()` dengan parameter `type = WalletTxType.SHOP_PURCHASE` dan berikan `idempotencyKey` unik.
* **Syaikah**: Pasang generator UUID unik untuk `idempotencyKey` di header `X-Idempotency-Key` pada frontend.
