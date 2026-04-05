import type { Prisma, Product } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getMockAllDealsForAdmin,
  getMockDealById,
  getMockDealBySlug,
  getMockPublishedDeals,
  mockBrands,
  mockCategories,
} from "@/lib/mock-deals";
import { resolveAffiliateUrl } from "@/lib/affiliate";
import { isPrimaryShelfAmazonDeal } from "@/lib/deal-shelf-eligibility";
import { dealMatchesStore } from "@/lib/store-utils";
import type { DealFilters, DealSort } from "@/services/deals/types";
import type { DealProduct } from "@/types/deal";

function toNumber(n: unknown): number {
  if (typeof n === "number") return n;
  if (n && typeof (n as { toNumber?: () => number }).toNumber === "function") {
    return (n as { toNumber: () => number }).toNumber();
  }
  return Number(n);
}

type ProductWithHistory = Product & {
  priceHistory: { price: unknown; capturedAt: Date }[];
};

export function mapProductToDeal(p: ProductWithHistory): DealProduct {
  return {
    id: p.id,
    slug: p.slug,
    source: p.source,
    title: p.title,
    normalizedTitle: p.normalizedTitle,
    brand: p.brand,
    category: p.category,
    subcategory: p.subcategory,
    imageUrl: p.imageUrl,
    productUrl: p.productUrl,
    affiliateUrl: resolveAffiliateUrl(p),
    usesProductUrlFallback: !p.affiliateUrl,
    currency: p.currency,
    currentPrice: toNumber(p.currentPrice),
    originalPrice: p.originalPrice != null ? toNumber(p.originalPrice) : null,
    discountPercent: p.discountPercent,
    aiScore: p.aiScore,
    aiSummary: p.aiSummary,
    aiReasonToBuy: p.aiReasonToBuy,
    availability: p.availability,
    rating: p.rating != null ? toNumber(p.rating) : null,
    reviewCount: p.reviewCount,
    tags: p.tags ?? [],
    published: p.published,
    featured: p.featured,
    trending: p.trending,
    aiPick: p.aiPick,
    homepageRank: p.homepageRank ?? null,
    bestDealsRank: p.bestDealsRank ?? null,
    top10Rank: p.top10Rank ?? null,
    excludeFromHubs: p.excludeFromHubs,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    lastSeenAt: p.lastSeenAt.toISOString(),
    priceHistory: p.priceHistory?.map((h) => ({
      price: toNumber(h.price),
      capturedAt: h.capturedAt.toISOString(),
    })),
  };
}

function sortDeals(copy: DealProduct[], sort: DealSort | undefined): DealProduct[] {
  const s = sort ?? "ai_score";
  if (s === "newest") {
    copy.sort(
      (a, b) =>
        new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
    );
  } else if (s === "biggest_drop") {
    copy.sort(
      (a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0)
    );
  } else if (s === "popularity") {
    copy.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
  } else {
    copy.sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
  }
  return copy;
}

/** In-memory filter + sort for mock path and fine-grained AI/store filters. */
export function applyDealFilters(
  deals: DealProduct[],
  f: DealFilters
): DealProduct[] {
  let out = deals.filter((d) => d.published);
  const q = f.q?.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.brand?.toLowerCase().includes(q) ?? false) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (f.brand) {
    const b = mockBrands.find((x) => x.slug === f.brand)?.name.toLowerCase();
    if (b) out = out.filter((d) => d.brand?.toLowerCase() === b);
  }
  if (f.store) {
    out = out.filter((d) => dealMatchesStore(d, f.store!));
  }
  if (f.category) {
    const slug = f.category.toLowerCase();
    out = out.filter((d) => {
      const nameSlug = (d.category ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return nameSlug === slug;
    });
  }
  if (f.minDiscount != null) {
    out = out.filter((d) => (d.discountPercent ?? 0) >= f.minDiscount!);
  }
  if (f.maxDiscount != null) {
    out = out.filter((d) => (d.discountPercent ?? 0) <= f.maxDiscount!);
  }
  if (f.minAiScore != null) {
    out = out.filter((d) => (d.aiScore ?? 0) >= f.minAiScore!);
  }
  if (f.maxAiScore != null) {
    out = out.filter((d) => (d.aiScore ?? 0) <= f.maxAiScore!);
  }
  if (f.maxPrice != null) {
    out = out.filter((d) => d.currentPrice <= f.maxPrice!);
  }
  if (f.minPrice != null) {
    out = out.filter((d) => d.currentPrice >= f.minPrice!);
  }
  return sortDeals([...out], f.sort);
}

/** Sitewide public shelf: real Amazon `/dp/` URLs only (see `isPrimaryShelfAmazonDeal`). */
function filterPrimaryShelfDeals(deals: DealProduct[]): DealProduct[] {
  return deals.filter(isPrimaryShelfAmazonDeal);
}

function storeDomainHint(slug: string): string | null {
  const m: Record<string, string> = {
    amazon: "amazon.com",
    "best-buy": "bestbuy.com",
    target: "target.com",
    walmart: "walmart.com",
    "nike-store": "nike.com",
    rei: "rei.com",
  };
  return m[slug] ?? null;
}

async function fromDb(filters: DealFilters): Promise<DealProduct[] | null> {
  if (!prisma) return null;

  const where: Prisma.ProductWhereInput = { published: true };
  if (filters.brand) {
    const bmeta = mockBrands.find((b) => b.slug === filters.brand);
    where.brand = bmeta
      ? { equals: bmeta.name, mode: "insensitive" }
      : { contains: filters.brand, mode: "insensitive" };
  }
  if (filters.store) {
    const hint = storeDomainHint(filters.store);
    if (hint) {
      where.productUrl = { contains: hint, mode: "insensitive" };
    }
  }
  if (filters.category) {
    const cat = mockCategories.find((c) => c.slug === filters.category);
    if (cat) where.category = { equals: cat.name, mode: "insensitive" };
  }
  if (filters.minDiscount != null || filters.maxDiscount != null) {
    where.discountPercent = {};
    if (filters.minDiscount != null) {
      where.discountPercent.gte = filters.minDiscount;
    }
    if (filters.maxDiscount != null) {
      where.discountPercent.lte = filters.maxDiscount;
    }
  }
  if (filters.minAiScore != null || filters.maxAiScore != null) {
    where.aiScore = {};
    if (filters.minAiScore != null) {
      where.aiScore.gte = filters.minAiScore;
    }
    if (filters.maxAiScore != null) {
      where.aiScore.lte = filters.maxAiScore;
    }
  }
  if (filters.maxPrice != null || filters.minPrice != null) {
    where.currentPrice = {};
    if (filters.minPrice != null) {
      where.currentPrice.gte = filters.minPrice;
    }
    if (filters.maxPrice != null) {
      where.currentPrice.lte = filters.maxPrice;
    }
  }
  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
  switch (filters.sort) {
    case "newest":
      orderBy = [{ lastSeenAt: "desc" }];
      break;
    case "biggest_drop":
      orderBy = [{ discountPercent: "desc" }];
      break;
    case "popularity":
      orderBy = [{ reviewCount: "desc" }];
      break;
    default:
      orderBy = [{ aiScore: "desc" }];
  }

  const rows = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      priceHistory: { orderBy: { capturedAt: "desc" }, take: 8 },
    },
    take: 200,
  });
  return rows.map(mapProductToDeal);
}

export async function loadDeals(
  filters: DealFilters
): Promise<{ deals: DealProduct[]; source: "database" | "mock" }> {
  try {
    const db = await fromDb(filters);
    if (db) {
      return { deals: filterPrimaryShelfDeals(db), source: "database" };
    }
  } catch {
    /* fallback */
  }
  return {
    deals: filterPrimaryShelfDeals(
      applyDealFilters(getMockPublishedDeals(), filters)
    ),
    source: "mock",
  };
}

export async function loadDealBySlugWithSource(
  slug: string
): Promise<{
  deal: DealProduct | null;
  source: "database" | "mock";
}> {
  if (prisma) {
    try {
      const p = await prisma.product.findFirst({
        where: { slug, published: true },
        include: {
          priceHistory: { orderBy: { capturedAt: "desc" }, take: 14 },
        },
      });
      if (p) {
        const deal = mapProductToDeal(p);
        if (!isPrimaryShelfAmazonDeal(deal)) {
          return { deal: null, source: "database" };
        }
        return { deal, source: "database" };
      }
    } catch {
      /* mock */
    }
  }
  const deal = getMockDealBySlug(slug) ?? null;
  if (deal && !isPrimaryShelfAmazonDeal(deal)) {
    return { deal: null, source: "mock" };
  }
  return { deal, source: "mock" };
}

export async function loadDealBySlug(slug: string): Promise<DealProduct | null> {
  const { deal } = await loadDealBySlugWithSource(slug);
  return deal;
}

export async function loadDealById(id: string): Promise<DealProduct | null> {
  if (prisma) {
    try {
      const p = await prisma.product.findFirst({
        where: { id, published: true },
        include: {
          priceHistory: { orderBy: { capturedAt: "desc" }, take: 14 },
        },
      });
      if (p) {
        const deal = mapProductToDeal(p);
        return isPrimaryShelfAmazonDeal(deal) ? deal : null;
      }
    } catch {
      /* mock */
    }
  }
  const deal = getMockDealById(id) ?? null;
  return deal && isPrimaryShelfAmazonDeal(deal) ? deal : null;
}

export async function loadAllDealsForAdmin(): Promise<DealProduct[]> {
  if (prisma) {
    try {
      const rows = await prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        include: { priceHistory: { orderBy: { capturedAt: "desc" }, take: 3 } },
        take: 200,
      });
      return rows.map(mapProductToDeal);
    } catch {
      /* mock */
    }
  }
  return getMockAllDealsForAdmin();
}

function categoryNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Same-category picks; falls back to top AI picks if thin. */
export async function loadRelatedDeals(
  excludeSlug: string,
  categoryName: string | null,
  limit = 4
): Promise<DealProduct[]> {
  if (categoryName) {
    const slug = categoryNameToSlug(categoryName);
    const { deals } = await loadDeals({ category: slug, sort: "ai_score" });
    const filtered = deals.filter((d) => d.slug !== excludeSlug);
    if (filtered.length >= limit) return filtered.slice(0, limit);
  }
  const { deals } = await loadDeals({ sort: "ai_score" });
  return deals.filter((d) => d.slug !== excludeSlug).slice(0, limit);
}

function brandNameToSlug(name: string): string {
  const b = mockBrands.find(
    (x) => x.name.toLowerCase() === name.toLowerCase()
  );
  if (b) return b.slug;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Same category, strictly lower price — for “cheaper alternatives”. */
export async function loadCheaperAlternatives(
  excludeSlug: string,
  categoryName: string | null,
  currentPrice: number,
  limit = 4
): Promise<DealProduct[]> {
  if (!categoryName) return [];
  const slug = categoryNameToSlug(categoryName);
  const maxPrice = Math.max(0, currentPrice - 0.01);
  if (maxPrice <= 0) return [];
  const { deals } = await loadDeals({
    category: slug,
    sort: "ai_score",
    maxPrice,
  });
  return deals.filter((d) => d.slug !== excludeSlug).slice(0, limit);
}

export async function loadMoreFromBrand(
  excludeSlug: string,
  brandName: string | null,
  limit = 4
): Promise<DealProduct[]> {
  if (!brandName?.trim()) return [];
  const slug = brandNameToSlug(brandName.trim());
  const { deals } = await loadDeals({ brand: slug, sort: "ai_score" });
  return deals.filter((d) => d.slug !== excludeSlug).slice(0, limit);
}

/** Same category, similar shelf price — for “comparable products”. */
export async function loadComparableDeals(
  excludeSlug: string,
  categoryName: string | null,
  currentPrice: number,
  limit = 4
): Promise<DealProduct[]> {
  if (!categoryName || currentPrice <= 0) return [];
  const slug = categoryNameToSlug(categoryName);
  const lo = currentPrice * 0.65;
  const hi = currentPrice * 1.45;
  const { deals } = await loadDeals({ category: slug, sort: "ai_score" });
  return deals
    .filter(
      (d) =>
        d.slug !== excludeSlug &&
        d.currentPrice >= lo &&
        d.currentPrice <= hi
    )
    .slice(0, limit);
}

export async function loadEngagementStatForProduct(
  productId: string
): Promise<{ affiliateClicks: number; detailViews: number } | null> {
  if (!prisma) return null;
  try {
    const row = await prisma.dealEngagementStat.findUnique({
      where: { productId },
    });
    if (!row) return null;
    return {
      affiliateClicks: row.affiliateClicks,
      detailViews: row.detailViews,
    };
  } catch {
    return null;
  }
}

export async function loadEngagementStatsForProductIds(
  productIds: string[]
): Promise<Map<string, { affiliateClicks: number; detailViews: number }>> {
  const map = new Map<string, { affiliateClicks: number; detailViews: number }>();
  if (!prisma || productIds.length === 0) return map;
  const unique = [...new Set(productIds)];
  try {
    const rows = await prisma.dealEngagementStat.findMany({
      where: { productId: { in: unique } },
    });
    for (const row of rows) {
      map.set(row.productId, {
        affiliateClicks: row.affiliateClicks,
        detailViews: row.detailViews,
      });
    }
  } catch {
    /* mock / DB down */
  }
  return map;
}
