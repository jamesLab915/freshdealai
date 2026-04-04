"use client";

import { SearchX } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { DealCard } from "@/components/deal-card";
import { DealGridSkeleton } from "@/components/deals/deal-card-skeleton";
import {
  FilterPanel,
  type FilterValues,
} from "@/components/deals/filter-panel";
import { Button } from "@/components/ui/button";
import { dealMatchesStore } from "@/lib/store-utils";
import { track } from "@/lib/tracking";
import type { BrandMeta, CategoryMeta, DealProduct, StoreMeta } from "@/types/deal";

const SEARCH_PLACEHOLDER_EXAMPLES =
  "Try: nike shoes under 100, best laptop deals, skincare deals…";

type Props = {
  deals: DealProduct[];
  categories: CategoryMeta[];
  brands: BrandMeta[];
  stores: StoreMeta[];
  dataSource: "database" | "mock";
  /** Debounced URL search, inline suggestions, richer empty state */
  searchUx?: boolean;
};

export function DealsExplorer({
  deals,
  categories,
  brands,
  stores,
  dataSource,
  searchUx = false,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = params.get("q") ?? "";
  const store = params.get("store") ?? "";
  const brand = params.get("brand") ?? "";
  const category = params.get("category") ?? "";
  const minDisc = params.get("minDisc") ?? "";
  const maxDisc = params.get("maxDisc") ?? "";
  const minAi = params.get("minAi") ?? "";
  const sort = params.get("sort") ?? "ai_score";

  const [localQ, setLocalQ] = useState(q);

  useEffect(() => {
    setLocalQ(q);
  }, [q]);

  const setParam = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      startTransition(() => {
        router.push(`?${next.toString()}`);
      });
    },
    [params, router]
  );

  useEffect(() => {
    if (!searchUx) return;
    const t = window.setTimeout(() => {
      const next = localQ.trim();
      const cur = q.trim();
      if (next !== cur) {
        setParam({ q: next || null });
        if (next) track({ type: "search_submit", query: next });
      }
    }, 380);
    return () => window.clearTimeout(t);
  }, [localQ, searchUx, q, setParam]);

  const filterValues: FilterValues = {
    q: searchUx ? localQ : q,
    store,
    brand,
    category,
    minDisc,
    maxDisc,
    minAi,
    sort,
  };

  const effectiveQuery = (searchUx ? localQ : q).trim().toLowerCase();

  const filtered = useMemo(() => {
    let list = [...deals];
    if (effectiveQuery) {
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(effectiveQuery) ||
          (d.brand?.toLowerCase().includes(effectiveQuery) ?? false) ||
          d.tags.some((t) => t.toLowerCase().includes(effectiveQuery)) ||
          (d.category?.toLowerCase().includes(effectiveQuery) ?? false)
      );
    }
    if (store) {
      list = list.filter((d) => dealMatchesStore(d, store));
    }
    if (brand) {
      const b = brands.find((x) => x.slug === brand)?.name.toLowerCase();
      if (b) list = list.filter((d) => d.brand?.toLowerCase() === b);
    }
    if (category) {
      list = list.filter((d) => {
        const slug = (d.category ?? "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        return slug === category;
      });
    }
    if (minDisc) {
      const n = Number(minDisc);
      if (!Number.isNaN(n)) {
        list = list.filter((d) => (d.discountPercent ?? 0) >= n);
      }
    }
    if (maxDisc) {
      const n = Number(maxDisc);
      if (!Number.isNaN(n)) {
        list = list.filter((d) => (d.discountPercent ?? 0) <= n);
      }
    }
    if (minAi) {
      const n = Number(minAi);
      if (!Number.isNaN(n)) {
        list = list.filter((d) => (d.aiScore ?? 0) >= n);
      }
    }
    if (sort === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
      );
    } else if (sort === "biggest_drop") {
      list.sort(
        (a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0)
      );
    } else if (sort === "popularity") {
      list.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    } else {
      list.sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
    }
    return list;
  }, [
    deals,
    effectiveQuery,
    store,
    brand,
    category,
    minDisc,
    maxDisc,
    minAi,
    sort,
    brands,
  ]);

  const suggestions = useMemo(() => {
    const qq = localQ.trim().toLowerCase();
    if (!searchUx || qq.length < 2) return [];
    const out: string[] = [];
    for (const d of deals) {
      if (d.title.toLowerCase().includes(qq) && !out.includes(d.title)) {
        out.push(d.title);
        if (out.length >= 8) break;
      }
    }
    return out;
  }, [deals, localQ, searchUx]);

  const tryExample = (text: string) => {
    setLocalQ(text);
    startTransition(() => {
      const next = new URLSearchParams(params.toString());
      next.set("q", text);
      router.push(`?${next.toString()}`);
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-700">
          {dataSource === "database" ? "Live PostgreSQL" : "Demo catalog"}
        </span>
        {pending && (
          <span className="font-medium text-[var(--accent)]">Applying…</span>
        )}
      </div>

      {searchUx && (
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm sm:px-6">
          <p className="text-sm font-semibold text-neutral-900">
            {filtered.length}{" "}
            {filtered.length === 1 ? "deal" : "deals"}{" "}
            {effectiveQuery
              ? (
                <>
                  found for{" "}
                  <q className="font-bold text-neutral-950 not-italic">
                    {searchUx ? localQ.trim() : q.trim()}
                  </q>
                </>
              ) : (
                "in this view"
              )}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Search updates as you type (short pause before the URL syncs for sharing).
          </p>
        </div>
      )}

      <FilterPanel
        key={`${searchUx ? "sx" : q}-${store}-${brand}-${category}-${minDisc}-${maxDisc}-${minAi}-${sort}`}
        values={filterValues}
        onChange={setParam}
        onReset={() =>
          startTransition(() => {
            setLocalQ("");
            router.push("?");
          })
        }
        categories={categories}
        brands={brands}
        stores={stores}
        pending={pending}
        searchControl={
          searchUx
            ? {
                value: localQ,
                onChange: setLocalQ,
                placeholder: SEARCH_PLACEHOLDER_EXAMPLES,
              }
            : undefined
        }
      />

      {searchUx && suggestions.length > 0 && (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80 px-4 py-3">
          <p className="text-xs font-medium text-neutral-600">Quick picks</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="max-w-full truncate rounded-full border border-neutral-200 bg-white px-3 py-1 text-left text-xs font-medium text-neutral-800 shadow-sm hover:border-[var(--accent)]"
                onClick={() => {
                  setLocalQ(s);
                  setParam({ q: s });
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {!searchUx && (
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-neutral-100 pb-4">
          <p className="text-sm text-neutral-600">
            <strong className="text-lg font-semibold tabular-nums text-neutral-900">
              {filtered.length}
            </strong>{" "}
            {filtered.length === 1 ? "deal" : "deals"} match
          </p>
          <Link
            href="/ai-picks"
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            View AI-ranked picks →
          </Link>
        </div>
      )}

      {searchUx && (
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-neutral-100 pb-4">
          <Link
            href="/ai-picks"
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            View AI-ranked picks →
          </Link>
          <Link
            href="/best-deals"
            className="text-sm font-medium text-neutral-600 hover:text-[var(--accent)]"
          >
            Best deals hub →
          </Link>
        </div>
      )}

      {pending ? (
        <DealGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-16 text-center">
          <SearchX className="mb-4 size-12 text-neutral-300" aria-hidden />
          <p className="text-lg font-semibold text-neutral-800">
            {effectiveQuery
              ? `No deals match “${searchUx ? localQ.trim() : q.trim()}”`
              : "No deals match these filters"}
          </p>
          <p className="mt-2 max-w-md text-sm text-neutral-500">
            {searchUx
              ? "Try a shorter keyword, clear store filters, or use one of the natural-language style examples below."
              : "Try clearing discount or AI thresholds, pick a different store, or browse the full feed."}
          </p>
          {searchUx && (
            <div className="mt-6 flex max-w-lg flex-wrap justify-center gap-2">
              {["nike shoes under 100", "best laptop deals", "skincare deals"].map(
                (ex) => (
                  <Button
                    key={ex}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => tryExample(ex)}
                  >
                    {ex}
                  </Button>
                )
              )}
            </div>
          )}
          <Button
            className="mt-6"
            onClick={() =>
              startTransition(() => {
                setLocalQ("");
                router.push("?");
              })
            }
          >
            Reset all filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      )}
    </div>
  );
}
