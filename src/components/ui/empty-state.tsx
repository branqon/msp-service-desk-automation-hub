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
    <div className="rounded-3xl border border-dashed border-white/10 bg-[#262635]/80 p-10 text-center">
      <h3 className="text-xl font-semibold tracking-tight text-[#f1f1f4]">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8b8ba0]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
