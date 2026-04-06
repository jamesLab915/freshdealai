import { mockBrands, mockCategories, mockStores } from "@/lib/mock-deals";
import {
  categorySlugFromProductHints,
  extractNumericHintsFromQuery,
  matchBrandSlugFromQueryText,
  matchCategorySlugFromQueryText,
  matchStoreSlugFromQueryText,
} from "@/lib/search/search-intent";
import { AI_TASK_TIERS, runResponsesJsonWithFallback } from "@/services/ai/client";
import { SCHEMA_SEARCH_NL } from "@/services/ai/schemas";
import type { BrandMeta, CategoryMeta, StoreMeta } from "@/types/deal";

export type SearchQueryUnderstanding = {
  brand: string | null;
  /** Category slug when mappable (e.g. `electronics`). */
  category: string | null;
  /** Store slug when query names a retailer (aligned with `STORE_SLUG_HOSTS`). */
  store: string | null;
  maxPrice: number | null;
  minDiscount: number | null;
  intent: string;
};

type SearchNlJson = {
  brand: string;
  category: string;
  max_price: number;
  min_discount: number;
  intent: string;
};

function empty(): SearchQueryUnderstanding {
  return {
    brand: null,
    category: null,
    store: null,
    maxPrice: null,
    minDiscount: null,
    intent: "browse",
  };
}

/**
 * Deterministic parse — no network; catalog-aligned brand/category/store matching.
 * Use `parseSearchQueryRules` for default mock catalog; pass live metas from `getBrands` / `getCategories` / `getStores` when available.
 */
export function parseSearchQueryRulesWithCatalog(
  query: string,
  brands: BrandMeta[],
  categories: CategoryMeta[],
  stores: StoreMeta[]
): SearchQueryUnderstanding {
  const q = query.trim().toLowerCase();
  if (!q) return empty();

  const { maxPrice, minDiscount } = extractNumericHintsFromQuery(q);

  const brand = matchBrandSlugFromQueryText(q, brands);
  const categoryFromName = matchCategorySlugFromQueryText(q, categories);
  const category =
    categoryFromName ?? categorySlugFromProductHints(q);

  const store = matchStoreSlugFromQueryText(q, stores);

  let intent = "browse";
  if (/\b(cheap|budget|save|discount|deal|sale|clearance)\b/.test(q)) {
    intent = "price_sensitive";
  }
  if (/\b(best|top|rated|today|right now)\b/.test(q)) {
    intent = "deal_hunt";
  }
  if (brand) intent = "brand_focus";
  else if (store) intent = "store_focus";
  else if (category) intent = "category_focus";

  return {
    brand,
    category,
    store,
    maxPrice,
    minDiscount,
    intent,
  };
}

/** Deterministic parse — no network; uses built-in mock catalog lists (API fallback). */
export function parseSearchQueryRules(query: string): SearchQueryUnderstanding {
  return parseSearchQueryRulesWithCatalog(query, mockBrands, mockCategories, mockStores);
}

function mapNlJson(raw: SearchNlJson): SearchQueryUnderstanding {
  const brand = raw.brand?.trim() || null;
  const category = raw.category?.trim() || null;
  return {
    brand: brand || null,
    category: category || null,
    store: null,
    maxPrice: raw.max_price > 0 && raw.max_price < 1_000_000 ? raw.max_price : null,
    minDiscount:
      raw.min_discount > 0 && raw.min_discount <= 100 ? raw.min_discount : null,
    intent: raw.intent?.trim() || "browse",
  };
}

/**
 * Search understanding: structured filters from a short NL query.
 * Uses OpenAI Responses + JSON when configured; otherwise `parseSearchQueryRules`.
 */
export async function parseNaturalLanguageDealQuery(
  query: string
): Promise<SearchQueryUnderstanding> {
  const trimmed = query.trim();
  if (!trimmed) return empty();

  const res = await runResponsesJsonWithFallback<SearchNlJson>({
    tier: AI_TASK_TIERS.searchNl,
    instructions:
      "Map shopping queries to FlashDealAI catalog filters. " +
      "brand: slug-like token (e.g. nike, apple) or empty string if unknown. " +
      "category: slug — electronics, home-kitchen, fashion, health-fitness, outdoor — or empty string if unclear. " +
      "max_price: USD ceiling as a positive number, or -1 if not specified. " +
      "min_discount: minimum percent off wanted, positive integer, or -1 if not specified. " +
      "intent: short snake_case label (e.g. price_sensitive, deal_hunt, brand_focus, browse).",
    input: JSON.stringify({ query: trimmed }),
    jsonSchema: SCHEMA_SEARCH_NL,
    fallbackTier: AI_TASK_TIERS.lightTags,
  });

  if (!res.ok) return parseSearchQueryRules(trimmed);
  return mapNlJson(res.parsed);
}
