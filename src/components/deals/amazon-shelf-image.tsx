"use client";

import { useCallback, useEffect, useState } from "react";

import {
  amazonAsinFromProductUrl,
  amazonWidgetImageUrl,
} from "@/lib/amazon-media";

type Props = {
  primary: string | null;
  productUrl: string;
  alt?: string;
  className?: string;
};

/**
 * Product hero image with Amazon widget CDN fallback when the stored URL 404s.
 */
export function AmazonShelfImage({ primary, productUrl, alt = "", className }: Props) {
  const asin = amazonAsinFromProductUrl(productUrl);
  const fallback = asin ? amazonWidgetImageUrl(asin) : null;

  const [src, setSrc] = useState<string | null>(primary?.trim() || null);
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    setSrc(primary?.trim() || null);
    setTriedFallback(false);
  }, [primary]);

  const onError = useCallback(() => {
    if (!triedFallback && fallback && src !== fallback) {
      setTriedFallback(true);
      setSrc(fallback);
      return;
    }
    setSrc(null);
  }, [triedFallback, fallback, src]);

  if (!src) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        No image
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- intentional: onError fallback for arbitrary merchant CDNs
    <img
      src={src}
      alt={alt}
      className={className}
      onError={onError}
      loading="lazy"
      decoding="async"
    />
  );
}
