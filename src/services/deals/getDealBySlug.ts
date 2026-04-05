import {
  loadCheaperAlternatives,
  loadComparableDeals,
  loadDealById as loadById,
  loadDealBySlug as loadOne,
  loadDealBySlugWithSource,
  loadEngagementStatForProduct,
  loadEngagementStatsForProductIds,
  loadMoreFromBrand,
  loadRelatedDeals,
} from "@/services/deals/repository";
import type { DealProduct } from "@/types/deal";

export async function getDealBySlug(slug: string): Promise<DealProduct | null> {
  return loadOne(slug);
}

export async function getDealById(id: string): Promise<DealProduct | null> {
  return loadById(id);
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

export async function getCheaperAlternatives(
  excludeSlug: string,
  categoryName: string | null,
  currentPrice: number,
  limit = 4
): Promise<DealProduct[]> {
  return loadCheaperAlternatives(excludeSlug, categoryName, currentPrice, limit);
}

export async function getMoreFromBrand(
  excludeSlug: string,
  brandName: string | null,
  limit = 4
): Promise<DealProduct[]> {
  return loadMoreFromBrand(excludeSlug, brandName, limit);
}

export async function getComparableDeals(
  excludeSlug: string,
  categoryName: string | null,
  currentPrice: number,
  limit = 4
): Promise<DealProduct[]> {
  return loadComparableDeals(excludeSlug, categoryName, currentPrice, limit);
}

export async function getDealEngagementStat(
  productId: string
): Promise<{ affiliateClicks: number; detailViews: number } | null> {
  return loadEngagementStatForProduct(productId);
}

export async function getEngagementStatsForProductIds(
  productIds: string[]
): Promise<Map<string, { affiliateClicks: number; detailViews: number }>> {
  return loadEngagementStatsForProductIds(productIds);
}
