import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/env";
import { BEST_DEALS_UNDER_PRICE_BUCKETS } from "@/lib/seo-hub-presets";
import {
  generateBrandCategoryStaticParamsSync,
} from "@/lib/seo-static-params";
import { getBrands, getCategories, getDeals, getStores } from "@/services/deals";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);
  const categoryBrowse = categories.map((c) => `/deals/category/${c.slug}`);
  const bestDealsCats = categories.map((c) => `/best-deals/${c.slug}`);
  const top10Cats = categories.map((c) => `/top-10-best-deals/${c.slug}`);
  const brandDeals = brands.map((b) => `/best-brand-deals/${b.slug}`);
  const underPrice = BEST_DEALS_UNDER_PRICE_BUCKETS.map(
    (p) => `/best-deals/under/${p}`
  );
  const brandCat = generateBrandCategoryStaticParamsSync().map(
    ({ brandSlug, categorySlug }) =>
      `/best-deals/brand/${brandSlug}/category/${categorySlug}`
  );

  const staticPaths = [
    "/",
    "/deals",
    ...categoryBrowse,
    "/search",
    "/ai-picks",
    "/best-deals",
    "/best-deals/today",
    "/best-deals/this-week",
    ...underPrice,
    ...brandCat,
    ...bestDealsCats,
    ...top10Cats,
    ...brandDeals,
    "/about",
    "/categories",
    "/stores",
    "/deals/under-50",
    "/deals/nike",
    "/deals/electronics",
    "/privacy",
    "/terms",
    "/contact",
    "/amazon-disclosure",
  ];

  const [{ deals }, stores] = await Promise.all([
    getDeals({}),
    getStores(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    ...staticPaths.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...deals.map((d) => ({
      url: `${base}/deals/${d.slug}`,
      lastModified: new Date(d.lastSeenAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...categories.map((c) => ({
      url: `${base}/categories/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...stores.map((s) => ({
      url: `${base}/stores/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];

  return entries;
}
