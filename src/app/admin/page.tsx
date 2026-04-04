import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { mockAiTasks, mockIngestionJobs } from "@/lib/mock-admin";

export const metadata = { title: "Admin" };

const links = [
  { href: "/admin/products", label: "Products", desc: "Edit, publish, QA flags" },
  { href: "/admin/ingestion", label: "Ingestion", desc: "CSV, sources & job logs" },
  { href: "/admin/ai-review", label: "AI review", desc: "Task queue & re-runs" },
  { href: "/admin/analytics", label: "Analytics", desc: "Counts & local click stats" },
  { href: "/admin/env", label: "Environment", desc: "Configured vs missing secrets" },
];

export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
        Internal
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Admin console</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">
        Console for inventory, ingestion, AI tasks, and analytics — backed by PostgreSQL
        or demo fixtures. Access requires HTTP Basic Auth (
        <span className="font-mono text-xs">ADMIN_USERNAME</span> /{" "}
        <span className="font-mono text-xs">ADMIN_PASSWORD</span>
        ).
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="h-full hover:border-neutral-300">
              <CardContent className="p-5">
                <p className="font-semibold text-neutral-900">{l.label}</p>
                <p className="mt-2 text-sm text-neutral-600">{l.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold">Recent ingestion jobs (demo)</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              {mockIngestionJobs.map((j) => (
                <li key={j.id} className="flex justify-between gap-2">
                  <span>{j.source}</span>
                  <span className="text-neutral-400">{j.status}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/admin/ingestion"
              className="mt-4 inline-block text-sm font-medium text-[var(--accent)]"
            >
              View logs →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold">AI tasks (demo)</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              {mockAiTasks.map((t) => (
                <li key={t.id} className="flex justify-between gap-2">
                  <span>{t.taskType}</span>
                  <span className="text-neutral-400">{t.status}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/admin/ai-review"
              className="mt-4 inline-block text-sm font-medium text-[var(--accent)]"
            >
              Open queue →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
