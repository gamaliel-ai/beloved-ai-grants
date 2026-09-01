"use client";

import { useActionState } from "react";
import { AlertTriangle } from "lucide-react";
import { claimAction } from "./actions";
import { CopyValue } from "@/components/copy-value";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ClaimForm({ token }: { token: string }) {
  const boundAction = claimAction.bind(null, token);
  const [state, action, pending] = useActionState(boundAction, {});

  if (state.secret) {
    return (
      <div className="space-y-5">
        <Alert>
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Copy this key now</AlertTitle>
          <AlertDescription>
            It is shown once and is not stored. Refreshing or closing this page
            permanently loses access to the value.
          </AlertDescription>
        </Alert>
        <code
          className="block overflow-x-auto rounded-md bg-foreground p-4 font-mono text-sm text-background"
          data-testid="issued-key"
        >
          {state.secret}
        </code>
        <CopyValue value={state.secret} label="Copy API key" />
        <p className="text-sm text-muted-foreground">
          Keep this key private. We monitor usage and may revoke access if
          needed. You can move to your own OpenAI key whenever you are ready.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button className="w-full" disabled={pending} size="lg" type="submit">
        {pending ? "Creating your key…" : "Claim API key"}
      </Button>
      <p className="text-xs text-muted-foreground">
        This link is single-use. After you claim, the key is shown once on this
        page and never emailed.
      </p>
    </form>
  );
}
