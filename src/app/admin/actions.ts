"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import { auditEvents } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { importGranteesCsv } from "@/lib/grants/import-grantees";
import { createProgramInvite } from "@/lib/grants/invites";
import { revokeGrant } from "@/lib/grants/revoke";
import { getOpenAIAdminGateway } from "@/lib/openai/client";

export async function importGranteesAction(formData: FormData) {
  const actor = await requireAdmin();
  const file = formData.get("csv");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin?error=Choose+a+CSV+file.");
  }
  if (file.size > 1_000_000) {
    redirect("/admin?error=CSV+must+be+smaller+than+1+MB.");
  }

  let summary: string;
  try {
    const db = getDb();
    const result = await importGranteesCsv(db, await file.text());
    await db.insert(auditEvents).values({
      actor,
      action: "grantees.imported",
      entityType: "grantee",
      metadata: result,
    });
    revalidatePath("/admin");
    summary = `${result.inserted} inserted, ${result.updated} updated, ${result.unchanged} unchanged`;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not import CSV.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }
  redirect(`/admin?notice=${encodeURIComponent(summary)}`);
}

export type InviteActionState = {
  url?: string;
  error?: string;
};

export async function createInviteAction(
  _previous: InviteActionState,
  formData: FormData,
): Promise<InviteActionState> {
  const actor = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const expiresAt = new Date(String(formData.get("expiresAt") ?? ""));
  const maxRedemptions = Number(formData.get("maxRedemptions"));

  if (!name) return { error: "Program name is required." };
  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
    return { error: "Expiry must be in the future." };
  }
  if (
    !Number.isInteger(maxRedemptions) ||
    maxRedemptions < 1 ||
    maxRedemptions > 10_000
  ) {
    return { error: "Max redemptions must be between 1 and 10,000." };
  }

  try {
    const { token } = await createProgramInvite(getDb(), {
      name,
      expiresAt,
      maxRedemptions,
      actor,
    });
    revalidatePath("/admin");
    const baseUrl = (process.env.APP_URL ?? "http://localhost:3002").replace(
      /\/$/,
      "",
    );
    return { url: `${baseUrl}/redeem/${token}` };
  } catch {
    return { error: "Could not create the invite." };
  }
}

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
