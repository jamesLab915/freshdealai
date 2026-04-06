/**
 * Extension points for later layers (intent, feeds, audit). Phase 1 UI does not invoke these.
 *
 * Implementation notes:
 * - **User intent**: Re-rank or re-explain when search/home context is available.
 * - **Distribution**: Attach credibility to feed slots for transparency exports (`toDealCredibilityFeedItem`).
 * - **Audit**: Use `deriveDealCredibilityAudit` for full payloads; this file’s `DealCredibilityAuditRecord` stays a minimal sink shape.
 *
 * @see docs/DEAL_CREDIBILITY_PHASE1.md
 * @see docs/DEAL_CREDIBILITY_PHASE2.md
 */

import type { DealCredibilityAuditV1, DealCredibilityPhase1 } from "@/types/deal-credibility";
import type { DealProduct } from "@/types/deal";

/** Future — session or query context for personalization. */
export type DealCredibilityUserIntentContext = {
  readonly source?: "search" | "home" | "hub" | "direct";
};

/** Future — feed or surface id for distribution pipelines. */
export type DealCredibilityFeedContext = {
  readonly feedId?: string;
};

/** Minimal row for a future audit sink (DB, queue, warehouse). */
export type DealCredibilityAuditRecord = {
  dealId: string;
  slug: string;
  ruleset: DealCredibilityPhase1["ruleset_version"];
  confidence: DealCredibilityPhase1["confidence_level"];
  flags: DealCredibilityPhase1["risk_flags"];
  derivedAt: string;
};

/** Map full Phase 2 audit to the slim record shape (optional persistence layer). */
export function dealCredibilityAuditToRecord(
  audit: DealCredibilityAuditV1
): DealCredibilityAuditRecord {
  return {
    dealId: audit.deal_id,
    slug: audit.deal_slug,
    ruleset: audit.ruleset_version,
    confidence: audit.confidence_level,
    flags: audit.risk_flags,
    derivedAt: audit.derived_at,
  };
}

/** Future — (deal, cred, intent) → adjusted credibility or ranking weight. */
export type DealCredibilityIntentHook = (
  deal: DealProduct,
  cred: DealCredibilityPhase1,
  ctx?: DealCredibilityUserIntentContext
) => DealCredibilityPhase1;

/** Future — optional audit sink (logging, warehouse, admin). */
export type DealCredibilityAuditSink = (record: DealCredibilityAuditRecord) => void;
