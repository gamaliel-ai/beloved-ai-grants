import { count, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { apiKeys, grants, grantees } from "@/lib/db/schema";
import { RevokeButton } from "./revoke-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const db = getDb();
  const [[granteeTotal], [activeTotal], [pendingApps], grantRows] =
    await Promise.all([
      db.select({ value: count() }).from(grantees),
      db
        .select({ value: count() })
        .from(grants)
        .where(eq(grants.status, "active")),
      // Applications land with B-0006; keep the card honest at zero.
      Promise.resolve([{ value: 0 }]),
      db
        .select({
          id: grants.id,
          status: grants.status,
          email: grantees.email,
          name: grantees.name,
          projectId: grants.openaiProjectId,
          redactedValue: apiKeys.redactedValue,
          createdAt: grants.createdAt,
        })
        .from(grants)
        .innerJoin(grantees, eq(grantees.id, grants.granteeId))
        .leftJoin(apiKeys, eq(apiKeys.grantId, grants.id))
        .orderBy(desc(grants.createdAt))
        .limit(50),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Usage visualization and emergency revoke. Manage allowlist, invites,
          and claim links via{" "}
          <Link className="underline underline-offset-4" href="/admin/mcp">
            MCP
          </Link>
          .
        </p>
      </div>

      {params.notice ? (
        <Alert>
          <AlertDescription>{params.notice}</AlertDescription>
        </Alert>
      ) : null}
      {params.error ? (
        <Alert variant="destructive">
          <AlertDescription>{params.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active grants
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {Number(activeTotal.value)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending applications
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {Number(pendingApps.value)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pre-registered grantees
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {Number(granteeTotal.value)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-muted-foreground">
              Sync not configured
            </p>
            <p className="text-xs text-muted-foreground">
              Usage metrics land with B-0001 / B-0002.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent grants</CardTitle>
        </CardHeader>
        <CardContent>
          {grantRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No grants yet. Use MCP tools to upsert grantees and create
              invites.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-border md:hidden">
                {grantRows.map((grant) => (
                  <li
                    key={grant.id}
                    className="space-y-4 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{grant.name}</p>
                        <p className="break-all text-sm text-muted-foreground">
                          {grant.email}
                        </p>
                      </div>
                      <Badge variant="outline">{grant.status}</Badge>
                    </div>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          OpenAI key
                        </dt>
                        <dd className="mt-1 break-all font-mono text-xs">
                          {grant.redactedValue ?? "No key"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Project
                        </dt>
                        <dd className="mt-1 break-all font-mono text-xs text-muted-foreground">
                          {grant.projectId ?? "No project"}
                        </dd>
                      </div>
                    </dl>
                    {grant.status === "active" ? (
                      <RevokeButton grantId={grant.id} />
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Grantee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>OpenAI</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grantRows.map((grant) => (
                      <TableRow key={grant.id}>
                        <TableCell>
                          <div className="font-medium">{grant.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {grant.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{grant.status}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          <div>{grant.redactedValue ?? "No key"}</div>
                          <div className="max-w-56 truncate text-muted-foreground">
                            {grant.projectId ?? "No project"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {grant.status === "active" ? (
                            <RevokeButton grantId={grant.id} />
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
