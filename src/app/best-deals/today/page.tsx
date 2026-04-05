import Link from "next/link";
import type { Metadata } from "next";

import { HubDealsGrid } from "@/components/seo/hub-deals-grid";
import { FaqBlock } from "@/components/seo/faq-block";
import { getSiteUrl } from "@/lib/env";
import { sortDealsForHub } from "@/lib/deal-sorting";
import { bestDealsTodayLaunchFaq } from "@/lib/seo-landing-copy";
import { buildBestDealsTodayIntro } from "@/lib/seo-hub-intro";
import { getDeals, getEngagementStatsForProductIds } from "@/services/deals";

export const revalidate = 3600;

const DAY_MS = 24 * 60 * 60 * 1000;

export async function generateMetadata(): Promise<Metadata> {
  const path = "/best-deals/today";
  const url = `${getSiteUrl()}${path}`;
  const titleAbs = "Deals updated in the last 24 hours | FlashDealAI";
  const description =
    "Fresh US listings our catalog saw in the past day — AI-scored, with honest retailer links. Built for readers who want momentum, not stale coupons.";
  return {
    title: { absolute: titleAbs },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: "Last 24h — fresh deal arrivals",
      description,
      url,
      type: "website",
      siteName: "FlashDealAI",
    },
    twitter: { card: "summary_large_image", title: titleAbs, description },
  };
}

export default async function BestDealsTodayPage() {
  const { deals, source } = await getDeals({ sort: "newest" });
  const cutoff = Date.now() - DAY_MS;
  const fresh = deals.filter(
    (d) => new Date(d.lastSeenAt).getTime() >= cutoff
  );
  let grid = sortDealsForHub(fresh, "best_deals").slice(0, 48);
  let thinNote: string | null = null;

  if (grid.length === 0) {
    const all = await getDeals({ sort: "ai_score" });
    grid = sortDealsForHub(all.deals, "best_deals").slice(0, 16);
    thinNote =
      "Nothing new in the 24-hour window — here are live high-score picks so you’re not staring at an empty page.";
  } else if (grid.length < 4) {
    thinNote =
      "Quiet refresh cycle — fewer rows met the “today” window; each one is still scored.";
  }

  const sourceLabel = source === "database" ? "PostgreSQL" : "demo catalog";
  const intro = buildBestDealsTodayIntro(grid.length, sourceLabel);
  const url = `${getSiteUrl()}/best-deals/today`;
  const engagementMap = await getEngagementStatsForProductIds(
    grid.map((d) => d.id)
  );

  return (
    <div>
      <section className="border-b border-neutral-200 bg-gradient-to-r from-orange-50/90 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Timeboxed hub
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Best deals today
          </h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-neutral-800 sm:text-lg">
            {intro}
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            {grid.length} listings ·{" "}
            <Link href="/best-deals" className="font-semibold text-[var(--accent)] hover:underline">
              All best deals
            </Link>
            {" · "}
            <span className="text-neutral-400">Canonical: {url}</span>
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

        <FaqBlock title="FAQ" items={bestDealsTodayLaunchFaq} />
      </div>
    </div>
  );
}
