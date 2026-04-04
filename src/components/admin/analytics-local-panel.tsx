"use client";

import { useEffect, useState } from "react";

import { readTrackingEvents, summarizeLocalTracking } from "@/lib/tracking";

export function AnalyticsLocalPanel() {
  const [summary, setSummary] = useState<ReturnType<
    typeof summarizeLocalTracking
  > | null>(null);

  useEffect(() => {
    const events = readTrackingEvents();
    setSummary(summarizeLocalTracking(events));
  }, []);

  if (!summary) {
    return (
      <p className="text-sm text-neutral-500">Loading browser analytics…</p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-neutral-900">Local click events</p>
        <p className="mt-1 text-xs text-neutral-500">
          From this browser only · {summary.totalEvents} total tracking rows
        </p>
        <ul className="mt-4 space-y-2 text-sm text-neutral-700">
          {summary.topClicks.length === 0 ? (
            <li className="text-neutral-500">No affiliate clicks recorded yet.</li>
          ) : (
            summary.topClicks.map(([slug, n]) => (
              <li key={slug} className="flex justify-between gap-2">
                <span className="truncate font-mono text-xs">{slug}</span>
                <span className="shrink-0 tabular-nums text-neutral-500">{n}</span>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-neutral-900">Top searches (local)</p>
        <p className="mt-1 text-xs text-neutral-500">Debounced search submits on /search</p>
        <ul className="mt-4 space-y-2 text-sm text-neutral-700">
          {summary.topSearches.length === 0 ? (
            <li className="text-neutral-500">No searches tracked yet.</li>
          ) : (
            summary.topSearches.map(([q, n]) => (
              <li key={q} className="flex justify-between gap-2">
                <span className="truncate">{q}</span>
                <span className="shrink-0 tabular-nums text-neutral-500">{n}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
