/**
 * Seed realistic admin-dashboard demo data via the running Next.js server.
 *
 * Drives UI flows so FakeOpenAIAdminGateway projects live in the same process
 * as Sync usage (in-memory gateway is per-process).
 *
 * Usage (dev server must already be up with AUTH_TEST_BYPASS + OPENAI_MODE=fake):
 *   bun scripts/seed-admin-demo.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium, type Page } from "@playwright/test";

const BASE_URL = process.env.APP_URL ?? "http://localhost:3000";

const GRANTEES = [
  { name: "Lewis Cirne", email: "lewiscirne@mac.com" },
  { name: "Ada Lovelace", email: "ada@example.com" },
  { name: "Grace Hopper", email: "grace@example.com" },
] as const;

async function writeDemoCsv(dir: string) {
  const path = join(dir, "grantees-demo.csv");
  const body = [
    "name,email",
    ...GRANTEES.map((g) => `${g.name},${g.email}`),
    "",
  ].join("\n");
  await writeFile(path, body, "utf8");
  return path;
}

async function revokeAllActiveGrants(page: Page) {
  await page.goto(`${BASE_URL}/admin/grants`);
  await page.getByRole("heading", { name: "Grants" }).waitFor();

  while ((await page.getByRole("button", { name: "Revoke" }).count()) > 0) {
    await page.getByRole("button", { name: "Revoke" }).first().click();
    await page.getByRole("button", { name: "Revoke grant" }).click();
    await page.getByText("Grant revoked.").waitFor();
  }
}

async function importAllowlist(page: Page, csvPath: string) {
  await page.goto(`${BASE_URL}/admin/program`);
  await page.getByRole("heading", { name: "Program" }).waitFor();
  await page.getByLabel("Grantee CSV").setInputFiles(csvPath);
  await page.getByRole("button", { name: "Import" }).click();
  await page.getByText(/\d+ inserted|\d+ updated|\d+ unchanged/).waitFor();
  const notice = await page
    .locator("[data-slot='alert'], .text-sm")
    .filter({ hasText: /inserted|updated|unchanged/ })
    .first()
    .textContent()
    .catch(() => null);
  console.log("Import:", notice?.trim() ?? "ok");
}

async function createInvite(page: Page) {
  await page.goto(`${BASE_URL}/admin/program`);
  await page.getByLabel("Program name").fill("Admin demo cohort");
  const expiry = new Date(Date.now() + 7 * 86_400_000)
    .toISOString()
    .slice(0, 16);
  await page.getByLabel("Expires").fill(expiry);
  await page.getByLabel("Max redemptions").fill(String(GRANTEES.length));
  await page.getByRole("button", { name: "Create invite" }).click();

  // Prefer the post-create invite URL; avoid the docs snippet "/redeem/[token]".
  const inviteCode = page
    .locator("code")
    .filter({ hasText: /\/redeem\/[A-Za-z0-9_-]{8,}/ });
  await inviteCode.waitFor();
  let inviteUrl = (await inviteCode.textContent())!.trim();
  if (inviteUrl.startsWith("/")) {
    inviteUrl = `${BASE_URL}${inviteUrl}`;
  }
  console.log("Invite:", inviteUrl);
  return inviteUrl;
}

async function redeem(page: Page, inviteUrl: string, email: string) {
  await page.goto(inviteUrl);
  await page.getByLabel("Registration email").fill(email);
  await page.getByRole("button", { name: "Get API key" }).click();
  const key = page.getByTestId("issued-key");
  await key.waitFor();
  const keyText = (await key.textContent())!.trim();
  if (!keyText.includes("sk-fake-")) {
    throw new Error(`Expected fake key for ${email}, got: ${keyText}`);
  }
  console.log(`Redeemed ${email} → ${keyText.slice(0, 24)}…`);
}

async function syncUsage(page: Page) {
  await page.goto(`${BASE_URL}/admin`);
  await page.getByRole("heading", { name: "Dashboard" }).waitFor();
  await page.getByRole("button", { name: "Sync usage" }).click();
  await page.getByText(/Synced \d+ usage bucket/).waitFor();
  const notice = await page.getByText(/Synced \d+ usage bucket/).textContent();
  console.log(notice?.trim());
}

async function readDashboardMetrics(page: Page) {
  await page.goto(`${BASE_URL}/admin`);
  await page.getByRole("heading", { name: "Dashboard" }).waitFor();

  const cards = page.locator(".text-2xl.font-semibold");
  const labels = ["Active grants", "Pending applications", "Total spend", "Tokens / requests", "Eligible, no grant"];
  const values: Record<string, string> = {};
  const count = await cards.count();
  for (let i = 0; i < Math.min(count, labels.length); i++) {
    values[labels[i]!] = ((await cards.nth(i).textContent()) ?? "").trim();
  }

  const spend = values["Total spend"] ?? "";
  if (!spend || spend === "—" || spend === "$0.00") {
    // $0.00 would be surprising with synthetic usage; treat dash as failure.
    if (spend === "—") {
      throw new Error(
        `Dashboard Total spend is still "—" — sync may not have populated usage. Metrics: ${JSON.stringify(values)}`,
      );
    }
  }

  return values;
}

async function main() {
  const tmpDir = join(process.cwd(), "data", "seed-tmp");
  await mkdir(tmpDir, { recursive: true });
  const csvPath = await writeDemoCsv(tmpDir);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log(`Seeding against ${BASE_URL}`);

    await revokeAllActiveGrants(page);
    await importAllowlist(page, csvPath);
    const inviteUrl = await createInvite(page);

    for (const grantee of GRANTEES) {
      await redeem(page, inviteUrl, grantee.email);
    }

    await syncUsage(page);
    const metrics = await readDashboardMetrics(page);

    console.log("\nDashboard metrics:");
    for (const [label, value] of Object.entries(metrics)) {
      console.log(`  ${label}: ${value}`);
    }

    if (metrics["Total spend"] === "—") {
      process.exitCode = 1;
      console.error("\nFAILED: Total spend still shows em dash.");
    } else {
      console.log("\nOK: Dashboard shows non-dash spend values.");
      console.log(
        `Seeded ${GRANTEES.length} grantees/grants: ${GRANTEES.map((g) => g.email).join(", ")}`,
      );
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
