import { NextResponse } from "next/server";

import { createTicket, getTickets } from "@/lib/service-desk";

export async function GET() {
  const tickets = await getTickets();

  return NextResponse.json(
    tickets.map((ticket) => ({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      company: ticket.company.name,
      requester: ticket.requester.name,
      issueType: ticket.issueType,
      priority: ticket.priority,
      status: ticket.status,
      queue: ticket.suggestedQueue,
      createdAt: ticket.createdAt,
    })),
  );
}

export async function POST(request: Request) {
  const payload = await request.json();
  const ticket = await createTicket({
    companyId: payload.companyId,
    subject: payload.subject,
    issueType: payload.issueType,
    urgency: payload.urgency,
    impact: payload.impact,
    description: payload.description,
    requesterName: payload.requesterName,
    requesterEmail: payload.requesterEmail,
    requesterTitle: payload.requesterTitle,
    attachmentsNote: payload.attachmentsNote ?? "",
    requesterVip: Boolean(payload.requesterVip),
  });

  return NextResponse.json({ id: ticket.id, ticketNumber: ticket.ticketNumber }, { status: 201 });
}
