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
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 py-3">
        <div>
          <h1 className="text-[13px] font-semibold text-[var(--ink)]">Approval Gate</h1>
          <p className="text-[11px] text-[var(--faint)]">
            {pending.length} pending &middot; {decided.length} decided
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--border)]">
        <div className="bg-[var(--card)] px-5 py-3.5">
          <div className="text-xl font-bold tracking-tight text-[var(--ink)]">{pending.length}</div>
          <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--whisper)]">
            Pending Approvals
          </div>
          <p className="mt-0.5 text-[10.5px] text-[var(--faint)]">
            Waiting on ops lead, service manager, or budget owner.
          </p>
        </div>
        <div className="bg-[var(--card)] px-5 py-3.5">
          <div className="text-xl font-bold tracking-tight text-[var(--green)]">
            {decided.filter((approval) => approval.status === "APPROVED").length}
          </div>
          <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--whisper)]">
            Approved Decisions
          </div>
          <p className="mt-0.5 text-[10.5px] text-[var(--faint)]">
            Cleared by authorized approver with recorded notes.
          </p>
        </div>
        <div className="bg-[var(--card)] px-5 py-3.5">
          <div className="text-xl font-bold tracking-tight text-[var(--red)]">
            {decided.filter((approval) => approval.status === "REJECTED").length}
          </div>
          <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--whisper)]">
            Rejected Decisions
          </div>
          <p className="mt-0.5 text-[10.5px] text-[var(--faint)]">
            Denied with documented rationale for audit visibility.
          </p>
        </div>
      </div>

      <SectionCard
        title="Pending Review"
        description="Open approvals waiting on an operations lead, service manager, or budget owner."
      >
        <div data-testid="pending-review-section">
          {pending.length === 0 ? (
            <EmptyState title="No pending approvals">
              The queue is clear right now. Approved and rejected decisions remain below for audit reference.
            </EmptyState>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {pending.map((approval) => (
                <div
                  key={approval.id}
                  className="rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-5"
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
                    <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                      {approval.ticket.ticketNumber} &middot; {approval.ticket.subject}
                    </h3>
                    <p className="text-[11px] text-[var(--muted)]">
                      {approval.ticket.company.name} &middot;{" "}
                      {categoryLabels[approval.ticket.category ?? ""] ?? "Pending"}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-3 rounded-[5px] border border-[var(--border)] bg-[var(--background)] p-4 text-[11.5px] text-[var(--muted)]">
                    <div className="flex items-center justify-between gap-4">
                      <span>Priority</span>
                      <Badge tone={getPriorityTone(approval.ticket.priority)}>
                        {priorityLabels[approval.ticket.priority ?? ""] ?? "Pending"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Status</span>
                      <span className="font-medium text-[var(--ink)]">
                        {statusLabels[approval.ticket.status] ?? approval.ticket.status}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-[var(--ink)]">Reason</div>
                      <div className="mt-1 leading-6 text-[var(--muted)]">{approval.reason}</div>
                    </div>
                    <div className="text-[var(--faint)]">
                      Requested by {approval.requestedBy} &middot; {formatDateTime(approval.requestedAt)}
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
                className="grid gap-3 rounded-[6px] border border-[var(--border)] bg-[var(--card)] p-4 md:grid-cols-[1fr_auto]"
                data-testid="decision-history-row"
              >
                <div>
                  <div className="text-[12.5px] font-medium text-[var(--ink)]">
                    {approval.ticket.ticketNumber} &middot; {approval.ticket.subject}
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--muted)]">
                    {approvalTypeLabels[approval.approvalType]} &middot; {approval.ticket.company.name}
                  </div>
                  <div className="mt-2 text-[11px] leading-6 text-[var(--muted)]">
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
