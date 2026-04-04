import type { DealProduct } from "@/types/deal";

/** Deterministic 0..n-1 from deal id */
export function hashSeed(id: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % modulo;
}

export type DealCardExtras = {
  badges: string[];
  urgency: "expiring" | "limited" | null;
  socialLine: string;
};

export function getDealCardExtras(deal: DealProduct): DealCardExtras {
  const h = hashSeed(deal.id, 1_000_000);
  const badges: string[] = [];
  if ((deal.aiScore ?? 0) >= 87) badges.push("AI Pick");
  if ((deal.discountPercent ?? 0) >= 20 && (deal.aiScore ?? 0) >= 78) {
    badges.push("Best Value");
  }
  if (h % 10 < 4) badges.push("Trending");
  const seen = new Set<string>();
  const unique = badges.filter((b) => (seen.has(b) ? false : (seen.add(b), true)));

  const urgency =
    h % 7 === 0 ? "expiring" : h % 7 === 1 ? "limited" : null;
  const viewing = 18 + (h % 312);
  const clicks = 6 + (h % 48);
  const socialLine =
    h % 2 === 0
      ? `${viewing} people viewing`
      : `${clicks} shoppers clicked today`;

  return { badges: unique.slice(0, 3), urgency, socialLine };
}

const PRO_TEMPLATES = [
  "Strong discount vs. typical street price for this SKU.",
  "Solid review volume — less guesswork than niche listings.",
  "Ships from a major retailer with familiar return policies.",
  "Specs line up well with what we expect at this price band.",
  "Bundle or accessory value makes the total package compelling.",
];

const CON_TEMPLATES = [
  "Discounts can change quickly — double-check before checkout.",
  "Compare warranty and seller if gray-market pricing appears.",
  "May not be the newest generation — verify model year.",
  "Accessory or color bundles can shift the effective price.",
  "Peak season demand can affect stock and delivery windows.",
];

export function getMockPros(deal: DealProduct): string[] {
  const h = hashSeed(deal.id + "p", PRO_TEMPLATES.length);
  const line0 = deal.aiReasonToBuy?.trim()
    ? deal.aiReasonToBuy.trim().slice(0, 160) +
      (deal.aiReasonToBuy.length > 160 ? "…" : "")
    : PRO_TEMPLATES[h % PRO_TEMPLATES.length];
  return [
    line0,
    PRO_TEMPLATES[(h + 1) % PRO_TEMPLATES.length],
    PRO_TEMPLATES[(h + 2) % PRO_TEMPLATES.length],
  ];
}

export function getMockCons(deal: DealProduct): string[] {
  const h = hashSeed(deal.id + "c", CON_TEMPLATES.length);
  return [0, 1, 2].map((i) => CON_TEMPLATES[(h + i) % CON_TEMPLATES.length]);
}

/** More conversational than raw ingestion text */
export function getShoppingRecommendationSummary(deal: DealProduct): string {
  const base =
    deal.aiSummary?.trim() ||
    `A solid pick in ${deal.category ?? "this category"} — worth comparing against similar listings before you buy.`;
  const opener =
    hashSeed(deal.id, 3) === 0
      ? "Here's what stands out for shoppers right now: "
      : hashSeed(deal.id, 3) === 1
        ? "If you're comparing options this week: "
        : "Worth a look because ";
  return `${opener}${base}`;
}

export type WhyPickKind = "value" | "trending" | "premium";

export function getWhyAiPicked(deal: DealProduct, kind: WhyPickKind): string {
  const score = deal.aiScore ?? 0;
  const disc = deal.discountPercent ?? 0;
  const rev = deal.reviewCount ?? 0;
  switch (kind) {
    case "value":
      return `AI highlights strong value: ${disc}% off with a ${score} confidence score and enough reviews (${rev ? rev.toLocaleString() : "limited"}) to trust the signal.`;
    case "trending":
      return `Trending now — high shopper interest and recent activity on this listing; score ${score} after discount and review checks.`;
    case "premium":
      return `Premium pick — top-tier AI score (${score}) for quality signals and seller reliability at this price level.`;
    default:
      return `Score ${score} after comparing discount depth and review signals.`;
  }
}

export type PriceInsight = {
  bestPriceInWindow: number;
  currentPrice: number;
  /** % drop from oldest snapshot to newest in history (if applicable) */
  recentDropPercent: number | null;
  isBestInHistory: boolean;
  windowLabel: string;
};

export function getPriceInsights(deal: DealProduct): PriceInsight | null {
  const h = deal.priceHistory;
  if (!h?.length) return null;
  const prices = h.map((x) => x.price);
  const minP = Math.min(...prices);
  const newest = h[0].price;
  const oldest = h[h.length - 1].price;
  const recentDropPercent =
    oldest > newest ? Math.round(((oldest - newest) / oldest) * 100) : null;
  const isBestInHistory = newest <= minP + 0.005;
  return {
    bestPriceInWindow: minP,
    currentPrice: newest,
    recentDropPercent,
    isBestInHistory,
    windowLabel: "30 days",
  };
}
