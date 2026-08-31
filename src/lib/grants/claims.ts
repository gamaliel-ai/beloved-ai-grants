import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import {
  apiKeys,
  auditEvents,
  claimTokens,
  grants,
  grantees,
} from "@/lib/db/schema";
import { absoluteUrl } from "@/lib/app-url";
import { normalizeEmail } from "@/lib/auth/admin-emails";
import {
  getMailMode,
  sendTransactionalMail,
} from "@/lib/mail/client";
import { site } from "@/lib/site";
import type { OpenAIAdminGateway } from "@/lib/openai/gateway";
import {
  claimConfig,
  consumeClaimAttempt,
  hashClaimToken,
  newClaimTokenValue,
} from "./claim-config";

export class ClaimError extends Error {
  constructor(
    readonly code:
      | "NOT_ELIGIBLE"
      | "ALREADY_ACTIVE"
      | "RATE_LIMITED"
      | "INVALID_TOKEN"
      | "TOKEN_EXPIRED"
      | "TOKEN_USED"
      | "PROVISION_FAILED",
    message: string,
  ) {
    super(message);
  }
}

export async function issueClaimLink(input: {
  db: AppDatabase;
  granteeId: string;
  actor: string;
}) {
  const [grantee] = await input.db
    .select()
    .from(grantees)
    .where(eq(grantees.id, input.granteeId))
    .limit(1);
  if (!grantee) {
    throw new ClaimError("NOT_ELIGIBLE", "Grantee was not found.");
  }

  const [live] = await input.db
    .select({ id: grants.id })
    .from(grants)
    .where(
      and(
        eq(grants.granteeId, grantee.id),
        inArray(grants.status, ["provisioning", "active"]),
      ),
    )
    .limit(1);
  if (live) {
    throw new ClaimError(
      "ALREADY_ACTIVE",
      "This grantee already has an active grant.",
    );
  }

  const token = newClaimTokenValue();
  const expiresAt = new Date(Date.now() + claimConfig.ttlMs);

  const claimToken = await input.db.transaction(async (tx) => {
    await tx
      .update(claimTokens)
      .set({ expiresAt: new Date() })
      .where(
        and(
          eq(claimTokens.granteeId, grantee.id),
          isNull(claimTokens.usedAt),
          sql`${claimTokens.expiresAt} > now()`,
        ),
      );

    const [created] = await tx
      .insert(claimTokens)
      .values({
        granteeId: grantee.id,
        tokenHash: hashClaimToken(token),
        expiresAt,
        createdBy: input.actor,
      })
      .returning();
    return created;
  });

  const claimUrl = absoluteUrl(`/claim/${token}`);
  const sent = await sendTransactionalMail({
    purpose: claimConfig.purpose,
    to: grantee.email,
    subject: `Your ${site.name} claim link`,
    text: claimLinkText({ name: grantee.name, claimUrl, expiresAt }),
    html: claimLinkHtml({ name: grantee.name, claimUrl, expiresAt }),
    idempotencyKey: `claim_link:${claimToken.id}`,
  });

  await input.db
    .update(claimTokens)
    .set({ providerMessageId: sent.id })
    .where(eq(claimTokens.id, claimToken.id));

  await input.db.insert(auditEvents).values({
    actor: input.actor,
    action: "claim_link.sent",
    entityType: "claim_token",
    entityId: claimToken.id,
    metadata: {
      granteeId: grantee.id,
      email: grantee.email,
      expiresAt: expiresAt.toISOString(),
      mailMode: getMailMode(),
      providerMessageId: sent.id,
    },
  });

  return {
    claimTokenId: claimToken.id,
    expiresAt,
    email: grantee.email,
    mailMode: getMailMode(),
    providerMessageId: sent.id,
  };
}

/**
 * Public join path: always returns the same opaque result so callers cannot
 * probe the allowlist. Eligible emails receive a claim link via the mailer.
 */
export async function requestClaimLinkForEmail(input: {
  db: AppDatabase;
  email: string;
  ipAddress: string;
}) {
  const email = normalizeEmail(input.email);
  const [ipLimit, emailLimit] = await Promise.all([
    consumeClaimAttempt(input.db, `join-ip:${input.ipAddress}`, 10),
    consumeClaimAttempt(input.db, `join-email:${email}`, 5),
  ]);
  if (!ipLimit.allowed || !emailLimit.allowed) {
    throw new ClaimError(
      "RATE_LIMITED",
      "Too many attempts. Please wait and try again.",
    );
  }

  const [grantee] = await input.db
    .select()
    .from(grantees)
    .where(eq(grantees.email, email))
    .limit(1);

  if (grantee) {
    const [live] = await input.db
      .select({ id: grants.id })
      .from(grants)
      .where(
        and(
          eq(grants.granteeId, grantee.id),
          inArray(grants.status, ["provisioning", "active"]),
        ),
      )
      .limit(1);
    if (!live) {
      await issueClaimLink({
        db: input.db,
        granteeId: grantee.id,
        actor: email,
      });
    }
  }

  return {
    ok: true as const,
    message:
      "If this email is registered for the programme, a claim link is on its way. Check your inbox shortly.",
  };
}

export async function findClaimToken(db: AppDatabase, token: string) {
  if (!token) return null;
  const [row] = await db
    .select({
      token: claimTokens,
      grantee: grantees,
    })
    .from(claimTokens)
    .innerJoin(grantees, eq(grantees.id, claimTokens.granteeId))
    .where(eq(claimTokens.tokenHash, hashClaimToken(token)))
    .limit(1);
  if (!row) return null;
  return {
    ...row.token,
    grantee: row.grantee,
    isExpired: row.token.expiresAt.getTime() <= Date.now(),
    isUsed: Boolean(row.token.usedAt),
  };
}

export async function redeemClaimToken(input: {
  db: AppDatabase;
  gateway: OpenAIAdminGateway;
  token: string;
  ipAddress: string;
}) {
  const ipLimit = await consumeClaimAttempt(
    input.db,
    `claim-ip:${input.ipAddress}`,
    20,
  );
  if (!ipLimit.allowed) {
    throw new ClaimError(
      "RATE_LIMITED",
      "Too many attempts. Please wait and try again.",
    );
  }

  const found = await findClaimToken(input.db, input.token);
  if (!found) {
    throw new ClaimError("INVALID_TOKEN", "This claim link is not valid.");
  }
  if (found.isUsed) {
    throw new ClaimError(
      "TOKEN_USED",
      "This claim link was already used.",
    );
  }
  if (found.isExpired) {
    throw new ClaimError("TOKEN_EXPIRED", "This claim link has expired.");
  }

  let grantId: string;
  try {
    grantId = await input.db.transaction(async (tx) => {
      await tx.execute(
        sql`select id from ${claimTokens} where ${claimTokens.id} = ${found.id} for update`,
      );
      const [locked] = await tx
        .select()
        .from(claimTokens)
        .where(eq(claimTokens.id, found.id))
        .limit(1);
      if (!locked || locked.usedAt) {
        throw new ClaimError(
          "TOKEN_USED",
          "This claim link was already used.",
        );
      }
      if (locked.expiresAt.getTime() <= Date.now()) {
        throw new ClaimError(
          "TOKEN_EXPIRED",
          "This claim link has expired.",
        );
      }

      const [live] = await tx
        .select({ id: grants.id })
        .from(grants)
        .where(
          and(
            eq(grants.granteeId, locked.granteeId),
            inArray(grants.status, ["provisioning", "active"]),
          ),
        )
        .limit(1);
      if (live) {
        throw new ClaimError(
          "ALREADY_ACTIVE",
          "This email already has an active grant.",
        );
      }

      const [grant] = await tx
        .insert(grants)
        .values({
          granteeId: locked.granteeId,
          claimTokenId: locked.id,
          status: "provisioning",
        })
        .returning({ id: grants.id });

      await tx
        .update(claimTokens)
        .set({ usedAt: new Date() })
        .where(eq(claimTokens.id, locked.id));

      return grant.id;
    });
  } catch (error) {
    if (error instanceof ClaimError) throw error;
    if (isUniqueViolation(error)) {
      throw new ClaimError(
        "ALREADY_ACTIVE",
        "This email already has an active grant.",
      );
    }
    throw error;
  }

  try {
    return await provisionGrantResources({
      db: input.db,
      gateway: input.gateway,
      grantId,
      actorEmail: found.grantee.email,
    });
  } catch {
    throw new ClaimError(
      "PROVISION_FAILED",
      "We could not create the key. Please ask an organiser for help.",
    );
  }
}

async function provisionGrantResources(input: {
  db: AppDatabase;
  gateway: OpenAIAdminGateway;
  grantId: string;
  actorEmail: string;
}) {
  let projectId: string | undefined;
  let serviceAccountId: string | undefined;
  let apiKeyId: string | undefined;
  try {
    const project = await input.gateway.createProject(
      `grant-${input.grantId}`,
    );
    projectId = project.id;
    await input.db
      .update(grants)
      .set({ openaiProjectId: projectId, updatedAt: new Date() })
      .where(eq(grants.id, input.grantId));

    const serviceAccount = await input.gateway.createServiceAccount(
      projectId,
      `grant-${input.grantId}`,
    );
    serviceAccountId = serviceAccount.id;
    apiKeyId = serviceAccount.apiKey.id;
    const redactedValue = redactSecret(serviceAccount.apiKey.value);

    await input.db.transaction(async (tx) => {
      await tx.insert(apiKeys).values({
        grantId: input.grantId,
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
        .where(eq(grants.id, input.grantId));
      await tx.insert(auditEvents).values({
        actor: input.actorEmail,
        action: "grant.provisioned",
        entityType: "grant",
        entityId: input.grantId,
        metadata: {
          openaiProjectId: projectId,
          openaiServiceAccountId: serviceAccountId,
          openaiApiKeyId: apiKeyId,
          via: "claim_token",
        },
      });
    });

    return {
      grantId: input.grantId,
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
      await ignoreCleanupError(() =>
        input.gateway.archiveProject(projectId!),
      );
    }
    await input.db
      .update(grants)
      .set({
        status: "provision_failed",
        provisionError: safeError(error),
        updatedAt: new Date(),
      })
      .where(eq(grants.id, input.grantId));
    await input.db.insert(auditEvents).values({
      actor: input.actorEmail,
      action: "grant.provision_failed",
      entityType: "grant",
      entityId: input.grantId,
      metadata: { projectCreated: Boolean(projectId), via: "claim_token" },
    });
    throw error;
  }
}

function claimLinkText(input: {
  name: string;
  claimUrl: string;
  expiresAt: Date;
}) {
  return [
    `Hi ${input.name},`,
    "",
    `Use this single-use link to claim your ${site.name} API key:`,
    input.claimUrl,
    "",
    `This link expires ${input.expiresAt.toUTCString()} and can be used once.`,
    "We never email the API key itself—only this secure claim page.",
    "",
    `— ${site.name}`,
  ].join("\n");
}

function claimLinkHtml(input: {
  name: string;
  claimUrl: string;
  expiresAt: Date;
}) {
  const safeUrl = escapeHtml(input.claimUrl);
  return `<p>Hi ${escapeHtml(input.name)},</p>
<p>Use this single-use link to claim your ${escapeHtml(site.name)} API key:</p>
<p><a href="${safeUrl}">${safeUrl}</a></p>
<p>This link expires <strong>${escapeHtml(input.expiresAt.toUTCString())}</strong> and can be used once. We never email the API key itself—only this secure claim page.</p>
<p>— ${escapeHtml(site.name)}</p>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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
    // Local grant row retains project id for operator cleanup.
  }
}
