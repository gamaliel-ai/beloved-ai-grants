"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createMcpOperatorToken,
  revokeMcpOperatorToken,
} from "@/lib/auth/mcp-tokens";
import { getDb } from "@/lib/db/client";
import { revokeGrant } from "@/lib/grants/revoke";
import { getOpenAIAdminGateway } from "@/lib/openai/client";

export async function revokeGrantAction(formData: FormData) {
  const actor = await requireAdmin();
  const grantId = String(formData.get("grantId") ?? "");
  const reason = String(formData.get("reason") ?? "operator revoke").slice(
    0,
    200,
  );
  if (!grantId) redirect("/admin?error=Grant+id+is+required.");

  try {
    await revokeGrant({
      db: getDb(),
      gateway: getOpenAIAdminGateway(),
      grantId,
      actor,
      reason,
    });
    revalidatePath("/admin");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not revoke grant.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }
  redirect("/admin?notice=Grant+revoked.");
}

export type McpTokenActionState = {
  token?: string;
  expiresAt?: string;
  error?: string;
};

export async function createMcpTokenAction(
  _previous: McpTokenActionState,
  formData: FormData,
): Promise<McpTokenActionState> {
  const actor = await requireAdmin();
  const label = String(formData.get("label") ?? "").trim();

  try {
    const created = await createMcpOperatorToken(getDb(), {
      actor,
      label: label || undefined,
    });
    revalidatePath("/admin/mcp");
    return {
      token: created.token,
      expiresAt: created.expiresAt.toISOString(),
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not create MCP operator token.",
    };
  }
}

export async function revokeMcpTokenAction(formData: FormData) {
  const actor = await requireAdmin();
  const tokenId = String(formData.get("tokenId") ?? "");
  if (!tokenId) redirect("/admin/mcp?error=Token+id+is+required.");

  try {
    await revokeMcpOperatorToken(getDb(), { actor, tokenId });
    revalidatePath("/admin/mcp");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not revoke token.";
    redirect(`/admin/mcp?error=${encodeURIComponent(message)}`);
  }
  redirect("/admin/mcp?notice=Token+revoked.");
}
