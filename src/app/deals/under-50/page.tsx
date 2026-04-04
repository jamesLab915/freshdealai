import Link from "next/link";
import { notFound } from "next/navigation";

import { DealCard } from "@/components/deal-card";
import { FaqBlock } from "@/components/seo/faq-block";
import { RelatedDealLinks } from "@/components/seo/related-deal-links";
import { under50Faq } from "@/lib/seo-landing-copy";
import { siteMetadata } from "@/lib/site-metadata";
import { loadCollectionPageData } from "@/services/deals";

export const metadata = siteMetadata({
  title: "Best Deals Under $50",
  description:
    "Affordable US deals under fifty dollars — AI-ranked for value, reviews, and trust signals.",
  path: "/deals/under-50",
});

export default async function DealsUnder50Page() {
  const data = await loadCollectionPageData("under-50");
  if (!data) notFound();
  const { deals: grid, source, preset } = data;

  return (
    <div>
      <section className="border-b border-neutral-200 bg-gradient-to-br from-sky-50/80 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-800">
            Budget SEO hub
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            {preset.label}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
            Stretch your cart without chasing fake MSRP theater. These listings are
            filtered to <strong>$50 or less</strong> at the last index — always confirm
            tax, shipping, and coupons in checkout. Powered by{" "}
            {source === "database" ? "live data" : "demo data"} with the same AI
            scoring as the rest of FlashDealAI.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="mb-8 text-sm text-neutral-600">
          <strong className="text-neutral-900">{grid.length}</strong> deals currently
          meet the under-$50 rule in this feed.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>

        {grid.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center text-neutral-600">
            Nothing in catalog under $50 right now — try{" "}
            <Link className="font-semibold text-[var(--accent)]" href="/deals">
              all deals
            </Link>{" "}
            or widen search.
          </p>
        )}

        <RelatedDealLinks
          title="Shop more hubs"
          links={[
            {
              href: "/best-deals",
              label: "Best deals today",
              description: "Top AI-ranked picks across all budgets.",
            },
            {
              href: "/deals/electronics",
              label: "Electronics",
              description: "Gadgets and accessories with verified drops.",
            },
            {
              href: "/search?q=under",
              label: "Search",
              description: "Try queries like “skincare deals” or “gifts under 25”.",
            },
          ]}
        />

        <FaqBlock items={under50Faq} />
      </div>
    </div>
  );
}
