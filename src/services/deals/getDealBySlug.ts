import {
  loadDealBySlug as loadOne,
  loadDealBySlugWithSource,
} from "@/services/deals/repository";
import { loadRelatedDeals } from "@/services/deals/repository";
import type { DealProduct } from "@/types/deal";

export async function getDealBySlug(slug: string): Promise<DealProduct | null> {
  return loadOne(slug);
}

export async function getDealBySlugWithSource(slug: string): Promise<{
  deal: DealProduct | null;
  source: "database" | "mock";
}> {
  return loadDealBySlugWithSource(slug);
}

export async function getRelatedDeals(
  excludeSlug: string,
  categoryName: string | null,
  limit = 4
): Promise<DealProduct[]> {
  return loadRelatedDeals(excludeSlug, categoryName, limit);
}
