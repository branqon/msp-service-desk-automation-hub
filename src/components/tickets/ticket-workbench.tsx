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
      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
              Queue Workbench
            </p>
            <div>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-slate-950">
                Ticket triage, approvals, and audit context in one view
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                This screen mirrors the kind of internal MSP console a dispatcher or service lead would use:
                queue visibility on the left and a full operational narrative on the right.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/tickets/new" className={buttonStyles()}>
              Submit New Ticket
            </Link>
            <Link href="/approvals" className={buttonStyles({ variant: "secondary" })}>
              Review Approvals
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <TicketList tickets={tickets} selectedTicketId={selectedTicket?.id} />
        {selectedTicket ? (
          <TicketDetailPanel ticket={selectedTicket} />
        ) : (
          <SectionCard title="Select a Ticket" description="Choose a ticket from the queue to inspect triage details, SLA state, approvals, workflow runs, and the audit trail.">
            <EmptyState
              title="Ticket detail panel is idle"
              description="Pick an item from the incoming queue to review the deterministic route, AI recommendation, customer update draft, and sensitive action approvals."
            />
          </SectionCard>
        )}
      </div>
    </div>
  );
}
