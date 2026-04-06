# Distribution layer — Phase 2 (internal API + digest projections)

## What Phase 1 did

Phase 1 introduced **`DistributionItemV1` / `DistributionBundleV1`**, builders tied to homepage featured pins, best-deals collection, and category presets, plus a terminal script (`distribution:report`). See [DISTRIBUTION_LAYER_PHASE1.md](./DISTRIBUTION_LAYER_PHASE1.md).

## What Phase 2 adds

1. **Read-only internal HTTP routes** that return the same bundles as JSON (no new ranking, no UI).
2. **`DigestItemV1` / `DigestBundleV1`** — a thin projection derived from distribution bundles for short-form channels (email, Telegram, “today’s picks” copy).
3. **Scripts** — existing `distribution:report` now also prints digest JSON; **`digest:report`** outputs digest-only payloads.

## Internal API

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/internal/distribution/homepage-featured` | Query: `limit` (default 12, max 50), `include_digest` (default true) |
| `GET` | `/api/internal/distribution/best-deals` | Query: `include_digest` |
| `GET` | `/api/internal/distribution/category/[slug]` | `slug` must match a `getCollectionPreset` key (e.g. `electronics`, `nike`, `under-50`, `best-deals`). Query: `limit` (default 24, max 50), `include_digest` |

**Response shape** (success): `{ success: true, source: "database" \| "mock", data: { bundle: DistributionBundleV1, digest?: DigestBundleV1 }, meta: { projection: "bundle+digest" \| "bundle_only" } }`.

Set `include_digest=0` to omit `digest` and shrink payloads.

**Errors:** `400` for invalid `limit` or malformed category slug; `404` for unknown category preset.

**Security:** No new auth layer in-app — treat as **internal**: restrict at the edge (VPN, private network, or platform rules) before exposing publicly.

## Digest projection

- **`DigestItemV1`** — `title`, `route_url`, `current_price`, `currency`, `discount_percent`, `confidence_level`, `explanation_summary`, `store_label`, `headline_label` (e.g. `Amazon · 40% off`), `primary_reason` (currently mirrors `explanation_summary`), `slug`, `source_bucket`.
- **`DigestBundleV1`** — mirrors bundle `strategy`, `catalog_source`, `warnings`, `generated_at`, plus `items: DigestItemV1[]` and `summary.item_count`.

Implemented by `toDigestItemV1` / `toDigestBundleV1` in `src/lib/distribution/digest-projection.ts`.

## What Phase 2 does not do

- No scheduler, no sender, no real email or push.
- No new user-facing pages.
- No database migrations.

## Next steps

- **Scheduler** — cron hits internal routes or calls builders directly, stores snapshot JSON.
- **Digest sender** — template `DigestBundleV1.items` into HTML/text.
- **Alerts** — filter items by `confidence_level` or flags before enqueue.
- **Agent consumer** — same JSON as `bundle` or `digest` depending on token budget.
