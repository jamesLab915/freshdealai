import { Suspense } from "react";

import { DealGridSkeleton } from "@/components/deals/deal-card-skeleton";
import { DealsExplorer } from "@/components/deals-explorer";
import { getBrands, getCategories, getDeals, getStores } from "@/services/deals";

export const metadata = {
  title: "Deals",
  description: "Search and filter live US deals with AI scores and filters.",
};

export default async function DealsPage() {
  const { deals, source } = await getDeals({});
  const categories = getCategories();
  const brands = getBrands();
  const stores = getStores();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
        All deals
      </h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        <strong className="text-neutral-800">{deals.length}</strong> offers in this
        feed — filter by store, category, discount, or sort like a deal aggregator.
        {source === "mock" && " (Demo data — add PostgreSQL for persistence.)"}
      </p>
      <div className="mt-10">
        <Suspense fallback={<DealGridSkeleton count={6} />}>
          <DealsExplorer
            deals={deals}
            categories={categories}
            brands={brands}
            stores={stores}
            dataSource={source}
          />
        </Suspense>
      </div>
    </div>
  );
}
