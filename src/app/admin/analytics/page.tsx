import Link from "next/link";

import { AnalyticsLocalPanel } from "@/components/admin/analytics-local-panel";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin · Analytics" };

export default async function AdminAnalyticsPage() {
  let total = 0;
  let published = 0;
  let withAffiliate = 0;
  let missingAffiliate = 0;
  let featuredCount = 0;
  let topCategories: { name: string; count: number }[] = [];
  let recentJobs: { id: string; source: string; status: string; startedAt: Date | null; logs: string | null }[] = [];
  let dbQueries: { query: string; resultCount: number }[] = [];
  let topByAffiliate: { title: string; slug: string; clicks: number }[] = [];
  let totalAffClicks = 0;
  let sumDetailViews = 0;
  let ctrApproxPct: number | null = null;
  let topCategoriesByClicks: { name: string; clicks: number }[] = [];
  let topBrandsByClicks: { name: string; clicks: number }[] = [];
  let risingDeals: {
    title: string;
    slug: string;
    clicks: number;
    updatedAt: Date;
  }[] = [];
  type CtrDealRow = {
    title: string;
    slug: string;
    views: number;
    clicks: number;
    ctr: number;
  };
  let topCtrDeals: CtrDealRow[] = [];
  let lowViewHighCtrDeals: CtrDealRow[] = [];
  let highViewLowCtrDeals: CtrDealRow[] = [];

  if (prisma) {
    try {
      total = await prisma.product.count();
      published = await prisma.product.count({ where: { published: true } });
      withAffiliate = await prisma.product.count({
        where: { affiliateUrl: { not: null }, published: true },
      });
      missingAffiliate = await prisma.product.count({
        where: { published: true, affiliateUrl: null },
      });
      featuredCount = await prisma.product.count({
        where: { published: true, featured: true },
      });

      const catRows = await prisma.product.groupBy({
        by: ["category"],
        where: { published: true, category: { not: null } },
        _count: { _all: true },
      });
      topCategories = catRows
        .filter((r) => r.category)
        .map((r) => ({ name: r.category!, count: r._count._all }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);

      recentJobs = await prisma.ingestionJob.findMany({
        orderBy: { startedAt: "desc" },
        take: 12,
        select: {
          id: true,
          source: true,
          status: true,
          startedAt: true,
          logs: true,
        },
      });

      const sq = await prisma.searchQuery.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      dbQueries = sq.map((r) => ({
        query: r.query,
        resultCount: r.resultCount,
      }));

      const agg = await prisma.dealEngagementStat.aggregate({
        _sum: { affiliateClicks: true },
      });
      totalAffClicks = agg._sum.affiliateClicks ?? 0;

      const viewsAgg = await prisma.dealEngagementStat.aggregate({
        _sum: { detailViews: true },
      });
      sumDetailViews = viewsAgg._sum.detailViews ?? 0;
      ctrApproxPct =
        sumDetailViews > 0 ? (totalAffClicks / sumDetailViews) * 100 : null;

      const engRows = await prisma.dealEngagementStat.findMany({
        where: { affiliateClicks: { gt: 0 } },
        take: 500,
        include: {
          product: { select: { category: true, brand: true } },
        },
      });
      const catClicks = new Map<string, number>();
      const brandClickMap = new Map<string, number>();
      for (const e of engRows) {
        const cat = e.product.category;
        if (cat) {
          catClicks.set(cat, (catClicks.get(cat) ?? 0) + e.affiliateClicks);
        }
        const br = e.product.brand;
        if (br) {
          brandClickMap.set(br, (brandClickMap.get(br) ?? 0) + e.affiliateClicks);
        }
      }
      topCategoriesByClicks = [...catClicks.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([name, clicks]) => ({ name, clicks }));
      topBrandsByClicks = [...brandClickMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([name, clicks]) => ({ name, clicks }));

      const weekAgo = new Date(Date.now() - 7 * 86400000);
      const risingRows = await prisma.dealEngagementStat.findMany({
        where: {
          updatedAt: { gte: weekAgo },
          affiliateClicks: { gt: 0 },
        },
        orderBy: { affiliateClicks: "desc" },
        take: 15,
        include: {
          product: { select: { title: true, slug: true } },
        },
      });
      risingDeals = risingRows.map((r) => ({
        title: r.product.title,
        slug: r.product.slug,
        clicks: r.affiliateClicks,
        updatedAt: r.updatedAt,
      }));

      const topEng = await prisma.dealEngagementStat.findMany({
        orderBy: { affiliateClicks: "desc" },
        take: 15,
        include: {
          product: { select: { title: true, slug: true } },
        },
      });
      topByAffiliate = topEng.map((e) => ({
        title: e.product.title,
        slug: e.product.slug,
        clicks: e.affiliateClicks,
      }));

      const ctrBase = await prisma.dealEngagementStat.findMany({
        include: {
          product: { select: { title: true, slug: true } },
        },
        take: 600,
      });
      const ctrEnriched: CtrDealRow[] = ctrBase.map((s) => {
        const views = s.detailViews;
        const clicks = s.affiliateClicks;
        const ctr = views > 0 ? (clicks / views) * 100 : 0;
        return {
          title: s.product.title,
          slug: s.product.slug,
          views,
          clicks,
          ctr,
        };
      });
      topCtrDeals = ctrEnriched
        .filter((x) => x.views >= 5 && x.clicks >= 1)
        .sort((a, b) => b.ctr - a.ctr)
        .slice(0, 15);
      lowViewHighCtrDeals = ctrEnriched
        .filter(
          (x) =>
            x.views >= 3 &&
            x.views <= 35 &&
            x.clicks >= 1 &&
            x.ctr >= 10
        )
        .sort((a, b) => b.ctr - a.ctr)
        .slice(0, 12);
      highViewLowCtrDeals = ctrEnriched
        .filter((x) => x.views >= 50 && x.ctr < 2 && x.clicks <= 6)
        .sort((a, b) => b.views - a.views)
        .slice(0, 12);
    } catch {
      /* empty */
    }
  }

  const hasDb = Boolean(prisma);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/admin" className="text-sm text-[var(--accent)]">
        ← Admin home
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Analytics</h1>
      <p className="mt-2 text-sm text-neutral-600">
        PostgreSQL aggregates for operations; browser funnels remain local-only below.
      </p>

      {!prisma && (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Connect <span className="font-mono">DATABASE_URL</span> to see catalog metrics.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total products" value={String(total)} empty={!hasDb} />
        <StatCard label="Published" value={String(published)} empty={!hasDb} />
        <StatCard
          label="With affiliate_url"
          value={String(withAffiliate)}
          empty={!hasDb}
        />
        <StatCard
          label="Missing affiliate (published)"
          value={String(missingAffiliate)}
          empty={!hasDb}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Featured (published)" value={String(featuredCount)} empty={!hasDb} />
        <StatCard
          label="Top categories (rows)"
          value={topCategories.length ? `${topCategories.length} groups` : "—"}
          empty={!hasDb}
        />
        <StatCard
          label="Affiliate exits tracked (/out)"
          value={String(totalAffClicks)}
          empty={!hasDb}
        />
        <StatCard
          label="Top converting (DB)"
          value={topByAffiliate.length ? `${topByAffiliate.length} deals` : "—"}
          empty={!hasDb}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Detail views (sum)"
          value={String(sumDetailViews)}
          empty={!hasDb}
        />
        <StatCard
          label="CTR-ish (clicks ÷ detail views)"
          value={
            ctrApproxPct != null ? `${ctrApproxPct.toFixed(2)}%` : "—"
          }
          empty={!hasDb}
        />
        <StatCard
          label="Top categories (by clicks)"
          value={
            topCategoriesByClicks.length
              ? `${topCategoriesByClicks.length} rows`
              : "—"
          }
          empty={!hasDb}
        />
        <StatCard
          label="Top brands (by clicks)"
          value={
            topBrandsByClicks.length ? `${topBrandsByClicks.length} rows` : "—"
          }
          empty={!hasDb}
        />
      </div>

      <h2 className="mt-12 text-lg font-bold text-neutral-900">
        Revenue actions
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-neutral-600">
        CTR from detail views to affiliate exits. Use these as a punch list — no new
        pipelines, just ops follow-through.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="border-emerald-200/90 bg-emerald-50/50 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <p className="text-base font-bold text-emerald-950">
              Promote this deal
            </p>
            <p className="text-sm leading-relaxed text-emerald-950/90">
              Low traffic but clicks convert — give these SKUs{" "}
              <span className="font-semibold">homepage rank</span>, featured, or hub
              placement before the window closes.
            </p>
            {!hasDb || lowViewHighCtrDeals.length === 0 ? (
              <p className="text-sm text-emerald-900/80">
                No rows in the “early winner” band yet. When a few detail views produce
                strong CTR, they will show here.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {lowViewHighCtrDeals.slice(0, 8).map((r) => (
                  <li
                    key={r.slug}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-emerald-100/80 pb-2 last:border-0"
                  >
                    <Link
                      href={`/deals/${r.slug}`}
                      className="font-medium text-emerald-900 underline-offset-2 hover:underline"
                    >
                      {r.title}
                    </Link>
                    <span className="shrink-0 tabular-nums text-xs text-emerald-800">
                      {r.views} views · {r.ctr.toFixed(1)}% CTR
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/products"
              className="inline-block text-sm font-semibold text-emerald-900 hover:underline"
            >
              Admin → Products (set homepage_rank) →
            </Link>
          </CardContent>
        </Card>

        <Card className="border-amber-200/90 bg-amber-50/50 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <p className="text-base font-bold text-amber-950">Fix this deal</p>
            <p className="text-sm leading-relaxed text-amber-950/90">
              High views but weak CTR — tighten headline price, hero image, affiliate
              link, or AI copy so the listing earns the traffic it already gets.
            </p>
            {!hasDb || highViewLowCtrDeals.length === 0 ? (
              <p className="text-sm text-amber-900/80">
                Nothing in the friction bucket right now — either volume is still low or
                listings are converting fine.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {highViewLowCtrDeals.slice(0, 8).map((r) => (
                  <li
                    key={r.slug}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-amber-100/80 pb-2 last:border-0"
                  >
                    <Link
                      href={`/deals/${r.slug}`}
                      className="font-medium text-amber-950 underline-offset-2 hover:underline"
                    >
                      {r.title}
                    </Link>
                    <span className="shrink-0 tabular-nums text-xs text-amber-900">
                      {r.views} views · {r.clicks} clicks
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/products"
              className="inline-block text-sm font-semibold text-amber-950 hover:underline"
            >
              Admin → Products (edit listing) →
            </Link>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-12 text-lg font-bold text-neutral-900">
        Affiliate clicks by deal (server)
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Incremented when users pass through <span className="font-mono">/out?...&amp;deal=</span>
      </p>
      {topByAffiliate.length === 0 ? (
        <EmptyRow />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Deal</th>
                <th className="px-4 py-3">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {topByAffiliate.map((r) => (
                <tr key={r.slug} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/deals/${r.slug}`}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">{r.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 text-lg font-bold text-neutral-900">
        Top CTR deals (per listing)
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        CTR = affiliate_clicks ÷ detail_views. Requires ≥5 views and ≥1 click so
        percentages aren’t noise.
      </p>
      {topCtrDeals.length === 0 ? (
        <EmptyRow message="No rows meet the sample threshold yet. Drive detail_views (detail page tracker) and affiliate_clicks (/out) to populate this." />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Deal</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">CTR</th>
              </tr>
            </thead>
            <tbody>
              {topCtrDeals.map((r) => (
                <tr key={r.slug} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/deals/${r.slug}`}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {r.views}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {r.clicks}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {r.ctr.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 text-lg font-bold text-neutral-900">
        Low views, high CTR (early winners)
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        3–35 views, ≥10% CTR, ≥1 click — good candidates to promote before the
        crowd finds them.
      </p>
      {lowViewHighCtrDeals.length === 0 ? (
        <EmptyRow message="Nothing in this band yet. As soon as a few views convert strongly, rows will appear here." />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Deal</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">CTR</th>
              </tr>
            </thead>
            <tbody>
              {lowViewHighCtrDeals.map((r) => (
                <tr key={r.slug} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/deals/${r.slug}`}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {r.views}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {r.clicks}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {r.ctr.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 text-lg font-bold text-neutral-900">
        High views, low CTR (friction)
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        ≥50 views, CTR under ~2%, few clicks — worth checking price clarity, CTA, or
        listing quality.
      </p>
      {highViewLowCtrDeals.length === 0 ? (
        <EmptyRow message="Either traffic is still ramping, or listings are converting well enough that none sit in this bucket." />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Deal</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">CTR</th>
              </tr>
            </thead>
            <tbody>
              {highViewLowCtrDeals.map((r) => (
                <tr key={r.slug} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/deals/${r.slug}`}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {r.views}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {r.clicks}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {r.ctr.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 text-lg font-bold text-neutral-900">
        Top categories by outbound clicks
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Weighted sum of <span className="font-mono">affiliate_clicks</span> per
        category (approximate intent).
      </p>
      {topCategoriesByClicks.length === 0 ? (
        <EmptyRow />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {topCategoriesByClicks.map((r) => (
                <tr key={r.name} className="border-b border-neutral-100">
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {r.clicks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 text-lg font-bold text-neutral-900">
        Top brands by outbound clicks
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Sum of <span className="font-mono">affiliate_clicks</span> where brand is set.
      </p>
      {topBrandsByClicks.length === 0 ? (
        <EmptyRow />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {topBrandsByClicks.map((r) => (
                <tr key={r.name} className="border-b border-neutral-100">
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {r.clicks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 text-lg font-bold text-neutral-900">
        Rising deals (7d, by outbound clicks)
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Rows with recent engagement updates — proxy for “hot” listings when hourly
        click history is unavailable.
      </p>
      {risingDeals.length === 0 ? (
        <EmptyRow />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Deal</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {risingDeals.map((r) => (
                <tr key={r.slug} className="border-b border-neutral-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/deals/${r.slug}`}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {r.clicks}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {new Date(r.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 text-lg font-bold text-neutral-900">
        Top categories (catalog size)
      </h2>
      <p className="mt-1 text-sm text-neutral-500">By published product count</p>
      {topCategories.length === 0 ? (
        <EmptyRow />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Products</th>
              </tr>
            </thead>
            <tbody>
              {topCategories.map((r) => (
                <tr key={r.name} className="border-b border-neutral-100">
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 text-lg font-bold text-neutral-900">Recent ingestion / engine runs</h2>
      <p className="mt-1 text-sm text-neutral-500">Latest rows from `ingestion_jobs`</p>
      {recentJobs.length === 0 ? (
        <EmptyRow />
      ) : (
        <div className="mt-4 space-y-4">
          {recentJobs.map((j) => (
            <Card key={j.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-neutral-900">{j.source}</p>
                  <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium">
                    {j.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {j.startedAt
                    ? new Date(j.startedAt).toLocaleString()
                    : "—"}
                </p>
                <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-900 p-3 text-xs text-neutral-100">
                  {j.logs ?? "—"}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mt-12 text-lg font-bold text-neutral-900">Top searched queries</h2>
      <p className="mt-1 text-sm text-neutral-500">From `search_queries` (when logged)</p>
      {dbQueries.length === 0 ? (
        <EmptyRow />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Query</th>
                <th className="px-4 py-3">Results</th>
              </tr>
            </thead>
            <tbody>
              {dbQueries.map((r, i) => (
                <tr key={`${r.query}-${i}`} className="border-b border-neutral-100">
                  <td className="px-4 py-3">{r.query}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {r.resultCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 text-lg font-bold text-neutral-900">Browser-only signals</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Aggregated from `flashdeal-tracking-v1` in localStorage (affiliate clicks & search
        submits).
      </p>
      <div className="mt-4">
        <AnalyticsLocalPanel />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  empty,
}: {
  label: string;
  value: string;
  empty?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {label}
        </p>
        <p
          className={`mt-2 text-2xl font-bold tabular-nums ${
            empty ? "text-neutral-400" : "text-neutral-900"
          }`}
        >
          {empty ? "—" : value}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyRow({ message }: { message?: string }) {
  return (
    <p className="mt-4 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm leading-relaxed text-neutral-500">
      {message ?? "No data yet."}
    </p>
  );
}
