"use client";

import { useActionState } from "react";
import { AlertTriangle } from "lucide-react";
import { redeemAction } from "./actions";
import { CopyValue } from "@/components/copy-value";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RedeemForm({ token }: { token: string }) {
  const boundAction = redeemAction.bind(null, token);
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
          Keep this key private. This initial release does not enforce a
          per-grantee hard spend cap; the program operator may revoke access.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="redeem-email">Registration email</Label>
        <Input
          id="redeem-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
        />
      </div>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Creating your key…" : "Get API key"}
      </Button>
      <p className="text-xs text-muted-foreground">
        For this steel thread, access is checked by allowlisted email only.
        Email ownership verification will be added later.
      </p>
    </form>
  );
}
