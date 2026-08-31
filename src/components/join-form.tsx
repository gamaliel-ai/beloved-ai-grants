"use client";

import { useActionState } from "react";
import { requestClaimAction } from "@/app/(public)/join/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type JoinFormProps = {
  className?: string;
  /** Prefix for input ids when the form appears more than once in the app. */
  idPrefix?: string;
};

export function JoinForm({ className, idPrefix = "join" }: JoinFormProps) {
  const [state, action, pending] = useActionState(requestClaimAction, {});
  const emailId = `${idPrefix}-email`;

  if (state.message) {
    return (
      <Alert className={className}>
        <AlertDescription>{state.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={action} className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor={emailId}>Programme email</Label>
        <Input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="you@example.com"
        />
      </div>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button className="w-full sm:w-auto sm:min-w-[12rem]" disabled={pending} size="lg" type="submit">
        {pending ? "Checking…" : "Continue"}
      </Button>
      <p className="text-xs font-light text-muted-foreground text-pretty">
        If your email is on your programme list, we will send a single-use claim
        link. The API key itself is never emailed.
      </p>
    </form>
  );
}
