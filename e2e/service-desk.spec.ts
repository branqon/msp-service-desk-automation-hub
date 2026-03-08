import { expect, test, type Locator, type Page } from "@playwright/test";

async function selectOptionByVisibleText(
  page: Page,
  label: string,
  optionText: string,
) {
  const select = page.getByLabel(label);
  const optionValue = await select
    .locator("option")
    .filter({ hasText: optionText })
    .first()
    .getAttribute("value");

  if (!optionValue) {
    throw new Error(`Could not find option "${optionText}" for ${label}.`);
  }

  await select.selectOption(optionValue);
}

function pendingApprovalCard(page: Page, subject: string): Locator {
  return page
    .getByTestId("pending-review-section")
    .getByTestId("pending-approval-card")
    .filter({ hasText: subject })
    .first();
}

test("submits a new ticket from the intake form and lands on the triage detail view", async ({
  page,
}) => {
  const uniqueSuffix = Date.now().toString().slice(-6);
  const requesterName = `E2E Analyst ${uniqueSuffix}`;
  const requesterEmail = `e2e.analyst.${uniqueSuffix}@portfolio.example`;
  const subject = `E2E onboarding bundle ${uniqueSuffix}`;

  await page.goto("/tickets/new");

  await selectOptionByVisibleText(page, "Company", "Summit Charter Schools");
  await page.getByLabel("Issue Type").selectOption("USER_ONBOARDING");
  await page.getByLabel("Requester Name").fill(requesterName);
  await page.getByLabel("Requester Email").fill(requesterEmail);
  await page.getByLabel("Requester Title").fill("Operations Coordinator");
  await page.getByLabel("Subject").fill(subject);
  await page.getByLabel("Urgency").selectOption("HIGH");
  await page.getByLabel("Impact").selectOption("DEPARTMENT");
  await page.getByLabel("Description").fill(
    "A new campus operations lead starts tomorrow and still needs Microsoft 365, VPN, and SIS access provisioned before first period.",
  );
  await page.getByLabel("Attachment Placeholder").fill("new-hire-checklist.pdf");

  await page.getByRole("button", { name: "Submit Ticket" }).click();

  await page.waitForURL(/\/tickets\/[^/]+$/);

  await expect(page.getByRole("heading", { name: subject })).toBeVisible();
  await expect(page.getByText(requesterName, { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Workflow History" })).toBeVisible();
  await expect(page.getByText("AI recommendation layer")).toBeVisible();
  await expect(
    page.getByText("No approvals recorded for this ticket yet."),
  ).toBeVisible();
});

test("approves a seeded pending approval from the approvals center", async ({ page }) => {
  const subject = "Conference room camera replacement request";
  const approverName = "Brandon Higginbotham";
  const decisionNotes = "Approved for the standard equipment refresh budget.";

  await page.goto("/approvals");

  const card = pendingApprovalCard(page, subject);
  await expect(card).toBeVisible();

  await card.getByLabel("Approver").fill(approverName);
  await card.getByLabel("Decision Notes").fill(decisionNotes);
  await card.getByRole("button", { name: "Approve" }).click();

  await expect(pendingApprovalCard(page, subject)).toHaveCount(0);
  const decisionRow = page
    .getByTestId("decision-history-section")
    .getByTestId("decision-history-row")
    .filter({
      hasText: subject,
    });

  await expect(decisionRow).toContainText(approverName);
  await expect(decisionRow).toContainText("Approved");
  await expect(decisionRow).toContainText(decisionNotes);
});
