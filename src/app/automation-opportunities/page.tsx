import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";
import { categoryLabels } from "@/lib/constants";
import { getAutomationOpportunities, getTicketCategoryCounts } from "@/lib/service-desk";
import { formatMinutes } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AutomationOpportunitiesPage() {
  const [opportunities, categoryCounts] = await Promise.all([
    getAutomationOpportunities(),
    getTicketCategoryCounts(),
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
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 py-3">
        <div>
          <h1 className="text-[13px] font-semibold text-[var(--ink)]">Automation Review</h1>
          <p className="text-[11px] text-[var(--faint)]">
            {opportunities.length} opportunity areas &middot; {formatMinutes(estimatedMonthlyHours * 60)} estimated monthly savings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--border)]">
        <div className="bg-[var(--card)] px-5 py-3.5">
          <div className="text-xl font-bold tracking-tight text-[var(--ink)]">{opportunities.length}</div>
          <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--whisper)]">
            Opportunity Areas
          </div>
          <p className="mt-0.5 text-[10.5px] text-[var(--faint)]">
            Categories flagged as automation candidates.
          </p>
        </div>
        <div className="bg-[var(--card)] px-5 py-3.5">
          <div className="text-xl font-bold tracking-tight text-[var(--ink)]">
            {formatMinutes(estimatedMonthlyHours * 60)}
          </div>
          <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--whisper)]">
            Estimated Monthly Time
          </div>
          <p className="mt-0.5 text-[10.5px] text-[var(--faint)]">
            Hours saved if highest-value playbooks deploy.
          </p>
        </div>
        <div className="bg-[var(--card)] px-5 py-3.5">
          <div className="text-xl font-bold tracking-tight text-[var(--amber)]">
            {categoriesWithGuardrails}
          </div>
          <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--whisper)]">
            Guardrailed Categories
          </div>
          <p className="mt-0.5 text-[10.5px] text-[var(--faint)]">
            Need explicit approvals or policy checks.
          </p>
        </div>
      </div>

      <SectionCard
        title="Opportunity Matrix"
        description="Each recommendation pairs volume, automation fit, and operational guardrails."
      >
        <div className="grid gap-4">
          {opportunities.map((opportunity) => {
            const currentVolume = categoryCounts[opportunity.category] ?? 0;

            return (
              <div
                key={opportunity.id}
                className="grid gap-4 rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-5 xl:grid-cols-[0.9fr_1.1fr]"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="teal">{opportunity.automationFitScore} fit score</Badge>
                    <Badge tone={opportunity.requiresHumanApproval ? "amber" : "emerald"}>
                      {opportunity.requiresHumanApproval ? "Human approval required" : "Low-touch candidate"}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                      {categoryLabels[opportunity.category]}
                    </h3>
                    <p className="mt-2 text-[11px] leading-6 text-[var(--muted)]">
                      {opportunity.rationale}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[5px] border border-[var(--border)] bg-[var(--background)] p-4">
                      <div className="text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--whisper)]">
                        Monthly Volume
                      </div>
                      <div className="mt-2 text-xl font-bold tracking-tight text-[var(--ink)]">
                        {opportunity.monthlyTicketVolume}
                      </div>
                    </div>
                    <div className="rounded-[5px] border border-[var(--border)] bg-[var(--background)] p-4">
                      <div className="text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--whisper)]">
                        Hours Saved
                      </div>
                      <div className="mt-2 text-xl font-bold tracking-tight text-[var(--ink)]">
                        {opportunity.estimatedMonthlyHoursSaved}
                      </div>
                    </div>
                    <div className="rounded-[5px] border border-[var(--border)] bg-[var(--background)] p-4">
                      <div className="text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--whisper)]">
                        Current Seeded Count
                      </div>
                      <div className="mt-2 text-xl font-bold tracking-tight text-[var(--ink)]">
                        {currentVolume}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-[5px] border border-[var(--border)] bg-[var(--background)] p-4">
                    <div className="text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--whisper)]">
                      Recommended Playbook
                    </div>
                    <p className="mt-3 text-[11px] leading-6 text-[var(--muted)]">
                      {opportunity.recommendedPlaybook}
                    </p>
                  </div>
                  <div className="rounded-[5px] border border-[var(--border)] bg-[var(--background)] p-4">
                    <div className="text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--whisper)]">
                      Guardrails
                    </div>
                    <p className="mt-3 text-[11px] leading-6 text-[var(--muted)]">
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
