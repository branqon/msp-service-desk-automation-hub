import {
  ApprovalType,
  type Impact,
  type IssueType,
  type Priority,
  type RiskLevel,
  type SlaProfile,
  type Sentiment,
  type SupportQueue,
  type TicketCategory,
  type Urgency,
} from "@prisma/client";
import { addMinutes } from "date-fns";

interface Blueprint {
  category: TicketCategory;
  queue: SupportQueue;
  basePriority: Priority;
  probableRootCause: string;
  recommendedNextStep: string;
  escalationSuggestion: string;
}

const BLUEPRINTS: Record<IssueType, Blueprint> = {
  PASSWORD_RESET: {
    category: "IDENTITY_ACCESS",
    queue: "IDENTITY",
    basePriority: "P4_LOW",
    probableRootCause: "Expired password or stale cached credentials on the endpoint.",
    recommendedNextStep: "Validate identity, unlock the account if needed, and force a password reset.",
    escalationSuggestion: "Escalate only if repeated lockouts suggest directory sync or SSO issues.",
  },
  MFA_ISSUE: {
    category: "IDENTITY_ACCESS",
    queue: "IDENTITY",
    basePriority: "P3_MEDIUM",
    probableRootCause: "Authenticator drift, stale device registration, or conditional access mismatch.",
    recommendedNextStep: "Validate enrollment state, re-register MFA, and confirm sign-in path.",
    escalationSuggestion: "Escalate if policy changes or tenant-wide MFA enrollment errors are detected.",
  },
  PRINTER_PROBLEM: {
    category: "END_USER_SUPPORT",
    queue: "FIELD_SERVICES",
    basePriority: "P4_LOW",
    probableRootCause: "Print spooler interruption, queue corruption, or local connectivity failure.",
    recommendedNextStep: "Confirm device reachability, clear the queue, and reinstall the driver if needed.",
    escalationSuggestion: "Escalate to field services if multiple users are blocked or hardware repair is required.",
  },
  USER_ONBOARDING: {
    category: "IDENTITY_ACCESS",
    queue: "SERVICE_DESK",
    basePriority: "P3_MEDIUM",
    probableRootCause: "New hire provisioning task is missing one or more access or hardware dependencies.",
    recommendedNextStep: "Review the onboarding checklist, validate start date, and queue account creation tasks.",
    escalationSuggestion: "Escalate if line-of-business access or hardware dependencies are not ready before start date.",
  },
  PROCUREMENT_REQUEST: {
    category: "PROCUREMENT",
    queue: "PROCUREMENT",
    basePriority: "P4_LOW",
    probableRootCause: "Requested hardware or software purchase requires manager or finance validation.",
    recommendedNextStep: "Validate standard catalog options, confirm budget owner, and route for approval.",
    escalationSuggestion: "Escalate if the request is off-catalog, urgent, or blocked by vendor constraints.",
  },
  INTERNET_OUTAGE: {
    category: "NETWORK",
    queue: "NETWORK",
    basePriority: "P1_CRITICAL",
    probableRootCause: "ISP disruption, firewall uplink failure, or circuit instability affecting site connectivity.",
    recommendedNextStep: "Validate WAN status, confirm outage scope, and open vendor engagement if the circuit is down.",
    escalationSuggestion: "Escalate immediately to network operations and the ISP if multiple users or a full site are impacted.",
  },
  EMAIL_DELIVERY: {
    category: "COLLABORATION",
    queue: "COLLABORATION",
    basePriority: "P3_MEDIUM",
    probableRootCause: "Mail flow rule conflict, spam filtering action, or mailbox send restriction.",
    recommendedNextStep: "Trace the message path, inspect transport rules, and confirm mailbox health.",
    escalationSuggestion: "Escalate if executive mail flow or cross-tenant issues are involved.",
  },
  VPN_ACCESS: {
    category: "NETWORK",
    queue: "NETWORK",
    basePriority: "P3_MEDIUM",
    probableRootCause: "Expired VPN profile, credential mismatch, or upstream VPN gateway issue.",
    recommendedNextStep: "Validate profile assignment, reset the VPN secret if applicable, and verify gateway health.",
    escalationSuggestion: "Escalate if multiple users or a remote site cannot authenticate.",
  },
  LOB_APPLICATION: {
    category: "BUSINESS_APPLICATION",
    queue: "TIER3_APPLICATIONS",
    basePriority: "P3_MEDIUM",
    probableRootCause: "Application-side permissions, backend job failure, or vendor-side performance issue.",
    recommendedNextStep: "Capture error context, validate access, and reproduce the issue against the impacted workflow.",
    escalationSuggestion: "Escalate to tier 3 or the vendor if the incident affects revenue or a core workflow.",
  },
  SECURITY_ESCALATION: {
    category: "SECURITY",
    queue: "SECURITY",
    basePriority: "P1_CRITICAL",
    probableRootCause: "Suspicious sign-in, phishing activity, or endpoint behavior requiring containment.",
    recommendedNextStep: "Preserve evidence, isolate impacted assets, and validate whether account compromise is active.",
    escalationSuggestion: "Escalate immediately to security operations and customer leadership.",
  },
};

export interface AutomationContext {
  subject: string;
  description: string;
  issueType: IssueType;
  urgency: Urgency;
  impact: Impact;
  requesterName: string;
  requesterTitle: string;
  requesterVip: boolean;
  companyName: string;
}

export interface AutomationBundle {
  ruleResult: {
    category: TicketCategory;
    priority: Priority;
    queue: SupportQueue;
  };
  aiResult: {
    category: TicketCategory;
    priority: Priority;
    queue: SupportQueue;
    confidence: number;
    reasoning: string;
  };
  finalResult: {
    category: TicketCategory;
    priority: Priority;
    queue: SupportQueue;
  };
  sentiment: Sentiment;
  riskLevel: RiskLevel;
  triageReasoning: string;
  probableRootCause: string;
  recommendedNextStep: string;
  escalationSuggestion: string;
  internalSummary: string;
  customerUpdateDraft: string;
  slaProfile: SlaProfile;
  dueResponseAt: Date;
  dueResolutionAt: Date;
  defaultApprovalType?: ApprovalType;
}

export interface AIRecommendationInput {
  category: TicketCategory;
  priority: Priority;
  queue: SupportQueue;
  confidence: number;
  reasoning: string;
  sentiment?: Sentiment;
  riskLevel?: RiskLevel;
  internalSummary?: string;
  customerUpdateDraft?: string;
}

export function priorityRank(priority: Priority) {
  switch (priority) {
    case "P1_CRITICAL":
      return 1;
    case "P2_HIGH":
      return 2;
    case "P3_MEDIUM":
      return 3;
    case "P4_LOW":
      return 4;
  }
}

export function normalizePriority(rank: number): Priority {
  if (rank <= 1) {
    return "P1_CRITICAL";
  }
  if (rank === 2) {
    return "P2_HIGH";
  }
  if (rank === 3) {
    return "P3_MEDIUM";
  }
  return "P4_LOW";
}

export function deriveRulePriority(
  basePriority: Priority,
  urgency: Urgency,
  impact: Impact,
  requesterVip: boolean,
) {
  let rank = priorityRank(basePriority);

  if (urgency === "CRITICAL") {
    rank -= 2;
  } else if (urgency === "HIGH") {
    rank -= 1;
  }

  if (impact === "ENTERPRISE") {
    rank -= 1;
  } else if (impact === "SINGLE_USER") {
    rank += 1;
  }

  if (requesterVip) {
    rank -= 1;
  }

  return normalizePriority(rank);
}

export function getRuleBaseline(context: AutomationContext) {
  const blueprint = BLUEPRINTS[context.issueType];

  return {
    category: blueprint.category,
    priority: deriveRulePriority(
      blueprint.basePriority,
      context.urgency,
      context.impact,
      context.requesterVip,
    ),
    queue: blueprint.queue,
  };
}

export function inferSentiment(
  description: string,
  requesterTitle: string,
  requesterVip: boolean,
): Sentiment {
  const text = description.toLowerCase();

  if (requesterVip || /director|vp|chief|cfo|ceo/i.test(requesterTitle)) {
    return "EXECUTIVE";
  }

  if (/asap|outage|frustrated|unacceptable|urgent|escalate/i.test(text)) {
    return "ESCALATION_RISK";
  }

  if (/can't|cannot|failed|still broken|blocked/i.test(text)) {
    return "FRUSTRATED";
  }

  return "CALM";
}

export function inferRisk(
  issueType: IssueType,
  priority: Priority,
  sentiment: Sentiment,
): RiskLevel {
  if (issueType === "SECURITY_ESCALATION" || priority === "P1_CRITICAL") {
    return "CRITICAL";
  }

  if (priority === "P2_HIGH" || sentiment === "ESCALATION_RISK") {
    return "HIGH";
  }

  if (priority === "P3_MEDIUM") {
    return "MODERATE";
  }

  return "LOW";
}

// Inline heuristic overlay used by the synchronous pipeline.
// See ai-provider.ts for the AIProvider interface that shows where a real
// LLM would plug in without changing the deterministic triage path.
function buildAiOverlay(
  context: AutomationContext,
  rulePriority: Priority,
  ruleQueue: SupportQueue,
  ruleCategory: TicketCategory,
) {
  const description = context.description.toLowerCase();
  let aiPriority = rulePriority;
  let aiQueue = ruleQueue;
  let aiCategory = ruleCategory;
  let confidence = 0.78;
  const reasons: string[] = [];

  if (/all users|entire office|whole site|everybody/i.test(description)) {
    aiPriority = normalizePriority(priorityRank(aiPriority) - 1);
    confidence += 0.08;
    reasons.push("Detected broad user impact in the ticket narrative.");
  }

  if (/wire transfer|phish|malware|suspicious login|compromised/i.test(description)) {
    aiPriority = "P1_CRITICAL";
    aiQueue = "SECURITY";
    aiCategory = "SECURITY";
    confidence = 0.96;
    reasons.push("Security-adjacent language suggests active compromise risk.");
  }

  if (/new hire|starts tomorrow|start date/i.test(description)) {
    aiPriority = normalizePriority(priorityRank(aiPriority) - 1);
    confidence += 0.05;
    reasons.push("Start-date language indicates a near-term onboarding dependency.");
  }

  if (/shipping|warehouse|labels|front desk/i.test(description)) {
    aiQueue = "FIELD_SERVICES";
    confidence += 0.04;
    reasons.push("Operational context points to a site-specific support dependency.");
  }

  if (
    context.requesterVip ||
    /executive|board|finance leadership|legal partner/i.test(description)
  ) {
    aiPriority = normalizePriority(priorityRank(aiPriority) - 1);
    confidence += 0.05;
    reasons.push("Executive or leadership context justifies faster routing.");
  }

  if (context.issueType === "LOB_APPLICATION" && /order entry|billing|dispatch/i.test(description)) {
    aiPriority = normalizePriority(priorityRank(aiPriority) - 1);
    aiQueue = "TIER3_APPLICATIONS";
    confidence += 0.06;
    reasons.push("Core workflow language suggests higher business impact than the base rule.");
  }

  if (context.issueType === "PROCUREMENT_REQUEST") {
    confidence += 0.04;
    reasons.push("Procurement work fits a policy-driven approval flow.");
  }

  return {
    category: aiCategory,
    priority: aiPriority,
    queue: aiQueue,
    confidence: Math.min(confidence, 0.98),
    reasoning:
      reasons.join(" ") ||
      "Signal quality is consistent with the deterministic route, so AI confidence remains moderate.",
  };
}

export function selectSlaProfile(
  profiles: SlaProfile[],
  issueType: IssueType,
  priority: Priority,
) {
  const issueSpecific = profiles.find(
    (profile) => profile.issueType === issueType && profile.priority === priority,
  );

  if (issueSpecific) {
    return issueSpecific;
  }

  const priorityMatch = profiles.find(
    (profile) => profile.issueType === null && profile.priority === priority,
  );

  if (!priorityMatch) {
    throw new Error(`No SLA profile found for ${priority}`);
  }

  return priorityMatch;
}

export function buildAutomationBundle(
  context: AutomationContext,
  profiles: SlaProfile[],
  referenceTime: Date,
  aiRecommendation?: AIRecommendationInput,
): AutomationBundle {
  const blueprint = BLUEPRINTS[context.issueType];
  const ruleResult = getRuleBaseline(context);
  const derivedSentiment = inferSentiment(
    context.description,
    context.requesterTitle,
    context.requesterVip,
  );
  const fallbackAiResult = buildAiOverlay(
    context,
    ruleResult.priority,
    ruleResult.queue,
    ruleResult.category,
  );
  const aiResult = aiRecommendation
    ? {
        category: aiRecommendation.category,
        priority: aiRecommendation.priority,
        queue: aiRecommendation.queue,
        confidence: aiRecommendation.confidence,
        reasoning: aiRecommendation.reasoning,
      }
    : fallbackAiResult;
  const sentiment = aiRecommendation?.sentiment ?? derivedSentiment;
  const finalResult =
    priorityRank(aiResult.priority) < priorityRank(ruleResult.priority) || aiResult.confidence >= 0.82
      ? {
          category: aiResult.category,
          priority: aiResult.priority,
          queue: aiResult.queue,
        }
      : {
          category: ruleResult.category,
          priority: ruleResult.priority,
          queue: ruleResult.queue,
        };
  const riskLevel = inferRisk(context.issueType, finalResult.priority, sentiment);
  const slaProfile = selectSlaProfile(profiles, context.issueType, finalResult.priority);
  const dueResponseAt = addMinutes(referenceTime, slaProfile.responseTargetMinutes);
  const dueResolutionAt = addMinutes(referenceTime, slaProfile.resolutionTargetMinutes);
  const triageReasoning = `Rule engine mapped ${context.issueType} to ${blueprint.category} / ${blueprint.queue}. AI confidence ${Math.round(aiResult.confidence * 100)}%: ${aiResult.reasoning}`;
  const internalSummary =
    aiRecommendation?.internalSummary ??
    `${context.requesterName} at ${context.companyName} reported ${context.subject.toLowerCase()}. Final routing is ${finalResult.queue} with ${finalResult.priority} priority and ${riskLevel.toLowerCase()} risk posture.`;
  const customerUpdateDraft = aiRecommendation?.customerUpdateDraft
    ? `${aiRecommendation.customerUpdateDraft} Next step: ${blueprint.recommendedNextStep.toLowerCase()}`
    : `We have your request in progress and routed it to the ${finalResult.queue.toLowerCase()} team with ${finalResult.priority.replace("_", " ").toLowerCase()} handling. Next step: ${blueprint.recommendedNextStep.toLowerCase()}`;

  return {
    ruleResult,
    aiResult,
    finalResult,
    sentiment,
    riskLevel,
    triageReasoning,
    probableRootCause: blueprint.probableRootCause,
    recommendedNextStep: blueprint.recommendedNextStep,
    escalationSuggestion: blueprint.escalationSuggestion,
    internalSummary,
    customerUpdateDraft,
    slaProfile,
    dueResponseAt,
    dueResolutionAt,
    defaultApprovalType:
      context.issueType === "PROCUREMENT_REQUEST" ? ApprovalType.PROCUREMENT : undefined,
  };
}
