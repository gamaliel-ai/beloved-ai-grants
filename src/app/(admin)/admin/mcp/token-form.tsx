"use client";

import { useActionState } from "react";
import {
  createMcpTokenAction,
  type McpTokenActionState,
} from "../actions";
import { CopyValue } from "@/components/copy-value";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: McpTokenActionState = {};

export function McpTokenForm() {
  const [state, action, pending] = useActionState(
    createMcpTokenAction,
    initial,
  );

  return (
    <div className="space-y-4">
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="label">Label (optional)</Label>
          <Input
            id="label"
            name="label"
            placeholder="Cursor laptop"
            className="w-64"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create token"}
        </Button>
      </form>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      {state.token ? (
        <Alert>
          <AlertDescription className="space-y-3">
            <p>
              Copy this token now. It will not be shown again. Expires{" "}
              {state.expiresAt
                ? new Date(state.expiresAt).toLocaleString()
                : "soon"}
              .
            </p>
            <code className="block break-all rounded-md bg-muted px-3 py-2 text-xs">
              {state.token}
            </code>
            <CopyValue value={state.token} label="Copy token" />
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
