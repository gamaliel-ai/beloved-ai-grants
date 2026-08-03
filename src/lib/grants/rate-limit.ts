import { createHmac } from "node:crypto";
import { sql } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import { redeemRateLimits } from "@/lib/db/schema";

const WINDOW_MS = 15 * 60 * 1000;

function subjectHash(subject: string) {
  const secret =
    process.env.RATE_LIMIT_SECRET ??
    process.env.AUTH_SECRET ??
    "local-development-only";
  return createHmac("sha256", secret).update(subject).digest("hex");
}

export async function consumeRedeemAttempt(
  db: AppDatabase,
  inviteId: string,
  subject: string,
  limit = 5,
) {
  const windowStartedAt = new Date(
    Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS,
  );
  const [bucket] = await db
    .insert(redeemRateLimits)
    .values({
      inviteId,
      subjectHash: subjectHash(subject),
      windowStartedAt,
      attempts: 1,
    })
    .onConflictDoUpdate({
      target: [
        redeemRateLimits.inviteId,
        redeemRateLimits.subjectHash,
        redeemRateLimits.windowStartedAt,
      ],
      set: {
        attempts: sql`${redeemRateLimits.attempts} + 1`,
      },
    })
    .returning({ attempts: redeemRateLimits.attempts });

  return {
    allowed: bucket.attempts <= limit,
    remaining: Math.max(0, limit - bucket.attempts),
    retryAfterSeconds: Math.ceil(
      (windowStartedAt.getTime() + WINDOW_MS - Date.now()) / 1000,
    ),
  };
}
