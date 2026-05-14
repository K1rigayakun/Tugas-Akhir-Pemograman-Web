# 📜 Emerald Kingdom — Peraturan Tim

Dokumen ini adalah aturan yang berlaku untuk semua anggota tim dan AI agent yang membantu project ini.
Dibaca oleh semua orang. Dipatuhi oleh semua orang.

---

## 1. Komunikasi

- Diskusi teknis yang penting wajib dicatat secara tertulis — jangan hanya di voice call. Tulis ringkasannya di grup setelah selesai.
- Kalau ada sesuatu yang blocking pekerjaan kamu (butuh sesuatu dari orang lain sebelum bisa lanjut), bilang segera — jangan tunggu deadline.
- Response pesan grup maksimal 6 jam di hari kerja. Kalau sedang tidak bisa, beritahu tim.
- Kalau ada masalah yang membuat tidak bisa kerja, bilang ke tim. Kita bisa atur ulang jadwal. Yang tidak bisa ditoleransi adalah menghilang tanpa kabar.

---

## 2. Git & Branch

### Aturan Branch

Tidak ada yang boleh push langsung ke `main`. Semua perubahan melalui Pull Request.

| Branch | Kegunaan |
|---|---|
| `main` | Production — hanya via PR yang sudah di-review |
| `feat/nama-fitur` | Fitur baru |
| `fix/nama-bug` | Perbaikan bug |
| `chore/nama-task` | Setup, konfigurasi, dokumentasi |
| `hotfix/nama` | Perbaikan darurat di production |

Contoh nama branch yang benar:
```
feat/wallet-top-up
feat/auction-bid-system
fix/race-condition-bid
chore/setup-prisma-schema
```

### Commit Message

Format wajib — Conventional Commits:

```
<type>(<scope>): <deskripsi singkat>
```

| Type | Kapan Dipakai |
|---|---|
| `feat` | Menambah fitur baru |
| `fix` | Memperbaiki bug |
| `chore` | Setup, konfigurasi, dependency |
| `docs` | Perubahan dokumentasi saja |
| `style` | Perubahan styling — tidak ada perubahan logika |
| `refactor` | Refactor kode |
| `test` | Tambah atau perbaiki test |

Contoh yang benar:
```
feat(auction): implement anti-sniping timer extension
fix(wallet): prevent double deduction on network retry
chore(db): add index on wallet_transactions
docs(readme): update local setup guide
```

Contoh yang **salah**:
```
update
fix bug
WIP
coba-coba
asdfjkl
```

### Pull Request

- Setiap PR wajib punya judul yang jelas dan deskripsi singkat apa yang diubah
- PR yang menyentuh `packages/types` atau `packages/db` → wajib di-review semua anggota tim
- PR lain → minimal 1 reviewer yang relevan dengan domain perubahannya
- Jangan merge PR milik sendiri — tunggu approval dari orang lain
- Kalau ada konflik merge, yang buat PR yang harus resolve

---

## 3. Kode

### Umum

- Tidak ada `console.log` yang tertinggal di kode production
- Tidak ada kode yang di-comment-out lalu di-push — kalau tidak dipakai, hapus
- Tidak ada `any` di TypeScript kecuali ada alasan kuat dan ada komentar kenapa
- Selalu pakai `const`, gunakan `let` hanya kalau nilainya memang berubah, tidak pernah `var`

### Shared Code — Aturan Kritis

- Type dan interface yang dipakai lebih dari satu app → wajib di `packages/types`
- Konstanta global → wajib di `packages/types/src/constants.ts`
- Komponen UI yang dipakai lebih dari satu halaman → wajib di `packages/ui`
- Perubahan di `packages/types` atau `packages/db` → wajib diumumkan ke grup sebelum di-merge
- Dilarang duplikasi — kalau sudah ada di `packages/types`, pakai yang itu

### Visual

- Tidak ada warna hardcode (hex langsung) di komponen — semua pakai `var(--color-...)`
- Tidak ada emoji di UI — semua pakai SVG icon dari `packages/ui/src/icons/`
- Gradient di elemen penting harus beranimasi — tidak boleh statis
- Semua animasi kompleks wajib punya fallback `@media (prefers-reduced-motion: reduce)`

### Backend

- Semua endpoint format kebab-case: `/api/v1/auction-bids`
- Selalu validasi input dari user sebelum diproses
- Error response selalu dalam format konsisten:
  ```json
  { "statusCode": 400, "message": "Deskripsi error" }
  ```
- Tidak boleh return stack trace ke client di production

### Database

- `wallet_transactions` dan `audit_logs` → tidak boleh UPDATE atau DELETE dari kode manapun
- Semua query data banyak → wajib ada LIMIT atau pagination
- Perubahan schema → selalu buat migration file baru, jangan edit yang sudah ada

---

## 4. Environment & Secret

- Tidak pernah commit `.env` atau file apapun yang berisi secret ke repository
- Semua secret ada di `.env` dan terdokumentasi di `.env.example` tanpa nilai aslinya
- Kalau tidak sengaja push secret → langsung beritahu Michael untuk rotate credentials. Jangan pura-pura tidak terjadi.

---

## 5. Testing & File

- Semua file percobaan dan eksperimen → taruh di folder `/testing`
- Folder `/testing` ada di `.gitignore` — tidak akan ter-push ke GitHub
- Kalau menemukan solusi bagus di `/testing` → pindahkan ke folder yang benar sebelum commit
- Kalau ada file dokumentasi yang sudah tidak relevan (misal plan yang sudah selesai semua) → pindahkan ke `docs/archive/`, bukan dihapus

---

## 6. Task Besar

Kalau ada task yang terasa besar atau kompleks:
- Jangan langsung coding
- Buat plan dulu di `docs/plans/` dengan format yang ada di `AI_RULES.md`
- Kerjakan satu step per sesi
- Setelah semua step selesai, arsipkan plan ke `docs/archive/plans/`

---

## 7. Definisi "Selesai"

Sebuah fitur dianggap selesai hanya kalau:

- [ ] Fungsinya berjalan sesuai yang dijelaskan di file tugas
- [ ] Tidak ada `console.log` yang tertinggal
- [ ] TypeScript tidak ada error (`tsc --noEmit` clean)
- [ ] Tidak ada ESLint warning atau error
- [ ] PR sudah di-review dan di-approve minimal 1 orang
- [ ] CI pipeline hijau (lint + build)
- [ ] Sudah ditest di lokal — bukan hanya "harusnya jalan"

---

## 8. Yang Tidak Boleh Dilakukan

| Larangan | Akibat |
|---|---|
| Push langsung ke `main` tanpa PR | Segera revert, diskusi tim |
| Commit secret atau API key ke repository | Segera rotate credential |
| UPDATE atau DELETE pada `wallet_transactions` atau `audit_logs` | Investigasi penuh |
| Hardcode credential di kode | PR ditolak, harus diperbaiki |
| Mengubah schema database tanpa diskusi tim | Revert wajib |
| Edit file migration yang sudah ada | Revert wajib, buat migration baru |
| Menghilang tanpa kabar lebih dari 3 hari | Evaluasi tim |

---

> *"A kingdom is only as strong as the discipline of its builders."*
