"use client";

import { useActionState, useMemo, useState } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { SectionCard } from "@/components/ui/section-card";
import { reviewCustomerUpdateAction, type ActionResult } from "@/lib/actions";
import { diffCounts, wordDiff } from "@/lib/diff";

export function CustomerUpdateReviewForm({
  ticketId,
  currentDraft,
  aiDraft,
  reviewerName,
}: {
  ticketId: string;
  currentDraft: string;
  aiDraft: string;
  reviewerName?: string | null;
}) {
  const [state, action] = useActionState<ActionResult, FormData>(
    reviewCustomerUpdateAction.bind(null, ticketId),
    {},
  );

  const [revision, setRevision] = useState(currentDraft);

  const segments = useMemo(() => wordDiff(aiDraft, revision), [aiDraft, revision]);
  const counts = useMemo(() => diffCounts(segments), [segments]);
  const isUnchanged = counts.added === 0 && counts.removed === 0;

  return (
    <SectionCard
      title="Customer Update Draft"
      description="AI can draft the message, but a human reviews the final outbound update before send."
    >
      <form action={action} className="grid gap-4">
        <FormAlert message={state.error} />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--faint)]">
                Original AI draft
              </span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--whisper)]">
                read-only
              </span>
            </div>
            <div className="min-h-[140px] rounded-[5px] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[13px] leading-6 text-[var(--muted)]">
              {aiDraft || "No AI draft available."}
            </div>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-60)]">
                Your revision
              </span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--faint)]">
                editable
              </span>
            </span>
            <textarea
              name="customerUpdateDraft"
              rows={6}
              value={revision}
              onChange={(event) => setRevision(event.target.value)}
              className="min-h-[140px] rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[13px] leading-6 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
            />
          </label>
        </div>

        <div className="rounded-[5px] border border-[var(--border)] bg-[var(--background)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--faint)]">
              Reviewer diff
            </span>
            {isUnchanged ? (
              <span className="text-[10.5px] text-[var(--faint)]">
                No edits yet
              </span>
            ) : (
              <span className="text-[10.5px] text-[var(--muted)]">
                <span className="text-[var(--green)]">+{counts.added}</span>
                <span aria-hidden="true"> · </span>
                <span className="text-[var(--red)]">{"\u2212"}{counts.removed}</span>
              </span>
            )}
          </div>
          <p
            className="mt-2 whitespace-pre-wrap text-[13px] leading-6 text-[var(--muted)]"
            aria-label="Diff preview"
          >
            {segments.map((segment, index) => {
              if (segment.type === "equal") {
                return <span key={index}>{segment.value}</span>;
              }

              if (segment.type === "added") {
                return (
                  <span
                    key={index}
                    className="rounded-[3px] bg-[var(--green-bg)] px-0.5 text-[var(--green)]"
                  >
                    {segment.value}
                  </span>
                );
              }

              return (
                <span
                  key={index}
                  className="rounded-[3px] bg-[var(--red-bg)] px-0.5 text-[var(--red)] line-through decoration-[var(--red)]/70"
                >
                  {segment.value}
                </span>
              );
            })}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--muted)]">Reviewer Name</span>
            <input
              name="reviewerName"
              defaultValue={reviewerName ?? "Automation Hub Tech"}
              className="h-11 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
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
