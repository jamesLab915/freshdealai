import type { DealCredibilityPhase1 } from "@/types/deal-credibility";

const LEVEL_LABEL: Record<DealCredibilityPhase1["confidence_level"], string> = {
  high: "Confidence: high",
  medium: "Confidence: medium",
  low: "Confidence: low",
  unknown: "Confidence: limited",
};

type Props = {
  credibility: DealCredibilityPhase1;
  variant?: "card" | "detail";
};

/**
 * Minimal Phase 1 trust copy — rules-driven, not a recommendation engine.
 */
export function DealCredibilityStrip({ credibility, variant = "card" }: Props) {
  const flags = credibility.risk_flags.slice(0, 2);

  if (variant === "card") {
    return (
      <div className="rounded-md border border-neutral-200/90 bg-neutral-50/90 px-2.5 py-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-700">
          {LEVEL_LABEL[credibility.confidence_level]}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-neutral-600">
          {credibility.explanation_summary}
        </p>
        {flags.length > 0 && (
          <p className="mt-1 text-[10px] text-neutral-500">{flags.join(" · ")}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/90 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-800">
        {LEVEL_LABEL[credibility.confidence_level]}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">
        {credibility.explanation_summary}
      </p>
      {flags.length > 0 && (
        <p className="mt-2 text-[11px] text-neutral-500">
          Signals: {flags.join(" · ")}
        </p>
      )}
      <p className="mt-2 text-[10px] text-neutral-400">
        Rule-based read — not financial advice. Always confirm on the retailer.
      </p>
    </div>
  );
}
