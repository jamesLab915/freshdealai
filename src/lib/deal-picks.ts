import { isPriceContextIncomplete } from "@/lib/deal-mock-extras";
import { isPrimaryShelfAmazonDeal } from "@/lib/deal-shelf-eligibility";
import { sortDealsForHub } from "@/lib/deal-sorting";
import { isPlaceholderProductImage } from "@/lib/product-image";
import type { DealProduct } from "@/types/deal";

function withoutIds(
  deals: DealProduct[],
  exclude: Set<string> | undefined
): DealProduct[] {
  if (!exclude?.size) return deals;
  return deals.filter((d) => !exclude.has(d.id));
}

/**
 * Homepage “Featured” rail — manual `homepageRank`, then flags, then AI score.
 */
export function pickFeaturedRail(deals: DealProduct[], limit: number): DealProduct[] {
  return sortDealsForHub(deals, "home", { tieBreak: "ai_score" }).slice(0, limit);
}

/**
 * Homepage first row: **only** deals with `homepageRank` set (human-curated).
 * Excludes incomplete price context (no list/discount signal), non-Amazon-DP URLs,
 * and URLs containing `example` (see `isPrimaryShelfAmazonDeal`). Shows fewer than
 * `max` when pins are missing — no algorithmic filler. See AGENTS.md.
 * Omits placeholder-only art so the first row prefers real cached images (may show fewer than max).
 */
export function pickHomepageFeaturedManualOnly(
  deals: DealProduct[],
  max: number
): DealProduct[] {
  const pool = deals.filter(
    (d) =>
      d.published &&
      !d.excludeFromHubs &&
      !isPriceContextIncomplete(d) &&
      isPrimaryShelfAmazonDeal(d) &&
      !isPlaceholderProductImage(d.imageUrl) &&
      d.homepageRank != null &&
      Number.isFinite(d.homepageRank)
  );
  pool.sort((a, b) => (a.homepageRank ?? 0) - (b.homepageRank ?? 0));
  return pool.slice(0, max);
}

/** Trending rail — same rank/flags, newest as final tie-break. */
export function pickTrendingRail(
  deals: DealProduct[],
  limit: number,
  options?: { excludeProductIds?: Set<string> }
): DealProduct[] {
  const pool = withoutIds(deals, options?.excludeProductIds);
  return sortDealsForHub(pool, "home", { tieBreak: "newest" }).slice(0, limit);
}

/** AI picks rail — rank/flags, then AI score tie-break. */
export function pickAiPicksRail(
  deals: DealProduct[],
  limit: number,
  options?: { excludeProductIds?: Set<string> }
): DealProduct[] {
  const pool = withoutIds(deals, options?.excludeProductIds);
  return sortDealsForHub(pool, "home", { tieBreak: "ai_score" }).slice(0, limit);
}
