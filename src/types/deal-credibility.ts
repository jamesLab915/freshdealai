/**
 * Phase 1 credibility — derived only from existing `DealProduct` fields (no DB columns).
 * @see docs/DEAL_CREDIBILITY_PHASE1.md
 */

export type DealConfidenceLevel = "high" | "medium" | "low" | "unknown";

/** Coarse signal strength for audit/debug (not shown verbatim to users by default). */
export type CredibilitySignalStrength =
  | "strong"
  | "moderate"
  | "weak"
  | "unknown";

export type CredibilitySignalsPhase1 = {
  price_signal: CredibilitySignalStrength;
  review_signal: CredibilitySignalStrength;
  seller_signal: CredibilitySignalStrength;
  data_completeness_signal: CredibilitySignalStrength;
};

/** Conservative, enumerable flags — only what we can justify from current data. */
export type DealCredibilityRiskFlag =
  | "low_review_count"
  | "missing_compare_price"
  | "placeholder_image"
  | "incomplete_data"
  | "third_party_risk";

export type DealCredibilityPhase1 = {
  confidence_level: DealConfidenceLevel;
  credibility_signals: CredibilitySignalsPhase1;
  risk_flags: DealCredibilityRiskFlag[];
  /** Single short line for cards / detail strip. */
  explanation_summary: string;
  /** Rule set id for audits and future migrations. */
  ruleset_version: "credibility_v1_2026_04";
};

/**
 * Phase 2 — input evidence snapshot for audits (derived from `DealProduct`, no DB columns).
 * Stable field names for machine-readable logs; not a UI copy object.
 */
export type DealCredibilityEvidenceSnapshot = {
  rating: number | null;
  review_count: number | null;
  current_price: number;
  currency: string;
  original_price: number | null;
  discount_percent: number | null;
  image_present: boolean;
  image_is_placeholder: boolean;
  store_label: string;
  product_url: string;
};

/**
 * Full auditable payload: Phase 1 outcome + evidence + ids + timestamp.
 * Separate from `DealCredibilityPhase1` so UI stays on the small object only.
 */
export type DealCredibilityAuditV1 = {
  schema_version: "deal_credibility_audit_v1";
  ruleset_version: DealCredibilityPhase1["ruleset_version"];
  deal_id: string;
  deal_slug: string;
  derived_at: string;
  confidence_level: DealConfidenceLevel;
  credibility_signals: CredibilitySignalsPhase1;
  risk_flags: DealCredibilityRiskFlag[];
  explanation_summary: string;
  evidence: DealCredibilityEvidenceSnapshot;
};

/**
 * Feed / digest / agent-oriented projection (decoupled from React components).
 */
export type DealCredibilityFeedItemV1 = {
  schema_version: "deal_credibility_feed_v1";
  ruleset_version: DealCredibilityPhase1["ruleset_version"];
  deal_id: string;
  slug: string;
  title: string;
  current_price: number;
  currency: string;
  discount_percent: number | null;
  confidence_level: DealConfidenceLevel;
  explanation_summary: string;
  risk_flags: DealCredibilityRiskFlag[];
  /** Catalog source (e.g. importer id). */
  source: string;
  store_label: string;
  product_url: string;
  derived_at: string;
};
