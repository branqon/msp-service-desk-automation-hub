# Feature Breakdown

## Dashboard

- KPI cards for processed tickets, AI-influenced routes, pending approvals, manual minutes saved, and SLA compliance
- Charts for ticket throughput, queue mix, and recurring issue categories
- High-risk ticket and strategic opportunity callouts

## Ticket Intake

- Captures company, requester, issue type, urgency, impact, description, and attachment placeholder
- Submits through a real server action
- Immediately generates triage, SLA, notes, customer draft, and approval checks

## Queue Workbench

- Ticket list with priority, queue, SLA risk, and status
- Detail panel with classification data, SLA targets, internal notes, workflow history, and audit trail
- Customer update review form and approval request form on the same screen

## Approval Center

- Pending approvals separated from historical decisions
- Demo decision form with approver identity and notes
- Approval types include procurement, tier 3 escalation, and controlled closure

## Automation Opportunities

- Scores recurring categories by fit, guardrails, and expected hours saved
- Helps position the repo as a strategic automation project, not only an incident operations dashboard

## API Surface

- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/metrics`

These routes are lightweight but useful for showing how the same domain logic could support external integrations.
