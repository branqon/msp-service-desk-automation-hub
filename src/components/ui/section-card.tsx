import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)] backdrop-blur",
        className,
      )}
    >
      {(title || description || action) && (
        <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            {title ? (
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
