import { NextRequest } from "next/server";

import { jsonOk } from "@/lib/api/http";
import { importCsvDeals } from "@/services/ingestion/importCsvDeals";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { csv?: string };
  const csv = typeof body.csv === "string" ? body.csv : "";
  if (!csv.trim()) {
    return jsonOk("mock", { rows: [], errors: [{ line: 0, message: "Empty body" }] }, { count: 0 });
  }
  const { rows, errors } = importCsvDeals(csv);
  return jsonOk("mock", { rows, errors }, { count: rows.length, errorCount: errors.length });
}
