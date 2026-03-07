# System Architecture

```mermaid
flowchart LR
    A[Dispatcher / Technician / Service Lead] --> B[Next.js App Router UI]
    B --> C[Server Actions and API Routes]
    C --> D[Service Desk Automation Layer]
    D --> E[Rule Engine]
    D --> F[Mock AI Provider]
    D --> G[Approval Gate Logic]
    D --> H[Reporting Aggregator]
    D --> I[Prisma ORM]
    I --> J[(SQLite Demo Database)]
    J --> K[Ticket / Approval / Audit / Workflow Data]

    L[Mocked External Systems]
    L --> M[PSA / Ticket Source]
    L --> N[Identity Platform]
    L --> O[Email / Messaging]
    L --> P[Procurement / Vendor Flow]

    C -. future integration .-> L
    Q[Workflow JSON Exports] --> D
```

## Notes

- The web UI is intentionally internal-tool oriented: dense, fast to scan, and built around operational decision-making.
- `Server Actions` drive the in-app forms, while `API Routes` expose the same logic for mock integration scenarios.
- The automation layer keeps deterministic rules and AI-assisted recommendations separate so the decision path remains inspectable.
- SQLite keeps local setup friction low while still giving the project a credible relational data model.
- Workflow JSON exports in [`workflows/exports`](../workflows/exports) show how the same flow could be represented in an automation platform such as n8n.
