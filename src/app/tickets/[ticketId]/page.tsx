import { notFound } from "next/navigation";

import { TicketWorkbench } from "@/components/tickets/ticket-workbench";
import {
  DEFAULT_TICKET_PAGE_SIZE,
  getTicketById,
  getTickets,
} from "@/lib/service-desk";

export const dynamic = "force-dynamic";

function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function buildLinkQuery(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const key of ["q", "status", "priority", "queue", "page"]) {
    const value = firstValue(searchParams[key]);
    if (value) {
      params.set(key, value);
    }
  }
  return params.toString();
}

export default async function TicketDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ ticketId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ ticketId }, resolved] = await Promise.all([params, searchParams]);

  const [result, selectedTicket] = await Promise.all([
    getTickets({
      page: parsePage(resolved.page),
      pageSize: DEFAULT_TICKET_PAGE_SIZE,
      filters: {
        search: firstValue(resolved.q),
        status: firstValue(resolved.status),
        priority: firstValue(resolved.priority),
        queue: firstValue(resolved.queue),
      },
    }),
    getTicketById(ticketId),
  ]);

  if (!selectedTicket) {
    notFound();
  }

  return (
    <TicketWorkbench
      result={result}
      selectedTicket={selectedTicket}
      linkQuery={buildLinkQuery(resolved)}
    />
  );
}
