import { absoluteUrl } from "@/lib/app-url";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listMcpOperatorTokens } from "@/lib/auth/mcp-tokens";
import { getDb } from "@/lib/db/client";
import { revokeMcpTokenAction } from "../actions";
import { McpTokenForm } from "./token-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default async function AdminMcpPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const actor = await requireAdmin();
  const params = await searchParams;
  const tokens = await listMcpOperatorTokens(getDb(), actor);
  const mcpUrl = absoluteUrl("/api/mcp");

  const cursorSnippet = `{
  "mcpServers": {
    "beloved-grants-admin": {
      "url": "${mcpUrl}",
      "headers": {
        "Authorization": "Bearer <paste-token-here>"
      }
    }
  }
}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light tracking-tight">MCP access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mint a short-lived operator token, then connect Cursor (or another MCP
          client). Management mutations run through MCP; this dashboard stays
          for usage visualization and emergency revoke.
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

      <Card>
        <CardHeader>
          <CardTitle>Create operator token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Tokens are hashed at rest, expire in 30 days, and can be revoked
            anytime. Never put <code>OPENAI_ADMIN_KEY</code> in the agent.
          </p>
          <McpTokenForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cursor config</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
            {cursorSnippet}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your tokens</CardTitle>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tokens yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => {
                  return (
                    <TableRow key={token.id}>
                      <TableCell>{token.label || "—"}</TableCell>
                      <TableCell>
                        {token.createdAt.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {token.expiresAt.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{token.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {token.status === "active" ? (
                          <form action={revokeMcpTokenAction}>
                            <input
                              type="hidden"
                              name="tokenId"
                              value={token.id}
                            />
                            <Button type="submit" size="sm" variant="outline">
                              Revoke
                            </Button>
                          </form>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
