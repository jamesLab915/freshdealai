import { createHash } from "crypto";

import { ProductSource } from "@/generated/prisma/enums";

/**
 * Normalized row ready for Prisma `Product` create (ingestion pipeline).
 * Caller supplies `lastSeenAt` / `published` as needed.
 */
export type CsvProductDraft = {
  source: (typeof ProductSource)[keyof typeof ProductSource];
  externalId: string;
  title: string;
  slug: string;
  normalizedTitle: string | null;
  brand: string | null;
  category: string | null;
  productUrl: string;
  affiliateUrl: string | null;
  currency: string;
  currentPrice: number;
  originalPrice: number | null;
  discountPercent: number | null;
  imageUrl: string | null;
  tags: string[];
};

export type CsvImportResult = {
  rows: CsvProductDraft[];
  errors: { line: number; message: string }[];
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "deal";
}

/** Minimal CSV line splitter — handles quoted fields with commas. */
export function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (!inQ && c === ",") {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

const HEADER_ALIASES: Record<string, string> = {
  title: "title",
  name: "title",
  slug: "slug",
  brand: "brand",
  category: "category",
  product_url: "productUrl",
  producturl: "productUrl",
  url: "productUrl",
  affiliate_url: "affiliateUrl",
  affiliateurl: "affiliateUrl",
  current_price: "currentPrice",
  price: "currentPrice",
  original_price: "originalPrice",
  msrp: "originalPrice",
  currency: "currency",
  image_url: "imageUrl",
  image: "imageUrl",
  tags: "tags",
};

function mapHeader(h: string): string {
  const k = h.trim().toLowerCase().replace(/\s+/g, "_");
  return HEADER_ALIASES[k] ?? k;
}

function parseNum(s: string | undefined): number | null {
  if (s == null || s === "") return null;
  const n = Number(String(s).replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function stableExternalId(productUrl: string, title: string): string {
  const h = createHash("sha256").update(productUrl + "\0" + title).digest("hex");
  return `csv-${h.slice(0, 24)}`;
}

/**
 * Parse deal-oriented CSV into drafts. Expected headers (any order), e.g.:
 * `title,product_url,current_price,brand,category,affiliate_url,original_price,currency,image_url,tags`
 */
export function importCsvDeals(csvText: string): CsvImportResult {
  const errors: { line: number; message: string }[] = [];
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { rows: [], errors: [{ line: 0, message: "Empty CSV" }] };
  }

  const headerCells = splitCsvLine(lines[0]!);
  const headers = headerCells.map(mapHeader);

  const rows: CsvProductDraft[] = [];

  for (let i = 1; i < lines.length; i++) {
    const lineNo = i + 1;
    const cells = splitCsvLine(lines[i]!);
    const raw: Record<string, string> = {};
    headers.forEach((h, j) => {
      raw[h] = cells[j] ?? "";
    });

    const title = raw.title?.trim();
    const productUrl = raw.productUrl?.trim();
    if (!title || !productUrl) {
      errors.push({
        line: lineNo,
        message: "Missing title or product_url",
      });
      continue;
    }

    const price = parseNum(raw.currentPrice ?? undefined);
    if (price == null || price < 0) {
      errors.push({ line: lineNo, message: "Invalid current_price" });
      continue;
    }

    const orig = parseNum(raw.originalPrice ?? undefined);
    const slugRaw = raw.slug?.trim();
    const baseSlug = slugRaw || slugify(title);
    const slug = `${baseSlug}-${stableExternalId(productUrl, title).slice(-6)}`;

    let discountPercent: number | null = null;
    if (orig != null && orig > price) {
      discountPercent = Math.round(((orig - price) / orig) * 100);
    }

    const tagList = (raw.tags ?? "")
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const draft: CsvProductDraft = {
      source: ProductSource.CSV_IMPORT,
      externalId: stableExternalId(productUrl, title),
      title,
      slug,
      normalizedTitle: title,
      brand: raw.brand?.trim() || null,
      category: raw.category?.trim() || null,
      productUrl,
      affiliateUrl: raw.affiliateUrl?.trim() || null,
      currency: (raw.currency?.trim() || "USD").slice(0, 8),
      currentPrice: price,
      originalPrice: orig,
      discountPercent,
      imageUrl: raw.imageUrl?.trim() || null,
      tags: tagList.length ? tagList : ["imported"],
    };

    rows.push(draft);
  }

  return { rows, errors };
}
