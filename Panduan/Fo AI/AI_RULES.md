# 📋 Emerald Kingdom — AI Rules

Aturan kerja untuk AI agent yang membantu development project ini.
Ikuti urutan ini setiap kali mulai bekerja.

---

## Workflow Wajib — Setiap Kali Mulai Kerja

### Langkah 1 — Ambil Kode Terbaru dari GitHub

Sebelum mengerjakan apapun, selalu ambil versi terbaru:

```bash
git pull origin main
```

Jangan pernah langsung mulai coding tanpa pull dulu.
Bisa terjadi konflik atau kamu kerja berdasarkan kode yang sudah usang.

### Langkah 2 — Baca File Konteks

Baca file-file ini sesuai urutan:
1. `AI_CONTEXT.md` — gambaran project
2. `AI_RULES.md` — (ini) cara kerja
3. `AI_SKILL.md` — pelajaran dan temuan sebelumnya
4. File tugas yang relevan dengan pekerjaan saat ini

### Langkah 3 — Pahami Tugas

Sebelum nulis kode, pastikan sudah paham:
- Apa yang diminta?
- File mana yang akan diubah?
- Apakah ini pernah dicoba sebelumnya (cek `AI_SKILL.md`)?
- Apakah task ini besar? Kalau iya → buat plan dulu

### Langkah 4 — Kerjakan di Folder yang Benar

- Kode production → folder yang sesuai (`apps/web`, `apps/api`, dll.)
- Kode percobaan dan eksperimen → **wajib** di `/testing`

```
testing/
├── experiments/    → Coba-coba fitur baru
├── sandbox/        → Isolasi komponen untuk test
└── notes.md        → Catatan selama testing
```

Folder `/testing` ada di `.gitignore` — tidak akan ter-push ke GitHub.

### Langkah 5 — Test Sebelum Push

```bash
npx tsc --noEmit    # Cek TypeScript error
npm run lint        # Cek lint error
npm run build       # Cek build berhasil
```

Kalau ada error, perbaiki dulu. Jangan push kode yang error.

### Langkah 6 — Push ke GitHub

```bash
git add .
git commit -m "feat(nama-module): deskripsi singkat"
git push origin nama-branch
```

---

## Aturan Task Besar — Pecah Jadi Plan

Kalau task besar, kompleks, atau butuh lebih dari satu sesi: **buat plan dulu, jangan langsung coding.**

### Kapan Task Dianggap Besar

- Menyentuh lebih dari 3 file berbeda
- Butuh lebih dari 30 menit
- Ada dependensi ke pekerjaan orang lain
- Melibatkan perubahan database schema

### Format Plan

Buat file di `docs/plans/` dengan format ini:

```markdown
# Plan: [Nama Fitur]

## Tujuan
Apa yang ingin dicapai setelah plan ini selesai.

## Step-by-Step

### Step 1 — [Nama Step]
- [ ] Sub-task A
- [ ] Sub-task B

### Step 2 — [Nama Step]
- [ ] Sub-task A
- [ ] Sub-task B

## Dependensi
Ada yang harus selesai dulu?

## Estimasi
Perkiraan berapa sesi.
```

Kerjakan satu step per sesi. Centang yang sudah selesai.
Setelah semua ✅ → pindahkan file ke `docs/archive/plans/`.

---

## Aturan File Management

File yang sudah tidak dibutuhkan dipindah ke arsip — tidak dihapus.

```
docs/
├── plans/          → Plan yang sedang aktif
└── archive/
    ├── plans/      → Plan yang sudah selesai semua
    └── misc/       → File lain yang sudah tidak aktif
```

### Kapan Pindahkan ke Arsip

| Kondisi | Tindakan |
|---|---|
| Plan sudah semua step ✅ | Pindah ke `docs/archive/plans/` |
| Catatan sementara tidak relevan | Pindah ke `docs/archive/misc/` |
| Eksperimen di `/testing` sudah ada versi production-nya | Hapus dari `/testing` |

### Yang Tidak Boleh Diarsipkan

File AI, dokumentasi utama, dan file tugas anggota tim — selalu aktif sampai project selesai.

---

## Aturan Perubahan Database

**Setiap perubahan database = file migration baru. Selalu.**

SQL lama sudah dijalankan di database. Mengeditnya tidak mengubah database yang berjalan dan menyebabkan konflik.

### Cara Buat Migration Baru

```bash
# Edit schema.prisma dulu, lalu:
npx prisma migrate dev --name nama-yang-deskriptif

# Contoh nama yang baik:
npx prisma migrate dev --name add-phantom-bid-column
npx prisma migrate dev --name create-events-table
npx prisma migrate dev --name add-index-wallet-transactions
```

Perintah ini otomatis buat file SQL baru di `packages/db/migrations/` dan jalankan ke database development.

### Yang Dilarang

- Edit file `migration.sql` yang sudah ada
- Hapus folder migration yang sudah ada
- Jalankan SQL manual langsung ke database

---

## Aturan Update Dokumentasi

### Update AI_SKILL.md kalau:
- Ketemu error yang butuh waktu lama untuk debug
- Ketemu cara yang lebih efisien
- Ada hal membingungkan yang sudah ketemu jawabannya
- Library atau tool yang ternyata bermasalah

### Update file lain kalau relevan:

| Situasi | File |
|---|---|
| Variabel atau konstanta baru yang dipakai bersama | `SHARED_VARIABLES.md` |
| Icon baru dibutuhkan | `ASSETS.md` |
| Keputusan teknis baru | `TECH_CHOICES.md` |
| Aturan baru | `PERATURAN.md` |

---

## Kalau Tidak Tahu

1. Cek `AI_SKILL.md` dulu
2. Cek file dokumentasi yang relevan
3. Cek kode yang sudah ada sebagai referensi
4. Kalau task besar → buat plan dulu
5. Kalau menyangkut database → selalu migration baru
6. Kalau masih tidak yakin → tanya anggota tim yang relevan

Jangan menebak untuk hal yang menyangkut wallet, database schema, atau keamanan.
