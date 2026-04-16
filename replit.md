# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### NEPALIX (`artifacts/nepalix`) — Main Web App
- **Type**: React + Vite (frontend-only)
- **Preview path**: `/`
- **Description**: Full marketing website for NEPALIX, a Nepal-first SaaS commerce platform and commerce OS, now featuring Rare Atelier as the active live case study
- **Tech**: React, Vite, Tailwind CSS, Framer Motion, wouter, shadcn/ui, lucide-react
- **Pages**: Home, Product, Pricing, Solutions, Plugins, Case Studies, Compare, About, Book Demo, Contact, Docs
- **Brand**: Dark-modern (#070B14 base), neon cyan/blue/purple gradients, glassmorphism cards
- **Fonts**: Sora (headings), Inter (body)
- **Current focus**: Landing page hero uses a premium 3D SaaS layout with floating analytics/inventory UI cards and broad retail/ecommerce positioning; site branding uses the lower blue-to-purple Nepalix logo from the provided two-logo image

### API Server (`artifacts/api-server`)
- Express 5 API server with Zod validation and Drizzle ORM
- Preview path: `/api`

## Database (Neon PostgreSQL)

- **Connection**: `NEON_DATABASE_URL` env var → Neon PostgreSQL hosted database
- **Tables**: `users`, `sessions`, `demo_bookings`
- **Schema**: `lib/db/src/schema/` — users.ts, sessions.ts, demo-bookings.ts
- **Push schema**: `NEON_DATABASE_URL=... pnpm --filter @workspace/db run push`

## Authentication

- Cookie-based session auth (7-day expiry)
- Password hashing with bcryptjs (12 rounds)
- Routes: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Frontend: `AuthContext` in `artifacts/nepalix/src/context/AuthContext.tsx`
- Auth modal: `artifacts/nepalix/src/components/auth/AuthModal.tsx`

## API Routes

- `GET /api/healthz` — health check
- `POST /api/auth/register` — create user account
- `POST /api/auth/login` — authenticate user
- `POST /api/auth/logout` — invalidate session
- `GET /api/auth/me` — get current user (requires auth)
- `POST /api/demo-bookings` — create demo booking (public)
- `GET /api/demo-bookings` — list all bookings (admin only)
- `POST /api/contact` — submit contact message (public)
- `GET /api/contact` — list all messages (admin only)
- `PATCH /api/contact/:id/status` — update message status (admin only)
- `PATCH /api/account/profile` — update user profile (auth required)
- `POST /api/account/change-password` — change password (auth required)
- `GET /api/account/users` — list all users (admin only)

## Pages

- `/` — Home (marketing)
- `/product`, `/pricing`, `/solutions`, `/plugins`, `/case-studies`, `/compare`, `/about`, `/docs` — Public marketing pages
- `/book-demo` — Demo booking form (saves to DB)
- `/contact` — Contact form (saves to DB)
- `/dashboard` — Protected user dashboard (fullscreen, no navbar)
- `/account` — Account settings (profile update, change password)
- `/admin` — Admin panel (demo bookings, contact messages, users) — admin role only

## Workflows

- **Start application** — Vite dev server for NEPALIX frontend (port 5173 proxies /api → 3001)
- **API Server** — Express API server (port 3001)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/nepalix run dev` — run NEPALIX marketing site

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
