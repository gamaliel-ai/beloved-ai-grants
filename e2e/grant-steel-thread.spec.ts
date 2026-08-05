import { expect, test } from "@playwright/test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { AUTH_TEST_MCP_TOKEN } from "@/lib/auth/admin-auth";

async function withMcpClient<T>(
  fn: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client({ name: "e2e", version: "0.0.0" });
  const transport = new StreamableHTTPClientTransport(
    new URL("http://127.0.0.1:3002/api/mcp"),
    {
      requestInit: {
        headers: {
          Authorization: `Bearer ${AUTH_TEST_MCP_TOKEN}`,
        },
      },
    },
  );
  await client.connect(transport);
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}

function toolText(result: unknown): string {
  if (!result || typeof result !== "object") return "";
  const content = (result as { content?: { type: string; text?: string }[] })
    .content;
  if (!Array.isArray(content)) return "";
  return content.find((part) => part.type === "text")?.text ?? "";
}

test("mcp upsert/invite, browser redeem, dashboard revoke", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // Clean any leftover active grants via MCP + dashboard if present.
  while ((await page.getByRole("button", { name: "Revoke" }).count()) > 0) {
    await page.getByRole("button", { name: "Revoke" }).first().click();
    await page.getByRole("button", { name: "Revoke grant" }).click();
    await expect(page.getByText("Grant revoked.")).toBeVisible();
  }

  const redeemUrl = await withMcpClient(async (client) => {
    const upsert = await client.callTool({
      name: "upsert_grantee",
      arguments: {
        name: "Lewis Cirne",
        email: "lewiscirne@mac.com",
      },
    });
    expect(upsert.isError).toBeFalsy();

    const invite = await client.callTool({
      name: "create_program_invite",
      arguments: {
        name: "Browser smoke",
        expires_at: new Date(Date.now() + 86_400_000).toISOString(),
        max_redemptions: 1,
      },
    });
    expect(invite.isError).toBeFalsy();
    const payload = JSON.parse(toolText(invite)) as { redeemUrl: string };
    expect(payload.redeemUrl).toContain("/redeem/");
    return payload.redeemUrl;
  });

  await page.goto(redeemUrl);
  await page.getByLabel("Registration email").fill("lewiscirne@mac.com");
  await page.getByRole("button", { name: "Get API key" }).click();
  await expect(page.getByTestId("issued-key")).toContainText("sk-fake-");
  await expect(page.getByText("Copy this key now")).toBeVisible();

  await page.goto("/admin");
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
