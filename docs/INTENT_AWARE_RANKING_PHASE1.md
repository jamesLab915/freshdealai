# Intent-aware ranking — Phase 1

## What this is

A **tie-break layer** on top of the user’s chosen sort (AI score, recency, discount %, review volume). It does **not** replace repository queries, does **not** train a model, and does **not** personalize per user.

Implementation: `src/lib/search/intent-aware-ranking.ts`, invoked from `DealsExplorer` after filters.

## Rules (auditable)

1. **Primary key** — unchanged from pre–Phase 1: `sort` controls the main ordering (`newest` | `biggest_drop` | `popularity` | default `ai_score`).

2. **Tie-breakers** (only when the primary key is equal):
   - If there is a **text query** `q`: higher **`textMatchTier`** (brand token match → title prefix → title contains → tags/category).
   - Then **credibility** order from `deriveDealCredibilityPhase1` (`high` > `medium` > `unknown` > `low`).
   - Then higher **discount %**.

3. **Intent buckets** (`IntentRankingKind`) — used only for **copy** (`rankingNote`), not for a different algorithm:
   - `generic_text` — keyword search without structural filters.
   - `structured_brand` | `structured_category` | `structured_store` — one shelf filter.
   - `structured_mixed` — two or more of brand/category/store.
   - `none` — browse-only (no `q`, no structural filters).

## Why this isn’t a “recommendation engine”

- Same catalog, same filters; only **order** among ties changes.
- Signals are **rules** (credibility + text match), not learned rankings.
- Users still control the **primary** sort.

## What we did not do

- No DB migration, no LLM rerank, no A/B scoring layer.
- No changes to admin, images, or outbound sender/distribution.

## Next steps

- Optional **audit log** of `IntentRankingKind` + primary sort for analytics.
- **Personalization** only with explicit consent and separate evaluation.
- Richer features (e.g. price history) should feed **credibility** or new explicit columns, not hidden reranks.
