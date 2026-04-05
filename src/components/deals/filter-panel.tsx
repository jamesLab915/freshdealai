"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BrandMeta, CategoryMeta, StoreMeta } from "@/types/deal";

export type FilterValues = {
  q: string;
  store: string;
  category: string;
  brand: string;
  minDisc: string;
  maxDisc: string;
  minPrice: string;
  maxPrice: string;
  minAi: string;
  sort: string;
};

type Props = {
  values: FilterValues;
  onChange: (updates: Record<string, string | null>) => void;
  onReset: () => void;
  categories: CategoryMeta[];
  brands: BrandMeta[];
  stores: StoreMeta[];
  pending?: boolean;
  /** Controlled search field (debounced URL sync lives in parent). */
  searchControl?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
};

export function FilterPanel({
  values,
  onChange,
  onReset,
  categories,
  brands,
  stores,
  pending,
  searchControl,
}: Props) {
  return (
    <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Filters</h2>
          <p className="text-xs text-neutral-500">
            Refined for conversion — same params sync to the URL for sharing.
          </p>
        </div>
        {pending && (
          <span className="text-xs font-medium text-[var(--accent)]">Updating…</span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">
            Search
          </label>
          {searchControl ? (
            <Input
              value={searchControl.value}
              onChange={(e) => searchControl.onChange(e.target.value)}
              placeholder={searchControl.placeholder ?? "Products, brands, keywords…"}
              className="h-10"
              autoComplete="off"
            />
          ) : (
            <Input
              defaultValue={values.q}
              placeholder="Products, brands, keywords…"
              className="h-10"
              onBlur={(e) => onChange({ q: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onChange({ q: (e.target as HTMLInputElement).value });
                }
              }}
            />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">
            Store
          </label>
          <Select
            value={values.store || "all"}
            onValueChange={(v) =>
              onChange({ store: v === "all" ? null : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stores</SelectItem>
              {stores.map((s) => (
                <SelectItem key={s.slug} value={s.slug}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">
            Category
          </label>
          <Select
            value={values.category || "all"}
            onValueChange={(v) =>
              onChange({ category: v === "all" ? null : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">
            Brand
          </label>
          <Select
            value={values.brand || "all"}
            onValueChange={(v) =>
              onChange({ brand: v === "all" ? null : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.slug} value={b.slug}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">
            Min price ($)
          </label>
          <Input
            type="number"
            min={0}
            step={1}
            defaultValue={values.minPrice}
            placeholder="Any"
            className="h-10"
            onBlur={(e) => onChange({ minPrice: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">
            Max price ($)
          </label>
          <Input
            type="number"
            min={0}
            step={1}
            defaultValue={values.maxPrice}
            placeholder="Any"
            className="h-10"
            onBlur={(e) => onChange({ maxPrice: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">
            Discount min %
          </label>
          <Input
            type="number"
            min={0}
            max={90}
            defaultValue={values.minDisc}
            placeholder="0"
            className="h-10"
            onBlur={(e) => onChange({ minDisc: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">
            Discount max %
          </label>
          <Input
            type="number"
            min={0}
            max={90}
            defaultValue={values.maxDisc}
            placeholder="90"
            className="h-10"
            onBlur={(e) => onChange({ maxDisc: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">
            Min AI score
          </label>
          <Input
            type="number"
            min={0}
            max={100}
            defaultValue={values.minAi}
            placeholder="e.g. 75"
            className="h-10"
            onBlur={(e) => onChange({ minAi: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">
            Sort by
          </label>
          <Select
            value={values.sort}
            onValueChange={(v) => onChange({ sort: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai_score">AI score (best first)</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="biggest_drop">Biggest discount</SelectItem>
              <SelectItem value="popularity">Popularity (reviews)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <Button
            type="button"
            variant="secondary"
            className="h-10 w-full"
            onClick={onReset}
          >
            Clear filters
          </Button>
        </div>
      </div>
    </div>
  );
}
