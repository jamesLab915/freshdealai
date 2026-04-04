import { cn } from "@/lib/utils";

type Props = {
  score: number | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

export function AiScoreMeter({
  score,
  size = "md",
  showLabel = true,
  className,
}: Props) {
  if (score == null) {
    return (
      <p className={cn("text-sm text-neutral-400", className)}>No AI score yet</p>
    );
  }
  const pct = Math.min(100, Math.max(0, score));
  const barH = size === "lg" ? "h-2.5" : size === "sm" ? "h-1" : "h-1.5";
  const textCls =
    size === "lg" ? "text-base" : size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className={cn("font-medium text-neutral-700", textCls)}>
            Deal score
          </span>
          <span
            className={cn(
              "font-bold tabular-nums text-neutral-900",
              textCls
            )}
          >
            {score}
            <span className="font-normal text-neutral-400">/100</span>
          </span>
        </div>
      )}
      <div
        className={cn(
          "overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-200/80",
          barH
        )}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-[var(--accent)] transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
