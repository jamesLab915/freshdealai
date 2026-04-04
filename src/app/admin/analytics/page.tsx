import Link from "next/link";

import { AnalyticsLocalPanel } from "@/components/admin/analytics-local-panel";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { mockSearchQueries } from "@/lib/mock-admin";
import { getDealsForAdmin } from "@/services/deals";

export const metadata = { title: "Admin · Analytics" };

export default async function AdminAnalyticsPage() {
  const products = await getDealsForAdmin();
  const total = products.length;
  const published = products.filter((p) => p.published).length;
  const fallbackAff = products.filter((p) => p.usesProductUrlFallback).length;

  let dbQueries: { query: string; resultCount: number }[] = [];
  if (prisma) {
    try {
      const rows = await prisma.searchQuery.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
      });
      dbQueries = rows.map((r) => ({
        query: r.query,
        resultCount: r.resultCount,
      }));
    } catch {
      dbQueries = [];
    }
  }
  if (!dbQueries.length) {
    dbQueries = mockSearchQueries;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/admin" className="text-sm text-[var(--accent)]">
        ← Admin home
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Analytics</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Server counts from the catalog; browser funnels are local-only until you wire
        an analytics backend.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total deals (catalog)" value={String(total)} />
        <StatCard label="Published" value={String(published)} />
        <StatCard label="Affiliate fallback (product URL)" value={String(fallbackAff)} />
        <StatCard
          label="Search rows (DB or mock)"
          value={String(dbQueries.length)}
        />
      </div>

      <h2 className="mt-12 text-lg font-bold text-neutral-900">Recent search queries</h2>
      <p className="mt-1 text-sm text-neutral-500">
        {prisma ? "PostgreSQL `search_queries`" : "Demo fixtures — connect DATABASE_URL"}
      </p>
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

      <h2 className="mt-12 text-lg font-bold text-neutral-900">Browser-only signals</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Aggregated from `flashdeal-tracking-v1` in localStorage (affiliate clicks &
        search submits).
      </p>
      <div className="mt-4">
        <AnalyticsLocalPanel />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold tabular-nums text-neutral-900">{value}</p>
      </CardContent>
    </Card>
  );
}
