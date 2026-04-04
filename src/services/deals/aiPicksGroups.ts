import type { DealProduct } from "@/types/deal";

export type AiPicksGroups = {
  bestValue: DealProduct[];
  trending: DealProduct[];
  premium: DealProduct[];
};

/** Same grouping rules as the /ai-picks page (deterministic, mock-safe). */
export function buildAiPicksGroups(deals: DealProduct[]): AiPicksGroups {
  const sorted = [...deals].sort(
    (a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0)
  );

  let bestValue = sorted.filter(
    (d) => (d.discountPercent ?? 0) >= 18 && (d.aiScore ?? 0) >= 76
  );
  if (bestValue.length < 4) {
    bestValue = sorted.filter((d) => (d.discountPercent ?? 0) >= 15);
  }
  bestValue = bestValue.slice(0, 12);

  const trending = [...deals]
    .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    .slice(0, 12);

  let premium = sorted.filter(
    (d) => (d.aiScore ?? 0) >= 88 || d.currentPrice >= 120
  );
  if (premium.length < 4) {
    premium = sorted.slice(0, 12);
  } else {
    premium = premium.slice(0, 12);
  }

  return { bestValue, trending, premium };
}
