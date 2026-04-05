import Link from "next/link";
import type { Metadata } from "next";

import { DealCard } from "@/components/deal-card";
import { FaqBlock } from "@/components/seo/faq-block";
import { sortDealsForHub } from "@/lib/deal-sorting";
import { getSiteUrl } from "@/lib/env";
import { buildBestDealsThisWeekIntro } from "@/lib/seo-hub-intro";
import { getDeals } from "@/services/deals";

export const revalidate = 3600;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function generateMetadata(): Promise<Metadata> {
  const path = "/best-deals/this-week";
  const url = `${getSiteUrl()}${path}`;
  const titleAbs = "Best deals this week — 7-day activity | FlashDealAI";
  const description =
    "US deals with recent catalog activity in the last seven days — AI-ranked for value and trust.";
  return {
    title: { absolute: titleAbs },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: "Best deals this week — 7-day activity",
      description:
        "US deals with recent catalog activity in the last seven days.",
      url,
      type: "website",
      siteName: "FlashDealAI",
    },
    twitter: { card: "summary_large_image", title: titleAbs, description },
  };
}

export default async function BestDealsThisWeekPage() {
  const { deals, source } = await getDeals({ sort: "newest" });
  const cutoff = Date.now() - WEEK_MS;
  const recent = deals.filter(
    (d) => new Date(d.lastSeenAt).getTime() >= cutoff
  );
  const grid = sortDealsForHub(recent, "best_deals").slice(0, 48);
  const sourceLabel = source === "database" ? "PostgreSQL" : "demo catalog";
  const intro = buildBestDealsThisWeekIntro(grid.length, sourceLabel);
  const url = `${getSiteUrl()}/best-deals/this-week`;

  return (
    <div>
      <section className="border-b border-neutral-200 bg-gradient-to-r from-orange-50/90 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Weekly hub
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Best deals this week
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-neutral-700">
            {intro}
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            {grid.length} listings ·{" "}
            <Link href="/best-deals/today" className="font-semibold text-[var(--accent)] hover:underline">
              Last 24h
            </Link>
            {" · "}
            <span className="text-neutral-400">Canonical: {url}</span>
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
              q: "How is this different from “today”?",
              a: "This page uses a seven-day last-seen window so you still see momentum when daily ingestion is sparse.",
            },
            {
              q: "Are these the cheapest items on the site?",
              a: "Not necessarily — we rank for AI score and trust signals. Use price-sorted browse or under-$ hubs for budget mode.",
            },
          ]}
        />
      </div>
    </div>
  );
}
