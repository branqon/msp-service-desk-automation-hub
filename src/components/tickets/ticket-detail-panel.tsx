import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";
import { ApprovalRequestForm } from "@/components/tickets/approval-request-form";
import { CustomerUpdateReviewForm } from "@/components/tickets/customer-update-review-form";
import {
  approvalStatusLabels,
  approvalTypeLabels,
  categoryLabels,
  getPriorityTone,
  getRiskTone,
  getSlaRiskTone,
  getSourceTone,
  getStatusTone,
  impactLabels,
  issueTypeLabels,
  priorityLabels,
  queueLabels,
  riskLevelLabels,
  sentimentLabels,
  sourceLabels,
  statusLabels,
  urgencyLabels,
} from "@/lib/constants";
import type { TicketDetail } from "@/lib/service-desk";
import {
  formatDateTime,
  formatMinutes,
  formatRelativeTime,
  getSlaRiskLevel,
} from "@/lib/utils";

export function TicketDetailPanel({ ticket }: { ticket: TicketDetail }) {
  const slaRisk = getSlaRiskLevel(ticket.dueResolutionAt, ticket.status);

  return (
    <div className="grid gap-5">
      <SectionCard>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
                {ticket.ticketNumber}
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#f1f1f4]">
                  {ticket.subject}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#8b8ba0]">
                  {ticket.description}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={getPriorityTone(ticket.priority)}>
                {priorityLabels[ticket.priority ?? ""] ?? "Pending"}
              </Badge>
              <Badge tone={getStatusTone(ticket.status)}>
                {statusLabels[ticket.status] ?? ticket.status}
              </Badge>
              <Badge tone={getRiskTone(ticket.riskLevel)}>
                {riskLevelLabels[ticket.riskLevel ?? ""] ?? "Pending risk"}
              </Badge>
              <Badge tone={getSlaRiskTone(slaRisk)}>{slaRisk}</Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <div className="min-w-0 rounded-2xl border border-white/6 bg-[#262635] p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
                Requester
              </div>
              <div className="mt-2 text-sm font-medium text-[#f1f1f4]">
                {ticket.requester.name}
              </div>
              <div className="text-sm text-[#8b8ba0]">
                {ticket.requester.title} · {ticket.company.name}
              </div>
            </div>
            <div className="min-w-0 rounded-2xl border border-white/6 bg-[#262635] p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-[#5f5f78]">
                Classification
              </div>
              <div className="mt-2 text-sm font-medium text-[#f1f1f4]">
                {issueTypeLabels[ticket.issueType]}
              </div>
              <div className="text-sm text-[#8b8ba0]">
                {categoryLabels[ticket.category ?? ""] ?? "Pending"} ·{" "}
                {queueLabels[ticket.suggestedQueue ?? ""] ?? "Pending"}
              </div>
            </div>
            <div className="min-w-0 rounded-2xl border border-white/6 bg-[#262635] p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
                Timing
              </div>
              <div className="mt-2 text-sm font-medium text-[#f1f1f4]">
                Created {formatRelativeTime(ticket.createdAt)}
              </div>
              <div className="text-sm text-[#8b8ba0]">{formatDateTime(ticket.createdAt)}</div>
            </div>
            <div className="min-w-0 rounded-2xl border border-white/6 bg-[#262635] p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
                Automation
              </div>
              <div className="mt-2 text-sm font-medium text-[#f1f1f4]">
                {formatMinutes(ticket.manualMinutesSaved)} saved
              </div>
              <div className="text-sm text-[#8b8ba0]">
                {ticket.customerUpdateReviewedAt
                  ? `Reviewed by ${ticket.customerUpdateReviewedBy}`
                  : "Drafts awaiting technician review"}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-5 2xl:grid-cols-[1.25fr_0.75fr]">
        <SectionCard
          title="Triage Engine"
          description="Deterministic routing is shown alongside AI-assisted recommendations so the decision path stays transparent."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="min-w-0 rounded-2xl border border-white/6 bg-[#262635] p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[#5f5f78]">
                Rule Engine
              </div>
              <div className="mt-3 space-y-2 text-sm text-[#8b8ba0]">
                <div>{categoryLabels[ticket.ruleCategory ?? ""] ?? "Pending"}</div>
                <div>{queueLabels[ticket.ruleQueue ?? ""] ?? "Pending"}</div>
                <Badge tone={getPriorityTone(ticket.rulePriority)}>
                  {priorityLabels[ticket.rulePriority ?? ""] ?? "Pending"}
                </Badge>
              </div>
            </div>
            <div className="min-w-0 rounded-2xl border border-white/6 bg-[#262635] p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[#5f5f78]">
                AI Recommendation
              </div>
              <div className="mt-3 space-y-2 text-sm text-[#8b8ba0]">
                <div>{categoryLabels[ticket.aiSuggestedCategory ?? ""] ?? "Pending"}</div>
                <div>{queueLabels[ticket.aiSuggestedQueue ?? ""] ?? "Pending"}</div>
                <Badge tone={getPriorityTone(ticket.aiSuggestedPriority)}>
                  {priorityLabels[ticket.aiSuggestedPriority ?? ""] ?? "Pending"}
                </Badge>
                <div className="text-xs uppercase tracking-[0.16em] text-[#5f5f78]">
                  Confidence {Math.round((ticket.aiConfidence ?? 0) * 100)}%
                </div>
              </div>
            </div>
            <div className="min-w-0 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-indigo-400">
                Final Route
              </div>
              <div className="mt-3 space-y-2 text-sm text-[#e0e0ea]">
                <div>{categoryLabels[ticket.category ?? ""] ?? "Pending"}</div>
                <div>{queueLabels[ticket.suggestedQueue ?? ""] ?? "Pending"}</div>
                <Badge tone={getPriorityTone(ticket.priority)}>
                  {priorityLabels[ticket.priority ?? ""] ?? "Pending"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/6 bg-[#1e1e2a] p-4 text-sm leading-6 text-[#8b8ba0]">
            {ticket.triageReasoning}
          </div>
        </SectionCard>

        <SectionCard
          title="SLA and Risk"
          description="Priority, impact, and issue type drive timing targets and breach visibility."
        >
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/6 bg-[#262635] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
                Response Target
              </div>
              <div className="mt-2 text-xl font-semibold text-[#f1f1f4]">
                {ticket.slaProfile ? formatMinutes(ticket.slaProfile.responseTargetMinutes) : "Not set"}
              </div>
              <div className="text-sm text-[#8b8ba0]">{formatDateTime(ticket.dueResponseAt)}</div>
            </div>
            <div className="rounded-2xl border border-white/6 bg-[#262635] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
                Resolution Target
              </div>
              <div className="mt-2 text-xl font-semibold text-[#f1f1f4]">
                {ticket.slaProfile ? formatMinutes(ticket.slaProfile.resolutionTargetMinutes) : "Not set"}
              </div>
              <div className="text-sm text-[#8b8ba0]">{formatDateTime(ticket.dueResolutionAt)}</div>
            </div>
            <div className="rounded-2xl border border-white/6 bg-[#262635] p-4 text-sm leading-6 text-[#8b8ba0]">
              <div className="font-semibold text-[#f1f1f4]">{ticket.slaProfile?.name}</div>
              <div>{ticket.slaProfile?.escalationPolicy}</div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Technician Assist"
          description="Operationally useful outputs that reduce triage and communication overhead for the service desk."
        >
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/6 bg-[#262635] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
                Internal Summary
              </div>
              <p className="mt-3 text-sm leading-6 text-[#8b8ba0]">{ticket.internalSummary}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/6 bg-[#262635] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
                  Probable Root Cause
                </div>
                <p className="mt-3 text-sm leading-6 text-[#8b8ba0]">
                  {ticket.probableRootCause}
                </p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-[#262635] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
                  Recommended Next Step
                </div>
                <p className="mt-3 text-sm leading-6 text-[#8b8ba0]">
                  {ticket.recommendedNextStep}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/6 bg-[#262635] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
                Escalation Guidance
              </div>
              <p className="mt-3 text-sm leading-6 text-[#8b8ba0]">
                {ticket.escalationSuggestion}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Ticket Context"
          description="Operational context used by the workflow engine for routing and reporting."
        >
          <div className="grid gap-3 text-sm text-[#8b8ba0]">
            <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-[#262635] px-4 py-3">
              <span>Urgency</span>
              <span className="font-medium">{urgencyLabels[ticket.urgency]}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-[#262635] px-4 py-3">
              <span>Impact</span>
              <span className="font-medium">{impactLabels[ticket.impact]}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-[#262635] px-4 py-3">
              <span>Sentiment</span>
              <span className="font-medium">
                {sentimentLabels[ticket.sentiment ?? ""] ?? "Pending"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-[#262635] px-4 py-3">
              <span>Attachments</span>
              <span className="font-medium">{ticket.attachments.length}</span>
            </div>
          </div>
          {ticket.attachments.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {ticket.attachments.map((attachment) => (
                <Badge key={attachment.id} tone="slate">
                  {attachment.fileName}
                </Badge>
              ))}
            </div>
          ) : null}
        </SectionCard>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[1fr_1fr]">
        <CustomerUpdateReviewForm
          ticketId={ticket.id}
          currentDraft={ticket.customerUpdateDraft ?? ""}
          reviewerName={ticket.customerUpdateReviewedBy}
        />
        <ApprovalRequestForm ticketId={ticket.id} />
      </div>

      <div className="grid gap-5 2xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard
          title="Approval History"
          description="Every sensitive action keeps its decision record, requester, and approver."
        >
          <div className="space-y-3">
            {ticket.approvals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#262635] p-4 text-sm text-[#8b8ba0]">
                No approvals recorded for this ticket yet.
              </div>
            ) : (
              ticket.approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="rounded-2xl border border-white/6 bg-[#262635] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="amber">
                      {approvalTypeLabels[approval.approvalType] ?? approval.approvalType}
                    </Badge>
                    <Badge
                      tone={
                        approval.status === "APPROVED"
                          ? "emerald"
                          : approval.status === "REJECTED"
                            ? "red"
                            : "blue"
                      }
                    >
                      {approvalStatusLabels[approval.status] ?? approval.status}
                    </Badge>
                  </div>
                  <div className="mt-3 text-sm leading-6 text-[#8b8ba0]">
                    <div>Requested by {approval.requestedBy}</div>
                    <div>{approval.reason}</div>
                    <div className="text-[#5f5f78]">
                      {formatDateTime(approval.requestedAt)}
                      {approval.approverName ? ` · ${approval.approverName}` : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Workflow History"
          description="System automation, AI steps, approvals, and manual technician actions are all tracked as discrete workflow runs."
        >
          <div className="space-y-3">
            {ticket.workflowRuns.map((run) => (
              <div
                key={run.id}
                className="rounded-2xl border border-white/6 bg-[#262635] p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium text-[#f1f1f4]">{run.workflowName}</div>
                    <div className="text-sm text-[#8b8ba0]">{run.summary}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={getSourceTone(run.source)}>
                      {sourceLabels[run.source] ?? run.source}
                    </Badge>
                    <Badge tone="slate">{run.status}</Badge>
                  </div>
                </div>
                <div className="mt-3 text-xs uppercase tracking-[0.16em] text-[#5f5f78]">
                  {formatDateTime(run.startedAt)}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Audit Trail"
        description="Every important action keeps a timestamp, source marker, and actor attribution."
      >
        <div className="space-y-3">
          {ticket.auditEvents.map((event) => (
            <div
              key={event.id}
              className="grid gap-3 rounded-2xl border border-white/6 bg-[#262635] p-4 md:grid-cols-[auto_1fr_auto]"
            >
              <Badge tone={getSourceTone(event.source)}>
                {sourceLabels[event.source] ?? event.source}
              </Badge>
              <div>
                <div className="font-medium text-[#f1f1f4]">{event.action}</div>
                <div className="mt-1 text-sm leading-6 text-[#8b8ba0]">{event.details}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.16em] text-[#5f5f78]">
                  {event.actorName}
                </div>
              </div>
              <div className="text-xs uppercase tracking-[0.16em] text-[#5f5f78]">
                {formatDateTime(event.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
