"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { SectionCard } from "@/components/ui/section-card";
import { reviewCustomerUpdateAction, type ActionResult } from "@/lib/actions";

export function CustomerUpdateReviewForm({
  ticketId,
  currentDraft,
  reviewerName,
}: {
  ticketId: string;
  currentDraft: string;
  reviewerName?: string | null;
}) {
  const [state, action] = useActionState<ActionResult, FormData>(
    reviewCustomerUpdateAction.bind(null, ticketId),
    {},
  );

  return (
    <SectionCard
      title="Customer Update Draft"
      description="AI can draft the message, but a human reviews the final outbound update before send."
    >
      <form action={action} className="grid gap-4">
        <FormAlert message={state.error} />

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[#8b8ba0]">Draft</span>
          <textarea
            name="customerUpdateDraft"
            defaultValue={currentDraft}
            rows={5}
            className="rounded-2xl border border-white/10 bg-[#262635] px-4 py-3 text-[#f1f1f4]"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[#8b8ba0]">Reviewer Name</span>
            <input
              name="reviewerName"
              defaultValue={reviewerName ?? "Automation Hub Tech"}
              className="h-11 rounded-2xl border border-white/10 bg-[#262635] px-4 text-[#f1f1f4]"
            />
          </label>
          <div className="flex justify-end">
            <SubmitButton label="Record Review" pendingLabel="Saving..." />
          </div>
        </div>
      </form>
    </SectionCard>
  );
}
