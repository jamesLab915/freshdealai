# Search / intent — Phase 1

## What changed

1. **Single rule layer** — `src/lib/search/search-intent.ts` centralizes:
   - numeric hints (under $X, N% off) used by `parseSearchQueryRulesWithCatalog`
   - brand / category / store matching from **the same shape** as `getBrands` / `getCategories` / `getStores` (`BrandMeta`, `CategoryMeta`, `StoreMeta`)
   - category product-type hints (laptop → `electronics`, etc.) unchanged but moved beside catalog helpers
   - URL validation: unknown `brand` / `category` / `store` slugs are **invalid** (no silent widening)

2. **`parseSearchQuery.ts`** — `parseSearchQueryRules` delegates to `parseSearchQueryRulesWithCatalog` with mock lists; new optional **`store`** field on `SearchQueryUnderstanding` when the query names a retailer. NL path still returns `store: null` until a schema update.

3. **Deals explorer** — Client filters use `categoryNameToSlug` (same as `slugifyCatalogSegment` rules). If URL contains a brand/category/store slug **not** in the current catalog lists or `STORE_SLUG_HOSTS`, the result set is **empty** and a short explanation appears (previously an unknown **brand** filter was ignored and showed the full grid).

4. **Search UX copy** — When “Search deals” uses `searchUx`, a one-line **rule-based** explanation describes active text match + structured filters.

## Relationship to repository / catalog

- Server-side `getDeals` filters still use `resolveBrandNameForFilterSlug` / `resolveCategoryNameForFilterSlug` in `repository.ts` (unchanged).
- Client-side search aligns slugs with **the same** `slugifyCatalogSegment` semantics via `categoryNameToSlug` and known store keys in `STORE_SLUG_HOSTS`.

## What we did not do

- No LLM query rewrite, no new ranking model, no personalization.
- No changes to sender/distribution pipelines.
- No database migration.

## Next steps

- Extend NL JSON schema with `store` when product wants model-extracted retailer intent.
- Optional: hydrate `parseSearchQueryRulesWithCatalog` with live metas inside a server route for stricter API parity with the DB.
- See also: [INTENT_AWARE_RANKING_PHASE1.md](./INTENT_AWARE_RANKING_PHASE1.md) for tie-break ranking on top of the same filters.

