import { mockBrands, mockCategories } from "@/lib/mock-deals";
import { prisma } from "@/lib/prisma";
import { BEST_DEALS_UNDER_PRICE_BUCKETS } from "@/lib/seo-hub-presets";

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateUnderPriceStaticParams(): Promise<
  { price: string }[]
> {
  const mock = BEST_DEALS_UNDER_PRICE_BUCKETS.map((p) => ({ price: String(p) }));
  if (!prisma) return [...mock];
  try {
    const rows = await prisma.product.findMany({
      where: { published: true },
      select: { currentPrice: true },
      take: 200,
    });
    const extra = new Set<string>();
    for (const r of rows) {
      const n = Number(r.currentPrice);
      if (!Number.isFinite(n) || n <= 0) continue;
      const bucket = [...BEST_DEALS_UNDER_PRICE_BUCKETS].find((b) => n <= b);
      if (bucket != null) extra.add(String(bucket));
    }
    const map = new Map<string, { price: string }>();
    for (const m of mock) map.set(m.price, m);
    for (const x of extra) map.set(x, { price: x });
    return [...map.values()];
  } catch {
    return [...mock];
  }
}

export function generateBrandCategoryStaticParamsSync(): {
  brandSlug: string;
  categorySlug: string;
}[] {
  const out: { brandSlug: string; categorySlug: string }[] = [];
  for (const b of mockBrands) {
    for (const c of mockCategories) {
      out.push({ brandSlug: b.slug, categorySlug: c.slug });
    }
  }
  return out;
}

export async function generateBrandCategoryStaticParams(): Promise<
  { brandSlug: string; categorySlug: string }[]
> {
  const mock = generateBrandCategoryStaticParamsSync();
  if (!prisma) return mock;
  try {
    const rows = await prisma.product.findMany({
      where: { published: true, brand: { not: null }, category: { not: null } },
      select: { brand: true, category: true },
      take: 400,
    });
    const seen = new Set<string>();
    const out = [...mock];
    for (const r of rows) {
      if (!r.brand || !r.category) continue;
      const brandSlug = slugifyName(r.brand);
      const categorySlug = slugifyName(r.category);
      const key = `${brandSlug}:${categorySlug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ brandSlug, categorySlug });
    }
    return out;
  } catch {
    return mock;
  }
}
