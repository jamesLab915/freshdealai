"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HomeHero({ dealCount }: { dealCount: number }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) {
      router.push("/deals");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-white via-neutral-50/80 to-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(234,88,12,0.12), transparent 45%), radial-gradient(circle at 80% 60%, rgba(234,88,12,0.08), transparent 40%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-2xl lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] sm:text-sm">
            US deals · AI-ranked · Affiliate-transparent
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Today&apos;s best deals,{" "}
            <span className="text-[var(--accent)]">powered by AI</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600 sm:text-xl">
            Real-time discounts from major retailers — scored, de-duplicated, and
            explained so you click with confidence.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:mt-12 sm:flex-row sm:items-center lg:mx-0"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search headphones, Dyson, Nike…"
              className="h-12 border-neutral-200 bg-white pl-11 text-base shadow-sm"
              aria-label="Search deals"
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-8 font-semibold">
            Search deals
          </Button>
        </form>

        <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-3 text-sm text-neutral-500 sm:justify-start lg:mx-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 font-medium text-neutral-700 shadow-sm">
            <span className="size-2 rounded-full bg-emerald-500" />
            {dealCount} live offers
          </span>
          <Link
            href="/deals"
            className="inline-flex items-center gap-1 font-semibold text-[var(--accent)] hover:underline"
          >
            Browse all deals
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl gap-4 sm:grid-cols-3 lg:mx-0 lg:max-w-none">
          {[
            { k: "Live feed", v: "Fresh pulls from APIs & curated sources" },
            { k: "AI score", v: "Discount depth + review signals + risk flags" },
            { k: "Top stores", v: "Amazon, Best Buy, Target, Walmart & more" },
          ].map((item) => (
            <div
              key={item.k}
              className="rounded-xl border border-neutral-200/90 bg-white/90 px-4 py-3 text-left shadow-sm backdrop-blur-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {item.k}
              </p>
              <p className="mt-1 text-sm font-medium leading-snug text-neutral-800">
                {item.v}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
