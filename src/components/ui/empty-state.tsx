import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-[6px] border border-dashed border-[var(--border)] bg-[var(--background)] px-6 py-10 text-center">
      <h3 className="text-sm font-medium text-[var(--ink)]">{title}</h3>
      {children ? <p className="mt-1 text-xs text-[var(--faint)]">{children}</p> : null}
    </div>
  );
}
