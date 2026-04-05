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
# Set DATABASE_URL to your Neon connection string for real data (recommended for development and ops).
npm install
npm run dev:3010
```

Open [http://127.0.0.1:3010](http://127.0.0.1:3010) (or `npm run dev` on port 3000). Production-like checks: `npm run build` then `npm run start:3010`. For **`/admin`**, set `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env`; if unset, the middleware returns **401** with instructions instead of a silent **403**.

**Database:** Local and Vercel should both use a **Neon** (or other hosted Postgres) `DATABASE_URL`. The app falls back to **mock deals** only when `DATABASE_URL` is missing or the DB is unreachable — see `AGENTS.md` for team rules on always using Neon for real work.

### Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes for real catalog | **Neon** PostgreSQL URL for Prisma. Without it, listings use **mock deals** (`src/lib/mock-deals.ts`). |
| `OPENAI_API_KEY` | No | AI scoring, summaries, SEO. Without it, **deterministic fallbacks** run (`src/services/ai/*`). |
| `NEXT_PUBLIC_SITE_URL` | Strongly recommended in prod | Canonical URLs, OG, sitemap, `robots.txt`. In **development**, if unset, defaults to `http://localhost:3010`. On **Vercel**, if unset, `VERCEL_URL` is used until you set this to your custom domain. A **production** build without either explicit URL or `VERCEL_URL` falls back to localhost (see server warnings). |
| `AMAZON_ASSOCIATE_TAG` | Recommended for revenue | Amazon `tag=` on outbound URLs before `/out` (see `src/lib/affiliate.ts`). |
| `CRON_SECRET` | Recommended in prod | Protects manual hits to `/api/cron/run` (Bearer token); Vercel cron also sends `x-vercel-cron`. |
| `ADMIN_USERNAME` | Yes for admin | With `ADMIN_PASSWORD`, enables **HTTP Basic Auth** on `/admin/*` and `/api/admin/*` via middleware. |
| `ADMIN_PASSWORD` | Yes for admin | Use a long random value in production. |

### Vercel (typical production env)

Set at least:

- **`DATABASE_URL`** — Neon connection string (same idea as local).
- **`NEXT_PUBLIC_SITE_URL`** — Public site URL (e.g. `https://your-domain.com`).
- **`AMAZON_ASSOCIATE_TAG`** — Associates tag for monetized Amazon links.
- **`CRON_SECRET`** — Protects `/api/cron/run` when not using Vercel’s cron header alone.
- **`OPENAI_API_KEY`** — If you enable live AI (optional; app uses fallbacks without it).

Add **`ADMIN_USERNAME`** / **`ADMIN_PASSWORD`** for admin UI access.

### Admin access (Basic Auth)

Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` (see `.env.example`). All requests to **`/admin`** and **`/api/admin/*`** are checked by `src/middleware.ts`:

- Valid credentials → request proceeds.
- Missing or wrong `Authorization: Basic …` → **401** and the browser login prompt.
- If either admin variable is **unset** → **401** with a plain-text hint (configure env before using Basic auth).

Scripted or CI calls to admin APIs must send the header, for example:

`Authorization: Basic base64(username + ":" + password)`.

Rotate the password if it is ever exposed.

See `.env.example` for optional Amazon PA API keys (ingestion status only).

### PostgreSQL (Neon recommended)

1. Create a **Neon** database and set **`DATABASE_URL`** in `.env` (local and Vercel).
2. Run:

```bash
npm run db:push
# Optional: npm run db:seed — only if you want the demo seed row; do not overwrite real ops data blindly.
```

If `DATABASE_URL` is missing or the connection fails, the app **falls back to mock deals** so the storefront and most APIs keep working for demos and CI.

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
| `npm run deal-engine` | Fetch sample deals → AI copy → upsert into Postgres (`scripts/runDealEngine.ts`) |
| `npx prisma generate` | Regenerate client (also runs on `postinstall`) |

### Automated deal engine (fetch → AI → DB)

Persistence uses **PostgreSQL + Prisma** (not SQLite — serverless-friendly on Vercel). Tables map as **`products`** (deals) and **`categories`** (rollup counts).

| Path | Role |
|------|------|
| `src/lib/deals/fetchDeals.ts` | Curated Amazon ASIN feed + PA-API / Walmart stubs |
| `src/lib/ai/generateDealContent.ts` | SEO title, description, short review, tags (OpenAI or fallback) |
| `src/lib/db.ts` | Re-exports Prisma + persistence helpers |
| `src/lib/deal-engine/runDealEngine.ts` | Orchestrates fetch → generate → upsert (dedupe via `source` + `externalId`) |
| `scripts/runDealEngine.ts` | CLI: `npm run deal-engine` |

Cron (Vercel): **`GET /api/cron/run`** — schedule **`0 */6 * * *`** in `vercel.json`. Set **`CRON_SECRET`** and use `Authorization: Bearer <CRON_SECRET>`, or rely on Vercel’s `x-vercel-cron` header.

Affiliate tags: set **`AMAZON_ASSOCIATE_TAG`** so `applyAffiliateTags` appends `tag=` on Amazon URLs before `/out` links (no placeholder tag when unset).

**Routing note:** Product detail URLs stay **`/deals/[slug]`**. **`/deal/[id]`** redirects to the slug canonical. Category hubs use **`/deals/category/[slug]`** so they don’t collide with `/deals/[slug]`.

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
