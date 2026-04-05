/** Site-local product art only — no Amazon hotlinks in UI (see `scripts/cacheAmazonImages.ts`). */

export const PRODUCT_IMAGE_PLACEHOLDER = "/product-images/placeholder.jpg";

/** True when the row has no real cached art (empty URL or explicit placeholder path). */
export function isPlaceholderProductImage(
  imageUrl: string | null | undefined
): boolean {
  const t = imageUrl?.trim() ?? "";
  if (!t) return true;
  const pathOnly = t.split("?")[0] ?? t;
  return (
    pathOnly === PRODUCT_IMAGE_PLACEHOLDER ||
    pathOnly.endsWith("/placeholder.jpg")
  );
}

export function localProductImagePath(asin: string): string {
  return `/product-images/${encodeURIComponent(asin)}.jpg`;
}

export function resolveProductImageSrc(
  imageUrl: string | null | undefined
): string {
  const t = imageUrl?.trim();
  if (t) return t;
  return PRODUCT_IMAGE_PLACEHOLDER;
}

/** Open Graph / Twitter need absolute URLs when `imageUrl` is site-relative. */
export function absoluteProductImageUrlForOg(
  imageUrl: string | null | undefined,
  siteOrigin: string
): string | undefined {
  const t = imageUrl?.trim();
  if (!t) return undefined;
  if (t.startsWith("/")) {
    const origin = siteOrigin.replace(/\/$/, "");
    return `${origin}${t}`;
  }
  return t;
}
