import { Card, CardContent } from "@/components/ui/card";

export function DealCardSkeleton() {
  return (
    <Card className="overflow-hidden border-neutral-200">
      <CardContent className="p-0">
        <div className="h-9 animate-pulse bg-neutral-100" />
        <div className="aspect-[4/3] animate-pulse bg-neutral-200" />
        <div className="space-y-3 p-4">
          <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
          <div className="h-10 animate-pulse rounded bg-neutral-200" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-neutral-200" />
          <div className="h-12 animate-pulse rounded-lg bg-neutral-100" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DealGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <DealCardSkeleton key={i} />
      ))}
    </div>
  );
}
