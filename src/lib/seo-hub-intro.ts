/**
 * Conversion-focused hub copy — deterministic (no API cost). Safe for SSR/ISR.
 */

export function buildBestDealsIntro(dealCount: number, sourceLabel: string): string {
  const n = Math.max(dealCount, 0);
  return `This is our daily editor’s shelf — ${n} US listings that cleared a high AI bar for discount depth, review signals, and retailer trust. Nothing here is paid placement. Tap through for transparent outbound links and always confirm the cart on the merchant. Catalog: ${sourceLabel}. Prices and coupons move fast; we refresh as ingestion runs.`;
}

export function buildCategoryBestDealsIntro(
  categoryName: string,
  dealCount: number,
  sourceLabel: string
): string {
  const n = Math.max(dealCount, 0);
  return `We built this ${categoryName} hub like a magazine spread: ${n} offers worth your attention, ranked after AI review — not sponsor slots. Skim the cards, read the one-line verdicts, then open the retailer when you’re ready. Source: ${sourceLabel}. If a price looks too good, double-check model numbers and seller on checkout.`;
}

export function buildTop10Intro(
  categoryName: string,
  dealCount: number,
  sourceLabel: string
): string {
  const n = Math.min(Math.max(dealCount, 0), 10);
  return `A tight shortlist — the ${n} strongest ${categoryName} offers we’re comfortable spotlighting right now. Each row is scored for value and risk; you get plain-English context and a direct path to buy. Pulled from ${sourceLabel}. Inventory shifts quickly, so treat this page as a compass, not a contract.`;
}

export function buildBrandDealsIntro(
  brandName: string,
  dealCount: number,
  sourceLabel: string
): string {
  const n = Math.max(dealCount, 0);
  return `${brandName} deals worth a look right now — ${n} offers pulled from our catalog with AI scoring and discount transparency. Data: ${sourceLabel}. We highlight savings when list prices look credible; always verify the latest offer on the merchant site.`;
}

export function buildUnderPriceIntro(
  maxPrice: number,
  dealCount: number,
  sourceLabel: string
): string {
  const n = Math.max(dealCount, 0);
  return `Budget mode, editor-approved: ${n} live US picks at or below $${maxPrice}, ranked for real savings signals — not affiliate pay-to-play. Source: ${sourceLabel}. We filter on indexed shelf price; tax, shipping, and coupons land at checkout.`;
}

/** Hero line for the high-traffic $50 ceiling page (copy tuned for paid/social landing). */
export function buildUnder50EditorialLead(dealCount: number, sourceLabel: string): string {
  const n = Math.max(dealCount, 0);
  return `Under fifty bucks, still worth talking about — ${n} deals our model would flag to a friend. Same transparent outbound links as the rest of FlashDealAI. Data: ${sourceLabel}.`;
}

export function buildBrandCategoryHubIntro(
  brandName: string,
  categoryName: string,
  dealCount: number,
  sourceLabel: string
): string {
  const n = Math.max(dealCount, 0);
  return `${brandName} in ${categoryName}: ${n} offers that pass our AI bar for discount depth and listing quality. Data: ${sourceLabel}. Use this as a shortlist — compare specs and return policies on the merchant site.`;
}

export function buildBestDealsTodayIntro(dealCount: number, sourceLabel: string): string {
  const n = Math.max(dealCount, 0);
  return `What landed on our radar in the last 24 hours — ${n} listings with fresh “last seen” signals and AI scores attached. Built for readers who hate stale coupon blogs. Source: ${sourceLabel}. Flash sales vanish; if a card looks quiet, widen your search from the links below.`;
}

export function buildBestDealsThisWeekIntro(
  dealCount: number,
  sourceLabel: string
): string {
  const n = Math.max(dealCount, 0);
  return `Deals we’ve seen move in the last seven days — ${n} offers with recent activity signals. Source: ${sourceLabel}. Rankings favor value and trust; still verify the final price on the retailer.`;
}
