# Demo Walkthrough

## Suggested Flow

1. Start on the dashboard and explain the KPI story: processed volume, AI-influenced routes, approvals, time saved, and SLA compliance. Point out the Decision Support panels (approval aging, SLA risk heat map) as near-term triage signals.
2. Open the queue workbench. Use the search box and status/priority/queue filters to narrow the list — the URL reflects the filter state so the view is shareable. Show pagination if the dataset grows.
3. Select a ticket. In the detail panel, walk through triage (rule engine vs. AI suggestion vs. final route), the SLA targets, the internal technician note, the workflow history, and the audit trail.
4. Scroll to the Customer Update Draft. Show the side-by-side "Original AI draft" / "Your revision" view and edit the revision live — the reviewer diff below highlights exactly which words were added or removed before the update would be sent.
5. Switch to the approvals page and show a pending approval plus a historical decision. Reject or approve one to land a fresh row in Decision History.
6. Toggle the theme from the sidebar to show the dark-mode variant. The whole app re-themes in place; no reload needed and no flash of wrong theme.
7. Open the automation opportunities page and explain how the same operational data informs future automation investment.
8. Submit a new intake ticket to show the workflow creating a fresh routed record, including the live inline validation UX on the intake form.

## Example Workflow Lifecycle

Example: `LOB application issue affecting shipping`

1. Intake captures company, requester, urgency, impact, and ticket narrative; inline validation blocks malformed input before submission.
2. Rule engine classifies the issue as a business application problem and routes it to tier 3 applications.
3. AI recommendation raises confidence because the description shows a core business workflow impact.
4. SLA profile is assigned based on ticket priority.
5. Internal note and customer update draft are generated automatically. The AI draft is preserved so the reviewer diff stays meaningful even after edits land.
6. Technician tweaks the customer update draft; the reviewer diff records exactly what changed before the update is marked reviewed.
7. Technician requests a tier 3 escalation approval.
8. Approver records a decision.
9. Workflow run history and audit events preserve the full trail.
10. The ticket contributes to both operational KPIs and strategic automation opportunity reporting.
