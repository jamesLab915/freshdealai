import { ProductSource } from "@/generated/prisma/enums";
import { applyAffiliateTags } from "@/lib/affiliate";
import type { RawProductRecord } from "@/services/ingestion/normalizeProductRecord";

export type AmazonPaSearchParams = {
  keywords: string;
  marketplace?: string;
};

/**
 * Amazon Product Advertising API adapter (stub).
 * Implement `SearchItems` / `GetItems` with signed requests per Amazon PA-API docs.
 */
export async function amazonIngestFromPaApi(
  _params: AmazonPaSearchParams
): Promise<RawProductRecord[]> {
  void _params;
  return [];
}

/** Example mapper for when PA-API JSON is available. */
export function mapAmazonItemToRaw(item: {
  asin: string;
  title: string;
  detailPageUrl: string;
  imageUrl?: string;
  priceAmount?: number;
  listPriceAmount?: number;
  currency?: string;
}): RawProductRecord {
  return {
    source: ProductSource.AMAZON_PA_API,
    external_id: item.asin,
    title: item.title,
    product_url: item.detailPageUrl,
    image_url: item.imageUrl ?? null,
    brand: null,
    currency: item.currency ?? "USD",
    current_price: item.priceAmount ?? 0,
    original_price: item.listPriceAmount ?? null,
    affiliate_url: applyAffiliateTags(item.detailPageUrl),
  };
}
