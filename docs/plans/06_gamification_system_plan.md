# Plan: Event, Quest & Leaderboard Cache

## Tujuan
Meningkatkan retensi dan keaktifan warga kerajaan lewat misi harian (*Daily Quests*), event musiman (*Seasonal Events*) dengan pengali EXP khusus, dan meningkatkan performa platform dengan menyimpan klasemen peringkat (*Leaderboard Cache*) di Redis.

---

## Step-by-Step

### Step 1 — Pengelolaan Event Musiman
- [x] Sediakan tabel `Event` untuk mendokumentasikan masa aktif, multiplier EXP, dan aset visual event.
- [x] Admin endpoint `POST /api/v1/admin/events` untuk memicu dimulainya event.
- [x] Ambil data multiplier event aktif secara dinamis saat user menerima EXP.
- [x] Broadcast event WebSocket `event:started` berisi variabel nama background & warna tema musiman ke Next.js.

### Step 2 — Misi Harian (Daily Quests)
- [x] Definisikan quest harian di server:
  - `DAILY_BID`: Ajukan minimal 3 bids hari ini.
  - `DAILY_WIN`: Menangkan minimal 1 lelang hari ini.
  - `DAILY_TOPUP`: Lakukan minimal 1 kali top-up saldo hari ini.
- [x] Hitung progress user secara riil dengan membandingkan jumlah bid, transaksi top-up, atau kemenangan yang dicatat di database per tanggal hari ini.
- [x] Simpan klaim quest ke tabel `UserQuestClaim` agar quest hanya bisa diklaim satu kali per hari.

### Step 3 — Klasemen Cepat (Leaderboard Cache)
- [x] Sediakan kueri klasemen untuk 3 kategori:
  - **Wealth** (Terkaya - saldo CC tertinggi)
  - **Prestige** (Termahsyur - reputasi EXP tertinggi)
  - **Wins** (Penakluk - kemenangan lelang terbanyak)
- [x] Hitung ulang data kueri di atas setiap 5 menit (menggunakan background scheduler) untuk periode harian/mingguan/all-time, lalu simpan dalam format JSON string di Redis Cache (`leaderboard:category:period`).
- [x] Sediakan endpoint `GET /api/v1/leaderboard` untuk membaca data langsung dari cache Redis (respons cepat < 50ms).

---

## Dependensi
* **Michael (DB & Redis)**: Memerlukan tabel `Event`, `UserQuestClaim` pada Prisma schema, dan server Redis (Upstash) untuk menyimpan data cache.
* **Visel (Leaderboard API)**: Memerlukan API endpoint Fatih `GET /api/v1/leaderboard` untuk menarik data klasemen.

---

## Estimasi
* **Durasi**: 2 Sesi (1 Sesi Quest & Event admin logic, 1 Sesi Leaderboard Redis cached scheduler).

---

## 🤝 Catatan Koordinasi Tim (Notes for Team)
* **Syaikah**: Dengar event WebSocket `event:started` di browser untuk merubah partikel visual latar belakang secara otomatis (contoh: salju emas berjatuhan).
