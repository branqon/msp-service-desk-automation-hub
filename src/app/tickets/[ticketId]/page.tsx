import { notFound } from "next/navigation";

import { TicketWorkbench } from "@/components/tickets/ticket-workbench";
import { getTicketById, getTickets } from "@/lib/service-desk";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const [tickets, selectedTicket] = await Promise.all([
    getTickets(),
    getTicketById(ticketId),
  ]);

  if (!selectedTicket) {
    notFound();
  }

  return <TicketWorkbench tickets={tickets} selectedTicket={selectedTicket} />;
}
