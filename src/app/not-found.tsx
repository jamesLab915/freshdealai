import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-neutral-900">Page not found</h1>
      <p className="mt-3 text-neutral-600">
        That URL isn&apos;t in our catalog — it may have moved or expired like a
        lightning deal.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/deals">Browse deals</Link>
        </Button>
      </div>
    </div>
  );
}
