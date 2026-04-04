import { track } from "@/lib/tracking";

/** Encodes outbound URL for `/out` redirect (always https from merchant). */
export function buildOutboundPath(absoluteUrl: string): string {
  return `/out?u=${encodeURIComponent(absoluteUrl)}`;
}

/**
 * Resolved monetization URL: dedicated `affiliate_url` when present, else `product_url`.
 * All user-facing CTAs must use this (never raw product link alone when affiliate exists).
 */
export function resolveAffiliateUrl(deal: {
  affiliateUrl: string | null | undefined;
  productUrl: string;
}): string {
  const aff = deal.affiliateUrl?.trim() ?? "";
  const prod = deal.productUrl.trim();
  return aff || prod;
}

export type AffiliateClickPayload = {
  surface: "deal_card" | "deal_detail_desktop" | "deal_detail_sticky";
  dealId?: string;
  slug?: string;
  destination: string;
};

/** Delegates to `track()` — see `src/lib/tracking.ts` */
export function recordAffiliateClick(payload: AffiliateClickPayload): void {
  if (typeof window === "undefined") return;
  track({
    type: "affiliate_click",
    surface: payload.surface,
    dealId: payload.dealId,
    slug: payload.slug,
  });
}

export function isAmazonOutbound(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return h.includes("amazon.") || h === "a.co" || h.includes("amzn.");
  } catch {
    return false;
  }
}

/** Primary CTA label on detail / sticky bar */
export function primaryDealCtaLabel(resolvedUrl: string): string {
  return isAmazonOutbound(resolvedUrl) ? "Get Deal on Amazon" : "View Deal";
}
