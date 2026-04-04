import { getDeals } from "@/services/deals/getDeals";
import type { DealFilters } from "@/services/deals/types";
import type { DealProduct } from "@/types/deal";

export type CollectionPreset = {
  slug: string;
  label: string;
  description: string;
  filters: DealFilters;
  /** Cap grid size for hubs like “best deals” (optional). */
  maxItems?: number;
};

/** Code-defined SEO / marketing collections — DB `DealCollection` can extend later. */
const PRESETS: Record<string, CollectionPreset> = {
  "best-deals": {
    slug: "best-deals",
    label: "Best Deals Today",
    description: "High AI scores across the catalog.",
    filters: { sort: "ai_score", minAiScore: 80 },
    maxItems: 24,
  },
  "under-50": {
    slug: "under-50",
    label: "Under $50",
    description: "Budget-friendly picks.",
    filters: { sort: "ai_score", maxPrice: 50 },
  },
  nike: {
    slug: "nike",
    label: "Nike",
    description: "Nike brand deals.",
    filters: { sort: "ai_score", brand: "nike" },
  },
  electronics: {
    slug: "electronics",
    label: "Electronics",
    description: "Electronics category.",
    filters: { sort: "ai_score", category: "electronics" },
  },
};

export function getCollectionPreset(slug: string): CollectionPreset | null {
  return PRESETS[slug] ?? null;
}

export function listCollectionPresets(): CollectionPreset[] {
  return Object.values(PRESETS);
}

/** Single entry for SEO landing pages — avoids duplicating filters in each route. */
export async function loadCollectionPageData(slug: string): Promise<{
  preset: CollectionPreset;
  deals: DealProduct[];
  source: "database" | "mock";
} | null> {
  const preset = getCollectionPreset(slug);
  if (!preset) return null;
  const { deals, source } = await getDeals(preset.filters);
  const list =
    preset.maxItems != null ? deals.slice(0, preset.maxItems) : deals;
  return { preset, deals: list, source };
}
