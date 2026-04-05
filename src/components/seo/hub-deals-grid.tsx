import Link from "next/link";

import { DealCard } from "@/components/deal-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DealProduct } from "@/types/deal";

export type HubEngagement = {
  affiliateClicks: number;
  detailViews: number;
};

type Props = {
  deals: DealProduct[];
  engagementByProductId?: Map<string, HubEngagement>;
  /** Shown when `deals.length` is below threshold. */
  thinShelfNote?: string | null;
  thinThreshold?: number;
};

export function HubDealsGrid({
  deals,
  engagementByProductId,
  thinShelfNote,
  thinThreshold = 4,
}: Props) {
  if (deals.length === 0) {
    return (
      <Card className="border-dashed border-neutral-300 bg-neutral-50/80">
        <CardContent className="space-y-4 p-8 text-center sm:p-10">
          <p className="text-lg font-semibold text-neutral-900">
            Nothing on the shelf yet
          </p>
          <p className="text-sm leading-relaxed text-neutral-600">
            Our filters didn&apos;t return any live listings — try the full catalog,
            another category, or check back after the next ingest.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/deals">Browse all deals</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/best-deals">Main best-deals hub</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/search">Search</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {thinShelfNote && deals.length < thinThreshold && (
        <p className="rounded-lg border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          {thinShelfNote}
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((d) => (
          <DealCard
            key={d.id}
            deal={d}
            engagement={engagementByProductId?.get(d.id)}
          />
        ))}
      </div>
    </div>
  );
}
