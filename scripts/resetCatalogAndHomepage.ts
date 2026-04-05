/**
 * Neon-only: delete invalid catalog rows → run deal-engine → pin 6 homepage deals.
 * Usage: `npx tsx scripts/resetCatalogAndHomepage.ts` (loads `.env` via dotenv)
 */
import "dotenv/config";

import type { Prisma } from "../src/generated/prisma/client";
import { runDealEngine } from "../src/lib/deal-engine/runDealEngine";
import { isPriceContextIncomplete } from "../src/lib/deal-mock-extras";
import { isPrimaryShelfAmazonDeal } from "../src/lib/deal-shelf-eligibility";
import { prisma } from "../src/lib/prisma";
import { mapProductToDeal } from "../src/services/deals/repository";
import type { DealProduct } from "../src/types/deal";

const BAD_TITLE =
  /placeholder|lorem\s+ipsum|fake\s+(deal|product)|^\s*test\s+deal\b|^\s*demo\s+deal\b|your\s+product\s+title|example\s+listing|not\s+a\s+real\s+product/i;

function assertNeonDatabaseUrl(): void {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) {
    console.error("[reset] DATABASE_URL is not set.");
    process.exit(1);
  }
  const host = (() => {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();
  if (!host.includes("neon") && !host.endsWith("neon.tech")) {
    console.error(
      "[reset] Refusing to run: DATABASE_URL host must be Neon (expected hostname containing `neon`)."
    );
    process.exit(1);
  }
}

function invalidStructuralWhere(): Prisma.ProductWhereInput {
  return {
    OR: [
      { productUrl: { equals: "" } },
      {
        NOT: {
          productUrl: { contains: "amazon.com/dp/", mode: "insensitive" },
        },
      },
      { productUrl: { contains: "example", mode: "insensitive" } },
      { affiliateUrl: { contains: "example", mode: "insensitive" } },
      { affiliateUrl: { contains: "yourtag", mode: "insensitive" } },
      { imageUrl: null },
      { imageUrl: { equals: "" } },
      { imageUrl: { contains: "example", mode: "insensitive" } },
      { originalPrice: null },
      { discountPercent: null },
      { currentPrice: { lte: 0 } },
      { title: { contains: "placeholder", mode: "insensitive" } },
      { title: { contains: "lorem ipsum", mode: "insensitive" } },
      { title: { contains: "fake product", mode: "insensitive" } },
      { title: { contains: "fake deal", mode: "insensitive" } },
    ],
  };
}

function firstWord(title: string): string {
  return title.split(/[\s–—,:]+/)[0]?.toLowerCase() ?? "";
}

function pickFromCategory(
  pool: DealProduct[],
  category: string,
  limit: number
): DealProduct[] {
  const rows = pool
    .filter((d) => d.category === category)
    .sort((a, b) => a.currentPrice - b.currentPrice);
  const out: DealProduct[] = [];
  const seenBrand = new Set<string>();
  for (const d of rows) {
    if (out.length >= limit) break;
    const fw = firstWord(d.title);
    if (seenBrand.has(fw) && rows.length > limit * 4) continue;
    seenBrand.add(fw);
    out.push(d);
  }
  for (const d of rows) {
    if (out.length >= limit) break;
    if (!out.some((x) => x.id === d.id)) out.push(d);
  }
  return out.slice(0, limit);
}

async function pickHomepageSix(): Promise<DealProduct[]> {
  if (!prisma) throw new Error("no prisma");
  const rows = await prisma.product.findMany({
    where: { published: true, excludeFromHubs: false },
    include: { priceHistory: { orderBy: { capturedAt: "desc" }, take: 4 } },
  });
  const pool = rows
    .map(mapProductToDeal)
    .filter(
      (d) =>
        isPrimaryShelfAmazonDeal(d) &&
        !isPriceContextIncomplete(d) &&
        Boolean(d.imageUrl?.trim())
    );

  let chosen: DealProduct[] = [];
  chosen.push(...pickFromCategory(pool, "Electronics", 3));
  chosen.push(...pickFromCategory(pool, "Home & Kitchen", 2));
  chosen.push(...pickFromCategory(pool, "Health & Fitness", 1));
  const used = new Set(chosen.map((c) => c.id));
  if (chosen.length < 6) {
    const rest = pool
      .filter((d) => !used.has(d.id))
      .sort((a, b) => a.currentPrice - b.currentPrice);
    for (const d of rest) {
      if (chosen.length >= 6) break;
      chosen.push(d);
    }
  }
  chosen = chosen.slice(0, 6);
  return chosen;
}

async function main(): Promise<void> {
  assertNeonDatabaseUrl();
  if (!prisma) {
    console.error("[reset] Prisma client is null.");
    process.exit(1);
  }

  const structural = invalidStructuralWhere();
  const structuralIds = (
    await prisma.product.findMany({
      where: structural,
      select: { id: true },
    })
  ).map((r) => r.id);

  const titleRows = await prisma.product.findMany({
    select: { id: true, title: true },
  });
  const titleIds = titleRows
    .filter((r) => BAD_TITLE.test(r.title))
    .map((r) => r.id);

  const toDelete = new Set([...structuralIds, ...titleIds]);
  console.log(`[cleanup] structural/rule matches: ${structuralIds.length}`);
  console.log(`[cleanup] title-pattern matches: ${titleIds.length}`);
  console.log(`[cleanup] unique ids to delete: ${toDelete.size}`);

  if (toDelete.size > 0) {
    const del = await prisma.product.deleteMany({
      where: { id: { in: [...toDelete] } },
    });
    console.log(`[cleanup] deleted: ${del.count}`);
  } else {
    console.log("[cleanup] deleted: 0");
  }

  console.log("[deal-engine] running...");
  const engine = await runDealEngine();
  console.log(`[deal-engine] ${engine.message}`);
  if (!engine.ok) {
    console.error("[deal-engine] failed");
    process.exit(1);
  }
  console.log(
    `[deal-engine] inserted=${engine.metrics.inserted} updated=${engine.metrics.updated} skipped=${engine.metrics.skipped} errors=${engine.metrics.errors.length}`
  );
  if (engine.metrics.errors.length) {
    console.log("[deal-engine] error detail:", engine.metrics.errors);
  }

  await prisma.product.updateMany({
    data: { homepageRank: null, featured: false },
  });

  const top = await pickHomepageSix();
  console.log(`[homepage] pinning ${top.length} deals`);
  for (let i = 0; i < top.length; i++) {
    const d = top[i]!;
    await prisma.product.update({
      where: { id: d.id },
      data: {
        homepageRank: i + 1,
        featured: true,
        excludeFromHubs: false,
        published: true,
      },
    });
    console.log(`[homepage] rank ${i + 1}: ${d.title.slice(0, 90)}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
