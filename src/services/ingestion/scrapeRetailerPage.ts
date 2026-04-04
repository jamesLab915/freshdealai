/**
 * Pluggable scraper for allowed retailer promo pages.
 * Keep HTTP + parsing out of Next.js RSC — run from workers/cron in production.
 */
export type ScrapedOffer = {
  external_id: string;
  title: string;
  product_url: string;
  image_url?: string | null;
  current_price: number;
  original_price?: number | null;
  currency?: string;
};

export async function scrapeRetailerPage(
  _url: string
): Promise<ScrapedOffer[]> {
  void _url;
  // Stub: replace with cheerio/playwright + robots.txt checks + per-retailer adapters.
  return [];
}
