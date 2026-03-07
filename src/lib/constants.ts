export type BadgeTone =
  | "slate"
  | "blue"
  | "amber"
  | "red"
  | "emerald"
  | "teal";

export const navigationItems = [
  { href: "/", label: "Dashboard", caption: "Metrics and workflow health" },
  { href: "/tickets", label: "Tickets", caption: "Queue and ticket detail" },
  { href: "/tickets/new", label: "Intake", caption: "Submit inbound work" },
  { href: "/approvals", label: "Approvals", caption: "Human-in-loop actions" },
  {
    href: "/automation-opportunities",
    label: "Automation Opportunities",
    caption: "Strategic backlog and ROI",
  },
] as const;

export const issueTypeLabels: Record<string, string> = {
  PASSWORD_RESET: "Password Reset",
  MFA_ISSUE: "MFA Issue",
  PRINTER_PROBLEM: "Printer Problem",
  USER_ONBOARDING: "New User Onboarding",
  PROCUREMENT_REQUEST: "Procurement Request",
  INTERNET_OUTAGE: "Internet Outage",
  EMAIL_DELIVERY: "Email Delivery Issue",
  VPN_ACCESS: "VPN Access Issue",
  LOB_APPLICATION: "LOB Application Issue",
  SECURITY_ESCALATION: "Security Escalation",
};

export const categoryLabels: Record<string, string> = {
  IDENTITY_ACCESS: "Identity & Access",
  END_USER_SUPPORT: "End User Support",
  COLLABORATION: "Collaboration",
  NETWORK: "Network",
  PROCUREMENT: "Procurement",
  BUSINESS_APPLICATION: "Business Applications",
  SECURITY: "Security",
};

export const priorityLabels: Record<string, string> = {
  P1_CRITICAL: "P1 Critical",
  P2_HIGH: "P2 High",
  P3_MEDIUM: "P3 Medium",
  P4_LOW: "P4 Low",
};

export const statusLabels: Record<string, string> = {
  NEW: "New",
  TRIAGED: "Triaged",
  IN_PROGRESS: "In Progress",
  WAITING_CUSTOMER: "Waiting on Customer",
  WAITING_VENDOR: "Waiting on Vendor",
  ESCALATED: "Escalated",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const queueLabels: Record<string, string> = {
  SERVICE_DESK: "Service Desk",
  IDENTITY: "Identity",
  NETWORK: "Network Operations",
  COLLABORATION: "Messaging & Collaboration",
  FIELD_SERVICES: "Field Services",
  PROCUREMENT: "Procurement",
  SECURITY: "Security Operations",
  TIER3_APPLICATIONS: "Tier 3 Applications",
};

export const sentimentLabels: Record<string, string> = {
  CALM: "Calm",
  FRUSTRATED: "Frustrated",
  EXECUTIVE: "Executive",
  ESCALATION_RISK: "Escalation Risk",
};

export const riskLevelLabels: Record<string, string> = {
  LOW: "Low",
  MODERATE: "Moderate",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const urgencyLabels: Record<string, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  NORMAL: "Normal",
  LOW: "Low",
};

export const impactLabels: Record<string, string> = {
  ENTERPRISE: "Enterprise",
  DEPARTMENT: "Department",
  SINGLE_USER: "Single User",
};

export const approvalTypeLabels: Record<string, string> = {
  PROCUREMENT: "Procurement Approval",
  TIER3_ESCALATION: "Tier 3 Escalation",
  PRIORITY_CLOSURE: "Controlled Closure",
};

export const approvalStatusLabels: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const sourceLabels: Record<string, string> = {
  RULE_BASED: "Rule Based",
  AI_ASSISTED: "AI Assisted",
  HUMAN_APPROVED: "Human Approved",
  MANUAL: "Manual",
};

export const slaTierLabels: Record<string, string> = {
  PLATINUM: "Platinum",
  GOLD: "Gold",
  SILVER: "Silver",
  BRONZE: "Bronze",
};

export const workflowLifecycle = [
  {
    title: "Ticket Intake",
    description:
      "Capture requester context, company, issue type, urgency, impact, and attachment placeholders.",
  },
  {
    title: "Triage and SLA",
    description:
      "Blend deterministic routing rules with AI recommendations and match the correct SLA policy.",
  },
  {
    title: "Technician Assist",
    description:
      "Generate internal notes and customer-facing updates to reduce time spent on repetitive drafting.",
  },
  {
    title: "Human Approval",
    description:
      "Gate procurement, tier 3 escalation, and controlled closure actions before execution.",
  },
  {
    title: "Reporting",
    description:
      "Track audit history, automation minutes saved, approval decisions, and recurring issue patterns.",
  },
] as const;

export function getPriorityTone(priority?: string | null): BadgeTone {
  switch (priority) {
    case "P1_CRITICAL":
      return "red";
    case "P2_HIGH":
      return "amber";
    case "P3_MEDIUM":
      return "blue";
    case "P4_LOW":
      return "slate";
    default:
      return "slate";
  }
}

export function getStatusTone(status?: string | null): BadgeTone {
  switch (status) {
    case "NEW":
      return "blue";
    case "TRIAGED":
      return "teal";
    case "IN_PROGRESS":
      return "blue";
    case "WAITING_CUSTOMER":
    case "WAITING_VENDOR":
      return "amber";
    case "ESCALATED":
      return "red";
    case "RESOLVED":
      return "emerald";
    case "CLOSED":
      return "slate";
    default:
      return "slate";
  }
}

export function getSourceTone(source?: string | null): BadgeTone {
  switch (source) {
    case "RULE_BASED":
      return "teal";
    case "AI_ASSISTED":
      return "blue";
    case "HUMAN_APPROVED":
      return "amber";
    case "MANUAL":
      return "slate";
    default:
      return "slate";
  }
}

export function getRiskTone(risk?: string | null): BadgeTone {
  switch (risk) {
    case "CRITICAL":
      return "red";
    case "HIGH":
      return "amber";
    case "MODERATE":
      return "blue";
    case "LOW":
      return "emerald";
    default:
      return "slate";
  }
}

export function getSlaRiskTone(risk: string): BadgeTone {
  switch (risk) {
    case "Breached":
      return "red";
    case "At Risk":
      return "amber";
    case "Watching":
      return "blue";
    default:
      return "emerald";
  }
}
