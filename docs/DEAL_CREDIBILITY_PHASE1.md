# Deal Credibility — Phase 1

## Why this layer exists

FlashDeal is evolving from a **discount display** site toward a **worth-buying judgment** surface. Phase 1 adds a **small, honest, rule-based** credibility readout derived **only from fields we already store** (no new schema, no fake “AI omniscience”).

This is **not** a full recommendation engine, personalization stack, or trust-and-safety program. It is a **transparent, auditable** first step.

## What Phase 1 is

- **Rule-driven** — `deriveDealCredibilityPhase1(deal)` in `src/lib/deal-credibility.ts`.
- **Conservative** — we downgrade confidence when price context is incomplete, reviews are thin, images are placeholders, or the seller URL is not a known major retailer pattern.
- **Versioned** — output includes `ruleset_version: "credibility_v1_2026_04"` for future migrations and audits.

## What Phase 1 is not

- Does **not** call external price history APIs or invent “was $X” claims.
- Does **not** use live LLM calls for this strip (existing product copy like `aiReasonToBuy` stays separate).
- Does **not** change ranking, sorting, or database schema.

## Data shape

See `src/types/deal-credibility.ts`:

- `confidence_level`: `high` | `medium` | `low` | `unknown`
- `credibility_signals`: coarse strengths for price, reviews, seller URL, data completeness
- `risk_flags`: e.g. `low_review_count`, `missing_compare_price`, `placeholder_image`, `incomplete_data`, `third_party_risk`
- `explanation_summary`: one short sentence for UI

## UI surface

- **Deal cards** (`DealCard`): compact strip under the title.
- **Deal detail** (`/deals/[slug]`): slightly richer strip with a short disclaimer line.

## Future hooks

Types in `src/lib/deal-credibility-future.ts` sketch **intent**, **feed**, and **audit** integration without implementing them. When you add personalization or logging, thread context through those types instead of forking ad hoc booleans.

## Next steps (suggested)

- Wire optional **audit logging** of `ruleset_version` + flags for ops review.
- Add **A/B** or model-based explanations only when you have real inputs and evaluation.
- Align **search / feed** ranking with credibility as a *feature*, not a replacement for editorial controls.
