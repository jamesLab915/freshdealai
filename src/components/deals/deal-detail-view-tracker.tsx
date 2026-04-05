"use client";

import { useEffect, useRef } from "react";

/** Fire-and-forget server increment for `detail_views` (best-effort). */
export function DealDetailViewTracker({ slug }: { slug: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void fetch(`/api/deals/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => {});
  }, [slug]);
  return null;
}
