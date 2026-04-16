# Feature Breakdown

## Dashboard

- KPI cards for processed tickets, AI-influenced routes, pending approvals, manual minutes saved, and SLA compliance
- Decision Support panels for approval aging and SLA risk by queue
- Active queue table with SLA countdowns, AI recommendations, and confidence tags
- High-risk ticket and strategic opportunity callouts

## Ticket Intake

- Captures company, requester, issue type, urgency, impact, description, and attachment placeholder
- Live inline validation: per-field error messages on blur, character counters for subject and description, and a submit button that stays disabled until the payload would pass server validation
- Submits through a Server Action that re-validates with Zod; server errors surface as a FormAlert at the top of the form
- Immediately generates triage, SLA, notes, customer draft, and approval checks

## Queue Workbench

- URL-driven filters for text search (subject, description, requester, company, ticket number), status, priority, and queue
- Server-side pagination with shareable `?page=&q=&status=` links; filter state is preserved when clicking into a ticket
- Ticket list with priority, queue, SLA risk, and status badges
- Detail panel with classification data, SLA targets, internal notes, workflow history, and audit trail
- Mobile-friendly collapsible filter disclosure that shows a count badge when filters are active

## Customer Update Review

- Side-by-side "Original AI draft" (read-only) and "Your revision" (editable) panes
- Live word-level diff highlights everything the reviewer added or removed, with `+added · −removed` word counts
- Collapses to a clean before/after block when the reviewer rewrites more than ~60% of the draft, to keep the view readable on heavy edits

## Approval Center

- Pending approvals separated from historical decisions
- Demo decision form with approver identity and notes
- Approval types include procurement, tier 3 escalation, and controlled closure
- Approval decisions flow back through Prisma and show up in the ticket's audit trail

## Automation Opportunities

- Scores recurring categories by fit, guardrails, and expected hours saved
- Current seeded volume per category is computed from the live ticket database, not hard-coded
- Helps position the repo as a strategic automation project, not only an incident operations dashboard

## Theming

- Light and dark themes wired through CSS custom properties and a sidebar toggle
- `prefers-color-scheme` fallback on first visit and `localStorage` persistence across sessions
- Inline init script prevents the flash-of-wrong-theme during hydration

## API Surface

- `GET /api/tickets` — supports `?q`, `?status`, `?priority`, `?queue`, `?page`, and `?pageSize` query params and returns a paginated envelope
- `POST /api/tickets` — validates payloads with Zod and returns `400 { error, fieldErrors }` on invalid input or `201 { id, ticketNumber }` on success
- `GET /api/metrics` — aggregated KPIs for dashboard consumers

These routes are lightweight but useful for showing how the same domain logic could support external integrations.
