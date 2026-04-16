import { cn } from "@/lib/utils";

/* ---------- Approval Aging ---------- */

interface AgingBuckets {
  over72: number;
  h24to72: number;
  h4to24: number;
  under4: number;
}

export function ApprovalAging({ buckets }: { buckets: AgingBuckets }) {
  const items: Array<{ label: string; value: number; hot?: "red" | "amber" }> = [
    { label: "> 72h", value: buckets.over72, hot: "red" },
    { label: "24 \u2013 72h", value: buckets.h24to72, hot: "amber" },
    { label: "4 \u2013 24h", value: buckets.h4to24 },
    { label: "< 4h", value: buckets.under4 },
  ];

  return (
    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-5 py-4">
      <div className="text-[11.5px] font-semibold text-[var(--ink)]">Approval Aging</div>
      <div className="mb-3.5 mt-px text-[10px] text-[var(--faint)]">
        Open approvals by time waiting
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              "rounded-[5px] border border-[var(--border-light)] py-2.5 text-center",
              item.hot === "red" && "border-[var(--red-bg-border)] bg-[var(--red-bg)]",
              item.hot === "amber" && "border-[var(--amber-bg-border)] bg-[var(--amber-bg)]",
            )}
          >
            <div
              className={cn(
                "text-[17px] font-bold leading-none",
                item.hot === "red"
                  ? "text-[var(--red)]"
                  : item.hot === "amber"
                    ? "text-[var(--amber)]"
                    : "text-[var(--ink)]",
              )}
            >
              {item.value}
            </div>
            <div className="mt-1.5 text-[9.5px] tracking-[0.01em] text-[var(--faint)]">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- SLA Risk Heatmap ---------- */

interface HeatRow {
  queue: string;
  p1p2: number;
  p3: number;
  p4: number;
  breach: number;
}

function heatCellTone(value: number, isBreach: boolean) {
  if (value === 0) return "zero";
  if (isBreach) return value > 0 ? "danger" : "zero";
  if (value >= 2) return "danger";
  if (value === 1) return "warn";
  return "ok";
}

const cellColors: Record<string, string> = {
  zero: "text-[var(--bone)]",
  ok: "bg-[var(--green-bg)] text-[var(--green)]",
  warn: "bg-[var(--amber-bg)] text-[var(--amber)]",
  danger: "bg-[var(--red-bg)] text-[var(--red)]",
  neutral: "text-[var(--muted)]",
};

export function SlaRiskHeatmap({ rows }: { rows: HeatRow[] }) {
  const headers = ["", "P1\u2013P2", "P3", "P4", "Breach"];

  return (
    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] px-5 py-4">
      <div className="text-[11.5px] font-semibold text-[var(--ink)]">SLA Risk by Queue</div>
      <div className="mb-3.5 mt-px text-[10px] text-[var(--faint)]">
        Open tickets by severity tier
      </div>

      <div className="grid grid-cols-[72px_repeat(4,1fr)] text-[11px]">
        {/* Header row */}
        {headers.map((h) => (
          <div
            key={h}
            className="border-b border-[var(--border-light)] px-2.5 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.05em] text-[var(--faint)]"
          >
            {h}
          </div>
        ))}

        {/* Data rows */}
        {rows.map((row) => {
          const cells: Array<{ value: number; breach: boolean }> = [
            { value: row.p1p2, breach: false },
            { value: row.p3, breach: false },
            { value: row.p4, breach: false },
            { value: row.breach, breach: true },
          ];
          return [
            <div
              key={`${row.queue}-label`}
              className="border-b border-[var(--border-light)] px-2.5 py-2.5 text-[11px] font-medium text-[var(--muted)]"
            >
              {row.queue}
            </div>,
            ...cells.map((cell, j) => {
              const tone = heatCellTone(cell.value, cell.breach);
              return (
                <div
                  key={`${row.queue}-${j}`}
                  className={cn(
                    "border-b border-l border-[var(--border-light)] px-2.5 py-2.5 text-center text-[12px] font-semibold",
                    cellColors[tone],
                  )}
                >
                  {cell.value === 0 ? "\u2014" : cell.value}
                </div>
              );
            }),
          ];
        })}

        {rows.length === 0 && (
          <div className="col-span-5 px-2.5 py-6 text-center text-[11px] text-[var(--faint)]">
            No open tickets with SLA data
          </div>
        )}
      </div>
    </div>
  );
}
