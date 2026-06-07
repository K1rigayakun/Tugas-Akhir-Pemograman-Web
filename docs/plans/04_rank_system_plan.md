# Plan: EXP & Rank System

## Tujuan
Membangun mesin pembagian reputasi (EXP) otomatis untuk berbagai aktivitas user, sistem pengali kemenangan berturut-turut (*win-streak multiplier*), kenaikan pangkat otomatis 10 level, dan pembatasan kriteria khusus bagi tingkat kepangkatan elit (*Sovereign* dan *Emperor*).

---

## Step-by-Step

### Step 1 — Pembagian EXP & Aturan Win Streak
- [x] Definisikan konstanta hadiah EXP (`EXP_REWARDS`) dari bid, login harian, memenangkan lelang, dsb.
- [x] Hitung win-streak kemenangan user (WON bids) untuk memberikan multiplier:
  - Streak $\ge 3$: x1.5 EXP
  - Streak $\ge 5$: x2.0 EXP
  - Streak $\ge 10$: x3.0 EXP

### Step 2 — Level Up & Penentuan Rank Otomatis
- [x] Bandingkan total EXP user dengan ambang batas rank (`RANK_EXP_THRESHOLDS`) di DB.
- [x] Naikkan tingkat rank user otomatis jika EXP mencukupi.
- [x] Simpan riwayat naik tingkat ke tabel `RankHistory` untuk analisis audit.

### Step 3 — Verifikasi Syarat Pangkat Elit
- [x] **Sovereign**: Sebelum naik tingkat, validasi apakah akun user telah aktif minimal 365 hari dan memenangkan minimal 300 lelang.
- [x] **Emperor**: Validasi apakah akun telah aktif minimal 730 hari, memenangkan minimal 500 lelang, memenangkan minimal 1 *live auction*, dan telah menyandang gelar Sovereign minimal 180 hari.
- [x] Tahan kenaikan pangkat jika kueri validasi tidak lolos.

### Step 4 — Integrasi Visual & Sosial
- [x] Hubungkan WebSocket event `rank:changed` ke client untuk memancarkan skema variabel warna aksen CSS baru (`--color-rank-accent`).
- [x] Emit global broadcast di server jika ada ksatria baru yang dinobatkan sebagai Emperor.
- [x] Berikan kosmetik lencana (badge) rank gratis otomatis ke inventaris user.

---

## Dependensi
* **Michael (DB Schema)**: Memerlukan tabel `RankHistory` dan kolom `exp` serta `rank` pada tabel `User`.
* **Syaikah (UI)**: Memerlukan pemicu penggantian CSS global variable `--color-rank-accent` saat mendengarkan WebSocket event.

---

## Estimasi
* **Durasi**: 1 Sesi (EXP awarding, win-streak, Sovereign & Emperor requirements checks).

---

## 🤝 Catatan Koordinasi Tim (Notes for Team)
* **Peter**: Setelah Fatih memicu kenaikan rank di service-nya, Peter harus menyambungkan pengiriman push notifikasi `RANK_UP` ke layar HP/browser user bersangkutan.
