import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { TicketDetailPanel } from "@/components/tickets/ticket-detail-panel";
import { TicketFilters } from "@/components/tickets/ticket-filters";
import { TicketList } from "@/components/tickets/ticket-list";
import { TicketPagination } from "@/components/tickets/ticket-pagination";
import type { TicketDetail, TicketListResult } from "@/lib/service-desk";

export function TicketWorkbench({
  result,
  selectedTicket,
  linkQuery = "",
}: {
  result: TicketListResult;
  selectedTicket?: TicketDetail | null;
  linkQuery?: string;
}) {
  const { items, total, page, pageSize, pageCount } = result;

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 py-3">
        <div>
          <h1 className="text-[13px] font-semibold text-[var(--ink)]">Queue Workbench</h1>
          <p className="text-[11px] text-[var(--faint)]">
            {total} ticket{total !== 1 ? "s" : ""} in queue
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/tickets/new" className={buttonStyles()}>
            Submit New Ticket
          </Link>
          <Link href="/approvals" className={buttonStyles({ variant: "secondary" })}>
            Review Approvals
          </Link>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--card)]">
          <TicketFilters total={total} />
          <TicketList
            tickets={items}
            selectedTicketId={selectedTicket?.id}
            linkQuery={linkQuery}
            emptyMessage="No tickets match these filters. Try clearing them or adjusting your search."
          />
          <TicketPagination
            page={page}
            pageCount={pageCount}
            total={total}
            pageSize={pageSize}
          />
        </div>
        {selectedTicket ? (
          <TicketDetailPanel ticket={selectedTicket} />
        ) : (
          <SectionCard title="Select a Ticket" description="Choose a ticket from the queue to inspect triage details, SLA state, approvals, workflow runs, and the audit trail.">
            <EmptyState title="Ticket detail panel is idle">
              Pick an item from the incoming queue to review the deterministic route, AI recommendation, customer update draft, and sensitive action approvals.
            </EmptyState>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
