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

import { inferRisk, inferSentiment } from "./ticket-intelligence";
import { buildHeuristicRecommendation } from "./triage-heuristics";

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
    const recommendation = buildHeuristicRecommendation(input, ruleBaseline);
    const sentiment = inferSentiment(
      input.description,
      input.requesterTitle,
      input.requesterVip,
    );
    const riskLevel = inferRisk(input.issueType, recommendation.priority, sentiment);

    const internalSummary = `${input.requesterName} at ${input.companyName} reported ${input.subject.toLowerCase()}. AI recommends ${recommendation.queue.toLowerCase()} routing with ${recommendation.priority.replace("_", " ").toLowerCase()} priority.`;

    const customerUpdateDraft = `We have your request in progress and routed it to the ${recommendation.queue.toLowerCase()} team with ${recommendation.priority.replace("_", " ").toLowerCase()} handling.`;

    return {
      ...recommendation,
      sentiment,
      riskLevel,
      internalSummary,
      customerUpdateDraft,
    };
  }
}
