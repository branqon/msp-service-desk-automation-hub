import Link from "next/link";

import { ApprovalAging, SlaRiskHeatmap } from "@/components/charts/dashboard-charts";
import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import {
  getStatusTone,
  priorityLabels,
  queueLabels,
  statusLabels,
} from "@/lib/constants";
import { getDashboardData } from "@/lib/service-desk";
import {
  cn,
  formatRelativeTime,
  isClosedStatus,
  isOverdue,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

/* ---------- helpers ---------- */

function slaCountdown(dueAt: Date | string | null | undefined, status: string) {
  if (!dueAt) return { text: "No SLA", tone: "done" as const };
  if (isClosedStatus(status)) return { text: "Closed", tone: "done" as const };

  const diffMs = new Date(dueAt).getTime() - Date.now();
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

function slaTarget(priority: string | null | undefined) {
  switch (priority) {
    case "P1_CRITICAL": return "P1 \u00b7 4h target";
    case "P2_HIGH": return "P2 \u00b7 8h target";
    case "P3_MEDIUM": return "P3 \u00b7 72h target";
    case "P4_LOW": return "P4 \u00b7 120h target";
    default: return "";
  }
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
  const tickets = dashboard.recentTickets;

  const openTickets = tickets.filter((t) => !isClosedStatus(t.status));
  const uniqueQueues = new Set(tickets.map((t) => t.suggestedQueue).filter(Boolean));
  const lastTicket = tickets[0];
  const contextText = `${openTickets.length} open tickets across ${uniqueQueues.size} queues` +
    (lastTicket ? ` \u00b7 last ticket received ${formatRelativeTime(lastTicket.createdAt)}` : "");

  // Compute triage-console metrics from dashboard data
  const autoTriaged = Math.round(
    (dashboard.totals.autoTriageRate / 100) * dashboard.totals.ticketsProcessed,
  );
  const slaAtRisk = dashboard.totals.overdueTickets;
  const timeSavedHours = (dashboard.totals.manualMinutesSaved / 60).toFixed(1);
  const breachedCount = tickets.filter((t) => isOverdue(t.dueResolutionAt, t.status)).length;

  // Approval aging buckets
  const pendingApprovals = tickets.flatMap((t) =>
    t.approvals.filter((a) => a.status === "PENDING"),
  );
  const now = Date.now();
  const agingBuckets = { over72: 0, h24to72: 0, h4to24: 0, under4: 0 };
  for (const a of pendingApprovals) {
    const hoursWaiting = (now - new Date(a.requestedAt).getTime()) / 3_600_000;
    if (hoursWaiting > 72) agingBuckets.over72++;
    else if (hoursWaiting > 24) agingBuckets.h24to72++;
    else if (hoursWaiting > 4) agingBuckets.h4to24++;
    else agingBuckets.under4++;
  }

  // SLA heatmap data: queue x priority tier, plus breach column
  type HeatRow = { queue: string; p1p2: number; p3: number; p4: number; breach: number };
  const heatMap = new Map<string, HeatRow>();
  for (const t of tickets) {
    if (isClosedStatus(t.status)) continue;
    const q = queueShortLabel(t.suggestedQueue);
    if (!heatMap.has(q)) heatMap.set(q, { queue: q, p1p2: 0, p3: 0, p4: 0, breach: 0 });
    const row = heatMap.get(q)!;
    const breached = isOverdue(t.dueResolutionAt, t.status);
    if (breached) row.breach++;
    if (t.priority === "P1_CRITICAL" || t.priority === "P2_HIGH") row.p1p2++;
    else if (t.priority === "P3_MEDIUM") row.p3++;
    else row.p4++;
  }
  const heatRows = [...heatMap.values()].sort((a, b) => (b.breach + b.p1p2) - (a.breach + a.p1p2));

  // Manual overrides: tickets where AI and final queue diverge
  const overrides = tickets.filter(
    (t) => t.aiSuggestedQueue && t.suggestedQueue && t.aiSuggestedQueue !== t.suggestedQueue,
  ).length;

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
          label="Auto-Triaged"
          value={autoTriaged}
          unit={`of ${dashboard.totals.ticketsProcessed}`}
          detail={`${dashboard.totals.ticketsProcessed - autoTriaged} required manual routing`}
        />
        <MetricCard
          label="Approvals Blocked"
          value={dashboard.totals.pendingApprovals}
          tone={dashboard.totals.pendingApprovals > 0 ? "amber" : "default"}
          detail={
            pendingApprovals.length > 0
              ? `Oldest waiting ${Math.round(
                  Math.max(
                    ...pendingApprovals.map(
                      (a) => (now - new Date(a.requestedAt).getTime()) / 86_400_000,
                    ),
                  ),
                )} days`
              : "None pending"
          }
        />
        <MetricCard
          label="SLA At Risk"
          value={slaAtRisk}
          tone={slaAtRisk > 0 ? "red" : "default"}
          detail={
            breachedCount > 0
              ? `${breachedCount} breached`
              : "All within target"
          }
        />
        <MetricCard
          label="Time Saved This Week"
          value={timeSavedHours}
          unit="hrs"
          detail="vs. full-manual triage"
        />
        <MetricCard
          label="Manual Overrides"
          value={overrides}
          detail={overrides > 0 ? "AI suggestion changed by ops" : "No overrides"}
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
          <ApprovalAging buckets={agingBuckets} />
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
            const sla = slaCountdown(ticket.dueResolutionAt, ticket.status);
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
                    {formatRelativeTime(ticket.createdAt)}
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
                    {slaTarget(ticket.priority)}
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
            <a
              href="https://github.com"
              className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--faint)] transition-colors hover:text-[var(--ink-60)]"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--faint)] transition-colors hover:text-[var(--ink-60)]"
            >
              Architecture
            </a>
            <a
              href="#"
              className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--faint)] transition-colors hover:text-[var(--ink-60)]"
            >
              Docs
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
