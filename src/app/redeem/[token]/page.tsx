import { getDb } from "@/lib/db/client";
import { findInviteByToken } from "@/lib/grants/invites";
import { RedeemForm } from "./redeem-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function RedeemPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await findInviteByToken(getDb(), token);

  if (!invite) {
    return <Unavailable title="Invite not found" />;
  }
  if (invite.isExpired) {
    return <Unavailable title="This invite has expired" />;
  }
  if (invite.isFull) {
    return <Unavailable title="This invite has reached its limit" />;
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <p className="text-sm font-medium text-primary">{invite.name}</p>
        <CardTitle className="text-2xl">Redeem your OpenAI API grant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Enter the email supplied to the organizer. If it is on the allowlist,
          we will create an isolated OpenAI project and show its API key once.
        </p>
        <RedeemForm token={token} />
      </CardContent>
    </Card>
  );
}

function Unavailable({ title }: { title: string }) {
  return (
    <Alert className="mx-auto max-w-lg" variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        Ask the program organizer for a current invite.
      </AlertDescription>
    </Alert>
  );
}
