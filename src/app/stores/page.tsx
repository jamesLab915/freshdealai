import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { getStores } from "@/services/deals";

export const metadata = {
  title: "Stores",
  description: "Deals aggregated from major US retailers and brand DTC sites.",
};

export default async function StoresPage() {
  const stores = await getStores();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        FlashDealAI is retailer-agnostic: APIs first, compliant scraping second,
        and editorial overrides when automation can&apos;t keep up.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {stores.map((s) => (
          <Link key={s.slug} href={`/stores/${s.slug}`}>
            <Card className="h-full hover:shadow-md">
              <CardContent className="flex flex-col gap-2 p-6">
                <h2 className="text-lg font-semibold">{s.name}</h2>
                <p className="text-sm text-neutral-500">{s.domain}</p>
                <p className="text-sm text-neutral-600">
                  ~{s.dealCount} tracked offers in demo data
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
