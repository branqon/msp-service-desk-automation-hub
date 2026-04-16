import { NextResponse } from "next/server";
import { z } from "zod";

import { createTicket, createTicketSchema, getTickets } from "@/lib/service-desk";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawPage = Number.parseInt(url.searchParams.get("page") ?? "", 10);
  const rawPageSize = Number.parseInt(url.searchParams.get("pageSize") ?? "", 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize =
    Number.isFinite(rawPageSize) && rawPageSize > 0 && rawPageSize <= 100
      ? rawPageSize
      : undefined;

  const result = await getTickets({
    page,
    pageSize,
    filters: {
      search: url.searchParams.get("q") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      priority: url.searchParams.get("priority") ?? undefined,
      queue: url.searchParams.get("queue") ?? undefined,
    },
  });

  return NextResponse.json({
    items: result.items.map((ticket) => ({
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
    page: result.page,
    pageSize: result.pageSize,
    pageCount: result.pageCount,
    total: result.total,
  });
}

const apiTicketSchema = createTicketSchema.omit({ createdAt: true });

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const parsed = apiTicketSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid ticket payload.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const ticket = await createTicket(parsed.data);
    return NextResponse.json(
      { id: ticket.id, ticketNumber: ticket.ticketNumber },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create ticket.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
