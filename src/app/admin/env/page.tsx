import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { getEnvStatus } from "@/lib/env";

export const metadata = { title: "Admin · Environment" };

function flag(ok: boolean): string {
  return ok ? "configured" : "missing";
}

function siteUrlSourceLabel(source: string): string {
  switch (source) {
    case "explicit":
      return "NEXT_PUBLIC_SITE_URL";
    case "vercel_deployment":
      return "VERCEL_URL (preview / deployment host)";
    case "dev_default":
      return "dev default (localhost:3010)";
    case "implicit_local":
      return "implicit localhost:3010 (set NEXT_PUBLIC_SITE_URL for public URL)";
    default:
      return source;
  }
}

export default function AdminEnvPage() {
  const e = getEnvStatus();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/admin" className="text-sm text-[var(--accent)]">
        ← Admin home
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Environment status</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Values are never shown — only whether each variable is set. Admin routes are
        protected with HTTP Basic Auth when{" "}
        <span className="font-mono text-xs">ADMIN_USERNAME</span> /{" "}
        <span className="font-mono text-xs">ADMIN_PASSWORD</span> are configured.
      </p>

      <Card className="mt-8">
        <CardContent className="space-y-4 p-6">
          <Row label="DATABASE_URL" status={flag(e.hasDatabaseUrl)} />
          <Row label="OPENAI_API_KEY" status={flag(e.hasOpenAiKey)} />
          <Row label="NEXT_PUBLIC_SITE_URL" status={flag(e.hasSiteUrl)} />
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-neutral-500">
        Resolved public site URL:{" "}
        <span className="font-mono text-neutral-700">{e.siteUrl}</span>
        <span className="mt-2 block text-neutral-500">
          Source: {siteUrlSourceLabel(e.siteUrlSource)}
        </span>
      </p>
    </div>
  );
}

function Row({ label, status }: { label: string; status: string }) {
  const ok = status === "configured";
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
      <span className="font-mono text-sm text-neutral-800">{label}</span>
      <span
        className={
          ok
            ? "rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900"
            : "rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600"
        }
      >
        {status}
      </span>
    </div>
  );
}
