import Link from "next/link";
import { listGrantees } from "@/lib/admin/queries";
import { getDb } from "@/lib/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function GranteesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const rows = await listGrantees(getDb(), params.q);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Grantees</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All imported emails and grant holders.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0">
          <CardTitle>Directory</CardTitle>
          <form className="flex gap-2">
            <Input
              name="q"
              placeholder="Search name or email"
              defaultValue={params.q ?? ""}
              className="w-64"
              aria-label="Search grantees"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No grantees yet. Import an allowlist under Program.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Provenance</TableHead>
                  <TableHead className="text-right">Active grants</TableHead>
                  <TableHead className="text-right">Total grants</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link
                        href={`/admin/grantees/${row.id}`}
                        className="font-medium hover:underline"
                      >
                        {row.name}
                      </Link>
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      imported
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.activeGrantCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.totalGrantCount}
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
