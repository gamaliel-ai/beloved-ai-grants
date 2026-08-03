import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  lt,
  max,
  or,
  sql,
  sum,
  type SQL,
} from "drizzle-orm";
import type { AppDatabase } from "@/lib/db/client";
import {
  apiKeys,
  auditEvents,
  grants,
  grantees,
  programInvites,
  usageProjectBuckets,
  usageUnknownProjects,
} from "@/lib/db/schema";
import {
  currentUtcMonthPeriod,
  STALE_SYNC_MS,
} from "@/lib/usage/period";
import { getLatestSyncRun } from "@/lib/usage/sync";

export type GrantListSort =
  | "recent_activity"
  | "highest_spend"
  | "created"
  | "near_budget";

export type GrantListFilter =
  | "all"
  | "active"
  | "revoked"
  | "failed"
  | "inactive"
  | "near_budget"
  | "sync_issues";

export type GrantUsageRow = {
  id: string;
  status: string;
  email: string;
  name: string;
  granteeId: string;
  projectId: string | null;
  redactedValue: string | null;
  intendedBudgetCents: number | null;
  createdAt: Date;
  activatedAt: Date | null;
  revokedAt: Date | null;
  periodCostCents: number;
  periodInputTokens: number;
  periodOutputTokens: number;
  periodRequests: number;
  lastActivityAt: Date | null;
};

export async function getDashboardSummary(db: AppDatabase) {
  const period = currentUtcMonthPeriod();
  const [
    [activeGrants],
    [granteeTotal],
    [eligibleWithoutGrant],
    [failedProvisions],
    usageTotals,
    latestSync,
    unknownProjects,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(grants)
      .where(eq(grants.status, "active")),
    db.select({ value: count() }).from(grantees),
    db
      .select({ value: count() })
      .from(grantees)
      .where(
        sql`not exists (
          select 1 from ${grants}
          where ${grants.granteeId} = ${grantees.id}
            and ${grants.status} in ('provisioning', 'active')
        )`,
      ),
    db
      .select({ value: count() })
      .from(grants)
      .where(eq(grants.status, "provision_failed")),
    db
      .select({
        costCents: sum(usageProjectBuckets.costCents),
        inputTokens: sum(usageProjectBuckets.inputTokens),
        outputTokens: sum(usageProjectBuckets.outputTokens),
        requests: sum(usageProjectBuckets.requests),
      })
      .from(usageProjectBuckets)
      .innerJoin(
        grants,
        eq(grants.openaiProjectId, usageProjectBuckets.openaiProjectId),
      )
      .where(
        and(
          gte(usageProjectBuckets.bucketStart, period.start),
          lt(usageProjectBuckets.bucketStart, period.end),
        ),
      ),
    getLatestSyncRun(db),
    db.select({ value: count() }).from(usageUnknownProjects),
  ]);

  const totals = usageTotals[0];
  const syncFreshness = describeSyncFreshness(latestSync);

  return {
    period,
    activeGrants: Number(activeGrants?.value ?? 0),
    pendingApplications: 0,
    granteeTotal: Number(granteeTotal?.value ?? 0),
    eligibleWithoutGrant: Number(eligibleWithoutGrant?.value ?? 0),
    failedProvisions: Number(failedProvisions?.value ?? 0),
    unknownProjects: Number(unknownProjects[0]?.value ?? 0),
    periodCostCents: Number(totals?.costCents ?? 0),
    periodTokens:
      Number(totals?.inputTokens ?? 0) + Number(totals?.outputTokens ?? 0),
    periodRequests: Number(totals?.requests ?? 0),
    latestSync,
    syncFreshness,
  };
}

export function describeSyncFreshness(
  latestSync: Awaited<ReturnType<typeof getLatestSyncRun>>,
  now = new Date(),
) {
  if (!latestSync) {
    return {
      state: "never" as const,
      label: "Sync not configured",
      detail: "No usage sync has run yet. Run Sync usage to pull OpenAI activity.",
    };
  }
  if (latestSync.status === "running") {
    return {
      state: "syncing" as const,
      label: "Syncing…",
      detail: "Usage sync is in progress.",
    };
  }
  if (latestSync.status === "failed") {
    return {
      state: "failed" as const,
      label: "Last sync failed",
      detail: latestSync.errorMessage ?? "OpenAI usage sync failed.",
    };
  }
  const finished = latestSync.finishedAt ?? latestSync.startedAt;
  const ageMs = now.getTime() - finished.getTime();
  if (ageMs > STALE_SYNC_MS) {
    return {
      state: "stale" as const,
      label: "Stale sync",
      detail: `Last successful sync finished ${finished.toISOString()}.`,
    };
  }
  if (latestSync.status === "partial") {
    return {
      state: "partial" as const,
      label: "Partial sync",
      detail: "Some usage buckets may be incomplete.",
    };
  }
  return {
    state: "fresh" as const,
    label: "Synced",
    detail: `Last sync finished ${finished.toISOString()}.`,
  };
}

export async function listGrantUsageRows(
  db: AppDatabase,
  options: {
    filter?: GrantListFilter;
    sort?: GrantListSort;
    limit?: number;
  } = {},
): Promise<GrantUsageRow[]> {
  const period = currentUtcMonthPeriod();
  const filter = options.filter ?? "all";
  const sort = options.sort ?? "recent_activity";
  const limit = options.limit ?? 100;

  const usageAgg = db
    .select({
      openaiProjectId: usageProjectBuckets.openaiProjectId,
      periodCostCents: sum(usageProjectBuckets.costCents).mapWith(Number).as(
        "period_cost_cents",
      ),
      periodInputTokens: sum(usageProjectBuckets.inputTokens)
        .mapWith(Number)
        .as("period_input_tokens"),
      periodOutputTokens: sum(usageProjectBuckets.outputTokens)
        .mapWith(Number)
        .as("period_output_tokens"),
      periodRequests: sum(usageProjectBuckets.requests)
        .mapWith(Number)
        .as("period_requests"),
      lastActivityAt: max(usageProjectBuckets.lastActivityAt).as(
        "last_activity_at",
      ),
    })
    .from(usageProjectBuckets)
    .where(
      and(
        gte(usageProjectBuckets.bucketStart, period.start),
        lt(usageProjectBuckets.bucketStart, period.end),
      ),
    )
    .groupBy(usageProjectBuckets.openaiProjectId)
    .as("usage_agg");

  const conditions: SQL[] = [];
  if (filter === "active") conditions.push(eq(grants.status, "active"));
  if (filter === "revoked") conditions.push(eq(grants.status, "revoked"));
  if (filter === "failed") {
    conditions.push(eq(grants.status, "provision_failed"));
  }
  if (filter === "inactive") {
    conditions.push(eq(grants.status, "active"));
    conditions.push(
      or(isNull(usageAgg.lastActivityAt), sql`${usageAgg.periodRequests} = 0`)!,
    );
  }
  if (filter === "near_budget") {
    conditions.push(eq(grants.status, "active"));
    conditions.push(sql`${grants.intendedBudgetCents} is not null`);
    conditions.push(
      sql`coalesce(${usageAgg.periodCostCents}, 0) >= (${grants.intendedBudgetCents} * 0.8)`,
    );
  }

  const orderBy = (() => {
    switch (sort) {
      case "highest_spend":
        return [
          sql`coalesce(${usageAgg.periodCostCents}, 0) desc`,
          desc(grants.createdAt),
        ];
      case "created":
        return [desc(grants.createdAt)];
      case "near_budget":
        return [
          sql`case when ${grants.intendedBudgetCents} is null then 0 else coalesce(${usageAgg.periodCostCents}, 0)::float / nullif(${grants.intendedBudgetCents}, 0) end desc`,
          desc(grants.createdAt),
        ];
      case "recent_activity":
      default:
        return [
          sql`${usageAgg.lastActivityAt} desc nulls last`,
          desc(grants.createdAt),
        ];
    }
  })();

  const rows = await db
    .select({
      id: grants.id,
      status: grants.status,
      email: grantees.email,
      name: grantees.name,
      granteeId: grantees.id,
      projectId: grants.openaiProjectId,
      redactedValue: apiKeys.redactedValue,
      intendedBudgetCents: grants.intendedBudgetCents,
      createdAt: grants.createdAt,
      activatedAt: grants.activatedAt,
      revokedAt: grants.revokedAt,
      periodCostCents: sql<number>`coalesce(${usageAgg.periodCostCents}, 0)`.mapWith(
        Number,
      ),
      periodInputTokens: sql<number>`coalesce(${usageAgg.periodInputTokens}, 0)`.mapWith(
        Number,
      ),
      periodOutputTokens: sql<number>`coalesce(${usageAgg.periodOutputTokens}, 0)`.mapWith(
        Number,
      ),
      periodRequests: sql<number>`coalesce(${usageAgg.periodRequests}, 0)`.mapWith(
        Number,
      ),
      lastActivityAt: usageAgg.lastActivityAt,
    })
    .from(grants)
    .innerJoin(grantees, eq(grantees.id, grants.granteeId))
    .leftJoin(
      apiKeys,
      and(eq(apiKeys.grantId, grants.id), eq(apiKeys.status, "active")),
    )
    .leftJoin(usageAgg, eq(usageAgg.openaiProjectId, grants.openaiProjectId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(limit);

  // For revoked grants, also surface the latest redacted key if no active key.
  const missingKeyIds = rows
    .filter((row) => !row.redactedValue)
    .map((row) => row.id);
  if (missingKeyIds.length > 0) {
    const fallbackKeys = await db
      .select({
        grantId: apiKeys.grantId,
        redactedValue: apiKeys.redactedValue,
      })
      .from(apiKeys)
      .where(inArray(apiKeys.grantId, missingKeyIds))
      .orderBy(desc(apiKeys.issuedAt));
    const byGrant = new Map<string, string>();
    for (const key of fallbackKeys) {
      if (!byGrant.has(key.grantId)) {
        byGrant.set(key.grantId, key.redactedValue);
      }
    }
    for (const row of rows) {
      if (!row.redactedValue) {
        row.redactedValue = byGrant.get(row.id) ?? null;
      }
    }
  }

  return rows;
}

export async function getNeedsAttention(db: AppDatabase) {
  const [highestSpend, nearBudget, failed, unknown] = await Promise.all([
    listGrantUsageRows(db, {
      filter: "active",
      sort: "highest_spend",
      limit: 3,
    }),
    listGrantUsageRows(db, {
      filter: "near_budget",
      sort: "near_budget",
      limit: 3,
    }),
    listGrantUsageRows(db, { filter: "failed", sort: "created", limit: 5 }),
    db
      .select()
      .from(usageUnknownProjects)
      .orderBy(desc(usageUnknownProjects.lastSeenAt))
      .limit(5),
  ]);

  return { highestSpend, nearBudget, failed, unknown };
}

export async function getGrantDetail(db: AppDatabase, grantId: string) {
  const period = currentUtcMonthPeriod();
  const [row] = await db
    .select({
      id: grants.id,
      status: grants.status,
      email: grantees.email,
      name: grantees.name,
      granteeId: grantees.id,
      projectId: grants.openaiProjectId,
      intendedBudgetCents: grants.intendedBudgetCents,
      provisionError: grants.provisionError,
      createdAt: grants.createdAt,
      activatedAt: grants.activatedAt,
      revokedAt: grants.revokedAt,
      revokedReason: grants.revokedReason,
    })
    .from(grants)
    .innerJoin(grantees, eq(grantees.id, grants.granteeId))
    .where(eq(grants.id, grantId))
    .limit(1);

  if (!row) return null;

  const [keys, buckets, events] = await Promise.all([
    db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.grantId, grantId))
      .orderBy(desc(apiKeys.issuedAt)),
    row.projectId
      ? db
          .select()
          .from(usageProjectBuckets)
          .where(
            and(
              eq(usageProjectBuckets.openaiProjectId, row.projectId),
              gte(usageProjectBuckets.bucketStart, period.start),
              lt(usageProjectBuckets.bucketStart, period.end),
            ),
          )
          .orderBy(asc(usageProjectBuckets.bucketStart))
      : Promise.resolve([]),
    db
      .select()
      .from(auditEvents)
      .where(
        and(
          eq(auditEvents.entityType, "grant"),
          eq(auditEvents.entityId, grantId),
        ),
      )
      .orderBy(desc(auditEvents.createdAt))
      .limit(50),
  ]);

  const periodCostCents = buckets.reduce((sum, b) => sum + b.costCents, 0);
  const periodTokens = buckets.reduce(
    (sum, b) => sum + b.inputTokens + b.outputTokens,
    0,
  );
  const periodRequests = buckets.reduce((sum, b) => sum + b.requests, 0);
  const lastActivityAt = buckets.reduce<Date | null>((latest, b) => {
    if (!b.lastActivityAt) return latest;
    if (!latest || b.lastActivityAt > latest) return b.lastActivityAt;
    return latest;
  }, null);

  return {
    ...row,
    keys,
    buckets,
    events,
    period,
    periodCostCents,
    periodTokens,
    periodRequests,
    lastActivityAt,
  };
}

export async function listGrantees(db: AppDatabase, search?: string) {
  const pattern = search?.trim()
    ? `%${search.trim().toLowerCase()}%`
    : null;

  const rows = await db
    .select({
      id: grantees.id,
      name: grantees.name,
      email: grantees.email,
      createdAt: grantees.createdAt,
      activeGrantCount: sql<number>`(
        select count(*)::int from ${grants}
        where ${grants.granteeId} = ${grantees.id}
          and ${grants.status} = 'active'
      )`.mapWith(Number),
      totalGrantCount: sql<number>`(
        select count(*)::int from ${grants}
        where ${grants.granteeId} = ${grantees.id}
      )`.mapWith(Number),
    })
    .from(grantees)
    .where(
      pattern
        ? or(
            sql`lower(${grantees.email}) like ${pattern}`,
            sql`lower(${grantees.name}) like ${pattern}`,
          )
        : undefined,
    )
    .orderBy(asc(grantees.name))
    .limit(200);

  return rows;
}

export async function getGranteeDetail(db: AppDatabase, granteeId: string) {
  const [grantee] = await db
    .select()
    .from(grantees)
    .where(eq(grantees.id, granteeId))
    .limit(1);
  if (!grantee) return null;

  const theirs = (await listGrantUsageRows(db, {
    filter: "all",
    sort: "created",
    limit: 200,
  })).filter((g) => g.granteeId === granteeId);

  return { grantee, grants: theirs };
}

export async function getProgramInviteRows(db: AppDatabase) {
  return db
    .select()
    .from(programInvites)
    .orderBy(desc(programInvites.createdAt));
}
