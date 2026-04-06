/**
 * Distribution layer — server-side shapes for digest / alerts / agents (no UI).
 * Wraps `DealCredibilityFeedItemV1` without duplicating credibility rules.
 * @see docs/DISTRIBUTION_LAYER_PHASE1.md
 */

import type { DealCredibilityFeedItemV1 } from "@/types/deal-credibility";

export type DistributionItemType = "deal" | "featured_deal" | "alert_candidate";

/** Where this row was selected (homepage rail, hub collection, etc.). */
export type DistributionSourceBucket =
  | "homepage_featured"
  | "best_deals"
  | `category:${string}`
  | (string & {});

/**
 * One row for outbound pipelines — credibility stays in `credibility` (Phase 2 feed item).
 */
export type DistributionItemV1 = {
  schema_version: "distribution_item_v1";
  item_type: DistributionItemType;
  source_bucket: DistributionSourceBucket;
  /** Absolute URL to the on-site deal page. */
  route_url: string;
  ai_score: number | null;
  /** Canonical Phase 2 feed projection (title, prices, flags, ruleset_version, …). */
  credibility: DealCredibilityFeedItemV1;
};

export type DistributionBundleSummaryV1 = {
  item_count: number;
  by_confidence: Partial<
    Record<DealCredibilityFeedItemV1["confidence_level"], number>
  >;
  by_item_type: Partial<Record<DistributionItemType, number>>;
};

export type DistributionBundleV1 = {
  bundle_version: "distribution_bundle_v1";
  generated_at: string;
  source: "flashdeal_distribution_layer";
  /** Human-readable selection recipe, e.g. `homepage_featured_manual_v1`. */
  strategy: string;
  catalog_source: "database" | "mock";
  items: DistributionItemV1[];
  summary: DistributionBundleSummaryV1;
  warnings: string[];
};

/**
 * Phase 2 — compact row for email / Telegram / daily briefs (derived from distribution items).
 */
export type DigestItemV1 = {
  schema_version: "digest_item_v1";
  slug: string;
  title: string;
  route_url: string;
  current_price: number;
  currency: string;
  discount_percent: number | null;
  confidence_level: DealCredibilityFeedItemV1["confidence_level"];
  explanation_summary: string;
  store_label: string;
  /** Short line, e.g. `Amazon · 42% off`. */
  headline_label: string;
  /** Human-readable “why this line” — mirrors credibility copy for now. */
  primary_reason: string;
  source_bucket: DistributionSourceBucket;
};

export type DigestBundleV1 = {
  schema_version: "digest_bundle_v1";
  projection_version: "digest_v1";
  generated_at: string;
  strategy: string;
  catalog_source: "database" | "mock";
  items: DigestItemV1[];
  summary: { item_count: number };
  warnings: string[];
};
