import { and, desc, eq, inArray } from "drizzle-orm";
import * as z from "zod";
import { normalizeEmail } from "@/lib/auth/admin-emails";
import type { AppDatabase } from "@/lib/db/client";
import { apiKeys, auditEvents, grants, grantees } from "@/lib/db/schema";

const upsertInput = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Email is invalid"),
});

export type UpsertGranteeResult = {
  id: string;
  name: string;
  email: string;
  change: "inserted" | "updated" | "unchanged";
};

export async function upsertGrantee(
  db: AppDatabase,
  input: {
    name: string;
    email: string;
    actor: string;
    toolName?: string;
  },
): Promise<UpsertGranteeResult> {
  const parsed = upsertInput.parse({
    name: input.name,
    email: input.email,
  });
  const email = normalizeEmail(parsed.email);
  const name = parsed.name;

  const [existing] = await db
    .select()
    .from(grantees)
    .where(eq(grantees.email, email))
    .limit(1);

  if (!existing) {
    const [created] = await db
      .insert(grantees)
      .values({ name, email })
      .returning();
    await db.insert(auditEvents).values({
      actor: input.actor,
      action: "grantee.upserted",
      entityType: "grantee",
      entityId: created.id,
      metadata: {
        change: "inserted",
        email: created.email,
        name: created.name,
        tool: input.toolName ?? null,
      },
    });
    return {
      id: created.id,
      name: created.name,
      email: created.email,
      change: "inserted",
    };
  }

  if (existing.name === name) {
    return {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      change: "unchanged",
    };
  }

  const [updated] = await db
    .update(grantees)
    .set({ name, updatedAt: new Date() })
    .where(eq(grantees.id, existing.id))
    .returning();

  await db.insert(auditEvents).values({
    actor: input.actor,
    action: "grantee.upserted",
    entityType: "grantee",
    entityId: updated.id,
    metadata: {
      change: "updated",
      email: updated.email,
      name: updated.name,
      previousName: existing.name,
      tool: input.toolName ?? null,
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    change: "updated",
  };
}

export async function removeGrantee(
  db: AppDatabase,
  input: {
    email: string;
    actor: string;
    toolName?: string;
  },
) {
  const email = normalizeEmail(input.email);
  const [existing] = await db
    .select()
    .from(grantees)
    .where(eq(grantees.email, email))
    .limit(1);
  if (!existing) {
    throw new Error(`Grantee not found: ${email}`);
  }

  const [grant] = await db
    .select({ id: grants.id })
    .from(grants)
    .where(eq(grants.granteeId, existing.id))
    .limit(1);
  if (grant) {
    throw new Error(
      "Cannot remove a grantee that has grant history. Revoke active grants first; historical rows are retained.",
    );
  }

  await db.delete(grantees).where(eq(grantees.id, existing.id));
  await db.insert(auditEvents).values({
    actor: input.actor,
    action: "grantee.removed",
    entityType: "grantee",
    entityId: existing.id,
    metadata: {
      email: existing.email,
      name: existing.name,
      tool: input.toolName ?? null,
    },
  });

  return { id: existing.id, email: existing.email, name: existing.name };
}

export async function listGrantees(db: AppDatabase, limit = 200) {
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const rows = await db
    .select()
    .from(grantees)
    .orderBy(grantees.email)
    .limit(safeLimit);

  if (rows.length === 0) return [];

  const live = await db
    .select({
      granteeId: grants.granteeId,
      grantId: grants.id,
      status: grants.status,
    })
    .from(grants)
    .where(
      and(
        inArray(
          grants.granteeId,
          rows.map((row) => row.id),
        ),
        inArray(grants.status, ["provisioning", "active"]),
      ),
    );

  const liveByGrantee = new Map(
    live.map((row) => [row.granteeId, row] as const),
  );

  return rows.map((row) => {
    const grant = liveByGrantee.get(row.id);
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      hasLiveGrant: Boolean(grant),
      liveGrantId: grant?.grantId ?? null,
      liveGrantStatus: grant?.status ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  });
}

export async function findGranteeByEmail(db: AppDatabase, email: string) {
  const [row] = await db
    .select()
    .from(grantees)
    .where(eq(grantees.email, normalizeEmail(email)))
    .limit(1);
  return row ?? null;
}

export async function listGrants(db: AppDatabase, limit = 200) {
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const rows = await db
    .select({
      id: grants.id,
      status: grants.status,
      email: grantees.email,
      name: grantees.name,
      projectId: grants.openaiProjectId,
      redactedValue: apiKeys.redactedValue,
      revokedReason: grants.revokedReason,
      createdAt: grants.createdAt,
      activatedAt: grants.activatedAt,
      revokedAt: grants.revokedAt,
    })
    .from(grants)
    .innerJoin(grantees, eq(grantees.id, grants.granteeId))
    .leftJoin(apiKeys, eq(apiKeys.grantId, grants.id))
    .orderBy(desc(grants.createdAt))
    .limit(safeLimit);

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    email: row.email,
    name: row.name,
    openaiProjectId: row.projectId,
    redactedKey: row.redactedValue,
    revokedReason: row.revokedReason,
    createdAt: row.createdAt.toISOString(),
    activatedAt: row.activatedAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
  }));
}
