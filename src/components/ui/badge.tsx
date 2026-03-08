import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/lib/constants";

const toneClasses: Record<BadgeTone, string> = {
  slate: "border-white/6 bg-white/8 text-[#9d9db5]",
  blue: "border-sky-700/20 bg-sky-900/30 text-sky-300",
  amber: "border-amber-700/20 bg-amber-900/30 text-amber-300",
  red: "border-rose-700/20 bg-rose-900/30 text-rose-300",
  emerald: "border-emerald-700/20 bg-emerald-900/30 text-emerald-300",
  teal: "border-indigo-500/20 bg-indigo-900/30 text-indigo-300",
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
