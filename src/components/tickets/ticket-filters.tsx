"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  priorityLabels,
  queueLabels,
  statusLabels,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const selectClasses =
  "h-8 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-2.5 text-[11.5px] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20";

export function TicketFilters({ total }: { total: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const priority = searchParams.get("priority") ?? "";
  const queue = searchParams.get("queue") ?? "";

  const [search, setSearch] = useState(urlSearch);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  const activeCount = useMemo(() => {
    let count = 0;
    if (urlSearch) count++;
    if (status) count++;
    if (priority) count++;
    if (queue) count++;
    return count;
  }, [urlSearch, status, priority, queue]);
  const hasActiveFilter = activeCount > 0;

  const commit = useCallback(
    (next: URLSearchParams) => {
      next.delete("page");
      const qs = next.toString();
      router.push(qs ? `/tickets?${qs}` : "/tickets");
    },
    [router],
  );

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    commit(next);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParam("q", search.trim());
  };

  const clearAll = () => {
    setSearch("");
    router.push("/tickets");
  };

  return (
    <div className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center justify-between gap-2 px-5 py-2.5 sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="ticket-filters-panel"
          className="inline-flex items-center gap-2 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[11.5px] font-medium text-[var(--ink-60)] transition-colors hover:border-[var(--whisper)] hover:text-[var(--ink)]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Filters</span>
          {activeCount > 0 ? (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ink)] px-1 text-[9px] font-semibold text-[var(--background)]">
              {activeCount}
            </span>
          ) : null}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              mobileOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
        <span className="text-[11px] text-[var(--faint)]">
          {total} {total === 1 ? "match" : "matches"}
        </span>
      </div>

      <div
        id="ticket-filters-panel"
        className={cn(
          "flex-wrap items-center gap-2 px-5 py-2.5 sm:flex sm:py-2.5",
          mobileOpen ? "flex border-t border-[var(--border-light)] sm:border-t-0" : "hidden sm:flex",
        )}
      >
        <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2 sm:w-auto">
          <label htmlFor="ticket-search" className="sr-only">
            Search tickets
          </label>
          <input
            id="ticket-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search subject, requester, company, ticket #"
            className="h-8 flex-1 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-3 text-[11.5px] text-[var(--ink)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20 sm:w-72 sm:flex-initial"
          />
          <button
            type="submit"
            className="h-8 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-3 text-[11.5px] font-medium text-[var(--ink-60)] transition-colors hover:border-[var(--whisper)] hover:text-[var(--ink)]"
          >
            Search
          </button>
        </form>

        <label className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
          <span>Status</span>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => updateParam("status", event.target.value)}
            className={selectClasses}
          >
            <option value="">All</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
          <span>Priority</span>
          <select
            aria-label="Filter by priority"
            value={priority}
            onChange={(event) => updateParam("priority", event.target.value)}
            className={selectClasses}
          >
            <option value="">All</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
          <span>Queue</span>
          <select
            aria-label="Filter by queue"
            value={queue}
            onChange={(event) => updateParam("queue", event.target.value)}
            className={selectClasses}
          >
            <option value="">All</option>
            {Object.entries(queueLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilter ? (
          <button
            type="button"
            onClick={clearAll}
            className="h-8 rounded-[5px] px-2.5 text-[11px] text-[var(--faint)] transition-colors hover:text-[var(--ink)]"
          >
            Clear
          </button>
        ) : null}

        <span className="ml-auto hidden text-[11px] text-[var(--faint)] sm:inline">
          {total} {total === 1 ? "match" : "matches"}
        </span>
      </div>
    </div>
  );
}
