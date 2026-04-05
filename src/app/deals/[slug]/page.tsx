import Link from "next/link";
import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AmazonShelfImage } from "@/components/deals/amazon-shelf-image";
import { AffiliateOutboundLink } from "@/components/affiliate-outbound-link";
import { DealCard } from "@/components/deal-card";
import { DealRecentlyViewed } from "@/components/deals/deal-recently-viewed";
import { DealSaveButton } from "@/components/deals/deal-save-button";
import { DealDetailViewTracker } from "@/components/deals/deal-detail-view-tracker";
import { TrackRecentDeal } from "@/components/deals/track-recent-deal";
import { AiScoreMeter } from "@/components/deals/ai-score-meter";
import { PriceDisplay } from "@/components/deals/price-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { isAmazonOutbound, primaryDealCtaLabel } from "@/lib/affiliate";
import {
  buildWhyWePickedStrong,
  getMockCons,
  getMockPros,
  getPriceInsights,
  getShoppingRecommendationSummary,
  isPriceContextIncomplete,
  summarizePriceHistoryInsight,
} from "@/lib/deal-mock-extras";
import { estimateViewCount, isRecentlyUpdated } from "@/lib/deal-social-proof";
import { categoryNameToSlug } from "@/lib/category-slug";
import { getSiteUrl } from "@/lib/env";
import { mockBrands } from "@/lib/mock-deals";
import {
  getCheaperAlternatives,
  getComparableDeals,
  getDealBySlug,
  getDealEngagementStat,
  getEngagementStatsForProductIds,
  getMoreFromBrand,
  getRelatedDeals,
} from "@/services/deals";
import { formatDealAge, guessStoreLabel } from "@/lib/store-utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const deal = await getDealBySlug(slug);
  if (!deal) return { title: "Deal not found" };
  const description = (deal.seoDescription ?? deal.aiSummary ?? deal.title).slice(
    0,
    320
  );
  const path = `/deals/${slug}`;
  const url = `${getSiteUrl()}${path}`;
  const ogTitle = deal.seoTitle ? `${deal.seoTitle}` : `${deal.title} — deal page`;
  return {
    title: ogTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle,
      description,
      url,
      type: "website",
      siteName: "FlashDealAI",
      images: deal.imageUrl ? [{ url: deal.imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: deal.imageUrl ? [deal.imageUrl] : undefined,
    },
  };
}

export default async function DealDetailPage({ params }: Props) {
  const { slug } = await params;
  const deal = await getDealBySlug(slug);
  if (!deal) notFound();

  const [related, cheaper, moreBrand, comparable, engagement] = await Promise.all([
    getRelatedDeals(slug, deal.category),
    getCheaperAlternatives(slug, deal.category, deal.currentPrice),
    getMoreFromBrand(slug, deal.brand),
    getComparableDeals(slug, deal.category, deal.currentPrice),
    getDealEngagementStat(deal.id),
  ]);
  const subEng = await getEngagementStatsForProductIds(
    [...cheaper, ...moreBrand, ...related, ...comparable].map((d) => d.id)
  );
  const categoryHubSlug = deal.category
    ? categoryNameToSlug(deal.category)
    : null;
  const brandHubSlug = deal.brand?.trim()
    ? mockBrands.find(
        (b) => b.name.toLowerCase() === deal.brand!.toLowerCase()
      )?.slug ?? categoryNameToSlug(deal.brand.trim())
    : null;
  const resolved = deal.affiliateUrl;
  const ctaLabel = primaryDealCtaLabel(resolved);
  const amazon = isAmazonOutbound(resolved);
  const pros = getMockPros(deal);
  const cons = getMockCons(deal);
  const shoppingSummary = getShoppingRecommendationSummary(deal);
  const priceInsight = getPriceInsights(deal);
  const viewEstimate = estimateViewCount(deal.id);
  const priceIncomplete = isPriceContextIncomplete(deal);
  const shopClicks = engagement?.affiliateClicks ?? 0;
  const detailViews = engagement?.detailViews ?? 0;
  const checkedCount =
    detailViews > 0 ? detailViews : viewEstimate;
  const mayExpireSoon = isRecentlyUpdated(deal.lastSeenAt, 72);
  const savingsAmt =
    deal.originalPrice != null && deal.originalPrice > deal.currentPrice
      ? deal.originalPrice - deal.currentPrice
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:pb-12">
      <TrackRecentDeal slug={deal.slug} />
      <DealDetailViewTracker slug={deal.slug} />

      <Link
        href="/deals"
        className="text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        ← All deals
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-lg shadow-neutral-200/50">
          <AmazonShelfImage
            primary={deal.imageUrl}
            productUrl={deal.productUrl}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {deal.discountPercent != null && (
            <div
              className={`absolute left-3 top-3 rounded-2xl px-4 py-2.5 shadow-2xl ring-2 ring-white/90 sm:left-4 sm:top-4 sm:px-5 sm:py-3 ${
                priceIncomplete ? "bg-neutral-700" : "bg-[var(--accent)]"
              }`}
            >
              <p className="text-[10px] font-extrabold uppercase leading-none tracking-wider text-white/95">
                Save
              </p>
              <p className="mt-0.5 text-2xl font-black tabular-nums text-white sm:text-3xl">
                {deal.discountPercent}%
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <span className="rounded-lg bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-900">
              {guessStoreLabel(deal.productUrl)}
            </span>
            <span className="text-neutral-300">·</span>
            <span>Updated {formatDealAge(deal.lastSeenAt)}</span>
          </div>
          {deal.brand && (
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
              {deal.brand}
            </p>
          )}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            {deal.title}
          </h1>

          {mayExpireSoon && !priceIncomplete && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/95 px-4 py-2.5 text-center text-sm font-bold text-amber-950">
              ⏳ May expire soon — this listing was refreshed recently
            </p>
          )}

          <p className="mt-4 text-base font-bold text-orange-950">
            🔥 {checkedCount.toLocaleString()} people checked this deal
            {detailViews > 0 ? "" : " (est.)"}
          </p>

          {deal.normalizedTitle &&
            deal.normalizedTitle !== deal.title && (
              <p className="mt-3 text-sm text-neutral-500">
                Also listed as: {deal.normalizedTitle}
              </p>
            )}

          {priceIncomplete && (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950">
              List price or discount is still being verified — we&apos;re showing a softer
              recommendation until the numbers reconcile.
            </p>
          )}

          <div className="mt-8">
            <PriceDisplay
              currency={deal.currency}
              current={deal.currentPrice}
              original={deal.originalPrice}
              discountPercent={deal.discountPercent}
              size="lg"
            />
          </div>

          <p className="mt-4 text-sm text-neutral-600">
            {shopClicks > 0 ? (
              <>
                Readers have opened the retailer from this page{" "}
                <span className="font-semibold text-neutral-900">
                  {shopClicks.toLocaleString()}
                </span>{" "}
                times — real outbound clicks we track, not an estimate.
              </>
            ) : (
              <>
                Once shoppers use our shop links, a live click count appears here. For
                now, roughly <span className="font-medium">{viewEstimate}</span> modeled
                detail views in demo mode.
              </>
            )}
          </p>

          <div className="mt-8 rounded-2xl border-2 border-[var(--accent-soft)] bg-gradient-to-br from-orange-50/90 to-white p-6 shadow-md">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-ink)]">
                  Deal price
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-neutral-950">
                  {deal.currency}
                  {deal.currentPrice.toFixed(2)}
                </p>
                {deal.originalPrice != null && (
                  <p className="mt-1 text-sm text-neutral-500 line-through tabular-nums">
                    {deal.currency}
                    {deal.originalPrice.toFixed(2)} list
                  </p>
                )}
                {deal.discountPercent != null && (
                  <p className="mt-2 text-sm font-semibold text-emerald-800">
                    Save {deal.discountPercent}% vs. reference price
                  </p>
                )}
                {savingsAmt != null && savingsAmt > 0 && (
                  <p className="mt-2 text-xl font-black tabular-nums tracking-tight text-emerald-900">
                    Save {deal.currency}
                    {savingsAmt.toFixed(2)} vs. list
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" className="min-h-14 min-w-[200px] text-base font-semibold" asChild>
                  <AffiliateOutboundLink
                    absoluteUrl={resolved}
                    surface="deal_detail_desktop"
                    dealId={deal.id}
                    slug={deal.slug}
                  >
                    {ctaLabel}
                  </AffiliateOutboundLink>
                </Button>
                <DealSaveButton slug={deal.slug} size="lg" className="min-h-14 px-8" />
              </div>
            </div>
            {deal.usesProductUrlFallback && (
              <p className="mt-4 flex gap-2 rounded-lg border border-neutral-200/80 bg-neutral-50/90 px-3 py-2.5 text-xs leading-relaxed text-neutral-600">
                <span className="shrink-0 text-neutral-400" aria-hidden>
                  ℹ️
                </span>
                <span>
                  You&apos;re heading to the retailer&apos;s standard product URL — we
                  don&apos;t have a separate affiliate link on file yet. When you add{" "}
                  <code className="rounded bg-white px-1 font-mono text-[11px] text-neutral-800">
                    affiliate_url
                  </code>{" "}
                  in admin, we can attribute traffic (and keep the lights on) without
                  changing how shoppers buy.
                </span>
              </p>
            )}
          </div>

          {priceInsight && (
            <div className="mt-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950">
              {priceInsight.isBestInHistory ? (
                <p className="font-semibold">
                  Best price in {priceInsight.windowLabel} — current matches our
                  tracked low (${priceInsight.bestPriceInWindow.toFixed(2)}).
                </p>
              ) : (
                <p className="font-semibold">
                  Tracked low in {priceInsight.windowLabel}:{" "}
                  {deal.currency}
                  {priceInsight.bestPriceInWindow.toFixed(2)} · Current:{" "}
                  {deal.currency}
                  {priceInsight.currentPrice.toFixed(2)}
                </p>
              )}
              {priceInsight.recentDropPercent != null &&
                priceInsight.recentDropPercent > 0 && (
                  <p className="mt-1 text-emerald-900/90">
                    Price dropped ~{priceInsight.recentDropPercent}% recently vs.
                    older snapshots.
                  </p>
                )}
            </div>
          )}

          {(deal.rating != null || deal.reviewCount != null) && (
            <p className="mt-4 text-sm text-neutral-600">
              {deal.rating != null && (
                <span className="font-semibold text-neutral-900">
                  ★ {deal.rating.toFixed(1)}
                </span>
              )}
              {deal.reviewCount != null && (
                <span className="text-neutral-500">
                  {" "}
                  · {deal.reviewCount.toLocaleString()} reviews
                </span>
              )}
            </p>
          )}

          <div className="mt-8 max-w-md">
            <AiScoreMeter score={deal.aiScore} size="lg" />
          </div>

          <Separator className="my-8" />

          <div>
            <p className="text-sm font-semibold text-neutral-900">
              Shopping take
            </p>
            <p className="mt-2 leading-relaxed text-neutral-700">{shoppingSummary}</p>
          </div>

          {deal.aiSummary && (
            <div
              className={`mt-8 rounded-2xl border p-6 shadow-sm ${
                priceIncomplete
                  ? "border-neutral-200/80 bg-neutral-50/80"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <p className="text-sm font-semibold text-neutral-900">AI deal verdict</p>
              <p className="mt-2 leading-relaxed text-neutral-700">{deal.aiSummary}</p>
            </div>
          )}

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-emerald-900">Pros</p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {pros.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-emerald-600"
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-neutral-800">Cons</p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                {cons.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <X
                      className="mt-0.5 size-4 shrink-0 text-neutral-400"
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className={`mt-8 rounded-2xl border-2 p-6 shadow-md ${
              priceIncomplete
                ? "border-neutral-200 bg-neutral-50/90"
                : "border-[var(--accent-soft)] bg-gradient-to-br from-orange-50/90 to-white"
            }`}
          >
            <p
              className={`text-base font-bold ${
                priceIncomplete ? "text-neutral-800" : "text-[var(--accent-ink)]"
              }`}
            >
              Why we picked this deal
            </p>
            <p className="mt-3 text-sm font-medium leading-relaxed text-neutral-900">
              {buildWhyWePickedStrong(deal)}
            </p>
          </div>

          <div className="mt-6 hidden flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-neutral-600 lg:flex">
            <span className="inline-flex items-center gap-1">
              <Check className="size-3.5 text-emerald-600" aria-hidden />
              Verified deal
            </span>
            <span>· Updated recently</span>
            <span>· AI analyzed</span>
          </div>

          <div className="mt-8 space-y-3 text-[11px] leading-relaxed text-neutral-500">
            <p>
              {amazon && (
                <span className="block sm:inline">
                  As an Amazon Associate, FlashDealAI earns from qualifying purchases.{" "}
                </span>
              )}
              <span>
                We may earn a commission when you purchase through links on this page.
                Source: {deal.source}. Prices change — verify at checkout.
              </span>
            </p>
          </div>
        </div>
      </div>

      <DealRecentlyViewed currentSlug={deal.slug} currency={deal.currency} />

      <section className="mt-16 border-t border-neutral-200 pt-12">
        <h2 className="text-lg font-bold text-neutral-900">Price history</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Historical snapshots — full charts ship in the next iteration.
        </p>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-neutral-800">
          <span className="font-bold text-neutral-900">Price history insight. </span>
          {summarizePriceHistoryInsight(deal, priceInsight)}
        </p>
        {deal.priceHistory && deal.priceHistory.length > 0 ? (
          <Card className="mt-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex h-40 items-end justify-between gap-1 bg-neutral-50 px-4 pb-4 pt-6 sm:px-6">
                {[...deal.priceHistory]
                  .slice(0, 12)
                  .reverse()
                  .map((h, i, arr) => {
                    const min = Math.min(...arr.map((x) => x.price));
                    const max = Math.max(...arr.map((x) => x.price));
                    const span = max - min || 1;
                    const hPct = ((h.price - min) / span) * 100;
                    return (
                      <div
                        key={i}
                        className="flex flex-1 flex-col items-center justify-end"
                        title={`${deal.currency}${h.price.toFixed(2)}`}
                      >
                        <div
                          className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-[var(--accent)] to-orange-400 opacity-90"
                          style={{ height: `${Math.max(12, 100 - hPct * 0.85)}%` }}
                        />
                      </div>
                    );
                  })}
              </div>
              <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
                {deal.priceHistory.slice(0, 6).map((h, i) => (
                  <li
                    key={i}
                    className="flex justify-between px-4 py-2.5 text-sm sm:px-6"
                  >
                    <span className="font-medium tabular-nums text-neutral-900">
                      {deal.currency}
                      {h.price.toFixed(2)}
                    </span>
                    <span className="text-neutral-400">
                      {new Date(h.capturedAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center text-sm text-neutral-500">
            No price history yet — ingestion will populate this automatically.
          </div>
        )}
      </section>

      {comparable.length > 0 && (
        <section className="mt-16 border-t border-neutral-200 pt-12">
          <Card className="border-neutral-200/90 shadow-sm">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="border-b border-neutral-100 pb-4">
                <h2 className="text-xl font-bold text-neutral-900">
                  Comparable products
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Same category, similar price band — compare specs and shop links before
                  you commit.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {comparable.map((d) => (
                  <DealCard
                    key={d.id}
                    deal={d}
                    engagement={subEng.get(d.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {cheaper.length > 0 && (
        <section className="mt-16 border-t border-neutral-200 pt-12">
          <Card className="border-neutral-200/90 shadow-sm">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Related cheaper alternatives
                  </h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    Same category, lower shelf price — tap a card to read the full deal,
                    then compare specs.
                  </p>
                </div>
                {categoryHubSlug && deal.category && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/best-deals/${categoryHubSlug}`}>
                      Browse {deal.category} hub →
                    </Link>
                  </Button>
                )}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cheaper.map((d) => (
                  <DealCard
                    key={d.id}
                    deal={d}
                    engagement={subEng.get(d.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {moreBrand.length > 0 && deal.brand && (
        <section className="mt-16 border-t border-neutral-200 pt-12">
          <Card className="border-neutral-200/90 shadow-sm">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    More from {deal.brand}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    Other scored {deal.brand} listings — each card links to a full deal
                    page and shop CTA.
                  </p>
                </div>
                {brandHubSlug && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/best-brand-deals/${brandHubSlug}`}>
                      All {deal.brand} deals →
                    </Link>
                  </Button>
                )}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {moreBrand.map((d) => (
                  <DealCard
                    key={d.id}
                    deal={d}
                    engagement={subEng.get(d.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16 border-t border-neutral-200 pt-12">
          <h2 className="text-xl font-bold text-neutral-900">Related deals</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Same category or top AI picks when the shelf is thin.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((d) => (
              <DealCard
                key={d.id}
                deal={d}
                engagement={subEng.get(d.id)}
              />
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden">
        <Button size="lg" className="h-14 w-full text-base font-semibold" asChild>
          <AffiliateOutboundLink
            absoluteUrl={resolved}
            surface="deal_detail_sticky"
            dealId={deal.id}
            slug={deal.slug}
          >
            {ctaLabel}
          </AffiliateOutboundLink>
        </Button>
        <p className="mt-2 text-center text-[10px] text-neutral-600">
          {savingsAmt != null && (
            <span className="font-black text-emerald-900">
              Save {deal.currency}
              {savingsAmt.toFixed(2)} ·{" "}
            </span>
          )}
          🔥 {checkedCount.toLocaleString()} checked
          {detailViews > 0 ? "" : " (est.)"} ·{" "}
          {shopClicks > 0
            ? `${shopClicks.toLocaleString()} shop clicks · `
            : ""}
          {ctaLabel}
        </p>
      </div>
    </div>
  );
}
