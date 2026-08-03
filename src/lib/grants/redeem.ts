import { and, count, eq, inArray, ne, sql } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import {
  apiKeys,
  auditEvents,
  grants,
  grantees,
  programInvites,
} from "@/lib/db/schema";
import type { OpenAIAdminGateway } from "@/lib/openai/gateway";
import { normalizeEmail } from "@/lib/auth/admin-emails";
import { findInviteByToken } from "./invites";
import { consumeRedeemAttempt } from "./rate-limit";

export type RedemptionErrorCode =
  | "INVALID_INVITE"
  | "INVITE_EXPIRED"
  | "INVITE_FULL"
  | "NOT_ALLOWLISTED"
  | "ALREADY_REDEEMED"
  | "RATE_LIMITED"
  | "PROVISION_FAILED";

export class RedemptionError extends Error {
  constructor(
    readonly code: RedemptionErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export async function redeemGrant(input: {
  db: AppDatabase;
  gateway: OpenAIAdminGateway;
  inviteToken: string;
  email: string;
  ipAddress: string;
}) {
  const email = normalizeEmail(input.email);
  const invite = await findInviteByToken(input.db, input.inviteToken);
  if (!invite) {
    throw new RedemptionError("INVALID_INVITE", "This invite is not valid.");
  }

  const [ipLimit, emailLimit] = await Promise.all([
    consumeRedeemAttempt(input.db, invite.id, `ip:${input.ipAddress}`, 10),
    consumeRedeemAttempt(input.db, invite.id, `email:${email}`, 5),
  ]);
  if (!ipLimit.allowed || !emailLimit.allowed) {
    throw new RedemptionError(
      "RATE_LIMITED",
      "Too many attempts. Please wait and try again.",
    );
  }

  let grantId: string;
  try {
    grantId = await input.db.transaction(async (tx) => {
      await tx.execute(
        sql`select id from ${programInvites} where ${programInvites.id} = ${invite.id} for update`,
      );
      const [lockedInvite] = await tx
        .select()
        .from(programInvites)
        .where(eq(programInvites.id, invite.id))
        .limit(1);
      if (!lockedInvite) {
        throw new RedemptionError(
          "INVALID_INVITE",
          "This invite is not valid.",
        );
      }
      if (lockedInvite.expiresAt.getTime() <= Date.now()) {
        throw new RedemptionError(
          "INVITE_EXPIRED",
          "This invite has expired.",
        );
      }

      const [usage] = await tx
        .select({ value: count() })
        .from(grants)
        .where(
          and(
            eq(grants.inviteId, lockedInvite.id),
            ne(grants.status, "provision_failed"),
          ),
        );
      if (Number(usage.value) >= lockedInvite.maxRedemptions) {
        throw new RedemptionError(
          "INVITE_FULL",
          "This invite has reached its redemption limit.",
        );
      }

      const [grantee] = await tx
        .select()
        .from(grantees)
        .where(eq(grantees.email, email))
        .limit(1);
      if (!grantee) {
        throw new RedemptionError(
          "NOT_ALLOWLISTED",
          "This email is not on the program allowlist.",
        );
      }

      const [existing] = await tx
        .select({ id: grants.id })
        .from(grants)
        .where(
          and(
            eq(grants.granteeId, grantee.id),
            inArray(grants.status, ["provisioning", "active"]),
          ),
        )
        .limit(1);
      if (existing) {
        throw new RedemptionError(
          "ALREADY_REDEEMED",
          "This email already has an active grant.",
        );
      }

      const [grant] = await tx
        .insert(grants)
        .values({
          granteeId: grantee.id,
          inviteId: lockedInvite.id,
          status: "provisioning",
        })
        .returning({ id: grants.id });
      return grant.id;
    });
  } catch (error) {
    if (error instanceof RedemptionError) throw error;
    if (isUniqueViolation(error)) {
      throw new RedemptionError(
        "ALREADY_REDEEMED",
        "This email already has an active grant.",
      );
    }
    throw error;
  }

  let projectId: string | undefined;
  let serviceAccountId: string | undefined;
  let apiKeyId: string | undefined;
  try {
    const project = await input.gateway.createProject(`grant-${grantId}`);
    projectId = project.id;
    await input.db
      .update(grants)
      .set({ openaiProjectId: projectId, updatedAt: new Date() })
      .where(eq(grants.id, grantId));

    const serviceAccount = await input.gateway.createServiceAccount(
      projectId,
      `grant-${grantId}`,
    );
    serviceAccountId = serviceAccount.id;
    apiKeyId = serviceAccount.apiKey.id;
    const redactedValue = redactSecret(serviceAccount.apiKey.value);

    await input.db.transaction(async (tx) => {
      await tx.insert(apiKeys).values({
        grantId,
        openaiServiceAccountId: serviceAccountId!,
        openaiApiKeyId: apiKeyId!,
        redactedValue,
        status: "active",
      });
      await tx
        .update(grants)
        .set({
          status: "active",
          activatedAt: new Date(),
          provisionError: null,
          updatedAt: new Date(),
        })
        .where(eq(grants.id, grantId));
      await tx.insert(auditEvents).values({
        actor: email,
        action: "grant.provisioned",
        entityType: "grant",
        entityId: grantId,
        metadata: {
          openaiProjectId: projectId,
          openaiServiceAccountId: serviceAccountId,
          openaiApiKeyId: apiKeyId,
        },
      });
    });

    return {
      grantId,
      secret: serviceAccount.apiKey.value,
      redactedValue,
    };
  } catch (error) {
    if (projectId && apiKeyId) {
      await ignoreCleanupError(() =>
        input.gateway.deleteApiKey(
          projectId!,
          serviceAccountId!,
          apiKeyId!,
        ),
      );
    }
    if (projectId) {
      await ignoreCleanupError(() => input.gateway.archiveProject(projectId!));
    }
    await input.db
      .update(grants)
      .set({
        status: "provision_failed",
        provisionError: safeError(error),
        updatedAt: new Date(),
      })
      .where(eq(grants.id, grantId));
    await input.db.insert(auditEvents).values({
      actor: email,
      action: "grant.provision_failed",
      entityType: "grant",
      entityId: grantId,
      metadata: { projectCreated: Boolean(projectId) },
    });
    throw new RedemptionError(
      "PROVISION_FAILED",
      "We could not issue the key. Please ask an organizer for help.",
    );
  }
}

function redactSecret(secret: string) {
  return `sk-…${secret.slice(-4)}`;
}

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return message.replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]").slice(0, 500);
}

function isUniqueViolation(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; cause?: { code?: string } };
  return candidate.code === "23505" || candidate.cause?.code === "23505";
}

async function ignoreCleanupError(cleanup: () => Promise<void>) {
  try {
    await cleanup();
  } catch {
    // The failed project id remains in the local record for operator cleanup.
  }
}
