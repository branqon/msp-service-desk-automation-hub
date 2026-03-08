import Link from "next/link";
import { Activity, Bot, Clock3, ShieldCheck, Sparkles, TimerReset } from "lucide-react";

import { DashboardCharts } from "@/components/charts/dashboard-charts";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import {
  categoryLabels,
  getPriorityTone,
  getRiskTone,
  priorityLabels,
  queueLabels,
  riskLevelLabels,
} from "@/lib/constants";
import { getDashboardData } from "@/lib/service-desk";
import { formatDateTime, formatMinutes, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dashboard = await getDashboardData();

  const queueBreakdown = dashboard.queueBreakdown.map((item) => ({
    queue: queueLabels[item.queue] ?? item.queue,
    volume: item.volume,
  }));
  const categoryBreakdown = dashboard.categoryBreakdown.map((item) => ({
    category: categoryLabels[item.category] ?? item.category,
    volume: item.volume,
  }));

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-[2rem] border border-white/8 bg-[#1e1e2a] p-6 shadow-[0_20px_60px_-34px_rgba(0,0,0,0.7)]">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <Badge tone="teal">AI-Assisted Operations Control Plane</Badge>
            <div>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-[#f1f1f4] sm:text-5xl">
                Practical MSP workflow automation with clear human control points
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#8b8ba0]">
                This demo simulates how an MSP can blend deterministic service desk logic with AI-assisted
                triage, note generation, customer communication, approval gates, and operational reporting.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/tickets" className={buttonStyles()}>
                Open Queue Workbench
              </Link>
              <Link href="/tickets/new" className={buttonStyles({ variant: "secondary" })}>
                Submit Intake Ticket
              </Link>
              <Link href="/automation-opportunities" className={buttonStyles({ variant: "ghost" })}>
                Review Automation Candidates
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/8 bg-[#1e1e2a] p-5 backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f5f78]">
                Auto-Triage Coverage
              </div>
              <div className="mt-2 text-3xl font-semibold text-[#f1f1f4]">
                {formatPercent(dashboard.totals.autoTriageRate)}
              </div>
              <p className="mt-2 text-sm leading-6 text-[#8b8ba0]">
                Every seeded ticket includes a rule-based decision path and an AI-assisted recommendation layer.
              </p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-[#1e1e2a] p-5 backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f5f78]">
                Manual Time Saved
              </div>
              <div className="mt-2 text-3xl font-semibold text-[#f1f1f4]">
                {formatMinutes(dashboard.totals.manualMinutesSaved)}
              </div>
              <p className="mt-2 text-sm leading-6 text-[#8b8ba0]">
                Estimated technician time reduced through automated triage, notes, and customer draft generation.
              </p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-[#1e1e2a] p-5 backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f5f78]">
                Pending Approvals
              </div>
              <div className="mt-2 text-3xl font-semibold text-[#f1f1f4]">
                {dashboard.totals.pendingApprovals}
              </div>
              <p className="mt-2 text-sm leading-6 text-[#8b8ba0]">
                Sensitive actions stay visible and blocked until a human approver records a decision.
              </p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-[#1e1e2a] p-5 backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5f5f78]">
                SLA Compliance
              </div>
              <div className="mt-2 text-3xl font-semibold text-[#f1f1f4]">
                {formatPercent(dashboard.totals.slaCompliance)}
              </div>
              <p className="mt-2 text-sm leading-6 text-[#8b8ba0]">
                Resolution posture is calculated from actual seeded deadlines, open risk, and historical closures.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Tickets Processed"
          value={String(dashboard.totals.ticketsProcessed)}
          detail="Seeded intake volume spanning identity, network, procurement, security, and application support."
          badge="Realistic MSP dataset"
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          label="Auto-Triage Rate"
          value={formatPercent(dashboard.totals.autoTriageRate)}
          detail="Tickets routed through a deterministic ruleset plus AI recommendation overlay."
          badge="Rule + AI blend"
          icon={<Bot className="h-5 w-5" />}
        />
        <MetricCard
          label="Approval Rate"
          value={formatPercent(dashboard.totals.approvalRate)}
          detail="Approved decisions across procurement, tier 3 escalation, and controlled closure requests."
          badge="Human-in-the-loop"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <MetricCard
          label="Manual Minutes Saved"
          value={formatMinutes(dashboard.totals.manualMinutesSaved)}
          detail="Estimated time saved from automation-generated triage, drafts, and notes."
          badge="Operational efficiency"
          icon={<Clock3 className="h-5 w-5" />}
        />
        <MetricCard
          label="SLA Compliance"
          value={formatPercent(dashboard.totals.slaCompliance)}
          detail="Calculated across resolved, closed, and currently open tickets with live due dates."
          badge="Time-based reporting"
          icon={<TimerReset className="h-5 w-5" />}
        />
        <MetricCard
          label="Automation Candidates"
          value={String(dashboard.totals.automationCandidates)}
          detail="Categories with repeatability and guardrails strong enough to justify the next automation investment."
          badge="Strategic backlog"
          icon={<Sparkles className="h-5 w-5" />}
        />
      </div>

      <DashboardCharts
        ticketsByDay={dashboard.ticketsByDay}
        queueBreakdown={queueBreakdown}
        categoryBreakdown={categoryBreakdown}
      />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Recent Queue Activity"
          description="Most recent ticket flow across the seeded customer base."
        >
          <div className="space-y-3">
            {dashboard.recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="grid gap-3 rounded-2xl border border-white/6 bg-[#262635] p-4 md:grid-cols-[1.2fr_0.8fr_auto]"
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5f5f78]">
                    {ticket.ticketNumber}
                  </div>
                  <div className="mt-1 font-medium text-[#f1f1f4]">{ticket.subject}</div>
                  <div className="mt-1 text-sm text-[#8b8ba0]">{ticket.company.name}</div>
                </div>
                <div className="space-y-2 text-sm text-[#8b8ba0]">
                  <div>{queueLabels[ticket.suggestedQueue ?? ""] ?? "Pending queue"}</div>
                  <div>{formatDateTime(ticket.createdAt)}</div>
                </div>
                <div className="flex flex-wrap items-start justify-end gap-2">
                  <Badge tone={getPriorityTone(ticket.priority)}>
                    {priorityLabels[ticket.priority ?? ""] ?? "Pending"}
                  </Badge>
                  <Badge tone={getRiskTone(ticket.riskLevel)}>
                    {riskLevelLabels[ticket.riskLevel ?? ""] ?? "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-5">
          <SectionCard
            title="High-Risk Tickets"
            description="Open items that hiring managers would expect to see surfaced quickly."
          >
            <div className="space-y-3">
              {dashboard.highRiskTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-white/6 bg-[#262635] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={getPriorityTone(ticket.priority)}>
                      {priorityLabels[ticket.priority ?? ""] ?? "Pending"}
                    </Badge>
                    <Badge tone={getRiskTone(ticket.riskLevel)}>
                      {riskLevelLabels[ticket.riskLevel ?? ""] ?? "Pending"}
                    </Badge>
                  </div>
                  <div className="mt-3 font-medium text-[#f1f1f4]">{ticket.subject}</div>
                  <div className="mt-1 text-sm text-[#8b8ba0]">{ticket.company.name}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Top Opportunity Highlights"
            description="Strategic automation opportunities derived from recurring ticket patterns."
          >
            <div className="space-y-3">
              {dashboard.opportunityHighlights.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="rounded-2xl border border-white/6 bg-[#262635] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-[#f1f1f4]">
                      {categoryLabels[opportunity.category]}
                    </div>
                    <Badge tone="teal">{opportunity.automationFitScore} fit score</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#8b8ba0]">{opportunity.rationale}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
