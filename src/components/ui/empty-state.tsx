import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center">
      <h3 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
