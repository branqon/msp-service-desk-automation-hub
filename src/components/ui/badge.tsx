import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/lib/constants";

const toneClasses: Record<BadgeTone, string> = {
  slate: "bg-[var(--badge-slate-bg)] text-[var(--badge-slate-fg)]",
  blue: "bg-[var(--badge-blue-bg)] text-[var(--badge-blue-fg)]",
  amber: "bg-[var(--badge-amber-bg)] text-[var(--badge-amber-fg)]",
  red: "bg-[var(--badge-red-bg)] text-[var(--badge-red-fg)]",
  emerald: "bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-fg)]",
  teal: "bg-[var(--badge-teal-bg)] text-[var(--badge-teal-fg)]",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export function Badge({ children, tone = "slate", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[3px] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.04em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
