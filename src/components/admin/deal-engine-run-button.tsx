"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DealEngineRunButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/deal-engine/run", {
        method: "POST",
        credentials: "same-origin",
      });
      const j = (await res.json()) as {
        success?: boolean;
        data?: {
          inserted?: number;
          updated?: number;
          skipped?: number;
          errors?: { reason?: string; detail?: string }[];
          message?: string;
        };
      };
      if (!res.ok) {
        setMsg(`Failed (${res.status})`);
        return;
      }
      const d = j.data;
      if (!d) {
        setMsg("Unexpected response");
        return;
      }
      const errLine =
        d.errors?.length ?
          ` · ${d.errors.length} issue(s): ${d.errors
            .slice(0, 3)
            .map((e) => e.detail ?? e.reason)
            .join("; ")}`
        : "";
      setMsg(
        `Inserted ${d.inserted ?? 0}, updated ${d.updated ?? 0}, skipped ${d.skipped ?? 0}${errLine}`
      );
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="font-semibold text-neutral-900">Deal engine</p>
      <p className="mt-2 text-sm text-neutral-600">
        Runs the same pipeline as the Vercel cron: fetch sources → AI copy (only when
        missing) → upsert products → refresh categories.
      </p>
      <Button
        type="button"
        className="mt-4"
        disabled={loading}
        onClick={() => void run()}
      >
        {loading ? "Running…" : "Run deal engine now"}
      </Button>
      {msg && (
        <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-700">{msg}</p>
      )}
    </div>
  );
}
