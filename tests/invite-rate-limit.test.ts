import { describe, expect, it } from "vitest";
import { createProgramInvite, findInviteByToken } from "@/lib/grants/invites";
import { consumeRedeemAttempt } from "@/lib/grants/rate-limit";
import { migratedTestDb } from "./helpers/database";

describe("invite boundaries", () => {
  it("stores only a token hash and reports expiration", async () => {
    const { db, client } = await migratedTestDb();
    try {
      const { invite, token } = await createProgramInvite(db, {
        name: "Expired",
        actor: "admin@example.com",
        expiresAt: new Date(Date.now() - 1),
        maxRedemptions: 1,
      });
      expect(invite.tokenHash).not.toContain(token);
      await expect(findInviteByToken(db, token)).resolves.toMatchObject({
        isExpired: true,
        isFull: false,
      });
      await expect(findInviteByToken(db, "wrong-token")).resolves.toBeNull();
    } finally {
      await client.close();
    }
  });

  it("limits attempts atomically within a fixed window", async () => {
    const { db, client } = await migratedTestDb();
    try {
      const { invite } = await createProgramInvite(db, {
        name: "Rate limit",
        actor: "admin@example.com",
        expiresAt: new Date(Date.now() + 60_000),
        maxRedemptions: 1,
      });
      await expect(
        consumeRedeemAttempt(db, invite.id, "subject", 2),
      ).resolves.toMatchObject({ allowed: true, remaining: 1 });
      await expect(
        consumeRedeemAttempt(db, invite.id, "subject", 2),
      ).resolves.toMatchObject({ allowed: true, remaining: 0 });
      await expect(
        consumeRedeemAttempt(db, invite.id, "subject", 2),
      ).resolves.toMatchObject({ allowed: false, remaining: 0 });
    } finally {
      await client.close();
    }
  });
});
