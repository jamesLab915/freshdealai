import { createHash } from "crypto";

import type { Product } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { ProductSource } from "@/generated/prisma/enums";
import type { GeneratedDealContent } from "@/lib/ai/deal-content-types";
import { fillMissingDealCopy } from "@/services/ai/fillMissingDealCopy";
import { applyAffiliateTags } from "@/lib/affiliate";
import type { FetchedDeal } from "@/lib/deals/fetchDeals";
import { prisma } from "@/lib/prisma";

export type UpsertOutcome =
  | { kind: "inserted" }
  | { kind: "updated" }
  | { kind: "skipped"; reason: string }
  | { kind: "error"; message: string };

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 72) || "deal"
  );
}

function makeSlug(title: string, externalId: string): string {
  const base = slugify(title);
  const h = createHash("sha256").update(externalId).digest("hex").slice(0, 8);
  return `${base}-${h}`.slice(0, 88);
}

function categoryNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureUniqueSlug(
  baseSlug: string,
  productId?: string
): Promise<string> {
  if (!prisma) return baseSlug;
  let candidate = baseSlug;
  let n = 0;
  for (;;) {
    const hit = await prisma.product.findFirst({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!hit || hit.id === productId) return candidate;
    n += 1;
    candidate = `${baseSlug.slice(0, 80)}-x${n}`;
  }
}

async function resolveAiContent(
  deal: FetchedDeal,
  existing: Product | null
): Promise<GeneratedDealContent> {
  const sum = existing?.aiSummary?.trim();
  const reason = existing?.aiReasonToBuy?.trim();
  if (sum && reason) {
    return {
      seoTitle: existing?.seoTitle ?? existing?.title ?? deal.title,
      description: sum,
      shortReview: reason,
      tags: existing?.tags?.length ? [...existing.tags] : [],
    };
  }
  return fillMissingDealCopy(deal, {
    aiSummary: existing?.aiSummary,
    aiReasonToBuy: existing?.aiReasonToBuy,
    seoTitle: existing?.seoTitle,
    tags: existing?.tags ? [...existing.tags] : undefined,
  });
}

function isPriceValid(price: number): boolean {
  return Number.isFinite(price) && price > 0;
}

/**
 * Upsert one fetched deal — dedupe by source + externalId, slug collision handling,
 * optional price_history on change, AI only when copy is missing.
 */
export async function upsertProductFromFetched(
  deal: FetchedDeal
): Promise<UpsertOutcome> {
  if (!prisma) {
    return { kind: "skipped", reason: "no_database" };
  }

  if (!isPriceValid(deal.price)) {
    return { kind: "skipped", reason: "invalid_current_price" };
  }

  const externalId = `${deal.source}:${deal.id}`;
  const whereKey = {
    source_externalId: {
      source: ProductSource.MANUAL,
      externalId,
    },
  };

  let existing: Product | null = null;
  try {
    existing = await prisma.product.findUnique({ where: whereKey });
  } catch (e) {
    return {
      kind: "error",
      message: e instanceof Error ? e.message : "lookup_failed",
    };
  }

  const baseSlug = makeSlug(deal.title, externalId);
  const slug = existing?.slug
    ? existing.slug
    : await ensureUniqueSlug(baseSlug, undefined);

  const productUrl = deal.url.trim();
  const monetized = applyAffiliateTags(productUrl);
  /** Prefer manual admin `affiliate_url`; otherwise auto-fill with tag-injected URL. */
  const affiliateUrl = existing?.affiliateUrl?.trim()
    ? existing.affiliateUrl
    : monetized;

  const discount =
    deal.discount ??
    (deal.originalPrice != null && deal.originalPrice > deal.price
      ? Math.round(
          ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
        )
      : null);

  const aiScore = Math.min(
    98,
    Math.max(38, (discount ?? 25) + (deal.title.length > 40 ? 8 : 12))
  );

  let ai: GeneratedDealContent;
  try {
    ai = await resolveAiContent(deal, existing);
  } catch (e) {
    return {
      kind: "error",
      message: e instanceof Error ? e.message : "ai_failed",
    };
  }

  const now = new Date();
  const nextPrice = new Prisma.Decimal(deal.price);
  const nextOriginal =
    deal.originalPrice != null && isPriceValid(deal.originalPrice)
      ? new Prisma.Decimal(deal.originalPrice)
      : null;

  try {
    if (existing) {
      const prevNum = toNumber(existing.currentPrice);
      const nextNum = deal.price;
      if (prevNum !== nextNum) {
        await prisma.priceHistory.create({
          data: {
            productId: existing.id,
            price: nextPrice,
          },
        });
      }

      await prisma.product.update({
        where: { id: existing.id },
        data: {
          title: deal.title,
          normalizedTitle: deal.title.toLowerCase(),
          category: deal.category,
          imageUrl: deal.image,
          productUrl,
          affiliateUrl,
          currentPrice: nextPrice,
          originalPrice: nextOriginal,
          discountPercent: discount,
          aiScore,
          aiSummary: ai.description,
          aiReasonToBuy: ai.shortReview,
          tags: ai.tags,
          seoTitle: ai.seoTitle,
          seoDescription: ai.description,
          published: true,
          lastSeenAt: now,
        },
      });
      return { kind: "updated" };
    }

    await prisma.product.create({
      data: {
        source: ProductSource.MANUAL,
        externalId,
        title: deal.title,
        normalizedTitle: deal.title.toLowerCase(),
        brand: null,
        category: deal.category,
        subcategory: null,
        imageUrl: deal.image,
        productUrl,
        affiliateUrl,
        currency: "USD",
        currentPrice: nextPrice,
        originalPrice: nextOriginal,
        discountPercent: discount,
        aiScore,
        aiSummary: ai.description,
        aiReasonToBuy: ai.shortReview,
        availability: "In stock",
        rating: null,
        reviewCount: null,
        tags: ai.tags,
        slug,
        seoTitle: ai.seoTitle,
        seoDescription: ai.description,
        published: true,
        lastSeenAt: now,
      },
    });
    return { kind: "inserted" };
  } catch (e) {
    return {
      kind: "error",
      message: e instanceof Error ? e.message : "persist_failed",
    };
  }
}

function toNumber(n: unknown): number {
  if (typeof n === "number") return n;
  if (n && typeof (n as { toNumber?: () => number }).toNumber === "function") {
    return (n as { toNumber: () => number }).toNumber();
  }
  return Number(n);
}

export async function syncCategoriesFromProducts(): Promise<void> {
  if (!prisma) return;

  const rows = await prisma.product.groupBy({
    by: ["category"],
    where: { category: { not: null }, published: true },
    _count: { _all: true },
  });

  for (const row of rows) {
    const name = row.category;
    if (!name) continue;
    const slug = categoryNameToSlug(name);
    await prisma.category.upsert({
      where: { slug },
      create: {
        slug,
        name,
        dealCount: row._count._all,
      },
      update: {
        name,
        dealCount: row._count._all,
      },
    });
  }
}
