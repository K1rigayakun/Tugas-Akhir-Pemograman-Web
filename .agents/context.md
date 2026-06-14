# Emerald Kingdom — Context

## Project Overview
Platform lelang online premium bertema kerajaan medieval fantasy.
Dikerjakan oleh 5 orang: Syaikah (FE), Peter (Auth/KYC), Visel (Leaderboard/Museum), Fatih (Auction/Wallet/Rank), Michael (DB/Infra/LiveAuction/Admin).

## Tech Stack
- Frontend: Next.js 14, Tailwind CSS, GSAP, Three.js, Framer Motion
- Backend: NestJS, Prisma, Socket.io, BullMQ
- Database: PostgreSQL (Neon), Redis (Upstash)
- Storage: Cloudflare R2
- Deploy: Vercel (frontend), Railway (backend)
- AI: FastAPI Python

## Monorepo Structure
```
apps/web      → Frontend user (port 3000)
apps/admin    → Admin panel (port 3002)
apps/api      → Backend NestJS (port 3001)
apps/oracle   → AI service Python (port 8000)
packages/db   → Prisma schema
packages/ui   → Shared UI components
packages/types → Shared TypeScript types
```

## Dependency Antar Anggota
```
Michael (DB Schema + Infra) → harus selesai duluan
    ↓
Fatih (Auction, Wallet, Rank) + Peter (Auth, KYC)
    ↓
Syaikah (Dynamic UI) + Visel (Leaderboard, Museum)
```
