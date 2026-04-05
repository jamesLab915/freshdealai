import { Suspense } from "react";
import type { Metadata } from "next";

import { DealGridSkeleton } from "@/components/deals/deal-card-skeleton";
import { DealsExplorer } from "@/components/deals-explorer";
import { getSiteUrl } from "@/lib/env";
import { siteMetadata } from "@/lib/site-metadata";
import { getBrands, getCategories, getDeals, getStores } from "@/services/deals";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{ q?: string; category?: string; brand?: string; minDisc?: string }>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const base = siteMetadata({
    title: "Search deals",
    description:
      "Search FlashDealAI — filter by category, brand, discount, and AI score. URLs are shareable.",
    path: "/search",
  });

  if (!q) return base;

  const qShort = q.length > 48 ? `${q.slice(0, 48)}…` : q;
  const titleAbs = `Search: ${qShort}`;
  const path = `/search?q=${encodeURIComponent(q)}`;
  const url = `${getSiteUrl()}${path}`;

  return {
    ...base,
    title: { absolute: titleAbs },
    description: `Find “${qShort}” and related US retail deals — AI-ranked, filterable results.`,
    alternates: { canonical: path },
    openGraph: {
      ...base.openGraph,
      title: titleAbs,
      description: `Search results for “${qShort}” on FlashDealAI.`,
      url,
    },
    twitter: {
      ...base.twitter,
      title: titleAbs,
    },
  };
}

export default async function SearchPage() {
  const { deals, source } = await getDeals({});
  const [categories, brands, stores] = await Promise.all([
    getCategories(),
    getBrands(),
    getStores(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
        Search deals
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-600">
        Type naturally — the URL syncs after a short pause so you can share results.
        Filters below apply to the same result set (category, brand, discount range).
      </p>
      <div className="mt-10">
        <Suspense fallback={<DealGridSkeleton count={6} />}>
          <DealsExplorer
            deals={deals}
            categories={categories}
            brands={brands}
            stores={stores}
            dataSource={source}
            searchUx
          />
        </Suspense>
      </div>
    </div>
  );
}
