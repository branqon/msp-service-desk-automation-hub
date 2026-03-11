import type {
  IssueType,
  Priority,
  SupportQueue,
  TicketCategory,
} from "@prisma/client";

export interface HeuristicTriageInput {
  description: string;
  issueType: IssueType;
  requesterVip: boolean;
}

export interface HeuristicTriageBaseline {
  category: TicketCategory;
  priority: Priority;
  queue: SupportQueue;
}

export interface HeuristicTriageResult {
  category: TicketCategory;
  priority: Priority;
  queue: SupportQueue;
  confidence: number;
  reasoning: string;
}

function priorityRank(priority: Priority) {
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

function normalizePriority(rank: number): Priority {
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

export function buildHeuristicRecommendation(
  input: HeuristicTriageInput,
  baseline: HeuristicTriageBaseline,
): HeuristicTriageResult {
  const description = input.description.toLowerCase();
  let aiPriority = baseline.priority;
  let aiQueue = baseline.queue;
  let aiCategory = baseline.category;
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
    input.requesterVip ||
    /executive|board|finance leadership|legal partner/i.test(description)
  ) {
    aiPriority = normalizePriority(priorityRank(aiPriority) - 1);
    confidence += 0.05;
    reasons.push("Executive or leadership context justifies faster routing.");
  }

  if (
    input.issueType === "LOB_APPLICATION" &&
    /order entry|billing|dispatch/i.test(description)
  ) {
    aiPriority = normalizePriority(priorityRank(aiPriority) - 1);
    aiQueue = "TIER3_APPLICATIONS";
    confidence += 0.06;
    reasons.push("Core workflow language suggests higher business impact than the base rule.");
  }

  if (input.issueType === "PROCUREMENT_REQUEST") {
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
