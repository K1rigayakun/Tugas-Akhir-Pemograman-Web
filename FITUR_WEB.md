# Emerald Kingdom — Panduan Fitur Lengkap

Emerald Kingdom adalah platform lelang eksklusif berskala tinggi yang memadukan pengalaman e-commerce barang mewah dengan elemen gamifikasi (RPG) interaktif. Berikut adalah dokumentasi lengkap dari semua fitur yang tersedia di platform ini.

---

## 1. Sistem Akun & Gamifikasi (User Progression)
Sistem ini dirancang agar pengguna merasa seperti naik kelas di sebuah kerajaan seiring dengan partisipasi mereka dalam lelang.

*   **Sistem Pangkat (Rank System):** Terdapat 10 tingkatan pangkat mulai dari *Civis* (terendah) hingga *Emperor* (tertinggi). Pangkat menentukan akses pengguna ke lelang eksklusif dan hak istimewa lainnya.
*   **Experience Points (EXP):** Pengguna mendapatkan EXP dari berbagai aktivitas (memenangkan lelang, login harian, menyelesaikan quest). EXP digunakan untuk naik pangkat.
*   **Pencapaian (Achievements) & Quest Harian:** Misi harian dan pencapaian seumur hidup yang memberikan hadiah berupa EXP atau kosmetik.
*   **Sistem Kosmetik (Cosmetics):** Pengguna dapat mengubah tampilan profil mereka melalui:
    *   *Coat Frame* (Bingkai Avatar)
    *   *Profile Banner* (Latar Belakang Profil)
    *   *Name Effect* (Efek warna dan animasi pada nama)
    *   *Wallet Skin* (Tema visual untuk dompet digital)
*   **Profil Pribadi & Mode Privasi:** Pengguna dapat mengatur privasi profil mereka (Publik, Anonim, atau Shadow).

## 2. Sistem Lelang (Auction System)
Sistem pelelangan mendukung berbagai format yang interaktif dan dinamis, berjalan secara real-time.

*   **Standard Auction:** Lelang biasa dengan batas waktu yang ditentukan. Penawar tertinggi pada akhir waktu akan menang.
*   **Live Auction:** Lelang interaktif secara *real-time* yang dilengkapi dengan fitur *live streaming* (video/audio host) dan *live chat*.
*   **Sealed Chest Auction:** Lelang tertutup di mana tawaran pengguna lain tidak terlihat sampai waktu lelang berakhir (Blind Bidding).
*   **Descending Auction (Dutch Auction):** Harga barang akan terus turun setiap interval waktu tertentu sampai ada pengguna yang menekan tombol "Beli Sekarang".
*   **Rank-Exclusive Auction:** Lelang khusus yang hanya bisa diikuti oleh pengguna dengan pangkat tertentu (misal: Minimal *Marquis*).
*   **Phantom Bids (Auto-Bid):** Pengguna dapat memasang batas maksimal tawaran, dan sistem akan secara otomatis melakukan penawaran bertahap setiap kali ada yang mengalahkan harga mereka.

## 3. Sistem Keuangan & Dompet (Wallet & Payment)
Semua transaksi di dalam platform menggunakan mata uang virtual internal.

*   **Crown Coins (CC):** Mata uang utama platform (1 CC = Rp 1.000). Semua lelang menggunakan CC.
*   **Top-Up & Integrasi Pembayaran:** Top-up saldo CC didukung dengan banyak metode:
    *   QRIS
    *   Virtual Account (BCA, Mandiri, BNI, BRI)
    *   E-Wallet (GoPay, OVO, Dana)
    *   Transfer Bank Manual (BCA)
*   **Sistem Hold (Saldo Tertahan):** Saat pengguna memasang *bid*, saldo mereka akan di-*hold* sementara agar tidak bisa digunakan ganda. Jika mereka kalah/di-*outbid*, saldo langsung dikembalikan (*Release*). Jika menang, saldo dipotong (*Deduct*).
*   **Riwayat Transaksi:** Catatan lengkap uang masuk, uang keluar, *hold*, *release*, dan pembelian kosmetik.

## 4. Fitur Eksplorasi & Interaksi
*   **Museum (Hall of Fame):** Ruang pameran digital untuk item-item legendaris dan lelang paling bersejarah yang pernah terjadi di platform. Menampilkan harga akhir, pemenang, dan cerita sejarah item tersebut.
*   **Leaderboard (Papan Peringkat):** Menampilkan pengguna paling aktif dan sukses berdasarkan Total Kemenangan (Wins) dan Total EXP.
*   **Vault Submissions:** Pengguna biasa dapat mengajukan barang koleksi pribadi mereka ke admin untuk dilelangkan di platform Emerald Kingdom.
*   **Notification System:** Notifikasi *real-time* (menggunakan Socket/SSE) jika pengguna di-*outbid*, lelang yang diikuti akan segera berakhir, atau jika ada pembayaran yang berhasil.

## 5. Admin Panel (The Praetorian Console)
Dashboard komprehensif (terpisah dari aplikasi utama) bagi staf dan admin untuk mengelola seluruh ekosistem.

*   **Dashboard Analytics:** Statistik total pengguna, total pelelangan, perputaran uang (CC), dan grafik tren lelang.
*   **Manajemen Pengguna & KYC:** Melihat daftar pengguna, mengatur *suspend/banned*, dan melakukan verifikasi identitas (KYC) bagi pengguna yang ingin fitur *unlimited bidding*.
*   **Manajemen Lelang:** CRUD (Buat, Baca, Update, Hapus) semua lelang, mengatur waktu, minimum bid, dan kategori.
*   **Tema Live / Kosmetik Situs:** Admin dapat mengganti tema website utama secara langsung dari dashboard (misal: mengganti tema menjadi perayaan Natal atau Imlek).
*   **Top-Up Approval:** Verifikasi manual untuk metode pembayaran Transfer Bank (menyetujui atau menolak bukti transfer).
*   **Audit Logs:** Catatan aktivitas keamanan yang merekam setiap tindakan yang dilakukan oleh staff admin (untuk mencegah penyalahgunaan wewenang).
*   **Museum Curation:** Memilih lelang-lelang yang sudah selesai untuk diabadikan di halaman Museum.

---
*Dokumen ini dibuat secara otomatis untuk memberikan pemahaman holistik tentang ekosistem perangkat lunak Emerald Kingdom.*
