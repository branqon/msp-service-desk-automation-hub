import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/lib/constants";

const toneClasses: Record<BadgeTone, string> = {
  slate: "border-slate-300 bg-slate-100 text-slate-700",
  blue: "border-sky-300 bg-sky-100 text-sky-700",
  amber: "border-amber-300 bg-amber-100 text-amber-800",
  red: "border-rose-300 bg-rose-100 text-rose-800",
  emerald: "border-emerald-300 bg-emerald-100 text-emerald-800",
  teal: "border-teal-300 bg-teal-100 text-teal-800",
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
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
