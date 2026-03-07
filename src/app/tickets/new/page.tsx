import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";
import { TicketIntakeForm } from "@/components/tickets/ticket-intake-form";
import { categoryLabels, issueTypeLabels, priorityLabels, queueLabels } from "@/lib/constants";
import { getCompanies, getTickets } from "@/lib/service-desk";

export const dynamic = "force-dynamic";

export default async function NewTicketPage() {
  const [companies, tickets] = await Promise.all([getCompanies(), getTickets()]);

  return (
    <div className="grid gap-5">
      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="space-y-4">
          <Badge tone="teal">Guided Intake</Badge>
          <div>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-slate-950">
              Capture incoming work the way an MSP dispatcher actually would
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              The intake form feeds the same backend automation logic used by the seeded demo records.
              New submissions generate queue assignment, SLA targets, internal notes, customer drafts,
              and approvals when policy requires them.
            </p>
          </div>
        </div>
      </section>

      <TicketIntakeForm companies={companies} />

      <SectionCard
        title="Recent Seeded Examples"
        description="Use these seeded tickets as realistic references for the quality of intake data expected by the workflow."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {tickets.slice(0, 4).map((ticket) => (
            <div key={ticket.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {ticket.ticketNumber}
              </div>
              <div className="mt-2 font-medium text-slate-950">{ticket.subject}</div>
              <div className="mt-1 text-sm text-slate-600">
                {ticket.company.name} · {issueTypeLabels[ticket.issueType]}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Badge tone="blue">{categoryLabels[ticket.category ?? ""] ?? "Pending"}</Badge>
                <Badge tone="teal">{queueLabels[ticket.suggestedQueue ?? ""] ?? "Pending"}</Badge>
                <Badge tone="amber">{priorityLabels[ticket.priority ?? ""] ?? "Pending"}</Badge>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
