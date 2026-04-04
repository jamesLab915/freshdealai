import type { ProductSource } from "@/generated/prisma/enums";

export type RawProductRecord = {
  source: ProductSource;
  external_id: string;
  title: string;
  product_url: string;
  image_url?: string | null;
  brand?: string | null;
  category?: string | null;
  currency?: string;
  current_price: number;
  original_price?: number | null;
  affiliate_url?: string | null;
  availability?: string | null;
  rating?: number | null;
  review_count?: number | null;
};

export type NormalizedRecord = RawProductRecord & {
  discount_percent: number | null;
  slug_base: string;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function normalizeProductRecord(raw: RawProductRecord): NormalizedRecord {
  const orig = raw.original_price;
  const cur = raw.current_price;
  let discount_percent: number | null = null;
  if (orig && orig > cur) {
    discount_percent = Math.round(((orig - cur) / orig) * 100);
  }

  return {
    ...raw,
    discount_percent,
    slug_base: slugify(`${raw.brand ?? "deal"}-${raw.title}`).slice(0, 72),
  };
}
