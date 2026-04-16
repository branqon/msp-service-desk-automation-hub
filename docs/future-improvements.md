# Future Improvements

## Current Tradeoffs

- SQLite keeps local setup easy, but Postgres would be the more natural production option
- The AI layer is mocked to keep the repo runnable without external credentials
- Authentication is intentionally omitted so the repo stays easy to demo locally
- Queue filter state lives in the URL and database; there is no per-user "saved view" or "my open tickets" concept yet
- The word-level diff on the customer-update review collapses to a full replacement view when the reviewer rewrites more than ~60% of the draft — a sentence-level diff would be less coarse but also less precise

## Near-Term

- Add authentication and role-based access for dispatcher, technician, approver, and manager personas
- Add per-user saved queue views on top of the existing URL-driven filters
- Add exportable weekly operations summaries
- Add richer trend reporting over 30- and 90-day windows (the dashboard currently shows point-in-time KPIs only)

## Integration-Oriented

- Replace mocked AI provider with an actual model adapter
- Add webhook ingestion from a PSA or email parser
- Sync approvals to Teams, Slack, or email actions
- Push ticket state changes to a mocked ConnectWise-style outbound connector

## Technical

- Expand automated coverage for dashboard aggregations, negative-path approval flows, and axe-core accessibility scans in the Playwright suite
- Offer Postgres as an alternate production-style runtime profile
- Introduce background job processing for report generation and notifications
- Promote the custom HTML "Decision Support" grids on the dashboard to interactive Recharts components with tooltips and legends
