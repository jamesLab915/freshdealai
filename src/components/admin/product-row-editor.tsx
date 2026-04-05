"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DealProduct } from "@/types/deal";

type Props = {
  product: DealProduct;
};

function parseRankInput(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

export function ProductRowEditor({ product }: Props) {
  const [affiliateUrl, setAffiliateUrl] = useState(
    product.affiliateUrl && !product.usesProductUrlFallback
      ? product.affiliateUrl
      : ""
  );
  const [featured, setFeatured] = useState(product.featured);
  const [trending, setTrending] = useState(product.trending);
  const [aiPick, setAiPick] = useState(product.aiPick);
  const [homepageRank, setHomepageRank] = useState(
    product.homepageRank != null ? String(product.homepageRank) : ""
  );
  const [bestDealsRank, setBestDealsRank] = useState(
    product.bestDealsRank != null ? String(product.bestDealsRank) : ""
  );
  const [top10Rank, setTop10Rank] = useState(
    product.top10Rank != null ? String(product.top10Rank) : ""
  );
  const [excludeFromHubs, setExcludeFromHubs] = useState(
    product.excludeFromHubs
  );
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setStatus(null);
    try {
      const payload = {
        affiliateUrl: affiliateUrl.trim() || null,
        featured,
        trending,
        aiPick,
        homepageRank: parseRankInput(homepageRank),
        bestDealsRank: parseRankInput(bestDealsRank),
        top10Rank: parseRankInput(top10Rank),
        excludeFromHubs,
      };
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !j.success) {
        setStatus(j.error ?? "Save failed");
        return;
      }
      setStatus("Saved");
    } catch {
      setStatus("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-neutral-200 bg-neutral-50/80 p-3 text-xs">
      <label className="block">
        <span className="font-medium text-neutral-700">Affiliate URL</span>
        <Input
          className="mt-1 font-mono text-[11px]"
          value={affiliateUrl}
          onChange={(e) => setAffiliateUrl(e.target.value)}
          placeholder="https://… (overrides product URL for CTAs)"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="font-medium text-neutral-700">
            Homepage rank (lower first)
          </span>
          <Input
            className="mt-1 tabular-nums"
            inputMode="numeric"
            value={homepageRank}
            onChange={(e) => setHomepageRank(e.target.value)}
            placeholder="empty = auto"
          />
        </label>
        <label className="block">
          <span className="font-medium text-neutral-700">Best-deals rank</span>
          <Input
            className="mt-1 tabular-nums"
            inputMode="numeric"
            value={bestDealsRank}
            onChange={(e) => setBestDealsRank(e.target.value)}
            placeholder="empty = auto"
          />
        </label>
        <label className="block">
          <span className="font-medium text-neutral-700">Top 10 rank</span>
          <Input
            className="mt-1 tabular-nums"
            inputMode="numeric"
            value={top10Rank}
            onChange={(e) => setTop10Rank(e.target.value)}
            placeholder="empty = auto"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Featured
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={trending}
            onChange={(e) => setTrending(e.target.checked)}
          />
          Trending
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={aiPick}
            onChange={(e) => setAiPick(e.target.checked)}
          />
          AI pick
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={excludeFromHubs}
            onChange={(e) => setExcludeFromHubs(e.target.checked)}
          />
          Exclude from hubs
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" disabled={loading} onClick={() => void save()}>
          {loading ? "Saving…" : "Save changes"}
        </Button>
        {status && (
          <span
            className={
              status === "Saved" ? "text-emerald-700" : "text-amber-800"
            }
          >
            {status}
          </span>
        )}
      </div>
    </div>
  );
}
