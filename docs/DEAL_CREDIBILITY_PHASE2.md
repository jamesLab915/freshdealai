# Deal Credibility — Phase 2 (Audit + Feed Readiness)

## What Phase 1 did

Phase 1 introduced **rule-based** credibility on `DealProduct` (`deriveDealCredibilityPhase1`) with:

- `confidence_level`, `credibility_signals`, `risk_flags`, `explanation_summary`, `ruleset_version`
- Minimal UI via `DealCredibilityStrip` on cards and deal detail

See [DEAL_CREDIBILITY_PHASE1.md](./DEAL_CREDIBILITY_PHASE1.md).

## What Phase 2 adds

Phase 2 does **not** change ranking, email, or database schema. It adds **structured, auditable outputs** so engineering and future pipelines can answer “why this confidence?” and “what would we send to a feed?” without scraping HTML.

### 1. Audit output (`deriveDealCredibilityAudit`)

- **Type:** `DealCredibilityAuditV1` (`schema_version: "deal_credibility_audit_v1"`) in `src/types/deal-credibility.ts`
- **Contents:** Everything Phase 1 exposes, plus:
  - `deal_id`, `deal_slug`, `derived_at` (ISO timestamp)
  - `evidence`: `DealCredibilityEvidenceSnapshot` — rating, review counts, prices, discount, image presence/placeholder flag, store label, product URL (all from existing fields)

**Purpose:** Human review, future audit logging, regression checks, and “show your work” without a separate logging product.

### 2. Feed readiness (`toDealCredibilityFeedItem`)

- **Type:** `DealCredibilityFeedItemV1` (`schema_version: "deal_credibility_feed_v1"`)
- **Contents:** Stable columns for digest/alerts/agents: `title`, `current_price`, `currency`, `discount_percent`, `confidence_level`, `explanation_summary`, `risk_flags`, `source`, `store_label`, `product_url`, `ruleset_version`, `derived_at`, ids/slug.

**Purpose:** Email digests, alerts, agent-readable JSON, and machine-readable “why ranked here” explanations — **decoupled from React**.

### 3. Relationship to Phase 1 UI

- The strip still consumes **`DealCredibilityPhase1` only** (`deriveDealCredibilityPhase1`).
- Audit and feed types are **downstream projections** of the same rules; they are not merged into the strip props to avoid mixing debug/audit payloads with UI state.

### 4. Future hooks file

- `dealCredibilityAuditToRecord` in `src/lib/deal-credibility-future.ts` maps a full `DealCredibilityAuditV1` to the slimmer `DealCredibilityAuditRecord` if you add a minimal persistence layer later.

## Developer verification

Script: `scripts/reportDealCredibilitySamples.ts`

- Loads deals via `getDeals` (same path as the app: database when `DATABASE_URL` is set, else mock catalog).
- Prints JSON for `toDealCredibilityFeedItem` and `deriveDealCredibilityAudit` for the first N deals (default 8; override with `CREDIBILITY_SAMPLE_LIMIT`).

```bash
npx tsx scripts/reportDealCredibilitySamples.ts
```

## What Phase 2 explicitly does not do

- No new recommendation system, no homepage/rail reordering
- No admin UI changes
- No image pipeline or external price API
- No mandatory DB migration (optional future sink can use `DealCredibilityAuditRecord`)

## Suggested next steps

1. **Intent layer** — thread `DealCredibilityUserIntentContext` when re-explaining in search/home (see `deal-credibility-future.ts`).
2. **Audit logging** — append `dealCredibilityAuditToRecord` output to a queue or table when you are ready to persist.
3. **Distribution** — emit `DealCredibilityFeedItemV1` from batch jobs for email/Slack/agent consumers.
