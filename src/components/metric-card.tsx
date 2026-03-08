import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";

export function MetricCard({
  label,
  value,
  detail,
  badge,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  badge?: string;
  icon?: ReactNode;
}) {
  return (
    <SectionCard className="h-full p-0">
      <div className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {label}
            </p>
            <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          </div>
          {icon ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
              {icon}
            </div>
          ) : null}
        </div>
        <p className="flex-1 text-sm leading-6 text-slate-600">{detail}</p>
        {badge ? <Badge tone="teal">{badge}</Badge> : null}
      </div>
    </SectionCard>
  );
}
