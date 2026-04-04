import type { DealProduct } from "@/types/deal";

export type DealSort =
  | "ai_score"
  | "newest"
  | "biggest_drop"
  | "popularity";

/** Filters for list + search — URL-synced on /deals and /search */
export type DealFilters = {
  q?: string;
  brand?: string;
  /** Store slug, e.g. `amazon` — matched via product URL */
  store?: string;
  category?: string;
  minDiscount?: number;
  maxDiscount?: number;
  minAiScore?: number;
  maxAiScore?: number;
  /** Inclusive upper bound on `currentPrice` (same currency as catalog). */
  maxPrice?: number;
  minPrice?: number;
  sort?: DealSort;
};

export type DealsFetchResult = {
  deals: DealProduct[];
  source: "database" | "mock";
};
