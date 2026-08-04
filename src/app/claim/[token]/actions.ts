"use server";

import { headers } from "next/headers";
import { ClaimError, redeemClaimToken } from "@/lib/grants/claims";
import { getDb } from "@/lib/db/client";
import { getOpenAIAdminGateway } from "@/lib/openai/client";

export type ClaimActionState = {
  secret?: string;
  error?: string;
};

export async function claimAction(
  token: string,
  _previous: ClaimActionState,
  formData: FormData,
): Promise<ClaimActionState> {
  // useActionState requires (state, formData); claim uses only the bound token.
  void formData;
  const headerStore = await headers();
  const ipAddress =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "0.0.0.0";

  try {
    const result = await redeemClaimToken({
      db: getDb(),
      gateway: getOpenAIAdminGateway(),
      token,
      ipAddress,
    });
    return { secret: result.secret };
  } catch (error) {
    if (error instanceof ClaimError) {
      return { error: error.message };
    }
    return { error: "Could not claim this grant. Please try again." };
  }
}
