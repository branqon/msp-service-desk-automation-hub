import { chromium } from "@playwright/test";
import { mkdirSync, renameSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const rootDir = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const videoDir = join(rootDir, "scripts", ".demo-video");
const outPath = join(rootDir, "docs", "demo.webm");

mkdirSync(videoDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
});
await context.addInitScript(() => {
  try { localStorage.setItem("msp-theme", "light"); } catch {}
});

const page = await context.newPage();

async function hold(ms) {
  await page.waitForTimeout(ms);
}

// 1) Queue workbench
await page.goto(`${BASE}/tickets`, { waitUntil: "networkidle" });
await hold(1500);

// 2) Type a filter
await page.getByPlaceholder(/Search subject/).click();
await page.getByPlaceholder(/Search subject/).pressSequentially("onboarding", { delay: 70 });
await hold(500);
await page.getByRole("button", { name: "Search" }).click();
await page.waitForLoadState("networkidle");
await hold(1500);

// 3) Clear and open a ticket
await page.getByRole("button", { name: "Clear" }).click();
await page.waitForLoadState("networkidle");
await hold(800);
const firstLink = page.locator('main ul li a[href^="/tickets/"]').first();
await firstLink.click();
await page.waitForLoadState("networkidle");
await hold(1500);

// 4) Scroll down to the customer-update draft
await page.evaluate(() => window.scrollTo({ top: 900, behavior: "smooth" }));
await hold(1500);
await page.evaluate(() => window.scrollTo({ top: 1600, behavior: "smooth" }));
await hold(1200);

// 5) Edit the draft to show the diff view
const ta = page.locator('textarea[name="customerUpdateDraft"]');
await ta.click();
await ta.press("End");
await ta.pressSequentially(" Next update Friday.", { delay: 55 });
await hold(1400);

// 6) Jump to approvals
await page.goto(`${BASE}/approvals`, { waitUntil: "networkidle" });
await hold(1500);

// 7) Toggle to dark mode
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await hold(800);
const toggle = page.getByRole("button", { name: /Switch to dark mode/i }).first();
if (await toggle.count()) {
  await toggle.click();
  await hold(1200);
}

// 8) One more stop on the workbench in dark mode
await page.goto(`${BASE}/tickets`, { waitUntil: "networkidle" });
await hold(1500);

await context.close();
await browser.close();

// Pick the produced webm and move it into docs/
const files = readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
if (files.length === 0) {
  throw new Error("no video file recorded");
}
const src = join(videoDir, files[0]);
if (existsSync(outPath)) {
  // overwrite
  renameSync(src, outPath);
} else {
  renameSync(src, outPath);
}
console.log(`wrote ${outPath}`);
