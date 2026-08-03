import { expect, test } from "@playwright/test";

test("imports, invites, redeems, and revokes a grant", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Admin" })).toBeVisible();

  await page.getByRole("link", { name: "Program" }).click();
  await expect(page.getByRole("heading", { name: "Program" })).toBeVisible();

  await page
    .getByLabel("Grantee CSV")
    .setInputFiles("tests/fixtures/grantees.csv");
  await page.getByRole("button", { name: "Import" }).click();
  await expect(page.getByText(/(1 inserted|1 unchanged)/)).toBeVisible();

  await page.getByRole("link", { name: "Grants" }).click();
  await expect(page.getByRole("heading", { name: "Grants" })).toBeVisible();

  while ((await page.getByRole("button", { name: "Revoke" }).count()) > 0) {
    await page.getByRole("button", { name: "Revoke" }).first().click();
    await page.getByRole("button", { name: "Revoke grant" }).click();
    await expect(page.getByText("Grant revoked.")).toBeVisible();
  }

  await page.getByRole("link", { name: "Program" }).click();
  await page.getByLabel("Program name").fill("Browser smoke");
  const tomorrow = new Date(Date.now() + 86_400_000)
    .toISOString()
    .slice(0, 16);
  await page.getByLabel("Expires").fill(tomorrow);
  await page.getByLabel("Max redemptions").fill("1");
  await page.getByRole("button", { name: "Create invite" }).click();

  const inviteCode = page.locator("code").filter({ hasText: "/redeem/" });
  await expect(inviteCode).toBeVisible();
  const inviteUrl = (await inviteCode.textContent())!.trim();
  await page.goto(inviteUrl);

  await page
    .getByLabel("Registration email")
    .fill("lewiscirne@mac.com");
  await page.getByRole("button", { name: "Get API key" }).click();
  await expect(page.getByTestId("issued-key")).toContainText("sk-fake-");
  await expect(page.getByText("Copy this key now")).toBeVisible();
  await expect(
    page.getByText(/Refreshing or closing this page permanently loses/),
  ).toBeVisible();

  await page.goto("/admin/grants");
  const grantRow = page.getByRole("row").filter({
    hasText: "lewiscirne@mac.com",
  });
  await expect(grantRow.getByText("active")).toBeVisible();
  await grantRow.getByRole("button", { name: "Revoke" }).click();
  await page.getByRole("button", { name: "Revoke grant" }).click();
  await expect(page.getByText("Grant revoked.")).toBeVisible();
  await expect(
    page.getByRole("row").filter({ hasText: "lewiscirne@mac.com" }).first(),
  ).toContainText("revoked");

  expect(consoleErrors).toEqual([]);
});
