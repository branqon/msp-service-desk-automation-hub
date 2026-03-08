# Workflow Design Notes

## Design Principles

- Keep deterministic rules visible instead of hiding all decision-making behind an opaque model
- Use AI where it reduces repetitive operational work
- Preserve human approval for actions with financial, escalation, or closure risk
- Make every decision auditable

## Triage Pattern

The triage engine has two layers:

1. Rule-based classification
   Maps issue type, urgency, impact, and VIP context to a baseline category, queue, and priority.
2. AI-assisted recommendation
   Adjusts the baseline when the ticket narrative suggests broader impact, executive sensitivity, business workflow blockage, or security risk.

The UI shows both layers and the final routing decision.

## SLA Pattern

SLA selection is intentionally simple and believable:

- issue-specific profiles take precedence
- otherwise, priority-based fallback profiles apply

This keeps local setup lightweight while still reflecting how service delivery policies are commonly modeled.

## Approval Pattern

The app treats approvals as first-class workflow objects rather than a status flag on the ticket.

That matters because it allows:

- requester attribution
- approver attribution
- decision timestamps
- reason and decision notes
- auditable workflow history

## Reporting Pattern

The dashboard and opportunity views are computed from the same seeded operational data rather than from hard-coded chart values.

That makes the reporting layer credible in screenshots and easier to explain during interviews.

## Workflow Artifacts

Sample workflow definitions live in [`workflows/exports`](../workflows/exports):

- `ticket-intake-triage-routing.json`
- `approval-gated-escalation.json`
- `customer-update-review-loop.json`
- `daily-ops-reporting-rollup.json`

These are mock exports, but they are structured to communicate how the product logic could be mapped into an automation platform.
