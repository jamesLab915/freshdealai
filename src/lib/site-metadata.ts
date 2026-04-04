import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/env";

type Opts = {
  title: string;
  description: string;
  path: string;
  /** Use for home so the root title template is not applied twice. */
  absoluteTitle?: boolean;
};

/** Canonical + OG + Twitter for marketing pages (requires `metadataBase` in root layout). */
export function siteMetadata(opts: Opts): Metadata {
  const base = getSiteUrl();
  const path = opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  const url = `${base}${path}`;

  const titleField: Metadata["title"] = opts.absoluteTitle
    ? { absolute: opts.title }
    : opts.title;

  return {
    title: titleField,
    description: opts.description,
    alternates: { canonical: path },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "FlashDealAI",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
    },
  };
}
