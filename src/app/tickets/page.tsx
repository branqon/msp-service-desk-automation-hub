import { TicketWorkbench } from "@/components/tickets/ticket-workbench";
import { getTickets } from "@/lib/service-desk";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const tickets = await getTickets();

  return <TicketWorkbench tickets={tickets} />;
}
