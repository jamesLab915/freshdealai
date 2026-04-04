# FlashDealAI

**FlashDealAI** is an AI-assisted US retail deals platform: multi-source ingestion, PostgreSQL storage, structured OpenAI workflows, and a Next.js storefront with admin tooling.

> **Note:** The npm package folder is `flashdeal-ai` (lowercase, npm naming). The product name is **FlashDealAI**.

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Radix-based UI (shadcn-style components), Vaul drawer (mobile nav).
- **Data:** PostgreSQL + Prisma 7 (`@prisma/adapter-pg` + `pg`).
- **AI:** OpenAI SDK — **Responses API** with JSON schema outputs, plus chat `json_object` fallback (`src/lib/openai/responses.ts`). Tool stubs in `src/lib/openai/tools.ts`.

## Quick start (local)

```bash
cd flashdeal-ai
cp .env.example .env
# Edit .env — DATABASE_URL is optional first (site uses rich mock data)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For **`/admin`**, use the Basic Auth credentials from `.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`); if they are unset, admin routes return **403** until you configure them.

### Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | No* | PostgreSQL connection for Prisma. Without it, listings use **mock deals** (`src/lib/mock-deals.ts`). |
| `OPENAI_API_KEY` | No | AI scoring, summaries, SEO. Without it, **deterministic fallbacks** run (`src/services/ai/*`). |
| `NEXT_PUBLIC_SITE_URL` | Recommended in prod | Canonical URLs, OG, sitemap, `robots.txt`. Defaults to `http://localhost:3000` if unset. |
| `ADMIN_USERNAME` | Yes for admin | With `ADMIN_PASSWORD`, enables **HTTP Basic Auth** on `/admin/*` and `/api/admin/*` via middleware. |
| `ADMIN_PASSWORD` | Yes for admin | Use a long random value in production. |

\*Required when you want persisted products, admin DB features, and real search logs.

### Admin access (Basic Auth)

Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` (see `.env.example`). All requests to **`/admin`** and **`/api/admin/*`** are checked by `src/middleware.ts`:

- Valid credentials → request proceeds.
- Missing or wrong `Authorization: Basic …` → **401** and the browser login prompt.
- If either admin variable is **unset** → **403** (admin disabled until configured).

Scripted or CI calls to admin APIs must send the header, for example:

`Authorization: Basic base64(username + ":" + password)`.

Rotate the password if it is ever exposed.

See `.env.example` for optional Amazon PA API keys (ingestion status only).

### PostgreSQL (production or full local demo)

1. Create a database and set `DATABASE_URL` in `.env`.
2. Run:

```bash
npm run db:push
npm run db:seed
```

If `DATABASE_URL` is missing or the connection fails, the app **falls back to mock deals** so the storefront, collection hubs, and most APIs keep working for demos and CI.

### OpenAI (optional)

Set `OPENAI_API_KEY`. Without it, AI routes and admin re-runs use **structured fallbacks** instead of live model calls.

### Mock fallback behavior

- **Deals & search:** In-memory mock catalog when DB is unavailable.
- **AI:** Template-based JSON when `OPENAI_API_KEY` is absent.
- **Admin CSV “Confirm import”:** Acknowledges rows without writing to the DB until persistence is wired (`/api/admin/csv/confirm`).

### Deploy on Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the project in [Vercel](https://vercel.com) (framework: Next.js — `vercel.json` pins defaults).
3. Add environment variables in the Vercel project settings (at minimum `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL` for production; add `OPENAI_API_KEY` when ready).
4. Deploy. `postinstall` runs `prisma generate` for the Prisma client.

For Postgres, use Vercel Postgres, Neon, Supabase, or any hosted Postgres; paste the connection string as `DATABASE_URL`.

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm start` | Production build & run |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run db:push` | Push `prisma/schema.prisma` to the database |
| `npm run db:migrate` | Create/apply migrations (`prisma migrate dev`) |
| `npm run db:seed` | Seed a sample product (`prisma/seed.ts`) |
| `npx prisma generate` | Regenerate client (also runs on `postinstall`) |

## Project layout (high level)

| Path | Role |
|------|------|
| `prisma/schema.prisma` | Products, price history, collections, ingestion jobs, AI tasks, search log, admin users |
| `src/app/` | Routes: `/`, `/deals`, `/deals/[slug]`, `/categories`, `/stores`, `/ai-picks`, `/search`, `/about`, `/admin/*` |
| `src/app/api/*` | JSON APIs + admin form POST handlers |
| `src/lib/deals-data.ts` | DB + mock aggregation for pages |
| `src/lib/mock-deals.ts` | Demo catalog (full UI without Postgres) |
| `src/services/ai/` | `normalizeTitle`, `summarizeProduct`, `scoreDeal`, `classifyProduct`, `generateSeo`, `reasonToBuy` |
| `src/services/ingestion/` | `amazonIngest`, `scrapeRetailerPage`, `normalizeProductRecord`, `dedupeProducts`, `updatePriceHistory` |
| `src/lib/openai/` | Client, Responses runner, model tiers, tool placeholders |
| `src/components/` | `DealCard`, `SiteHeader`, `DealsExplorer`, UI primitives |

## API examples

- `GET /api/products?q=headphones&sort=ai_score`
- `GET /api/products/[slug]`
- `POST /api/search` — body: `{ "query": "nike", "sort": "biggest_drop" }`
- `POST /api/ai/answer` — body: `{ "question": "Best headphones deal under $300?" }`

## Admin (skeleton)

- `/admin/products` — table, QA flags, publish + “Re-run AI” forms (persisted when DB + real IDs exist).
- `/admin/ingestion` — CSV preview/confirm, source health, job list + demo triggers.
- `/admin/ai-review` — `ai_tasks` mirror (DB or demo).
- `/admin/analytics` — deal counts + local tracking aggregates (mock where noted).
- `/admin/env` — shows configured / missing for `DATABASE_URL`, `OPENAI_API_KEY`, `NEXT_PUBLIC_SITE_URL` (no secret values).

**Security:** Admin UI and admin APIs require **HTTP Basic Auth** (`ADMIN_USERNAME` / `ADMIN_PASSWORD`). Use strong secrets in production and prefer HTTPS (e.g. Vercel).

## Affiliate exits

Outbound commerce links should go through `/out?u=<encoded https URL>` (`src/app/out/route.ts`) for validation and analytics hooks.

## License

Private / your commercial use — adjust as needed.
