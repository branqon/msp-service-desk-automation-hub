"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

export function TicketPagination({
  page,
  pageCount,
  total,
  pageSize,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (total === 0) {
    return null;
  }

  const hrefForPage = (target: number) => {
    const next = new URLSearchParams(searchParams);
    if (target <= 1) {
      next.delete("page");
    } else {
      next.set("page", String(target));
    }
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);

  const prevDisabled = page <= 1;
  const nextDisabled = page >= pageCount;

  const base =
    "inline-flex h-8 items-center justify-center rounded-[5px] border px-3 text-[11.5px] font-medium transition-colors";
  const active =
    "border-[var(--border)] bg-[var(--card)] text-[var(--ink-60)] hover:border-[var(--whisper)] hover:text-[var(--ink)]";
  const disabled =
    "cursor-not-allowed border-[var(--border-light)] bg-[var(--card)] text-[var(--whisper)]";

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--card)] px-5 py-2.5">
      <span className="text-[11px] text-[var(--faint)]">
        Showing {first}
        <span aria-hidden="true">{" \u2013 "}</span>
        {last} of {total}
      </span>
      <div className="flex items-center gap-2">
        {prevDisabled ? (
          <span aria-disabled="true" className={cn(base, disabled)}>
            Previous
          </span>
        ) : (
          <Link href={hrefForPage(page - 1)} className={cn(base, active)} rel="prev">
            Previous
          </Link>
        )}
        <span className="text-[11px] text-[var(--muted)]">
          Page {page} of {pageCount}
        </span>
        {nextDisabled ? (
          <span aria-disabled="true" className={cn(base, disabled)}>
            Next
          </span>
        ) : (
          <Link href={hrefForPage(page + 1)} className={cn(base, active)} rel="next">
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
