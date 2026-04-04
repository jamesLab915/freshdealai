import { DealGridSkeleton } from "@/components/deals/deal-card-skeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="h-10 w-56 animate-pulse rounded-lg bg-neutral-200" />
      <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded bg-neutral-100" />
      <div className="mt-10">
        <DealGridSkeleton count={6} />
      </div>
    </div>
  );
}
