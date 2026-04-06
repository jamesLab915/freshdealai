/**
 * Short, rule-based copy for surfacing “judgment” without LLM fluff.
 * All strings derive from existing credibility / audit helpers.
 */

import {
  deriveDealCredibilityAudit,
  deriveDealCredibilityPhase1,
} from "@/lib/deal-credibility";
import type { DealProduct } from "@/types/deal";

function countConfidence(deals: DealProduct[]) {
  const counts = { high: 0, medium: 0, low: 0, unknown: 0 };
  for (const d of deals) {
    const level = deriveDealCredibilityPhase1(d).confidence_level;
    counts[level]++;
  }
  return counts;
}

/**
 * Homepage featured row — one line summarizing the current credibility mix.
 */
export function explainFeaturedCredibilityMix(
  deals: DealProduct[]
): string | null {
  if (deals.length === 0) return null;
  const c = countConfidence(deals);
  const n = deals.length;
  const chunks: string[] = [];
  if (c.high > 0) chunks.push(`${c.high} with stronger signals`);
  if (c.medium > 0) chunks.push(`${c.medium} medium`);
  if (c.low + c.unknown > 0) {
    chunks.push(`${c.low + c.unknown} where data is thinner`);
  }
  return `Rule-based credibility for this set: ${chunks.join("; ")} (of ${n} pins). Each card explains its own read — we don’t claim “best on the web.”`;
}

export type ListCredibilityContext = "best_deals" | "category";

/**
 * List hubs — one line after intro, grounded in the visible grid.
 */
export function explainListCredibilityMix(
  deals: DealProduct[],
  context: ListCredibilityContext
): string | null {
  if (deals.length === 0) return null;
  const c = countConfidence(deals);
  const n = deals.length;
  const strong = c.high + c.medium;
  const thin = c.low + c.unknown;
  const scope =
    context === "best_deals"
      ? "this shelf"
      : "this category list";
  return `For ${scope}, our rules rate ${strong} of ${n} deals as medium-or-better confidence and ${thin} with more caveats — open a card for the full strip.`;
}

/**
 * Detail page — what inputs fed the strip (no new claims).
 */
export function explainCredibilityBasisLine(deal: DealProduct): string {
  const audit = deriveDealCredibilityAudit(deal);
  const e = audit.evidence;
  const hints: string[] = [];
  if (
    e.original_price != null &&
    e.current_price > 0 &&
    e.discount_percent != null
  ) {
    hints.push("discount vs compare price");
  } else if (e.discount_percent != null) {
    hints.push("discount signal");
  }
  if (e.review_count != null && e.review_count >= 50) {
    hints.push("review depth");
  } else if (e.review_count != null && e.review_count > 0) {
    hints.push("limited reviews");
  } else {
    hints.push("sparse or missing reviews");
  }
  if (e.image_is_placeholder) {
    hints.push("incomplete product image");
  } else {
    hints.push("listing presentation");
  }
  hints.push(`${e.store_label} URL pattern`);
  const basis = hints.slice(0, 4).join(", ");
  return `What this view uses: ${basis}. Same rules as elsewhere on FlashDeal — not a personalized prediction.`;
}
