import Link from "next/link";

import { DealCard } from "@/components/deal-card";
import { HomeHero } from "@/components/home/home-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  pickAiPicksRail,
  pickHomepageFeaturedManualOnly,
  pickTrendingRail,
} from "@/lib/deal-picks";
import {
  getBrands,
  getCategories,
  getDeals,
  getEngagementStatsForProductIds,
  getStores,
} from "@/services/deals";
import { isPrimaryShelfAmazonDeal } from "@/lib/deal-shelf-eligibility";
import { mockSeoGuides } from "@/lib/mock-deals";
import { siteMetadata } from "@/lib/site-metadata";

export const metadata = siteMetadata({
  title: "FlashDealAI — Today’s Best Deals, Powered by AI",
  description:
    "Real-time US discounts ranked by AI — browse categories, brands, AI picks, and affiliate-transparent outbound links.",
  path: "/",
  absoluteTitle: true,
});

export default async function HomePage() {
  const { deals } = await getDeals({});
  const featured = pickHomepageFeaturedManualOnly(deals, 6);
  const featuredIds = new Set(featured.map((d) => d.id));
  const trendingNow = pickTrendingRail(deals, 4, {
    excludeProductIds: featuredIds,
  });
  trendingNow.forEach((d) => featuredIds.add(d.id));
  const aiPicks = pickAiPicksRail(deals, 4, {
    excludeProductIds: featuredIds,
  });
  const drops = [...deals]
    .filter((d) => d.published && !d.excludeFromHubs)
    .filter(isPrimaryShelfAmazonDeal)
    .filter((d) => !featuredIds.has(d.id))
    .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))
    .slice(0, 4);
  const railIds = new Set<string>();
  [...featured, ...trendingNow, ...aiPicks, ...drops].forEach((d) =>
    railIds.add(d.id)
  );
  const engagementMap = await getEngagementStatsForProductIds([...railIds]);

  const categories = getCategories();
  const brands = getBrands();
  const stores = getStores();

  return (
    <div>
      <HomeHero dealCount={deals.length} />

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6">
        <p className="-mt-6 mb-2 rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-950 shadow-sm sm:-mt-4">
          AI analyzed {deals.length} deals today — scores refresh as prices, reviews,
          and inventory signals update.
        </p>
        <section>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Featured Deals
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
                Hand-curated only: each card has a{" "}
                <span className="font-semibold text-neutral-800">homepage rank</span> set
                in Admin → Products. We show up to six pins — never filler from the
                algorithm.
              </p>
            </div>
            <Link
              href="/deals"
              className="text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              View all deals →
            </Link>
          </div>
          {featured.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/80 px-6 py-10 text-center">
              <p className="font-semibold text-amber-950">
                No pinned deals on the homepage yet
              </p>
              <p className="mt-2 text-sm text-amber-900/90">
                Set <span className="font-mono text-xs">homepage_rank</span> on up to six
                products in Admin — we&apos;ll only show real editorial picks, never
                auto-fill.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/admin/products">Open Admin · Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((d) => (
                <DealCard
                  key={d.id}
                  deal={d}
                  engagement={engagementMap.get(d.id)}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Trending Now
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
                Fresh listings and recent price movement — overlaps with Featured are
                removed so this row feels distinct.
              </p>
            </div>
            <Link
              href="/deals?sort=newest"
              className="text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              See what&apos;s new →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trendingNow.map((d) => (
              <DealCard
                key={`trend-${d.id}`}
                deal={d}
                engagement={engagementMap.get(d.id)}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
              Biggest drops
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Sorted by discount % — verify list price before you buy.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {drops.map((d) => (
                <DealCard
                  key={d.id}
                  deal={d}
                  engagement={engagementMap.get(d.id)}
                />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
              AI Picks
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Same manual rank + flag rules as Featured, minus overlap — then our
              model breaks ties. For grouped “why” copy, open the full feed.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {aiPicks.map((d) => (
                <DealCard
                  key={d.id}
                  deal={d}
                  engagement={engagementMap.get(d.id)}
                />
              ))}
            </div>
            <Button variant="outline" className="mt-8" size="lg" asChild>
              <Link href="/ai-picks">Open AI-ranked feed</Link>
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
            Shop by brand
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {brands.map((b) => (
              <Link
                key={b.slug}
                href={`/deals?brand=${b.slug}`}
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm transition-colors hover:border-[var(--accent-soft)] hover:bg-[var(--accent-soft)]"
              >
                {b.name}
                <span className="ml-2 text-neutral-400">{b.dealCount}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
            Categories
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link key={c.slug} href={`/categories/${c.slug}`}>
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="p-6">
                    <p className="font-semibold text-neutral-900">{c.name}</p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600 line-clamp-2">
                      {c.description}
                    </p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                      Shop {c.name.toLowerCase()} →
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            Why FlashDealAI
          </h2>
          <Separator className="my-8" />
          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                t: "Multi-source ingestion",
                d: "APIs, brand pages, compliant scrapers, CSV — one schema, no lock-in.",
              },
              {
                t: "Structured AI",
                d: "Summaries, scores, and SEO emitted as JSON with fallbacks when APIs blink.",
              },
              {
                t: "Conversion-first UI",
                d: "Clear price hierarchy, store context, and honest risk signals — not hype.",
              },
            ].map((x) => (
              <div key={x.t}>
                <p className="text-sm font-semibold text-neutral-900">{x.t}</p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
            Guides & hubs
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Editorial pages for SEO — written for humans first.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {mockSeoGuides.map((g) => (
              <Link key={g.href} href={g.href}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <p className="font-semibold text-neutral-900">{g.title}</p>
                    <p className="mt-2 text-sm text-neutral-600">{g.blurb}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-neutral-900">
                  By category
                </p>
                <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                  {categories.slice(0, 5).map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/categories/${c.slug}`}
                        className="hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-neutral-900">
                  By brand
                </p>
                <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                  {brands.slice(0, 5).map((b) => (
                    <li key={b.slug}>
                      <Link
                        href={`/deals?brand=${b.slug}`}
                        className="hover:text-[var(--accent)]"
                      >
                        {b.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
            Top stores
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {stores.map((s) => (
              <Link
                key={s.slug}
                href={`/stores/${s.slug}`}
                className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
              >
                {s.name}
                <span className="ml-2 text-xs font-normal text-neutral-400">
                  {s.domain}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
