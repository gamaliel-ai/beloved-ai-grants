import { Badge } from "@/components/ui/badge";

export function GrantStatusBadge({ status }: { status: string }) {
  const variant =
    status === "active"
      ? "default"
      : status === "revoked"
        ? "secondary"
        : status === "provision_failed"
          ? "destructive"
          : "outline";
  return <Badge variant={variant}>{status}</Badge>;
}
