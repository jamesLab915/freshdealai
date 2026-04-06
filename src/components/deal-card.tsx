import Link from "next/link";
import { Flame } from "lucide-react";

import { AffiliateOutboundLink } from "@/components/affiliate-outbound-link";
import { DealCredibilityStrip } from "@/components/deals/deal-credibility-strip";
import { DealSaveButton } from "@/components/deals/deal-save-button";
import { AmazonShelfImage } from "@/components/deals/amazon-shelf-image";
import { AiScoreMeter } from "@/components/deals/ai-score-meter";
import { PriceDisplay } from "@/components/deals/price-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { primaryDealCtaLabel } from "@/lib/affiliate";
import {
  estimateViewCount,
  hasPriceDropSignal,
  isRecentlyUpdated,
} from "@/lib/deal-social-proof";
import { deriveDealCredibilityPhase1 } from "@/lib/deal-credibility";
import { getDealCardExtras, isPriceContextIncomplete } from "@/lib/deal-mock-extras";
import { formatDealAge, guessStoreLabel } from "@/lib/store-utils";
import type { DealProduct } from "@/types/deal";

export type DealCardEngagement = {
  affiliateClicks: number;
  detailViews: number;
};

function priceDropBadge(history?: DealProduct["priceHistory"]) {
  if (!history || history.length < 2) return null;
  const newest = history[0]?.price;
  const oldest = history[history.length - 1]?.price;
  if (newest == null || oldest == null || oldest <= newest) return null;
  const pct = Math.round(((oldest - newest) / oldest) * 100);
  if (pct < 5) return null;
  return (
    <span className="absolute bottom-2 left-2 rounded-md bg-neutral-950/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
      −{pct}% vs. prior
    </span>
  );
}

type Props = {
  deal: DealProduct;
  engagement?: DealCardEngagement | null;
};

export function DealCard({ deal, engagement }: Props) {
  const credibility = deriveDealCredibilityPhase1(deal);
  const resolved = deal.affiliateUrl;
  const ctaLabel = primaryDealCtaLabel(resolved);
  const store = guessStoreLabel(deal.productUrl);
  const hot = (deal.discountPercent ?? 0) >= 30 || (deal.aiScore ?? 0) >= 88;
  const age = formatDealAge(deal.lastSeenAt);
  const extras = getDealCardExtras(deal);
  const viewsEst = estimateViewCount(deal.id);
  const trending = deal.trending;
  const limited = isRecentlyUpdated(deal.lastSeenAt, 36);
  const mayExpireSoon = isRecentlyUpdated(deal.lastSeenAt, 72);
  const priceDrop = hasPriceDropSignal(deal.priceHistory);
  const soft = isPriceContextIncomplete(deal);
  const saveAmt =
    deal.originalPrice != null && deal.originalPrice > deal.currentPrice
      ? deal.originalPrice - deal.currentPrice
      : null;

  const eng = engagement;
  const hasTracked =
    eng != null && (eng.affiliateClicks > 0 || eng.detailViews > 0);
  const checkedCount =
    eng != null && eng.detailViews > 0 ? eng.detailViews : viewsEst;

  let secondarySocial: string | null = null;
  if (hasTracked && eng && eng.affiliateClicks > 0) {
    secondarySocial = `${eng.affiliateClicks.toLocaleString()} used our shop link`;
  } else if (!hasTracked) {
    secondarySocial = extras.socialLine;
  }

  return (
    <Card
      className={`group flex h-full flex-col overflow-hidden border-neutral-200/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-xl ${
        soft ? "opacity-[0.92]" : ""
      }`}
    >
      <CardContent className="flex flex-1 flex-col p-0">
        <div className="flex items-center justify-between gap-2 border-b border-neutral-100 bg-neutral-50/90 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2 text-[11px] text-neutral-500">
            <span className="truncate font-semibold text-neutral-800">
              {store}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="shrink-0">{age}</span>
          </div>
          {hot && !soft && (
            <span className="flex items-center gap-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--accent)]">
              <Flame className="size-3.5" aria-hidden />
              Hot
            </span>
          )}
          {soft && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">
              Verify price
            </span>
          )}
        </div>

        {mayExpireSoon && !soft && (
          <p className="border-b border-amber-100 bg-amber-50/95 px-3 py-2 text-center text-[11px] font-bold text-amber-950">
            ⏳ May expire soon — price was refreshed recently
          </p>
        )}

        {(trending ||
          limited ||
          priceDrop ||
          (!soft && extras.badges.length > 0)) && (
          <div className="flex flex-wrap gap-1.5 border-b border-neutral-50 bg-white px-3 py-2">
            {trending && (
              <span
                className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-900"
                title="Editorial trending pick"
              >
                🔥 Trending
              </span>
            )}
            {limited && (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                ⏳ Limited time
              </span>
            )}
            {priceDrop && (
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-950">
                📉 Price drop
              </span>
            )}
            {!soft &&
              extras.badges.map((b) => (
                <Badge
                  key={b}
                  variant="muted"
                  className="border-0 px-2 py-0 text-[10px] font-bold uppercase tracking-wide text-neutral-800"
                >
                  {b}
                </Badge>
              ))}
          </div>
        )}

        <div className="relative aspect-[4/3] w-full bg-neutral-100">
          <AmazonShelfImage
            src={deal.imageUrl}
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          {priceDropBadge(deal.priceHistory)}
          {deal.discountPercent != null && (
            <div
              className={`absolute left-2 top-2 rounded-2xl px-3 py-2 shadow-2xl ring-2 ring-white/90 sm:left-3 sm:top-3 sm:px-4 sm:py-2.5 ${
                soft ? "bg-neutral-700" : "bg-[var(--accent)]"
              }`}
            >
              <p className="text-[10px] font-extrabold uppercase leading-none tracking-wider text-white/95">
                Save
              </p>
              <p className="mt-0.5 text-xl font-black tabular-nums text-white sm:text-2xl">
                {deal.discountPercent}%
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col space-y-3 p-4">
          {deal.brand && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              {deal.brand}
            </p>
          )}
          <Link
            href={`/deals/${deal.slug}`}
            className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug text-neutral-900 hover:text-[var(--accent)]"
          >
            {deal.title}
          </Link>

          <DealCredibilityStrip credibility={credibility} variant="card" />

          {extras.urgency && !soft && !mayExpireSoon && (
            <p className="text-[11px] font-semibold text-amber-800">
              {extras.urgency === "expiring"
                ? "⏱ Deal may expire soon"
                : "⚡ Limited-time pricing"}
            </p>
          )}

          <p className="text-sm font-bold text-orange-950">
            🔥 {checkedCount.toLocaleString()} people checked this deal
            {eng && eng.detailViews > 0 ? "" : " (est.)"}
          </p>

          {saveAmt != null && saveAmt > 0 && (
            <p
              className={`text-lg font-black tabular-nums tracking-tight ${
                soft ? "text-neutral-600" : "text-emerald-800"
              }`}
            >
              Save {deal.currency}
              {saveAmt.toFixed(2)} vs. list
            </p>
          )}

          <PriceDisplay
            currency={deal.currency}
            current={deal.currentPrice}
            original={deal.originalPrice}
            discountPercent={deal.discountPercent}
            size="md"
          />

          {secondarySocial && (
            <p className="text-[11px] leading-snug text-neutral-500">{secondarySocial}</p>
          )}

          {(deal.rating != null || deal.reviewCount != null) && (
            <p className="text-xs text-neutral-500">
              {deal.rating != null && (
                <span className="font-medium text-neutral-700">
                  ★ {deal.rating.toFixed(1)}
                </span>
              )}
              {deal.reviewCount != null && (
                <span className="text-neutral-400">
                  {" "}
                  (
                  {deal.reviewCount >= 1000
                    ? `${(deal.reviewCount / 1000).toFixed(1)}k`
                    : deal.reviewCount}{" "}
                  reviews)
                </span>
              )}
            </p>
          )}

          <div className={soft ? "opacity-80" : ""}>
            <AiScoreMeter score={deal.aiScore} size="sm" />
          </div>

          {deal.aiReasonToBuy && (
            <p
              className={`text-sm leading-relaxed text-neutral-600 ${
                soft ? "line-clamp-1" : "line-clamp-2"
              }`}
            >
              {deal.aiReasonToBuy}
            </p>
          )}

          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              className="min-h-9 flex-1 font-semibold shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:ring-2 hover:ring-[var(--accent)]/40"
              asChild
            >
              <AffiliateOutboundLink
                absoluteUrl={resolved}
                surface="deal_card"
                dealId={deal.id}
                slug={deal.slug}
              >
                {ctaLabel}
              </AffiliateOutboundLink>
            </Button>
            <DealSaveButton slug={deal.slug} size="sm" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
