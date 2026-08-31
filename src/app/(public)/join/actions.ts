"use server";

import { headers } from "next/headers";
import { ClaimError, requestClaimLinkForEmail } from "@/lib/grants/claims";
import { getDb } from "@/lib/db/client";

export type JoinActionState = {
  message?: string;
  error?: string;
};

export async function requestClaimAction(
  _previous: JoinActionState,
  formData: FormData,
): Promise<JoinActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email || !email.includes("@")) {
    return { error: "Enter the email you gave your organiser." };
  }

  const headerStore = await headers();
  const ipAddress =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "0.0.0.0";

  try {
    const result = await requestClaimLinkForEmail({
      db: getDb(),
      email,
      ipAddress,
    });
    return { message: result.message };
  } catch (error) {
    if (error instanceof ClaimError) {
      return { error: error.message };
    }
    return { error: "Could not process that request. Please try again." };
  }
}
