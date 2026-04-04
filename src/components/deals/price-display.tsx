import { cn } from "@/lib/utils";

type Props = {
  currency: string;
  current: number;
  original: number | null;
  discountPercent: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function PriceDisplay({
  currency,
  current,
  original,
  discountPercent,
  size = "md",
  className,
}: Props) {
  const curCls =
    size === "lg"
      ? "text-3xl sm:text-4xl"
      : size === "sm"
        ? "text-lg"
        : "text-xl";
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1", className)}>
      <span
        className={cn(
          "font-bold tabular-nums tracking-tight text-neutral-900",
          curCls
        )}
      >
        {currency} {current.toFixed(2)}
      </span>
      {original != null && original > current && (
        <span className="text-sm tabular-nums text-neutral-400 line-through sm:text-base">
          {currency}
          {original.toFixed(2)}
        </span>
      )}
      {discountPercent != null && discountPercent > 0 && (
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
            "bg-[var(--accent-soft)] text-[var(--accent-ink)]"
          )}
        >
          Save {discountPercent}%
        </span>
      )}
    </div>
  );
}
