import { ApprovalDecisionForm } from "@/components/approvals/approval-decision-form";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import {
  approvalStatusLabels,
  approvalTypeLabels,
  categoryLabels,
  getPriorityTone,
  priorityLabels,
  statusLabels,
} from "@/lib/constants";
import { getApprovals } from "@/lib/service-desk";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const approvals = await getApprovals();
  const pending = approvals.filter((approval) => approval.status === "PENDING");
  const decided = approvals.filter((approval) => approval.status !== "PENDING");

  return (
    <div className="grid gap-5">
      <section className="rounded-3xl border border-white/8 bg-[#1e1e2a] p-6 shadow-[0_20px_50px_-34px_rgba(0,0,0,0.7)] backdrop-blur">
        <div className="space-y-4">
          <Badge tone="amber">Approval Control Center</Badge>
          <div>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-[#f1f1f4]">
              Human approvals protect sensitive actions without blocking the automation story
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#8b8ba0]">
              Procurement, tier 3 escalation, and controlled closure decisions are surfaced here with enough
              ticket context to support a real operational approval workflow.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-3">
        <SectionCard>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
            Pending Approvals
          </div>
          <div className="mt-2 text-3xl font-semibold text-[#f1f1f4]">{pending.length}</div>
          <p className="mt-2 text-sm text-[#8b8ba0]">
            Actions waiting on an operations lead, service manager, or budget owner.
          </p>
        </SectionCard>
        <SectionCard>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
            Approved Decisions
          </div>
          <div className="mt-2 text-3xl font-semibold text-[#f1f1f4]">
            {decided.filter((approval) => approval.status === "APPROVED").length}
          </div>
          <p className="mt-2 text-sm text-[#8b8ba0]">
            Sensitive actions cleared by an authorized approver with recorded notes.
          </p>
        </SectionCard>
        <SectionCard>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
            Rejected Decisions
          </div>
          <div className="mt-2 text-3xl font-semibold text-[#f1f1f4]">
            {decided.filter((approval) => approval.status === "REJECTED").length}
          </div>
          <p className="mt-2 text-sm text-[#8b8ba0]">
            Requests denied with documented rationale for audit visibility.
          </p>
        </SectionCard>
      </div>

      <SectionCard
        title="Pending Review"
        description="Open approvals waiting on an operations lead, service manager, or budget owner."
      >
        <div data-testid="pending-review-section">
          {pending.length === 0 ? (
            <EmptyState
              title="No pending approvals"
              description="The queue is clear right now. Approved and rejected decisions remain below for audit reference."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {pending.map((approval) => (
                <div
                  key={approval.id}
                  className="rounded-3xl border border-white/6 bg-[#262635] p-5"
                  data-testid="pending-approval-card"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="amber">
                      {approvalTypeLabels[approval.approvalType] ?? approval.approvalType}
                    </Badge>
                    <Badge tone="blue">
                      {approvalStatusLabels[approval.status] ?? approval.status}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-semibold text-[#f1f1f4]">
                      {approval.ticket.ticketNumber} · {approval.ticket.subject}
                    </h3>
                    <p className="text-sm text-[#8b8ba0]">
                      {approval.ticket.company.name} ·{" "}
                      {categoryLabels[approval.ticket.category ?? ""] ?? "Pending"}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-3 rounded-2xl border border-white/6 bg-[#1e1e2a] p-4 text-sm text-[#8b8ba0]">
                    <div className="flex items-center justify-between gap-4">
                      <span>Priority</span>
                      <Badge tone={getPriorityTone(approval.ticket.priority)}>
                        {priorityLabels[approval.ticket.priority ?? ""] ?? "Pending"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Status</span>
                      <span className="font-medium">
                        {statusLabels[approval.ticket.status] ?? approval.ticket.status}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-[#f1f1f4]">Reason</div>
                      <div className="mt-1 leading-6 text-[#8b8ba0]">{approval.reason}</div>
                    </div>
                    <div className="text-[#5f5f78]">
                      Requested by {approval.requestedBy} · {formatDateTime(approval.requestedAt)}
                    </div>
                  </div>
                  <div className="mt-4">
                    <ApprovalDecisionForm approvalId={approval.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Decision History"
        description="Previous approval decisions remain visible for auditability and stakeholder confidence."
      >
        <div data-testid="decision-history-section">
          <div className="space-y-3">
            {decided.map((approval) => (
              <div
                key={approval.id}
                className="grid gap-3 rounded-2xl border border-white/6 bg-[#262635] p-4 md:grid-cols-[1fr_auto]"
                data-testid="decision-history-row"
              >
                <div>
                  <div className="font-medium text-[#f1f1f4]">
                    {approval.ticket.ticketNumber} · {approval.ticket.subject}
                  </div>
                  <div className="mt-1 text-sm text-[#8b8ba0]">
                    {approvalTypeLabels[approval.approvalType]} · {approval.ticket.company.name}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[#8b8ba0]">
                    {approval.approverName} {approval.status.toLowerCase()} this request.{" "}
                    {approval.decisionNotes}
                  </div>
                </div>
                <div className="flex flex-wrap items-start justify-end gap-2">
                  <Badge tone={approval.status === "APPROVED" ? "emerald" : "red"}>
                    {approvalStatusLabels[approval.status] ?? approval.status}
                  </Badge>
                  <Badge tone="slate">{formatDateTime(approval.decidedAt)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
