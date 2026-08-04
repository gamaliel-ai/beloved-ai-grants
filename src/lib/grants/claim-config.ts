import { createHash, createHmac, randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import { claimRateLimits } from "@/lib/db/schema";

const WINDOW_MS = 15 * 60 * 1000;

/** Non-secret claim-link defaults — not env. */
export const claimConfig = {
  ttlMs: 48 * 60 * 60 * 1000,
  purpose: "claim_link",
} as const;

export function hashClaimToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function newClaimTokenValue() {
  return randomBytes(32).toString("base64url");
}

function subjectHash(subject: string) {
  const secret =
    process.env.RATE_LIMIT_SECRET ??
    process.env.AUTH_SECRET ??
    "local-development-only";
  return createHmac("sha256", secret).update(subject).digest("hex");
}

export async function consumeClaimAttempt(
  db: AppDatabase,
  subject: string,
  limit = 5,
) {
  const windowStartedAt = new Date(
    Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS,
  );
  const [bucket] = await db
    .insert(claimRateLimits)
    .values({
      subjectHash: subjectHash(subject),
      windowStartedAt,
      attempts: 1,
    })
    .onConflictDoUpdate({
      target: [
        claimRateLimits.subjectHash,
        claimRateLimits.windowStartedAt,
      ],
      set: {
        attempts: sql`${claimRateLimits.attempts} + 1`,
      },
    })
    .returning({ attempts: claimRateLimits.attempts });

  return {
    allowed: bucket.attempts <= limit,
    remaining: Math.max(0, limit - bucket.attempts),
    retryAfterSeconds: Math.ceil(
      (windowStartedAt.getTime() + WINDOW_MS - Date.now()) / 1000,
    ),
  };
}
