import { describe, expect, it } from "vitest";

import {
  buildAutomationBundle,
  deriveRulePriority,
  inferRisk,
  inferSentiment,
  normalizePriority,
  priorityRank,
  selectSlaProfile,
  type AutomationContext,
} from "../ticket-intelligence";

const stubProfiles = [
  {
    id: "sla-p1",
    name: "P1 Critical",
    priority: "P1_CRITICAL" as const,
    issueType: null,
    responseTargetMinutes: 15,
    resolutionTargetMinutes: 120,
    escalationPolicy: "Immediate paging.",
    createdAt: new Date(),
  },
  {
    id: "sla-p2",
    name: "P2 High",
    priority: "P2_HIGH" as const,
    issueType: null,
    responseTargetMinutes: 30,
    resolutionTargetMinutes: 240,
    escalationPolicy: "Notify manager within 30 minutes.",
    createdAt: new Date(),
  },
  {
    id: "sla-p3",
    name: "P3 Medium",
    priority: "P3_MEDIUM" as const,
    issueType: null,
    responseTargetMinutes: 60,
    resolutionTargetMinutes: 480,
    escalationPolicy: "Standard business hours.",
    createdAt: new Date(),
  },
  {
    id: "sla-p4",
    name: "P4 Low",
    priority: "P4_LOW" as const,
    issueType: null,
    responseTargetMinutes: 120,
    resolutionTargetMinutes: 1440,
    escalationPolicy: "Best effort.",
    createdAt: new Date(),
  },
  {
    id: "sla-security",
    name: "Security Critical",
    priority: "P1_CRITICAL" as const,
    issueType: "SECURITY_ESCALATION" as const,
    responseTargetMinutes: 10,
    resolutionTargetMinutes: 60,
    escalationPolicy: "Immediate containment and leadership notification.",
    createdAt: new Date(),
  },
];

function makeContext(overrides: Partial<AutomationContext> = {}): AutomationContext {
  return {
    subject: "Test ticket subject",
    description: "A routine issue that needs standard troubleshooting steps.",
    issueType: "PASSWORD_RESET",
    urgency: "NORMAL",
    impact: "SINGLE_USER",
    requesterName: "Jane Doe",
    requesterTitle: "Staff Accountant",
    requesterVip: false,
    companyName: "Acme Corp",
    ...overrides,
  };
}

describe("priorityRank", () => {
  it("ranks P1 highest and P4 lowest", () => {
    expect(priorityRank("P1_CRITICAL")).toBe(1);
    expect(priorityRank("P2_HIGH")).toBe(2);
    expect(priorityRank("P3_MEDIUM")).toBe(3);
    expect(priorityRank("P4_LOW")).toBe(4);
  });
});

describe("normalizePriority", () => {
  it("clamps values at or below 1 to P1", () => {
    expect(normalizePriority(0)).toBe("P1_CRITICAL");
    expect(normalizePriority(-2)).toBe("P1_CRITICAL");
    expect(normalizePriority(1)).toBe("P1_CRITICAL");
  });

  it("clamps values at or above 4 to P4", () => {
    expect(normalizePriority(4)).toBe("P4_LOW");
    expect(normalizePriority(7)).toBe("P4_LOW");
  });

  it("maps middle values correctly", () => {
    expect(normalizePriority(2)).toBe("P2_HIGH");
    expect(normalizePriority(3)).toBe("P3_MEDIUM");
  });
});

describe("deriveRulePriority", () => {
  it("returns base priority when urgency and impact are neutral", () => {
    expect(deriveRulePriority("P3_MEDIUM", "NORMAL", "DEPARTMENT", false)).toBe("P3_MEDIUM");
  });

  it("escalates for critical urgency", () => {
    expect(deriveRulePriority("P3_MEDIUM", "CRITICAL", "SINGLE_USER", false)).toBe("P2_HIGH");
  });

  it("escalates for enterprise impact", () => {
    expect(deriveRulePriority("P3_MEDIUM", "NORMAL", "ENTERPRISE", false)).toBe("P2_HIGH");
  });

  it("de-escalates for single user impact", () => {
    expect(deriveRulePriority("P3_MEDIUM", "NORMAL", "SINGLE_USER", false)).toBe("P4_LOW");
  });

  it("escalates for VIP requester", () => {
    expect(deriveRulePriority("P3_MEDIUM", "NORMAL", "DEPARTMENT", true)).toBe("P2_HIGH");
  });

  it("stacks multiple escalation factors", () => {
    expect(deriveRulePriority("P3_MEDIUM", "CRITICAL", "ENTERPRISE", true)).toBe("P1_CRITICAL");
  });

  it("clamps at P1 when all factors escalate from a low base", () => {
    expect(deriveRulePriority("P4_LOW", "CRITICAL", "ENTERPRISE", true)).toBe("P1_CRITICAL");
  });
});

describe("inferSentiment", () => {
  it("returns CALM for neutral descriptions", () => {
    expect(inferSentiment("Printer is not working as expected.", "Analyst", false)).toBe("CALM");
  });

  it("returns EXECUTIVE for VIP requester", () => {
    expect(inferSentiment("Routine request.", "Analyst", true)).toBe("EXECUTIVE");
  });

  it("returns EXECUTIVE for executive titles", () => {
    expect(inferSentiment("Routine request.", "VP of Engineering", false)).toBe("EXECUTIVE");
    expect(inferSentiment("Routine request.", "Chief Financial Officer", false)).toBe("EXECUTIVE");
  });

  it("returns ESCALATION_RISK for urgent language", () => {
    expect(inferSentiment("This is urgent and unacceptable.", "Analyst", false)).toBe(
      "ESCALATION_RISK",
    );
    expect(inferSentiment("We need this fixed ASAP.", "Coordinator", false)).toBe(
      "ESCALATION_RISK",
    );
  });

  it("returns FRUSTRATED for blocked language", () => {
    expect(inferSentiment("I can't access anything and it's still broken.", "User", false)).toBe(
      "FRUSTRATED",
    );
  });

  it("prioritizes EXECUTIVE over ESCALATION_RISK", () => {
    expect(inferSentiment("This is urgent!", "CEO", false)).toBe("EXECUTIVE");
  });
});

describe("inferRisk", () => {
  it("returns CRITICAL for security escalations", () => {
    expect(inferRisk("SECURITY_ESCALATION", "P3_MEDIUM", "CALM")).toBe("CRITICAL");
  });

  it("returns CRITICAL for P1 priority", () => {
    expect(inferRisk("PASSWORD_RESET", "P1_CRITICAL", "CALM")).toBe("CRITICAL");
  });

  it("returns HIGH for P2 or escalation risk sentiment", () => {
    expect(inferRisk("EMAIL_DELIVERY", "P2_HIGH", "CALM")).toBe("HIGH");
    expect(inferRisk("PRINTER_PROBLEM", "P3_MEDIUM", "ESCALATION_RISK")).toBe("HIGH");
  });

  it("returns MODERATE for P3", () => {
    expect(inferRisk("EMAIL_DELIVERY", "P3_MEDIUM", "CALM")).toBe("MODERATE");
  });

  it("returns LOW for P4 with calm sentiment", () => {
    expect(inferRisk("PASSWORD_RESET", "P4_LOW", "CALM")).toBe("LOW");
  });
});

describe("selectSlaProfile", () => {
  it("selects an issue-specific profile when available", () => {
    const profile = selectSlaProfile(stubProfiles, "SECURITY_ESCALATION", "P1_CRITICAL");
    expect(profile.id).toBe("sla-security");
    expect(profile.responseTargetMinutes).toBe(10);
  });

  it("falls back to a priority-only profile", () => {
    const profile = selectSlaProfile(stubProfiles, "PASSWORD_RESET", "P2_HIGH");
    expect(profile.id).toBe("sla-p2");
  });

  it("throws when no matching profile exists", () => {
    expect(() =>
      selectSlaProfile([], "PASSWORD_RESET", "P1_CRITICAL"),
    ).toThrow("No SLA profile found");
  });
});

  describe("buildAutomationBundle", () => {
  it("produces a complete bundle for a password reset", () => {
    const context = makeContext();
    const bundle = buildAutomationBundle(context, stubProfiles, new Date("2026-01-15T10:00:00Z"));

    expect(bundle.ruleResult.category).toBe("IDENTITY_ACCESS");
    expect(bundle.ruleResult.queue).toBe("IDENTITY");
    expect(bundle.finalResult.category).toBe("IDENTITY_ACCESS");
    expect(bundle.sentiment).toBe("CALM");
    expect(bundle.probableRootCause).toContain("password");
    expect(bundle.customerUpdateDraft.length).toBeGreaterThan(0);
    expect(bundle.dueResponseAt.getTime()).toBeGreaterThan(new Date("2026-01-15T10:00:00Z").getTime());
    expect(bundle.defaultApprovalType).toBeUndefined();
  });

  it("assigns a procurement approval gate for procurement requests", () => {
    const context = makeContext({
      issueType: "PROCUREMENT_REQUEST",
      subject: "Laptop refresh request",
      description: "Need a standard laptop replacement for a regional manager.",
    });
    const bundle = buildAutomationBundle(context, stubProfiles, new Date("2026-01-15T10:00:00Z"));

    expect(bundle.defaultApprovalType).toBe("PROCUREMENT");
    expect(bundle.ruleResult.category).toBe("PROCUREMENT");
    expect(bundle.ruleResult.queue).toBe("PROCUREMENT");
  });

  it("elevates security-adjacent language to P1 / SECURITY via AI overlay", () => {
    const context = makeContext({
      issueType: "EMAIL_DELIVERY",
      subject: "Suspicious forwarding rules detected",
      description: "We found a suspicious login and possible phishing activity from an unknown device.",
    });
    const bundle = buildAutomationBundle(context, stubProfiles, new Date("2026-01-15T10:00:00Z"));

    expect(bundle.aiResult.priority).toBe("P1_CRITICAL");
    expect(bundle.aiResult.queue).toBe("SECURITY");
    expect(bundle.aiResult.confidence).toBeGreaterThanOrEqual(0.9);
    expect(bundle.finalResult.priority).toBe("P1_CRITICAL");
  });

  it("boosts priority for broad impact language", () => {
    const context = makeContext({
      issueType: "VPN_ACCESS",
      description: "All users in the remote office are affected and cannot connect.",
    });
    const bundle = buildAutomationBundle(context, stubProfiles, new Date("2026-01-15T10:00:00Z"));

    expect(priorityRank(bundle.aiResult.priority)).toBeLessThanOrEqual(
      priorityRank(bundle.ruleResult.priority),
    );
  });

  it("uses AI result when confidence is high enough", () => {
    const context = makeContext({
      issueType: "LOB_APPLICATION",
      description: "The order entry system cannot process billing confirmations for dispatch.",
    });
    const bundle = buildAutomationBundle(context, stubProfiles, new Date("2026-01-15T10:00:00Z"));

    expect(bundle.aiResult.confidence).toBeGreaterThanOrEqual(0.82);
    expect(bundle.finalResult.queue).toBe(bundle.aiResult.queue);
  });

  it("sets SLA due dates in the future relative to reference time", () => {
    const ref = new Date("2026-03-01T09:00:00Z");
    const context = makeContext({ issueType: "INTERNET_OUTAGE", urgency: "CRITICAL", impact: "ENTERPRISE" });
    const bundle = buildAutomationBundle(context, stubProfiles, ref);

    expect(bundle.dueResponseAt.getTime()).toBeGreaterThan(ref.getTime());
    expect(bundle.dueResolutionAt.getTime()).toBeGreaterThan(bundle.dueResponseAt.getTime());
  });

  it("uses an injected AI recommendation when the provider supplies one", () => {
    const context = makeContext({
      issueType: "EMAIL_DELIVERY",
      description: "Suspicious login activity suggests the queue should shift to security review.",
    });
    const bundle = buildAutomationBundle(context, stubProfiles, new Date("2026-01-15T10:00:00Z"), {
      category: "SECURITY",
      priority: "P1_CRITICAL",
      queue: "SECURITY",
      confidence: 0.97,
      reasoning: "Provider override detected security compromise language.",
      sentiment: "ESCALATION_RISK",
      riskLevel: "CRITICAL",
      internalSummary: "Injected provider summary.",
      customerUpdateDraft: "Injected provider update.",
    });

    expect(bundle.aiResult.queue).toBe("SECURITY");
    expect(bundle.finalResult.queue).toBe("SECURITY");
    expect(bundle.internalSummary).toBe("Injected provider summary.");
    expect(bundle.customerUpdateDraft).toContain("Injected provider update.");
  });
});
