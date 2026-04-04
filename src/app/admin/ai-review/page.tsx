import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMockCons, getMockPros } from "@/lib/deal-mock-extras";
import { mockAiTasks } from "@/lib/mock-admin";
import { prisma } from "@/lib/prisma";
import { getDealsForAdmin } from "@/services/deals";

export const metadata = { title: "Admin · AI review" };

type Props = { searchParams: Promise<{ msg?: string }> };

export default async function AdminAiReviewPage({ searchParams }: Props) {
  const { msg } = await searchParams;

  let rows: { id: string; taskType: string; status: string; productId: string | null }[] =
    [];
  if (prisma) {
    try {
      rows = await prisma.aiTask.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
      });
    } catch {
      rows = [];
    }
  }
  if (!rows.length) {
    rows = mockAiTasks.map((t) => ({
      id: t.id,
      taskType: t.taskType,
      status: t.status,
      productId: t.productId,
    }));
  }

  const products = await getDealsForAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/admin" className="text-sm text-[var(--accent)]">
        ← Admin home
      </Link>
      <h1 className="mt-4 text-2xl font-bold">AI review</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Audit AI outputs per product — pros/cons are mock-enriched for QA until stored
        in the schema. Re-run uses the same pipeline as production.
      </p>
      {msg && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {decodeURIComponent(msg)}
        </p>
      )}

      <div className="mt-10 space-y-8">
        {products.slice(0, 40).map((p) => {
          const pros = getMockPros(p);
          const cons = getMockCons(p);
          return (
            <Card key={p.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-neutral-900">{p.title}</p>
                    <p className="text-xs text-neutral-500">
                      {p.slug} · AI score {p.aiScore ?? "—"}
                    </p>
                  </div>
                  <form action="/api/admin/ai/rerun" method="POST">
                    <input type="hidden" name="productId" value={p.id} />
                    <Button size="sm" type="submit" variant="outline">
                      Re-run AI
                    </Button>
                  </form>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase text-neutral-500">
                      ai_summary
                    </p>
                    <p className="mt-1 text-sm text-neutral-800">
                      {p.aiSummary ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-neutral-500">
                      why_buy (ai_reason_to_buy)
                    </p>
                    <p className="mt-1 text-sm text-neutral-800">
                      {p.aiReasonToBuy ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase text-neutral-500">
                      pros (mock)
                    </p>
                    <ul className="mt-1 list-inside list-disc text-sm text-neutral-700">
                      {pros.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-neutral-500">
                      cons (mock)
                    </p>
                    <ul className="mt-1 list-inside list-disc text-sm text-neutral-600">
                      {cons.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <h2 className="mt-16 text-lg font-bold text-neutral-900">Recent tasks</h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100">
                <td className="px-4 py-3 font-mono text-xs">{r.taskType}</td>
                <td className="px-4 py-3 text-neutral-600">{r.productId ?? "—"}</td>
                <td className="px-4 py-3">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
