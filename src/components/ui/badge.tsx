import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/lib/constants";

const toneClasses: Record<BadgeTone, string> = {
  slate: "bg-[#f1f0ec] text-[#999]",
  blue: "bg-[#eff4ff] text-[#2563eb]",
  amber: "bg-[#fef5e7] text-[#b36b00]",
  red: "bg-[#fcedef] text-[#c5303e]",
  emerald: "bg-[#ecf5f0] text-[#177a48]",
  teal: "bg-[#141414] text-white",
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
