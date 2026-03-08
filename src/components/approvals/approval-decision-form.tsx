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
      className="grid gap-4 rounded-2xl border border-white/6 bg-[#262635] p-4"
    >
      <FormAlert message={state.error} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[#8b8ba0]">Approver</span>
          <input
            name="approverName"
            defaultValue="Service Delivery Manager"
            className="h-10 rounded-xl border border-white/10 bg-[#262635] px-3 text-[#f1f1f4]"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[#8b8ba0]">Decision Notes</span>
          <input
            name="decisionNotes"
            placeholder="Reason, budget context, or control note"
            className="h-10 rounded-xl border border-white/10 bg-[#262635] px-3 text-[#f1f1f4]"
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
