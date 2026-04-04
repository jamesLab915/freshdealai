import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";

import { AffiliateOutboundLink } from "@/components/affiliate-outbound-link";
import { DealSaveButton } from "@/components/deals/deal-save-button";
import { AiScoreMeter } from "@/components/deals/ai-score-meter";
import { PriceDisplay } from "@/components/deals/price-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDealCardExtras } from "@/lib/deal-mock-extras";
import { formatDealAge, guessStoreLabel } from "@/lib/store-utils";
import type { DealProduct } from "@/types/deal";

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

export function DealCard({ deal }: { deal: DealProduct }) {
  const resolved = deal.affiliateUrl;
  const store = guessStoreLabel(deal.productUrl);
  const hot = (deal.discountPercent ?? 0) >= 30 || (deal.aiScore ?? 0) >= 88;
  const age = formatDealAge(deal.lastSeenAt);
  const extras = getDealCardExtras(deal);

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-neutral-200/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-xl">
      <CardContent className="flex flex-1 flex-col p-0">
        <div className="flex items-center justify-between gap-2 border-b border-neutral-100 bg-neutral-50/90 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2 text-[11px] text-neutral-500">
            <span className="truncate font-semibold text-neutral-800">
              {store}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="shrink-0">{age}</span>
          </div>
          {hot && (
            <span className="flex items-center gap-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--accent)]">
              <Flame className="size-3.5" aria-hidden />
              Hot
            </span>
          )}
        </div>

        {extras.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b border-neutral-50 bg-white px-3 py-2">
            {extras.badges.map((b) => (
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
          {deal.imageUrl ? (
            <Image
              src={deal.imageUrl}
              alt=""
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
              sizes="(max-width:768px) 100vw, 320px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              No image
            </div>
          )}
          {priceDropBadge(deal.priceHistory)}
          {deal.discountPercent != null && (
            <Badge className="absolute right-2 top-2 border-0 bg-[var(--accent)] px-2.5 py-0.5 text-xs font-bold text-white shadow-md">
              {deal.discountPercent}% OFF
            </Badge>
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

          {extras.urgency && (
            <p className="text-[11px] font-semibold text-amber-800">
              {extras.urgency === "expiring"
                ? "⏱ Deal may expire soon"
                : "⚡ Limited-time pricing"}
            </p>
          )}

          <PriceDisplay
            currency={deal.currency}
            current={deal.currentPrice}
            original={deal.originalPrice}
            discountPercent={deal.discountPercent}
            size="md"
          />

          <p className="text-[11px] text-neutral-500">{extras.socialLine}</p>

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

          <AiScoreMeter score={deal.aiScore} size="sm" />

          {deal.aiReasonToBuy && (
            <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600">
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
                Get Deal →
              </AffiliateOutboundLink>
            </Button>
            <DealSaveButton slug={deal.slug} size="sm" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
