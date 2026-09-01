import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findClaimToken } from "@/lib/grants/claims";
import { getDb } from "@/lib/db/client";
import { ClaimForm } from "./claim-form";

export const dynamic = "force-dynamic";

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const found = await findClaimToken(getDb(), token);

  let unavailable: string | null = null;
  if (!found) unavailable = "This claim link is not valid.";
  else if (found.isUsed) unavailable = "This claim link was already used.";
  else if (found.isExpired) unavailable = "This claim link has expired.";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-light tracking-tight">
          Claim your API key
        </h1>
        <p className="text-muted-foreground text-pretty">
          {unavailable
            ? "This link cannot be used to create a key."
            : `Private link for ${found!.grantee.email}. Claim it to create your sponsored OpenAI key.`}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>One-time claim</CardTitle>
        </CardHeader>
        <CardContent>
          {unavailable ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTitle>Unavailable</AlertTitle>
                <AlertDescription>{unavailable}</AlertDescription>
              </Alert>
              <Button asChild className="w-full" variant="outline">
                <Link href="/join">Request a new claim link</Link>
              </Button>
            </div>
          ) : (
            <ClaimForm token={token} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
