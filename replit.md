# Smash Property — Property Wealth Snapshot

## Overview
A property investment calculator web app for Australian investors. Shows cash flow, tax benefits, and 10-year growth projections.

## Architecture
- **Frontend**: React 18 + Vite, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express 5 (Node.js), TypeScript via tsx
- **Storage**: In-memory (MemStorage) — can be swapped for PostgreSQL via Drizzle ORM
- **Auth**: Passport.js + express-session scaffolded
- **Routing**: Wouter (client-side), hash-based routing

## Project Structure
```
client/       React frontend (Vite dev server in dev, served as static in prod)
server/       Express backend
  index.ts    Entry point — listens on port 5000 (0.0.0.0)
  routes.ts   API route registration
  static.ts   Static file serving for production
  vite.ts     Vite middleware setup for development
  storage.ts  Storage interface + MemStorage implementation
shared/       Shared types/schema (Drizzle + Zod)
script/       Build scripts (esbuild + Vite)
```

## Running the App
- **Dev**: `npm run dev` (starts Express + Vite middleware on port 5000)
- **Build**: `npm run build` (Vite + esbuild bundling)
- **Production**: `npm run start` (serves pre-built static files)

## Key Notes
- Always runs on port 5000, host 0.0.0.0 (required for Replit)
- Dev mode: Vite runs as Express middleware (HMR enabled)
- Production: static files served from `dist/public/`
- Database schema in `shared/schema.ts`, push with `npm run db:push`

## Analytics & Tracking
- Google Analytics 4 (G-T1SCTQ688C)
- HubSpot embed (46147239)
- Meta Pixel tracking was removed from the HTML head (invalid placement) during Replit migration
