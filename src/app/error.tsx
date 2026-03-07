"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
        Workflow Error
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
        The demo hit an unexpected application error.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{error.message}</p>
      <div className="mt-6">
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
