import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { HubDealsGrid } from "@/components/seo/hub-deals-grid";
import { FaqBlock } from "@/components/seo/faq-block";
import { sortDealsForHub } from "@/lib/deal-sorting";
import { getSiteUrl } from "@/lib/env";
import { generateUnderPriceStaticParams } from "@/lib/seo-static-params";
import {
  buildUnder50EditorialLead,
  buildUnderPriceIntro,
} from "@/lib/seo-hub-intro";
import { bestDealsUnder50LaunchFaq } from "@/lib/seo-landing-copy";
import { getDeals, getEngagementStatsForProductIds } from "@/services/deals";

type Props = { params: Promise<{ price: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  return generateUnderPriceStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { price: raw } = await params;
  const cap = Number(raw);
  if (!Number.isFinite(cap) || cap <= 0) {
    return { title: "Best deals" };
  }
  const is50 = cap === 50;
  const titleAbs = is50
    ? "Best deals under $50 — budget picks, editor lens | FlashDealAI"
    : `Best deals under $${cap} — AI-ranked US discounts`;
  const description = is50
    ? "Scored under-$50 US deals with clear retailer links — built for gift lists, daily essentials, and impulse saves without the coupon-blog noise."
    : `US deals at or below $${cap}: AI-ranked for value and trust, not sponsorships. Verify tax and shipping at checkout.`;
  const path = `/best-deals/under/${raw}`;
  const url = `${getSiteUrl()}${path}`;
  return {
    title: { absolute: titleAbs },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: is50 ? "Under $50 — scored budget deals" : `Under $${cap} deals`,
      description,
      url,
      type: "website",
      siteName: "FlashDealAI",
    },
    twitter: { card: "summary_large_image", title: titleAbs, description },
  };
}

const defaultUnderFaq = (cap: number) => [
  {
    q: `How do you enforce “under $${cap}”?`,
    a: "We filter on the current price stored in our catalog at render time — taxes and shipping are added at checkout.",
  },
  {
    q: "Why might a card look borderline?",
    a: "Coupons and lightning promos can move faster than our refresh — always confirm the cart total on the retailer.",
  },
];

export default async function BestDealsUnderPricePage({ params }: Props) {
  const { price: raw } = await params;
  const cap = Number(raw);
  if (!Number.isFinite(cap) || cap <= 0) notFound();

  const { deals, source } = await getDeals({
    sort: "ai_score",
    maxPrice: cap,
  });
  let grid = sortDealsForHub(deals, "best_deals").slice(0, 48);
  let thinNote: string | null = null;
  if (grid.length === 0) {
    const wide = await getDeals({ sort: "ai_score" });
    grid = sortDealsForHub(wide.deals, "best_deals")
      .filter((d) => d.currentPrice <= cap)
      .slice(0, 24);
    thinNote =
      "No indexed rows sat under this ceiling with current filters — we narrowed the full catalog by price so you still see options.";
  } else if (grid.length < 4) {
    thinNote =
      "Few listings under this cap today — worth bookmarking for payday or checking the main best-deals hub.";
  }

  const sourceLabel = source === "database" ? "PostgreSQL" : "demo catalog";
  const intro =
    cap === 50
      ? buildUnder50EditorialLead(grid.length, sourceLabel)
      : buildUnderPriceIntro(cap, grid.length, sourceLabel);

  const engagementMap = await getEngagementStatsForProductIds(
    grid.map((d) => d.id)
  );

  return (
    <div>
      <section className="border-b border-neutral-200 bg-gradient-to-r from-orange-50/90 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Price ceiling
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Best deals under ${cap}
          </h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-neutral-800 sm:text-lg">
            {intro}
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            {grid.length} offers ·{" "}
            <Link href="/best-deals" className="font-semibold text-[var(--accent)] hover:underline">
              All best deals
            </Link>
            {cap !== 50 && (
              <>
                {" · "}
                <Link
                  href="/best-deals/under/50"
                  className="font-semibold text-[var(--accent)] hover:underline"
                >
                  Under $50
                </Link>
              </>
            )}
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

        <FaqBlock
          title="FAQ"
          items={
            cap === 50 ? bestDealsUnder50LaunchFaq : defaultUnderFaq(cap)
          }
        />
      </div>
    </div>
  );
}
