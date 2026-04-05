import Link from "next/link";
import type { Metadata } from "next";

import { DealCard } from "@/components/deal-card";
import { FaqBlock } from "@/components/seo/faq-block";
import { sortDealsForHub } from "@/lib/deal-sorting";
import { getSiteUrl } from "@/lib/env";
import { mockBrands, mockCategories } from "@/lib/mock-deals";
import { generateBrandCategoryStaticParams } from "@/lib/seo-static-params";
import { buildBrandCategoryHubIntro } from "@/lib/seo-hub-intro";
import { getDeals } from "@/services/deals";

type Props = {
  params: Promise<{ brandSlug: string; categorySlug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  return generateBrandCategoryStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, categorySlug } = await params;
  const b = mockBrands.find((x) => x.slug === brandSlug);
  const c = mockCategories.find((x) => x.slug === categorySlug);
  const brandName = b?.name ?? brandSlug.replace(/-/g, " ");
  const catName = c?.name ?? categorySlug.replace(/-/g, " ");
  const titleAbs = `Best ${brandName} ${catName} deals — AI-ranked`;
  const description = `${brandName} offers in ${catName} — filtered for discount signals and listing quality.`;
  const path = `/best-deals/brand/${brandSlug}/category/${categorySlug}`;
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

export default async function BestDealsBrandCategoryPage({ params }: Props) {
  const { brandSlug, categorySlug } = await params;
  const b = mockBrands.find((x) => x.slug === brandSlug);
  const c = mockCategories.find((x) => x.slug === categorySlug);
  const brandLabel = b?.name ?? brandSlug.replace(/-/g, " ");
  const catLabel = c?.name ?? categorySlug.replace(/-/g, " ");

  const { deals, source } = await getDeals({
    brand: brandSlug,
    category: categorySlug,
    sort: "ai_score",
  });
  const grid = sortDealsForHub(deals, "best_deals").slice(0, 36);
  const sourceLabel = source === "database" ? "PostgreSQL" : "demo catalog";
  const intro = buildBrandCategoryHubIntro(
    brandLabel,
    catLabel,
    grid.length,
    sourceLabel
  );

  return (
    <div>
      <section className="border-b border-neutral-200 bg-gradient-to-r from-orange-50/90 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Brand × category
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Best {brandLabel} {catLabel} deals
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-neutral-700">
            {intro}
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            {grid.length} offers ·{" "}
            <Link
              href={`/best-brand-deals/${brandSlug}`}
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              All {brandLabel} deals
            </Link>
            {" · "}
            <Link
              href={`/best-deals/${categorySlug}`}
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              {catLabel} hub
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

        <FaqBlock
          title="FAQ"
          items={[
            {
              q: `Why a ${brandLabel} + ${catLabel} page?`,
              a: "It narrows the shelf for shoppers who already know the brand and category — less noise than broad search.",
            },
            {
              q: "Do you include third-party sellers?",
              a: "We link what’s in our catalog; marketplace sellers can vary — verify the seller on the checkout page.",
            },
          ]}
        />
      </div>
    </div>
  );
}
