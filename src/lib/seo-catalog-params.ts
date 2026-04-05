/**
 * Slug lists for SEO / `generateStaticParams` — aligned with `getCategories` / `getBrands`
 * (DB-first in those functions). Used so prerender paths match catalog + repository filters.
 *
 * Fallback: mock lists when DB is unavailable, empty, or read fails (build must not crash).
 */

import { mockBrands, mockCategories } from "@/lib/mock-deals";
import { getBrands, getCategories } from "@/services/deals/catalog";

export async function getCategorySlugsForStaticGeneration(): Promise<string[]> {
  try {
    const cats = await getCategories();
    if (cats.length > 0) return cats.map((c) => c.slug);
  } catch {
    /* use mock below */
  }
  return mockCategories.map((c) => c.slug);
}

export async function getBrandSlugsForStaticGeneration(): Promise<string[]> {
  try {
    const brands = await getBrands();
    if (brands.length > 0) return brands.map((b) => b.slug);
  } catch {
    /* use mock below */
  }
  return mockBrands.map((b) => b.slug);
}
