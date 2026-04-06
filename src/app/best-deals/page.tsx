import { notFound } from "next/navigation";

import { HubDealsGrid } from "@/components/seo/hub-deals-grid";
import { FaqBlock } from "@/components/seo/faq-block";
import { RelatedDealLinks } from "@/components/seo/related-deal-links";
import {
  bestDealsHubLaunchFaq,
} from "@/lib/seo-landing-copy";
import { resolveHubIntro } from "@/services/ai/hubIntro";
import { explainListCredibilityMix } from "@/lib/user-facing-ai-value";
import { sortDealsForHub } from "@/lib/deal-sorting";
import { siteMetadata } from "@/lib/site-metadata";
import {
  getDeals,
  getEngagementStatsForProductIds,
  loadCollectionPageData,
} from "@/services/deals";

export const revalidate = 3600;

export const metadata = siteMetadata({
  title: "Best US deals — editor & AI-ranked daily shelf | FlashDealAI",
  description:
    "A curated daily grid of high-score US discounts: AI + human signals, transparent retailer links, refreshed as prices move.",
  path: "/best-deals",
  absoluteTitle: true,
});

export default async function BestDealsHubPage() {
  const data = await loadCollectionPageData("best-deals");
  if (!data) notFound();
  const { source, preset, deals: initialGrid } = data;
  let grid = initialGrid;
  let thinNote: string | null = null;

  if (grid.length === 0) {
    const wide = await getDeals({ sort: "ai_score" });
    grid = sortDealsForHub(wide.deals, "best_deals").slice(0, 20);
    thinNote =
      "Nothing cleared the strict AI≥80 bar right now — we widened to strong scored picks so this hub still helps you shop.";
  } else if (grid.length < 4) {
    thinNote =
      "Editor’s note: the shelf is thin today — every card still passed our score floor.";
  }

  const sourceLabel = source === "database" ? "PostgreSQL" : "demo catalog";
  const intro = await resolveHubIntro({
    kind: "best-deals",
    dealCount: grid.length,
    sourceLabel,
  });
  const engagementMap = await getEngagementStatsForProductIds(
    grid.map((d) => d.id)
  );

  return (
    <div>
      <section className="border-b border-neutral-200 bg-gradient-to-r from-orange-50/90 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Daily editor hub
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            {preset.label}
          </h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-neutral-800 sm:text-lg">
            {intro}
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            Showing {grid.length} picks
            {grid.length > 0 ? " (min AI score 80 when the bar is active)" : ""}.
            Explore budget ceilings and category hubs from the links below.
          </p>
          {grid.length > 0 && (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-600">
              {explainListCredibilityMix(grid, "best_deals")}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <HubDealsGrid
          deals={grid}
          engagementByProductId={engagementMap}
          thinShelfNote={thinNote}
          thinThreshold={4}
        />

        <RelatedDealLinks
          title="Keep hunting"
          links={[
            {
              href: "/best-deals/under/50",
              label: "Best deals under $50",
              description: "Same AI lens, tighter price ceiling.",
            },
            {
              href: "/best-deals/today",
              label: "Updated in the last 24h",
              description: "Freshly seen listings with momentum.",
            },
            {
              href: "/best-deals/electronics",
              label: "Best electronics (hub)",
              description: "Category-focused shelf — scored, not sponsored.",
            },
            {
              href: "/deals",
              label: "All deals",
              description: "Full browse with filters and search.",
            },
            {
              href: "/search",
              label: "Search",
              description: "Natural-style queries with suggestions.",
            },
          ]}
        />

        <FaqBlock items={bestDealsHubLaunchFaq} />
      </div>
    </div>
  );
}
