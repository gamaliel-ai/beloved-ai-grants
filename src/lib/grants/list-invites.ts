import { and, count, desc, eq, ne } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import { grants, programInvites } from "@/lib/db/schema";

export async function listProgramInvites(db: AppDatabase, limit = 100) {
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const invites = await db
    .select()
    .from(programInvites)
    .orderBy(desc(programInvites.createdAt))
    .limit(safeLimit);

  const results = [];
  for (const invite of invites) {
    const [usage] = await db
      .select({ value: count() })
      .from(grants)
      .where(
        and(
          eq(grants.inviteId, invite.id),
          ne(grants.status, "provision_failed"),
        ),
      );
    const redemptions = Number(usage.value);
    results.push({
      id: invite.id,
      name: invite.name,
      maxRedemptions: invite.maxRedemptions,
      redemptions,
      expiresAt: invite.expiresAt.toISOString(),
      isExpired: invite.expiresAt.getTime() <= Date.now(),
      isFull: redemptions >= invite.maxRedemptions,
      createdByEmail: invite.createdByEmail,
      createdAt: invite.createdAt.toISOString(),
    });
  }
  return results;
}
