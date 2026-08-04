import { count, desc, eq, inArray } from "drizzle-orm";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db/client";
import {
  apiKeys,
  grants,
  grantees,
  programInvites,
} from "@/lib/db/schema";
import { getMailMode } from "@/lib/mail/client";
import { getOpenAIMode } from "@/lib/openai/client";
import { importGranteesAction } from "./actions";
import { InviteForm } from "./invite-form";
import { RevokeButton } from "./revoke-button";
import { SendClaimButton } from "./send-claim-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const actor = await requireAdmin();
  const params = await searchParams;
  const openAIMode = getOpenAIMode();
  const mailMode = getMailMode();
  const db = getDb();
  const [[granteeTotal], inviteRows, grantRows, allGrantees, liveGrants] =
    await Promise.all([
      db.select({ value: count() }).from(grantees),
      db.select().from(programInvites).orderBy(desc(programInvites.createdAt)),
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
        .orderBy(desc(grants.createdAt)),
      db.select().from(grantees).orderBy(grantees.email).limit(100),
      db
        .select({ granteeId: grants.granteeId })
        .from(grants)
        .where(inArray(grants.status, ["provisioning", "active"])),
    ]);
  const liveGranteeIds = new Set(liveGrants.map((row) => row.granteeId));
  const granteeRows = allGrantees.map((grantee) => ({
    ...grantee,
    hasLiveGrant: liveGranteeIds.has(grantee.id),
  }));
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{actor}</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Grant operations
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={openAIMode === "live" ? "destructive" : "secondary"}
          >
            OpenAI {openAIMode}
          </Badge>
          <Badge variant={mailMode === "live" ? "destructive" : "secondary"}>
            Email {mailMode}
          </Badge>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </div>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import allowlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              CSV headers must be <code>name,email</code>. Imports upsert by
              normalized email. Current grantees: {Number(granteeTotal.value)}.
            </p>
            <form action={importGranteesAction} className="flex gap-3">
              <Input
                aria-label="Grantee CSV"
                accept=".csv,text/csv"
                name="csv"
                type="file"
                required
              />
              <Button type="submit">Import</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create program invite</CardTitle>
          </CardHeader>
          <CardContent>
            <InviteForm />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grantees</CardTitle>
        </CardHeader>
        <CardContent>
          {granteeRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Import an allowlist to send claim links.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grantee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {granteeRows.map((grantee) => (
                  <TableRow key={grantee.id}>
                    <TableCell>
                      <div className="font-medium">{grantee.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {grantee.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {grantee.hasLiveGrant ? "Has grant" : "Eligible"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {grantee.hasLiveGrant ? null : (
                        <SendClaimButton granteeId={grantee.id} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Program invites</CardTitle>
        </CardHeader>
        <CardContent>
          {inviteRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invites yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Maximum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inviteRows.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.name}</TableCell>
                    <TableCell>{invite.expiresAt.toLocaleString()}</TableCell>
                    <TableCell>{invite.maxRedemptions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grants</CardTitle>
        </CardHeader>
        <CardContent>
          {grantRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No grants have been redeemed.
            </p>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
