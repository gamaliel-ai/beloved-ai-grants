import { createHash, randomBytes } from "node:crypto";
import { and, count, eq, ne } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import {
  auditEvents,
  grants,
  programInvites,
} from "@/lib/db/schema";

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createProgramInvite(
  db: AppDatabase,
  input: {
    name: string;
    expiresAt: Date;
    maxRedemptions: number;
    actor: string;
  },
) {
  const token = randomBytes(32).toString("base64url");
  const [invite] = await db
    .insert(programInvites)
    .values({
      name: input.name.trim(),
      tokenHash: hashInviteToken(token),
      expiresAt: input.expiresAt,
      maxRedemptions: input.maxRedemptions,
      createdByEmail: input.actor,
    })
    .returning();

  await db.insert(auditEvents).values({
    actor: input.actor,
    action: "invite.created",
    entityType: "program_invite",
    entityId: invite.id,
    metadata: {
      name: invite.name,
      expiresAt: invite.expiresAt.toISOString(),
      maxRedemptions: invite.maxRedemptions,
    },
  });

  return { invite, token };
}

export async function findInviteByToken(db: AppDatabase, token: string) {
  if (!token) return null;
  const [invite] = await db
    .select()
    .from(programInvites)
    .where(eq(programInvites.tokenHash, hashInviteToken(token)))
    .limit(1);
  if (!invite) return null;

  const [usage] = await db
    .select({ value: count() })
    .from(grants)
    .where(
      and(
        eq(grants.inviteId, invite.id),
        ne(grants.status, "provision_failed"),
      ),
    );

  return {
    ...invite,
    redemptions: Number(usage.value),
    isExpired: invite.expiresAt.getTime() <= Date.now(),
    isFull: Number(usage.value) >= invite.maxRedemptions,
  };
}
