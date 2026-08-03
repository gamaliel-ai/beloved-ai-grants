import { and, eq } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import { apiKeys, auditEvents, grants } from "@/lib/db/schema";
import type { OpenAIAdminGateway } from "@/lib/openai/gateway";

export async function revokeGrant(input: {
  db: AppDatabase;
  gateway: OpenAIAdminGateway;
  grantId: string;
  actor: string;
  reason: string;
}) {
  const [record] = await input.db
    .select({
      grantStatus: grants.status,
      projectId: grants.openaiProjectId,
      serviceAccountId: apiKeys.openaiServiceAccountId,
      keyId: apiKeys.openaiApiKeyId,
      keyStatus: apiKeys.status,
    })
    .from(grants)
    .leftJoin(
      apiKeys,
      and(eq(apiKeys.grantId, grants.id), eq(apiKeys.status, "active")),
    )
    .where(eq(grants.id, input.grantId))
    .limit(1);

  if (!record) throw new Error("Grant not found.");
  if (record.grantStatus === "revoked") return { alreadyRevoked: true };
  if (!record.projectId || !record.serviceAccountId || !record.keyId) {
    throw new Error("Grant does not have a revocable OpenAI key.");
  }

  await input.gateway.deleteApiKey(
    record.projectId,
    record.serviceAccountId,
    record.keyId,
  );
  try {
    await input.gateway.archiveProject(record.projectId);
  } catch {
    // Key deletion is the security boundary; project archival can be retried.
  }

  await input.db.transaction(async (tx) => {
    await tx
      .update(apiKeys)
      .set({
        status: "revoked",
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.openaiApiKeyId, record.keyId!));
    await tx
      .update(grants)
      .set({
        status: "revoked",
        revokedAt: new Date(),
        revokedReason: input.reason,
        updatedAt: new Date(),
      })
      .where(eq(grants.id, input.grantId));
    await tx.insert(auditEvents).values({
      actor: input.actor,
      action: "grant.revoked",
      entityType: "grant",
      entityId: input.grantId,
      metadata: {
        reason: input.reason,
        openaiProjectId: record.projectId,
        openaiApiKeyId: record.keyId,
      },
    });
  });

  return { alreadyRevoked: false };
}
