"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { SectionCard } from "@/components/ui/section-card";
import { requestApprovalAction, type ActionResult } from "@/lib/actions";
import { approvalTypeLabels } from "@/lib/constants";

export function ApprovalRequestForm({ ticketId }: { ticketId: string }) {
  const [state, action] = useActionState<ActionResult, FormData>(
    requestApprovalAction.bind(null, ticketId),
    {},
  );

  return (
    <SectionCard
      title="Request Approval"
      description="Sensitive actions stay gated behind a technician-authored approval request."
    >
      <form action={action} className="grid gap-4">
        <FormAlert message={state.error} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-700">Approval Type</span>
            <select
              name="approvalType"
              className="h-11 rounded-2xl border border-slate-300 bg-white px-4 text-slate-900"
              defaultValue="TIER3_ESCALATION"
            >
              {Object.entries(approvalTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-700">Requested By</span>
            <input
              name="requestedBy"
              defaultValue="Automation Hub Tech"
              className="h-11 rounded-2xl border border-slate-300 bg-white px-4 text-slate-900"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-slate-700">Reason</span>
          <textarea
            name="reason"
            rows={3}
            required
            placeholder="Explain why the action requires approval and what business risk it addresses."
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900"
          />
        </label>
        <div className="flex justify-end">
          <SubmitButton label="Queue Approval" pendingLabel="Queuing..." variant="secondary" />
        </div>
      </form>
    </SectionCard>
  );
}
