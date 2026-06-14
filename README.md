# Emerald Kingdom - Platform Lelang Eksklusif

Emerald Kingdom adalah sebuah platform pelelangan barang mewah dan langka yang dilengkapi dengan fitur gamifikasi yang mendalam, sistem ekonomi virtual, dan personalisasi visual layaknya sebuah *game*.

## Fitur Utama

- **Sistem Lelang Real-Time**: Mendukung sistem lelang dinamis (Standard, Descending, Sealed Chest, hingga Rank-Exclusive) beserta fitur pelelangan *Live* dengan koneksi WebSockets.
- **Gamifikasi (Rank & EXP)**: Pengguna dapat menaikkan pangkat (*Rank*) dari tingkatan Civis hingga Emperor. Setiap peringkat memberikan keistimewaan tersendiri seperti akses ke lelang eksklusif atau diskon khusus.
- **Ekonomi & Mata Uang Virtual**: Pembayaran lelang menggunakan Crown Coins (CC). Sistem ini terintegrasi penuh dengan sistem *Top-Up*, Transfer Bank, QRIS, Stripe, dan *Virtual Account*.
- **Kosmetik Berbasis Skrip (ZIP Engine)**: Berbeda dengan platform biasa, pengguna dan admin dapat membeli atau memuat efek-efek grafis tingkat tinggi (seperti partikel atau animasi) untuk profil mereka menggunakan injeksi skrip kustom dalam berkas ZIP.
- **Privasi & Keamanan (KYC)**: Mendukung mode *Shadow* dan *Anonymous* untuk menutupi identitas penawar, diimbangi dengan proses *Know Your Customer (KYC)* wajib untuk transaksi tingkat tinggi.
- **Sistem *Achievement* & Notifikasi**: Pemain mendapatkan *Reward*, Gelar (*Title*), dan peringatan *real-time* tentang aktivitas pelelangan mereka (misalnya ketika dikalahkan dalam *bid*).

## Struktur Repositori

Proyek ini dibangun menggunakan arsitektur **Turborepo** (Monorepo) yang terdiri dari beberapa aplikasi dan paket pendukung:

- `apps/web`: Aplikasi Frontend untuk pengguna umum (Next.js).
- `apps/admin`: Aplikasi Dasbor untuk staf dan *Admin* mengelola lelang, KYC, dan modul situs.
- `apps/api`: Aplikasi *Backend* (NestJS / Node.js) yang memfasilitasi Socket.io dan REST API utama.
- `packages/db`: Berisi skema Prisma, koneksi *database* PostgreSQL, dan skrip *seeding*.

## Prasyarat Instalasi

1. **Node.js** (v18 ke atas disarankan)
2. **PostgreSQL** (Koneksi database diperlukan)
3. Akun penyimpanan (jika memakai Storage pihak ketiga untuk upload gambar/ZIP)

## Panduan Menjalankan Secara Lokal

1. **Kloning Repositori & Install Dependencies**
   ```bash
   npm install
   ```

2. **Pengaturan Variabel Lingkungan**
   Salin file contoh env atau atur kredensial Anda di root atau setiap workspace. Pastikan `DATABASE_URL` terhubung ke PostgreSQL lokal atau *Cloud* Anda.

3. **Sinkronisasi Database (Prisma)**
   Gunakan perintah prisma untuk mendorong struktur ke *database* Anda:
   ```bash
   npx prisma db push
   # atau
   npx prisma migrate dev
   ```

4. **Isi Database dengan Data Awal (Seeding)**
   Jalankan *seed script* untuk mendapatkan contoh *item* lelang dan pengguna (*dummy data*).
   ```bash
   npx ts-node packages/db/seed.ts
   ```

5. **Jalankan Aplikasi**
   Karena menggunakan Turborepo, Anda dapat menjalankan seluruh aplikasi secara paralel:
   ```bash
   npm run dev
   ```

Aplikasi *Web* biasanya berjalan di `http://localhost:3000`, aplikasi *Admin* di `http://localhost:3002`, dan *API* (Backend) di `http://localhost:3001`.

## Akun Login Bawaan (Hasil Seeding)

Jika Anda telah menjalankan skrip *seed*, Anda dapat masuk (login) menggunakan kredensial bawaan berikut:

- **TheEmperor (Super Admin)**: `admin@emeraldkingdom.id` (Password: `admin123!`)
- **AuctionMaster**: `auction@emeraldkingdom.id` (Password: `admin123!`)
- **DragonSlayer42**: `dragon@demo.id` (Password: `user123!`)
- **The Silent Knight**: `silent@demo.id` (Password: `user123!`)
- **CrystalMage**: `mage@demo.id` (Password: `user123!`)
- **ShadowBidder**: `shadow@demo.id` (Password: `user123!`)
- **GoldenQueen**: `queen@demo.id` (Password: `user123!`)
- **NoobTrader**: `noob@demo.id` (Password: `user123!`)
- **SuspendedRonin**: `ronin@demo.id` (Password: `user123!`)
- **DukeOfWealth**: `duke@demo.id` (Password: `user123!`)
- **MysteryWhale**: `whale@demo.id` (Password: `user123!`)
- **SirGalahad**: `galahad@demo.id` (Password: `user123!`)

> *Catatan: Terdapat juga 15 akun pengembara (*wanderer*) tambahan dengan email `user1@demo.id` hingga `user15@demo.id` dan password `user123!`.*
