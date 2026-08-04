"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { sendClaimLinkAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} size="sm" type="submit" variant="outline">
      {pending ? "Sending…" : "Send claim link"}
    </Button>
  );
}

export function SendClaimButton({ granteeId }: { granteeId: string }) {
  return (
    <form action={sendClaimLinkAction}>
      <input name="granteeId" type="hidden" value={granteeId} />
      <SubmitButton />
    </form>
  );
}
