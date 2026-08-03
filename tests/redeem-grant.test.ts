import { readFile } from "node:fs/promises";
import { count, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { apiKeys, grants } from "@/lib/db/schema";
import { importGranteesCsv } from "@/lib/grants/import-grantees";
import { createProgramInvite } from "@/lib/grants/invites";
import { redeemGrant } from "@/lib/grants/redeem";
import { FakeOpenAIAdminGateway } from "@/lib/openai/gateway";
import { migratedTestDb } from "./helpers/database";

async function setup() {
  const result = await migratedTestDb();
  const csv = await readFile("tests/fixtures/grantees.csv", "utf8");
  await importGranteesCsv(result.db, csv);
  const { token } = await createProgramInvite(result.db, {
    name: "Test cohort",
    actor: "admin@example.com",
    expiresAt: new Date(Date.now() + 60_000),
    maxRedemptions: 2,
  });
  return { ...result, token };
}

describe("grant redemption", () => {
  it("returns the secret once without persisting it", async () => {
    const { db, client, token } = await setup();
    const gateway = new FakeOpenAIAdminGateway();
    try {
      const result = await redeemGrant({
        db,
        gateway,
        inviteToken: token,
        email: " LewisCirne@mac.com ",
        ipAddress: "127.0.0.1",
      });

      expect(result.secret).toMatch(/^sk-fake-/);
      const [key] = await db.select().from(apiKeys);
      expect(key.redactedValue).toMatch(/^sk-…/);
      expect(JSON.stringify(key)).not.toContain(result.secret);
      const [grant] = await db.select().from(grants);
      expect(grant.status).toBe("active");
    } finally {
      await client.close();
    }
  });

  it("does not mint a second active grant for the same email", async () => {
    const { db, client, token } = await setup();
    const gateway = new FakeOpenAIAdminGateway();
    try {
      await redeemGrant({
        db,
        gateway,
        inviteToken: token,
        email: "lewiscirne@mac.com",
        ipAddress: "127.0.0.1",
      });

      await expect(
        redeemGrant({
          db,
          gateway,
          inviteToken: token,
          email: "lewiscirne@mac.com",
          ipAddress: "127.0.0.2",
        }),
      ).rejects.toMatchObject({
        code: "ALREADY_REDEEMED",
      });
      const [total] = await db.select({ value: count() }).from(grants);
      expect(Number(total.value)).toBe(1);
      expect(gateway.projects.size).toBe(1);
    } finally {
      await client.close();
    }
  });

  it("serializes concurrent submits into one active grant", async () => {
    const { db, client, token } = await setup();
    const gateway = new FakeOpenAIAdminGateway();
    try {
      const attempts = await Promise.allSettled([
        redeemGrant({
          db,
          gateway,
          inviteToken: token,
          email: "lewiscirne@mac.com",
          ipAddress: "127.0.0.1",
        }),
        redeemGrant({
          db,
          gateway,
          inviteToken: token,
          email: "lewiscirne@mac.com",
          ipAddress: "127.0.0.2",
        }),
      ]);

      expect(attempts.filter((result) => result.status === "fulfilled")).toHaveLength(
        1,
      );
      const [total] = await db
        .select({ value: count() })
        .from(grants)
        .where(eq(grants.status, "active"));
      expect(Number(total.value)).toBe(1);
      expect(gateway.projects.size).toBe(1);
    } finally {
      await client.close();
    }
  });

  it("marks failure and archives a partially created project", async () => {
    const { db, client, token } = await setup();
    const gateway = new FakeOpenAIAdminGateway("createServiceAccount");
    try {
      await expect(
        redeemGrant({
          db,
          gateway,
          inviteToken: token,
          email: "lewiscirne@mac.com",
          ipAddress: "127.0.0.1",
        }),
      ).rejects.toMatchObject({
        code: "PROVISION_FAILED",
      });

      const [grant] = await db
        .select()
        .from(grants)
        .where(eq(grants.status, "provision_failed"));
      expect(grant.provisionError).toContain("createServiceAccount");
      expect([...gateway.projects.values()][0]?.archived).toBe(true);
      const [keyCount] = await db.select({ value: count() }).from(apiKeys);
      expect(Number(keyCount.value)).toBe(0);
    } finally {
      await client.close();
    }
  });
});
