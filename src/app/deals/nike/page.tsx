import Link from "next/link";
import { notFound } from "next/navigation";

import { DealCard } from "@/components/deal-card";
import { FaqBlock } from "@/components/seo/faq-block";
import { RelatedDealLinks } from "@/components/seo/related-deal-links";
import { nikeFaq } from "@/lib/seo-landing-copy";
import { siteMetadata } from "@/lib/site-metadata";
import { loadCollectionPageData } from "@/services/deals";

export const metadata = siteMetadata({
  title: "Best Nike Deals",
  description:
    "Nike sneakers, apparel, and accessories on promotion — AI-scored for US shoppers.",
  path: "/deals/nike",
});

export default async function NikeDealsPage() {
  const data = await loadCollectionPageData("nike");
  if (!data) notFound();
  const { deals, source, preset } = data;

  return (
    <div>
      <section className="border-b border-neutral-200 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-200">
            Brand shelf
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {preset.label}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-200">
            Nike remains a default for training, lifestyle, and school-year rotation.
            We aggregate promos from major US retailers and brand-direct listings
            where available — then rank them with the same AI lens as the rest of the
            site. Data: {source === "database" ? "PostgreSQL" : "demo catalog"}.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-neutral-900">Why a Nike hub?</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Shoppers search brand + category together — this page answers that intent
            with a single scrollable grid, transparent scores, and affiliate-disclosed
            outbound links. Use it for social posts, newsletters, and paid landing
            tests without rebuilding the feed.
          </p>
        </div>

        <p className="my-8 text-sm text-neutral-600">
          <strong className="text-neutral-900">{deals.length}</strong> Nike-tagged
          offers in this index.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>

        {deals.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center text-neutral-600">
            No Nike deals in the current catalog — check back after ingestion or browse{" "}
            <Link className="font-semibold text-[var(--accent)]" href="/deals">
              all deals
            </Link>
            .
          </p>
        )}

        <RelatedDealLinks
          title="More brand & category pages"
          links={[
            {
              href: "/deals/electronics",
              label: "Electronics deals",
              description: "Cross-brand tech picks with AI commentary.",
            },
            {
              href: "/best-deals",
              label: "Best deals today",
              description: "Highest scores across every retailer.",
            },
            {
              href: "/search?q=nike",
              label: "Search “nike”",
              description: "Keyword search with debounced URL sync.",
            },
          ]}
        />

        <FaqBlock items={nikeFaq} />
      </div>
    </div>
  );
}
