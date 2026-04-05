import { isPrimaryShelfAmazonDeal } from "@/lib/deal-shelf-eligibility";
import { isPlaceholderProductImage } from "@/lib/product-image";
import type { DealProduct } from "@/types/deal";

/** Hub / rail ordering context — maps to `homepageRank` | `bestDealsRank` | `top10Rank`. */
export type HubRankMode = "home" | "best_deals" | "top10";

function rankFor(d: DealProduct, mode: HubRankMode): number | null {
  switch (mode) {
    case "home":
      return d.homepageRank ?? null;
    case "best_deals":
      return d.bestDealsRank ?? null;
    case "top10":
      return d.top10Rank ?? null;
    default:
      return null;
  }
}

/** Higher = more editorial weight (featured > trending > ai pick). */
function flagScore(d: DealProduct): number {
  return (d.featured ? 100 : 0) + (d.trending ? 50 : 0) + (d.aiPick ? 25 : 0);
}

function compareHub(
  a: DealProduct,
  b: DealProduct,
  mode: HubRankMode,
  tieBreak: "ai_score" | "newest"
): number {
  if (mode === "best_deals") {
    const aPh = isPlaceholderProductImage(a.imageUrl);
    const bPh = isPlaceholderProductImage(b.imageUrl);
    if (!aPh && bPh) return -1;
    if (aPh && !bPh) return 1;
  }

  const ar = rankFor(a, mode);
  const br = rankFor(b, mode);
  if (ar != null && br != null && ar !== br) return ar - br;
  if (ar != null && br == null) return -1;
  if (ar == null && br != null) return 1;
  const fs = flagScore(b) - flagScore(a);
  if (fs !== 0) return fs;
  if (tieBreak === "newest") {
    return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
  }
  return (b.aiScore ?? 0) - (a.aiScore ?? 0);
}

export type HubSortOptions = {
  /** Final tie-break when rank and flags match. */
  tieBreak?: "ai_score" | "newest";
};

/**
 * Published deals, excluding hub-suppressed rows, ordered by:
 * manual rank → featured/trending/ai_pick → AI score or recency.
 */
export function sortDealsForHub(
  deals: DealProduct[],
  mode: HubRankMode,
  options?: HubSortOptions
): DealProduct[] {
  const tie = options?.tieBreak ?? "ai_score";
  const pool = deals.filter(
    (d) =>
      d.published &&
      !d.excludeFromHubs &&
      isPrimaryShelfAmazonDeal(d)
  );
  return [...pool].sort((a, b) => compareHub(a, b, mode, tie));
}
