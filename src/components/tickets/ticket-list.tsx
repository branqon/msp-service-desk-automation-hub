import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import {
  categoryLabels,
  getPriorityTone,
  getSlaRiskTone,
  getStatusTone,
  priorityLabels,
  statusLabels,
} from "@/lib/constants";
import type { TicketListItem } from "@/lib/service-desk";
import { formatDateTime, getSlaRiskLevel } from "@/lib/utils";

export function TicketList({
  tickets,
  selectedTicketId,
}: {
  tickets: TicketListItem[];
  selectedTicketId?: string;
}) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        title="No tickets seeded yet"
        description="Run the seed command or submit a new intake request to populate the queue."
      />
    );
  }

  return (
    <SectionCard
      title="Incoming Queue"
      description="Rule-based and AI-assisted routing results for the current seeded MSP workload."
    >
      <div className="divide-y divide-slate-100">
        {tickets.map((ticket) => {
          const slaRisk = getSlaRiskLevel(ticket.dueResolutionAt, ticket.status);

          return (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className={`block rounded-2xl px-4 py-3.5 transition-colors hover:bg-slate-50 ${
                selectedTicketId === ticket.id
                  ? "bg-[#0f766e]/6 ring-1 ring-[#0f766e]/20"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {ticket.ticketNumber} · {ticket.company.name}
                  </div>
                  <div className="mt-1.5 font-semibold leading-snug text-slate-950">
                    {ticket.subject}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {ticket.requester.name} ·{" "}
                    {categoryLabels[ticket.category ?? ""] ?? "Pending"} ·{" "}
                    {formatDateTime(ticket.createdAt)}
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <Badge tone={getPriorityTone(ticket.priority)}>
                  {priorityLabels[ticket.priority ?? ""] ?? "Pending"}
                </Badge>
                <Badge tone={getSlaRiskTone(slaRisk)}>{slaRisk}</Badge>
                <Badge tone={getStatusTone(ticket.status)}>
                  {statusLabels[ticket.status] ?? ticket.status}
                </Badge>
              </div>
            </Link>
          );
        })}
      </div>
    </SectionCard>
  );
}
