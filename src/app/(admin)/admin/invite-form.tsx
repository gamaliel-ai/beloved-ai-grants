"use client";

import { useActionState } from "react";
import { createInviteAction } from "./actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyValue } from "@/components/copy-value";

export function InviteForm() {
  const [state, action, pending] = useActionState(createInviteAction, {});

  if (state.url) {
    return (
      <div className="space-y-3">
        <Alert>
          <AlertDescription>
            Copy this invite now. Only its hash is stored, so it cannot be
            shown again.
          </AlertDescription>
        </Alert>
        <code
          data-testid="invite-url"
          className="block overflow-x-auto rounded-md bg-muted p-3 text-xs"
        >
          {state.url}
        </code>
        <CopyValue value={state.url} label="Copy invite link" />
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite-name">Program name</Label>
        <Input
          id="invite-name"
          name="name"
          placeholder="Nairobi workshop"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="invite-expiry">Expires</Label>
          <Input
            id="invite-expiry"
            name="expiresAt"
            type="datetime-local"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-max">Max redemptions</Label>
          <Input
            id="invite-max"
            name="maxRedemptions"
            type="number"
            min={1}
            max={10_000}
            defaultValue={100}
            required
          />
        </div>
      </div>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button disabled={pending} type="submit">
        {pending ? "Creating…" : "Create invite"}
      </Button>
    </form>
  );
}
