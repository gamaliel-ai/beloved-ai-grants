import { count, desc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { grantees, programInvites } from "@/lib/db/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { importGranteesAction } from "../actions";
import { FlashMessages } from "../flash";
import { InviteForm } from "../invite-form";

export default async function ProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const db = getDb();
  const [[granteeTotal], inviteRows] = await Promise.all([
    db.select({ value: count() }).from(grantees),
    db.select().from(programInvites).orderBy(desc(programInvites.createdAt)),
  ]);

  const joinUrl = `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/join`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Program</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Infrequent setup: allowlist, invites, and intake controls.
        </p>
      </div>

      <FlashMessages notice={params.notice} error={params.error} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Intake</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Public join URL (placeholder until B-0006):
            </p>
            <code className="block overflow-x-auto rounded-md bg-muted p-3 text-xs text-foreground">
              {joinUrl}
            </code>
            <Alert>
              <AlertDescription>
                Intake open/closed toggle and request cap land with B-0006.
                Legacy redeem invites below remain the steel-thread path.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

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
              <input type="hidden" name="returnTo" value="/admin/program" />
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Advanced — legacy program invites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Steel-thread <code>/redeem/[token]</code> path for named cohorts.
            Prefer the single program QR once intake ships.
          </p>
          <div className="max-w-xl">
            <InviteForm />
          </div>

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
    </div>
  );
}
