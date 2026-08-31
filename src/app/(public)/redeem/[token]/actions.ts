"use server";

import { headers } from "next/headers";
import { getDb } from "@/lib/db/client";
import { redeemGrant, RedemptionError } from "@/lib/grants/redeem";
import { getOpenAIAdminGateway } from "@/lib/openai/client";

export type RedeemActionState = {
  secret?: string;
  redactedValue?: string;
  error?: string;
};

export async function redeemAction(
  token: string,
  _previous: RedeemActionState,
  formData: FormData,
): Promise<RedeemActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email || !email.includes("@")) {
    return { error: "Enter the email you gave your organiser." };
  }

  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ipAddress =
    requestHeaders.get("x-real-ip") ??
    forwarded?.split(",")[0]?.trim() ??
    "unknown";

  try {
    const result = await redeemGrant({
      db: getDb(),
      gateway: getOpenAIAdminGateway(),
      inviteToken: token,
      email,
      ipAddress,
    });
    return {
      secret: result.secret,
      redactedValue: result.redactedValue,
    };
  } catch (error) {
    if (error instanceof RedemptionError) {
      return { error: error.message };
    }
    return {
      error: "We could not create the key. Please ask an organiser for help.",
    };
  }
}
