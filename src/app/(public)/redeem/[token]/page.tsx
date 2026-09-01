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
        <CardTitle className="text-2xl">Redeem your AI grant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Enter the email you gave your organiser. If it matches, we will create
          a sponsored OpenAI API key and show it once—copy it somewhere safe
          before you leave this page.
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
        Ask your programme organiser for a current invite link.
      </AlertDescription>
    </Alert>
  );
}
