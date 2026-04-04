import { Suspense } from "react";

import { DealGridSkeleton } from "@/components/deals/deal-card-skeleton";
import { DealsExplorer } from "@/components/deals-explorer";
import { siteMetadata } from "@/lib/site-metadata";
import { getBrands, getCategories, getDeals, getStores } from "@/services/deals";

export const metadata = siteMetadata({
  title: "Search deals",
  description:
    "Search FlashDealAI with debounced queries, quick suggestions, and AI-aware ranking.",
  path: "/search",
});

export default async function SearchPage() {
  const { deals, source } = await getDeals({});
  const categories = getCategories();
  const brands = getBrands();
  const stores = getStores();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
        Search deals
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-600">
        Type naturally — the URL syncs after a short pause so you can share results.
        Try examples like{" "}
        <span className="whitespace-nowrap font-medium text-neutral-800">
          nike shoes under 100
        </span>
        ,{" "}
        <span className="whitespace-nowrap font-medium text-neutral-800">
          best laptop deals
        </span>
        , or{" "}
        <span className="whitespace-nowrap font-medium text-neutral-800">
          skincare deals
        </span>
        . For programmatic Q&A, use{" "}
        <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-sm">
          POST /api/ai/answer
        </code>
        .
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
