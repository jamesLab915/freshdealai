"use client";

import { useEffect } from "react";

import { pushRecentSlug } from "@/lib/deal-local-storage";
import { track } from "@/lib/tracking";

export function TrackRecentDeal({ slug }: { slug: string }) {
  useEffect(() => {
    pushRecentSlug(slug);
    track({ type: "recently_viewed", slug });
  }, [slug]);
  return null;
}
