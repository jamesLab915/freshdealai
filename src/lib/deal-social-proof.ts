import { createHash } from "crypto";

import type { DealProduct } from "@/types/deal";

/** Stable pseudo “views” for social proof (deterministic per deal id). */
export function estimateViewCount(dealId: string): number {
  const h = createHash("sha256").update(dealId).digest();
  const n = h.readUInt32BE(0) % 420;
  return 18 + n;
}

export function isRecentlyUpdated(lastSeenAt: string, hours = 48): boolean {
  const t = new Date(lastSeenAt).getTime();
  return Date.now() - t < hours * 3600 * 1000;
}

export function hasPriceDropSignal(history: DealProduct["priceHistory"]): boolean {
  if (!history || history.length < 2) return false;
  const sorted = [...history].sort(
    (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
  );
  const newest = sorted[0]?.price;
  const older = sorted[sorted.length - 1]?.price;
  if (newest == null || older == null || older <= newest) return false;
  return ((older - newest) / older) * 100 >= 5;
}
