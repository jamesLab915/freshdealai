const ASIN_IN_DP = /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i;

export function amazonAsinFromProductUrl(productUrl: string): string | null {
  const m = productUrl.trim().match(ASIN_IN_DP);
  return m?.[1] ?? null;
}

/** Amazon Associates image widget — redirects to a CDN image; reliable without PA-API. */
export function amazonWidgetImageUrl(asin: string): string {
  return `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=US&ASIN=${encodeURIComponent(asin)}&ServiceVersion=20070822&ID=AsinImage&WS=1&Format=_SL500_`;
}
