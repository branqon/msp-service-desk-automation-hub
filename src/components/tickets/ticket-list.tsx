import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  categoryLabels,
  getPriorityTone,
  getSlaRiskTone,
  getStatusTone,
  priorityLabels,
  statusLabels,
} from "@/lib/constants";
import type { TicketListItem } from "@/lib/service-desk";
import { cn, formatDateTime, getSlaRiskLevel } from "@/lib/utils";

export function TicketList({
  tickets,
  selectedTicketId,
  linkQuery = "",
  emptyMessage,
}: {
  tickets: TicketListItem[];
  selectedTicketId?: string;
  linkQuery?: string;
  emptyMessage?: string;
}) {
  if (tickets.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <div className="text-sm font-medium text-[var(--ink)]">No tickets match</div>
        <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[var(--faint)]">
          {emptyMessage ??
            "Run the seed command or submit a new intake request to populate the queue."}
        </p>
      </div>
    );
  }

  const qs = linkQuery ? `?${linkQuery}` : "";

  return (
    <ul className="divide-y divide-[var(--border)]">
      {tickets.map((ticket) => {
        const slaRisk = getSlaRiskLevel(ticket.dueResolutionAt, ticket.status);
        const isSelected = selectedTicketId === ticket.id;

        return (
          <li key={ticket.id}>
            <Link
              href={`/tickets/${ticket.id}${qs}`}
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "block px-4 py-3.5 transition-colors hover:bg-[var(--row-hover)]",
                isSelected && "bg-[var(--border-light)] ring-1 ring-inset ring-[var(--ink)]/20",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--faint)]">
                    {ticket.ticketNumber} · {ticket.company.name}
                  </div>
                  <div className="mt-1.5 font-semibold leading-snug text-[var(--ink)]">
                    {ticket.subject}
                  </div>
                  <div className="mt-1 text-sm text-[var(--muted)]">
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
          </li>
        );
      })}
    </ul>
  );
}
