import type { DealFilters, DealSort } from "@/services/deals/types";

function num(v: string | null): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

/** Shared query parsing for GET /api/deals, /api/products, /api/search */
export function parseDealFiltersFromSearchParams(
  sp: URLSearchParams
): DealFilters {
  const sortRaw = sp.get("sort") ?? undefined;
  const sort = sortRaw as DealSort | undefined;

  return {
    q: sp.get("q") ?? undefined,
    brand: sp.get("brand") ?? undefined,
    store: sp.get("store") ?? undefined,
    category: sp.get("category") ?? undefined,
    minDiscount: num(sp.get("minDiscount")),
    maxDiscount: num(sp.get("maxDiscount")),
    minAiScore: num(sp.get("minAiScore")),
    maxAiScore: num(sp.get("maxAiScore")),
    maxPrice: num(sp.get("maxPrice")),
    minPrice: num(sp.get("minPrice")),
    sort:
      sort === "newest" ||
      sort === "biggest_drop" ||
      sort === "popularity" ||
      sort === "ai_score"
        ? sort
        : undefined,
  };
}
