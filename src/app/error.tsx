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
    <div className="rounded-[6px] border border-[var(--red)]/20 bg-[var(--card)] p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--red)]">
        Workflow Error
      </p>
      <h2 className="mt-3 text-[13px] font-semibold text-[var(--ink)]">
        The demo hit an unexpected application error.
      </h2>
      <p className="mt-3 max-w-2xl text-[11px] leading-6 text-[var(--muted)]">{error.message}</p>
      <div className="mt-6">
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
