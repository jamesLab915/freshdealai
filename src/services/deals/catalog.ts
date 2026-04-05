import { prisma } from "@/lib/prisma";
import {
  mockBrands,
  mockCategories,
  mockStores,
} from "@/lib/mock-deals";
import { productUrlMatchesStoreSlug } from "@/lib/store-utils";
import type { BrandMeta, CategoryMeta, StoreMeta } from "@/types/deal";

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Categories: prefer `Category` table when DB is available; merge descriptions from mock by slug when DB row has none; fallback to mock list if empty or on error.
 */
export async function getCategories(): Promise<CategoryMeta[]> {
  if (!prisma) return mockCategories;
  try {
    const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
    if (rows.length === 0) {
      console.warn(
        "[catalog] getCategories: no rows in categories table — using mock categories"
      );
      return mockCategories;
    }
    return rows.map((r) => {
      const mock = mockCategories.find((m) => m.slug === r.slug);
      const desc = r.description?.trim();
      return {
        name: r.name,
        slug: r.slug,
        description: desc || mock?.description || "",
        dealCount: r.dealCount,
      };
    });
  } catch (err) {
    console.warn(
      "[catalog] getCategories: database error — using mock categories:",
      err instanceof Error ? err.message : err
    );
    return mockCategories;
  }
}

/**
 * Brands: aggregate distinct `Product.brand` for published rows; fallback to mock if none or on error. Slugs derived from brand names.
 */
export async function getBrands(): Promise<BrandMeta[]> {
  if (!prisma) return mockBrands;
  try {
    const rows = await prisma.product.groupBy({
      by: ["brand"],
      where: { published: true, brand: { not: null } },
      _count: { _all: true },
    });
    const withBrand = rows.filter(
      (r) => r.brand != null && String(r.brand).trim() !== ""
    );
    if (withBrand.length === 0) {
      console.warn(
        "[catalog] getBrands: no published brands in DB — using mock brands"
      );
      return mockBrands;
    }
    return withBrand
      .map((r) => ({
        name: r.brand as string,
        slug: slugifyName(r.brand as string),
        dealCount: r._count._all,
      }))
      .sort(
        (a, b) =>
          b.dealCount - a.dealCount || a.name.localeCompare(b.name, "en")
      );
  } catch (err) {
    console.warn(
      "[catalog] getBrands: database error — using mock brands:",
      err instanceof Error ? err.message : err
    );
    return mockBrands;
  }
}

/**
 * Stores: keep known slugs / domains from mock (URL compatibility); refresh `dealCount` from published product URLs when DB is available.
 */
export async function getStores(): Promise<StoreMeta[]> {
  if (!prisma) return mockStores;
  try {
    const rows = await prisma.product.findMany({
      where: { published: true },
      select: { productUrl: true },
    });
    const counts = new Map<string, number>(
      mockStores.map((s) => [s.slug, 0])
    );
    for (const row of rows) {
      for (const s of mockStores) {
        if (productUrlMatchesStoreSlug(row.productUrl, s.slug)) {
          counts.set(s.slug, (counts.get(s.slug) ?? 0) + 1);
        }
      }
    }
    return mockStores.map((s) => ({
      ...s,
      dealCount: counts.get(s.slug) ?? 0,
    }));
  } catch (err) {
    console.warn(
      "[catalog] getStores: database error — using mock stores:",
      err instanceof Error ? err.message : err
    );
    return mockStores;
  }
}
