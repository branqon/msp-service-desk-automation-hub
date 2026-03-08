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
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {ticket.ticketNumber}
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {ticket.subject}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
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
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Requester
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">
                {ticket.requester.name}
              </div>
              <div className="text-sm text-slate-600">
                {ticket.requester.title} · {ticket.company.name}
              </div>
            </div>
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Classification
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">
                {issueTypeLabels[ticket.issueType]}
              </div>
              <div className="text-sm text-slate-600">
                {categoryLabels[ticket.category ?? ""] ?? "Pending"} ·{" "}
                {queueLabels[ticket.suggestedQueue ?? ""] ?? "Pending"}
              </div>
            </div>
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Timing
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">
                Created {formatRelativeTime(ticket.createdAt)}
              </div>
              <div className="text-sm text-slate-600">{formatDateTime(ticket.createdAt)}</div>
            </div>
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Automation
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">
                {formatMinutes(ticket.manualMinutesSaved)} saved
              </div>
              <div className="text-sm text-slate-600">
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
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Rule Engine
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div>{categoryLabels[ticket.ruleCategory ?? ""] ?? "Pending"}</div>
                <div>{queueLabels[ticket.ruleQueue ?? ""] ?? "Pending"}</div>
                <Badge tone={getPriorityTone(ticket.rulePriority)}>
                  {priorityLabels[ticket.rulePriority ?? ""] ?? "Pending"}
                </Badge>
              </div>
            </div>
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                AI Recommendation
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div>{categoryLabels[ticket.aiSuggestedCategory ?? ""] ?? "Pending"}</div>
                <div>{queueLabels[ticket.aiSuggestedQueue ?? ""] ?? "Pending"}</div>
                <Badge tone={getPriorityTone(ticket.aiSuggestedPriority)}>
                  {priorityLabels[ticket.aiSuggestedPriority ?? ""] ?? "Pending"}
                </Badge>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Confidence {Math.round((ticket.aiConfidence ?? 0) * 100)}%
                </div>
              </div>
            </div>
            <div className="min-w-0 rounded-2xl border border-[#0f766e]/20 bg-[#0f766e]/8 p-4">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[#0f766e]">
                Final Route
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-800">
                <div>{categoryLabels[ticket.category ?? ""] ?? "Pending"}</div>
                <div>{queueLabels[ticket.suggestedQueue ?? ""] ?? "Pending"}</div>
                <Badge tone={getPriorityTone(ticket.priority)}>
                  {priorityLabels[ticket.priority ?? ""] ?? "Pending"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
            {ticket.triageReasoning}
          </div>
        </SectionCard>

        <SectionCard
          title="SLA and Risk"
          description="Priority, impact, and issue type drive timing targets and breach visibility."
        >
          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Response Target
              </div>
              <div className="mt-2 text-xl font-semibold text-slate-950">
                {ticket.slaProfile ? formatMinutes(ticket.slaProfile.responseTargetMinutes) : "Not set"}
              </div>
              <div className="text-sm text-slate-600">{formatDateTime(ticket.dueResponseAt)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Resolution Target
              </div>
              <div className="mt-2 text-xl font-semibold text-slate-950">
                {ticket.slaProfile ? formatMinutes(ticket.slaProfile.resolutionTargetMinutes) : "Not set"}
              </div>
              <div className="text-sm text-slate-600">{formatDateTime(ticket.dueResolutionAt)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              <div className="font-semibold text-slate-900">{ticket.slaProfile?.name}</div>
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
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Internal Summary
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{ticket.internalSummary}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Probable Root Cause
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {ticket.probableRootCause}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Recommended Next Step
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {ticket.recommendedNextStep}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Escalation Guidance
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {ticket.escalationSuggestion}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Ticket Context"
          description="Operational context used by the workflow engine for routing and reporting."
        >
          <div className="grid gap-3 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Urgency</span>
              <span className="font-medium">{urgencyLabels[ticket.urgency]}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Impact</span>
              <span className="font-medium">{impactLabels[ticket.impact]}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Sentiment</span>
              <span className="font-medium">
                {sentimentLabels[ticket.sentiment ?? ""] ?? "Pending"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
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
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                No approvals recorded for this ticket yet.
              </div>
            ) : (
              ticket.approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
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
                  <div className="mt-3 text-sm leading-6 text-slate-700">
                    <div>Requested by {approval.requestedBy}</div>
                    <div>{approval.reason}</div>
                    <div className="text-slate-500">
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
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{run.workflowName}</div>
                    <div className="text-sm text-slate-600">{run.summary}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={getSourceTone(run.source)}>
                      {sourceLabels[run.source] ?? run.source}
                    </Badge>
                    <Badge tone="slate">{run.status}</Badge>
                  </div>
                </div>
                <div className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
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
              className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[auto_1fr_auto]"
            >
              <Badge tone={getSourceTone(event.source)}>
                {sourceLabels[event.source] ?? event.source}
              </Badge>
              <div>
                <div className="font-medium text-slate-900">{event.action}</div>
                <div className="mt-1 text-sm leading-6 text-slate-600">{event.details}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                  {event.actorName}
                </div>
              </div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                {formatDateTime(event.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
