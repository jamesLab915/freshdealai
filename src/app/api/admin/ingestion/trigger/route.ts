import { NextRequest, NextResponse } from "next/server";

import { IngestionStatus, ProductSource } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const SOURCE_MAP: Record<string, (typeof ProductSource)[keyof typeof ProductSource]> = {
  AMAZON_PA_API: ProductSource.AMAZON_PA_API,
  SCRAPED_RETAILER: ProductSource.SCRAPED_RETAILER,
  CSV_IMPORT: ProductSource.CSV_IMPORT,
  MANUAL: ProductSource.MANUAL,
};

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const raw = String(form.get("source") ?? "MANUAL");
  const source = SOURCE_MAP[raw] ?? ProductSource.MANUAL;

  const logPrefix = `[info] Source=${raw}\n[info] Worker orchestration not wired — demo log only\n`;

  if (!prisma) {
    return NextResponse.redirect(
      new URL(
        `/admin/ingestion?msg=${encodeURIComponent(`${logPrefix}[warn] No DATABASE_URL — job not persisted`)}`,
        req.url
      )
    );
  }

  const job = await prisma.ingestionJob.create({
    data: {
      source,
      status: IngestionStatus.SUCCESS,
      startedAt: new Date(),
      finishedAt: new Date(),
      logs: `${logPrefix}[info] Replace with queue + worker`,
    },
  });

  return NextResponse.redirect(
    new URL(`/admin/ingestion?msg=${encodeURIComponent(`job ${job.id} recorded`)}`, req.url)
  );
}
