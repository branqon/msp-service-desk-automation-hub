"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { Button } from "@/components/ui/button";
import { decideApprovalAction, type ActionResult } from "@/lib/actions";

export function ApprovalDecisionForm({ approvalId }: { approvalId: string }) {
  const [state, action] = useActionState<ActionResult, FormData>(
    decideApprovalAction.bind(null, approvalId),
    {},
  );

  return (
    <form
      action={action}
      className="grid gap-4 rounded-[5px] border border-[var(--border)] bg-[var(--background)] p-4"
    >
      <FormAlert message={state.error} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-[11.5px]">
          <span className="font-medium text-[var(--muted)]">Approver</span>
          <input
            name="approverName"
            defaultValue="Service Delivery Manager"
            className="h-9 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
          />
        </label>
        <label className="grid gap-2 text-[11.5px]">
          <span className="font-medium text-[var(--muted)]">Decision Notes</span>
          <input
            name="decisionNotes"
            placeholder="Reason, budget context, or control note"
            className="h-9 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-3 text-[var(--ink)] placeholder:text-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
          />
        </label>
      </div>
      <div className="flex gap-3">
        <Button name="decision" value="APPROVED" size="sm">
          Approve
        </Button>
        <Button name="decision" value="REJECTED" variant="secondary" size="sm">
          Reject
        </Button>
      </div>
    </form>
  );
}
