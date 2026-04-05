import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DealCard } from "@/components/deal-card";
import { getSiteUrl } from "@/lib/env";
import { getBrandSlugsForStaticGeneration } from "@/lib/seo-catalog-params";
import { buildBrandDealsIntro } from "@/lib/seo-hub-intro";
import { getBrands, getDeals } from "@/services/deals";

type Props = { params: Promise<{ brandSlug: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getBrandSlugsForStaticGeneration();
  return slugs.map((brandSlug) => ({ brandSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug } = await params;
  const brands = await getBrands();
  const meta = brands.find((b) => b.slug === brandSlug);
  if (!meta) return { title: "Brand deals" };
  const titleAbs = `Best ${meta.name} deals — discounts & offers`;
  const description = `Shop ${meta.name} with AI-ranked deals — compare prices, read quick verdicts, and exit via transparent affiliate links.`;
  const path = `/best-brand-deals/${brandSlug}`;
  const url = `${getSiteUrl()}${path}`;
  return {
    title: { absolute: titleAbs },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: titleAbs,
      description,
      url,
      type: "website",
      siteName: "FlashDealAI",
    },
    twitter: { card: "summary_large_image", title: titleAbs, description },
  };
}

export default async function BestBrandDealsPage({ params }: Props) {
  const { brandSlug } = await params;
  const brands = await getBrands();
  const meta = brands.find((b) => b.slug === brandSlug);
  if (!meta) notFound();

  const { deals, source } = await getDeals({
    brand: brandSlug,
    sort: "ai_score",
  });
  const grid = deals.slice(0, 10);
  const sourceLabel = source === "database" ? "PostgreSQL" : "demo catalog";
  const intro = buildBrandDealsIntro(meta.name, grid.length, sourceLabel);

  return (
    <div>
      <section className="border-b border-neutral-200 bg-gradient-to-r from-orange-50/90 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Brand shelf
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Best {meta.name} deals
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-neutral-700">
            {intro}
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            <Link href="/deals" className="font-semibold text-[var(--accent)] hover:underline">
              All deals
            </Link>
            {" · "}
            <Link href="/search" className="font-semibold text-neutral-600 hover:underline">
              Search
            </Link>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      </div>
    </div>
  );
}
