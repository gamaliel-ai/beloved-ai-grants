import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import { mcpOperatorTokens } from "@/lib/db/schema";
import {
  AdminAuthError,
  assertAdminEmail,
  getAuthTestMcpToken,
  getAuthTestEmail,
  isAuthTestBypassActive,
} from "./admin-auth";

export const MCP_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const MCP_TOKEN_PREFIX = "bag_mcp_";

export class McpAuthError extends Error {
  constructor(message = "Invalid or missing MCP operator token.") {
    super(message);
    this.name = "McpAuthError";
  }
}

export function hashMcpToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function parseBearer(authorization: string | null | undefined) {
  if (!authorization) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match?.[1]?.trim() || null;
}

export async function createMcpOperatorToken(
  db: AppDatabase,
  input: {
    actor: string;
    label?: string;
    ttlMs?: number;
  },
) {
  const actor = assertAdminEmail(input.actor);
  const token = `${MCP_TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;
  const expiresAt = new Date(Date.now() + (input.ttlMs ?? MCP_TOKEN_TTL_MS));
  const [row] = await db
    .insert(mcpOperatorTokens)
    .values({
      email: actor,
      tokenHash: hashMcpToken(token),
      label: input.label?.trim() || null,
      expiresAt,
    })
    .returning({
      id: mcpOperatorTokens.id,
      email: mcpOperatorTokens.email,
      label: mcpOperatorTokens.label,
      expiresAt: mcpOperatorTokens.expiresAt,
      createdAt: mcpOperatorTokens.createdAt,
    });

  return { token, ...row };
}

export async function listMcpOperatorTokens(db: AppDatabase, email: string) {
  const actor = assertAdminEmail(email);
  const rows = await db
    .select({
      id: mcpOperatorTokens.id,
      email: mcpOperatorTokens.email,
      label: mcpOperatorTokens.label,
      expiresAt: mcpOperatorTokens.expiresAt,
      revokedAt: mcpOperatorTokens.revokedAt,
      createdAt: mcpOperatorTokens.createdAt,
    })
    .from(mcpOperatorTokens)
    .where(eq(mcpOperatorTokens.email, actor))
    .orderBy(desc(mcpOperatorTokens.createdAt));

  const nowMs = Date.now();
  return rows.map((row) => ({
    ...row,
    status: row.revokedAt
      ? ("revoked" as const)
      : row.expiresAt.getTime() <= nowMs
        ? ("expired" as const)
        : ("active" as const),
  }));
}

export async function revokeMcpOperatorToken(
  db: AppDatabase,
  input: { actor: string; tokenId: string },
) {
  const actor = assertAdminEmail(input.actor);
  const [updated] = await db
    .update(mcpOperatorTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(mcpOperatorTokens.id, input.tokenId),
        eq(mcpOperatorTokens.email, actor),
        isNull(mcpOperatorTokens.revokedAt),
      ),
    )
    .returning({ id: mcpOperatorTokens.id });
  if (!updated) {
    throw new Error("MCP token not found or already revoked.");
  }
  return updated;
}

async function authenticateDbToken(db: AppDatabase, token: string) {
  const tokenHash = hashMcpToken(token);
  const [row] = await db
    .select({
      email: mcpOperatorTokens.email,
      expiresAt: mcpOperatorTokens.expiresAt,
      revokedAt: mcpOperatorTokens.revokedAt,
      tokenHash: mcpOperatorTokens.tokenHash,
    })
    .from(mcpOperatorTokens)
    .where(eq(mcpOperatorTokens.tokenHash, tokenHash))
    .limit(1);

  if (!row) return null;
  const expected = Buffer.from(row.tokenHash, "hex");
  const actual = Buffer.from(tokenHash, "hex");
  if (
    expected.length !== actual.length ||
    !timingSafeEqual(expected, actual)
  ) {
    return null;
  }
  if (row.revokedAt) return null;
  if (row.expiresAt.getTime() <= Date.now()) return null;
  return row.email;
}

/**
 * Resolve the operator email from an Authorization Bearer header.
 * Non-production AUTH_TEST_BYPASS accepts AUTH_TEST_MCP_TOKEN
 * without a DB row (same idea as AUTH_TEST_EMAIL).
 */
export async function authenticateMcpBearer(
  db: AppDatabase,
  authorization: string | null | undefined,
): Promise<string> {
  const token = parseBearer(authorization);
  if (!token) {
    throw new McpAuthError();
  }

  if (isAuthTestBypassActive() && token === getAuthTestMcpToken()) {
    return assertAdminEmail(getAuthTestEmail());
  }

  const email = await authenticateDbToken(db, token);
  if (!email) {
    throw new McpAuthError();
  }

  try {
    return assertAdminEmail(email);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      throw new McpAuthError("Operator email is no longer allowlisted.");
    }
    throw error;
  }
}
