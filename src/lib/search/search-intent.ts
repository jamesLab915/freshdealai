/**
 * Rule-based search intent — aligned with catalog slugs (`slugifyCatalogSegment`, live brand/category lists).
 * No LLM; shared by URL validation and `parseSearchQuery` rules fallback.
 */

import { slugifyCatalogSegment } from "@/lib/catalog-dimensions";
import { STORE_SLUG_HOSTS } from "@/lib/store-utils";
import type { BrandMeta, CategoryMeta, StoreMeta } from "@/types/deal";

export type NumericQueryHints = {
  maxPrice: number | null;
  minDiscount: number | null;
};

export function extractNumericHintsFromQuery(queryLower: string): NumericQueryHints {
  let maxPrice: number | null = null;
  const under = queryLower.match(
    /\b(?:under|below|less than|cheaper than)\s+\$?\s*(\d{1,6})\b/
  );
  if (under) maxPrice = Number(under[1]);

  let minDiscount: number | null = null;
  const pct = queryLower.match(/\b(\d{1,2})\s*%\s*(?:off|discount|\+)/);
  if (pct) minDiscount = Number(pct[1]);
  const atLeast = queryLower.match(/\b(?:at least|minimum)\s+(\d{1,2})\s*%/);
  if (atLeast) minDiscount = Number(atLeast[1]);

  return { maxPrice, minDiscount };
}

/** True when `storeSlug` is a known storefront key (same as repository / filters). */
export function isKnownStoreSlug(storeSlug: string): boolean {
  return Boolean(storeSlug && storeSlug in STORE_SLUG_HOSTS);
}

export function matchBrandSlugFromQueryText(
  queryLower: string,
  brands: BrandMeta[]
): string | null {
  for (const b of brands) {
    const name = b.name.toLowerCase();
    const slugWords = b.slug.replace(/-/g, " ");
    if (
      queryLower.includes(name) ||
      queryLower.includes(slugWords) ||
      queryLower === b.slug
    ) {
      return b.slug;
    }
  }
  return null;
}

export function matchCategorySlugFromQueryText(
  queryLower: string,
  categories: CategoryMeta[]
): string | null {
  for (const c of categories) {
    const name = c.name.toLowerCase();
    const slugWords = c.slug.replace(/-/g, " ");
    if (
      queryLower.includes(name) ||
      queryLower.includes(slugWords) ||
      queryLower === c.slug
    ) {
      return c.slug;
    }
  }
  return null;
}

/** Category hints when the query names a product type but not the hub name. */
export function categorySlugFromProductHints(queryLower: string): string | null {
  const catHints: [RegExp, string][] = [
    [/\b(laptop|chromebook|gpu|monitor|headphone|earbud|tablet|phone)\b/i, "electronics"],
    [/\b(skincare|makeup|serum|moisturizer)\b/i, "fashion"],
    [/\b(sneaker|shoe|apparel|jacket|jeans)\b/i, "fashion"],
    [/\b(cookware|air fryer|blender|kitchen)\b/i, "home-kitchen"],
    [/\b(gym|fitness|protein|wearable|watch)\b/i, "health-fitness"],
    [/\b(camping|hiking|tent|outdoor)\b/i, "outdoor"],
  ];
  for (const [re, slug] of catHints) {
    if (re.test(queryLower)) return slug;
  }
  return null;
}

export function matchStoreSlugFromQueryText(
  queryLower: string,
  stores: StoreMeta[]
): string | null {
  for (const s of stores) {
    const name = s.name.toLowerCase();
    const domainBase = s.domain.split(".")[0]?.toLowerCase() ?? "";
    if (
      queryLower.includes(name) ||
      (domainBase && queryLower.includes(domainBase))
    ) {
      return s.slug;
    }
  }
  return null;
}

export type UrlFilterValidity = {
  brandValid: boolean;
  categoryValid: boolean;
  storeValid: boolean;
  hasUnknownStructuredFilter: boolean;
};

/**
 * URL params must reference known catalog slugs — otherwise we treat as invalid (no silent widening).
 */
export function validateSearchUrlFilters(
  brandSlug: string,
  categorySlug: string,
  storeSlug: string,
  brands: BrandMeta[],
  categories: CategoryMeta[]
): UrlFilterValidity {
  const brandValid =
    !brandSlug || brands.some((b) => b.slug === brandSlug);
  const categoryValid =
    !categorySlug || categories.some((c) => c.slug === categorySlug);
  const storeValid = !storeSlug || isKnownStoreSlug(storeSlug);
  const hasUnknownStructuredFilter =
    Boolean(brandSlug && !brandValid) ||
    Boolean(categorySlug && !categoryValid) ||
    Boolean(storeSlug && !storeValid);

  return {
    brandValid,
    categoryValid,
    storeValid,
    hasUnknownStructuredFilter,
  };
}

export type SearchIntentExplanationParts = {
  q: string;
  brandSlug: string;
  categorySlug: string;
  storeSlug: string;
  sort: string;
  validity: UrlFilterValidity;
};

/** One-line copy for the search UI — rules-only, no generative claims. */
export function formatSearchIntentExplanation(
  parts: SearchIntentExplanationParts,
  brands: BrandMeta[],
  categories: CategoryMeta[],
  stores: StoreMeta[]
): string | null {
  const { validity, q, brandSlug, categorySlug, storeSlug, sort } = parts;

  if (validity.hasUnknownStructuredFilter) {
    const reasons: string[] = [];
    if (brandSlug && !validity.brandValid) {
      reasons.push(
        `the brand filter “${brandSlug}” is not in the current catalog`
      );
    }
    if (categorySlug && !validity.categoryValid) {
      reasons.push(
        `the category filter “${categorySlug}” is not in the current catalog`
      );
    }
    if (storeSlug && !validity.storeValid) {
      reasons.push(
        `the store filter “${storeSlug}” is not a supported storefront slug`
      );
    }
    return `Showing no results: ${reasons.join("; ")}. Pick a value from the filters or clear the URL.`;
  }

  const bits: string[] = [];
  const qt = q.trim();
  if (qt) bits.push(`text match on title, brand, tags, or category (“${qt}”)`);
  if (brandSlug) {
    const name = brands.find((b) => b.slug === brandSlug)?.name ?? brandSlug;
    bits.push(`brand shelf: ${name}`);
  }
  if (categorySlug) {
    const name =
      categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug;
    bits.push(`category: ${name}`);
  }
  if (storeSlug) {
    const name = stores.find((s) => s.slug === storeSlug)?.name ?? storeSlug;
    bits.push(`store: ${name}`);
  }
  if (sort && sort !== "ai_score") bits.push(`sort: ${sort.replace(/_/g, " ")}`);

  if (bits.length === 0) return null;
  return `How we’re applying this search: ${bits.join(" · ")} — rule-based filters on the same catalog as the rest of the site.`;
}

/** Slug consistency helper for comparing deal.category to filter slug. */
export function categoryNameToSlug(name: string): string {
  return slugifyCatalogSegment(name);
}
