"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { SectionCard } from "@/components/ui/section-card";
import { createTicketAction, type ActionResult } from "@/lib/actions";
import {
  impactLabels,
  issueTypeLabels,
  urgencyLabels,
  workflowLifecycle,
} from "@/lib/constants";

export function TicketIntakeForm({
  companies,
}: {
  companies: Array<{ id: string; name: string; vertical: string; slaTier: string }>;
}) {
  const [state, action] = useActionState<ActionResult, FormData>(createTicketAction, {});

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <SectionCard
        title="Ticket Intake"
        description="Submit a realistic inbound MSP ticket and let the automation layer run triage, SLA matching, notes, and approvals."
      >
        <form action={action} className="grid gap-5">
          <FormAlert message={state.error} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">Company</span>
              <select
                name="companyId"
                required
                className="h-11 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 text-[var(--ink)]"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a customer
                </option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} · {company.vertical} · {company.slaTier}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">Issue Type</span>
              <select
                name="issueType"
                required
                className="h-11 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 text-[var(--ink)]"
                defaultValue="PASSWORD_RESET"
              >
                {Object.entries(issueTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">Requester Name</span>
              <input
                name="requesterName"
                required
                placeholder="Elena Torres"
                className="h-11 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 text-[var(--ink)]"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">Requester Email</span>
              <input
                name="requesterEmail"
                type="email"
                required
                placeholder="elena.torres@customer.example"
                className="h-11 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 text-[var(--ink)]"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">Requester Title</span>
              <input
                name="requesterTitle"
                required
                placeholder="HR Generalist"
                className="h-11 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 text-[var(--ink)]"
              />
            </label>
            <label className="flex min-h-11 items-center gap-3 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                name="requesterVip"
                className="h-4 w-4 rounded border-[var(--border)]"
              />
              Mark requester as VIP
            </label>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--muted)]">Subject</span>
            <input
              name="subject"
              required
              placeholder="New assistant principal starts Monday with no account bundle"
              className="h-11 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 text-[var(--ink)]"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">Urgency</span>
              <select
                name="urgency"
                className="h-11 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 text-[var(--ink)]"
                defaultValue="HIGH"
              >
                {Object.entries(urgencyLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">Impact</span>
              <select
                name="impact"
                className="h-11 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 text-[var(--ink)]"
                defaultValue="DEPARTMENT"
              >
                {Object.entries(impactLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-[var(--muted)]">Description</span>
            <textarea
              name="description"
              required
              rows={6}
              placeholder="Provide the operational impact, what the user sees, and any timing constraints."
              className="rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--ink)]"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">Attachment Placeholder</span>
              <input
                name="attachmentsNote"
                placeholder="onboarding-checklist.pdf"
                className="h-11 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 text-[var(--ink)]"
              />
            </label>
            <div className="rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]">
              <div className="font-medium text-[var(--muted)]">Created Time</div>
              <div className="mt-1">Captured at submission time in the demo workflow.</div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] pt-4">
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              On submit, the app runs deterministic triage, AI-assisted recommendations, SLA assignment,
              internal note generation, customer update drafting, and approval checks.
            </p>
            <SubmitButton label="Submit Ticket" pendingLabel="Submitting..." />
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Automation Lifecycle"
        description="What the intake workflow executes immediately after submission."
      >
        <div className="space-y-4">
          {workflowLifecycle.map((step, index) => (
            <div
              key={step.title}
              className="rounded-[5px] border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="text-sm font-semibold text-[var(--ink)]">{step.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{step.description}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
