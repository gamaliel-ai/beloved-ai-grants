import Link from "next/link";
import {
  getDashboardSummary,
  getNeedsAttention,
  listGrantUsageRows,
} from "@/lib/admin/queries";
import { getDb } from "@/lib/db/client";
import {
  formatCompactNumber,
  formatRelativeAge,
  formatUsdCents,
} from "@/lib/usage/period";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { syncUsageAction } from "./actions";
import { FlashMessages } from "./flash";
import { GrantsTable } from "./grants-table";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const db = getDb();
  const [summary, recent, attention] = await Promise.all([
    getDashboardSummary(db),
    listGrantUsageRows(db, {
      filter: "all",
      sort: "recent_activity",
      limit: 15,
    }),
    getNeedsAttention(db),
  ]);

  const usageReady =
    summary.syncFreshness.state !== "never" &&
    summary.syncFreshness.state !== "failed";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Period: {summary.period.label} (UTC) ·{" "}
            {summary.latestSync?.finishedAt
              ? `Synced ${formatRelativeAge(summary.latestSync.finishedAt)}`
              : summary.syncFreshness.label}
          </p>
        </div>
        <form action={syncUsageAction}>
          <input type="hidden" name="returnTo" value="/admin" />
          <Button type="submit" variant="outline">
            Sync usage
          </Button>
        </form>
      </div>

      <FlashMessages notice={params.notice} error={params.error} />

      {(summary.syncFreshness.state === "never" ||
        summary.syncFreshness.state === "failed" ||
        summary.syncFreshness.state === "stale" ||
        summary.syncFreshness.state === "partial") && (
        <Card className="border-dashed">
          <CardContent className="py-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {summary.syncFreshness.label}.
            </span>{" "}
            {summary.syncFreshness.detail}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Active grants" value={String(summary.activeGrants)} />
        <MetricCard
          label="Pending applications"
          value={String(summary.pendingApplications)}
          hint="Available with intake (B-0006)"
        />
        <MetricCard
          label="Total spend"
          value={usageReady ? formatUsdCents(summary.periodCostCents) : "—"}
          hint={
            usageReady
              ? summary.period.label
              : summary.syncFreshness.label
          }
        />
        <MetricCard
          label="Tokens / requests"
          value={
            usageReady
              ? `${formatCompactNumber(summary.periodTokens)} / ${formatCompactNumber(summary.periodRequests)}`
              : "—"
          }
          hint={usageReady ? summary.period.label : summary.syncFreshness.label}
        />
        <MetricCard
          label="Eligible, no grant"
          value={String(summary.eligibleWithoutGrant)}
          hint={`${summary.granteeTotal} grantees total`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent activity</CardTitle>
            <Link
              href="/admin/grants?sort=recent_activity"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              All grants
            </Link>
          </CardHeader>
          <CardContent>
            <GrantsTable
              rows={recent}
              returnTo="/admin"
              emptyMessage="No grants yet. Import an allowlist and create an invite under Program."
              showSpend={usageReady}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Needs attention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {attention.highestSpend[0] ? (
                <AttentionItem
                  title="Highest spend"
                  body={`${attention.highestSpend[0].email} · ${formatUsdCents(attention.highestSpend[0].periodCostCents)}`}
                  href={`/admin/grants/${attention.highestSpend[0].id}`}
                />
              ) : null}
              {attention.nearBudget[0] ? (
                <AttentionItem
                  title="Near intended budget"
                  body={`${attention.nearBudget[0].email} · ${formatUsdCents(attention.nearBudget[0].periodCostCents)} of ${formatUsdCents(attention.nearBudget[0].intendedBudgetCents)}`}
                  href={`/admin/grants/${attention.nearBudget[0].id}`}
                />
              ) : null}
              {summary.failedProvisions > 0 ? (
                <AttentionItem
                  title="Provision failures"
                  body={`${summary.failedProvisions} grant${summary.failedProvisions === 1 ? "" : "s"}`}
                  href="/admin/grants?filter=failed"
                />
              ) : null}
              {summary.unknownProjects > 0 ? (
                <AttentionItem
                  title="Unknown OpenAI projects"
                  body={`${summary.unknownProjects} project id${summary.unknownProjects === 1 ? "" : "s"} not linked to a grant`}
                  href="/admin/grants?filter=sync_issues"
                />
              ) : null}
              {summary.syncFreshness.state === "stale" ||
              summary.syncFreshness.state === "failed" ||
              summary.syncFreshness.state === "never" ? (
                <AttentionItem
                  title="Sync"
                  body={summary.syncFreshness.detail}
                  href="/admin"
                />
              ) : null}
              {!attention.highestSpend[0] &&
              !attention.nearBudget[0] &&
              summary.failedProvisions === 0 &&
              summary.unknownProjects === 0 &&
              summary.syncFreshness.state === "fresh" ? (
                <p className="text-muted-foreground">Nothing flagged right now.</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function AttentionItem({
  title,
  body,
  href,
}: {
  title: string;
  body: string;
  href: string;
}) {
  return (
    <div>
      <div className="font-medium">{title}</div>
      <Link href={href} className="text-muted-foreground hover:text-foreground">
        {body}
      </Link>
    </div>
  );
}
