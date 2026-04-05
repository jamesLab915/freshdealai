import type { DealProduct } from "@/types/deal";

/**
 * Homepage first row + primary SEO hubs should only surface shoppable Amazon detail URLs,
 * not legacy mock rows (e.g. `/dp/example`, EXAMPLE placeholders).
 */
export function isPrimaryShelfAmazonDeal(deal: DealProduct): boolean {
  const raw = (deal.productUrl ?? "").trim();
  if (!raw) return false;
  const u = raw.toLowerCase();
  if (!u.includes("amazon.com/dp/")) return false;
  if (u.includes("example")) return false;
  return true;
}
