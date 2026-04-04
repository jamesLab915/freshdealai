import Link from "next/link";
import { notFound } from "next/navigation";

import { DealCard } from "@/components/deal-card";
import { getDeals, getStores } from "@/services/deals";
import { dealMatchesStore } from "@/lib/store-utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getStores().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const s = getStores().find((x) => x.slug === slug);
  return { title: s ? `${s.name} deals` : "Store" };
}

export default async function StoreDetailPage({ params }: Props) {
  const { slug } = await params;
  const store = getStores().find((s) => s.slug === slug);
  if (!store) notFound();

  const { deals: all } = await getDeals({});
  const deals = all.filter((d) => dealMatchesStore(d, slug));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/stores" className="text-sm font-medium text-[var(--accent)]">
        ← Stores
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{store.name}</h1>
      <p className="mt-2 text-neutral-600">{store.domain}</p>
      <p className="mt-4 text-sm text-neutral-500">{deals.length} deals routed</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
    </div>
  );
}
