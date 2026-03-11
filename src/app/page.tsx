import Link from "next/link";

import { ApprovalAging, SlaRiskHeatmap } from "@/components/charts/dashboard-charts";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import {
  getStatusTone,
  queueLabels,
  statusLabels,
} from "@/lib/constants";
import { getDashboardData } from "@/lib/service-desk";
import {
  cn,
  formatMinutes,
  formatPercent,
  formatRelativeTimeFrom,
  isClosedStatus,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

/* ---------- helpers ---------- */

function slaCountdown(
  dueAt: Date | string | null | undefined,
  status: string,
  referenceTime: Date | string,
) {
  if (!dueAt) return { text: "No SLA", tone: "done" as const };
  if (isClosedStatus(status)) return { text: "Closed", tone: "done" as const };

  const diffMs = new Date(dueAt).getTime() - new Date(referenceTime).getTime();
  const diffMin = diffMs / 60_000;

  if (diffMin < 0) {
    const overMin = Math.abs(diffMin);
    if (overMin < 60) return { text: `${Math.round(overMin)}m over`, tone: "overdue" as const };
    return { text: `${(overMin / 60).toFixed(1)}h over`, tone: "overdue" as const };
  }

  if (diffMin <= 60) return { text: `${Math.round(diffMin)}m left`, tone: "urgent" as const };
  if (diffMin <= 1440) return { text: `${(diffMin / 60).toFixed(0)}h left`, tone: "ok" as const };
  return { text: `${Math.round(diffMin / 1440)}d left`, tone: "ok" as const };
}

function slaTarget(resolutionTargetMinutes: number | null | undefined) {
  if (!resolutionTargetMinutes) {
    return "";
  }

  return `${formatMinutes(resolutionTargetMinutes)} target`;
}

function aiConfidenceLabel(confidence: number | null | undefined) {
  if (confidence == null) return { text: "No AI data", tone: "" };
  const pct = Math.round(confidence * 100);
  if (pct >= 85) return { text: `${pct}% confidence`, tone: "" };
  if (pct >= 60) return { text: `${pct}% \u2014 reduced`, tone: "low-conf" };
  return { text: `${pct}% \u2014 inconclusive`, tone: "very-low" };
}

function queueShortLabel(queue: string | null | undefined) {
  if (!queue) return "Unassigned";
  const label = queueLabels[queue];
  if (!label) return queue;
  // Shorten long queue names for the table
  if (label === "Network Operations") return "Network";
  if (label === "Messaging & Collaboration") return "Collab.";
  if (label === "Security Operations") return "Security";
  if (label === "Tier 3 Applications") return "Tier 3";
  if (label === "Field Services") return "Field Svc.";
  return label;
}

/* ---------- page ---------- */

export default async function Home() {
  const dashboard = await getDashboardData();
  const generatedAt = dashboard.generatedAt;
  const queueSnapshot = dashboard.queueSnapshot;
  const tickets = queueSnapshot.tickets;

  const lastTicketReceivedAt = dashboard.lastTicketReceivedAt;
  const contextText =
    `${queueSnapshot.openTickets} open tickets across ${queueSnapshot.activeQueues} queues` +
    (lastTicketReceivedAt
      ? ` \u00b7 last ticket received ${formatRelativeTimeFrom(lastTicketReceivedAt, generatedAt)}`
      : "");

  const slaAtRisk = dashboard.totals.overdueTickets;
  const timeSavedHours = (dashboard.totals.manualMinutesSaved / 60).toFixed(1);
  const heatRows = queueSnapshot.heatRows.map((row) => ({
    ...row,
    queue: queueShortLabel(row.queue),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      {/* ---- Page bar ---- */}
      <div className="flex items-center justify-between gap-6 border-b border-[var(--border)] bg-[var(--card)] px-10 py-3.5">
        <div className="flex items-baseline gap-3">
          <h1 className="text-[13px] font-semibold tracking-[-0.005em] text-[var(--ink)]">
            Triage Console
          </h1>
          <span className="text-[11.5px] text-[var(--muted)]">{contextText}</span>
        </div>
        <div className="flex gap-1.5">
          <Link href="/approvals" className={buttonStyles({ variant: "secondary", size: "sm" })}>
            Review Approvals
          </Link>
          <Link href="/tickets/new" className={buttonStyles({ size: "sm" })}>
            Submit Ticket
          </Link>
        </div>
      </div>

      {/* ---- Metrics strip ---- */}
      <div className="grid grid-cols-5 border-b border-[var(--border)] bg-[var(--card)]">
        <MetricCard
          label="Tickets Processed"
          value={dashboard.totals.ticketsProcessed}
          detail={`${dashboard.totals.aiInfluencedTickets} AI-influenced routes`}
        />
        <MetricCard
          label="Approvals Blocked"
          value={dashboard.totals.pendingApprovals}
          tone={dashboard.totals.pendingApprovals > 0 ? "amber" : "default"}
          detail={
            dashboard.totals.pendingApprovals > 0
              ? `Oldest waiting ${Math.max(
                  1,
                  Math.round(queueSnapshot.oldestPendingApprovalDays),
                )} day${Math.round(queueSnapshot.oldestPendingApprovalDays) === 1 ? "" : "s"}`
              : "None pending"
          }
        />
        <MetricCard
          label="SLA At Risk"
          value={slaAtRisk}
          tone={slaAtRisk > 0 ? "red" : "default"}
          detail={`${formatPercent(dashboard.totals.slaCompliance)} within target`}
        />
        <MetricCard
          label="Estimated Time Saved"
          value={timeSavedHours}
          unit="hrs"
          detail="Across processed tickets"
        />
        <MetricCard
          label="AI / Rule Divergence"
          value={queueSnapshot.aiDivergenceCount}
          tone={queueSnapshot.aiDivergenceCount > 0 ? "amber" : "default"}
          detail="Open tickets where AI and baseline rules disagree"
        />
      </div>

      {/* ---- Content ---- */}
      <div className="flex-1 px-10 pt-5">
        {/* Decision Support */}
        <div className="mb-2.5">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[var(--ink-60)]">
            Decision Support
          </span>
        </div>
        <div className="mb-5 grid grid-cols-[1fr_1.1fr] gap-3">
          <ApprovalAging buckets={queueSnapshot.approvalAging} />
          <SlaRiskHeatmap rows={heatRows} />
        </div>

        {/* Active Queue */}
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[var(--ink-60)]">
            Active Queue
          </span>
          <Link
            href="/tickets"
            className="text-[10px] font-medium text-[var(--faint)] transition-colors hover:text-[var(--ink-60)]"
          >
            Full workbench &rarr;
          </Link>
        </div>

        <div className="mb-9 overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--card)]">
          {/* Table header */}
          <div className="grid grid-cols-[40px_1fr_80px_80px_1fr_88px] border-b border-[var(--border)] bg-[#fafaf7]">
            {["#", "Subject", "Queue", "SLA", "AI Recommendation", "Status"].map((h) => (
              <div
                key={h}
                className={cn(
                  "px-3 py-[7px] text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]",
                  h === "Status" && "text-right",
                )}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Table rows */}
          {tickets.map((ticket, i) => {
            const sla = slaCountdown(ticket.dueResolutionAt, ticket.status, generatedAt);
            const isBreach = sla.tone === "overdue";
            const conf = aiConfidenceLabel(ticket.aiConfidence);
            const seqNum = String(i + 1).padStart(3, "0");

            return (
              <div
                key={ticket.id}
                className={cn(
                  "group relative grid grid-cols-[40px_1fr_80px_80px_1fr_88px] items-start border-b border-[var(--border-light)] transition-colors last:border-b-0",
                  isBreach
                    ? "bg-[var(--red-bg)] hover:bg-[#f9e4e6]"
                    : "hover:bg-[#fafaf7]",
                )}
              >
                {/* Left accent bar */}
                <span
                  className={cn(
                    "pointer-events-none absolute bottom-0 left-0 top-0 w-0.5 transition-colors",
                    isBreach
                      ? "bg-[var(--red)]"
                      : "bg-transparent group-hover:bg-[#2563eb]",
                  )}
                />

                {/* # */}
                <div className="px-3 pt-[13px] font-mono text-[10px] text-[var(--whisper)]">
                  {seqNum}
                </div>

                {/* Subject */}
                <div className="px-3 py-[9px]">
                  <div className="text-[12.5px] font-medium leading-[1.3] text-[var(--ink)]">
                    {ticket.subject}
                  </div>
                  <div className="mt-0.5 text-[10.5px] leading-[1.4] text-[var(--faint)]">
                    {ticket.company.name} &middot;{" "}
                    {queueShortLabel(ticket.suggestedQueue)} &middot;{" "}
                    {formatRelativeTimeFrom(ticket.createdAt, generatedAt)}
                  </div>
                  {ticket.recommendedNextStep && (
                    <div className="mt-0.5 text-[10.5px] italic leading-[1.4] text-[var(--muted)]">
                      {ticket.recommendedNextStep.length > 80
                        ? ticket.recommendedNextStep.slice(0, 80) + "\u2026"
                        : ticket.recommendedNextStep}
                    </div>
                  )}
                </div>

                {/* Queue */}
                <div className="px-3 pt-[13px] text-[11px] text-[var(--muted)]">
                  {queueShortLabel(ticket.suggestedQueue)}
                </div>

                {/* SLA */}
                <div className="px-3 pt-[11px]">
                  <div
                    className={cn(
                      "text-[11.5px] font-semibold",
                      sla.tone === "overdue" && "text-[var(--red)]",
                      sla.tone === "urgent" && "text-[var(--amber)]",
                      sla.tone === "ok" && "text-[var(--green)]",
                      sla.tone === "done" && "text-[var(--whisper)]",
                    )}
                  >
                    {sla.text}
                  </div>
                  <div className="mt-px text-[9.5px] text-[var(--faint)]">
                    {slaTarget(ticket.slaProfile?.resolutionTargetMinutes)}
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="px-3 pt-[11px]">
                  <div className="text-[11.5px] font-semibold leading-[1.3] text-[var(--ink-80)]">
                    {ticket.escalationSuggestion
                      ? ticket.escalationSuggestion.length > 40
                        ? ticket.escalationSuggestion.slice(0, 40) + "\u2026"
                        : ticket.escalationSuggestion
                      : "Route to queue"}
                  </div>
                  {ticket.probableRootCause && (
                    <div className="mt-px text-[10.5px] leading-[1.4] text-[var(--faint)]">
                      {ticket.probableRootCause.length > 60
                        ? ticket.probableRootCause.slice(0, 60) + "\u2026"
                        : ticket.probableRootCause}
                    </div>
                  )}
                  <div
                    className={cn(
                      "mt-0.5 text-[9.5px]",
                      conf.tone === "low-conf"
                        ? "text-[var(--amber)]"
                        : conf.tone === "very-low"
                          ? "text-[var(--red)]"
                          : "text-[var(--whisper)]",
                    )}
                  >
                    {conf.text}
                  </div>
                  {ticket.aiConfidence != null && ticket.aiConfidence < 0.7 && (
                    <div
                      className={cn(
                        "mt-0.5 text-[9.5px] font-medium",
                        ticket.aiConfidence < 0.5
                          ? "text-[var(--red)]"
                          : "text-[var(--amber)]",
                      )}
                    >
                      {ticket.aiConfidence < 0.5
                        ? "Low confidence \u2014 manual triage recommended"
                        : "Confidence reduced \u2014 review suggested"}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="px-3 pt-[11px] text-right">
                  <Badge tone={getStatusTone(ticket.status)}>
                    {statusLabels[ticket.status] ?? ticket.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Footer ---- */}
      <footer className="mt-auto border-t border-[var(--border)] bg-[var(--card)] px-10 py-5">
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-[var(--muted)]">
            <span className="font-semibold text-[var(--ink-60)]">Service Desk Automation Hub</span>
            {" \u2014 "}Deterministic routing with AI-assisted decision support
          </div>
          <nav className="flex gap-5">
            <Link
              href="/tickets"
              className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--faint)] transition-colors hover:text-[var(--ink-60)]"
            >
              Workbench
            </Link>
            <Link
              href="/approvals"
              className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--faint)] transition-colors hover:text-[var(--ink-60)]"
            >
              Approvals
            </Link>
            <Link
              href="/automation-opportunities"
              className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--faint)] transition-colors hover:text-[var(--ink-60)]"
            >
              Automation Review
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
