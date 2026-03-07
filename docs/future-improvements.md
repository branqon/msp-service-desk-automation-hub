# Future Improvements

## Near-Term

- Add authentication and role-based access for dispatcher, technician, approver, and manager personas
- Add saved queue filters and customer-specific views
- Add exportable weekly operations summaries
- Add richer trend reporting over 30- and 90-day windows

## Integration-Oriented

- Replace mocked AI provider with an actual model adapter
- Add webhook ingestion from a PSA or email parser
- Sync approvals to Teams, Slack, or email actions
- Push ticket state changes to a mocked ConnectWise-style outbound connector

## Technical

- Add automated tests for triage logic and approval workflows
- Add pagination and server-side filtering for larger datasets
- Offer Postgres as an alternate production-style runtime profile
- Introduce background job processing for report generation and notifications
