import { readFile } from "node:fs/promises";
import { afterEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { claimTokens, grants, grantees } from "@/lib/db/schema";
import {
  findClaimToken,
  issueClaimLink,
  redeemClaimToken,
  requestClaimLinkForEmail,
} from "@/lib/grants/claims";
import { importGranteesCsv } from "@/lib/grants/import-grantees";
import {
  clearFakeMailOutbox,
  getFakeMailOutbox,
  resetMailSenderForTests,
} from "@/lib/mail/client";
import { FakeOpenAIAdminGateway } from "@/lib/openai/gateway";
import { migratedTestDb } from "./helpers/database";

const originalAppUrl = process.env.APP_URL;
const originalResend = process.env.RESEND_API_KEY;

afterEach(() => {
  process.env.APP_URL = originalAppUrl;
  process.env.RESEND_API_KEY = originalResend;
  resetMailSenderForTests();
  clearFakeMailOutbox();
});

async function setupGrantee() {
  process.env.APP_URL = "http://localhost:3002";
  delete process.env.RESEND_API_KEY;
  resetMailSenderForTests();
  clearFakeMailOutbox();

  const result = await migratedTestDb();
  const csv = await readFile("tests/fixtures/grantees.csv", "utf8");
  await importGranteesCsv(result.db, csv);
  const rows = await result.db.select().from(grantees);
  const match = rows.find((row) => row.email === "lewiscirne@mac.com");
  if (!match) throw new Error("fixture grantee missing");
  return { ...result, grantee: match };
}

function claimTokenFromOutbox() {
  const html = getFakeMailOutbox()[0]?.html ?? "";
  const match = html.match(/\/claim\/([A-Za-z0-9_-]+)/);
  if (!match?.[1]) throw new Error("claim token missing from outbox");
  return match[1];
}

describe("claim tokens and fake mail", () => {
  it("issues a hashed claim token and fake-sends the absolute claim URL", async () => {
    const { db, client, grantee } = await setupGrantee();
    try {
      const issued = await issueClaimLink({
        db,
        granteeId: grantee.id,
        actor: "admin@example.com",
      });

      expect(issued.mailMode).toBe("fake");
      const outbox = getFakeMailOutbox();
      expect(outbox).toHaveLength(1);
      expect(outbox[0]?.purpose).toBe("claim_link");
      expect(outbox[0]?.to).toBe("lewiscirne@mac.com");
      expect(outbox[0]?.html).toContain("http://localhost:3002/claim/");

      const token = claimTokenFromOutbox();
      const found = await findClaimToken(db, token);
      expect(found?.granteeId).toBe(grantee.id);
      expect(found?.isUsed).toBe(false);

      const [stored] = await db
        .select()
        .from(claimTokens)
        .where(eq(claimTokens.id, issued.claimTokenId));
      expect(stored.tokenHash).not.toContain(token);
      expect(JSON.stringify(stored)).not.toContain(token);
    } finally {
      await client.close();
    }
  });

  it("provisions on claim redeem and rejects replay", async () => {
    const { db, client, grantee } = await setupGrantee();
    const gateway = new FakeOpenAIAdminGateway();
    try {
      await issueClaimLink({
        db,
        granteeId: grantee.id,
        actor: "admin@example.com",
      });
      const token = claimTokenFromOutbox();

      const result = await redeemClaimToken({
        db,
        gateway,
        token,
        ipAddress: "127.0.0.1",
      });
      expect(result.secret).toMatch(/^sk-fake-/);

      const [grant] = await db.select().from(grants);
      expect(grant.status).toBe("active");
      expect(grant.claimTokenId).toBeTruthy();
      expect(grant.inviteId).toBeNull();

      await expect(
        redeemClaimToken({
          db,
          gateway,
          token,
          ipAddress: "127.0.0.1",
        }),
      ).rejects.toMatchObject({ code: "TOKEN_USED" });
    } finally {
      await client.close();
    }
  });

  it("rejects expired claim tokens", async () => {
    const { db, client, grantee } = await setupGrantee();
    const gateway = new FakeOpenAIAdminGateway();
    try {
      await issueClaimLink({
        db,
        granteeId: grantee.id,
        actor: "admin@example.com",
      });
      const token = claimTokenFromOutbox();
      await db
        .update(claimTokens)
        .set({ expiresAt: new Date(Date.now() - 1_000) })
        .where(eq(claimTokens.granteeId, grantee.id));

      await expect(
        redeemClaimToken({
          db,
          gateway,
          token,
          ipAddress: "127.0.0.1",
        }),
      ).rejects.toMatchObject({ code: "TOKEN_EXPIRED" });
      expect(gateway.projects.size).toBe(0);
    } finally {
      await client.close();
    }
  });

  it("does not reveal allowlist membership on public join", async () => {
    const { db, client } = await setupGrantee();
    try {
      const known = await requestClaimLinkForEmail({
        db,
        email: "lewiscirne@mac.com",
        ipAddress: "10.0.0.1",
      });
      const unknown = await requestClaimLinkForEmail({
        db,
        email: "stranger@example.com",
        ipAddress: "10.0.0.2",
      });
      expect(known.message).toBe(unknown.message);
      expect(getFakeMailOutbox()).toHaveLength(1);
      expect(getFakeMailOutbox()[0]?.to).toBe("lewiscirne@mac.com");
    } finally {
      await client.close();
    }
  });
});
