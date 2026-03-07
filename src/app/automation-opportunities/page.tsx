import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";
import { categoryLabels } from "@/lib/constants";
import { getAutomationOpportunities, getTickets } from "@/lib/service-desk";
import { formatMinutes } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AutomationOpportunitiesPage() {
  const [opportunities, tickets] = await Promise.all([
    getAutomationOpportunities(),
    getTickets(),
  ]);

  const estimatedMonthlyHours = opportunities.reduce(
    (total, item) => total + item.estimatedMonthlyHoursSaved,
    0,
  );
  const categoriesWithGuardrails = opportunities.filter(
    (item) => item.requiresHumanApproval,
  ).length;

  return (
    <div className="grid gap-5">
      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="space-y-4">
          <Badge tone="teal">Strategic Planning View</Badge>
          <div>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-slate-950">
              Use operational ticket patterns to decide what should be automated next
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              This page focuses on repeatability, policy constraints, and business value so the project tells
              a stronger solutions-engineering story than a simple incident dashboard.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-3">
        <SectionCard>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Opportunity Areas
          </div>
          <div className="mt-2 text-3xl font-semibold text-slate-950">{opportunities.length}</div>
          <p className="mt-2 text-sm text-slate-600">
            Distinct categories currently flagged as automation candidates.
          </p>
        </SectionCard>
        <SectionCard>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Estimated Monthly Time
          </div>
          <div className="mt-2 text-3xl font-semibold text-slate-950">
            {formatMinutes(estimatedMonthlyHours * 60)}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Roll-up of the hours saved if the highest-value playbooks are deployed.
          </p>
        </SectionCard>
        <SectionCard>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Guardrailed Categories
          </div>
          <div className="mt-2 text-3xl font-semibold text-slate-950">
            {categoriesWithGuardrails}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Candidate areas that still need explicit approvals or policy checks.
          </p>
        </SectionCard>
      </div>

      <SectionCard
        title="Opportunity Matrix"
        description="Each recommendation pairs volume, automation fit, and operational guardrails."
      >
        <div className="grid gap-4">
          {opportunities.map((opportunity) => {
            const currentVolume = tickets.filter(
              (ticket) => ticket.category === opportunity.category,
            ).length;

            return (
              <div
                key={opportunity.id}
                className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 xl:grid-cols-[0.9fr_1.1fr]"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="teal">{opportunity.automationFitScore} fit score</Badge>
                    <Badge tone={opportunity.requiresHumanApproval ? "amber" : "emerald"}>
                      {opportunity.requiresHumanApproval ? "Human approval required" : "Low-touch candidate"}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">
                      {categoryLabels[opportunity.category]}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {opportunity.rationale}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Monthly Volume
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">
                        {opportunity.monthlyTicketVolume}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Hours Saved
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">
                        {opportunity.estimatedMonthlyHoursSaved}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Current Seeded Count
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-slate-950">
                        {currentVolume}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Recommended Playbook
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {opportunity.recommendedPlaybook}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Guardrails
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {opportunity.guardrails}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
