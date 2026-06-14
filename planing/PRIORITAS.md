# PRIORITAS PENGERJAAN — Emerald Kingdom

File ini menentukan urutan pengerjaan dari yang paling penting ke paling rendah.
Jika limit habis, task yang tersisa cukup sederhana untuk model yang lebih rendah.

---

## PRIORITAS TINGGI (Harus dikerjakan duluan)

| No | Kategori | Folder | Alasan Prioritas |
|----|----------|--------|------------------|
| 1 | Perbaikan Bug & Data | `01_perbaikan_bug` | Fondasi — semua fitur bergantung pada data yang benar |
| 2 | Sinkronisasi Data & Database | `02_data_database` | Data harus real dari database, bukan hardcode |
| 3 | Sistem Pembayaran | `03_pembayaran` | Core business — user harus bisa top up |
| 4 | Navigasi & UX | `04_navigasi_ux` | User bingung navigasi = user pergi |
| 5 | Tampilan Lelang & Grid Item | `05_lelang` | UI utama yang dilihat user pertama kali |

## PRIORITAS MENENGAH (Dikerjakan setelah fondasi selesai)

| No | Kategori | Folder | Alasan Prioritas |
|----|----------|--------|------------------|
| 6 | Live Auction | `06_live_auction` | Fitur unggulan platform tapi butuh fondasi yang benar dulu |
| 7 | Admin Panel Lengkap | `07_admin` | Admin harus bisa kontrol semua, tapi user-facing duluan |
| 8 | Profil User | `08_profil_user` | Social feature penting tapi bukan blocker |
| 9 | Gamifikasi & XP | `09_gamifikasi` | Enhancement untuk engagement |

## PRIORITAS RENDAH (Paling kompleks, dikerjakan terakhir)

| No | Kategori | Folder | Alasan Prioritas |
|----|----------|--------|------------------|
| 10 | Web Customization System | `10_web_customization` | Fitur paling kompleks, butuh arsitektur baru |
| 11 | Customization Lain | `11_customization_lain` | Bergantung pada sistem customization web |
| 12 | Seed Data & Konten | `12_seed_data` | Konten demo, bisa dikerjakan kapan saja |

---

## CATATAN UNTUK JUNIOR DEV / MODEL RENDAH

Jika kamu melanjutkan pekerjaan ini, fokus pada:
1. Baca file planning di folder yang sesuai
2. Kerjakan per file planning, jangan loncat-loncat
3. Tiap planning sudah ada checklist — centang yang sudah selesai
4. Jika ada yang bingung, baca `Panduan/implementasi final.txt`
5. Jangan ubah struktur database tanpa izin
6. Semua data harus dari database, BUKAN hardcode
