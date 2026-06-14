# Planning 1: Sistem Gamifikasi & XP

## Tujuan
Memperbaiki dan melengkapi sistem gamifikasi (XP, rank, achievement) agar berfungsi otomatis.

---

## Sistem XP

### Sumber XP
| Aksi | XP Base | Catatan |
|------|---------|---------|
| Menang lelang | 100 | Bonus +50 jika rank-exclusive |
| Pasang bid (pertama kali per auction) | 10 | Maks 1x per auction |
| Login harian | 5 | Streak bonus: +2 per hari berturut |
| Selesaikan daily quest | Quest.expReward | Bervariasi |
| Menang live auction | 150 | Lebih tinggi dari biasa |
| Pertama kali top-up | 50 | One-time bonus |
| Unlock achievement | Achievement.expReward | Bervariasi |

### Event Multiplier
- Saat event aktif, semua XP dikalikan `Event.expMultiplier`
- Contoh: Event natal expMultiplier = 2.0 → semua XP x2

### Rank Up Otomatis
Saat totalExp user mencapai threshold, otomatis naik rank:
```
CIVIS     →  0 XP
MERCHANT  →  500 XP
KNIGHT    →  2,000 XP
BARON     →  5,000 XP
VISCOUNT  →  10,000 XP
EARL      →  25,000 XP
MARQUIS   →  50,000 XP
DUKE      →  100,000 XP
SOVEREIGN →  250,000 XP
EMPEROR   →  500,000 XP (atau satu-satunya)
```

Saat naik rank:
- Catat di `rank_history`
- Kirim notifikasi `RANK_UP`
- Berikan cosmetic rank jika ada

---

## Sistem Achievement

### Trigger Otomatis
Achievement di-trigger otomatis oleh backend saat kondisi terpenuhi:
- `FIRST_BID` — User pasang bid pertama kali
- `FIRST_WIN` — User menang lelang pertama
- `WIN_STREAK_3` — Menang 3x berturut
- `WIN_STREAK_10` — Menang 10x berturut
- `TOTAL_BIDS_100` — Total 100 bid
- `TOTAL_WINS_50` — Total 50 kemenangan
- `RANK_KNIGHT` — Mencapai rank Knight
- `RANK_DUKE` — Mencapai rank Duke
- `RANK_EMPEROR` — Menjadi Emperor

### Animasi Unlock Achievement
Saat user unlock achievement:
- Popup animasi di layar (bisa berupa pedang, mahkota, dll)
- Efek suara (opsional, bisa di-mute)
- Efek 3D jika tier achievement tinggi
- Tombol "Lihat Achievement" dan "Bagikan"

---

## Leaderboard Otomatis

### Tipe Leaderboard
- **Global**: Semua user, berdasarkan totalExp
- **Per Rank**: Knight vs Knight, Duke vs Duke, dll
- **Mingguan**: Reset setiap Senin, berdasarkan XP minggu ini
- **Event**: Hanya selama event, berdasarkan XP event

### Query
Leaderboard harus langsung query database:
```sql
SELECT username, rank, totalExp, totalWins
FROM users
WHERE deletedAt IS NULL AND isSuspended = false
ORDER BY totalExp DESC
LIMIT 100
```

---

## Checklist
- [ ] Implementasi pemberian XP otomatis untuk setiap aksi
- [ ] Implementasi event multiplier XP
- [ ] Implementasi rank up otomatis saat threshold tercapai
- [ ] Buat trigger achievement otomatis
- [ ] Buat animasi popup unlock achievement
- [ ] Fix leaderboard agar query database langsung
- [ ] Buat leaderboard per kategori (global, per rank, mingguan)
- [ ] Test: bid → dapat XP → cek total → rank up jika threshold
