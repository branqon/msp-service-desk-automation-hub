import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { companySeedData, slaProfileSeedData } from "@/lib/demo-seed";

type ServiceDeskModule = typeof import("../service-desk");
type DbModule = typeof import("../db");

const rootDir = fileURLToPath(new URL("../../../", import.meta.url));
const prismaDir = resolve(rootDir, "prisma");
const testDbFile = resolve(prismaDir, "service-desk-test.db");
const testDbUrl = "file:./service-desk-test.db";

let prisma: PrismaClient;
let createTicket: ServiceDeskModule["createTicket"];
let decideApproval: ServiceDeskModule["decideApproval"];
let reviewCustomerUpdate: ServiceDeskModule["reviewCustomerUpdate"];

function removeTestDatabase() {
  for (const suffix of ["", "-journal", "-shm", "-wal"]) {
    const candidate = `${testDbFile}${suffix}`;

    if (existsSync(candidate)) {
      rmSync(candidate, { force: true });
    }
  }
}

async function seedReferenceData(client: PrismaClient) {
  await client.company.createMany({ data: companySeedData });
  await client.slaProfile.createMany({ data: slaProfileSeedData });
}

describe("service desk workflow integration", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = testDbUrl;
    removeTestDatabase();
    execSync("npx prisma db push --skip-generate", {
      cwd: rootDir,
      env: {
        ...process.env,
        DATABASE_URL: testDbUrl,
      },
      stdio: "pipe",
    });

    vi.resetModules();

    const dbModule = (await import("../db")) as DbModule;
    const serviceDeskModule = (await import("../service-desk")) as ServiceDeskModule;

    prisma = dbModule.prisma;
    createTicket = serviceDeskModule.createTicket;
    decideApproval = serviceDeskModule.decideApproval;
    reviewCustomerUpdate = serviceDeskModule.reviewCustomerUpdate;

    await seedReferenceData(prisma);
  });

  beforeEach(async () => {
    await prisma.auditEvent.deleteMany();
    await prisma.workflowRun.deleteMany();
    await prisma.approval.deleteMany();
    await prisma.ticketAttachment.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.ticketSequence.deleteMany();
    await prisma.requester.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    removeTestDatabase();
  });

  it("keeps requesters scoped to their company and issues stable sequence-backed ticket numbers", async () => {
    const [firstCompany, secondCompany] = await prisma.company.findMany({
      orderBy: { name: "asc" },
      take: 2,
    });
    const sharedEmail = "jamie.lee@shared-client.example";
    const createdAt = new Date("2026-02-03T14:00:00Z");

    const firstTicket = await createTicket({
      companyId: firstCompany.id,
      subject: "Password reset needed before payroll run",
      issueType: "PASSWORD_RESET",
      urgency: "HIGH",
      impact: "SINGLE_USER",
      description:
        "Requester is locked out of the payroll workstation and needs a password reset before the afternoon processing window.",
      requesterName: "Jamie Lee",
      requesterEmail: sharedEmail,
      requesterTitle: "Payroll Specialist",
      createdAt,
    });

    const secondTicket = await createTicket({
      companyId: secondCompany.id,
      subject: "MFA re-registration after device replacement",
      issueType: "MFA_ISSUE",
      urgency: "HIGH",
      impact: "SINGLE_USER",
      description:
        "Requester replaced their phone and needs MFA restored before logging into shared legal systems.",
      requesterName: "Jamie Lee",
      requesterEmail: sharedEmail,
      requesterTitle: "Payroll Specialist",
      createdAt: new Date("2026-02-03T14:20:00Z"),
    });

    const scopedRequesters = await prisma.requester.findMany({
      where: { email: sharedEmail },
      orderBy: { companyId: "asc" },
    });

    expect(scopedRequesters).toHaveLength(2);
    expect(new Set(scopedRequesters.map((requester) => requester.companyId)).size).toBe(2);
    expect(firstTicket.requesterId).not.toBe(secondTicket.requesterId);
    expect(firstTicket.ticketNumber).toBe("MSP-2026-0001");
    expect(secondTicket.ticketNumber).toBe("MSP-2026-0002");
  });

  it("creates a procurement ticket, records human review, and updates the ticket on approval", async () => {
    const company = await prisma.company.findFirstOrThrow({
      where: { name: "Redwood Property Management" },
    });

    const ticket = await createTicket({
      companyId: company.id,
      subject: "Laptop refresh for regional manager",
      issueType: "PROCUREMENT_REQUEST",
      urgency: "NORMAL",
      impact: "SINGLE_USER",
      description:
        "Regional manager needs a standard laptop refresh before next week's property visits and purchasing cannot proceed without approval.",
      requesterName: "Sofia Nguyen",
      requesterEmail: "sofia.nguyen@redwoodpm.example",
      requesterTitle: "Regional Manager",
      requesterVip: true,
      attachmentsNote: "refresh-request.xlsx",
      createdAt: new Date("2026-02-04T15:00:00Z"),
    });

    expect(ticket.approvals).toHaveLength(1);
    expect(ticket.approvals[0]?.status).toBe("PENDING");

    const reviewedTicket = await reviewCustomerUpdate(ticket.id, {
      reviewerName: "Dana Collins",
      customerUpdateDraft:
        "Your hardware refresh request was validated and is pending the final purchasing approval before vendor engagement.",
    });

    expect(reviewedTicket.customerUpdateReviewedBy).toBe("Dana Collins");

    const approvalDecision = await decideApproval(ticket.approvals[0]!.id, {
      decision: "APPROVED",
      approverName: "Dana Collins",
      decisionNotes: "Approved against the standard hardware refresh budget.",
    });

    expect(approvalDecision.status).toBe("APPROVED");

    const persistedTicket = await prisma.ticket.findUniqueOrThrow({
      where: { id: ticket.id },
      include: {
        approvals: true,
        auditEvents: true,
        workflowRuns: true,
      },
    });

    expect(persistedTicket.status).toBe("WAITING_VENDOR");
    expect(persistedTicket.customerUpdateReviewedBy).toBe("Dana Collins");
    expect(
      persistedTicket.workflowRuns.some(
        (workflowRun) => workflowRun.triggerType === "APPROVAL_GATE",
      ),
    ).toBe(true);
    expect(
      persistedTicket.auditEvents.some(
        (event) =>
          event.action === "Approval decision recorded" &&
          event.actorName === "Dana Collins",
      ),
    ).toBe(true);
    expect(
      persistedTicket.workflowRuns.some(
        (workflowRun) =>
          workflowRun.workflowName === "Approval decision" &&
          workflowRun.status === "COMPLETED",
      ),
    ).toBe(true);
  });
});
