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
- **Description**: Full marketing website for NEPALIX, a Nepal-first SaaS commerce platform
- **Tech**: React, Vite, Tailwind CSS, Framer Motion, wouter, shadcn/ui, lucide-react
- **Pages**: Home, Product, Pricing, Solutions, Plugins, Case Studies, Compare, About, Book Demo, Contact, Docs
- **Brand**: Dark-modern (#070B14 base), neon cyan/blue/purple gradients, glassmorphism cards
- **Fonts**: Sora (headings), Inter (body)

### API Server (`artifacts/api-server`)
- Express 5 API server with Zod validation and Drizzle ORM
- Preview path: `/api`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/nepalix run dev` — run NEPALIX marketing site

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
