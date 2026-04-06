/**
 * Digest-ready projections — thin layer on top of `DistributionBundleV1` (no new ranking).
 */
import type { DealCredibilityFeedItemV1 } from "@/types/deal-credibility";
import type {
  DigestBundleV1,
  DigestItemV1,
  DistributionBundleV1,
  DistributionItemV1,
} from "@/types/distribution";

function headlineFromCredibility(c: DealCredibilityFeedItemV1): string {
  const store = c.store_label;
  const d = c.discount_percent;
  if (d != null && d > 0) return `${store} · ${Math.round(d)}% off`;
  return store;
}

export function toDigestItemV1(item: DistributionItemV1): DigestItemV1 {
  const c = item.credibility;
  return {
    schema_version: "digest_item_v1",
    slug: c.slug,
    title: c.title,
    route_url: item.route_url,
    current_price: c.current_price,
    currency: c.currency,
    discount_percent: c.discount_percent,
    confidence_level: c.confidence_level,
    explanation_summary: c.explanation_summary,
    store_label: c.store_label,
    headline_label: headlineFromCredibility(c),
    primary_reason: c.explanation_summary,
    source_bucket: item.source_bucket,
  };
}

export function toDigestBundleV1(bundle: DistributionBundleV1): DigestBundleV1 {
  return {
    schema_version: "digest_bundle_v1",
    projection_version: "digest_v1",
    generated_at: bundle.generated_at,
    strategy: bundle.strategy,
    catalog_source: bundle.catalog_source,
    items: bundle.items.map(toDigestItemV1),
    summary: { item_count: bundle.items.length },
    warnings: bundle.warnings,
  };
}
