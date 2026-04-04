import { notFound } from "next/navigation";

import { DealCard } from "@/components/deal-card";
import { FaqBlock } from "@/components/seo/faq-block";
import { RelatedDealLinks } from "@/components/seo/related-deal-links";
import { bestDealsFaq } from "@/lib/seo-landing-copy";
import { siteMetadata } from "@/lib/site-metadata";
import { loadCollectionPageData } from "@/services/deals";

export const metadata = siteMetadata({
  title: "Best Deals Today",
  description:
    "Hand-vetted US deals ranked by AI score — discount depth, reviews, and retailer trust. Updated daily.",
  path: "/best-deals",
});

export default async function BestDealsTodayPage() {
  const data = await loadCollectionPageData("best-deals");
  if (!data) notFound();
  const { deals: grid, source, preset } = data;

  return (
    <div>
      <section className="border-b border-neutral-200 bg-gradient-to-r from-orange-50/90 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Daily hub
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            {preset.label}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
            A conversion-focused snapshot of what deserves attention right now — not
            random coupons. We bias toward strong AI scores, real discount depth, and
            listings shoppers actually click. Data:{" "}
            <strong className="text-neutral-800">
              {source === "database" ? "PostgreSQL" : "demo catalog"}
            </strong>
            .
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            Showing {grid.length} high-confidence picks (min AI score 80). Explore
            budget hubs and brand shelves from the links below.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>

        <RelatedDealLinks
          title="Keep hunting"
          links={[
            {
              href: "/deals/under-50",
              label: "Deals under $50",
              description: "Budget-friendly picks with the same AI filters.",
            },
            {
              href: "/deals/electronics",
              label: "Electronics deals",
              description: "Laptops, audio, smart home — scored for risk and value.",
            },
            {
              href: "/deals/nike",
              label: "Nike deals",
              description: "Footwear and apparel from Nike and partner retailers.",
            },
            {
              href: "/search",
              label: "Search everything",
              description: "Natural-style queries with live suggestions.",
            },
          ]}
        />

        <FaqBlock items={bestDealsFaq} />
      </div>
    </div>
  );
}
