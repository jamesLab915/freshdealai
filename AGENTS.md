# Agent / contributor rules — FlashDealAI

Work **only** in this repo (`flashdeal-ai`). Do **not** change `video_factory` or unrelated projects unless the user explicitly asks.

## Database

- **Neon (PostgreSQL) is the only production-grade database.** Use the project root **`.env`** `DATABASE_URL` (Neon connection string) for all local dev, scripts, and deployments.
- **Do not** switch back to localhost-only Postgres, ad-hoc SQLite, or temporary databases for “real” work.
- Prisma scripts, **deal-engine**, **backfill**, admin writes, and any DB mutation must use **`DATABASE_URL` from `.env`** (Neon). Before running a **write** command, confirm `DATABASE_URL` points at Neon (e.g. host contains `neon.tech` or your Neon-provided pattern), and summarize that in the task output.
- **Never** use mock data to overwrite real Neon rows unless the user **explicitly** allows it.

## Homepage & hubs (merchandising)

- **Featured row** is **manual-only** (`homepageRank`), max 6, no algorithmic filler — see `pickHomepageFeaturedManualOnly` in `src/lib/deal-picks.ts`.
- Required for Featured pins: `published`, not `excludeFromHubs`, full price context (`!isPriceContextIncomplete`), **`isPrimaryShelfAmazonDeal`** (`src/lib/deal-shelf-eligibility.ts`: `amazon.com/dp/` and no `example` in URL).
- **Trending, AI picks, Biggest drops**, and hubs using **`sortDealsForHub`** (e.g. `/best-deals`, category hubs, top-10, under/today, etc.) only include deals that pass **`isPrimaryShelfAmazonDeal`** — legacy fake/example Amazon URLs must not appear on those surfaces.

## Code change workflow (default)

After substantive code changes:

1. `npm run build`
2. `npm run lint`
3. If both pass: `git add .` → `git commit -m "Clear description"` → `git push origin main` (for Vercel auto-deploy).
4. If `git push` fails, stop and report the error — do not assume deploy.

## Data change workflow (default)

When running deal-engine, backfill, or scripts that write the DB: report **inserted / updated / skipped / errors** (or equivalent) in the summary.

## Schema & refactors

- **No** broad refactors or Prisma schema changes unless the user requires it and the impact is understood.
