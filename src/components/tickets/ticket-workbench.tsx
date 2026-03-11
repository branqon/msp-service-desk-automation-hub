import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { TicketDetailPanel } from "@/components/tickets/ticket-detail-panel";
import { TicketList } from "@/components/tickets/ticket-list";
import type { TicketDetail, TicketListItem } from "@/lib/service-desk";

export function TicketWorkbench({
  tickets,
  selectedTicket,
}: {
  tickets: TicketListItem[];
  selectedTicket?: TicketDetail | null;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 py-3">
        <div>
          <h1 className="text-[13px] font-semibold text-[var(--ink)]">Queue Workbench</h1>
          <p className="text-[11px] text-[var(--faint)]">
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} in queue
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
        <TicketList tickets={tickets} selectedTicketId={selectedTicket?.id} />
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
