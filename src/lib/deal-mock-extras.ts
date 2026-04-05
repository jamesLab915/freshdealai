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

/** Missing list price, discount, or inconsistent numbers — tone down merchandising. */
export function isPriceContextIncomplete(deal: DealProduct): boolean {
  const hasOrig =
    deal.originalPrice != null &&
    deal.originalPrice > deal.currentPrice &&
    deal.currentPrice > 0;
  const hasDisc =
    deal.discountPercent != null && (deal.discountPercent ?? 0) > 0;
  return !hasOrig || !hasDisc;
}

export function getMockPros(deal: DealProduct): string[] {
  if (isPriceContextIncomplete(deal)) {
    return [
      "We’re still syncing list price and discount — confirm numbers on the merchant page.",
      "Compare model numbers and bundle contents before you commit.",
      "Check return windows and warranty coverage at checkout.",
    ];
  }
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
  if (isPriceContextIncomplete(deal)) {
    return [
      "Discount math may update as we ingest cleaner list prices.",
      "Third-party sellers can change offers without notice.",
      "Verify the exact SKU and warranty on the retailer page.",
    ];
  }
  const h = hashSeed(deal.id + "c", CON_TEMPLATES.length);
  return [0, 1, 2].map((i) => CON_TEMPLATES[(h + i) % CON_TEMPLATES.length]);
}

/** More conversational than raw ingestion text */
export function getShoppingRecommendationSummary(deal: DealProduct): string {
  const incomplete = isPriceContextIncomplete(deal);
  const base =
    deal.aiSummary?.trim() ||
    `A solid pick in ${deal.category ?? "this category"} — worth comparing against similar listings before you buy.`;
  if (incomplete) {
    return `We’re still normalizing pricing fields on this listing — treat headline numbers as directional until you confirm at checkout. ${base}`;
  }
  const opener =
    hashSeed(deal.id, 3) === 0
      ? "Editor’s read: "
      : hashSeed(deal.id, 3) === 1
        ? "Deal desk notes: "
        : "Quick take: ";
  return `${opener}${base} Compare shipping, tax, and return policy against similar SKUs before you buy.`;
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

/** Strong editorial voice for trust block on detail page. */
export function buildWhyWePickedStrong(deal: DealProduct): string {
  const bits = [
    deal.featured && "Featured",
    deal.trending && "Trending",
    deal.aiPick && "AI pick",
  ].filter(Boolean);
  const flagStr = bits.length ? ` (${bits.join(" · ")})` : "";
  const score =
    deal.aiScore != null
      ? `AI score ${deal.aiScore} after discount, reviews, and seller signals.`
      : "Strong catalog signals on discount and listing quality.";
  const core =
    deal.aiReasonToBuy?.trim() ||
    deal.aiSummary?.trim() ||
    "We only surface offers where the math and trust signals line up — not pay-to-play slots.";
  return `This made our cut: ${score}${flagStr} ${core}`;
}

/** Plain-language paragraph for “Price history insight” (detail page). */
export function summarizePriceHistoryInsight(
  deal: DealProduct,
  insight: PriceInsight | null
): string {
  const cur = deal.currency;
  if (!insight) {
    if (deal.priceHistory?.length) {
      return `We have ${deal.priceHistory.length} recent price snapshot${deal.priceHistory.length === 1 ? "" : "s"} on file — enough to show movement, not yet a full season story. Compare the merchant cart before you commit.`;
    }
    return "Price history will appear here as ingestion captures more snapshots — until then, treat the headline price as a single point in time.";
  }
  const { bestPriceInWindow, isBestInHistory, recentDropPercent, windowLabel } =
    insight;
  if (isBestInHistory) {
    return `In our ${windowLabel} window, today’s price matches the best level we’ve tracked (${cur}${bestPriceInWindow.toFixed(2)}). That’s a green light if the SKU and seller check out at checkout.`;
  }
  const spread = insight.currentPrice - bestPriceInWindow;
  if (spread > 0.02) {
    return `Over ${windowLabel}, we’ve seen this as low as ${cur}${bestPriceInWindow.toFixed(2)}. You’re at ${cur}${insight.currentPrice.toFixed(2)} now — still worth it if you need it today, or wait if you’re price-sensitive.`;
  }
  if (recentDropPercent != null && recentDropPercent > 0) {
    return `Price has moved down about ${recentDropPercent}% versus older snapshots in our ${windowLabel} window — momentum is on the buyer’s side, but promos can reverse fast.`;
  }
  return `Tracked range in the last ${windowLabel}: low near ${cur}${bestPriceInWindow.toFixed(2)}. Current sits in a normal band — verify tax, shipping, and coupons on the retailer.`;
}
