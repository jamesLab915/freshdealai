import type { Prisma, Product } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getMockAllDealsForAdmin,
  getMockDealBySlug,
  getMockPublishedDeals,
  mockBrands,
  mockCategories,
} from "@/lib/mock-deals";
import { resolveAffiliateUrl } from "@/lib/affiliate";
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
      return { deals: db, source: "database" };
    }
  } catch {
    /* fallback */
  }
  return {
    deals: applyDealFilters(getMockPublishedDeals(), filters),
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
      if (p) return { deal: mapProductToDeal(p), source: "database" };
    } catch {
      /* mock */
    }
  }
  const deal = getMockDealBySlug(slug) ?? null;
  return { deal, source: "mock" };
}

export async function loadDealBySlug(slug: string): Promise<DealProduct | null> {
  const { deal } = await loadDealBySlugWithSource(slug);
  return deal;
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
