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
  queueLabels,
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
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="hidden grid-cols-[1.8fr_1fr_0.85fr_1fr_0.85fr_0.95fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 md:grid">
          <div>Ticket</div>
          <div>Company</div>
          <div>Priority</div>
          <div>Queue</div>
          <div>SLA Risk</div>
          <div>Status</div>
        </div>
        <div className="divide-y divide-slate-200">
          {tickets.map((ticket) => {
            const slaRisk = getSlaRiskLevel(ticket.dueResolutionAt, ticket.status);

            return (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className={`grid gap-3 px-4 py-4 transition-colors hover:bg-slate-50 md:grid-cols-[1.8fr_1fr_0.85fr_1fr_0.85fr_0.95fr] ${
                  selectedTicketId === ticket.id ? "bg-[#0f766e]/6" : ""
                }`}
              >
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {ticket.ticketNumber}
                  </div>
                  <div className="font-semibold text-slate-950">{ticket.subject}</div>
                  <div className="text-sm text-slate-600">
                    {ticket.requester.name} · {categoryLabels[ticket.category ?? ""] ?? "Pending"}
                  </div>
                  <div className="text-xs text-slate-500 md:hidden">
                    {formatDateTime(ticket.createdAt)}
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-700">
                  <div className="font-medium">{ticket.company.name}</div>
                  <div className="text-slate-500">{formatDateTime(ticket.createdAt)}</div>
                </div>
                <div className="flex items-start md:items-center">
                  <Badge tone={getPriorityTone(ticket.priority)}>
                    {priorityLabels[ticket.priority ?? ""] ?? "Pending"}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-slate-700">
                  <div>{queueLabels[ticket.suggestedQueue ?? ""] ?? "Pending queue"}</div>
                  <div className="text-slate-500">
                    {ticket.workflowRuns[0]?.summary ?? "No workflow run recorded"}
                  </div>
                </div>
                <div className="flex items-start md:items-center">
                  <Badge tone={getSlaRiskTone(slaRisk)}>{slaRisk}</Badge>
                </div>
                <div className="flex items-start md:items-center">
                  <Badge tone={getStatusTone(ticket.status)}>
                    {statusLabels[ticket.status] ?? ticket.status}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
