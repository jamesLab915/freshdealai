import { mockBrands, mockCategories } from "@/lib/mock-deals";
import { AI_TASK_TIERS, runResponsesJsonWithFallback } from "@/services/ai/client";
import { SCHEMA_SEARCH_NL } from "@/services/ai/schemas";

export type SearchQueryUnderstanding = {
  brand: string | null;
  /** Category slug when mappable (e.g. `electronics`). */
  category: string | null;
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
    maxPrice: null,
    minDiscount: null,
    intent: "browse",
  };
}

/** Deterministic parse — no network; used when `OPENAI_API_KEY` is absent or the model fails. */
export function parseSearchQueryRules(query: string): SearchQueryUnderstanding {
  const q = query.trim().toLowerCase();
  if (!q) return empty();

  let maxPrice: number | null = null;
  const under = q.match(
    /\b(?:under|below|less than|cheaper than)\s+\$?\s*(\d{1,6})\b/
  );
  if (under) maxPrice = Number(under[1]);

  let minDiscount: number | null = null;
  const pct = q.match(/\b(\d{1,2})\s*%\s*(?:off|discount|\+)/);
  if (pct) minDiscount = Number(pct[1]);
  const atLeast = q.match(/\b(?:at least|minimum)\s+(\d{1,2})\s*%/);
  if (atLeast) minDiscount = Number(atLeast[1]);

  let brand: string | null = null;
  for (const b of mockBrands) {
    const name = b.name.toLowerCase();
    if (q.includes(name) || q.includes(b.slug.replace(/-/g, " "))) {
      brand = b.slug;
      break;
    }
  }

  let category: string | null = null;
  for (const c of mockCategories) {
    const name = c.name.toLowerCase();
    const slugWords = c.slug.replace(/-/g, " ");
    if (q.includes(name) || q.includes(slugWords)) {
      category = c.slug;
      break;
    }
  }
  const catHints: [RegExp, string][] = [
    [/\b(laptop|chromebook|gpu|monitor|headphone|earbud|tablet|phone)\b/i, "electronics"],
    [/\b(skincare|makeup|serum|moisturizer)\b/i, "fashion"],
    [/\b(sneaker|shoe|apparel|jacket|jeans)\b/i, "fashion"],
    [/\b(cookware|air fryer|blender|kitchen)\b/i, "home-kitchen"],
    [/\b(gym|fitness|protein|wearable|watch)\b/i, "health-fitness"],
    [/\b(camping|hiking|tent|outdoor)\b/i, "outdoor"],
  ];
  if (!category) {
    for (const [re, slug] of catHints) {
      if (re.test(q)) {
        category = slug;
        break;
      }
    }
  }

  let intent = "browse";
  if (/\b(cheap|budget|save|discount|deal|sale|clearance)\b/.test(q)) {
    intent = "price_sensitive";
  }
  if (/\b(best|top|rated|today|right now)\b/.test(q)) {
    intent = "deal_hunt";
  }
  if (brand) intent = "brand_focus";

  return {
    brand,
    category,
    maxPrice,
    minDiscount,
    intent,
  };
}

function mapNlJson(raw: SearchNlJson): SearchQueryUnderstanding {
  const brand = raw.brand?.trim() || null;
  const category = raw.category?.trim() || null;
  return {
    brand: brand || null,
    category: category || null,
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
