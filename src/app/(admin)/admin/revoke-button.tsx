"use client";

import { useSyncExternalStore } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { revokeGrantAction } from "./actions";

const subscribe = () => () => {};

export function RevokeButton({
  grantId,
  returnTo = "/admin/grants",
}: {
  grantId: string;
  returnTo?: string;
}) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={!hydrated} size="sm" variant="destructive">
          Revoke
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke this grant?</AlertDialogTitle>
          <AlertDialogDescription>
            The service account and API key will stop working. The key cannot
            be restored.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={revokeGrantAction}>
            <input type="hidden" name="grantId" value={grantId} />
            <input type="hidden" name="reason" value="operator revoke" />
            <input type="hidden" name="returnTo" value={returnTo} />
            <Button type="submit" variant="destructive">
              Revoke grant
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
