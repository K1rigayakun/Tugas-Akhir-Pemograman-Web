# OVERVIEW PLANNING — Emerald Kingdom

Dokumen ini adalah index dari seluruh file planning yang ada.
Baca `PRIORITAS.md` untuk urutan pengerjaan.

---

## Struktur Folder Planning

```
planing/
├── PRIORITAS.md                          ← Urutan pengerjaan
├── OVERVIEW.md                           ← File ini
│
├── 01_perbaikan_bug/
│   └── planning_1_daftar_bug.md          ← Daftar semua bug yang ditemukan
│
├── 02_data_database/
│   └── planning_1_sinkronisasi_data.md   ← Pastikan data dari database bukan hardcode
│
├── 03_pembayaran/
│   └── planning_1_metode_pembayaran.md   ← QRIS, VA, E-Wallet, Testing, dll
│
├── 04_navigasi_ux/
│   └── planning_1_struktur_navigasi.md   ← Reorganisasi menu dan navigasi
│
├── 05_lelang/
│   ├── planning_1_grid_item_lelang.md    ← Layout grid responsif 5x3
│   ├── planning_2_pemisahan_kategori.md  ← Pisahkan live/exclusive/event/biasa
│   └── planning_3_bid_dan_kategori.md    ← Perbaiki UI bid + daftar kategori lengkap
│
├── 06_live_auction/
│   ├── planning_1_tampilan_live.md       ← Redesign tampilan live auction
│   └── planning_2_admin_live_dan_pradaftar.md ← Admin bisa live + pra-daftar
│
├── 07_admin/
│   ├── planning_1_fitur_lengkap.md       ← Daftar semua fitur admin yang harus ada
│   └── planning_2_upload_download_code.md ← Upload/download folder customization
│
├── 08_profil_user/
│   ├── planning_1_tampilan_profil.md     ← Redesign profil + upload foto + anonim
│   └── planning_2_pengaturan_privasi.md  ← Setting tampilan profil & privasi
│
├── 09_gamifikasi/
│   └── planning_1_sistem_xp_achievement.md ← XP, rank up, achievement, leaderboard
│
├── 10_web_customization/
│   ├── planning_1_arsitektur_sistem.md   ← Arsitektur folder-based customization
│   └── tier/
│       ├── planning_tier_1_basic.md      ← 3 customization warna & cahaya
│       ├── planning_tier_2_advanced.md   ← 3 customization animasi & partikel
│       └── planning_tier_3_premium.md    ← 3 customization 3D (Three.js, Spline)
│
├── 11_customization_lain/
│   └── planning_1_arsitektur_umum.md     ← Frame, name effect, wallet skin, dll
│
└── 12_seed_data/
    └── planning_1_seed_item_dan_profil.md ← Item lelang + profil user demo
```

---

## Ringkasan per Kategori

| No | Folder | Jumlah File | Kompleksitas | Estimasi |
|----|--------|-------------|--------------|----------|
| 1 | 01_perbaikan_bug | 1 | Rendah | 2-4 jam |
| 2 | 02_data_database | 1 | Menengah | 4-6 jam |
| 3 | 03_pembayaran | 1 | Tinggi | 6-10 jam |
| 4 | 04_navigasi_ux | 1 | Rendah | 2-3 jam |
| 5 | 05_lelang | 3 | Menengah | 6-10 jam |
| 6 | 06_live_auction | 2 | Tinggi | 8-12 jam |
| 7 | 07_admin | 2 | Tinggi | 8-12 jam |
| 8 | 08_profil_user | 2 | Menengah | 4-6 jam |
| 9 | 09_gamifikasi | 1 | Menengah | 4-8 jam |
| 10 | 10_web_customization | 4 | Sangat Tinggi | 16-24 jam |
| 11 | 11_customization_lain | 1 | Tinggi | 8-12 jam |
| 12 | 12_seed_data | 1 | Rendah | 2-4 jam |

**Total file planning: 20 file**
**Total estimasi: 70-110 jam kerja**

---

## Aturan Pengerjaan

1. Kerjakan sesuai urutan di `PRIORITAS.md`
2. Centang checklist di setiap file planning setelah selesai
3. Semua data harus dari database — JANGAN hardcode
4. Test setiap fitur setelah implementasi
5. Jika ada conflict antar planning, prioritaskan yang di-list lebih atas
6. Baca `Panduan/implementasi final.txt` untuk referensi lengkap fitur
