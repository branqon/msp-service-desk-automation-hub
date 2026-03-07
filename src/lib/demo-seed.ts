import type { AutomationOpportunity, Company, SlaProfile } from "@prisma/client";

export const companySeedData = [
  {
    name: "Northwind Health Group",
    vertical: "Healthcare",
    slaTier: "PLATINUM",
  },
  {
    name: "Grayline Manufacturing",
    vertical: "Manufacturing",
    slaTier: "GOLD",
  },
  {
    name: "Harbor Legal Partners",
    vertical: "Legal",
    slaTier: "PLATINUM",
  },
  {
    name: "Summit Charter Schools",
    vertical: "Education",
    slaTier: "GOLD",
  },
  {
    name: "Redwood Property Management",
    vertical: "Real Estate",
    slaTier: "SILVER",
  },
] satisfies Array<Pick<Company, "name" | "vertical" | "slaTier">>;

export const slaProfileSeedData: Array<
  Pick<
    SlaProfile,
    | "name"
    | "priority"
    | "issueType"
    | "responseTargetMinutes"
    | "resolutionTargetMinutes"
    | "escalationPolicy"
  >
> = [
  {
    name: "Critical Incident",
    priority: "P1_CRITICAL",
    issueType: null,
    responseTargetMinutes: 15,
    resolutionTargetMinutes: 240,
    escalationPolicy: "Notify on-call lead and service delivery manager immediately.",
  },
  {
    name: "Security Containment",
    priority: "P1_CRITICAL",
    issueType: "SECURITY_ESCALATION",
    responseTargetMinutes: 15,
    resolutionTargetMinutes: 120,
    escalationPolicy: "Engage security operations and customer leadership immediately.",
  },
  {
    name: "High Impact Access",
    priority: "P2_HIGH",
    issueType: null,
    responseTargetMinutes: 30,
    resolutionTargetMinutes: 480,
    escalationPolicy: "Escalate to queue lead if response target is missed.",
  },
  {
    name: "Standard Service",
    priority: "P3_MEDIUM",
    issueType: null,
    responseTargetMinutes: 60,
    resolutionTargetMinutes: 1440,
    escalationPolicy: "Hand off within service desk or specialist queue within the same business day.",
  },
  {
    name: "Procurement Review",
    priority: "P4_LOW",
    issueType: "PROCUREMENT_REQUEST",
    responseTargetMinutes: 240,
    resolutionTargetMinutes: 4320,
    escalationPolicy: "Require approval before vendor or purchasing action.",
  },
  {
    name: "Routine Request",
    priority: "P4_LOW",
    issueType: null,
    responseTargetMinutes: 240,
    resolutionTargetMinutes: 2880,
    escalationPolicy: "Resolve within standard business queue capacity.",
  },
];

export const automationOpportunitySeedData: Array<
  Omit<AutomationOpportunity, "id" | "createdAt" | "updatedAt">
> = [
  {
    category: "IDENTITY_ACCESS",
    monthlyTicketVolume: 46,
    automationFitScore: 92,
    estimatedMonthlyHoursSaved: 21,
    requiresHumanApproval: false,
    guardrails: "Require identity verification before password or MFA actions are executed.",
    recommendedPlaybook: "Self-service credential reset with automated account unlock and post-action audit.",
    rationale:
      "High repeatability, low variance, and strong policy boundaries make identity work the best automation starting point.",
  },
  {
    category: "PROCUREMENT",
    monthlyTicketVolume: 14,
    automationFitScore: 78,
    estimatedMonthlyHoursSaved: 11,
    requiresHumanApproval: true,
    guardrails: "Budget owner, approver identity, and catalog validation must remain human-controlled.",
    recommendedPlaybook: "Approval-driven procurement intake with standard catalog suggestion and vendor handoff.",
    rationale:
      "Procurement requests are structured and repeatable, but financial control points should stay human-in-loop.",
  },
  {
    category: "COLLABORATION",
    monthlyTicketVolume: 19,
    automationFitScore: 74,
    estimatedMonthlyHoursSaved: 9,
    requiresHumanApproval: false,
    guardrails: "Escalate executive or customer-wide mail flow issues before automated remediation.",
    recommendedPlaybook: "Automated mail trace, rule inspection, and draft response generation.",
    rationale:
      "Email delivery work shows consistent evidence-gathering steps that pair well with assisted diagnostics.",
  },
  {
    category: "NETWORK",
    monthlyTicketVolume: 22,
    automationFitScore: 68,
    estimatedMonthlyHoursSaved: 8,
    requiresHumanApproval: true,
    guardrails: "Do not automate circuit changes or VPN policy edits without approval.",
    recommendedPlaybook: "Automated outage enrichment and vendor-ready incident packet creation.",
    rationale:
      "Network incidents benefit from structured enrichment, but remediation risk is too high for hands-off execution.",
  },
];
