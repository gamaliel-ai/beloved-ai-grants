"use client";

import { useActionState } from "react";
import { requestClaimAction } from "./actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function JoinForm() {
  const [state, action, pending] = useActionState(requestClaimAction, {});

  if (state.message) {
    return (
      <Alert>
        <AlertDescription>{state.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="join-email">Email</Label>
        <Input
          id="join-email"
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
        {pending ? "Checking…" : "Continue"}
      </Button>
      <p className="text-xs text-muted-foreground">
        If your email is on the program list, we will send a single-use claim
        link. The API key itself is never emailed.
      </p>
    </form>
  );
}
