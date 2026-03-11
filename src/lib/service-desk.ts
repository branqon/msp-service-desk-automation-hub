import {
  ActorType,
  ApprovalStatus,
  ApprovalType,
  AutomationSource,
  Prisma,
  TicketStatus,
  WorkflowStatus,
  WorkflowTrigger,
  type Priority,
} from "@prisma/client";
import { addMinutes, startOfDay, subDays } from "date-fns";
import { z } from "zod";

import { getAIProvider } from "@/lib/ai-provider";
import { prisma } from "@/lib/db";
import { buildAutomationBundle, getRuleBaseline } from "@/lib/ticket-intelligence";
import { formatCompactDate, isClosedStatus, isOverdue } from "@/lib/utils";

export const ticketListInclude = Prisma.validator<Prisma.TicketInclude>()({
  company: true,
  requester: true,
  approvals: {
    orderBy: { requestedAt: "desc" },
  },
  workflowRuns: {
    orderBy: { startedAt: "desc" },
    take: 1,
  },
});

export const ticketDetailInclude = Prisma.validator<Prisma.TicketInclude>()({
  company: true,
  requester: true,
  slaProfile: true,
  attachments: true,
  approvals: {
    orderBy: { requestedAt: "desc" },
  },
  workflowRuns: {
    orderBy: { startedAt: "desc" },
  },
  auditEvents: {
    orderBy: { createdAt: "desc" },
  },
});

export const approvalRecordInclude = Prisma.validator<Prisma.ApprovalInclude>()({
  ticket: {
    include: {
      company: true,
      requester: true,
    },
  },
});

export type TicketListItem = Prisma.TicketGetPayload<{
  include: typeof ticketListInclude;
}>;

export type TicketDetail = Prisma.TicketGetPayload<{
  include: typeof ticketDetailInclude;
}>;

export type ApprovalRecord = Prisma.ApprovalGetPayload<{
  include: typeof approvalRecordInclude;
}>;

export const createTicketSchema = z.object({
  companyId: z.string().min(1),
  subject: z.string().min(6).max(120),
  issueType: z.enum([
    "PASSWORD_RESET",
    "MFA_ISSUE",
    "PRINTER_PROBLEM",
    "USER_ONBOARDING",
    "PROCUREMENT_REQUEST",
    "INTERNET_OUTAGE",
    "EMAIL_DELIVERY",
    "VPN_ACCESS",
    "LOB_APPLICATION",
    "SECURITY_ESCALATION",
  ]),
  urgency: z.enum(["CRITICAL", "HIGH", "NORMAL", "LOW"]),
  impact: z.enum(["ENTERPRISE", "DEPARTMENT", "SINGLE_USER"]),
  description: z.string().min(20).max(2000),
  requesterName: z.string().min(2).max(80),
  requesterEmail: z.string().email(),
  requesterTitle: z.string().min(2).max(80),
  attachmentsNote: z.string().max(240).optional().or(z.literal("")),
  requesterVip: z.boolean().optional(),
  createdAt: z.date().optional(),
});

export const approvalRequestSchema = z.object({
  approvalType: z.enum(["PROCUREMENT", "TIER3_ESCALATION", "PRIORITY_CLOSURE"]),
  requestedBy: z.string().min(2).max(60),
  reason: z.string().min(10).max(240),
});

export const approvalDecisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  approverName: z.string().min(2).max(60),
  decisionNotes: z.string().max(240).optional().or(z.literal("")),
});

export const customerReviewSchema = z.object({
  reviewerName: z.string().min(2).max(60),
  customerUpdateDraft: z.string().min(20).max(2000),
});

async function getSlaProfiles() {
  return prisma.slaProfile.findMany({
    orderBy: [{ priority: "asc" }, { issueType: "asc" }],
  });
}

function formatTicketNumber(year: number, sequenceValue: number) {
  return `MSP-${year}-${String(sequenceValue).padStart(4, "0")}`;
}

async function generateTicketNumber(
  tx: Prisma.TransactionClient,
  createdAt: Date,
) {
  const year = createdAt.getFullYear();
  const existingSequence = await tx.ticketSequence.findUnique({
    where: { year },
  });

  if (!existingSequence) {
    await tx.ticketSequence.create({
      data: {
        year,
        nextValue: 2,
      },
    });

    return formatTicketNumber(year, 1);
  }

  const updatedSequence = await tx.ticketSequence.update({
    where: { year },
    data: {
      nextValue: {
        increment: 1,
      },
    },
  });

  return formatTicketNumber(year, updatedSequence.nextValue - 1);
}

function getDefaultWorkflowMinutes(priority: Priority) {
  switch (priority) {
    case "P1_CRITICAL":
      return 27;
    case "P2_HIGH":
      return 24;
    case "P3_MEDIUM":
      return 20;
    case "P4_LOW":
      return 16;
  }
}

function buildWorkflowTimes(referenceTime: Date) {
  return {
    intakeComplete: addMinutes(referenceTime, 1),
    triageComplete: addMinutes(referenceTime, 4),
    noteComplete: addMinutes(referenceTime, 7),
    customerDraftComplete: addMinutes(referenceTime, 9),
    approvalQueued: addMinutes(referenceTime, 11),
  };
}

function matchesRoute(
  ticket: {
    category: string | null;
    priority: string | null;
    suggestedQueue: string | null;
  },
  route: {
    category: string | null;
    priority: string | null;
    queue: string | null;
  },
) {
  return (
    ticket.category === route.category &&
    ticket.priority === route.priority &&
    ticket.suggestedQueue === route.queue
  );
}

function hasRoute(route: {
  category: string | null;
  priority: string | null;
  queue: string | null;
}) {
  return route.category !== null && route.priority !== null && route.queue !== null;
}

export async function getCompanies() {
  return prisma.company.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getTickets() {
  return prisma.ticket.findMany({
    include: ticketListInclude,
    orderBy: [{ dueResolutionAt: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTicketById(ticketId: string) {
  return prisma.ticket.findUnique({
    where: { id: ticketId },
    include: ticketDetailInclude,
  });
}

export async function getApprovals() {
  return prisma.approval.findMany({
    include: approvalRecordInclude,
    orderBy: [{ status: "asc" }, { requestedAt: "desc" }],
  });
}

export async function getAutomationOpportunities() {
  return prisma.automationOpportunity.findMany({
    orderBy: [{ automationFitScore: "desc" }, { monthlyTicketVolume: "desc" }],
  });
}

export async function createTicket(rawInput: unknown) {
  const input = createTicketSchema.parse(rawInput);
  const [company, profiles] = await Promise.all([
    prisma.company.findUnique({ where: { id: input.companyId } }),
    getSlaProfiles(),
  ]);

  if (!company) {
    throw new Error("Selected company was not found.");
  }

  const createdAt = input.createdAt ?? new Date();
  const requesterVip = Boolean(input.requesterVip);
  const automationContext = {
    subject: input.subject,
    description: input.description,
    issueType: input.issueType,
    urgency: input.urgency,
    impact: input.impact,
    requesterName: input.requesterName,
    requesterTitle: input.requesterTitle,
    requesterVip,
    companyName: company.name,
  };
  let aiRecommendation:
    | Awaited<ReturnType<ReturnType<typeof getAIProvider>["analyzeTicket"]>>
    | undefined;

  try {
    const aiProvider = getAIProvider();
    aiRecommendation = await aiProvider.analyzeTicket(
      automationContext,
      getRuleBaseline(automationContext),
    );
  } catch {
    aiRecommendation = undefined;
  }
  const automation = buildAutomationBundle(
    automationContext,
    profiles,
    createdAt,
    aiRecommendation,
  );
  const workflowTimes = buildWorkflowTimes(createdAt);
  const workflowMinutes = getDefaultWorkflowMinutes(automation.finalResult.priority);

  return prisma.$transaction(async (tx) => {
    const requester = await tx.requester.upsert({
      where: {
        companyId_email: {
          companyId: company.id,
          email: input.requesterEmail,
        },
      },
      update: {
        name: input.requesterName,
        title: input.requesterTitle,
        vip: requesterVip,
      },
      create: {
        name: input.requesterName,
        title: input.requesterTitle,
        email: input.requesterEmail,
        vip: requesterVip,
        companyId: company.id,
      },
    });

    const ticket = await tx.ticket.create({
      data: {
        ticketNumber: await generateTicketNumber(tx, createdAt),
        subject: input.subject,
        issueType: input.issueType,
        urgency: input.urgency,
        impact: input.impact,
        description: input.description,
        status: TicketStatus.TRIAGED,
        category: automation.finalResult.category,
        priority: automation.finalResult.priority,
        sentiment: automation.sentiment,
        riskLevel: automation.riskLevel,
        suggestedQueue: automation.finalResult.queue,
        ruleCategory: automation.ruleResult.category,
        rulePriority: automation.ruleResult.priority,
        ruleQueue: automation.ruleResult.queue,
        aiSuggestedCategory: automation.aiResult.category,
        aiSuggestedPriority: automation.aiResult.priority,
        aiSuggestedQueue: automation.aiResult.queue,
        aiConfidence: automation.aiResult.confidence,
        triageReasoning: automation.triageReasoning,
        dueResponseAt: automation.dueResponseAt,
        dueResolutionAt: automation.dueResolutionAt,
        internalSummary: automation.internalSummary,
        probableRootCause: automation.probableRootCause,
        recommendedNextStep: automation.recommendedNextStep,
        escalationSuggestion: automation.escalationSuggestion,
        customerUpdateDraft: automation.customerUpdateDraft,
        attachmentsNote: input.attachmentsNote || null,
        manualMinutesSaved: workflowMinutes,
        companyId: company.id,
        requesterId: requester.id,
        slaProfileId: automation.slaProfile.id,
        createdAt,
        updatedAt: createdAt,
        attachments: input.attachmentsNote
          ? {
              create: [
                {
                  fileName: input.attachmentsNote,
                  description: "Attachment placeholder captured at intake.",
                  createdAt,
                },
              ],
            }
          : undefined,
        workflowRuns: {
          create: [
            {
              workflowName: "Inbound intake capture",
              triggerType: WorkflowTrigger.INTAKE,
              status: WorkflowStatus.COMPLETED,
              source: AutomationSource.MANUAL,
              summary: `Captured request from ${input.requesterName} at ${company.name}.`,
              automationMinutesSaved: 0,
              startedAt: createdAt,
              completedAt: workflowTimes.intakeComplete,
            },
            {
              workflowName: "Rule-based triage and routing",
              triggerType: WorkflowTrigger.TRIAGE,
              status: WorkflowStatus.COMPLETED,
              source: AutomationSource.RULE_BASED,
              summary: `Mapped to ${automation.ruleResult.category} / ${automation.ruleResult.queue} with ${automation.ruleResult.priority}.`,
              automationMinutesSaved: 6,
              startedAt: workflowTimes.intakeComplete,
              completedAt: workflowTimes.triageComplete,
            },
            {
              workflowName: "AI recommendation layer",
              triggerType: WorkflowTrigger.TRIAGE,
              status: WorkflowStatus.COMPLETED,
              source: AutomationSource.AI_ASSISTED,
              summary: `Suggested ${automation.aiResult.queue} with ${Math.round(automation.aiResult.confidence * 100)}% confidence.`,
              automationMinutesSaved: 8,
              startedAt: workflowTimes.triageComplete,
              completedAt: workflowTimes.noteComplete,
            },
            {
              workflowName: "SLA assignment",
              triggerType: WorkflowTrigger.SLA_ROUTING,
              status: WorkflowStatus.COMPLETED,
              source: AutomationSource.RULE_BASED,
              summary: `Assigned ${automation.slaProfile.name} (${automation.slaProfile.responseTargetMinutes}m / ${automation.slaProfile.resolutionTargetMinutes}m).`,
              automationMinutesSaved: 4,
              startedAt: workflowTimes.triageComplete,
              completedAt: workflowTimes.noteComplete,
            },
            {
              workflowName: "Internal note generation",
              triggerType: WorkflowTrigger.INTERNAL_NOTE,
              status: WorkflowStatus.COMPLETED,
              source: AutomationSource.AI_ASSISTED,
              summary: "Drafted technician-ready internal summary and next-step guidance.",
              automationMinutesSaved: 4,
              startedAt: workflowTimes.noteComplete,
              completedAt: workflowTimes.customerDraftComplete,
            },
            {
              workflowName: "Customer update draft",
              triggerType: WorkflowTrigger.CUSTOMER_UPDATE,
              status: WorkflowStatus.REVIEW_REQUIRED,
              source: AutomationSource.AI_ASSISTED,
              summary: "Prepared a customer-facing progress update pending human review.",
              automationMinutesSaved: 2,
              startedAt: workflowTimes.noteComplete,
              completedAt: workflowTimes.customerDraftComplete,
            },
          ],
        },
        auditEvents: {
          create: [
            {
              action: "Ticket received",
              details: `Requester ${input.requesterName} submitted ${input.subject}.`,
              source: AutomationSource.MANUAL,
              actorType: ActorType.REQUESTER,
              actorName: input.requesterName,
              createdAt,
            },
            {
              action: "Triage completed",
              details: automation.triageReasoning,
              source: AutomationSource.RULE_BASED,
              actorType: ActorType.SYSTEM,
              actorName: "Workflow Engine",
              createdAt: workflowTimes.triageComplete,
            },
            {
              action: "Technician note drafted",
              details: automation.internalSummary,
              source: AutomationSource.AI_ASSISTED,
              actorType: ActorType.SYSTEM,
              actorName: "AI Copilot",
              createdAt: workflowTimes.customerDraftComplete,
            },
          ],
        },
        approvals:
          automation.defaultApprovalType !== undefined
            ? {
                create: [
                  {
                    approvalType: automation.defaultApprovalType,
                    status: ApprovalStatus.PENDING,
                    requestedBy: "Automation Hub",
                    reason:
                      "Procurement actions require human approval before vendor engagement.",
                    requestedAt: workflowTimes.approvalQueued,
                  },
                ],
              }
            : undefined,
      },
      include: ticketDetailInclude,
    });

    if (automation.defaultApprovalType) {
      await tx.workflowRun.create({
        data: {
          ticketId: ticket.id,
          workflowName: "Approval gate",
          triggerType: WorkflowTrigger.APPROVAL_GATE,
          status: WorkflowStatus.PENDING_APPROVAL,
          source: AutomationSource.HUMAN_APPROVED,
          summary: "Sensitive action queued for approval review.",
          automationMinutesSaved: 3,
          startedAt: workflowTimes.customerDraftComplete,
          completedAt: workflowTimes.approvalQueued,
        },
      });

      await tx.auditEvent.create({
        data: {
          ticketId: ticket.id,
          action: "Approval requested",
          details: "Sensitive procurement action was routed to an approver.",
          source: AutomationSource.HUMAN_APPROVED,
          actorType: ActorType.SYSTEM,
          actorName: "Workflow Engine",
          createdAt: workflowTimes.approvalQueued,
        },
      });
    }

    return ticket;
  });
}

export async function requestApprovalForTicket(
  ticketId: string,
  rawInput: unknown,
) {
  const input = approvalRequestSchema.parse(rawInput);
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  const existingPending = await prisma.approval.findFirst({
    where: {
      ticketId,
      approvalType: input.approvalType,
      status: ApprovalStatus.PENDING,
    },
  });

  if (existingPending) {
    throw new Error("A pending approval of this type already exists for the ticket.");
  }

  const requestedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const approval = await tx.approval.create({
      data: {
        ticketId,
        approvalType: input.approvalType,
        status: ApprovalStatus.PENDING,
        requestedBy: input.requestedBy,
        reason: input.reason,
        requestedAt,
      },
      include: approvalRecordInclude,
    });

    await tx.workflowRun.create({
      data: {
        ticketId,
        workflowName: "Approval gate request",
        triggerType: WorkflowTrigger.APPROVAL_GATE,
        status: WorkflowStatus.PENDING_APPROVAL,
        source: AutomationSource.HUMAN_APPROVED,
        summary: `${input.approvalType} approval requested by ${input.requestedBy}.`,
        automationMinutesSaved: 2,
        startedAt: requestedAt,
        completedAt: requestedAt,
      },
    });

    await tx.auditEvent.create({
      data: {
        ticketId,
        action: "Approval requested",
        details: `${input.requestedBy} requested ${input.approvalType} approval. ${input.reason}`,
        source: AutomationSource.HUMAN_APPROVED,
        actorType: ActorType.TECHNICIAN,
        actorName: input.requestedBy,
        createdAt: requestedAt,
      },
    });

    return approval;
  });
}

export async function reviewCustomerUpdate(
  ticketId: string,
  rawInput: unknown,
) {
  const input = customerReviewSchema.parse(rawInput);
  const reviewedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        customerUpdateDraft: input.customerUpdateDraft,
        customerUpdateReviewedAt: reviewedAt,
        customerUpdateReviewedBy: input.reviewerName,
        updatedAt: reviewedAt,
      },
      include: ticketDetailInclude,
    });

    await tx.workflowRun.create({
      data: {
        ticketId,
        workflowName: "Customer update review",
        triggerType: WorkflowTrigger.CUSTOMER_UPDATE,
        status: WorkflowStatus.COMPLETED,
        source: AutomationSource.HUMAN_APPROVED,
        summary: `${input.reviewerName} reviewed and approved the customer-facing draft.`,
        automationMinutesSaved: 2,
        startedAt: reviewedAt,
        completedAt: reviewedAt,
      },
    });

    await tx.auditEvent.create({
      data: {
        ticketId,
        action: "Customer update reviewed",
        details: `${input.reviewerName} approved the outbound customer update draft.`,
        source: AutomationSource.HUMAN_APPROVED,
        actorType: ActorType.TECHNICIAN,
        actorName: input.reviewerName,
        createdAt: reviewedAt,
      },
    });

    return ticket;
  });
}

export async function decideApproval(
  approvalId: string,
  rawInput: unknown,
) {
  const input = approvalDecisionSchema.parse(rawInput);
  const approval = await prisma.approval.findUnique({
    where: { id: approvalId },
    include: {
      ticket: true,
    },
  });

  if (!approval) {
    throw new Error("Approval not found.");
  }

  if (approval.status !== ApprovalStatus.PENDING) {
    throw new Error("This approval has already been decided.");
  }

  const decidedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const updatedApproval = await tx.approval.update({
      where: { id: approvalId },
      data: {
        status:
          input.decision === "APPROVED"
            ? ApprovalStatus.APPROVED
            : ApprovalStatus.REJECTED,
        approverName: input.approverName,
        decisionNotes: input.decisionNotes || null,
        decidedAt,
      },
      include: approvalRecordInclude,
    });

    const ticketUpdate: Prisma.TicketUpdateInput = {};

    if (input.decision === "APPROVED") {
      if (approval.approvalType === ApprovalType.TIER3_ESCALATION) {
        ticketUpdate.status = TicketStatus.ESCALATED;
        ticketUpdate.suggestedQueue = "TIER3_APPLICATIONS";
      }

      if (approval.approvalType === ApprovalType.PROCUREMENT) {
        ticketUpdate.status = TicketStatus.WAITING_VENDOR;
      }

      if (approval.approvalType === ApprovalType.PRIORITY_CLOSURE) {
        ticketUpdate.status = TicketStatus.CLOSED;
      }
    }

    if (Object.keys(ticketUpdate).length > 0) {
      await tx.ticket.update({
        where: { id: approval.ticketId },
        data: {
          ...ticketUpdate,
          updatedAt: decidedAt,
        },
      });
    }

    await tx.workflowRun.create({
      data: {
        ticketId: approval.ticketId,
        workflowName: "Approval decision",
        triggerType: WorkflowTrigger.APPROVAL_GATE,
        status: WorkflowStatus.COMPLETED,
        source: AutomationSource.HUMAN_APPROVED,
        summary: `${input.approverName} ${input.decision.toLowerCase()} ${approval.approvalType}.`,
        automationMinutesSaved: 0,
        startedAt: decidedAt,
        completedAt: decidedAt,
      },
    });

    await tx.auditEvent.create({
      data: {
        ticketId: approval.ticketId,
        action: "Approval decision recorded",
        details: `${input.approverName} ${input.decision.toLowerCase()} ${approval.approvalType}. ${input.decisionNotes ?? ""}`.trim(),
        source: AutomationSource.HUMAN_APPROVED,
        actorType: ActorType.APPROVER,
        actorName: input.approverName,
        createdAt: decidedAt,
      },
    });

    return updatedApproval;
  });
}

export async function getDashboardData() {
  const generatedAt = new Date();
  const [tickets, approvals, opportunities] = await Promise.all([
    prisma.ticket.findMany({
      include: {
        company: true,
        approvals: true,
        slaProfile: true,
        workflowRuns: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    getApprovals(),
    getAutomationOpportunities(),
  ]);

  const totalTickets = tickets.length;
  const openTickets = [...tickets]
    .filter((ticket) => !isClosedStatus(ticket.status))
    .sort((left, right) => {
      const leftDue = left.dueResolutionAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const rightDue = right.dueResolutionAt?.getTime() ?? Number.MAX_SAFE_INTEGER;

      if (leftDue !== rightDue) {
        return leftDue - rightDue;
      }

      return right.createdAt.getTime() - left.createdAt.getTime();
    });
  const aiInfluencedTickets = tickets.filter((ticket) => {
    const ruleRoute = {
      category: ticket.ruleCategory,
      priority: ticket.rulePriority,
      queue: ticket.ruleQueue,
    };
    const aiRoute = {
      category: ticket.aiSuggestedCategory,
      priority: ticket.aiSuggestedPriority,
      queue: ticket.aiSuggestedQueue,
    };

    return (
      hasRoute(ruleRoute) &&
      hasRoute(aiRoute) &&
      !matchesRoute(
        {
          category: ruleRoute.category,
          priority: ruleRoute.priority,
          suggestedQueue: ruleRoute.queue,
        },
        aiRoute,
      ) &&
      matchesRoute(ticket, aiRoute)
    );
  }).length;
  const aiDivergenceCount = openTickets.filter((ticket) => {
    const ruleRoute = {
      category: ticket.ruleCategory,
      priority: ticket.rulePriority,
      queue: ticket.ruleQueue,
    };
    const aiRoute = {
      category: ticket.aiSuggestedCategory,
      priority: ticket.aiSuggestedPriority,
      queue: ticket.aiSuggestedQueue,
    };

    return (
      hasRoute(ruleRoute) &&
      hasRoute(aiRoute) &&
      !matchesRoute(
        {
          category: ruleRoute.category,
          priority: ruleRoute.priority,
          suggestedQueue: ruleRoute.queue,
        },
        aiRoute,
      )
    );
  }).length;
  const approvedCount = approvals.filter(
    (approval) => approval.status === ApprovalStatus.APPROVED,
  ).length;
  const decidedApprovals = approvals.filter(
    (approval) => approval.status !== ApprovalStatus.PENDING,
  ).length;
  const pendingApprovalRecords = approvals.filter(
    (approval) => approval.status === ApprovalStatus.PENDING,
  );
  const manualMinutesSaved = tickets.reduce(
    (total, ticket) => total + ticket.manualMinutesSaved,
    0,
  );
  const slaCompliant = tickets.filter((ticket) => {
    if (!ticket.dueResolutionAt) {
      return true;
    }

    if (isClosedStatus(ticket.status)) {
      return ticket.updatedAt.getTime() <= ticket.dueResolutionAt.getTime();
    }

    return !isOverdue(ticket.dueResolutionAt, ticket.status, generatedAt);
  }).length;
  const approvalAging = { over72: 0, h24to72: 0, h4to24: 0, under4: 0 };

  for (const approval of pendingApprovalRecords) {
    const hoursWaiting =
      (generatedAt.getTime() - approval.requestedAt.getTime()) / 3_600_000;

    if (hoursWaiting > 72) {
      approvalAging.over72++;
    } else if (hoursWaiting > 24) {
      approvalAging.h24to72++;
    } else if (hoursWaiting > 4) {
      approvalAging.h4to24++;
    } else {
      approvalAging.under4++;
    }
  }

  const oldestPendingApprovalDays =
    pendingApprovalRecords.length === 0
      ? 0
      : Math.max(
          ...pendingApprovalRecords.map(
            (approval) =>
              (generatedAt.getTime() - approval.requestedAt.getTime()) / 86_400_000,
          ),
        );

  const lastSevenDays = Array.from({ length: 7 }, (_, index) =>
    startOfDay(subDays(generatedAt, 6 - index)),
  );
  const ticketsByDay = lastSevenDays.map((day) => {
    const nextDay = addMinutes(day, 1440);
    const volume = tickets.filter(
      (ticket) => ticket.createdAt >= day && ticket.createdAt < nextDay,
    ).length;

    return {
      day: formatCompactDate(day),
      volume,
    };
  });

  const queueBreakdownMap = new Map<string, number>();
  const categoryBreakdownMap = new Map<string, number>();

  for (const ticket of tickets) {
    if (ticket.suggestedQueue) {
      queueBreakdownMap.set(
        ticket.suggestedQueue,
        (queueBreakdownMap.get(ticket.suggestedQueue) ?? 0) + 1,
      );
    }

    if (ticket.category) {
      categoryBreakdownMap.set(
        ticket.category,
        (categoryBreakdownMap.get(ticket.category) ?? 0) + 1,
      );
    }
  }

  const queueBreakdown = [...queueBreakdownMap.entries()]
    .map(([queue, volume]) => ({ queue, volume }))
    .sort((left, right) => right.volume - left.volume);

  const categoryBreakdown = [...categoryBreakdownMap.entries()]
    .map(([category, volume]) => ({ category, volume }))
    .sort((left, right) => right.volume - left.volume);

  const heatMap = new Map<
    string,
    { queue: string; p1p2: number; p3: number; p4: number; breach: number }
  >();

  for (const ticket of openTickets) {
    const queueName = ticket.suggestedQueue ?? "UNASSIGNED";
    const row = heatMap.get(queueName) ?? {
      queue: queueName,
      p1p2: 0,
      p3: 0,
      p4: 0,
      breach: 0,
    };

    if (isOverdue(ticket.dueResolutionAt, ticket.status, generatedAt)) {
      row.breach++;
    }

    if (ticket.priority === "P1_CRITICAL" || ticket.priority === "P2_HIGH") {
      row.p1p2++;
    } else if (ticket.priority === "P3_MEDIUM") {
      row.p3++;
    } else {
      row.p4++;
    }

    heatMap.set(queueName, row);
  }

  const overdueTickets = openTickets.filter((ticket) =>
    isOverdue(ticket.dueResolutionAt, ticket.status, generatedAt),
  );
  const activeQueues = new Set(
    openTickets.map((ticket) => ticket.suggestedQueue).filter(Boolean),
  ).size;

  return {
    generatedAt,
    lastTicketReceivedAt: tickets[0]?.createdAt ?? null,
    totals: {
      ticketsProcessed: totalTickets,
      aiInfluencedTickets,
      aiInfluenceRate:
        totalTickets === 0 ? 0 : (aiInfluencedTickets / totalTickets) * 100,
      approvalRate:
        decidedApprovals === 0 ? 0 : (approvedCount / decidedApprovals) * 100,
      manualMinutesSaved,
      slaCompliance: totalTickets === 0 ? 0 : (slaCompliant / totalTickets) * 100,
      pendingApprovals: pendingApprovalRecords.length,
      overdueTickets: overdueTickets.length,
      automationCandidates: opportunities.filter(
        (opportunity) => opportunity.automationFitScore >= 75,
      ).length,
    },
    queueSnapshot: {
      openTickets: openTickets.length,
      activeQueues,
      oldestPendingApprovalDays,
      approvalAging,
      aiDivergenceCount,
      heatRows: [...heatMap.values()].sort(
        (left, right) =>
          right.breach + right.p1p2 - (left.breach + left.p1p2),
      ),
      tickets: openTickets.slice(0, 6),
    },
    ticketsByDay,
    queueBreakdown,
    categoryBreakdown,
    recentTickets: tickets.slice(0, 6),
    highRiskTickets: tickets
      .filter((ticket) => ticket.riskLevel === "CRITICAL" || ticket.riskLevel === "HIGH")
      .slice(0, 5),
    approvalsSnapshot: {
      pending: pendingApprovalRecords.length,
      approved: approvedCount,
      rejected: approvals.filter((approval) => approval.status === ApprovalStatus.REJECTED)
        .length,
    },
    opportunityHighlights: opportunities.slice(0, 3),
  };
}
