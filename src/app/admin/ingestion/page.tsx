import Link from "next/link";

import { CsvImportPanel } from "@/components/admin/csv-import-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getIngestionSourceLine } from "@/lib/ingestion-health";
import { prisma } from "@/lib/prisma";
import { mockIngestionJobs } from "@/lib/mock-admin";

export const metadata = { title: "Admin · Ingestion" };

type Props = { searchParams: Promise<{ msg?: string }> };

const SOURCES = [
  {
    id: "AMAZON_PA_API",
    label: "Amazon (Product Advertising API)",
    blurb: "Search + ASIN hydration — requires PA-API keys in env.",
  },
  {
    id: "SCRAPED_RETAILER",
    label: "Retailer page",
    blurb: "Compliant HTML snapshot → normalized product rows.",
  },
  {
    id: "CSV_IMPORT",
    label: "CSV batch",
    blurb: "Upload or paste CSV — preview below.",
  },
] as const;

export default async function AdminIngestionPage({ searchParams }: Props) {
  const { msg } = await searchParams;
  const health = getIngestionSourceLine();

  let dbJobs: { id: string; source: string; status: string; logs: string | null }[] =
    [];
  if (prisma) {
    try {
      dbJobs = await prisma.ingestionJob.findMany({
        orderBy: { startedAt: "desc" },
        take: 20,
      });
    } catch {
      dbJobs = [];
    }
  }

  const jobs = dbJobs.length
    ? dbJobs.map((j) => ({
        id: j.id,
        source: j.source,
        status: j.status,
        logs: j.logs,
      }))
    : mockIngestionJobs.map((j) => ({
        id: j.id,
        source: j.source,
        status: j.status,
        logs: j.logs,
      }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/admin" className="text-sm text-[var(--accent)]">
        ← Admin home
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Ingestion</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Data sources, CSV preview, and job history — wire workers when you are ready
        to persist.
      </p>
      {msg && (
        <p className="mt-4 whitespace-pre-wrap rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {decodeURIComponent(msg)}
        </p>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <HealthCard
          title="Amazon PA API"
          status={health.amazonPaApi === "ready" ? "Ready" : "Not configured"}
          detail={
            health.amazonPaApi === "ready"
              ? "Access keys detected in environment."
              : "Set AMAZON_ACCESS_KEY_ID + AMAZON_SECRET_ACCESS_KEY (or legacy PA keys)."
          }
          tone={health.amazonPaApi === "ready" ? "ok" : "warn"}
        />
        <HealthCard
          title="Retailer scraper"
          status="Mock only"
          detail="No production scraper — use ingestion stubs or CSV."
          tone="neutral"
        />
        <HealthCard
          title="CSV import"
          status="Available"
          detail="Parse + preview via importCsvDeals — persistence TBD."
          tone="ok"
        />
      </div>

      <div className="mt-10">
        <CsvImportPanel />
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {SOURCES.map((s) => (
          <Card key={s.id} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col p-5">
              <p className="font-semibold text-neutral-900">{s.label}</p>
              <p className="mt-2 flex-1 text-sm text-neutral-600">{s.blurb}</p>
              <form action="/api/admin/ingestion/trigger" method="POST" className="mt-4">
                <input type="hidden" name="source" value={s.id} />
                <Button type="submit" className="w-full" variant="secondary">
                  Trigger (mock)
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 text-lg font-bold text-neutral-900">Recent jobs</h2>
      <p className="mt-1 text-sm text-neutral-500">
        {prisma ? "Live PostgreSQL" : "Demo logs — connect DATABASE_URL to persist"}
      </p>

      <div className="mt-6 space-y-6">
        {jobs.map((j) => (
          <Card key={j.id}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-neutral-900">{j.source}</p>
                <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium">
                  {j.status}
                </span>
              </div>
              <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-900 p-4 text-xs text-neutral-100">
                {j.logs ?? "No logs"}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function HealthCard({
  title,
  status,
  detail,
  tone,
}: {
  title: string;
  status: string;
  detail: string;
  tone: "ok" | "warn" | "neutral";
}) {
  const border =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50/80"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50/80"
        : "border-neutral-200 bg-neutral-50/80";
  return (
    <div className={`rounded-xl border p-4 ${border}`}>
      <p className="text-sm font-semibold text-neutral-900">{title}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-neutral-600">
        {status}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-neutral-600">{detail}</p>
    </div>
  );
}
