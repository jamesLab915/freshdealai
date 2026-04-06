/**
 * Intent-aware tie-breakers on top of existing user sort — not a new recommendation engine.
 * @see docs/INTENT_AWARE_RANKING_PHASE1.md
 */

import { slugifyCatalogSegment } from "@/lib/catalog-dimensions";
import { deriveDealCredibilityPhase1 } from "@/lib/deal-credibility";
import type { DealProduct } from "@/types/deal";

export type IntentRankingKind =
  | "generic_text"
  | "structured_brand"
  | "structured_category"
  | "structured_store"
  | "structured_mixed"
  | "none";

export type IntentAwareRankingInput = {
  /** Current explorer sort control */
  sort: string;
  /** Lowercase trimmed query text (may be empty) */
  queryLower: string;
  brandSlug: string;
  categorySlug: string;
  storeSlug: string;
};

function confidenceOrder(deal: DealProduct): number {
  const level = deriveDealCredibilityPhase1(deal).confidence_level;
  const map = { high: 4, medium: 3, unknown: 2, low: 1 } as const;
  return map[level];
}

/**
 * Higher = stronger match to the keyword within an already-filtered list.
 */
export function textMatchTier(deal: DealProduct, qLower: string): number {
  if (!qLower) return 0;
  const brand = deal.brand?.trim();
  if (brand) {
    const bs = slugifyCatalogSegment(brand);
    if (qLower === bs || qLower === brand.toLowerCase()) return 5;
  }
  const t = deal.title.toLowerCase();
  if (t.startsWith(qLower)) return 4;
  if (t.includes(qLower)) return 3;
  if (deal.tags.some((x) => x.toLowerCase().includes(qLower))) return 2;
  if (deal.category?.toLowerCase().includes(qLower)) return 1;
  return 0;
}

export function detectIntentRankingKind(input: IntentAwareRankingInput): IntentRankingKind {
  const b = Boolean(input.brandSlug);
  const c = Boolean(input.categorySlug);
  const s = Boolean(input.storeSlug);
  const n = [b, c, s].filter(Boolean).length;

  if (n >= 2) return "structured_mixed";
  if (b) return "structured_brand";
  if (c) return "structured_category";
  if (s) return "structured_store";
  if (input.queryLower) return "generic_text";
  return "none";
}

function primaryCompare(a: DealProduct, b: DealProduct, sort: string): number {
  if (sort === "newest") {
    return (
      new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
    );
  }
  if (sort === "biggest_drop") {
    return (b.discountPercent ?? 0) - (a.discountPercent ?? 0);
  }
  if (sort === "popularity") {
    return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
  }
  return (b.aiScore ?? 0) - (a.aiScore ?? 0);
}

function secondaryCompare(
  a: DealProduct,
  b: DealProduct,
  qLower: string,
  applyTextTier: boolean
): number {
  if (applyTextTier && qLower) {
    const t = textMatchTier(b, qLower) - textMatchTier(a, qLower);
    if (t !== 0) return t;
  }
  const cred = confidenceOrder(b) - confidenceOrder(a);
  if (cred !== 0) return cred;
  return (b.discountPercent ?? 0) - (a.discountPercent ?? 0);
}

export type IntentAwareRankingResult = {
  deals: DealProduct[];
  rankingNote: string | null;
  kind: IntentRankingKind;
};

/**
 * Stable ordering: keep primary sort key from the user; break ties with text match (when query present),
 * then rule-based confidence, then discount.
 */
export function applyIntentAwareRanking(
  deals: DealProduct[],
  input: IntentAwareRankingInput
): IntentAwareRankingResult {
  if (deals.length <= 1) {
    return {
      deals,
      rankingNote: null,
      kind: detectIntentRankingKind(input),
    };
  }

  const kind = detectIntentRankingKind(input);
  const q = input.queryLower;
  const applyTextTier = Boolean(q);

  const sorted = [...deals].sort((a, b) => {
    const p = primaryCompare(a, b, input.sort);
    if (p !== 0) return p;
    return secondaryCompare(a, b, q, applyTextTier);
  });

  const rankingNote = buildRankingNote(kind, input.sort, applyTextTier);

  return { deals: sorted, rankingNote, kind };
}

function sortLabel(sort: string): string {
  if (sort === "newest") return "recency";
  if (sort === "biggest_drop") return "discount %";
  if (sort === "popularity") return "review volume";
  return "AI score";
}

function buildRankingNote(
  kind: IntentRankingKind,
  sort: string,
  usedTextTier: boolean
): string {
  const primary = sortLabel(sort);
  const tie = usedTextTier
    ? "keyword match strength, then confidence, then discount %."
    : "confidence, then discount %.";

  if (kind === "none") {
    return `Sorted by ${primary}. Tie-breaks: ${tie}`;
  }
  if (kind === "generic_text") {
    return `Sorted by ${primary}. Tie-breaks: ${tie}`;
  }
  if (kind === "structured_mixed") {
    return `Shelf narrowed by filters; sorted by ${primary}. Tie-breaks: ${tie}`;
  }
  return `Filtered shelf; sorted by ${primary}. Tie-breaks: ${tie}`;
}
