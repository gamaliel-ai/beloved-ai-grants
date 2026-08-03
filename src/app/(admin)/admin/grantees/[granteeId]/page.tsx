import Link from "next/link";
import { notFound } from "next/navigation";
import { getGranteeDetail } from "@/lib/admin/queries";
import { getDb } from "@/lib/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GrantsTable } from "../../grants-table";

export default async function GranteeDetailPage({
  params,
}: {
  params: Promise<{ granteeId: string }>;
}) {
  const { granteeId } = await params;
  const detail = await getGranteeDetail(getDb(), granteeId);
  if (!detail) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/grantees" className="hover:text-foreground">
            Grantees
          </Link>
          {" / "}
          detail
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {detail.grantee.name}
        </h1>
        <p className="text-sm text-muted-foreground">{detail.grantee.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Provenance · </span>
            imported
          </div>
          <div>
            <span className="text-muted-foreground">Added · </span>
            {detail.grantee.createdAt.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grants</CardTitle>
        </CardHeader>
        <CardContent>
          <GrantsTable
            rows={detail.grants}
            returnTo={`/admin/grantees/${granteeId}`}
            emptyMessage="This grantee has no grants yet."
          />
        </CardContent>
      </Card>
    </div>
  );
}
