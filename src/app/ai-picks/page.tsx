import { AiPickRow } from "@/components/ai-picks/ai-pick-row";
import { siteMetadata } from "@/lib/site-metadata";
import { getDeals } from "@/services/deals";

export const metadata = siteMetadata({
  title: "AI Picks",
  description:
    "Deals grouped by AI strategy — best value, trending momentum, and premium picks with explanations.",
  path: "/ai-picks",
});

export default async function AiPicksPage() {
  const { deals, source } = await getDeals({ sort: "ai_score" });

  const sorted = [...deals].sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));

  let bestValue = sorted.filter(
    (d) => (d.discountPercent ?? 0) >= 18 && (d.aiScore ?? 0) >= 76
  );
  if (bestValue.length < 4) {
    bestValue = sorted.filter((d) => (d.discountPercent ?? 0) >= 15);
  }
  bestValue = bestValue.slice(0, 6);

  const trending = [...deals]
    .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    .slice(0, 6);

  let premium = sorted.filter(
    (d) => (d.aiScore ?? 0) >= 88 || d.currentPrice >= 120
  );
  if (premium.length < 4) {
    premium = sorted.slice(0, 6);
  } else {
    premium = premium.slice(0, 6);
  }

  return (
    <div>
      <section className="border-b border-neutral-200 bg-gradient-to-r from-orange-50/90 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            Grouped intelligence
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            AI Picks
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
            Three lenses on the same catalog — <strong>value</strong> (discount depth +
            score), <strong>trending</strong> (shopper momentum), and{" "}
            <strong>premium</strong> (high confidence or higher ticket). Each card
            includes a plain-English reason so you know why it surfaced. Data:{" "}
            <strong className="text-neutral-800">
              {source === "database" ? "PostgreSQL" : "demo catalog"}
            </strong>
            .
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
        <section>
          <h2 className="text-2xl font-bold text-neutral-900">Best Value</h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            High discount with a strong AI score — the sweet spot for most carts.
          </p>
          <div className="mt-10 space-y-12">
            {bestValue.map((d) => (
              <AiPickRow key={`bv-${d.id}`} deal={d} kind="value" />
            ))}
          </div>
        </section>

        <section className="border-t border-neutral-200 pt-16">
          <h2 className="text-2xl font-bold text-neutral-900">Trending Now</h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Momentum from review volume and engagement — great when you want proven
            crowd favorites.
          </p>
          <div className="mt-10 space-y-12">
            {trending.map((d) => (
              <AiPickRow key={`tr-${d.id}`} deal={d} kind="trending" />
            ))}
          </div>
        </section>

        <section className="border-t border-neutral-200 pt-16">
          <h2 className="text-2xl font-bold text-neutral-900">Premium Picks</h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Top scores or higher-ticket items where trust and specs matter most.
          </p>
          <div className="mt-10 space-y-12">
            {premium.map((d) => (
              <AiPickRow key={`p-${d.id}`} deal={d} kind="premium" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
