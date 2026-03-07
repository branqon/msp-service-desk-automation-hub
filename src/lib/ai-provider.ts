import type {
  Impact,
  IssueType,
  Priority,
  RiskLevel,
  Sentiment,
  SupportQueue,
  TicketCategory,
  Urgency,
} from "@prisma/client";

import {
  inferRisk,
  inferSentiment,
  normalizePriority,
  priorityRank,
} from "./ticket-intelligence";

export interface TriageInput {
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

export interface TriageRecommendation {
  category: TicketCategory;
  priority: Priority;
  queue: SupportQueue;
  confidence: number;
  reasoning: string;
  sentiment: Sentiment;
  riskLevel: RiskLevel;
  internalSummary: string;
  customerUpdateDraft: string;
}

export interface AIProvider {
  /**
   * Analyze a ticket and return triage recommendations.
   *
   * In production, this would call an LLM. The mock implementation uses
   * deterministic heuristics so the demo runs without external credentials.
   */
  analyzeTicket(
    input: TriageInput,
    ruleBaseline: {
      category: TicketCategory;
      priority: Priority;
      queue: SupportQueue;
    },
  ): Promise<TriageRecommendation>;
}

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? "mock";

  if (provider === "mock") {
    return new MockAIProvider();
  }

  // Future: return new OpenAIProvider() or new AnthropicProvider()
  throw new Error(`Unknown AI_PROVIDER: ${provider}`);
}

// Mock implementation uses heuristics so the provider abstraction is exercised
// in the live workflow without requiring external credentials.

class MockAIProvider implements AIProvider {
  async analyzeTicket(
    input: TriageInput,
    ruleBaseline: {
      category: TicketCategory;
      priority: Priority;
      queue: SupportQueue;
    },
  ): Promise<TriageRecommendation> {
    const description = input.description.toLowerCase();
    let aiPriority = ruleBaseline.priority;
    let aiQueue = ruleBaseline.queue;
    let aiCategory = ruleBaseline.category;
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

    if (input.issueType === "LOB_APPLICATION" && /order entry|billing|dispatch/i.test(description)) {
      aiPriority = normalizePriority(priorityRank(aiPriority) - 1);
      aiQueue = "TIER3_APPLICATIONS";
      confidence += 0.06;
      reasons.push("Core workflow language suggests higher business impact than the base rule.");
    }

    if (input.issueType === "PROCUREMENT_REQUEST") {
      confidence += 0.04;
      reasons.push("Procurement work fits a policy-driven approval flow.");
    }

    confidence = Math.min(confidence, 0.98);

    const reasoning =
      reasons.join(" ") ||
      "Signal quality is consistent with the deterministic route, so AI confidence remains moderate.";

    const sentiment = inferSentiment(input.description, input.requesterTitle, input.requesterVip);
    const riskLevel = inferRisk(input.issueType, aiPriority, sentiment);

    const internalSummary = `${input.requesterName} at ${input.companyName} reported ${input.subject.toLowerCase()}. AI recommends ${aiQueue.toLowerCase()} routing with ${aiPriority.replace("_", " ").toLowerCase()} priority.`;

    const customerUpdateDraft = `We have your request in progress and routed it to the ${aiQueue.toLowerCase()} team with ${aiPriority.replace("_", " ").toLowerCase()} handling.`;

    return {
      category: aiCategory,
      priority: aiPriority,
      queue: aiQueue,
      confidence,
      reasoning,
      sentiment,
      riskLevel,
      internalSummary,
      customerUpdateDraft,
    };
  }
}
