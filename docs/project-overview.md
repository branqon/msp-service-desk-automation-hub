# Project Overview

## Summary

`msp-service-desk-automation-hub` is an internal operations demo that simulates how an MSP could automate service desk workflows without removing human accountability. It pairs deterministic routing with AI-assisted recommendations and keeps sensitive actions behind explicit approval and review steps.

## What The Demo Shows

- Structured ticket intake with live inline validation and a server-validated submit path
- Deterministic triage rules blended with AI-assisted recommendations
- SLA assignment and overdue-risk visibility on both the dashboard and each ticket
- Internal technician notes and a customer update draft with a side-by-side reviewer diff
- Queue workbench with URL-driven search, status/priority/queue filters, and server-side pagination
- Approval-gated actions for procurement, tier 3 escalation, and controlled closure
- Workflow history, auditability, and metrics reporting
- Strategic automation opportunity analysis based on ticket patterns
- Light and dark themes with a sidebar toggle

## Why It Feels Real

- The data model reflects actual service operations concepts: tickets, approvals, SLA profiles, workflow runs, audit events, and automation opportunities.
- Seeded tickets cover common MSP issue types rather than generic placeholder incidents.
- Every major action records whether it was rule-based, AI-assisted, human-approved, or manual.
- External systems are mocked cleanly so the repository stays runnable without paid services or private credentials.
- Zod validates payloads at every boundary (intake form, Server Actions, `POST /api/tickets`).

## Demo Boundary

This is not trying to be a full PSA replacement. It focuses on the automation layer around service desk operations:

- intake
- triage
- communication drafting
- approval handling
- reporting

That scope keeps the project believable, inspectable, and easy to demo locally.
