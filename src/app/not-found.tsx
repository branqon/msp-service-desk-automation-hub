import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-10 text-center shadow-[0_18px_50px_-32px_rgba(15,23,42,0.45)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Not Found
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        The requested record or page could not be found
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
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
