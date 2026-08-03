import { readFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { apiKeys, grants } from "@/lib/db/schema";
import { importGranteesCsv } from "@/lib/grants/import-grantees";
import { createProgramInvite } from "@/lib/grants/invites";
import { redeemGrant } from "@/lib/grants/redeem";
import { revokeGrant } from "@/lib/grants/revoke";
import { FakeOpenAIAdminGateway } from "@/lib/openai/gateway";
import { migratedTestDb } from "./helpers/database";

describe("grant revoke", () => {
  it("revokes externally before updating the local mirror and is idempotent", async () => {
    const { db, client } = await migratedTestDb();
    const gateway = new FakeOpenAIAdminGateway();
    try {
      await importGranteesCsv(
        db,
        await readFile("tests/fixtures/grantees.csv", "utf8"),
      );
      const { token } = await createProgramInvite(db, {
        name: "Test",
        actor: "admin@example.com",
        expiresAt: new Date(Date.now() + 60_000),
        maxRedemptions: 1,
      });
      const redemption = await redeemGrant({
        db,
        gateway,
        inviteToken: token,
        email: "lewiscirne@mac.com",
        ipAddress: "127.0.0.1",
      });

      await expect(
        revokeGrant({
          db,
          gateway,
          grantId: redemption.grantId,
          actor: "admin@example.com",
          reason: "test cleanup",
        }),
      ).resolves.toEqual({ alreadyRevoked: false });

      const [grant] = await db
        .select()
        .from(grants)
        .where(eq(grants.id, redemption.grantId));
      const [key] = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.grantId, redemption.grantId));
      expect(grant.status).toBe("revoked");
      expect(key.status).toBe("revoked");
      expect(gateway.keys.size).toBe(0);

      await expect(
        revokeGrant({
          db,
          gateway,
          grantId: redemption.grantId,
          actor: "admin@example.com",
          reason: "retry",
        }),
      ).resolves.toEqual({ alreadyRevoked: true });
    } finally {
      await client.close();
    }
  });
});
