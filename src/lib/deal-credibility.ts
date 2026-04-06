import { isPriceContextIncomplete } from "@/lib/deal-mock-extras";
import { isPlaceholderProductImage } from "@/lib/product-image";
import type {
  CredibilitySignalStrength,
  CredibilitySignalsPhase1,
  DealConfidenceLevel,
  DealCredibilityPhase1,
  DealCredibilityRiskFlag,
} from "@/types/deal-credibility";
import type { DealProduct } from "@/types/deal";

function isAmazonDp(url: string): boolean {
  return url.toLowerCase().includes("amazon.com/dp/");
}

function sellerSignal(deal: DealProduct): CredibilitySignalStrength {
  const u = deal.productUrl?.trim() ?? "";
  if (!u) return "unknown";
  if (isAmazonDp(u)) return "strong";
  const low = u.toLowerCase();
  if (
    low.includes("bestbuy.com") ||
    low.includes("target.com") ||
    low.includes("walmart.com") ||
    low.includes("nike.com") ||
    low.includes("rei.com")
  ) {
    return "moderate";
  }
  if (low.includes("http")) return "weak";
  return "unknown";
}

function priceSignal(deal: DealProduct): CredibilitySignalStrength {
  if (isPriceContextIncomplete(deal)) return "weak";
  const d = deal.discountPercent ?? 0;
  if (d < 5 || d > 92) return "weak";
  return "strong";
}

function reviewSignal(deal: DealProduct): CredibilitySignalStrength {
  const rc = deal.reviewCount ?? null;
  const rt = deal.rating != null ? Number(deal.rating) : null;
  if (rc != null && rc >= 500 && rt != null && rt >= 4.0) return "strong";
  if (rc != null && rc >= 50 && rt != null && rt >= 3.5) return "moderate";
  if (rc != null && rc > 0) return "weak";
  return "unknown";
}

function dataCompletenessSignal(deal: DealProduct): CredibilitySignalStrength {
  const hasTitle = Boolean(deal.title?.trim());
  const hasPrice = deal.currentPrice > 0;
  const imgOk = !isPlaceholderProductImage(deal.imageUrl);
  const meta =
    (deal.brand?.trim() ? 1 : 0) + (deal.category?.trim() ? 1 : 0);
  if (hasTitle && hasPrice && imgOk && meta >= 1) return "strong";
  if (hasTitle && hasPrice && imgOk) return "moderate";
  if (hasTitle && hasPrice) return "weak";
  return "unknown";
}

function collectRiskFlags(deal: DealProduct): DealCredibilityRiskFlag[] {
  const out: DealCredibilityRiskFlag[] = [];
  const rc = deal.reviewCount ?? 0;

  if (isPlaceholderProductImage(deal.imageUrl)) {
    out.push("placeholder_image");
  }
  if (isPriceContextIncomplete(deal)) {
    out.push("incomplete_data");
  }
  const hasOrig =
    deal.originalPrice != null &&
    deal.originalPrice > deal.currentPrice &&
    deal.currentPrice > 0;
  if (!hasOrig) {
    out.push("missing_compare_price");
  }

  if (deal.reviewCount == null || rc < 50) {
    out.push("low_review_count");
  }

  if (!isAmazonDp(deal.productUrl) && sellerSignal(deal) === "weak") {
    out.push("third_party_risk");
  }

  return [...new Set(out)];
}

function pickConfidence(
  signals: CredibilitySignalsPhase1,
  flags: DealCredibilityRiskFlag[]
): DealConfidenceLevel {
  const heavy =
    flags.includes("placeholder_image") ||
    flags.includes("incomplete_data") ||
    flags.filter((f) => f !== "third_party_risk").length >= 3;

  if (heavy) return "low";

  const strongPrice = signals.price_signal === "strong";
  const strongReview = signals.review_signal === "strong";
  const strongSeller = signals.seller_signal === "strong";
  const dataOk = signals.data_completeness_signal !== "weak";

  if (strongPrice && (strongReview || (strongSeller && dataOk))) {
    if (!flags.includes("placeholder_image") && !flags.includes("incomplete_data")) {
      return "high";
    }
  }

  if (signals.review_signal === "unknown" && signals.price_signal === "weak") {
    return "unknown";
  }

  if (flags.length >= 2) return "low";
  return "medium";
}

function buildSummary(
  level: DealConfidenceLevel,
  signals: CredibilitySignalsPhase1,
  flags: DealCredibilityRiskFlag[]
): string {
  if (level === "high") {
    return "Strong discount context with solid listing signals — still verify at checkout.";
  }
  if (level === "unknown") {
    return "Basic listing coverage; confidence stays limited until more signals arrive.";
  }
  if (level === "low") {
    if (flags.includes("incomplete_data")) {
      return "Attractive headline, but price evidence is thin — confirm list price on the retailer.";
    }
    if (flags.includes("placeholder_image")) {
      return "Deal looks interesting, but image/listing data is incomplete — double-check before you buy.";
    }
    return "Mixed signals — we show this for discovery, not as a guarantee.";
  }
  // medium
  if (signals.review_signal === "moderate" || signals.review_signal === "strong") {
    return "Reasonable discount with review backup — worth a closer look on the store page.";
  }
  if (signals.price_signal === "strong") {
    return "Discount signal is clear; reviews are thinner — read recent seller feedback.";
  }
  return "Moderate confidence from available data — always confirm price and seller on site.";
}

/**
 * Deterministic, conservative credibility from existing deal fields.
 * Does not call external APIs or invent price history.
 */
export function deriveDealCredibilityPhase1(deal: DealProduct): DealCredibilityPhase1 {
  const credibility_signals: CredibilitySignalsPhase1 = {
    price_signal: priceSignal(deal),
    review_signal: reviewSignal(deal),
    seller_signal: sellerSignal(deal),
    data_completeness_signal: dataCompletenessSignal(deal),
  };

  const risk_flags = collectRiskFlags(deal);
  const confidence_level = pickConfidence(credibility_signals, risk_flags);
  const explanation_summary = buildSummary(
    confidence_level,
    credibility_signals,
    risk_flags
  );

  return {
    confidence_level,
    credibility_signals,
    risk_flags,
    explanation_summary,
    ruleset_version: "credibility_v1_2026_04",
  };
}
