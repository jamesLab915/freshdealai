import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DealCard } from "@/components/deal-card";
import { HubDealsGrid } from "@/components/seo/hub-deals-grid";
import { FaqBlock } from "@/components/seo/faq-block";
import { getSiteUrl } from "@/lib/env";
import { getCategorySlugsForStaticGeneration } from "@/lib/seo-catalog-params";
import { sortDealsForHub } from "@/lib/deal-sorting";
import {
  top10ElectronicsLaunchFaq,
} from "@/lib/seo-landing-copy";
import { resolveHubIntro } from "@/services/ai/hubIntro";
import {
  getCategories,
  getDeals,
  getEngagementStatsForProductIds,
} from "@/services/deals";

type Props = { params: Promise<{ categorySlug: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getCategorySlugsForStaticGeneration();
  return slugs.map((categorySlug) => ({ categorySlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const categories = await getCategories();
  const meta = categories.find((c) => c.slug === categorySlug);
  if (!meta) return { title: "Top 10 deals" };
  const isElec = categorySlug === "electronics";
  const titleAbs = isElec
    ? "10 electronics deals worth your cart — FlashDealAI shortlist"
    : `10 ${meta.name} deals we’d actually consider — FlashDealAI`;
  const description = isElec
    ? "A scannable list of ten electronics offers: AI-backed value signals, transparent retailer links, no pay-to-rank slots."
    : `Ten ${meta.name.toLowerCase()} picks with AI scoring and honest shop links — built to read on mobile, not endless scroll.`;
  const path = `/top-10-best-deals/${categorySlug}`;
  const url = `${getSiteUrl()}${path}`;
  return {
    title: { absolute: titleAbs },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: isElec ? "10 electronics deals — shortlist" : `10 ${meta.name} deals`,
      description,
      url,
      type: "website",
      siteName: "FlashDealAI",
    },
    twitter: { card: "summary_large_image", title: titleAbs, description },
  };
}

const defaultTop10Faq = (name: string) => [
  {
    q: "Why only ten?",
    a: "It’s a deliberate shortlist for fast decisions. Open the category best-deals hub if you want the wider shelf.",
  },
  {
    q: `How often does this ${name} list change?`,
    a: "Whenever prices and scores refresh from ingestion — not locked to a weekly calendar.",
  },
  {
    q: "Are these affiliate links?",
    a: "Outbound buttons may earn us a commission; ranking is still from our model and editor fields, not payment for placement.",
  },
];

export default async function Top10CategoryDealsPage({ params }: Props) {
  const { categorySlug } = await params;
  const categories = await getCategories();
  const meta = categories.find((c) => c.slug === categorySlug);
  if (!meta) notFound();

  const { deals, source } = await getDeals({
    category: categorySlug,
    sort: "ai_score",
  });
  const top = sortDealsForHub(deals, "top10").slice(0, 10);
  const sourceLabel = source === "database" ? "PostgreSQL" : "demo catalog";
  const intro = await resolveHubIntro({
    kind: "top-10",
    dealCount: top.length,
    sourceLabel,
    categoryName: meta.name,
    categorySlug,
  });
  const engagementMap = await getEngagementStatsForProductIds(
    top.map((d) => d.id)
  );

  const faqItems =
    categorySlug === "electronics"
      ? top10ElectronicsLaunchFaq
      : defaultTop10Faq(meta.name);

  return (
    <div>
      <section className="border-b border-neutral-200 bg-gradient-to-r from-orange-50/90 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Editor shortlist
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Top 10 {meta.name} deals
          </h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-neutral-800 sm:text-lg">
            {intro}
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            {top.length} deals shown ·{" "}
            <Link
              href={`/best-deals/${categorySlug}`}
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              {meta.name} best-deals hub
            </Link>
            {" · "}
            <Link href="/deals" className="font-semibold text-[var(--accent)] hover:underline">
              All deals
            </Link>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {top.length === 0 ? (
          <HubDealsGrid deals={[]} />
        ) : (
          <ol className="grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {top.map((d, i) => (
              <li key={d.id} className="relative">
                <span className="absolute -left-1 -top-2 z-10 flex size-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-white shadow-md">
                  {i + 1}
                </span>
                <DealCard deal={d} engagement={engagementMap.get(d.id)} />
              </li>
            ))}
          </ol>
        )}

        <div className="mt-12">
          <FaqBlock title="FAQ" items={faqItems} />
        </div>
      </div>
    </div>
  );
}
