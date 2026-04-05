"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AmazonShelfImage } from "@/components/deals/amazon-shelf-image";
import { getRecentSlugs } from "@/lib/deal-local-storage";
import type { DealProduct } from "@/types/deal";

export function DealRecentlyViewed({
  currentSlug,
  currency,
}: {
  currentSlug: string;
  currency: string;
}) {
  const [items, setItems] = useState<DealProduct[]>([]);

  useEffect(() => {
    const slugs = getRecentSlugs(currentSlug).slice(0, 5);
    if (slugs.length === 0) return;
    let cancelled = false;
    void (async () => {
      const rows = await Promise.all(
        slugs.map(async (s) => {
          const r = await fetch(`/api/products/${encodeURIComponent(s)}`);
          if (!r.ok) return null;
          const j = (await r.json()) as {
            success?: boolean;
            data?: { deal?: DealProduct };
            deal?: DealProduct;
          };
          if (j.success && j.data?.deal) return j.data.deal;
          return j.deal ?? null;
        })
      );
      if (!cancelled) {
        setItems(rows.filter((x): x is DealProduct => x != null));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentSlug]);

  if (items.length === 0) return null;

  return (
    <section className="mt-14 border-t border-neutral-200 pt-10">
      <h2 className="text-lg font-bold text-neutral-900">Recently viewed</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Pulled from this browser — not shared across devices.
      </p>
      <ul className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {items.map((d) => (
          <li
            key={d.id}
            className="w-40 shrink-0 rounded-xl border border-neutral-200 bg-white shadow-sm"
          >
            <Link href={`/deals/${d.slug}`} className="block">
              <div className="relative aspect-square w-full bg-neutral-100">
                <AmazonShelfImage
                  primary={d.imageUrl}
                  productUrl={d.productUrl}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <p className="line-clamp-2 p-2 text-xs font-semibold leading-snug text-neutral-900">
                {d.title}
              </p>
              <p className="px-2 pb-2 text-xs font-medium tabular-nums text-[var(--accent)]">
                {currency}
                {d.currentPrice.toFixed(2)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
