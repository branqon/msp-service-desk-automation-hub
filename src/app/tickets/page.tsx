import { TicketWorkbench } from "@/components/tickets/ticket-workbench";
import { DEFAULT_TICKET_PAGE_SIZE, getTickets } from "@/lib/service-desk";

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

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;

  const result = await getTickets({
    page: parsePage(resolved.page),
    pageSize: DEFAULT_TICKET_PAGE_SIZE,
    filters: {
      search: firstValue(resolved.q),
      status: firstValue(resolved.status),
      priority: firstValue(resolved.priority),
      queue: firstValue(resolved.queue),
    },
  });

  return <TicketWorkbench result={result} linkQuery={buildLinkQuery(resolved)} />;
}
