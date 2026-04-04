import Link from "next/link";
import { notFound } from "next/navigation";

import { DealCard } from "@/components/deal-card";
import { FaqBlock } from "@/components/seo/faq-block";
import { RelatedDealLinks } from "@/components/seo/related-deal-links";
import { Separator } from "@/components/ui/separator";
import { electronicsFaq } from "@/lib/seo-landing-copy";
import { siteMetadata } from "@/lib/site-metadata";
import { loadCollectionPageData } from "@/services/deals";

export const metadata = siteMetadata({
  title: "Top Electronics Deals",
  description:
    "Electronics deals ranked by AI — laptops, audio, smart home, and accessories from trusted US retailers.",
  path: "/deals/electronics",
});

export default async function ElectronicsDealsPage() {
  const data = await loadCollectionPageData("electronics");
  if (!data) notFound();
  const { deals, source, preset } = data;

  return (
    <div>
      <section className="border-b border-neutral-200 bg-gradient-to-br from-indigo-50/90 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-800">
            Category landing
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            {preset.label}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
            From earbuds to SSDs — electronics move fast, so we emphasize review
            volume, price stability, and retailer trust. Every row below is filterable
            elsewhere on the site; this page is optimized for organic and paid traffic
            that lands on “electronics deals” intent. Source:{" "}
            <strong>{source === "database" ? "database" : "demo"}</strong>.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-6 sm:p-10">
          <h2 className="text-xl font-bold text-neutral-900">
            Why shop electronics with FlashDealAI
          </h2>
          <Separator className="my-6" />
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                t: "Spec-aware summaries",
                d: "AI highlights what matters for the category — not generic marketing fluff — so you can compare SKUs faster.",
              },
              {
                t: "Risk-aware scoring",
                d: "Thin-review listings get scored cautiously; established brands with volume rise to the top.",
              },
              {
                t: "Affiliate transparency",
                d: "Outbound links are labeled; we earn on qualifying purchases without pay-to-rank placement.",
              },
            ].map((x) => (
              <div key={x.t}>
                <p className="text-sm font-semibold text-neutral-900">{x.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="my-8 text-sm text-neutral-600">
          <strong className="text-neutral-900">{deals.length}</strong> electronics deals
          in this category right now.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>

        {deals.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center text-neutral-600">
            No electronics deals indexed — try{" "}
            <Link
              className="font-semibold text-[var(--accent)]"
              href="/categories/electronics"
            >
              category browse
            </Link>{" "}
            or{" "}
            <Link className="font-semibold text-[var(--accent)]" href="/search?q=laptop">
              search
            </Link>
            .
          </p>
        )}

        <RelatedDealLinks
          title="Related pages"
          links={[
            {
              href: "/best-deals",
              label: "Best deals today",
              description: "Cross-category picks with the highest AI scores.",
            },
            {
              href: "/deals/under-50",
              label: "Under $50",
              description: "Accessories and small gadgets at a friendly price.",
            },
            {
              href: "/search?q=best+laptop+deals",
              label: "Search laptops",
              description: "Example natural-language style query.",
            },
          ]}
        />

        <FaqBlock items={electronicsFaq} />
      </div>
    </div>
  );
}
