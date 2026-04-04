import { NextRequest } from "next/server";

import { jsonOk } from "@/lib/api/http";
import { importCsvDeals } from "@/services/ingestion/importCsvDeals";

/** Mock confirm — validates CSV again; DB write comes in a later iteration. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { csv?: string };
  const csv = typeof body.csv === "string" ? body.csv : "";
  const { rows, errors } = importCsvDeals(csv);
  return jsonOk(
    "mock",
    {
      accepted: errors.length === 0,
      wouldImport: rows.length,
      message:
        "Import not persisted — connect workers + Prisma upsert to write products.",
    },
    { count: rows.length, errorCount: errors.length }
  );
}
