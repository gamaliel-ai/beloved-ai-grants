import { readFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { grants, usageProjectBuckets, usageUnknownProjects } from "@/lib/db/schema";
import { importGranteesCsv } from "@/lib/grants/import-grantees";
import { createProgramInvite } from "@/lib/grants/invites";
import { redeemGrant } from "@/lib/grants/redeem";
import { FakeOpenAIAdminGateway } from "@/lib/openai/gateway";
import { currentUtcMonthPeriod } from "@/lib/usage/period";
import { syncUsageActivity } from "@/lib/usage/sync";
import { migratedTestDb } from "./helpers/database";

describe("usage sync", () => {
  it("upserts project buckets idempotently and records unknown projects", async () => {
    const { db, client } = await migratedTestDb();
    const gateway = new FakeOpenAIAdminGateway();
    try {
      await importGranteesCsv(
        db,
        await readFile("tests/fixtures/grantees.csv", "utf8"),
      );
      const { token } = await createProgramInvite(db, {
        name: "Usage test",
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
      const [grant] = await db
        .select()
        .from(grants)
        .where(eq(grants.id, redemption.grantId));
      expect(grant.openaiProjectId).toBeTruthy();

      const period = currentUtcMonthPeriod();
      const bucketStart = period.start;
      const bucketEnd = new Date(bucketStart.getTime() + 86_400_000);
      gateway.seedUsage([
        {
          openaiProjectId: grant.openaiProjectId!,
          bucketStart,
          bucketEnd,
          costCents: 250,
          inputTokens: 1000,
          outputTokens: 200,
          requests: 4,
          lastActivityAt: new Date(bucketStart.getTime() + 3_600_000),
        },
        {
          openaiProjectId: "proj_unknown_orphan",
          bucketStart,
          bucketEnd,
          costCents: 99,
          inputTokens: 10,
          outputTokens: 5,
          requests: 1,
          lastActivityAt: bucketStart,
        },
      ]);

      const first = await syncUsageActivity({
        db,
        gateway,
        windowStart: period.start,
        windowEnd: period.end,
      });
      expect(first.status).toBe("succeeded");
      expect(first.bucketsUpserted).toBe(2);
      expect(first.unknownProjectCount).toBe(1);

      const second = await syncUsageActivity({
        db,
        gateway,
        windowStart: period.start,
        windowEnd: period.end,
      });
      expect(second.status).toBe("succeeded");
      expect(second.bucketsUpserted).toBe(2);

      const buckets = await db.select().from(usageProjectBuckets);
      expect(buckets).toHaveLength(2);
      const known = buckets.find(
        (b) => b.openaiProjectId === grant.openaiProjectId,
      );
      expect(known?.costCents).toBe(250);

      const unknown = await db.select().from(usageUnknownProjects);
      expect(unknown).toHaveLength(1);
      expect(unknown[0]?.openaiProjectId).toBe("proj_unknown_orphan");
    } finally {
      await client.close();
    }
  });

  it("marks the sync run failed when the gateway errors", async () => {
    const { db, client } = await migratedTestDb();
    const gateway = new FakeOpenAIAdminGateway("listProjectUsage");
    try {
      const result = await syncUsageActivity({ db, gateway });
      expect(result.status).toBe("failed");
      expect(result.errorMessage).toMatch(/listProjectUsage/);
    } finally {
      await client.close();
    }
  });
});
