# User-facing AI value — Phase 1

## Why surface this now

Credibility, distribution, and digest layers already compute **explainable, rule-based** reads ([Deal Credibility Phase 1/2](./DEAL_CREDIBILITY_PHASE2.md), [Distribution](./DISTRIBUTION_LAYER_PHASE2.md)). Phase 1 exposes a **small amount** of that judgment in the UI so visitors see FlashDeal as more than a generic deal grid — without turning the site into a hype machine.

## Where copy comes from

- **Mix summaries** (home featured, list hubs): derived only from `deriveDealCredibilityPhase1` counts per visible deal — no LLM, no external APIs.
- **Detail “what this view uses”**: derived from `deriveDealCredibilityAudit` **evidence** fields (price, reviews, image, retailer pattern) — still deterministic rules from `deal-credibility.ts`.

If we add personalization or generative copy later, it should **extend** these helpers, not replace them silently.

## What we did not do

- No homepage redesign, no new recommendation engine, no new cards.
- No database changes, no mass rewrite of marketing copy.
- No promises like “best on the internet” or guaranteed savings.

## Next steps (suggested)

- **Intent / personalization** — optional second line when search or home context exists.
- **Digest UI** — link “email digest” to sender payloads when product is ready.
- **Alerts UX** — subscribe flows that respect the same credibility flags.
