import { DealCard } from "@/components/deal-card";
import { getWhyAiPicked, type WhyPickKind } from "@/lib/deal-mock-extras";
import type { DealProduct } from "@/types/deal";

export function AiPickRow({ deal, kind }: { deal: DealProduct; kind: WhyPickKind }) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-8">
      <aside className="shrink-0 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/90 to-white p-5 lg:w-[min(100%,320px)]">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
          Why AI picked this
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-800">
          {getWhyAiPicked(deal, kind)}
        </p>
      </aside>
      <div className="min-w-0 flex-1">
        <DealCard deal={deal} />
      </div>
    </div>
  );
}
