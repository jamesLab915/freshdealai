const ASIN_IN_DP = /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i;

export function amazonAsinFromProductUrl(productUrl: string): string | null {
  const m = productUrl.trim().match(ASIN_IN_DP);
  return m?.[1] ?? null;
}

/**
 * Official Amazon Associates SiteStripe-style image widget (redirects to CDN).
 * Uses `AMAZON_ASSOCIATE_TAG` when set (omit empty to avoid invalid `tag=`).
 */
export function getAmazonImage(asin: string): string {
  const tag = process.env.AMAZON_ASSOCIATE_TAG?.trim();
  let url =
    `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${encodeURIComponent(asin)}` +
    `&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1`;
  if (tag) {
    url += `&tag=${encodeURIComponent(tag)}`;
  }
  return url;
}

/** @deprecated Use getAmazonImage — kept for any older imports. */
export function amazonWidgetImageUrl(asin: string): string {
  return getAmazonImage(asin);
}
