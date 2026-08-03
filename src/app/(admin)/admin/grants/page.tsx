import Link from "next/link";
import {
  describeSyncFreshness,
  listGrantUsageRows,
  type GrantListFilter,
  type GrantListSort,
} from "@/lib/admin/queries";
import { getDb } from "@/lib/db/client";
import { getLatestSyncRun } from "@/lib/usage/sync";
import { currentUtcMonthPeriod, formatRelativeAge } from "@/lib/usage/period";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlashMessages } from "../flash";
import { GrantsTable } from "../grants-table";

const FILTERS: { value: GrantListFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "revoked", label: "Revoked" },
  { value: "failed", label: "Failed" },
  { value: "inactive", label: "Inactive" },
  { value: "near_budget", label: "Near budget" },
];

const SORTS: { value: GrantListSort; label: string }[] = [
  { value: "recent_activity", label: "Recent activity" },
  { value: "highest_spend", label: "Highest spend" },
  { value: "created", label: "Created" },
  { value: "near_budget", label: "Near budget" },
];

function asFilter(value: string | undefined): GrantListFilter {
  return FILTERS.some((f) => f.value === value)
    ? (value as GrantListFilter)
    : "all";
}

function asSort(value: string | undefined): GrantListSort {
  return SORTS.some((s) => s.value === value)
    ? (value as GrantListSort)
    : "recent_activity";
}

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<{
    notice?: string;
    error?: string;
    filter?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const filter = asFilter(params.filter);
  const sort = asSort(params.sort);
  const db = getDb();
  const period = currentUtcMonthPeriod();
  const [rows, latestSync] = await Promise.all([
    listGrantUsageRows(db, { filter, sort, limit: 200 }),
    getLatestSyncRun(db),
  ]);
  const freshness = describeSyncFreshness(latestSync);
  const returnTo = `/admin/grants?filter=${filter}&sort=${sort}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Grants</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Period: {period.label} (UTC)
          {latestSync?.finishedAt
            ? ` · Synced ${formatRelativeAge(latestSync.finishedAt)}`
            : ` · ${freshness.label}`}
        </p>
      </div>

      <FlashMessages notice={params.notice} error={params.error} />

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Grant registry</CardTitle>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className="text-muted-foreground">Filter</span>
            {FILTERS.map((f) => (
              <Link
                key={f.value}
                href={`/admin/grants?filter=${f.value}&sort=${sort}`}
                className={
                  f.value === filter
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {f.label}
              </Link>
            ))}
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Sort</span>
            {SORTS.map((s) => (
              <Link
                key={s.value}
                href={`/admin/grants?filter=${filter}&sort=${s.value}`}
                className={
                  s.value === sort
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {s.label}
              </Link>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <GrantsTable
            rows={rows}
            returnTo={returnTo}
            emptyMessage="No grants have been redeemed yet."
            showSpend={freshness.state !== "never"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
