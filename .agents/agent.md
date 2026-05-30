# Emerald Kingdom — AI Agent Guidelines

## Identitas
- Project: Emerald Kingdom — Platform lelang online premium bertema kerajaan medieval fantasy
- Model bisnis: Consignment Auction
- Mata uang: Crown Coin (CC) — simbol ♛

## Sebelum Mulai Kerja
1. Baca AI_CONTEXT.md, AI_RULES.md, AI_SKILL.md di folder Panduan/Fo AI
2. Baca file tugas orang yang minta bantuan
3. Baca SHARED_VARIABLES.md untuk konstanta yang sudah ada
4. Cek PERATURAN.md untuk aturan tim

## Aturan Kode
- TypeScript strict — tidak ada `any` tanpa alasan
- Shared types di `packages/types` — jangan duplikasi
- Tidak ada warna hardcode — semua pakai CSS variable
- Tidak ada emoji di UI — semua pakai SVG icon
- commit message: `<type>(<scope>): <deskripsi>`
- Tidak pernah push langsung ke `main`

## Aturan Database
- `wallet_transactions` dan `audit_logs` = append only (TIDAK BOLEH UPDATE/DELETE)
- Perubahan schema = selalu migration baru
- Data KYC sensitif = enkripsi sebelum simpan

## Lokasi Penting
- Schema: `packages/db/schema.prisma`
- Types: `packages/types/src/`
- CSS Variables: `apps/web/src/app/globals.css`
- API: `apps/api/src/`
- Admin: `apps/admin/src/`
