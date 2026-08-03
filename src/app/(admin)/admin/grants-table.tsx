import Link from "next/link";
import type { GrantUsageRow } from "@/lib/admin/queries";
import {
  formatCompactNumber,
  formatRelativeAge,
  formatUsdCents,
} from "@/lib/usage/period";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GrantStatusBadge } from "./grant-status-badge";
import { RevokeButton } from "./revoke-button";

export function GrantsTable({
  rows,
  returnTo,
  emptyMessage = "No grants match this view.",
  showSpend = true,
}: {
  rows: GrantUsageRow[];
  returnTo: string;
  emptyMessage?: string;
  showSpend?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Grantee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Key / project</TableHead>
          {showSpend ? <TableHead className="text-right">Period spend</TableHead> : null}
          {showSpend ? <TableHead className="text-right">Tokens</TableHead> : null}
          <TableHead>Last activity</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((grant) => (
          <TableRow key={grant.id}>
            <TableCell>
              <Link
                href={`/admin/grants/${grant.id}`}
                className="font-medium hover:underline"
              >
                {grant.name}
              </Link>
              <div className="text-xs text-muted-foreground">{grant.email}</div>
            </TableCell>
            <TableCell>
              <GrantStatusBadge status={grant.status} />
            </TableCell>
            <TableCell className="font-mono text-xs">
              <div>{grant.redactedValue ?? "No key"}</div>
              <div className="max-w-48 truncate text-muted-foreground">
                {grant.projectId ?? "No project"}
              </div>
            </TableCell>
            {showSpend ? (
              <TableCell className="text-right tabular-nums">
                {formatUsdCents(grant.periodCostCents)}
                {grant.intendedBudgetCents != null ? (
                  <div className="text-xs text-muted-foreground">
                    of {formatUsdCents(grant.intendedBudgetCents)}
                  </div>
                ) : null}
              </TableCell>
            ) : null}
            {showSpend ? (
              <TableCell className="text-right tabular-nums text-sm">
                {formatCompactNumber(
                  grant.periodInputTokens + grant.periodOutputTokens,
                )}
                <div className="text-xs text-muted-foreground">
                  {formatCompactNumber(grant.periodRequests)} req
                </div>
              </TableCell>
            ) : null}
            <TableCell className="text-sm text-muted-foreground">
              {grant.lastActivityAt
                ? formatRelativeAge(grant.lastActivityAt)
                : grant.periodRequests === 0
                  ? "No usage"
                  : "—"}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/admin/grants/${grant.id}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  View
                </Link>
                {grant.status === "active" ? (
                  <RevokeButton grantId={grant.id} returnTo={returnTo} />
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
