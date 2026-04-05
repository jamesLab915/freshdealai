"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PRODUCT_IMAGE_PLACEHOLDER,
  resolveProductImageSrc,
} from "@/lib/product-image";

type Props = {
  /** `products.image_url` — prefer site-relative `/product-images/...` */
  src: string | null | undefined;
  alt?: string;
  className?: string;
};

/**
 * Renders product art from DB only; empty → placeholder. No Amazon hotlinks.
 */
export function AmazonShelfImage({ src, alt = "", className }: Props) {
  const [current, setCurrent] = useState(() => resolveProductImageSrc(src));
  const [failedOnce, setFailedOnce] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setFailedOnce(false);
    setBroken(false);
    setCurrent(resolveProductImageSrc(src));
  }, [src]);

  const onError = useCallback(() => {
    if (!failedOnce) {
      setFailedOnce(true);
      setCurrent(PRODUCT_IMAGE_PLACEHOLDER);
      return;
    }
    setBroken(true);
  }, [failedOnce]);

  if (broken) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400 ${className ?? ""}`}
      >
        No image
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local / placeholder paths; avoid next/image remote config
    <img
      src={current}
      alt={alt}
      className={className}
      onError={onError}
      loading="lazy"
      decoding="async"
    />
  );
}
