const ASIN_IN_DP = /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i;

/** Extract ASIN from an Amazon `/dp/{ASIN}` URL. */
export function amazonAsinFromProductUrl(productUrl: string): string | null {
  const m = productUrl.trim().match(ASIN_IN_DP);
  return m?.[1] ?? null;
}
