"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { CsvProductDraft } from "@/services/ingestion/importCsvDeals";

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
};

export function CsvImportPanel() {
  const [csv, setCsv] = useState("");
  const [rows, setRows] = useState<CsvProductDraft[]>([]);
  const [errors, setErrors] = useState<{ line: number; message: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  async function preview() {
    setLoading(true);
    setConfirmMsg(null);
    try {
      const res = await fetch("/api/admin/csv/preview", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const j = (await res.json()) as ApiEnvelope<{
        rows: CsvProductDraft[];
        errors: { line: number; message: string }[];
      }>;
      if (j.success && j.data) {
        setRows(j.data.rows);
        setErrors(j.data.errors);
      } else {
        setRows([]);
        setErrors([]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function confirmMock() {
    setLoading(true);
    setConfirmMsg(null);
    try {
      const res = await fetch("/api/admin/csv/confirm", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const j = (await res.json()) as ApiEnvelope<{
        message?: string;
      }>;
      setConfirmMsg(
        j.success ? (j.data?.message ?? "Import acknowledged (mock).") : "Request failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-neutral-900">CSV import</h2>
      <p className="mt-2 text-sm text-neutral-600">
        Paste CSV with headers such as{" "}
        <code className="rounded bg-neutral-100 px-1 text-xs">
          title,product_url,current_price,brand,category
        </code>
        . Preview runs server-side; confirm is a mock until persistence is wired.
      </p>
      <textarea
        className="mt-4 min-h-[140px] w-full rounded-lg border border-neutral-200 p-3 font-mono text-xs"
        placeholder="title,product_url,current_price&#10;Widget,https://example.com/p/1,29.99"
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" disabled={loading} onClick={() => void preview()}>
          {loading ? "Working…" : "Preview"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={loading || !rows.length}
          onClick={() => void confirmMock()}
        >
          Confirm import (mock)
        </Button>
      </div>
      {errors.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <p className="font-semibold">Parse issues</p>
          <ul className="mt-2 list-inside list-disc text-xs">
            {errors.slice(0, 8).map((e, i) => (
              <li key={i}>
                Line {e.line}: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {confirmMsg && (
        <p className="mt-4 text-sm text-emerald-800">{confirmMsg}</p>
      )}
      {rows.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <p className="text-sm font-semibold text-neutral-900">
            Preview ({rows.length} rows)
          </p>
          <table className="mt-2 w-full min-w-[640px] text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Price</th>
                <th className="px-2 py-2">Slug</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 12).map((r) => (
                <tr key={r.slug} className="border-b border-neutral-100">
                  <td className="px-2 py-2">{r.title}</td>
                  <td className="px-2 py-2 tabular-nums">
                    {r.currency} {r.currentPrice}
                  </td>
                  <td className="px-2 py-2 font-mono text-neutral-500">{r.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 12 && (
            <p className="mt-2 text-xs text-neutral-500">
              Showing 12 of {rows.length} rows.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
