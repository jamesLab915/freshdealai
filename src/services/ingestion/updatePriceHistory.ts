import type { PrismaClient } from "@/generated/prisma/client";

/**
 * Append a price snapshot when it differs from the latest stored point (within tolerance).
 */
export async function updatePriceHistory(
  prisma: PrismaClient,
  productId: string,
  price: number,
  tolerance = 0.01
): Promise<void> {
  const last = await prisma.priceHistory.findFirst({
    where: { productId },
    orderBy: { capturedAt: "desc" },
  });

  const lastNum = last ? Number(last.price) : null;
  if (lastNum != null && Math.abs(lastNum - price) < tolerance) {
    return;
  }

  await prisma.priceHistory.create({
    data: {
      productId,
      price,
    },
  });
}
