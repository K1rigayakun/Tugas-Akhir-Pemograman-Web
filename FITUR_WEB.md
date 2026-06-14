# Emerald Kingdom — Dokumentasi Fitur Lengkap

Dokumen ini merupakan panduan komprehensif yang menjelaskan seluruh fitur, mekanisme, arsitektur produk, dan pemetaan halaman dari **Emerald Kingdom**, sebuah platform lelang barang mewah berskala tinggi yang mengintegrasikan pengalaman *e-commerce* premium dengan sistem gamifikasi bergaya kerajaan (RPG).

---

## 1. Konsep Utama Platform
Emerald Kingdom bukan sekadar platform lelang biasa. Platform ini dibangun dengan konsep **"Kerajaan Virtual"**, di mana setiap pengguna (bidders) memulai perjalanan mereka sebagai warga biasa dan dapat naik takhta menjadi seorang *Kaisar (Emperor)* berdasarkan tingkat aktivitas dan kekayaan mereka di dalam platform. Seluruh transaksi di platform ini menggunakan mata uang virtual internal yang disebut **Crown Coins (CC)**, di mana 1 CC setara dengan Rp 1.000.

---

## 2. Sistem Pangkat & Ekosistem Gamifikasi (User Progression)

Untuk mendorong *engagement* dan loyalitas pengguna, platform ini mengadopsi sistem perkembangan karakter (Gamifikasi) yang sangat kental.

### 2.1. Sistem Pangkat (Rank Hierarchy)
Terdapat 10 tingkatan pangkat (*Rank*) yang menunjukkan prestise pengguna:
1.  **Civis** (Warga Biasa) — Pangkat awal saat mendaftar.
2.  **Merchant** (Pedagang)
3.  **Knight** (Ksatria)
4.  **Baron**
5.  **Viscount**
6.  **Earl**
7.  **Marquis**
8.  **Duke**
9.  **Sovereign** (Penguasa)
10. **Emperor** (Kaisar) — Pangkat absolut tertinggi yang memberikan efek visual khusus di seluruh website (Emperor Ascension UI).

**Hak Istimewa Pangkat:** Semakin tinggi pangkat seseorang, semakin banyak fitur eksklusif yang terbuka. Pangkat digunakan sebagai syarat (prasyarat) untuk mengikuti **Rank-Exclusive Auctions** (Lelang Khusus Bangsawan) dan memberikan diskon di *Shop* kosmetik.

### 2.2. Experience Points (EXP)
Pangkat dinaikkan dengan mengumpulkan EXP. Cara mendapatkan EXP:
-   Memenangkan pelelangan (EXP besar).
-   Login berturut-turut (*Win Streak* / *Login Streak*).
-   Menyelesaikan Quest Harian (contoh: Memasang 3 tawaran dalam sehari).
-   Event khusus (Exp Multiplier Event dari Admin).

### 2.3. Sistem Kosmetik Profil (Profile Customization)
Pengguna dapat mempersonalisasi tampilan mereka agar menonjol dari pengguna lain (terutama saat *bidding* atau di *Leaderboard*):
-   **Coat Frame:** Bingkai mewah di sekitar foto profil / avatar.
-   **Profile Banner:** Latar belakang kustom pada halaman profil pengguna.
-   **Name Effect:** Efek animasi (seperti tulisan bersinar, terbakar, atau bergradasi emas) pada username.
-   **Wallet Skin:** Tampilan UI dompet digital pengguna (mengubah kartu CC biasa menjadi kartu emas/platinum).

Kosmetik memiliki tingkat kelangkaan (*Common, Uncommon, Rare, Epic, Legendary, Mythic*) dan bisa didapatkan dari *Shop* (membeli menggunakan CC) atau terbuka otomatis setelah mencapai *Achievement* tertentu.

### 2.4. Mode Privasi
Pengguna kaya (High Net-Worth Individuals) dapat mengatur visibilitas mereka:
-   **Public:** Nama dan profil terlihat oleh semua orang.
-   **Anonymous:** Tampil sebagai "Anonymous Bidder" di riwayat lelang, profil disembunyikan.
-   **Shadow:** Nama sepenuhnya disamarkan oleh sistem (hanya terlihat oleh Admin).

---

## 3. Sistem Pelelangan & Bidding Dinamis

Inti dari aplikasi ini adalah *Engine* Pelelangan yang berjalan secara *real-time* dengan WebSocket, mencegah delay *bidding*.

### 3.1. Mode Pelelangan (Auction Types)
Platform ini mendukung 5 jenis sistem lelang:
1.  **Standard Auction:** Lelang konvensional dengan *countdown timer*. Penawar tertinggi saat waktu habis adalah pemenangnya. Jika ada tawaran di detik-detik terakhir (Sniper), waktu akan otomatis diperpanjang (Anti-Sniper 60 detik).
2.  **Live Auction:** Lelang *real-time* yang disiarkan langsung melalui video streaming (Terintegrasi dengan Agora SDK). Terdapat Host (Lelang) dan *Live Chat* interaktif untuk pengalaman seperti rumah lelang fisik sungguhan.
3.  **Sealed Chest (Blind Auction):** Pelelangan tertutup. Tawaran yang dimasukkan pengguna **tidak terlihat** oleh peserta lain. Pemenang dan tawaran tertinggi baru diumumkan saat lelang ditutup.
4.  **Descending (Dutch Auction):** Harga barang sangat mahal di awal, dan akan **terus turun** perlahan setiap X menit/detik. Orang pertama yang menekan "Beli Sekarang" akan langsung memenangkan barang di harga saat itu.
5.  **Rank-Exclusive:** Barang super langka/mahal (seperti Properti atau Supercar) yang tombol *Bid*-nya terkunci dan hanya bisa ditekan oleh pengguna dengan pangkat minimal *Marquis* atau ke atas.

### 3.2. Fitur Bidding
-   **Minimum Increment:** Setiap lelang memiliki kelipatan tawaran (misal: Tawaran selanjutnya harus lebih tinggi minimal 500 CC).
-   **Phantom Bids (Proxy Auto-Bid):** Pengguna dapat memasukkan angka maksimal yang bersedia mereka bayar. Jika ada orang lain yang menawar, sistem akan secara otomatis menaikkan tawaran pengguna (*auto-bid*) tepat di atas tawaran lawan, hingga mencapai batas maksimal *Phantom Bid*.

---

## 4. Keuangan, Wallet & Sistem Hold (Pembayaran)

Sistem keuangan dibangun dengan standar keamanan *e-commerce* tingkat tinggi.

### 4.1. Dompet Crown Coins (CC)
Semua pengguna memiliki *Wallet Account* di platform. Semua lelang dihitung dalam satuan CC (Crown Coin).
-   `balance` : Uang tunai yang bisa dicairkan atau digunakan.
-   `pendingHold` : Saldo yang saat ini sedang tertahan karena pengguna memasang *Bid*.

### 4.2. Mekanisme Hold (Dana Tertahan)
Saat pengguna menawar barang senilai 10.000 CC, uang tersebut **tidak langsung dipotong**, melainkan di-*Hold*.
-   Jika ada pengguna lain yang menawar 11.000 CC, saldo 10.000 CC pengguna pertama akan **di-Release (dikembalikan otomatis)** ke saldo aktif secara *real-time*.
-   Jika pengguna menang lelang, saldo hold akan berstatus **Deducted (Dipotong permanen)**.
Sistem ini mencegah pengguna memasang tawaran palsu jika uang di dompet tidak mencukupi, sekaligus memastikan tidak ada *double-spending*.

### 4.3. Metode Top-Up (Deposit)
Pengguna dapat mengisi CC melalui:
-   **QRIS & Virtual Account** (BCA, Mandiri, BNI, BRI) - *Otomatis.*
-   **E-Wallet** (GoPay, OVO, Dana, ShopeePay) - *Otomatis.*
-   **Kartu Kredit (Stripe)** - *Internasional.*
-   **Manual Bank Transfer** - Memerlukan unggah bukti transfer yang nantinya disetujui manual oleh Admin.

---

## 5. Fitur Eksplorasi Sosial

### 5.1. Museum (Hall of Fame)
Barang-barang antik, artefak legendaris, atau lelang yang terjual dengan harga sangat fantastis akan diabadikan di halaman **Museum**. Halaman ini berfungsi sebagai galeri arsip publik. Pengguna dapat melihat sejarah barang, dokumentasi, pemenang, dan harga fantastis penutupan barang tersebut.

### 5.2. Papan Peringkat (Leaderboard)
Halaman persaingan antar bangsawan. Menampilkan:
-   **Top Spender / Collector:** Pengguna dengan total lelang dimenangkan terbanyak.
-   **Top EXP:** Pengguna dengan EXP tertinggi di Kingdom.

### 5.3. Vault Submissions (Penitipan Barang)
Pengguna yang memiliki barang antik/mewah di dunia nyata dapat mengisi formulir *Vault Submission* di platform. Tim Kurator (Admin) akan menilai barang tersebut. Jika lolos uji keaslian, Emerald Kingdom akan menjadi perantara (*broker*) untuk melelang barang tersebut di aplikasi.

---

## 6. Admin Panel (The Praetorian Console)

Aplikasi terpisah (`apps/admin`) yang dikunci dengan enkripsi Role-Based Access Control (RBAC). Hanya *Super Admin* dan *Manager* yang dapat login.

### 6.1. Manajemen Lelang & Pengguna
-   **Pembuatan Lelang (CRUD):** Admin dapat membuat, mengubah harga, mengunggah foto/video, menjadwalkan pelelangan, hingga menghentikan paksa lelang (Force Close).
-   **Moderasi Pengguna:** Admin dapat mengawasi riwayat tawaran (Bids) dari pengguna, melihat IP Address, men-*suspend* akun, atau melarang (*Banned*) pengguna dari mengikuti lelang.

### 6.2. Verifikasi KYC (Know Your Customer)
Untuk mencegah pencucian uang (Anti-Money Laundering) dan akun bodong, pengguna yang ingin melakukan lelang berskala tinggi harus melakukan KYC (mengunggah KTP dan Foto Selfie). Admin akan mereview dokumen ini secara manual dari konsol (Approve/Reject).

### 6.3. Manajemen Top-Up Manual
Jika pengguna memilih "Transfer Bank Manual", Admin harus memvalidasi uang masuk di mutasi bank aslinya dan mencocokkannya dengan foto struk yang diunggah pengguna. Admin lalu menekan tombol "Approve", dan saldo CC pengguna akan bertambah.

### 6.4. Theme Customizer (Pengubah Tema Live)
Sistem canggih di mana Admin dapat mengubah tampilan warna situs (Web Utama) secara langsung (*Live Override*). Misalnya, saat acara Imlek, admin cukup mengubah *Base Theme* menjadi `crimson-dragon`, maka seluruh aplikasi pelanggan (Next.js SSR) akan langsung berubah tema tanpa perlu mengubah kode sumber atau *re-deploy* server.

### 6.5. Audit Logs
Setiap tindakan Admin (seperti siapa yang menekan tombol Approve Top Up, siapa yang menghapus Lelang) dicatat permanen di dalam **Audit Logs**. Hal ini memastikan transparansi internal dan keamanan tingkat militer terhadap data platform.

---

## 7. Daftar Halaman & Routing (Pages Mapping)

Sistem ini terbagi menjadi dua *frontend* utama: **Web/Client App** untuk pengguna, dan **Admin Console** untuk staff internal. Berikut adalah peta navigasi aplikasi:

### 7.1. Aplikasi Pengguna (Emerald Kingdom Web)
*   **`/`** (Home/Landing Page) — Halaman utama dengan *Hero banner*, lelang yang segera berakhir (*Ending Soon*), dan rangkuman leaderboard.
*   **`/login`** — Halaman otentikasi masuk pengguna.
*   **`/register`** — Halaman pendaftaran warga baru.
*   **`/auctions`** — Halaman utama untuk melihat semua daftar lelang (Standard, Sealed, Descending). Memiliki sistem *filter* (Kategori, Status, Harga).
*   **`/auctions/[id]`** — Ruang Detail/Bidding Lelang. Pengguna menawar barang dari halaman ini.
*   **`/live`** — Daftar lelang yang sedang *Live Streaming* (atau yang akan segera *Live*).
*   **`/live/[id]`** — *Live Room*. Ruangan lelang berformat video interaktif secara langsung.
*   **`/categories`** — Penjelajahan barang berdasarkan kategori lelang.
*   **`/categories/[slug]`** — Katalog barang spesifik untuk satu kategori tertentu (misalnya: *Watches*, *Art*, *Vehicles*).
*   **`/leaderboard`** — Papan peringkat global pengguna (berdasarkan *Wins* atau *EXP*).
*   **`/museum`** — Halaman eksibisi barang-barang legendaris yang lelangnya sudah lama selesai.
*   **`/wallet`** — Riwayat transaksi internal, mutasi dompet CC, laporan *Hold* & *Release*.
*   **`/topup`** — Halaman gateway pembayaran untuk membeli *Crown Coins* (QRIS, VA, Transfer, dll).
*   **`/profile`** — Pusat pengaturan akun, kustomisasi kosmetik (bingkai, banner), dan status pangkat (Rank Progress).
*   **`/vault`** — Halaman pengajuan/konsinyasi barang jika pengguna ingin melelang koleksi pribadi mereka ke dalam platform.

### 7.2. Aplikasi Staf (The Praetorian Console - Admin)
*   **`/login`** — Portal otentikasi khusus dengan akses RBAC (Super Admin/Manager).
*   **`/`** (Dashboard) — Analitik platform (Total User, Pendapatan CC, Rasio Keberhasilan Lelang, dll).
*   **`/users`** — Daftar dan moderasi semua pengguna terdaftar.
*   **`/kyc`** — Antrean persetujuan verifikasi data diri (KTP/Selfie) dari pengguna.
*   **`/auctions`** — Kontrol penuh terhadap pembuatan, pengeditan, atau penghentian sesi pelelangan.
*   **`/payments`** — Daftar transaksi *Top-Up* yang membutuhkan persetujuan manual (terutama transfer bank manual).
*   **`/settings`** — Kustomisasi global aplikasi (termasuk *Live Theme Customizer*).
*   **`/audit`** — Sistem log untuk melacak setiap aksi krusial yang dilakukan oleh para Admin.

---
*Dokumentasi ini mencakup 100% dari arsitektur fitur dan struktur halaman Emerald Kingdom (Fase Produksi).*
