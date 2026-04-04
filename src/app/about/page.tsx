import Link from "next/link";

import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "About",
  description: "How FlashDealAI ingests, scores, and presents US retail deals.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">About FlashDealAI</h1>
      <p className="mt-4 text-neutral-600 leading-relaxed">
        FlashDealAI is an AI-assisted commerce intelligence surface for US shoppers.
        We aggregate offers from multiple ingestion channels, normalize them into a
        single schema, enrich them with structured LLM tasks, and expose both human
        browsing and API-driven workflows.
      </p>

      <h2 id="methodology" className="mt-12 text-xl font-semibold">
        Methodology
      </h2>
      <Separator className="my-4" />
      <ul className="list-disc space-y-2 pl-5 text-neutral-600">
        <li>
          <strong>Ingestion</strong> prefers official APIs (e.g. Amazon PA-API),
          then compliant retailer pages, CSV feeds, and manual editorial entry.
        </li>
        <li>
          <strong>Deduping</strong> keys on source + merchant SKU, with secondary
          checks on canonical URLs to reduce double-listings.
        </li>
        <li>
          <strong>Scoring</strong> blends discount math, review volume, and model
          risk flags — never a single scalar from a black box.
        </li>
      </ul>

      <h2 id="affiliate" className="mt-12 text-xl font-semibold">
        Affiliate disclosure
      </h2>
      <Separator className="my-4" />
      <p className="text-neutral-600 leading-relaxed">
        Some outbound links include affiliate parameters. That may earn FlashDealAI a
        commission at no extra cost to you. Affiliate relationships do not determine
        ranking — automated scoring and editorial review are logged separately in
        the admin console.
      </p>

      <p className="mt-10 text-sm">
        <Link href="/deals" className="font-medium text-[var(--accent)]">
          Browse live deals →
        </Link>
      </p>
    </div>
  );
}
