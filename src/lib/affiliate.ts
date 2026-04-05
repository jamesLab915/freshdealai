import { track } from "@/lib/tracking";

/** Encodes outbound URL for `/out` redirect (always https from merchant). */
export function buildOutboundPath(absoluteUrl: string): string {
  return `/out?u=${encodeURIComponent(absoluteUrl)}`;
}

/**
 * Append affiliate parameters before exit tracking (Amazon Associates tag, etc.).
 */
export function applyAffiliateTags(absoluteUrl: string): string {
  try {
    const u = new URL(absoluteUrl);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");

    if (host.includes("amazon.") || host === "a.co" || host.includes("amzn.")) {
      const tag = process.env.AMAZON_ASSOCIATE_TAG?.trim();
      if (tag) {
        u.searchParams.set("tag", tag);
      }
      return u.toString();
    }

    if (host.includes("walmart.com")) {
      const w = process.env.WALMART_AFFILIATE_PARAM?.trim();
      if (w) {
        const [k, v] = w.split("=");
        if (k && v) u.searchParams.set(k, v);
      }
      return u.toString();
    }
  } catch {
    return absoluteUrl;
  }
  return absoluteUrl;
}

/** Applies retailer tags, then wraps in `/out` for analytics-safe redirects. */
export function buildMonetizedOutboundPath(
  absoluteUrl: string,
  dealId?: string
): string {
  const u = applyAffiliateTags(absoluteUrl);
  const base = buildOutboundPath(u);
  if (!dealId?.trim()) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}deal=${encodeURIComponent(dealId.trim())}`;
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
