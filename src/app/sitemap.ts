import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/env";
import { getCategories, getDeals, getStores } from "@/services/deals";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticPaths = [
    "/",
    "/deals",
    "/search",
    "/ai-picks",
    "/best-deals",
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

  const { deals } = await getDeals({});
  const categories = getCategories();
  const stores = getStores();

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
