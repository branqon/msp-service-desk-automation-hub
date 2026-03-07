import {
  ActorType,
  ApprovalStatus,
  ApprovalType,
  AutomationSource,
  SupportQueue,
  TicketStatus,
  WorkflowStatus,
  WorkflowTrigger,
} from "@prisma/client";
import { addMinutes, subDays, subHours } from "date-fns";

import {
  automationOpportunitySeedData,
  companySeedData,
  slaProfileSeedData,
} from "../src/lib/demo-seed";
import { prisma } from "../src/lib/db";
import { createTicket } from "../src/lib/service-desk";

const anchor = (() => {
  const value = new Date();
  value.setMinutes(0, 0, 0);
  return value;
})();

function lookupCompanyId(
  companies: Array<{ id: string; name: string }>,
  companyName: string,
) {
  const company = companies.find((item) => item.name === companyName);

  if (!company) {
    throw new Error(`Missing company ${companyName}`);
  }

  return company.id;
}

async function recordManualAction(input: {
  ticketId: string;
  at: Date;
  actorName: string;
  action: string;
  details: string;
  status?: TicketStatus;
  workflowName?: string;
}) {
  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: input.ticketId },
      data: {
        status: input.status,
        updatedAt: input.at,
      },
    });

    await tx.workflowRun.create({
      data: {
        ticketId: input.ticketId,
        workflowName: input.workflowName ?? "Technician action",
        triggerType: WorkflowTrigger.MANUAL_ACTION,
        status: WorkflowStatus.COMPLETED,
        source: AutomationSource.MANUAL,
        summary: input.details,
        automationMinutesSaved: 0,
        startedAt: input.at,
        completedAt: input.at,
      },
    });

    await tx.auditEvent.create({
      data: {
        ticketId: input.ticketId,
        action: input.action,
        details: input.details,
        source: AutomationSource.MANUAL,
        actorType: ActorType.TECHNICIAN,
        actorName: input.actorName,
        createdAt: input.at,
      },
    });
  });
}

async function recordCustomerReview(input: {
  ticketId: string;
  at: Date;
  reviewerName: string;
  customerUpdateDraft: string;
}) {
  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: input.ticketId },
      data: {
        customerUpdateDraft: input.customerUpdateDraft,
        customerUpdateReviewedAt: input.at,
        customerUpdateReviewedBy: input.reviewerName,
        updatedAt: input.at,
      },
    });

    await tx.workflowRun.create({
      data: {
        ticketId: input.ticketId,
        workflowName: "Customer update review",
        triggerType: WorkflowTrigger.CUSTOMER_UPDATE,
        status: WorkflowStatus.COMPLETED,
        source: AutomationSource.HUMAN_APPROVED,
        summary: `${input.reviewerName} reviewed the outbound update before send.`,
        automationMinutesSaved: 0,
        startedAt: input.at,
        completedAt: input.at,
      },
    });

    await tx.auditEvent.create({
      data: {
        ticketId: input.ticketId,
        action: "Customer update reviewed",
        details: `${input.reviewerName} finalized the customer-facing draft.`,
        source: AutomationSource.HUMAN_APPROVED,
        actorType: ActorType.TECHNICIAN,
        actorName: input.reviewerName,
        createdAt: input.at,
      },
    });
  });
}

async function requestApprovalSeed(input: {
  ticketId: string;
  approvalType: ApprovalType;
  requestedBy: string;
  reason: string;
  requestedAt: Date;
}) {
  const approval = await prisma.approval.create({
    data: {
      ticketId: input.ticketId,
      approvalType: input.approvalType,
      status: ApprovalStatus.PENDING,
      requestedBy: input.requestedBy,
      reason: input.reason,
      requestedAt: input.requestedAt,
    },
  });

  await prisma.workflowRun.create({
    data: {
      ticketId: input.ticketId,
      workflowName: "Approval gate request",
      triggerType: WorkflowTrigger.APPROVAL_GATE,
      status: WorkflowStatus.PENDING_APPROVAL,
      source: AutomationSource.HUMAN_APPROVED,
      summary: `${input.approvalType} approval requested by ${input.requestedBy}.`,
      automationMinutesSaved: 0,
      startedAt: input.requestedAt,
      completedAt: input.requestedAt,
    },
  });

  await prisma.auditEvent.create({
    data: {
      ticketId: input.ticketId,
      action: "Approval requested",
      details: `${input.requestedBy} requested ${input.approvalType}. ${input.reason}`,
      source: AutomationSource.HUMAN_APPROVED,
      actorType: ActorType.TECHNICIAN,
      actorName: input.requestedBy,
      createdAt: input.requestedAt,
    },
  });

  await prisma.ticket.update({
    where: { id: input.ticketId },
    data: { updatedAt: input.requestedAt },
  });

  return approval;
}

async function decideApprovalSeed(input: {
  approvalId: string;
  ticketId: string;
  approvalType: ApprovalType;
  status: "APPROVED" | "REJECTED";
  decidedAt: Date;
  approverName: string;
  decisionNotes: string;
}) {
  await prisma.$transaction(async (tx) => {
    await tx.approval.update({
      where: { id: input.approvalId },
      data: {
        status: input.status,
        approverName: input.approverName,
        decisionNotes: input.decisionNotes,
        decidedAt: input.decidedAt,
      },
    });

    const ticketUpdate: {
      status?: TicketStatus;
      suggestedQueue?: SupportQueue;
      updatedAt: Date;
    } = { updatedAt: input.decidedAt };

    if (input.status === ApprovalStatus.APPROVED) {
      if (input.approvalType === ApprovalType.PROCUREMENT) {
        ticketUpdate.status = TicketStatus.WAITING_VENDOR;
      }

      if (input.approvalType === ApprovalType.TIER3_ESCALATION) {
        ticketUpdate.status = TicketStatus.ESCALATED;
        ticketUpdate.suggestedQueue = "TIER3_APPLICATIONS";
      }

      if (input.approvalType === ApprovalType.PRIORITY_CLOSURE) {
        ticketUpdate.status = TicketStatus.CLOSED;
      }
    }

    await tx.ticket.update({
      where: { id: input.ticketId },
      data: ticketUpdate,
    });

    await tx.workflowRun.create({
      data: {
        ticketId: input.ticketId,
        workflowName: "Approval decision",
        triggerType: WorkflowTrigger.APPROVAL_GATE,
        status: WorkflowStatus.COMPLETED,
        source: AutomationSource.HUMAN_APPROVED,
        summary: `${input.approverName} ${input.status.toLowerCase()} ${input.approvalType}.`,
        automationMinutesSaved: 0,
        startedAt: input.decidedAt,
        completedAt: input.decidedAt,
      },
    });

    await tx.auditEvent.create({
      data: {
        ticketId: input.ticketId,
        action: "Approval decision recorded",
        details: `${input.approverName} ${input.status.toLowerCase()} ${input.approvalType}. ${input.decisionNotes}`,
        source: AutomationSource.HUMAN_APPROVED,
        actorType: ActorType.APPROVER,
        actorName: input.approverName,
        createdAt: input.decidedAt,
      },
    });
  });
}

async function main() {
  await prisma.auditEvent.deleteMany();
  await prisma.workflowRun.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.ticketAttachment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.ticketSequence.deleteMany();
  await prisma.requester.deleteMany();
  await prisma.automationOpportunity.deleteMany();
  await prisma.slaProfile.deleteMany();
  await prisma.company.deleteMany();

  await prisma.company.createMany({ data: companySeedData });
  await prisma.slaProfile.createMany({ data: slaProfileSeedData });
  await prisma.automationOpportunity.createMany({
    data: automationOpportunitySeedData,
  });

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
  });

  const passwordReset = await createTicket({
    companyId: lookupCompanyId(companies, "Northwind Health Group"),
    subject: "Password expired before morning rounds",
    issueType: "PASSWORD_RESET",
    urgency: "LOW",
    impact: "SINGLE_USER",
    description:
      "Unable to sign into the workstation at the front desk after overnight password expiry. Need access restored before the next patient wave.",
    requesterName: "Lisa Patel",
    requesterEmail: "lisa.patel@northwindhealth.example",
    requesterTitle: "Clinic Operations Manager",
    attachmentsNote: "login-screenshot.png",
    createdAt: subDays(anchor, 6),
  });

  await recordCustomerReview({
    ticketId: passwordReset.id,
    at: addMinutes(passwordReset.createdAt, 22),
    reviewerName: "Sarah Kim",
    customerUpdateDraft:
      "Your password reset has been completed and access is restored. Please sign out of any cached sessions and let us know if the issue returns.",
  });
  await recordManualAction({
    ticketId: passwordReset.id,
    at: addMinutes(passwordReset.createdAt, 28),
    actorName: "Sarah Kim",
    action: "Credential reset completed",
    details: "Validated identity, unlocked the account, and forced a secure password reset.",
    status: TicketStatus.RESOLVED,
    workflowName: "Identity remediation",
  });
  await recordManualAction({
    ticketId: passwordReset.id,
    at: addMinutes(passwordReset.createdAt, 74),
    actorName: "Sarah Kim",
    action: "Ticket closed",
    details: "Requester confirmed sign-in was successful on the next attempt.",
    status: TicketStatus.CLOSED,
    workflowName: "Closure confirmation",
  });

  const mfaIssue = await createTicket({
    companyId: lookupCompanyId(companies, "Harbor Legal Partners"),
    subject: "Managing partner locked out of MFA after phone replacement",
    issueType: "MFA_ISSUE",
    urgency: "HIGH",
    impact: "SINGLE_USER",
    description:
      "Managing partner replaced her phone and now cannot complete MFA prompts for email or document access. She has client calls this afternoon and needs access restored quickly.",
    requesterName: "Priya Shah",
    requesterEmail: "priya.shah@harborlegal.example",
    requesterTitle: "Managing Partner",
    requesterVip: true,
    attachmentsNote: "mfa-prompt-photo.jpg",
    createdAt: subHours(subDays(anchor, 1), 4),
  });

  await recordCustomerReview({
    ticketId: mfaIssue.id,
    at: addMinutes(mfaIssue.createdAt, 30),
    reviewerName: "Andre Mason",
    customerUpdateDraft:
      "We are re-establishing your MFA registration and validating your sign-in path. We will update you again once enrollment has been tested on the replacement device.",
  });
  await recordManualAction({
    ticketId: mfaIssue.id,
    at: addMinutes(mfaIssue.createdAt, 36),
    actorName: "Andre Mason",
    action: "Technician engaged",
    details: "Confirmed account health and began MFA re-registration on the replacement device.",
    status: TicketStatus.IN_PROGRESS,
    workflowName: "Priority identity follow-up",
  });

  const printerIssue = await createTicket({
    companyId: lookupCompanyId(companies, "Grayline Manufacturing"),
    subject: "Shipping station printer drops Zebra labels",
    issueType: "PRINTER_PROBLEM",
    urgency: "HIGH",
    impact: "DEPARTMENT",
    description:
      "The warehouse shipping printer is dropping labels mid-print and the team is hand-writing packing slips. This is affecting the outgoing shipment queue.",
    requesterName: "Tonya Mills",
    requesterEmail: "tonya.mills@grayline.example",
    requesterTitle: "Shipping Supervisor",
    attachmentsNote: "printer-error-photo.jpg",
    createdAt: subDays(anchor, 4),
  });

  await recordManualAction({
    ticketId: printerIssue.id,
    at: addMinutes(printerIssue.createdAt, 48),
    actorName: "Luis Romero",
    action: "Field services dispatched",
    details: "Replaced the damaged roll assembly and cleared the stalled spooler jobs on site.",
    status: TicketStatus.RESOLVED,
    workflowName: "On-site remediation",
  });
  await recordCustomerReview({
    ticketId: printerIssue.id,
    at: addMinutes(printerIssue.createdAt, 70),
    reviewerName: "Luis Romero",
    customerUpdateDraft:
      "The shipping printer has been restored and test labels are printing successfully. Please reopen the ticket if label output degrades again during the afternoon shift.",
  });

  const onboarding = await createTicket({
    companyId: lookupCompanyId(companies, "Summit Charter Schools"),
    subject: "New assistant principal starts Monday with no account bundle",
    issueType: "USER_ONBOARDING",
    urgency: "HIGH",
    impact: "DEPARTMENT",
    description:
      "A new assistant principal starts Monday and still needs Microsoft 365, SIS access, VPN, and a laptop assignment. HR is asking for a full readiness check before the start date.",
    requesterName: "Elena Torres",
    requesterEmail: "elena.torres@summitcharter.example",
    requesterTitle: "HR Generalist",
    attachmentsNote: "onboarding-checklist.pdf",
    createdAt: subDays(anchor, 2),
  });

  await recordManualAction({
    ticketId: onboarding.id,
    at: addMinutes(onboarding.createdAt, 75),
    actorName: "Marcus Lane",
    action: "Provisioning in progress",
    details: "Account creation tasks started, but SIS access and laptop staging are still outstanding.",
    status: TicketStatus.IN_PROGRESS,
    workflowName: "Onboarding execution",
  });

  const procurementApproved = await createTicket({
    companyId: lookupCompanyId(companies, "Redwood Property Management"),
    subject: "Laptop refresh for regional manager",
    issueType: "PROCUREMENT_REQUEST",
    urgency: "NORMAL",
    impact: "SINGLE_USER",
    description:
      "Regional manager needs a standard laptop refresh and dock replacement before next week's property visits. Please confirm the standard catalog option and get purchasing moving.",
    requesterName: "Sofia Nguyen",
    requesterEmail: "sofia.nguyen@redwoodpm.example",
    requesterTitle: "Regional Manager",
    requesterVip: true,
    attachmentsNote: "refresh-request.xlsx",
    createdAt: subDays(anchor, 5),
  });

  const procurementApprovalRecord = await prisma.approval.findFirstOrThrow({
    where: {
      ticketId: procurementApproved.id,
      approvalType: ApprovalType.PROCUREMENT,
    },
  });
  await decideApprovalSeed({
    approvalId: procurementApprovalRecord.id,
    ticketId: procurementApproved.id,
    approvalType: ApprovalType.PROCUREMENT,
    status: ApprovalStatus.APPROVED,
    decidedAt: addMinutes(procurementApproved.createdAt, 95),
    approverName: "Dana Collins",
    decisionNotes: "Standard hardware refresh approved against the existing budget.",
  });
  await recordCustomerReview({
    ticketId: procurementApproved.id,
    at: addMinutes(procurementApproved.createdAt, 105),
    reviewerName: "Dana Collins",
    customerUpdateDraft:
      "Your standard hardware refresh was approved and has moved to vendor processing. We will update you once shipping details are confirmed.",
  });

  const outageClosurePending = await createTicket({
    companyId: lookupCompanyId(companies, "Northwind Health Group"),
    subject: "Satellite clinic lost internet and VoIP service",
    issueType: "INTERNET_OUTAGE",
    urgency: "CRITICAL",
    impact: "DEPARTMENT",
    description:
      "The satellite clinic lost internet and phone service just after opening. Front-desk staff cannot access cloud scheduling and inbound patient calls are failing.",
    requesterName: "Jenna Brooks",
    requesterEmail: "jenna.brooks@northwindhealth.example",
    requesterTitle: "Finance Director",
    attachmentsNote: "firewall-status.png",
    createdAt: subHours(subDays(anchor, 1), 1),
  });

  await recordManualAction({
    ticketId: outageClosurePending.id,
    at: addMinutes(outageClosurePending.createdAt, 12),
    actorName: "Noah Reed",
    action: "Incident bridge opened",
    details: "Confirmed full site impact, engaged ISP, and notified the account team.",
    status: TicketStatus.IN_PROGRESS,
    workflowName: "Major incident response",
  });
  await recordManualAction({
    ticketId: outageClosurePending.id,
    at: addMinutes(outageClosurePending.createdAt, 102),
    actorName: "Noah Reed",
    action: "Service restored",
    details: "Failing circuit module was reseated and connectivity stabilized after ISP validation.",
    status: TicketStatus.RESOLVED,
    workflowName: "Incident restoration",
  });
  const closureApproval = await requestApprovalSeed({
    ticketId: outageClosurePending.id,
    approvalType: ApprovalType.PRIORITY_CLOSURE,
    requestedBy: "Noah Reed",
    reason: "Major incident restoration is complete and requires manager closure approval.",
    requestedAt: addMinutes(outageClosurePending.createdAt, 125),
  });
  await recordCustomerReview({
    ticketId: outageClosurePending.id,
    at: addMinutes(outageClosurePending.createdAt, 130),
    reviewerName: "Noah Reed",
    customerUpdateDraft:
      "Connectivity and voice service have been restored at the clinic. We are holding the incident in resolved state pending a final service manager review before closure.",
  });

  const emailIssue = await createTicket({
    companyId: lookupCompanyId(companies, "Harbor Legal Partners"),
    subject: "Court filing confirmations are not reaching shared mailbox",
    issueType: "EMAIL_DELIVERY",
    urgency: "HIGH",
    impact: "DEPARTMENT",
    description:
      "Several court filing confirmations are not landing in the litigation shared mailbox. The team can send mail, but inbound confirmations appear delayed or missing.",
    requesterName: "Owen Caldwell",
    requesterEmail: "owen.caldwell@harborlegal.example",
    requesterTitle: "Paralegal",
    attachmentsNote: "mail-trace-request.txt",
    createdAt: subDays(anchor, 3),
  });

  await recordCustomerReview({
    ticketId: emailIssue.id,
    at: addMinutes(emailIssue.createdAt, 38),
    reviewerName: "Maya Bell",
    customerUpdateDraft:
      "We traced the impacted messages and identified a filtering rule that requires adjustment. We are holding the ticket while you confirm whether any expected confirmations are still missing.",
  });
  await recordManualAction({
    ticketId: emailIssue.id,
    at: addMinutes(emailIssue.createdAt, 41),
    actorName: "Maya Bell",
    action: "Awaiting requester confirmation",
    details: "Mail flow trace completed and the mailbox is waiting on the legal team to confirm missing confirmations.",
    status: TicketStatus.WAITING_CUSTOMER,
    workflowName: "Customer follow-up hold",
  });

  const vpnIssue = await createTicket({
    companyId: lookupCompanyId(companies, "Redwood Property Management"),
    subject: "Remote leasing team cannot launch VPN from hotel network",
    issueType: "VPN_ACCESS",
    urgency: "HIGH",
    impact: "DEPARTMENT",
    description:
      "Three leasing coordinators are on the road and cannot launch the VPN from a hotel network. They are blocked from property management access and the app shows repeated credential failures.",
    requesterName: "Brandon Price",
    requesterEmail: "brandon.price@redwoodpm.example",
    requesterTitle: "Leasing Coordinator",
    attachmentsNote: "vpn-log.txt",
    createdAt: subHours(subDays(anchor, 2), 3),
  });

  await recordManualAction({
    ticketId: vpnIssue.id,
    at: addMinutes(vpnIssue.createdAt, 54),
    actorName: "Nina Alvarez",
    action: "Network investigation started",
    details: "Collected client logs and isolated a likely profile mismatch on the affected remote devices.",
    status: TicketStatus.IN_PROGRESS,
    workflowName: "Remote access troubleshooting",
  });

  const lobIssue = await createTicket({
    companyId: lookupCompanyId(companies, "Grayline Manufacturing"),
    subject: "Order entry app fails on shipping confirm step",
    issueType: "LOB_APPLICATION",
    urgency: "HIGH",
    impact: "DEPARTMENT",
    description:
      "The order entry application throws a database timeout every time the shipping team confirms an order. Dispatch cannot post shipments and finance reports are falling behind.",
    requesterName: "Marcus Reed",
    requesterEmail: "marcus.reed@grayline.example",
    requesterTitle: "Plant Manager",
    attachmentsNote: "order-entry-stacktrace.txt",
    createdAt: subHours(subDays(anchor, 1), 6),
  });

  await recordManualAction({
    ticketId: lobIssue.id,
    at: addMinutes(lobIssue.createdAt, 25),
    actorName: "Priya Monroe",
    action: "Tier 1 triage exhausted",
    details: "Captured reproduction details and confirmed the issue is not workstation-specific.",
    status: TicketStatus.IN_PROGRESS,
    workflowName: "Application triage",
  });
  const tier3Approval = await requestApprovalSeed({
    ticketId: lobIssue.id,
    approvalType: ApprovalType.TIER3_ESCALATION,
    requestedBy: "Priya Monroe",
    reason: "Core shipping workflow is blocked and the issue requires application engineering review.",
    requestedAt: addMinutes(lobIssue.createdAt, 37),
  });
  await decideApprovalSeed({
    approvalId: tier3Approval.id,
    ticketId: lobIssue.id,
    approvalType: ApprovalType.TIER3_ESCALATION,
    status: ApprovalStatus.APPROVED,
    decidedAt: addMinutes(lobIssue.createdAt, 56),
    approverName: "Alex Garner",
    decisionNotes: "Approved immediate tier 3 escalation due to operational impact.",
  });
  await recordManualAction({
    ticketId: lobIssue.id,
    at: addMinutes(lobIssue.createdAt, 70),
    actorName: "Alex Garner",
    action: "Tier 3 engaged",
    details: "Application engineering received diagnostics and began reviewing the failing confirm transaction.",
    status: TicketStatus.ESCALATED,
    workflowName: "Tier 3 handoff",
  });

  const securityEscalation = await createTicket({
    companyId: lookupCompanyId(companies, "Northwind Health Group"),
    subject: "Suspicious inbox rule and repeated MFA prompts",
    issueType: "SECURITY_ESCALATION",
    urgency: "CRITICAL",
    impact: "SINGLE_USER",
    description:
      "User reports repeated MFA prompts followed by a suspicious inbox forwarding rule. Possible account compromise and phishing follow-up. Need immediate containment.",
    requesterName: "Isaac Owens",
    requesterEmail: "isaac.owens@northwindhealth.example",
    requesterTitle: "Security Analyst",
    attachmentsNote: "ioc-summary.pdf",
    createdAt: subHours(anchor, 12),
  });

  await recordManualAction({
    ticketId: securityEscalation.id,
    at: addMinutes(securityEscalation.createdAt, 8),
    actorName: "Courtney Hale",
    action: "Containment started",
    details: "Forced session revocation, preserved mailbox evidence, and initiated conditional access review.",
    status: TicketStatus.IN_PROGRESS,
    workflowName: "Security containment",
  });

  const vipReset = await createTicket({
    companyId: lookupCompanyId(companies, "Harbor Legal Partners"),
    subject: "Executive password reset after travel lockout",
    issueType: "PASSWORD_RESET",
    urgency: "HIGH",
    impact: "SINGLE_USER",
    description:
      "Traveling partner was locked out after too many sign-in attempts from a new location. Needs access restored before joining a deposition remotely.",
    requesterName: "Nina Lopez",
    requesterEmail: "nina.lopez@harborlegal.example",
    requesterTitle: "Operations Lead",
    attachmentsNote: "vpn-signin-screenshot.png",
    createdAt: subHours(subDays(anchor, 1), 8),
  });

  await recordManualAction({
    ticketId: vipReset.id,
    at: addMinutes(vipReset.createdAt, 20),
    actorName: "Andre Mason",
    action: "Reset complete",
    details: "Reset the password, verified sign-in, and confirmed the lockout source was travel-based.",
    status: TicketStatus.RESOLVED,
    workflowName: "Executive identity recovery",
  });
  await recordManualAction({
    ticketId: vipReset.id,
    at: addMinutes(vipReset.createdAt, 55),
    actorName: "Andre Mason",
    action: "Ticket closed",
    details: "Partner successfully joined the deposition and no further action was needed.",
    status: TicketStatus.CLOSED,
    workflowName: "Closure confirmation",
  });

  const procurementPending = await createTicket({
    companyId: lookupCompanyId(companies, "Summit Charter Schools"),
    subject: "Conference room camera replacement request",
    issueType: "PROCUREMENT_REQUEST",
    urgency: "LOW",
    impact: "DEPARTMENT",
    description:
      "Main campus conference room needs a camera replacement before the next board session. Please source a standard device and confirm whether the request should go against facilities or IT budget.",
    requesterName: "Mia Foster",
    requesterEmail: "mia.foster@summitcharter.example",
    requesterTitle: "Front Desk Coordinator",
    attachmentsNote: "camera-room-photo.jpg",
    createdAt: subHours(anchor, 8),
  });

  const printerOpen = await createTicket({
    companyId: lookupCompanyId(companies, "Summit Charter Schools"),
    subject: "Front office printer jams on enrollment packets",
    issueType: "PRINTER_PROBLEM",
    urgency: "NORMAL",
    impact: "DEPARTMENT",
    description:
      "The front office printer jams every time staff tries to print enrollment packets. Families are waiting in the lobby and packet printing is inconsistent.",
    requesterName: "Caleb Ward",
    requesterEmail: "caleb.ward@summitcharter.example",
    requesterTitle: "Campus Principal",
    requesterVip: true,
    attachmentsNote: "printer-tray-photo.jpg",
    createdAt: subHours(anchor, 7),
  });

  await recordManualAction({
    ticketId: printerOpen.id,
    at: addMinutes(printerOpen.createdAt, 26),
    actorName: "Luis Romero",
    action: "Awaiting spare part",
    details: "Confirmed tray sensor failure and queued a spare part from field stock.",
    status: TicketStatus.TRIAGED,
    workflowName: "Hardware diagnosis",
  });

  const currentOutage = await createTicket({
    companyId: lookupCompanyId(companies, "Redwood Property Management"),
    subject: "Downtown leasing office internet unstable after ISP maintenance",
    issueType: "INTERNET_OUTAGE",
    urgency: "CRITICAL",
    impact: "DEPARTMENT",
    description:
      "After overnight ISP maintenance, the downtown leasing office has intermittent connectivity and voice drops. Staff can only work for a few minutes before the line falls over again.",
    requesterName: "Aaron Kim",
    requesterEmail: "aaron.kim@redwoodpm.example",
    requesterTitle: "Property Administrator",
    attachmentsNote: "wan-latency-export.csv",
    createdAt: subHours(anchor, 3),
  });

  await recordManualAction({
    ticketId: currentOutage.id,
    at: addMinutes(currentOutage.createdAt, 18),
    actorName: "Noah Reed",
    action: "Network team engaged",
    details: "Validated packet loss patterns and opened an urgent carrier escalation.",
    status: TicketStatus.IN_PROGRESS,
    workflowName: "Carrier escalation",
  });

  const emailResolved = await createTicket({
    companyId: lookupCompanyId(companies, "Northwind Health Group"),
    subject: "Invoice approvals quarantined by transport rule",
    issueType: "EMAIL_DELIVERY",
    urgency: "HIGH",
    impact: "DEPARTMENT",
    description:
      "Finance approval emails from a trusted vendor started landing in quarantine after a transport rule change. AP cannot process invoices until the approval chain resumes.",
    requesterName: "Jenna Brooks",
    requesterEmail: "jenna.brooks@northwindhealth.example",
    requesterTitle: "Finance Director",
    attachmentsNote: "message-trace.csv",
    createdAt: subHours(anchor, 5),
  });

  await recordManualAction({
    ticketId: emailResolved.id,
    at: addMinutes(emailResolved.createdAt, 44),
    actorName: "Maya Bell",
    action: "Mail flow restored",
    details: "Adjusted the transport rule exception and released the quarantined invoice approvals.",
    status: TicketStatus.RESOLVED,
    workflowName: "Mail flow remediation",
  });
  await recordCustomerReview({
    ticketId: emailResolved.id,
    at: addMinutes(emailResolved.createdAt, 52),
    reviewerName: "Maya Bell",
    customerUpdateDraft:
      "The mail flow issue has been corrected and the quarantined vendor approvals were released. Please confirm the finance team can process invoice approvals normally again.",
  });

  await prisma.ticket.update({
    where: { id: closureApproval.ticketId },
    data: { updatedAt: addMinutes(outageClosurePending.createdAt, 130) },
  });

  await prisma.ticket.update({
    where: { id: procurementPending.id },
    data: { updatedAt: addMinutes(procurementPending.createdAt, 18) },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
