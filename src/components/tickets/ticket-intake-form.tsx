"use client";

import { useActionState, useMemo, useState } from "react";

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
import { cn } from "@/lib/utils";

const SUBJECT_MIN = 6;
const SUBJECT_MAX = 120;
const DESCRIPTION_MIN = 20;
const DESCRIPTION_MAX = 2000;
const NAME_MIN = 2;
const NAME_MAX = 80;
const TITLE_MIN = 2;
const TITLE_MAX = 80;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "h-11 rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20";
const inputErrorClass =
  "border-[var(--red)] focus:ring-[var(--red)]/25";
const hintClass = "text-[10.5px] leading-4 text-[var(--faint)]";
const errorClass = "text-[10.5px] leading-4 text-[var(--red)]";

type FieldKey =
  | "companyId"
  | "requesterName"
  | "requesterEmail"
  | "requesterTitle"
  | "subject"
  | "description";

type Touched = Partial<Record<FieldKey, boolean>>;

function validate(values: {
  companyId: string;
  requesterName: string;
  requesterEmail: string;
  requesterTitle: string;
  subject: string;
  description: string;
}): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};

  if (!values.companyId) {
    errors.companyId = "Select a customer.";
  }
  if (values.requesterName.trim().length < NAME_MIN) {
    errors.requesterName = `At least ${NAME_MIN} characters.`;
  } else if (values.requesterName.length > NAME_MAX) {
    errors.requesterName = `At most ${NAME_MAX} characters.`;
  }
  if (!emailPattern.test(values.requesterEmail)) {
    errors.requesterEmail = "Enter a valid email address.";
  }
  if (values.requesterTitle.trim().length < TITLE_MIN) {
    errors.requesterTitle = `At least ${TITLE_MIN} characters.`;
  } else if (values.requesterTitle.length > TITLE_MAX) {
    errors.requesterTitle = `At most ${TITLE_MAX} characters.`;
  }
  if (values.subject.trim().length < SUBJECT_MIN) {
    errors.subject = `At least ${SUBJECT_MIN} characters.`;
  } else if (values.subject.length > SUBJECT_MAX) {
    errors.subject = `At most ${SUBJECT_MAX} characters.`;
  }
  if (values.description.trim().length < DESCRIPTION_MIN) {
    errors.description = `At least ${DESCRIPTION_MIN} characters.`;
  } else if (values.description.length > DESCRIPTION_MAX) {
    errors.description = `At most ${DESCRIPTION_MAX} characters.`;
  }

  return errors;
}

export function TicketIntakeForm({
  companies,
}: {
  companies: Array<{ id: string; name: string; vertical: string; slaTier: string }>;
}) {
  const [state, action] = useActionState<ActionResult, FormData>(createTicketAction, {});

  const [values, setValues] = useState({
    companyId: "",
    requesterName: "",
    requesterEmail: "",
    requesterTitle: "",
    subject: "",
    description: "",
  });
  const [touched, setTouched] = useState<Touched>({});

  const errors = useMemo(() => validate(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  const update = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const blur = (key: FieldKey) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const showError = (key: FieldKey) => touched[key] && errors[key];

  const descriptionCount = values.description.length;
  const descriptionCounterTone =
    descriptionCount === 0
      ? "text-[var(--faint)]"
      : descriptionCount < DESCRIPTION_MIN
        ? "text-[var(--amber)]"
        : descriptionCount > DESCRIPTION_MAX
          ? "text-[var(--red)]"
          : "text-[var(--green)]";

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <SectionCard
        title="Ticket Intake"
        description="Submit a realistic inbound MSP ticket and let the automation layer run triage, SLA matching, notes, and approvals."
      >
        <form action={action} noValidate className="grid gap-5">
          <FormAlert message={state.error} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">
                Company <span aria-hidden="true" className="text-[var(--red)]">*</span>
              </span>
              <select
                name="companyId"
                value={values.companyId}
                onChange={(event) => update("companyId", event.target.value)}
                onBlur={() => blur("companyId")}
                aria-invalid={showError("companyId") ? "true" : undefined}
                aria-describedby={showError("companyId") ? "companyId-error" : undefined}
                required
                className={cn(inputClass, showError("companyId") && inputErrorClass)}
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
              {showError("companyId") ? (
                <span id="companyId-error" className={errorClass}>
                  {errors.companyId}
                </span>
              ) : null}
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">Issue Type</span>
              <select
                name="issueType"
                required
                className={inputClass}
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
              <span className="font-medium text-[var(--muted)]">
                Requester Name <span aria-hidden="true" className="text-[var(--red)]">*</span>
              </span>
              <input
                name="requesterName"
                required
                placeholder="Elena Torres"
                value={values.requesterName}
                onChange={(event) => update("requesterName", event.target.value)}
                onBlur={() => blur("requesterName")}
                aria-invalid={showError("requesterName") ? "true" : undefined}
                aria-describedby={
                  showError("requesterName") ? "requesterName-error" : undefined
                }
                className={cn(inputClass, showError("requesterName") && inputErrorClass)}
              />
              {showError("requesterName") ? (
                <span id="requesterName-error" className={errorClass}>
                  {errors.requesterName}
                </span>
              ) : null}
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">
                Requester Email <span aria-hidden="true" className="text-[var(--red)]">*</span>
              </span>
              <input
                name="requesterEmail"
                type="email"
                required
                placeholder="elena.torres@customer.example"
                value={values.requesterEmail}
                onChange={(event) => update("requesterEmail", event.target.value)}
                onBlur={() => blur("requesterEmail")}
                aria-invalid={showError("requesterEmail") ? "true" : undefined}
                aria-describedby={
                  showError("requesterEmail") ? "requesterEmail-error" : undefined
                }
                className={cn(inputClass, showError("requesterEmail") && inputErrorClass)}
              />
              {showError("requesterEmail") ? (
                <span id="requesterEmail-error" className={errorClass}>
                  {errors.requesterEmail}
                </span>
              ) : null}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">
                Requester Title <span aria-hidden="true" className="text-[var(--red)]">*</span>
              </span>
              <input
                name="requesterTitle"
                required
                placeholder="HR Generalist"
                value={values.requesterTitle}
                onChange={(event) => update("requesterTitle", event.target.value)}
                onBlur={() => blur("requesterTitle")}
                aria-invalid={showError("requesterTitle") ? "true" : undefined}
                aria-describedby={
                  showError("requesterTitle") ? "requesterTitle-error" : undefined
                }
                className={cn(inputClass, showError("requesterTitle") && inputErrorClass)}
              />
              {showError("requesterTitle") ? (
                <span id="requesterTitle-error" className={errorClass}>
                  {errors.requesterTitle}
                </span>
              ) : null}
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

          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <label htmlFor="intake-subject" className="font-medium text-[var(--muted)]">
                Subject <span aria-hidden="true" className="text-[var(--red)]">*</span>
              </label>
              <span aria-hidden="true" className={hintClass}>
                {values.subject.length}/{SUBJECT_MAX}
              </span>
            </div>
            <input
              id="intake-subject"
              name="subject"
              required
              placeholder="New assistant principal starts Monday with no account bundle"
              value={values.subject}
              onChange={(event) => update("subject", event.target.value)}
              onBlur={() => blur("subject")}
              aria-invalid={showError("subject") ? "true" : undefined}
              aria-describedby={showError("subject") ? "subject-error" : "subject-hint"}
              className={cn(inputClass, showError("subject") && inputErrorClass)}
              maxLength={SUBJECT_MAX}
            />
            {showError("subject") ? (
              <span id="subject-error" className={errorClass}>
                {errors.subject}
              </span>
            ) : (
              <span id="subject-hint" className={hintClass}>
                A short headline the dispatcher reads first.
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">Urgency</span>
              <select
                name="urgency"
                className={inputClass}
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
                className={inputClass}
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

          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <label htmlFor="intake-description" className="font-medium text-[var(--muted)]">
                Description <span aria-hidden="true" className="text-[var(--red)]">*</span>
              </label>
              <span aria-hidden="true" className={cn("text-[10.5px] leading-4", descriptionCounterTone)}>
                {descriptionCount}/{DESCRIPTION_MAX} · min {DESCRIPTION_MIN}
              </span>
            </div>
            <textarea
              id="intake-description"
              name="description"
              required
              rows={6}
              placeholder="Describe what the user sees, the operational scope, and any timing constraints."
              value={values.description}
              onChange={(event) => update("description", event.target.value)}
              onBlur={() => blur("description")}
              aria-invalid={showError("description") ? "true" : undefined}
              aria-describedby={
                showError("description") ? "description-error" : "description-hint"
              }
              className={cn(
                "rounded-[5px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20",
                showError("description") && inputErrorClass,
              )}
              maxLength={DESCRIPTION_MAX}
            />
            {showError("description") ? (
              <span id="description-error" className={errorClass}>
                {errors.description}
              </span>
            ) : (
              <span id="description-hint" className={hintClass}>
                Describe what the user sees, the scope, and any deadline. Minimum {DESCRIPTION_MIN} characters.
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-[var(--muted)]">Attachment Placeholder</span>
              <input
                name="attachmentsNote"
                placeholder="onboarding-checklist.pdf"
                className={inputClass}
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
            <SubmitButton
              label="Submit Ticket"
              pendingLabel="Submitting..."
              disabled={!isValid}
            />
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
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-semibold text-[var(--background)]">
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
