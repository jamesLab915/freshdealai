/**
 * Extension points for later layers (intent, feeds, audit). Phase 1 does not invoke these.
 *
 * Implementation notes:
 * - **User intent**: Re-rank or re-explain when search/home context is available.
 * - **Distribution**: Attach credibility to feed slots for transparency exports.
 * - **Audit**: Persist `ruleset_version` + inputs for compliance / human review.
 *
 * @see docs/DEAL_CREDIBILITY_PHASE1.md
 */

import type { DealCredibilityPhase1 } from "@/types/deal-credibility";
import type { DealProduct } from "@/types/deal";

/** Future — session or query context for personalization. */
export type DealCredibilityUserIntentContext = {
  readonly source?: "search" | "home" | "hub" | "direct";
};

/** Future — feed or surface id for distribution pipelines. */
export type DealCredibilityFeedContext = {
  readonly feedId?: string;
};

export type DealCredibilityAuditRecord = {
  dealId: string;
  slug: string;
  ruleset: DealCredibilityPhase1["ruleset_version"];
  confidence: DealCredibilityPhase1["confidence_level"];
  flags: DealCredibilityPhase1["risk_flags"];
  derivedAt: string;
};

/** Future — (deal, cred, intent) → adjusted credibility or ranking weight. */
export type DealCredibilityIntentHook = (
  deal: DealProduct,
  cred: DealCredibilityPhase1,
  ctx?: DealCredibilityUserIntentContext
) => DealCredibilityPhase1;

/** Future — optional audit sink (logging, warehouse, admin). */
export type DealCredibilityAuditSink = (record: DealCredibilityAuditRecord) => void;
