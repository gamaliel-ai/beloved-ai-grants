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
import { syncUsageActivity } from "@/lib/usage/sync";

function safeReturnTo(value: FormDataEntryValue | null, fallback: string) {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/admin")) return fallback;
  return value;
}

function withFlash(path: string, flash: { notice?: string; error?: string }) {
  const url = new URL(path, "http://localhost");
  if (flash.notice) url.searchParams.set("notice", flash.notice);
  if (flash.error) url.searchParams.set("error", flash.error);
  return `${url.pathname}${url.search}`;
}

export async function importGranteesAction(formData: FormData) {
  const actor = await requireAdmin();
  const returnTo = safeReturnTo(formData.get("returnTo"), "/admin/program");
  const file = formData.get("csv");
  if (!(file instanceof File) || file.size === 0) {
    redirect(withFlash(returnTo, { error: "Choose a CSV file." }));
  }
  if (file.size > 1_000_000) {
    redirect(withFlash(returnTo, { error: "CSV must be smaller than 1 MB." }));
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
    revalidatePath("/admin/program");
    revalidatePath("/admin/grantees");
    summary = `${result.inserted} inserted, ${result.updated} updated, ${result.unchanged} unchanged`;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not import CSV.";
    redirect(withFlash(returnTo, { error: message }));
  }
  redirect(withFlash(returnTo, { notice: summary }));
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
    revalidatePath("/admin/program");
    const baseUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(
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
  const returnTo = safeReturnTo(formData.get("returnTo"), "/admin/grants");
  if (!grantId) {
    redirect(withFlash(returnTo, { error: "Grant id is required." }));
  }

  try {
    await revokeGrant({
      db: getDb(),
      gateway: getOpenAIAdminGateway(),
      grantId,
      actor,
      reason,
    });
    revalidatePath("/admin");
    revalidatePath("/admin/grants");
    revalidatePath(`/admin/grants/${grantId}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not revoke grant.";
    redirect(withFlash(returnTo, { error: message }));
  }
  redirect(withFlash(returnTo, { notice: "Grant revoked." }));
}

export async function syncUsageAction(formData: FormData) {
  await requireAdmin();
  const returnTo = safeReturnTo(formData.get("returnTo"), "/admin");
  const result = await syncUsageActivity({
    db: getDb(),
    gateway: getOpenAIAdminGateway(),
  });
  revalidatePath("/admin");
  revalidatePath("/admin/grants");
  if (result.status === "failed") {
    redirect(
      withFlash(returnTo, {
        error: result.errorMessage ?? "Sync failed.",
      }),
    );
  }
  redirect(
    withFlash(returnTo, {
      notice: `Synced ${result.bucketsUpserted} usage bucket${result.bucketsUpserted === 1 ? "" : "s"}.`,
    }),
  );
}
