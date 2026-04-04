import { DealGridSkeleton } from "@/components/deals/deal-card-skeleton";

export default function DealsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-neutral-200" />
      <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-neutral-100" />
      <div className="mt-10 h-64 animate-pulse rounded-2xl bg-neutral-100" />
      <div className="mt-10">
        <DealGridSkeleton count={6} />
      </div>
    </div>
  );
}
