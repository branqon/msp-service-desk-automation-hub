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
        "rounded-[6px] border border-[var(--border)] bg-[var(--card)]",
        className,
      )}
    >
      {(title || description || action) && (
        <div className="flex flex-col gap-1 border-b border-[var(--border)] px-5 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            {title ? (
              <h2 className="text-[13px] font-semibold text-[var(--ink)]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-[11px] text-[var(--faint)]">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
