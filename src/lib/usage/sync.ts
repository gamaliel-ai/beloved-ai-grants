import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import {
  grants,
  usageProjectBuckets,
  usageSyncRuns,
  usageUnknownProjects,
} from "@/lib/db/schema";
import type { OpenAIAdminGateway } from "@/lib/openai/gateway";
import { currentUtcMonthPeriod } from "./period";

export type SyncUsageResult = {
  syncRunId: string;
  status: "succeeded" | "partial" | "failed";
  bucketsUpserted: number;
  unknownProjectCount: number;
  errorMessage?: string;
};

export async function syncUsageActivity(options: {
  db: AppDatabase;
  gateway: OpenAIAdminGateway;
  /** Defaults to current UTC calendar month. */
  windowStart?: Date;
  windowEnd?: Date;
}): Promise<SyncUsageResult> {
  const period = currentUtcMonthPeriod();
  const windowStart = options.windowStart ?? period.start;
  const windowEnd = options.windowEnd ?? period.end;

  const [run] = await options.db
    .insert(usageSyncRuns)
    .values({
      status: "running",
      windowStart,
      windowEnd,
    })
    .returning();

  try {
    const remoteBuckets = await options.gateway.listProjectUsage({
      startTime: windowStart,
      endTime: windowEnd,
    });

    const projectIds = [
      ...new Set(remoteBuckets.map((bucket) => bucket.openaiProjectId)),
    ];
    const knownProjectIds = new Set<string>();
    if (projectIds.length > 0) {
      const known = await options.db
        .select({ projectId: grants.openaiProjectId })
        .from(grants)
        .where(inArray(grants.openaiProjectId, projectIds));
      for (const row of known) {
        if (row.projectId) knownProjectIds.add(row.projectId);
      }
    }

    let bucketsUpserted = 0;
    const unknownCostByProject = new Map<string, number>();

    for (const bucket of remoteBuckets) {
      await options.db
        .insert(usageProjectBuckets)
        .values({
          openaiProjectId: bucket.openaiProjectId,
          bucketStart: bucket.bucketStart,
          bucketEnd: bucket.bucketEnd,
          costCents: bucket.costCents,
          inputTokens: bucket.inputTokens,
          outputTokens: bucket.outputTokens,
          requests: bucket.requests,
          lastActivityAt: bucket.lastActivityAt,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [
            usageProjectBuckets.openaiProjectId,
            usageProjectBuckets.bucketStart,
          ],
          set: {
            bucketEnd: bucket.bucketEnd,
            costCents: bucket.costCents,
            inputTokens: bucket.inputTokens,
            outputTokens: bucket.outputTokens,
            requests: bucket.requests,
            lastActivityAt: bucket.lastActivityAt,
            updatedAt: new Date(),
          },
        });
      bucketsUpserted += 1;

      if (!knownProjectIds.has(bucket.openaiProjectId)) {
        unknownCostByProject.set(
          bucket.openaiProjectId,
          (unknownCostByProject.get(bucket.openaiProjectId) ?? 0) +
            bucket.costCents,
        );
      }
    }

    const now = new Date();
    for (const [openaiProjectId, totalCostCents] of unknownCostByProject) {
      await options.db
        .insert(usageUnknownProjects)
        .values({
          openaiProjectId,
          firstSeenAt: now,
          lastSeenAt: now,
          totalCostCents,
        })
        .onConflictDoUpdate({
          target: usageUnknownProjects.openaiProjectId,
          set: {
            lastSeenAt: now,
            totalCostCents: sql`${usageUnknownProjects.totalCostCents} + ${totalCostCents}`,
          },
        });
    }

    const status = "succeeded" as const;
    await options.db
      .update(usageSyncRuns)
      .set({
        status,
        finishedAt: now,
        bucketsUpserted,
        unknownProjectCount: unknownCostByProject.size,
      })
      .where(eq(usageSyncRuns.id, run.id));

    return {
      syncRunId: run.id,
      status,
      bucketsUpserted,
      unknownProjectCount: unknownCostByProject.size,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Usage sync failed.";
    await options.db
      .update(usageSyncRuns)
      .set({
        status: "failed",
        finishedAt: new Date(),
        errorMessage: message.slice(0, 500),
      })
      .where(eq(usageSyncRuns.id, run.id));

    return {
      syncRunId: run.id,
      status: "failed",
      bucketsUpserted: 0,
      unknownProjectCount: 0,
      errorMessage: message,
    };
  }
}

export async function getLatestSyncRun(db: AppDatabase) {
  const [row] = await db
    .select()
    .from(usageSyncRuns)
    .orderBy(sql`${usageSyncRuns.startedAt} desc`)
    .limit(1);
  return row ?? null;
}

export async function deleteBucketsInWindow(
  db: AppDatabase,
  windowStart: Date,
  windowEnd: Date,
) {
  await db
    .delete(usageProjectBuckets)
    .where(
      and(
        gte(usageProjectBuckets.bucketStart, windowStart),
        lt(usageProjectBuckets.bucketStart, windowEnd),
      ),
    );
}
