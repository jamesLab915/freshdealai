# Distribution layer — Phase 1

## Why this exists

FlashDeal already produces **credibility-aware feed rows** (`DealCredibilityFeedItemV1` via `toDealCredibilityFeedItem`) from [Deal Credibility Phase 2](./DEAL_CREDIBILITY_PHASE2.md). Phase 1 of the **distribution layer** adds a **server-side, UI-agnostic** envelope so the same catalog can power future:

- Daily / “today’s worth buying” digests  
- Alerts (not implemented here)  
- Agent-readable exports  

without coupling to React or duplicating ranking logic.

## Relationship to the site UI

- **No change** to homepage or hub components — builders **read** the same pools and helpers the pages use (`pickHomepageFeaturedManualOnly`, `loadCollectionPageData`).
- `route_url` is derived with `getSiteUrl()` for absolute links; credibility text and flags still come from Phase 2 only.

## Relationship to credibility Phase 1 / 2

- **Phase 1** — rule-based strip on cards/detail.  
- **Phase 2** — `deriveDealCredibilityAudit`, `toDealCredibilityFeedItem`.  
- **Distribution Phase 1** — wraps each selected `DealProduct` as `DistributionItemV1`: metadata (`item_type`, `source_bucket`, `route_url`, `ai_score`) + nested **`credibility: DealCredibilityFeedItemV1`**.

## Bundle types (this phase)

| Builder | Strategy id | Selection |
|--------|-------------|-----------|
| `buildHomepageFeaturedDistributionBundle` | `homepage_featured_manual_v1` | `pickHomepageFeaturedManualOnly` + `getDeals` |
| `buildBestDealsDistributionBundle` | `collection_best_deals_v1` | `loadCollectionPageData("best-deals")` |
| `buildCategoryDistributionBundle(slug)` | `collection_category_<slug>_v1` | `loadCollectionPageData(slug)` for known presets (e.g. `electronics`) |

Each returns `DistributionBundleV1` with `summary` counts and optional `warnings` (e.g. empty pin set).

## What this phase does not do

- No email, push, or cron.  
- No database migration or new admin surfaces.  
- No new ranking algorithm — only **structural export** of existing selections.  
- No user-facing pages.

## See also

- Phase 2 (internal API + digest projections): [DISTRIBUTION_LAYER_PHASE2.md](./DISTRIBUTION_LAYER_PHASE2.md)

## Next steps (suggested)

- **Digest / email** — render HTML from `DistributionBundleV1` + templates.  
- **Alerts** — filter `items` by `credibility.confidence_level` or flags, then queue.  
- **Agent feeds** — expose the same JSON behind auth or internal API routes.  
- **Intent layer** — attach user/query context before picking bundles (see `deal-credibility-future.ts`).
