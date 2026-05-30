# Plan: Achievement Engine

## Tujuan
Membangun sistem pencapaian (*Achievement Engine*) bertipe *event-driven* yang memantau seluruh aktivitas penting user di platform (bidding, menang lelang, top-up saldo, naik pangkat) untuk membuka lencana, membagikan hadiah EXP, kosmetik profil, dan gelar kerajaan secara real-time.

---

## Step-by-Step

### Step 1 — Pendaftaran & Konfigurasi Achievement
- [x] Deklarasikan konfigurasi target pencapaian:
  - `FIRST_BID` (Common): Bid pertama.
  - `FIRST_WIN` (Common): Kemenangan pertama. Hadiah gelar "The Victor".
  - `GOLDEN_TREASURE` (Rare): Saldo wallet $\ge 100,000$ CC. Hadiah gelar "The Goldhoarder".
  - `HIGH_BIDDER` (Epic): Nominal bid $\ge 50,000$ CC. Hadiah gelar "The Bold Bidder" + Kosmetik Aura.
  - `PEER_OF_REALM` (Epic): Naik rank Duke ke atas. Hadiah Kosmetik tema profil Duke.

### Step 2 — Event-Driven Checker (`check`)
- [x] Sediakan method `check(userId, eventType, context)` yang dipanggil dari service modul lain.
- [x] Ambil list achievement user yang sudah terbuka dari database agar kueri tidak mengulang pemrosesan.
- [x] Bandingkan data aktivitas saat ini (contoh: amount top-up, nominal bid, rank baru) dengan target syarat di konfigurasi.

### Step 3 — Unlock Payout & Reward
- [x] Buat record di tabel `UserAchievement`.
- [x] Panggil `RankService.awardExp` untuk membagikan EXP sesuai tingkat kelangkaan (Common: 50, Rare: 200, Epic: 500 EXP).
- [x] Insert data gelar baru di tabel `UserTitle` jika achievement memiliki hadiah gelar.
- [x] Insert data kosmetik baru di tabel `UserCosmetic` jika achievement memiliki hadiah kosmetik.

### Step 4 — Real-time Visual Alert
- [x] Broadcast WebSocket event `achievement:unlocked` langsung ke socket client user terarah.
- [x] Kirim notifikasi log in-app untuk diarsip.

---

## Dependensi
* **Michael (DB Schema)**: Memerlukan tabel `UserAchievement`, `UserTitle`, dan `UserCosmetic` di database.
* **Syaikah (UI)**: Memerlukan popup modal / alert di frontend Next.js saat menerima WebSocket event `achievement:unlocked`.

---

## Estimasi
* **Durasi**: 1 Sesi (Pendaftaran konfigurasi achievement, checking & award EXP, title, cosmetic).

---

## 🤝 Catatan Koordinasi Tim (Notes for Team)
* **Peter**: Sediakan data koleksi kosmetik di inventaris user, agar saat Fatih memanggil `tx.userCosmetic.create`, item kosmetiknya langsung dapat terpasang di profil buatan Peter.
