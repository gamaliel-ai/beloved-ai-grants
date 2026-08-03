import Link from "next/link";
import { notFound } from "next/navigation";
import { getGrantDetail } from "@/lib/admin/queries";
import { getDb } from "@/lib/db/client";
import {
  formatCompactNumber,
  formatRelativeAge,
  formatUsdCents,
} from "@/lib/usage/period";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FlashMessages } from "../../flash";
import { GrantStatusBadge } from "../../grant-status-badge";
import { RevokeButton } from "../../revoke-button";

export default async function GrantDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ grantId: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { grantId } = await params;
  const flash = await searchParams;
  const detail = await getGrantDetail(getDb(), grantId);
  if (!detail) notFound();

  const returnTo = `/admin/grants/${grantId}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/grants" className="hover:text-foreground">
              Grants
            </Link>
            {" / "}
            detail
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {detail.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            <Link
              href={`/admin/grantees/${detail.granteeId}`}
              className="hover:text-foreground"
            >
              {detail.email}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GrantStatusBadge status={detail.status} />
          {detail.status === "active" ? (
            <RevokeButton grantId={detail.id} returnTo={returnTo} />
          ) : null}
        </div>
      </div>

      <FlashMessages notice={flash.notice} error={flash.error} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Period spend" value={formatUsdCents(detail.periodCostCents)} hint={detail.period.label} />
        <Stat
          label="Tokens"
          value={formatCompactNumber(detail.periodTokens)}
          hint={`${formatCompactNumber(detail.periodRequests)} requests`}
        />
        <Stat
          label="Last activity"
          value={
            detail.lastActivityAt
              ? formatRelativeAge(detail.lastActivityAt)
              : "No usage"
          }
        />
        <Stat
          label="Intended budget"
          value={
            detail.intendedBudgetCents != null
              ? formatUsdCents(detail.intendedBudgetCents)
              : "Not set"
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>OpenAI resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-sm">
            <div>
              <span className="text-muted-foreground">Project · </span>
              {detail.projectId ?? "—"}
            </div>
            {detail.keys.map((key) => (
              <div key={key.id}>
                <span className="text-muted-foreground">{key.status} · </span>
                {key.redactedValue}
              </div>
            ))}
            {detail.provisionError ? (
              <p className="font-sans text-sm text-destructive">
                {detail.provisionError}
              </p>
            ) : null}
            {detail.revokedReason ? (
              <p className="font-sans text-sm text-muted-foreground">
                Revoke reason: {detail.revokedReason}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage buckets ({detail.period.label})</CardTitle>
          </CardHeader>
          <CardContent>
            {detail.buckets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No usage buckets for this period. Run Sync usage from the
                dashboard if OpenAI activity is expected.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day (UTC)</TableHead>
                    <TableHead className="text-right">Spend</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.buckets.map((bucket) => (
                    <TableRow key={bucket.id}>
                      <TableCell>
                        {bucket.bucketStart.toISOString().slice(0, 10)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatUsdCents(bucket.costCents)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCompactNumber(
                          bucket.inputTokens + bucket.outputTokens,
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {bucket.requests}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lifecycle</CardTitle>
        </CardHeader>
        <CardContent>
          {detail.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No audit events recorded for this grant.
            </p>
          ) : (
            <ul className="space-y-3 text-sm">
              {detail.events.map((event) => (
                <li key={event.id} className="flex flex-wrap gap-x-3 gap-y-1">
                  <span className="text-muted-foreground tabular-nums">
                    {event.createdAt.toLocaleString()}
                  </span>
                  <span className="font-medium">{event.action}</span>
                  <span className="text-muted-foreground">{event.actor}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
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
        <div className="text-xl font-semibold tracking-tight">{value}</div>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
