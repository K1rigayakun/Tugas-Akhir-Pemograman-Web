# 🧠 Emerald Kingdom — AI Skill Log

File ini adalah dokumen hidup yang terus diperbarui selama development.
Setiap kali ada error yang susah di-debug, temuan baru, atau cara yang lebih efisien — tulis di sini.
Tujuannya supaya masalah yang sama tidak perlu dipecahkan dua kali.

Baca file ini sebelum mulai debugging sesuatu — mungkin jawabannya sudah ada di sini.

---

## Cara Update File Ini

Update file ini setiap kali salah satu dari ini terjadi:

| Situasi | Yang Ditulis |
|---|---|
| Error yang butuh waktu lama untuk di-debug | Error-nya apa, penyebabnya apa, solusinya apa |
| Ketemu cara yang lebih efisien | Cara lama vs cara baru, kenapa lebih baik |
| Ada hal yang membingungkan dan sudah ditemukan jawabannya | Pertanyaan + jawaban jelas |
| Library atau tool yang ternyata bermasalah | Masalahnya apa, alternatifnya apa |
| Pattern yang berguna dan bisa dipakai ulang | Nama pattern + contoh singkat |

### Format Entry

```markdown
## [Tanggal] — [Judul Singkat]

**Situasi:** Apa yang sedang dikerjakan

**Masalah / Temuan:** Apa yang terjadi

**Solusi / Cara Lebih Baik:** Bagaimana menyelesaikannya

**Berlaku untuk:** File atau bagian mana yang relevan
```

---

## Log Entries

*(Kosong — akan terisi selama development berlangsung)*

---

## Referensi Cepat

Pertanyaan umum yang sudah ada jawabannya:

**Q: Di mana CSS variable untuk warna?**
Di `apps/web/src/app/globals.css`. Semua komponen harus pakai `var(--color-...)` — tidak boleh hardcode hex.

**Q: Di mana mendefinisikan TypeScript type baru?**
Kalau dipakai lebih dari satu app → wajib di `packages/types/src/`.
Kalau hanya dipakai di satu app → boleh lokal di app tersebut.

**Q: Bagaimana cara jalankan project di lokal?**
Dari root folder, jalankan `turbo dev`. Semua app berjalan sekaligus.

**Q: Di mana menyimpan file testing dan eksperimen?**
Di folder `/testing` di root. Folder ini ada di `.gitignore` — tidak akan ter-push ke GitHub.

**Q: Bagaimana format commit message?**
`<type>(<scope>): <deskripsi>` — contoh: `feat(wallet): add top-up endpoint`.
Detail lengkap di `PERATURAN.md`.

**Q: Boleh push langsung ke branch main?**
Tidak boleh. Selalu buat branch baru, lalu buat Pull Request.

**Q: Kenapa saldo wallet tidak boleh di-UPDATE langsung?**
Karena `wallet_transactions` adalah ledger keuangan append-only. Semua perubahan saldo harus dicatat sebagai transaksi baru. Ini untuk audit trail dan mencegah manipulasi data.

**Q: Apa itu idempotency key?**
Key unik (UUID v4) yang dikirim bersama setiap request transaksi. Kalau request yang sama dikirim dua kali karena network error atau double-click, backend tahu itu duplikat dan tidak memproses dua kali.

**Q: Di mana file gambar dan aset disimpan?**
Di Cloudflare R2 (object storage). Database hanya menyimpan URL-nya. Jangan simpan binary file di PostgreSQL.

**Q: Bagaimana cara ubah schema database?**
Edit `packages/db/schema.prisma`, lalu jalankan `npx prisma migrate dev --name nama-perubahan`.
Jangan pernah edit file migration yang sudah ada — selalu buat file baru.

**Q: Kenapa tidak boleh edit migration lama?**
Migration lama sudah dijalankan di database. Mengeditnya tidak mengubah database yang sudah berjalan dan akan menyebabkan konflik antar anggota tim.

**Q: Apa bedanya `packages/ui` dan komponen di `apps/web`?**
`packages/ui` → komponen yang dipakai di lebih dari satu app (misalnya dipakai di `web` dan `admin`).
`apps/web/src/components` → komponen yang hanya dipakai di `apps/web`.
