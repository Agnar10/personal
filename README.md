# Ledgerly - Local-First Finance Tracker

## Assumptions (MVP)
- Single local user is stored as `local-user` in the database; no auth yet.
- Dates are normalized to UTC when imported; UI displays ISO date strings.
- Budget months are represented as `YYYY-MM`.
- Import supports XLSX with header row; CSV can be imported by converting to XLSX for now.

## Architecture plan (brief)
- **Next.js App Router** for UI + server components.
- **Route handlers** for CRUD APIs (`/api/...`).
- **SQLite + Prisma** for local data persistence and migrations.
- **Local-first UX**: all data stored in `prisma/dev.db`, export/import JSON for portability.
- **Rules engine** for categorization + transfer detection utilities.
- **Dark theme** with CSS variables + Tailwind classes.

## Setup (Windows 11)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create the SQLite DB + apply migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
3. (Optional) Open Prisma Studio:
   ```bash
   npx prisma studio
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```
5. (Optional) Load demo data:
   ```bash
   npm run seed
   ```

## Prisma migration steps
1. Update `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <migration-name>`.
3. Restart the dev server if needed.

## MVP checklist
- [x] XLSX import with worksheet selection + column mapping.
- [x] Excel serial + string date parsing.
- [x] Amount parsing with commas + negatives.
- [x] Duplicate detection (date + amount + merchant + account) with override.
- [x] Store raw row JSON in `rawDataJson`.
- [x] Manual transaction entry and edit/delete API.
- [x] Categories + rules with priority order.
- [x] Transactions table with search, bulk recategorize, transfer toggle.
- [x] Accounts with balances + balance snapshots.
- [x] Budgets by category + progress bar.
- [x] Savings goals with projection UI.
- [x] Dashboard with income, expenses, cashflow, savings rate, net worth.
- [x] Settings page for currency/month start + categories + import/export.
- [x] Unit tests for parsing, categorization, transfer detection.

## Phase 2: Cloud upgrade plan
- Add authentication (NextAuth/Auth.js) and per-user data.
- Move to hosted Postgres (Neon/Supabase) with Prisma.
- Add background jobs for import processing + rules re-evaluation.
- Deploy on Vercel or Fly.io with environment-based configs.
- Add multi-currency FX rates and scheduled sync jobs.
- Implement audit logging + soft deletes for transactions.

## Scripts
- `npm run dev` — start local dev server
- `npm run test` — run unit tests
- `npm run lint` — run linting
