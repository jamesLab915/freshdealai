import { Prisma } from "@/generated/prisma/client";
import { syntheticPriceFieldsForProductKey } from "@/lib/deals/syntheticAmazonPricing";
import { prisma } from "@/lib/prisma";

/**
 * Ensures every product row has list + sale + discount (for UI Save $ / %).
 * Uses the same deterministic synthetic bundle as `fetchDeals` (key = `external_id`).
 */
export async function backfillIncompleteProductPrices(): Promise<number> {
  if (!prisma) return 0;

  const rows = await prisma.product.findMany({
    where: {
      OR: [
        { originalPrice: null },
        { discountPercent: null },
        { discountPercent: { lte: 10 } },
      ],
    },
    select: { id: true, externalId: true },
  });

  let n = 0;
  for (const r of rows) {
    const p = syntheticPriceFieldsForProductKey(r.externalId);
    await prisma.product.update({
      where: { id: r.id },
      data: {
        currentPrice: new Prisma.Decimal(p.currentPrice),
        originalPrice: new Prisma.Decimal(p.originalPrice),
        discountPercent: p.discountPercent,
      },
    });
    n += 1;
  }

  return n;
}
