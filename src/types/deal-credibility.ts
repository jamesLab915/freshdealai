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
