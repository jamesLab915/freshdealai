import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getSiteUrl } from "@/lib/env";
import { getDealById } from "@/services/deals";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const deal = await getDealById(id);
  if (!deal) return { title: "Deal not found" };
  const title = deal.seoTitle ?? deal.title;
  const description = (deal.seoDescription ?? deal.aiSummary ?? deal.title).slice(
    0,
    320
  );
  const path = `/deals/${deal.slug}`;
  const url = `${getSiteUrl()}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url, type: "website", siteName: "FlashDealAI" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** ID-based entry — canonical URLs remain `/deals/[slug]`. */
export default async function DealByIdPage({ params }: Props) {
  const { id } = await params;
  const deal = await getDealById(id);
  if (!deal) notFound();
  redirect(`/deals/${deal.slug}`);
}
