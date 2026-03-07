# Project Overview

## Summary

`msp-service-desk-automation-hub` is a portfolio-grade internal operations demo that simulates how an MSP could automate service desk workflows without removing human accountability.

The project is designed to feel credible to:

- AI Automation Engineer hiring managers
- Solutions Engineers evaluating workflow thinking
- Technical leaders looking for operational realism rather than chatbot demos

## What The Demo Shows

- Structured ticket intake for realistic MSP support scenarios
- Deterministic triage rules blended with AI-assisted recommendations
- SLA assignment and overdue-risk visibility
- Internal technician notes and customer update drafts
- Approval-gated actions for higher-risk operations
- Workflow history, auditability, and metrics reporting
- Strategic automation opportunity analysis based on ticket patterns

## Why It Feels Real

- The data model reflects actual service operations concepts: tickets, approvals, SLA profiles, workflow runs, audit events, and automation opportunities.
- The seeded tickets cover common MSP issue types instead of generic placeholder incidents.
- Every major action records whether it was rule-based, AI-assisted, human-approved, or manual.
- External systems are mocked cleanly so the repository stays runnable without paid services or private credentials.

## Demo Boundary

This is not trying to be a full PSA replacement. It focuses on the automation layer around service desk operations:

- intake
- triage
- communication drafting
- approval handling
- reporting

That scope keeps the project believable, inspectable, and easy to demo locally.
