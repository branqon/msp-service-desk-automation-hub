import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-10 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--faint)]">
        Not Found
      </p>
      <h2 className="mt-3 text-[13px] font-semibold text-[var(--ink)]">
        The requested record or page could not be found
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-[11px] leading-6 text-[var(--muted)]">
        If you followed an old ticket link, the seeded database may have been reset. Return to the dashboard or
        queue workbench and select an active record.
      </p>
      <div className="mt-6 flex justify-center">
        <Link href="/tickets" className={buttonStyles()}>
          Return to Tickets
        </Link>
      </div>
    </div>
  );
}
