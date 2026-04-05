import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { HubDealsGrid } from "@/components/seo/hub-deals-grid";
import { FaqBlock } from "@/components/seo/faq-block";
import { getSiteUrl } from "@/lib/env";
import { getCategorySlugsForStaticGeneration } from "@/lib/seo-catalog-params";
import { sortDealsForHub } from "@/lib/deal-sorting";
import { bestDealsElectronicsHubFaq } from "@/lib/seo-landing-copy";
import { resolveHubIntro } from "@/services/ai/hubIntro";
import {
  getCategories,
  getDeals,
  getEngagementStatsForProductIds,
} from "@/services/deals";

type Props = { params: Promise<{ category: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getCategorySlugsForStaticGeneration();
  return slugs.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories();
  const meta = categories.find((c) => c.slug === category);
  if (!meta) return { title: "Best deals" };
  const titleAbs = `${meta.name} deals we’d spotlight today | FlashDealAI`;
  const blurb = (meta.description ?? `${meta.name} on FlashDealAI`).slice(0, 120);
  const description = `${meta.name} shortlist: AI-scored US discounts with clear retailer links — ${blurb}…`;
  const path = `/best-deals/${category}`;
  const url = `${getSiteUrl()}${path}`;
  return {
    title: { absolute: titleAbs },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${meta.name} — best deals hub`,
      description,
      url,
      type: "website",
      siteName: "FlashDealAI",
    },
    twitter: { card: "summary_large_image", title: titleAbs, description },
  };
}

export default async function BestDealsCategoryPage({ params }: Props) {
  const { category } = await params;
  const categories = await getCategories();
  const meta = categories.find((c) => c.slug === category);
  if (!meta) notFound();

  const { deals: initialDeals, source } = await getDeals({
    category,
    sort: "ai_score",
    minAiScore: 65,
  });
  let grid = sortDealsForHub(initialDeals, "best_deals").slice(0, 24);
  let thinNote: string | null = null;

  if (grid.length === 0) {
    const relaxed = await getDeals({ category, sort: "ai_score" });
    grid = sortDealsForHub(relaxed.deals, "best_deals").slice(0, 24);
    thinNote =
      "Strict filters returned nothing — we relaxed the AI floor so this category hub still has picks. Verify each price on the retailer.";
  } else if (grid.length < 4) {
    thinNote =
      "Slim shelf in this category right now — these rows still cleared our review bar.";
  }

  const sourceLabel = source === "database" ? "PostgreSQL" : "demo catalog";
  const intro = await resolveHubIntro({
    kind: "best-deals-category",
    dealCount: grid.length,
    sourceLabel,
    categoryName: meta.name,
    categorySlug: category,
  });
  const engagementMap = await getEngagementStatsForProductIds(
    grid.map((d) => d.id)
  );

  const faqItems =
    category === "electronics"
      ? bestDealsElectronicsHubFaq
      : [
          {
            q: `How are ${meta.name} deals ranked?`,
            a: "AI scores blend discount depth, retailer trust, and listing quality — editors can pin order with rank fields; nothing is pay-to-play.",
          },
          {
            q: "Do prices change?",
            a: "Yes. We refresh on a schedule; lightning deals end. Always confirm the cart total on the merchant site.",
          },
        ];

  return (
    <div>
      <section className="border-b border-neutral-200 bg-gradient-to-r from-orange-50/90 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Category hub
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Best {meta.name} deals
          </h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-neutral-800 sm:text-lg">
            {intro}
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            Showing {grid.length} offers ·{" "}
            <Link href="/best-deals" className="font-semibold text-[var(--accent)] hover:underline">
              All best deals
            </Link>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <HubDealsGrid
          deals={grid}
          engagementByProductId={engagementMap}
          thinShelfNote={thinNote}
          thinThreshold={4}
        />

        <FaqBlock title="FAQ" items={faqItems} />
      </div>
    </div>
  );
}
