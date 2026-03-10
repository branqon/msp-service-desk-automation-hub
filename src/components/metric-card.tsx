import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  detail?: string;
  tone?: "default" | "red" | "amber";
  className?: string;
}

export function MetricCard({ label, value, unit, detail, tone = "default", className }: MetricCardProps) {
  return (
    <div className={cn("border-r border-[var(--border)] px-5 py-3.5 last:border-r-0", className)}>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-xl font-bold tracking-tight",
            tone === "red" ? "text-[var(--red)]" : tone === "amber" ? "text-[var(--amber)]" : "text-[var(--ink)]",
          )}
        >
          {value}
        </span>
        {unit && <span className="text-[11px] text-[var(--faint)]">{unit}</span>}
      </div>
      <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--whisper)]">
        {label}
      </div>
      {detail && (
        <div className="mt-0.5 text-[10.5px] text-[var(--faint)]">{detail}</div>
      )}
    </div>
  );
}
